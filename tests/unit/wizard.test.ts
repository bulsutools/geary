/// <reference types="bun" />
import { describe, expect, test } from 'bun:test';
import {
  buildWizardHash,
  getWizardRequests,
  getWizardRequestsForCategory,
  parseWizardHash,
  readStoredChecks,
  writeStoredChecks,
  type WizardRequestData,
} from '../../src/lib/wizard';
import type { ArticleLike } from '../../src/lib/articles';

function makeArticle(
  id: string,
  title: string,
  category: ArticleLike['data']['category'],
  wizard?: WizardRequestData[],
): ArticleLike & { data: ArticleLike['data'] & { wizard?: WizardRequestData[] } } {
  return {
    id: `${id}.md`,
    body: 'Body text.',
    data: {
      title,
      category,
      subcategory: 'Test',
      updatedDate: new Date('2026-11-22'),
      wizard,
    },
  };
}

const TOR_REQUEST: WizardRequestData = {
  id: 'tor',
  title: 'Transcript of Records (TOR)',
  office: 'Office of the University Registrar',
  fee: 'PHP 50 per page',
  processingTime: '6 working days',
  requirements: [
    { label: 'One original valid ID' },
    { label: '1 documentary stamp', note: 'Available at the Cashier' },
  ],
};

const ID_REQUEST: WizardRequestData = {
  id: 'student-id-replacement',
  title: 'Student ID Replacement',
  requirements: [{ label: 'Notarized Affidavit of Loss' }],
};

describe('getWizardRequests', () => {
  test('flattens wizard frontmatter with resolved article metadata and sorts by title', () => {
    const articles = [
      makeArticle('b-guide', 'Beta Guide', 'documents', [ID_REQUEST]),
      makeArticle('a-guide', 'Alpha Guide', 'documents', [TOR_REQUEST]),
      makeArticle('c-guide', 'No Wizard', 'campus'),
    ];

    const requests = getWizardRequests(articles);
    expect(requests).toHaveLength(2);
    // Alphabetical by title: Student ID Replacement < Transcript of Records
    expect(requests[0].id).toBe('student-id-replacement');
    expect(requests[1].id).toBe('tor');
    expect(requests[1].articleSlug).toBe('a-guide');
    expect(requests[1].articleTitle).toBe('Alpha Guide');
    expect(requests[1].articleCategory).toBe('documents');
    expect(requests[1].requirements).toHaveLength(2);
    expect(requests[1].requirements[1].note).toBe('Available at the Cashier');
  });

  test('returns empty array when no article declares wizard', () => {
    expect(getWizardRequests([makeArticle('x', 'X', 'campus')])).toEqual([]);
  });

  test('throws on duplicate request ids across articles', () => {
    const articles = [
      makeArticle('a', 'A', 'documents', [TOR_REQUEST]),
      makeArticle('b', 'B', 'documents', [TOR_REQUEST]),
    ];
    expect(() => getWizardRequests(articles)).toThrow(/Duplicate wizard request id "tor"/);
  });
});

describe('getWizardRequestsForCategory', () => {
  test('filters requests to the requested category', () => {
    const articles = [
      makeArticle('a', 'A', 'documents', [TOR_REQUEST]),
      makeArticle('b', 'B', 'campus', [ID_REQUEST]),
    ];
    const docs = getWizardRequestsForCategory(articles, 'documents');
    expect(docs.map((r) => r.id)).toEqual(['tor']);
    expect(getWizardRequestsForCategory(articles, 'policies')).toEqual([]);
  });
});

describe('parseWizardHash / buildWizardHash', () => {
  const validIds = new Set(['tor', 'student-id-replacement']);

  test('parses bare request id', () => {
    expect(parseWizardHash('#tor', validIds)).toEqual({ requestId: 'tor', checked: [] });
  });

  test('parses request id with checked indices', () => {
    expect(parseWizardHash('#tor:0,2', validIds)).toEqual({
      requestId: 'tor',
      checked: [0, 2],
    });
  });

  test('round-trips buildWizardHash output', () => {
    const hash = buildWizardHash('tor', [2, 0, 2]);
    expect(hash).toBe('#tor:0,2');
    expect(parseWizardHash(hash, validIds)).toEqual({ requestId: 'tor', checked: [0, 2] });
  });

  test('returns null for empty, malformed, or unknown hashes', () => {
    expect(parseWizardHash('', validIds)).toBeNull();
    expect(parseWizardHash('#', validIds)).toBeNull();
    expect(parseWizardHash('#:', validIds)).toBeNull();
    expect(parseWizardHash('#tor:', validIds)).toBeNull();
    expect(parseWizardHash('#tor:0,x', validIds)).toBeNull();
    expect(parseWizardHash('#tor:0:1', validIds)).toBeNull();
    expect(parseWizardHash('#Unknown ID!', validIds)).toBeNull();
    expect(parseWizardHash('#bogus', validIds)).toBeNull();
    expect(parseWizardHash('tor')).toEqual({ requestId: 'tor', checked: [] });
  });
});

describe('readStoredChecks / writeStoredChecks', () => {
  function fakeStorage(initial?: string) {
    let value = initial;
    return {
      getItem: (key: string) => (key === 'geary:wizard:v1' ? (value ?? null) : null),
      setItem: (key: string, next: string) => {
        if (key === 'geary:wizard:v1') value = next;
      },
      get stored() {
        return value;
      },
    };
  }

  test('round-trips checks through storage', () => {
    const storage = fakeStorage();
    writeStoredChecks({ tor: [0, 2] }, storage);
    expect(readStoredChecks(storage)).toEqual({ tor: [0, 2] });
  });

  test('returns empty object for missing or corrupt JSON', () => {
    expect(readStoredChecks(fakeStorage())).toEqual({});
    expect(readStoredChecks(fakeStorage('{not json'))).toEqual({});
    expect(readStoredChecks(fakeStorage('[1,2,3]'))).toEqual({});
    expect(readStoredChecks(fakeStorage('{"tor":["x"]}'))).toEqual({});
  });

  test('does not throw when storage is unavailable', () => {
    expect(readStoredChecks(null)).toEqual({});
    expect(() => writeStoredChecks({ tor: [0] }, null)).not.toThrow();
  });
});
