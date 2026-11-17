/// <reference types="bun" />
import { describe, expect, test } from 'bun:test';
import {
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
    data: {
      title: 'Zeta Form Guide',
      description: 'Guide Z.',
      category: 'documents',
      subcategory: 'Forms',
      updatedDate: new Date('2026-11-10'),
      featured: false,
    },
  },
  {
    id: 'a-guide.md',
    data: {
      title: 'Alpha Form Guide',
      description: 'Guide A.',
      category: 'documents',
      subcategory: 'Forms',
      updatedDate: new Date('2026-11-12'),
      featured: true,
    },
  },
  {
    id: 'b-record.md',
    data: {
      title: 'Beta Academic Record',
      description: 'Record B.',
      category: 'documents',
      subcategory: 'Academic Records',
      updatedDate: new Date('2026-11-15'),
      featured: false,
    },
  },
  {
    id: 'c-other.md',
    data: {
      title: 'Campus Map',
      description: 'Campus C.',
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
  });
});
