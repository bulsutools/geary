/// <reference types="bun" />
import { describe, expect, test } from 'bun:test';
import {
  collectSources,
  extractClaims,
  splitFrontmatter,
} from '../../scripts/content-freshness';

describe('Content freshness audit helpers (issue #3)', () => {
  test('splits YAML frontmatter from markdown body', () => {
    const raw = '---\ntitle: "T"\n---\n\nBody text.\n';
    const parts = splitFrontmatter(raw);
    expect(parts?.fm).toContain('title: "T"');
    expect(parts?.body).toContain('Body text.');
    expect(splitFrontmatter('no frontmatter')).toBeNull();
  });

  test('collects scalar and list sources, deduped by URL', () => {
    const sources = collectSources({
      source: 'Manual',
      sourceUrl: 'https://example.com/a.pdf',
      sources: [
        { label: 'Manual', url: 'https://example.com/a.pdf' },
        { label: 'Portal', url: 'https://example.com/portal' },
        { label: 'No URL' },
        { label: 'Bad', url: 'notaurl' },
      ],
    });
    expect(sources.map((s) => s.url)).toEqual([
      'https://example.com/a.pdf',
      'https://example.com/portal',
    ]);
  });

  test('flags expiry-prone claims and ignores link URLs', () => {
    const body = [
      'The application fee is PHP 500 per copy.',
      'Submit requirements before the deadline on March 1.',
      '- [Org page](https://www.facebook.com/profile.php?id=123)',
      'Plain prose with no time-sensitive content at all here.',
      '```',
      'fee PHP 999 inside a code fence',
      '```',
    ].join('\n');
    const claims = extractClaims(body);
    const kinds = claims.map((c) => c.kind);
    expect(kinds).toContain('fee');
    expect(kinds).toContain('deadline');
    expect(claims.some((c) => c.excerpt.includes('profile.php'))).toBe(false);
    expect(claims.some((c) => c.excerpt.includes('999'))).toBe(false);
    expect(claims.every((c) => c.excerpt.length <= 160)).toBe(true);
  });
});
