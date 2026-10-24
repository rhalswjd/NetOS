import assert from 'node:assert/strict';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
const file = 'src/content/docs/labs/temporary-discovery-qa.md';
const title = 'Temporary automatic discovery QA';
let created = false;
const mdxFile = 'src/content/docs/labs/temporary-mdx-qa.mdx';
let mdxCreated = false;
try {
  await writeFile(
    file,
    `---\ntitle: ${title}\ndescription: A temporary file used to verify complete build discovery.\ntype: lab\ndomain: network\nprimaryCategory: l7\nrelatedTopicIds: [network.dhcp, os.processes]\ntags: [DiscoveryQA]\ncreatedAt: 2026-10-23\n---\n## 배경\nThis is an automated discovery fixture, not a performed experiment.\n`,
    { flag: 'wx' },
  );
  created = true;
  const markdown = await readFile(file, 'utf8');
  await writeFile(
    mdxFile,
    markdown.replace(title, 'Temporary MDX diagram QA') +
      '\n```mermaid\nflowchart LR\n    A[Question] --> B[Investigation]\n```\n',
    { flag: 'wx' },
  );
  mdxCreated = true;
  const build = spawnSync('npm', ['run', 'build'], {
    stdio: 'inherit',
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
  });
  assert.equal(
    build.status,
    0,
    'The build must accept and discover new Markdown.',
  );
  for (const page of [
    'archive/labs',
    'network/layers/l7',
    'os/areas/processes',
    'network/topics/dhcp',
    'os/topics/processes',
    'labs/temporary-discovery-qa',
  ]) {
    assert.ok(
      (await readFile(`dist/${page}/index.html`, 'utf8')).includes(title),
      `${page} must discover and link the temporary document`,
    );
  }
  const mdxHtml = await readFile(
    'dist/labs/temporary-mdx-qa/index.html',
    'utf8',
  );
  assert.ok(
    mdxHtml.includes('class="mermaid"'),
    'MDX Mermaid must compile into a live diagram target.',
  );
  assert.ok(
    mdxHtml.includes('A[Question]'),
    'MDX must preserve diagram source.',
  );
  console.log(
    'PASS: MDX with a Mermaid diagram compiles through the supported MDX pipeline.',
  );
  console.log(
    'PASS: new Markdown builds into its archive, both domain hubs, both concept backlinks, and its own page without UI edits.',
  );
} finally {
  if (mdxCreated) await rm(mdxFile, { force: true });
  if (created) {
    await rm(file, { force: true });
    const restored = spawnSync('npm', ['run', 'build'], {
      stdio: 'inherit',
      env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
    });
    assert.equal(
      restored.status,
      0,
      'Restore the production build after removing the fixture.',
    );
  }
}
