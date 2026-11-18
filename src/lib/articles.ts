import type { CategorySlug } from '../data/categories';

export interface ArticleSource {
  label: string;
  url?: string;
}

export interface ArticleLike {
  id: string;
  slug?: string;
  data: {
    title: string;
    description: string;
    category: CategorySlug;
    subcategory: string;
    updatedDate: Date;
    featured: boolean;
    source?: string;
    sourceUrl?: string;
    sources?: readonly ArticleSource[];
  };
}

/** Combine legacy `source`/`sourceUrl` and multi-entry `sources` into one deduplicated list. */
export function resolveArticleSources(
  data: Pick<ArticleLike['data'], 'source' | 'sourceUrl' | 'sources'>,
): ArticleSource[] {
  const seen = new Set<string>();
  const resolved: ArticleSource[] = [];

  const pushUnique = (item: ArticleSource) => {
    const label = item.label.trim();
    if (!label) return;
    const url = item.url?.trim() || undefined;
    const key = `${label}\0${url ?? ''}`;
    if (seen.has(key)) return;
    seen.add(key);
    resolved.push(url ? { label, url } : { label });
  };

  if (data.source) {
    pushUnique({ label: data.source, url: data.sourceUrl });
  }
  if (data.sources) {
    for (const item of data.sources) {
      pushUnique(item);
    }
  }

  return resolved;
}

export interface SubcategoryGroup<T extends ArticleLike> {
  subcategory: string;
  articles: T[];
}

/** Resolve the canonical route slug for a Content Layer or legacy collection entry. */
export function getArticleSlug(entry: Pick<ArticleLike, 'id' | 'slug'>): string {
  return (entry.slug ?? entry.id).replace(/\.md$/i, '');
}

/** Format an article updatedDate cleanly for UI cards and article headers. */
export function formatArticleDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Group category articles deterministically by `subcategory` (alphabetical groups,
 * alphabetical article titles inside each group).
 */
export function groupArticlesBySubcategory<T extends ArticleLike>(
  articles: readonly T[],
): SubcategoryGroup<T>[] {
  const buckets = new Map<string, T[]>();

  for (const article of articles) {
    const key = article.data.subcategory.trim();
    const list = buckets.get(key) ?? [];
    list.push(article);
    buckets.set(key, list);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([subcategory, items]) => ({
      subcategory,
      articles: [...items].sort((a, b) => a.data.title.localeCompare(b.data.title)),
    }));
}

/** Return featured articles sorted newest first, then alphabetically by title. */
export function getFeaturedArticles<T extends ArticleLike>(
  articles: readonly T[],
): T[] {
  return articles
    .filter((entry) => entry.data.featured)
    .sort((a, b) => {
      const dateDiff = b.data.updatedDate.getTime() - a.data.updatedDate.getTime();
      return dateDiff !== 0 ? dateDiff : a.data.title.localeCompare(b.data.title);
    });
}

/** Return top preview articles for a Home category card (featured first, then newest). */
export function getCategoryPreviewArticles<T extends ArticleLike>(
  articles: readonly T[],
  category: CategorySlug,
  limit = 3,
): T[] {
  return articles
    .filter((entry) => entry.data.category === category)
    .sort((a, b) => {
      if (a.data.featured !== b.data.featured) {
        return a.data.featured ? -1 : 1;
      }
      const dateDiff = b.data.updatedDate.getTime() - a.data.updatedDate.getTime();
      return dateDiff !== 0 ? dateDiff : a.data.title.localeCompare(b.data.title);
    })
    .slice(0, limit);
}

/** Return up to `limit` sibling articles in the same category, excluding the current slug. */
export function getRelatedArticles<T extends ArticleLike>(
  articles: readonly T[],
  currentSlug: string,
  category: CategorySlug,
  limit = 3,
): T[] {
  return articles
    .filter(
      (entry) =>
        entry.data.category === category && getArticleSlug(entry) !== currentSlug,
    )
    .sort((a, b) => a.data.title.localeCompare(b.data.title))
    .slice(0, limit);
}
