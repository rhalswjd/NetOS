import { getCollection } from 'astro:content';
import { createIndex } from './validate-content';
export async function getContentIndex() {
  const entries = await getCollection('docs');
  return createIndex(
    entries.map((e) => ({
      id: e.id,
      path: e.filePath ?? e.id,
      data: e.data,
      body: e.body,
    })),
  );
}
