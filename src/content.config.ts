import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORY_SLUGS } from './data/categories';

export const articleSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).max(220),
  category: z.enum(CATEGORY_SLUGS),
  subcategory: z.string().min(1),
  updatedDate: z.coerce.date(),
  featured: z.boolean().default(false),
  source: z.string().min(1).optional(),
  sourceUrl: z.url().optional(),
});

export type ArticleFrontmatter = z.infer<typeof articleSchema>;

export const collections = {
  articles: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
    schema: articleSchema,
  }),
};
