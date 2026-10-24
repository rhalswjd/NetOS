import { z } from 'zod';
export const metadataSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  type: z.enum(['concept', 'lab', 'research', 'problem']),
  domain: z.enum(['network', 'os']),
  primaryCategory: z.string().min(1),
  tags: z.array(z.string().trim().min(1)),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  draft: z.boolean().default(false),
  topicId: z
    .string()
    .regex(/^(network|os)\.[a-z0-9][a-z0-9.-]*$/)
    .optional(),
  relatedTopicIds: z.array(z.string()).default([]),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  problemKind: z
    .enum(['multiple-choice', 'short-answer', 'calculation', 'explanation'])
    .optional(),
  source: z.string().trim().min(1).optional(),
  sourceUrl: z
    .url()
    .refine((value) => /^https?:\/\//i.test(value), {
      message: 'Source URL must use http or https',
    })
    .optional(),
});
export type Metadata = z.infer<typeof metadataSchema>;
