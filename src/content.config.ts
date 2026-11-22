import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORY_SLUGS } from './data/categories';

export const articleSourceSchema = z.object({
  label: z.string().min(1),
  url: z.url().optional(),
});

export const wizardRequirementSchema = z.object({
  label: z.string().min(1),
  note: z.string().min(1).optional(),
});

export const wizardRequestSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  title: z.string().min(1),
  summary: z.string().min(1).optional(),
  office: z.string().min(1).optional(),
  fee: z.string().min(1).optional(),
  processingTime: z.string().min(1).optional(),
  guideAnchor: z.string().min(1).optional(),
  requirements: z.array(wizardRequirementSchema).min(1),
});

export const articleSchema = z.object({
  title: z.string().min(1),
  category: z.enum(CATEGORY_SLUGS),
  subcategory: z.string().min(1),
  updatedDate: z.coerce.date(),
  source: z.string().min(1).optional(),
  sourceUrl: z.url().optional(),
  sources: z.array(articleSourceSchema).min(1).optional(),
  wizard: z.array(wizardRequestSchema).optional(),
});

export type ArticleFrontmatter = z.infer<typeof articleSchema>;

export const collections = {
  articles: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
    schema: articleSchema,
  }),
};
