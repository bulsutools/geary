/// <reference types="bun" />
import { describe, expect, test } from 'bun:test';
import {
  getArticlePreview,
  getArticleSlug,
  getCategoryPreviewArticles,
  getFeaturedArticles,
  getRelatedArticles,
  groupArticlesBySubcategory,
  type ArticleLike,
} from '../../src/lib/articles';

const MOCK_ARTICLES: ArticleLike[] = [
  {
    id: 'z-guide.md',
    body: 'First sentence for **Zeta** guide with [link](/articles/alpha) and `code`.',
    data: {
      title: 'Zeta Form Guide',
      category: 'documents',
      subcategory: 'Forms',
      updatedDate: new Date('2026-11-10'),
      featured: false,
    },
  },
  {
    id: 'a-guide.md',
    body: 'Alpha guide body preview.',
    data: {
      title: 'Alpha Form Guide',
      category: 'documents',
      subcategory: 'Forms',
      updatedDate: new Date('2026-11-12'),
      featured: true,
    },
  },
  {
    id: 'b-record.md',
    body: 'Beta record body preview.',
    data: {
      title: 'Beta Academic Record',
      category: 'documents',
      subcategory: 'Academic Records',
      updatedDate: new Date('2026-11-15'),
      featured: false,
    },
  },
  {
    id: 'c-other.md',
    body: 'Campus map overview.',
    data: {
      title: 'Campus Map',
      category: 'campus',
      subcategory: 'Navigation',
      updatedDate: new Date('2026-11-16'),
      featured: true,
    },
  },
];

describe('Article taxonomy and grouping helpers (TC-UNIT-04)', () => {
  test('TC-UNIT-04: groups articles deterministically by subcategory and title', () => {
    const registrarArticles = MOCK_ARTICLES.filter(
      (a) => a.data.category === 'documents',
    );
    const groups = groupArticlesBySubcategory(registrarArticles);

    expect(groups.map((g) => g.subcategory)).toEqual(['Academic Records', 'Forms']);
    expect(groups[1]?.articles.map((a) => a.data.title)).toEqual([
      'Alpha Form Guide',
      'Zeta Form Guide',
    ]);
  });

  test('TC-UNIT-04: handles empty article arrays gracefully', () => {
    expect(groupArticlesBySubcategory([])).toEqual([]);
  });

  test('resolves slugs, featured guides, previews, and sibling related guides', () => {
    expect(getArticleSlug({ id: 'freshman-enrollment-guide.md' })).toBe(
      'freshman-enrollment-guide',
    );

    const featured = getFeaturedArticles(MOCK_ARTICLES);
    expect(featured.map((a) => a.data.title)).toEqual([
      'Campus Map',
      'Alpha Form Guide',
    ]);

    const previews = getCategoryPreviewArticles(
      MOCK_ARTICLES,
      'documents',
      2,
    );
    expect(previews.map((a) => a.data.title)).toEqual([
      'Alpha Form Guide',
      'Beta Academic Record',
    ]);

    const related = getRelatedArticles(
      MOCK_ARTICLES,
      'a-guide',
      'documents',
      3,
    );
    expect(related.map((a) => getArticleSlug(a))).toEqual(['b-record', 'z-guide']);

    expect(getArticlePreview(MOCK_ARTICLES[0])).toBe(
      'First sentence for Zeta guide with link and code.',
    );
    expect(
      getArticlePreview(
        {
          body: 'Word '.repeat(50),
          data: { title: 'Fallback Title' },
        },
        40,
      ).length,
    ).toBeLessThanOrEqual(43);
    expect(getArticlePreview({ data: { title: 'Fallback Title' } })).toBe('Fallback Title');
  });
});
