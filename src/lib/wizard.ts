import type { CategorySlug } from '../data/categories';
import { getArticleSlug, type ArticleLike } from './articles';

export interface WizardRequirement {
  label: string;
  note?: string;
}

export interface WizardRequestData {
  id: string;
  title: string;
  summary?: string;
  office?: string;
  fee?: string;
  processingTime?: string;
  guideAnchor?: string;
  requirements: WizardRequirement[];
}

export interface WizardRequestView extends WizardRequestData {
  articleSlug: string;
  articleTitle: string;
  articleCategory: CategorySlug;
}

type WizardArticle = ArticleLike & {
  data: ArticleLike['data'] & { wizard?: readonly WizardRequestData[] };
};

const STORAGE_KEY = 'geary:wizard:v1';

/** Flatten article `wizard` frontmatter into view models, sorted deterministically by title. */
export function getWizardRequests(articles: readonly WizardArticle[]): WizardRequestView[] {
  const seen = new Set<string>();
  const views: WizardRequestView[] = [];

  for (const article of articles) {
    const requests = article.data.wizard;
    if (!requests || requests.length === 0) continue;

    for (const request of requests) {
      if (seen.has(request.id)) {
        throw new Error(
          `Duplicate wizard request id "${request.id}" in article "${getArticleSlug(article)}"`,
        );
      }
      seen.add(request.id);
      views.push({
        ...request,
        requirements: request.requirements.map((req) => ({ ...req })),
        articleSlug: getArticleSlug(article),
        articleTitle: article.data.title,
        articleCategory: article.data.category,
      });
    }
  }

  return views.sort((a, b) => a.title.localeCompare(b.title));
}

/** Return wizard requests belonging to a single category, preserving `getWizardRequests` order. */
export function getWizardRequestsForCategory(
  articles: readonly WizardArticle[],
  category: CategorySlug,
): WizardRequestView[] {
  return getWizardRequests(articles).filter((r) => r.articleCategory === category);
}

export interface ParsedWizardHash {
  requestId: string;
  checked: number[];
}

const HASH_ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Parse a `/wizard` URL hash of the form `#<request-id>` or `#<request-id>:<i,j,k>`.
 * Returns `null` for empty, malformed, or unknown request IDs.
 */
export function parseWizardHash(
  hash: string,
  validIds?: ReadonlySet<string>,
): ParsedWizardHash | null {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!raw) return null;

  const [idPart, indicesPart, ...rest] = raw.split(':');
  if (rest.length > 0 || !HASH_ID_PATTERN.test(idPart ?? '')) return null;
  if (validIds && !validIds.has(idPart)) return null;

  const checked: number[] = [];
  if (indicesPart !== undefined) {
    if (indicesPart === '') return null;
    for (const token of indicesPart.split(',')) {
      if (!/^\d+$/.test(token)) return null;
      const index = Number(token);
      if (!Number.isSafeInteger(index) || index < 0) return null;
      checked.push(index);
    }
  }

  return { requestId: idPart, checked };
}

/** Build the shareable hash for a request selection and checked indices. */
export function buildWizardHash(requestId: string, checked: readonly number[]): string {
  const sorted = [...new Set(checked)].sort((a, b) => a - b);
  const suffix = sorted.length > 0 ? `:${sorted.join(',')}` : '';
  return `#${requestId}${suffix}`;
}

type ChecksByRequest = Record<string, number[]>;

function isChecksByRequest(value: unknown): value is ChecksByRequest {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  return Object.values(value).every(
    (indices) =>
      Array.isArray(indices) &&
      indices.every((i) => typeof i === 'number' && Number.isSafeInteger(i) && i >= 0),
  );
}

/** Read persisted checklist state; returns `{}` when storage is unavailable or corrupt. */
export function readStoredChecks(storage?: Pick<Storage, 'getItem'> | null): ChecksByRequest {
  const store = storage ?? (typeof localStorage === 'undefined' ? null : localStorage);
  if (!store) return {};
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return isChecksByRequest(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

/** Persist checklist state; silently no-ops when storage is unavailable. */
export function writeStoredChecks(
  checks: ChecksByRequest,
  storage?: Pick<Storage, 'setItem'> | null,
): void {
  const store = storage ?? (typeof localStorage === 'undefined' ? null : localStorage);
  if (!store) return;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(checks));
  } catch {
    // Storage full or blocked: checklist still works for the session.
  }
}
