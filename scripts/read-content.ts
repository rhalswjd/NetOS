import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import matter from 'gray-matter';
import type { SourceDocument } from '../src/lib/validate-content.ts';
export async function readContent(
  root = 'src/content/docs',
): Promise<SourceDocument[]> {
  const files: string[] = [];
  async function walk(dir: string) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('_')) continue;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (/\.mdx?$/.test(entry.name)) files.push(path);
    }
  }
  await walk(root);
  return Promise.all(
    files.sort().map(async (path) => {
      try {
        const { data, content } = matter(await readFile(path, 'utf8'));
        return {
          id: relative(root, path).replace(/\.mdx?$/, ''),
          path,
          data,
          body: content,
        };
      } catch (error) {
        throw new Error(`${path}: ${String(error)}`);
      }
    }),
  );
}
