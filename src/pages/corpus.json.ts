import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { CATEGORIES, getCategoryBySlug } from '../data/categories';
import { getArticlePreview, getArticleSlug, resolveArticleSources } from '../lib/articles';

/**
 * Raw `.md` sources keyed by route slug, captured verbatim (frontmatter + body)
 * so the MCP Worker's `get_article` returns content identical to the source files.
 */
const rawArticles = import.meta.glob('../content/articles/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const rawBySlug = new Map<string, string>();
for (const [path, content] of Object.entries(rawArticles)) {
  const slug = path
    .replace(/^.*\/content\/articles\//, '')
    .replace(/\.md$/i, '');
  rawBySlug.set(slug, content);
}

export const GET: APIRoute = async () => {
  const entries = await getCollection('articles');

  const articles = entries
    .sort((a, b) => a.data.title.localeCompare(b.data.title))
    .map((entry) => {
      const slug = getArticleSlug(entry);
      const categoryMeta = getCategoryBySlug(entry.data.category);

      return {
        slug,
        title: entry.data.title,
        category: entry.data.category,
        categoryLabel: categoryMeta?.title ?? entry.data.category,
        subcategory: entry.data.subcategory,
        updatedDate: entry.data.updatedDate.toISOString(),
        preview: getArticlePreview(entry),
        sources: resolveArticleSources(entry.data),
        content: rawBySlug.get(slug) ?? entry.body ?? '',
      };
    });

  return new Response(
    JSON.stringify({ categories: CATEGORIES, articles }),
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    },
  );
};
