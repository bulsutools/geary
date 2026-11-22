import { useId, useState } from 'react';
import { CATEGORIES } from '../data/categories';
import { formatArticleDate } from '../lib/articles';
import {
  hasAnswerableEvidence,
  parseCitedAnswer,
  retrieveAskSources,
  type AnswerSegment,
  type AskIndexItem,
  type AskSource,
} from '../lib/ask';

type Phase =
  | 'idle'
  | 'loading'
  | 'asking'
  | 'answered'
  | 'not-covered'
  | 'index-error'
  | 'api-error';

const EXAMPLE_QUESTIONS = [
  'How do I apply for a scholarship?',
  'How do I request a transcript of records?',
  'What happens if I fail a subject?',
] as const;

let cachedAskIndex: AskIndexItem[] | null = null;
let pendingAskIndex: Promise<AskIndexItem[]> | null = null;

async function loadAskIndex(): Promise<AskIndexItem[]> {
  if (cachedAskIndex) return cachedAskIndex;
  if (!pendingAskIndex) {
    pendingAskIndex = fetch('/ask-index.json')
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = (await response.json()) as AskIndexItem[];
        cachedAskIndex = data;
        return data;
      })
      .finally(() => {
        pendingAskIndex = null;
      });
  }
  return pendingAskIndex;
}

function CategoryFallbackLinks() {
  return (
    <div className="border-t border-border-subtle pt-4">
      <p className="mb-2 text-xs font-medium text-ink-secondary">
        Browse the handbook instead:
      </p>
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((category) => (
          <a
            key={category.slug}
            href={`/categories/${category.slug}`}
            className="inline-flex items-center rounded-full border border-border-subtle bg-canvas-paper px-3 py-1 text-xs font-medium text-ink-primary hover:border-brand-crimson hover:text-brand-crimson transition-colors"
          >
            {category.title}
          </a>
        ))}
        <a
          href="/articles"
          className="inline-flex items-center rounded-full border border-border-subtle bg-canvas-paper px-3 py-1 text-xs font-medium text-ink-primary hover:border-brand-crimson hover:text-brand-crimson transition-colors"
        >
          All articles
        </a>
      </div>
    </div>
  );
}

