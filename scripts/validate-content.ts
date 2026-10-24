import { readContent } from './read-content.ts';
import { validateDocuments } from '../src/lib/validate-content.ts';
try {
  const docs = validateDocuments(await readContent());
  console.log(
    `Validated ${docs.length} documents and all stable topic references.`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
