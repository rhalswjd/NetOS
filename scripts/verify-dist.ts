import { readdir, readFile, access } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import { deploymentConfig } from '../src/lib/deployment.ts';
const { base, site } = deploymentConfig();
const root = resolve('dist');
const prefix = base === '/' ? '' : base;
const origin = new URL(site).origin;
const pages: string[] = [];
async function walk(dir: string) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.name.endsWith('.html')) pages.push(path);
  }
}
await walk(root);
if (!pages.length)
  throw new Error('No built HTML found. Run npm run build first.');
const errors = new Set<string>();
const textCache = new Map<string, string>();
async function html(path: string) {
  if (!textCache.has(path)) textCache.set(path, await readFile(path, 'utf8'));
  return textCache.get(path)!;
}
let checked = 0;
for (const page of pages) {
  const rel = relative(root, page).split(sep).join('/');
  const publicPath = `${prefix}/${rel.replace(/index\.html$/, '')}`;
  const source = await html(page);
  for (const match of source.matchAll(
    /\b(?:href|src)\s*=\s*["']([^"']+)["']/g,
  )) {
    const raw = match[1]!.replaceAll('&amp;', '&');
    if (/^(data:|mailto:|tel:|javascript:|blob:)/i.test(raw)) continue;
    const target = new URL(raw, `${origin}${publicPath}`);
    if (target.origin !== origin) continue;
    if (
      prefix &&
      target.pathname !== prefix &&
      !target.pathname.startsWith(`${prefix}/`)
    ) {
      errors.add(`${rel}: link escapes base ${prefix}: ${raw}`);
      continue;
    }
    const local = decodeURIComponent(target.pathname.slice(prefix.length));
    let file = resolve(root, `.${local}`);
    if (!file.startsWith(`${root}${sep}`) && file !== root) {
      errors.add(`${rel}: path escapes dist: ${raw}`);
      continue;
    }
    if (local.endsWith('/')) file = join(file, 'index.html');
    else if (!/\.[a-z0-9]+$/i.test(local)) file = join(file, 'index.html');
    try {
      await access(file);
      checked++;
      if (target.hash && file.endsWith('.html')) {
        const id = decodeURIComponent(target.hash.slice(1));
        const content = await html(file);
        const ids = [...content.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map(
          (m) => m[1],
        );
        if (id && !ids.includes(id))
          errors.add(`${rel}: missing anchor ${raw}`);
      }
    } catch {
      errors.add(`${rel}: missing internal target ${raw}`);
    }
  }
}
if (errors.size)
  throw new Error(
    `Generated-link validation failed:\n${[...errors].map((e) => `  • ${e}`).join('\n')}`,
  );
console.log(
  `Verified ${pages.length} HTML pages and ${checked} internal links/assets/anchors with base ${base}.`,
);
