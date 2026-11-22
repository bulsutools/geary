import type { APIRoute } from 'astro';
import { getCollection, render } from 'astro:content';
import { getCategoryBySlug } from '../data/categories';
import { getArticlePreview, getArticleSlug } from '../lib/articles';
import { buildAskChunks, type AskIndexItem } from '../lib/ask';

export const GET: APIRoute = async () => {
  const entries = await getCollection('articles');

  const items: AskIndexItem[] = await Promise.all(
    entries
      .sort((a, b) => a.data.title.localeCompare(b.data.title))
      .map(async (entry) => {
        const { headings } = await render(entry);
        const categoryMeta = getCategoryBySlug(entry.data.category);
        const slug = getArticleSlug(entry);

        return {
          slug,
          title: entry.data.title,
          excerpt: getArticlePreview(entry),
          category: entry.data.category,
          categoryLabel: categoryMeta?.title ?? entry.data.category,
          subcategory: entry.data.subcategory,
          headings: headings
            .filter((h) => h.depth === 2 || h.depth === 3)
            .map((h) => h.text),
          updatedDate: entry.data.updatedDate.toISOString().slice(0, 10),
          url: `/articles/${slug}`,
          chunks: buildAskChunks(entry.body ?? ''),
        };
      }),
  );

  return new Response(JSON.stringify(items), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};
