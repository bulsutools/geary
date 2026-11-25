<script module lang="ts">
  import type { AskIndexItem } from '#lib/ask';

  let cachedAskIndex: AskIndexItem[] | null = null;
  let pendingAskIndex: Promise<AskIndexItem[]> | null = null;

  async function loadAskIndex(): Promise<AskIndexItem[]> {
    if (cachedAskIndex) {
      return cachedAskIndex;
    }
    if (!pendingAskIndex) {
      pendingAskIndex = fetch('/ask-index.json')
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
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
</script>

<script lang="ts">
  import { CATEGORIES } from '../../data/categories';
  import { formatArticleDate } from '#lib/articles';
  import {
    hasAnswerableEvidence,
    parseCitedAnswer,
    retrieveAskSources,
    type AnswerSegment,
    type AskSource,
  } from '#lib/ask';

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

  const uid = $props.id();
  const inputId = `${uid}-ask-input`;

  let query = $state('');
  let phase = $state<Phase>('idle');
  let sources = $state<AskSource[]>([]);
  let segments = $state<AnswerSegment[]>([]);
  let lastQuestion = $state('');

  const busy = $derived(phase === 'loading' || phase === 'asking');

  async function submitQuestion(question: string) {
    const trimmed = question.trim();
    if (!trimmed || busy) return;

    phase = 'loading';
    sources = [];
    segments = [];
    lastQuestion = trimmed;

    let items;
    try {
      items = await loadAskIndex();
    } catch {
      phase = 'index-error';
      return;
    }

    const retrieved = retrieveAskSources(items, trimmed);
    if (!hasAnswerableEvidence(retrieved)) {
      sources = [];
      phase = 'not-covered';
      return;
    }

    sources = retrieved;
    phase = 'asking';

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
        phase = 'not-covered';
      } else {
        segments = parsed.segments;
        phase = 'answered';
      }
    } catch {
      phase = 'api-error';
    }
  }

  function onSubmit(event: SubmitEvent) {
    event.preventDefault();
    void submitQuestion(query);
  }

  function onExampleClick(example: string) {
    query = example;
    void submitQuestion(example);
  }

  function onRetry() {
    void submitQuestion(lastQuestion || query);
  }
</script>