function AnswerText({ segments }: { segments: AnswerSegment[] }) {
  return (
    <p className="whitespace-pre-line text-base leading-relaxed text-ink-primary">
      {segments.map((segment, index) =>
        segment.type === 'citation' ? (
          <a
            key={index}
            href={segment.url}
            aria-label={`Source ${segment.n}: ${segment.title}`}
            className="mx-0.5 inline-flex items-center rounded border border-brand-crimson/30 bg-brand-crimson-wash px-1 py-px align-super text-[0.7rem] font-semibold text-brand-crimson hover:bg-brand-crimson hover:text-white transition-colors"
          >
            [{segment.n}]
          </a>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </p>
  );
}

function SourcesList({ sources }: { sources: AskSource[] }) {
  return (
    <div className="mt-5 border-t border-border-subtle pt-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
        Sources
      </h3>
      <ul className="mt-2 space-y-3">
        {sources.map((source) => (
          <li key={`${source.slug}-${source.n}`}>
            <a
              href={source.url}
              className="text-sm font-semibold text-brand-crimson hover:text-brand-crimson-hover hover:underline underline-offset-2 transition-colors"
            >
              {source.title}
            </a>
            <p className="mt-0.5 text-xs text-ink-secondary">
              {source.categoryLabel} · {source.subcategory} · Last updated{' '}
              {formatArticleDate(new Date(`${source.updatedDate}T00:00:00`))}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AskPanel() {
  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [sources, setSources] = useState<AskSource[]>([]);
  const [segments, setSegments] = useState<AnswerSegment[]>([]);
  const inputId = useId();

  const busy = phase === 'loading' || phase === 'asking';

  const submitQuestion = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || busy) return;

    setPhase('loading');
    setSources([]);
    setSegments([]);

    let items: AskIndexItem[];
    try {
      items = await loadAskIndex();
    } catch {
      setPhase('index-error');
      return;
    }

    const retrieved = retrieveAskSources(items, trimmed);
    if (!hasAnswerableEvidence(retrieved)) {
      setSources([]);
      setPhase('not-covered');
      return;
    }

    setSources(retrieved);
    setPhase('asking');

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed, sources: retrieved }),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = (await response.json()) as { answer?: string };
      const parsed = parseCitedAnswer(data.answer ?? '', retrieved);
      if (parsed.status === 'not-covered') {
        setPhase('not-covered');
      } else {
        setSegments(parsed.segments);
        setPhase('answered');
      }
    } catch {
      setPhase('api-error');
    }
  };

  return (
    <div className="mx-auto max-w-prose">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submitQuestion(query);
        }}
      >
        <label htmlFor={inputId} className="sr-only">
          Ask a question about BulSU student life
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id={inputId}
            type="text"
            inputMode="search"
            enterKeyHint="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. How do I apply for a scholarship?"
            className="h-[52px] w-full flex-1 rounded-xl border border-border-strong bg-surface-card px-4 text-base text-ink-primary placeholder:text-ink-muted transition-colors focus:border-brand-crimson focus:outline-none focus:ring-2 focus:ring-brand-crimson/20"
          />
          <button
            type="submit"
            disabled={busy || query.trim().length === 0}
            className="inline-flex min-h-[52px] shrink-0 items-center justify-center rounded-xl bg-brand-crimson-solid px-6 text-base font-semibold text-white transition-colors hover:bg-brand-crimson-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {phase === 'asking' ? 'Answering…' : 'Ask'}
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {EXAMPLE_QUESTIONS.map((example) => (
          <button
            key={example}
            type="button"
            disabled={busy}
            onClick={() => {
              setQuery(example);
              void submitQuestion(example);
            }}
            className="rounded-full border border-border-subtle bg-surface-subtle px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:border-brand-crimson hover:text-brand-crimson disabled:opacity-60"
          >
            {example}
          </button>
        ))}
      </div>

      <div aria-live="polite" className="mt-6">
        {phase === 'loading' && (
          <p role="status" className="text-sm text-ink-secondary">
            Checking the handbook…
          </p>
        )}

        {phase === 'asking' && (
          <p role="status" className="text-sm text-ink-secondary">
            Writing an answer from {sources.length} article passage
            {sources.length === 1 ? '' : 's'}…
          </p>
        )}

        {phase === 'answered' && (
          <div className="rounded-xl border border-border-subtle bg-surface-card p-5">
            <AnswerText segments={segments} />
            <SourcesList sources={sources} />
            <p className="mt-4 text-xs leading-relaxed text-ink-secondary">
              Answers are generated from Geary articles and can be incomplete.
              Verify fees, deadlines, and policies with the official BulSU office
              before acting.
            </p>
          </div>
        )}

        {phase === 'not-covered' && (
          <div className="rounded-xl border border-border-subtle bg-surface-card p-5">
            <p className="text-base font-medium text-ink-primary">
              We don&apos;t have a guide covering that yet.
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink-secondary">
              Try rephrasing with BulSU terms (like &ldquo;TOR&rdquo;,
              &ldquo;COR&rdquo;, or &ldquo;INC&rdquo;), or browse the articles
              directly.
            </p>
            <div className="mt-4">
              <CategoryFallbackLinks />
            </div>
          </div>
        )}

        {(phase === 'index-error' || phase === 'api-error') && (
          <div className="rounded-xl border border-border-subtle bg-surface-card p-5">
            <p className="text-base font-medium text-ink-primary">
              {phase === 'index-error'
                ? 'The handbook index couldn\u2019t load right now.'
                : 'The answer service is unavailable right now.'}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink-secondary">
              You can retry, or browse the articles directly.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void submitQuestion(query)}
                className="inline-flex min-h-[36px] items-center rounded-lg border border-brand-crimson bg-brand-crimson-wash px-3 py-1.5 text-xs font-semibold text-brand-crimson hover:bg-brand-crimson-solid hover:text-white transition-colors"
              >
                Retry
              </button>
              <a
                href="/articles"
                className="inline-flex min-h-[36px] items-center rounded-lg border border-border-subtle px-3 py-1.5 text-xs font-semibold text-ink-primary hover:border-brand-crimson hover:text-brand-crimson transition-colors"
              >
                Browse all articles
              </a>
            </div>
            <div className="mt-4">
              <CategoryFallbackLinks />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
