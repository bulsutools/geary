import { z } from 'zod';
import { CATEGORY_SLUGS } from '../data/categories.ts';

const httpUrlSchema = z.url({ protocol: /^https?$/ });

export const articleSourceSchema = z.object({
  label: z.string().min(1),
  url: httpUrlSchema.optional(),
});

export const wizardRequirementSchema = z.object({
  label: z.string().min(1),
  note: z.string().optional(),
});

export const wizardRequestSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'must be a lowercase slug'),
  title: z.string().min(1),
  summary: z.string().optional(),
  office: z.string().optional(),
  fee: z.string().optional(),
  processingTime: z.string().optional(),
  guideAnchor: z.string().optional(),
  requirements: z.array(wizardRequirementSchema).min(1),
});

export const articleSchema = z.object({
  title: z.string().min(1),
  category: z.enum(CATEGORY_SLUGS),
  subcategory: z.string().min(1),
  updatedDate: z.coerce.date(),
  source: z.string().min(1).optional(),
  sourceUrl: httpUrlSchema.optional(),
  sources: z.array(articleSourceSchema).min(1).optional(),
  wizard: z.array(wizardRequestSchema).optional(),
});

export type ArticleFrontmatter = z.infer<typeof articleSchema>;
