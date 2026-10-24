import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import {
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import matter from 'gray-matter';
import {
  chromium,
  devices,
  expect,
  type Browser,
  type BrowserContext,
  type Page,
  type Download,
} from '@playwright/test';
import { readContent } from '../../scripts/read-content.ts';
import { createIndex } from '../../src/lib/validate-content.ts';
import { deploymentConfig } from '../../src/lib/deployment.ts';
import { documentTypes } from '../../src/lib/taxonomy.ts';

type SearchHit = { url: string; content: string; excerpt: string };

// Exercise real copied templates without editing the nine seed documents or UI.
// Only files successfully created by this run may be removed in finally.
const originals = await readContent();
const hash = async (path: string) =>
  createHash('sha256')
    .update(await readFile(path))
    .digest('hex');
const before = new Map(
  await Promise.all(
    originals.map(async (doc) => [doc.path, await hash(doc.path)] as const),
  ),
);
const forms = (await readContent('docs/templates/작성양식')).filter(
  (doc) => doc.id !== 'README',
);
// Compile the exact documented MDX example, so copy/paste guidance cannot drift.
const guide = await readFile('docs/templates/작성양식/README.md', 'utf8');
const example = guide.match(/```mdx\n([\s\S]*?)\n```/)?.[1];
assert.ok(example, 'The authoring guide must contain a usable MDX example');
const attachmentExample = example
  .replace(
    '/artifacts/example/capture.png',
    '/artifacts/netos-template-qa/reference.png',
  )
  .replace(
    '/artifacts/example/sanitized.pcapng',
    '/artifacts/netos-template-qa/empty-test-only.pcap',
  )
  .replace(/alt="[^"]+"/, 'alt="Template QA reference"')
  .replace('비식별화한 패킷 캡처 다운로드', 'QA 전용 빈 PCAP 다운로드');
const ownedFiles: string[] = [];
const fixtures: {
  id: string;
  title: string;
  draft: boolean;
  type: string;
  extension: string;
}[] = [];
const assets = 'public/artifacts/netos-template-qa';
let ownsAssets = false;
let buildAttempted = false;
const env = { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' };
const run = (script: string) => {
  const result = spawnSync('npm', ['run', script], { stdio: 'inherit', env });
  assert.equal(result.status, 0, `${script} must pass`);
};
const prefix = deploymentConfig().base.replace(/\/$/, '');
const publicUrl = (path: string) => `${prefix}/${path.replace(/^\//, '')}`;

try {
  await mkdir(assets); // Refuse to overwrite any pre-existing capture directory.
  ownsAssets = true;
  await writeFile(
    `${assets}/reference.png`,
    await readFile('docs/assets/references/osi-stack.png'),
  );
  // Valid empty PCAP header for download QA only: no packets or lab measurements.
  const pcap = Buffer.alloc(24);
  pcap.writeUInt32LE(0xa1b2c3d4, 0);
  pcap.writeUInt16LE(2, 4);
  pcap.writeUInt16LE(4, 6);
  pcap.writeUInt32LE(65535, 16);
  pcap.writeUInt32LE(1, 20);
  await writeFile(`${assets}/empty-test-only.pcap`, pcap);

  for (const form of forms) {
    const data = form.data as Record<string, unknown>;
    const type = data.type as string;
    const folder =
      type === 'concept'
        ? 'network/topics'
        : documentTypes.find((entry) => entry.type === type)!.slug;
    for (const draft of [false, true]) {
      for (const extension of ['md', 'mdx']) {
        const title = `netostemplate${draft ? 'draft' : 'public'}${type}${extension}opaquezv`;
        const id = `${folder}/netos-template-qa-${draft ? 'draft' : 'public'}-${type}-${extension}`;
        const file = `src/content/docs/${id}.${extension}`;
        let body = form.body!;
        if (type === 'problem') {
          body = body.replace(
            '문제 조건, 질문, 보기 또는 요구 사항을 작성하세요.',
            'orchidquestionbeacon 문제 조건.',
          );
          body = body.replace(
            '정답과 풀이 과정, 오답 선택지가 틀린 이유를 설명하세요.',
            `**${extension === 'md' ? 'cobaltanswersecret' : 'vermilionanswersecret'}** 정답 설명.`,
          );
        }
        if (extension === 'mdx') {
          const example =
            type === 'concept'
              ? attachmentExample.replace(
                  '../../../lib/routes',
                  '../../../../lib/routes',
                )
              : attachmentExample;
          body = `${example}\n\n${body}`;
        }
        await writeFile(
          file,
          matter.stringify(body, {
            ...data,
            title,
            draft,
            ...(type === 'concept'
              ? {
                  topicId: `network.template-${draft ? 'draft' : 'public'}-${extension}-qa`,
                }
              : {}),
          }),
          { flag: 'wx' },
        );
        ownedFiles.push(file);
        fixtures.push({ id, title, draft, type, extension });
      }
    }
  }
  const problem = fixtures.find(
    (doc) => !doc.draft && doc.type === 'problem' && doc.extension === 'md',
  )!;
  const mdxProblemId = fixtures.find(
    (doc) => !doc.draft && doc.type === 'problem' && doc.extension === 'mdx',
  )!.id;

  const registry = createIndex(await readContent());
  assert.equal(
    registry.documents.length,
    createIndex(originals).documents.length + 8,
  );
  buildAttempted = true;
  run('build');
  run('verify:dist');
  const htmlFiles: string[] = [];
  async function walk(dir: string) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) await walk(path);
      else if (entry.name.endsWith('.html')) htmlFiles.push(path);
    }
  }
  await walk('dist');
  const allHtml = (
    await Promise.all(htmlFiles.map((file) => readFile(file, 'utf8')))
  ).join('\n');
  for (const fixture of fixtures) {
    if (fixture.draft) {
      assert.ok(
        !allHtml.includes(fixture.title),
        `Draft ${fixture.id} must be absent from every built page`,
      );
      await assert.rejects(stat(`dist/${fixture.id}/index.html`), {
        code: 'ENOENT',
      });
    } else {
      assert.ok(
        (await readFile(`dist/${fixture.id}/index.html`, 'utf8')).includes(
          fixture.title,
        ),
      );
    }
  }

  // Serve only the production files, with the same base prefix as Pages.
  const root = resolve('dist');
  const mime: Record<string, string> = {
    html: 'text/html',
    js: 'text/javascript',
    css: 'text/css',
    json: 'application/json',
    wasm: 'application/wasm',
    svg: 'image/svg+xml',
    png: 'image/png',
  };
  const server = createServer(async (request, response) => {
    try {
      let path = decodeURIComponent(
        new URL(request.url!, 'http://localhost').pathname,
      );
      if (prefix && !path.startsWith(`${prefix}/`))
        throw new Error('Outside base');
      path = path.slice(prefix.length);
      const file = resolve(
        root,
        `.${path}${path.endsWith('/') ? 'index.html' : ''}`,
      );
      if (!file.startsWith(`${root}${sep}`)) throw new Error('Outside dist');
      response.setHeader(
        'Content-Type',
        mime[file.split('.').pop()!] ?? 'application/octet-stream',
      );
      response.end(await readFile(file));
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise<void>((done, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', done);
  });
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  let browser: Browser | undefined;
  try {
    browser = await chromium.launch({ headless: true });
    for (const device of ['Desktop Chrome', 'iPhone 13']) {
      const context: BrowserContext = await browser.newContext({
        ...devices[device],
        baseURL: `http://127.0.0.1:${address.port}${prefix}/`,
        acceptDownloads: true,
      });
      const page: Page = await context.newPage();
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      try {
        for (const fixture of fixtures.filter((doc) => !doc.draft)) {
          await page.goto(`${fixture.id}/`);
          await expect(page.locator('h1')).toHaveText(fixture.title);
        }
        for (const [id, answer] of [
          [problem.id, 'cobaltanswersecret'],
          [mdxProblemId, 'vermilionanswersecret'],
        ]) {
          await page.goto(`${id}/`);
          const details = page.locator('.sl-markdown-content details');
          await expect(details).not.toHaveAttribute('open');
          await expect(details.locator('strong')).toHaveText(answer!);
          await expect(details.locator('strong')).toBeHidden();
          await expect(details.locator('h2')).toHaveCount(2);
          await details.locator('summary').focus();
          await page.keyboard.press('Enter');
          await expect(details.locator('strong')).toBeVisible();
          if (device === 'iPhone 13') await details.locator('summary').tap();
          else await details.locator('summary').click();
          await expect(details.locator('strong')).toBeHidden();
        }
        await page.goto('labs/netos-template-qa-public-lab-mdx/');
        const image = page.getByAltText('Template QA reference');
        await expect(image).toHaveAttribute(
          'src',
          publicUrl('/artifacts/netos-template-qa/reference.png'),
        );
        await expect
          .poll(() =>
            image.evaluate(
              (element) => (element as HTMLImageElement).naturalWidth,
            ),
          )
          .toBeGreaterThan(0);
        const downloadLink = page.getByRole('link', {
          name: 'QA 전용 빈 PCAP 다운로드',
        });
        await expect(downloadLink).toHaveAttribute(
          'href',
          publicUrl('/artifacts/netos-template-qa/empty-test-only.pcap'),
        );
        const downloadPromise: Promise<Download> =
          page.waitForEvent('download');
        await downloadLink.click();
        const download = await downloadPromise;
        assert.equal(download.suggestedFilename(), 'empty-test-only.pcap');
        assert.equal(await download.failure(), null);
        assert.deepEqual(await readFile((await download.path())!), pcap);
        await expect(page.locator('.doc-related')).toContainText('DHCP');
        await page.goto('network/topics/dhcp/');
        for (const fixture of fixtures.filter(
          (doc) => !doc.draft && !doc.id.includes('/topics/'),
        )) {
          await expect(
            page
              .locator('.doc-related')
              .getByRole('link')
              .filter({ hasText: fixture.title }),
          ).toHaveCount(1);
        }
        // Query the generated Pagefind index, with a positive control first.
        const search = async (query: string | null): Promise<SearchHit[]> =>
          page.evaluate(
            async ({ moduleUrl, query }) => {
              const engine = await import(moduleUrl);
              // Exact phrases avoid Pagefind's shorter-prefix fallback for absent words.
              const result = await engine.search(
                query === null ? null : `"${query}"`,
              );
              return await Promise.all(
                result.results.map(
                  (hit: {
                    data: () => Promise<{
                      url: string;
                      content: string;
                      excerpt: string;
                    }>;
                  }) => hit.data(),
                ),
              );
            },
            { moduleUrl: publicUrl('/pagefind/pagefind.js'), query },
          );
        assert.ok(
          (await search('orchidquestionbeacon')).length > 0,
          'Public question must be indexed',
        );
        const indexed = JSON.stringify(await search(null));
        for (const query of [
          'cobaltanswersecret',
          'vermilionanswersecret',
          ...fixtures.filter((doc) => doc.draft).map((doc) => doc.title),
        ]) {
          const matches = await search(query);
          assert.equal(
            matches.length,
            0,
            `Search must exclude ${query}: ${JSON.stringify(matches.map((hit) => ({ url: hit.url, excerpt: hit.excerpt })))}`,
          );
          assert.ok(
            !indexed.includes(query),
            `The full generated index must omit ${query}`,
          );
        }
        for (const fixture of fixtures.filter((doc) => doc.draft)) {
          assert.equal(
            (await context.request.get(`${fixture.id}/`)).status(),
            404,
          );
        }
        assert.deepEqual(
          errors,
          [],
          'Template pages must have no browser runtime errors',
        );
        console.log(
          `PASS (${device}, base ${prefix || '/'}): all four templates render; MD/MDX answers collapse and stay out of search; image loads; PCAP downloads; drafts have no routes/search entries; automatic backlinks work.`,
        );
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser?.close();
    await new Promise<void>((done) => server.close(() => done()));
  }
} finally {
  for (const file of ownedFiles) await rm(file, { force: true });
  if (ownsAssets) await rm(assets, { recursive: true, force: true });
  for (const [file, expected] of before)
    assert.equal(await hash(file), expected, `Preserve ${file} byte for byte`);
  assert.deepEqual(
    (await readContent()).map((doc) => doc.path).sort(),
    [...before.keys()].sort(),
  );
  console.log(
    `PASS: preserved all ${before.size} original Markdown/MDX documents byte for byte and removed only owned QA fixtures.`,
  );
  if (buildAttempted) run('build');
}
