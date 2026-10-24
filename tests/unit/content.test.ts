import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readContent } from '../../scripts/read-content.ts';
import {
  createIndex,
  validateDocuments,
} from '../../src/lib/validate-content.ts';
import { deploymentConfig } from '../../src/lib/deployment.ts';
const sources = await readContent();
const index = createIndex(sources);
const dhcp = sources.find((d) => d.id === 'network/topics/dhcp')!;
const clone = (data: Record<string, unknown>, id = 'fixture') => ({
  id,
  path: `test-fixtures/${id}.md`,
  data: { ...(dhcp.data as Record<string, unknown>), ...data },
});

test('all required examples and OS seed exist', () => {
  for (const id of [
    'network/topics/dhcp',
    'labs/dhcp-discover',
    'research/dhcp-broadcast',
    'problems/dhcp-dora',
    'os/topics/processes',
  ])
    assert.ok(
      index.documents.some((d) => d.id === id),
      id,
    );
  assert.equal(new Set(index.documents.map((d) => d.data.type)).size, 4);
});
test('DHCP automatically discovers all three inbound document types', () => {
  const d = index.topics.get('network.dhcp')!;
  const related = index.related(d);
  for (const type of ['lab', 'research', 'problem'])
    assert.ok(related.some((d) => d.data.type === type));
  assert.ok(
    index
      .related(index.documents.find((d) => d.id === 'labs/dhcp-discover')!)
      .some((d) => d.data.topicId === 'network.dhcp'),
  );
});
test('cross-category relationships appear in secondary hubs', () => {
  assert.ok(
    index
      .inCategory('network', 'l4')
      .some((d) => d.id === 'network/topics/dhcp'),
  );
  assert.ok(
    index
      .related(index.topics.get('network.udp')!)
      .some((d) => d.data.topicId === 'network.dhcp'),
  );
});
test('duplicate IDs fail with both source paths', () => {
  assert.throws(
    () =>
      validateDocuments([
        ...sources,
        clone({ topicId: 'network.dhcp' }, 'duplicate'),
      ]),
    /test-fixtures\/duplicate.md: duplicate topicId.*src\/content\/docs\/network\/topics\/dhcp.md/,
  );
});
test('broken topic reference fails with actionable source path', () => {
  assert.throws(
    () =>
      validateDocuments([
        ...sources,
        clone(
          { topicId: 'network.fixture', relatedTopicIds: ['network.missing'] },
          'broken',
        ),
      ]),
    /test-fixtures\/broken.md: relatedTopicIds.*network.missing/,
  );
});
test('invalid domain category fails', () => {
  assert.throws(
    () =>
      validateDocuments([
        clone({ primaryCategory: 'processes', relatedTopicIds: [] }),
      ]),
    /fixture.md: primaryCategory "processes" is invalid for network/,
  );
});
test('required fields, valid dates and conditional metadata are enforced', () => {
  for (const field of [
    'title',
    'description',
    'type',
    'domain',
    'primaryCategory',
    'tags',
    'createdAt',
  ]) {
    const d = clone({ relatedTopicIds: [] });
    delete (d.data as Record<string, unknown>)[field];
    assert.throws(
      () => validateDocuments([d]),
      new RegExp(`fixture.md: ${field}`),
    );
  }
  assert.throws(
    () =>
      validateDocuments([
        clone({ createdAt: 'yesterday', relatedTopicIds: [] }),
      ]),
    /createdAt/,
  );
  assert.throws(
    () =>
      validateDocuments([clone({ topicId: undefined, relatedTopicIds: [] })]),
    /concept requires topicId/,
  );
  assert.throws(
    () =>
      validateDocuments([
        clone({ type: 'lab', topicId: undefined, relatedTopicIds: [] }),
      ]),
    /requires at least one/,
  );
  assert.throws(
    () =>
      validateDocuments([
        ...sources,
        clone({
          type: 'problem',
          topicId: undefined,
          relatedTopicIds: ['network.dhcp'],
        }),
      ]),
    /problem requires difficulty and problemKind/,
  );
});
test('drafts do not leak into public registry or public backlinks', () => {
  const draft = clone(
    { topicId: 'network.draft', draft: true, relatedTopicIds: [] },
    'draft',
  );
  assert.ok(
    !createIndex([...sources, draft]).documents.some((d) => d.id === 'draft'),
  );
  assert.throws(
    () =>
      createIndex([
        ...sources,
        draft,
        clone(
          { topicId: 'network.public', relatedTopicIds: ['network.draft'] },
          'public',
        ),
      ]),
    /public document references draft/,
  );
});
test('automatic Markdown discovery needs no UI changes', async () => {
  const root = await mkdtemp(join(tmpdir(), 'netos-discovery-'));
  try {
    await writeFile(
      join(root, 'new-lab.md'),
      `---\ntitle: Temporary discovery lab\ndescription: Added without any component changes\ntype: lab\ndomain: network\nprimaryCategory: l7\ntags: [Discovery]\ncreatedAt: 2026-10-23\nrelatedTopicIds: [network.dhcp]\n---\n## 배경\nAutomatic discovery test.\n`,
    );
    const discovered = await readContent(root);
    const added = createIndex([...sources, ...discovered]);
    assert.ok(
      added.documents.some((d) => d.data.type === 'lab' && d.id === 'new-lab'),
    );
    assert.ok(
      added.inCategory('network', 'l7').some((d) => d.id === 'new-lab'),
    );
    assert.ok(
      added
        .related(added.topics.get('network.dhcp')!)
        .some((d) => d.id === 'new-lab'),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test('temporary invalid Markdown files are rejected and cleaned', async () => {
  const root = await mkdtemp(join(tmpdir(), 'netos-invalid-'));
  const fixtures = [
    [
      'duplicate',
      'topicId: network.dhcp\nprimaryCategory: l7\nrelatedTopicIds: []',
    ],
    [
      'broken',
      'topicId: network.fixture\nprimaryCategory: l7\nrelatedTopicIds: [network.no-such-topic]',
    ],
    [
      'category',
      'topicId: network.fixture\nprimaryCategory: invalid\nrelatedTopicIds: []',
    ],
    ['required', 'topicId: network.fixture\nrelatedTopicIds: []'],
  ];
  try {
    for (const [name, fields] of fixtures) {
      const file = join(root, `${name}.md`);
      await writeFile(
        file,
        `---\ntitle: Invalid fixture\ndescription: Must fail\ntype: concept\ndomain: network\ntags: []\ncreatedAt: 2026-10-23\n${fields}\n---\n`,
      );
      const docs = await readContent(root);
      assert.throws(
        () => validateDocuments([...sources, ...docs]),
        new RegExp(`${name}.md`),
      );
      await rm(file);
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('deployment inference covers repository, user site, custom domain and local root', () => {
  assert.equal(deploymentConfig({}).base, '/');
  assert.equal(
    deploymentConfig({ GITHUB_REPOSITORY: 'sample/NetOS' }).base,
    '/NetOS',
  );
  assert.equal(
    deploymentConfig({ GITHUB_REPOSITORY: 'sample/sample.github.io' }).base,
    '/',
  );
  const custom = deploymentConfig({
    GITHUB_REPOSITORY: 'sample/NetOS',
    BASE_PATH: '/',
    SITE_URL: 'https://example.org',
  });
  assert.equal(custom.base, '/');
  assert.equal(custom.site, 'https://example.org');
  assert.equal(deploymentConfig({ BASE_PATH: '//NetOS///' }).base, '/NetOS');
});

test('source attribution accepts real web URLs and rejects unsafe or malformed URLs', () => {
  const withSource = clone({
    topicId: 'network.source-fixture',
    relatedTopicIds: [],
    source: 'Publisher · Problem 42',
    sourceUrl: 'https://example.org/problems/42',
  });
  assert.equal(
    validateDocuments([withSource])[0]!.data.sourceUrl,
    'https://example.org/problems/42',
  );
  for (const sourceUrl of [
    'not-a-url',
    'javascript:alert(1)',
    'mailto:author@example.org',
  ]) {
    assert.throws(
      () => validateDocuments([clone({ relatedTopicIds: [], sourceUrl })]),
      /fixture.md: sourceUrl/,
    );
  }
});

test('the separate authoring templates validate and never enter public collections', async () => {
  const templates = await readContent('docs/templates/작성양식');
  // The authoring guide is documentation, not a frontmatter-bearing template.
  const forms = templates.filter((doc) => doc.id !== 'README');
  assert.equal(forms.length, 4);
  const result = validateDocuments([...sources, ...forms]);
  assert.equal(
    result.filter((doc) => doc.path.startsWith('docs/templates/')).length,
    4,
  );
  assert.ok(forms.every((doc) => (doc.data as { draft?: boolean }).draft));
  assert.ok(
    index.documents.every((doc) => !doc.path.startsWith('docs/templates/')),
  );
});

test('both template sets support publishing all four types with the existing schema', async () => {
  const directories = [
    'docs/templates/작성양식',
    'docs/templates/archive/작성양식-개선원본',
  ];
  for (const directory of directories) {
    const forms = (await readContent(directory)).filter(
      (doc) => doc.id !== 'README',
    );
    assert.equal(forms.length, 4);
    assert.ok(
      forms.every((doc) => (doc.data as { draft: boolean }).draft === true),
    );
    const published = forms.map((doc) => ({
      ...doc,
      data: { ...(doc.data as Record<string, unknown>), draft: false },
    }));
    const publishedIndex = createIndex([...sources, ...published]);
    assert.equal(publishedIndex.documents.length, index.documents.length + 4);
    assert.deepEqual(
      publishedIndex
        .related(publishedIndex.topics.get('network.dhcp')!)
        .filter((doc) => doc.path.startsWith('docs/templates/'))
        .map((doc) => doc.data.type)
        .sort(),
      ['lab', 'problem', 'research'],
    );
    const problem = forms.find(
      (doc) => (doc.data as { type: string }).type === 'problem',
    )!;
    assert.match(problem.body!, /<details data-pagefind-ignore>\s*<summary>/);
    assert.match(problem.body!, /<summary>[^<]+<\/summary>\s*\n\n## 정답·해설/);
    assert.match(problem.body!, /## 핵심 원리[\s\S]*<\/details>/);
    assert.doesNotMatch(problem.body!, /<details[^>]*\bopen\b/);
  }
});

test('template references are validated even while draft and publication rejects draft targets', async () => {
  const forms = (await readContent('docs/templates/작성양식')).filter(
    (doc) => doc.id !== 'README',
  );
  const lab = forms.find(
    (doc) => (doc.data as { type: string }).type === 'lab',
  )!;
  const concept = forms.find(
    (doc) => (doc.data as { type: string }).type === 'concept',
  )!;
  const changeLab = (changes: Record<string, unknown>) => ({
    ...lab,
    data: { ...(lab.data as Record<string, unknown>), ...changes },
  });
  assert.throws(
    () =>
      validateDocuments([
        ...sources,
        changeLab({ relatedTopicIds: ['network.missing'] }),
      ]),
    /unresolved topic "network.missing"/,
  );
  assert.throws(
    () => validateDocuments([...sources, changeLab({ relatedTopicIds: [] })]),
    /requires at least one/,
  );
  const topicId = (concept.data as { topicId: string }).topicId;
  assert.doesNotThrow(() =>
    validateDocuments([
      ...sources,
      concept,
      changeLab({ relatedTopicIds: [topicId] }),
    ]),
  );
  assert.throws(
    () =>
      validateDocuments([
        ...sources,
        concept,
        changeLab({ draft: false, relatedTopicIds: [topicId] }),
      ]),
    /public document references draft/,
  );
  assert.doesNotThrow(() =>
    validateDocuments([
      ...sources,
      {
        ...concept,
        data: { ...(concept.data as Record<string, unknown>), draft: false },
      },
      changeLab({ draft: false, relatedTopicIds: [topicId] }),
    ]),
  );
});
