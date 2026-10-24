import { metadataSchema, type Metadata } from './schema.ts';
import { categoryFor } from './taxonomy.ts';
export type SourceDocument = {
  id: string;
  path: string;
  data: unknown;
  body?: string;
};
export type Document = Omit<SourceDocument, 'data'> & { data: Metadata };
export function validateDocuments(sources: SourceDocument[]): Document[] {
  const errors: string[] = [];
  const docs: Document[] = [];
  for (const source of sources) {
    const parsed = metadataSchema.safeParse(source.data);
    if (!parsed.success) {
      for (const issue of parsed.error.issues)
        errors.push(
          `${source.path}: ${issue.path.join('.')}: ${issue.message}`,
        );
      continue;
    }
    const d = parsed.data;
    if (!categoryFor(d.domain, d.primaryCategory))
      errors.push(
        `${source.path}: primaryCategory "${d.primaryCategory}" is invalid for ${d.domain}`,
      );
    if (d.type === 'concept' && !d.topicId)
      errors.push(`${source.path}: concept requires topicId`);
    if (d.topicId && !d.topicId.startsWith(`${d.domain}.`))
      errors.push(`${source.path}: topicId must begin with ${d.domain}.`);
    if (d.type !== 'concept' && d.relatedTopicIds.length === 0)
      errors.push(
        `${source.path}: ${d.type} requires at least one relatedTopicIds reference`,
      );
    if (d.type === 'problem' && (!d.difficulty || !d.problemKind))
      errors.push(
        `${source.path}: problem requires difficulty and problemKind`,
      );
    docs.push({ ...source, data: d });
  }
  const topics = new Map<string, Document>();
  for (const doc of docs.filter(
    (d) => d.data.type === 'concept' && d.data.topicId,
  )) {
    const id = doc.data.topicId!;
    if (topics.has(id))
      errors.push(
        `${doc.path}: duplicate topicId "${id}" (also ${topics.get(id)!.path})`,
      );
    topics.set(id, doc);
  }
  for (const doc of docs)
    for (const id of doc.data.relatedTopicIds) {
      const target = topics.get(id);
      if (!target)
        errors.push(
          `${doc.path}: relatedTopicIds contains unresolved topic "${id}"`,
        );
      else if (!doc.data.draft && target.data.draft)
        errors.push(
          `${doc.path}: public document references draft topic "${id}"`,
        );
    }
  if (errors.length)
    throw new Error(
      `Content validation failed:\n${errors.map((e) => `  • ${e}`).join('\n')}`,
    );
  return docs;
}
export function createIndex(sources: SourceDocument[]) {
  const documents = validateDocuments(sources).filter((d) => !d.data.draft);
  const topics = new Map(
    documents
      .filter((d) => d.data.type === 'concept')
      .map((d) => [d.data.topicId!, d]),
  );
  const related = (doc: Document) =>
    documents.filter(
      (other) =>
        other.id !== doc.id &&
        ((doc.data.topicId &&
          other.data.relatedTopicIds.includes(doc.data.topicId)) ||
          (other.data.topicId &&
            doc.data.relatedTopicIds.includes(other.data.topicId)) ||
          (doc.data.type !== 'concept' &&
            other.data.type !== 'concept' &&
            other.data.relatedTopicIds.some((id) =>
              doc.data.relatedTopicIds.includes(id),
            ))),
    );
  const inCategory = (domain: string, category: string) =>
    documents.filter(
      (doc) =>
        (doc.data.domain === domain && doc.data.primaryCategory === category) ||
        doc.data.relatedTopicIds.some((id) => {
          const t = topics.get(id);
          return (
            t?.data.domain === domain && t.data.primaryCategory === category
          );
        }),
    );
  return { documents, topics, related, inCategory };
}