<div class="mx-auto max-w-prose">
  <form onsubmit={onSubmit}>
    <label for={inputId} class="sr-only">
      Ask a question about BulSU student life
    </label>
    <div class="flex flex-col gap-3 sm:flex-row">
      <input
        id={inputId}
        type="text"
        inputmode="search"
        enterkeyhint="search"
        bind:value={query}
        placeholder="e.g. How do I apply for a scholarship?"
        class="h-[52px] w-full flex-1 rounded-xl border border-border-strong bg-surface-card px-4 text-base text-ink-primary placeholder:text-ink-muted transition-colors focus:border-brand-crimson focus:outline-none focus:ring-2 focus:ring-brand-crimson/20"
      />
      <button
        type="submit"
        disabled={busy || query.trim().length === 0}
        class="inline-flex min-h-[52px] shrink-0 items-center justify-center rounded-xl bg-brand-crimson-solid px-6 text-base font-semibold text-white transition-colors hover:bg-brand-crimson-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {phase === 'asking' ? 'Answering…' : 'Ask'}
      </button>
    </div>
  </form>

  <div class="mt-4 flex flex-wrap gap-2">
    {#each EXAMPLE_QUESTIONS as example (example)}
      <button
        type="button"
        disabled={busy}
        onclick={() => onExampleClick(example)}
        class="rounded-full border border-border-subtle bg-surface-subtle px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:border-brand-crimson hover:text-brand-crimson disabled:opacity-60"
      >
        {example}
      </button>
    {/each}
  </div>

  <div aria-live="polite" class="mt-6">
    {#if phase === 'loading'}
      <p role="status" class="text-sm text-ink-secondary">
        Checking the handbook…
      </p>
    {/if}

    {#if phase === 'asking'}
      <p role="status" class="text-sm text-ink-secondary">
        Writing an answer from {sources.length} article passage{sources.length === 1 ? '' : 's'}…
      </p>
    {/if}

    {#if phase === 'answered'}
      <div class="rounded-xl border border-border-subtle bg-surface-card p-5">
        <p class="whitespace-pre-line text-base leading-relaxed text-ink-primary">
          {#each segments as segment, index (index)}
            {#if segment.type === 'citation'}
              <a
                href={segment.url}
                aria-label="Source {segment.n}: {segment.title}"
                class="mx-0.5 inline-flex items-center rounded border border-brand-crimson/30 bg-brand-crimson-wash px-1 py-px align-super text-[0.7rem] font-semibold text-brand-crimson hover:bg-brand-crimson-solid hover:text-white transition-colors"
              >
                [{segment.n}]
              </a>
            {:else}
              {segment.text}
            {/if}
          {/each}
        </p>

        <div class="mt-5 border-t border-border-subtle pt-4">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
            Sources
          </h3>
          <ul class="mt-2 space-y-3">
            {#each sources as source (source.slug + '-' + source.n)}
              <li>
                <a
                  href={source.url}
                  class="text-sm font-semibold text-brand-crimson hover:text-brand-crimson-hover hover:underline underline-offset-2 transition-colors"
                >
                  {source.title}
                </a>
                <p class="mt-0.5 text-xs text-ink-secondary">
                  {source.categoryLabel} · {source.subcategory} · Last updated
                  {formatArticleDate(new Date(`${source.updatedDate}T00:00:00`))}
                </p>
              </li>
            {/each}
          </ul>
        </div>

        <p class="mt-4 text-xs leading-relaxed text-ink-secondary">
          Answers are generated from Geary articles and can be incomplete.
          Verify fees, deadlines, and policies with the official BulSU office
          before acting.
        </p>
      </div>
    {/if}

    {#if phase === 'not-covered'}
      <div class="rounded-xl border border-border-subtle bg-surface-card p-5">
        <p class="text-base font-medium text-ink-primary">
          We don&apos;t have a guide covering that yet.
        </p>
        <p class="mt-1 text-sm leading-relaxed text-ink-secondary">
          Try rephrasing with BulSU terms (like &ldquo;TOR&rdquo;,
          &ldquo;COR&rdquo;, or &ldquo;INC&rdquo;), or browse the articles
          directly.
        </p>
        <div class="mt-4 border-t border-border-subtle pt-4">
          <p class="mb-2 text-xs font-medium text-ink-secondary">
            Browse the handbook instead:
          </p>
          <div class="flex flex-wrap gap-1.5">
            {#each CATEGORIES as category (category.slug)}
              <a
                href="/categories/{category.slug}"
                class="inline-flex items-center rounded-full border border-border-subtle bg-canvas-paper px-3 py-1 text-xs font-medium text-ink-primary hover:border-brand-crimson hover:text-brand-crimson transition-colors"
              >
                {category.title}
              </a>
            {/each}
            <a
              href="/articles"
              class="inline-flex items-center rounded-full border border-border-subtle bg-canvas-paper px-3 py-1 text-xs font-medium text-ink-primary hover:border-brand-crimson hover:text-brand-crimson transition-colors"
            >
              All articles
            </a>
          </div>
        </div>
      </div>
    {/if}

    {#if phase === 'index-error' || phase === 'api-error'}
      <div class="rounded-xl border border-border-subtle bg-surface-card p-5">
        <p class="text-base font-medium text-ink-primary">
          {phase === 'index-error'
            ? 'The handbook index couldn’t load right now.'
            : 'The answer service is unavailable right now.'}
        </p>
        <p class="mt-1 text-sm leading-relaxed text-ink-secondary">
          You can retry, or browse the articles directly.
        </p>
        <div class="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onclick={onRetry}
            class="inline-flex min-h-[36px] items-center rounded-lg border border-brand-crimson bg-brand-crimson-wash px-3 py-1.5 text-xs font-semibold text-brand-crimson hover:bg-brand-crimson-solid hover:text-white transition-colors"
          >
            Retry
          </button>
          <a
            href="/articles"
            class="inline-flex min-h-[36px] items-center rounded-lg border border-border-subtle px-3 py-1.5 text-xs font-semibold text-ink-primary hover:border-brand-crimson hover:text-brand-crimson transition-colors"
          >
            Browse all articles
          </a>
        </div>
        <div class="mt-4 border-t border-border-subtle pt-4">
          <p class="mb-2 text-xs font-medium text-ink-secondary">
            Browse the handbook instead:
          </p>
          <div class="flex flex-wrap gap-1.5">
            {#each CATEGORIES as category (category.slug)}
              <a
                href="/categories/{category.slug}"
                class="inline-flex items-center rounded-full border border-border-subtle bg-canvas-paper px-3 py-1 text-xs font-medium text-ink-primary hover:border-brand-crimson hover:text-brand-crimson transition-colors"
              >
                {category.title}
              </a>
            {/each}
            <a
              href="/articles"
              class="inline-flex items-center rounded-full border border-border-subtle bg-canvas-paper px-3 py-1 text-xs font-medium text-ink-primary hover:border-brand-crimson hover:text-brand-crimson transition-colors"
            >
              All articles
            </a>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
