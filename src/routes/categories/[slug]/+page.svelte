<script lang="ts">
  import type { PageProps } from './$types';
  import ArticleCard from '#lib/components/ArticleCard.svelte';
  import Breadcrumbs from '#lib/components/Breadcrumbs.svelte';
  import SeoHead from '#lib/components/SeoHead.svelte';

  const { data }: PageProps = $props();

  const ogImageUrl = $derived(new URL('/og-image.png', data.siteOrigin).href);
</script>

<SeoHead
  title={`${data.category.title} - Geary`}
  description={data.category.description}
  canonicalUrl={data.canonicalUrl}
  {ogImageUrl}
  jsonLd={data.breadcrumbJsonLd}
/>

<div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
  <div class="mb-10 border-b border-border-subtle pb-6 max-w-3xl">
    <Breadcrumbs
      items={[
        { label: 'Home', href: '/' },
        { label: 'Articles', href: '/articles' },
        { label: data.category.title },
      ]}
    />

    <h1 class="font-heading text-[1.75rem] sm:text-[2.25rem] font-bold leading-[1.2] tracking-[-0.02em] text-ink-primary">
      {data.category.title}
    </h1>
  </div>

  {#if data.wizardRequests.length > 0}
    <section
      aria-labelledby="wizard-card-heading"
      class="mb-10 rounded-xl border border-border-subtle bg-surface-card p-5 sm:p-6"
    >
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="max-w-xl">
          <h2 id="wizard-card-heading" class="font-heading text-lg font-bold text-ink-primary">
            Check off your requirements
          </h2>
          <p class="mt-1.5 text-sm leading-relaxed text-ink-secondary">
            {data.wizardRequests.length === 1
              ? 'One request type has an interactive checklist.'
              : `${data.wizardRequests.length} request types have interactive checklists.`}
            Track fees, office, processing time, and what you still need to bring.
          </p>
          <ul class="mt-3 flex flex-wrap gap-2">
            {#each data.wizardRequests as request (request.id)}
              <li>
                <a
                  href="/wizard#{request.id}"
                  class="inline-flex items-center rounded-full border border-border-subtle bg-surface-subtle px-3 py-1.5 text-xs font-medium text-ink-primary transition-colors duration-150 hover:border-brand-crimson hover:text-brand-crimson focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-crimson"
                >
                  {request.title}
                </a>
              </li>
            {/each}
          </ul>
        </div>
        <a
          href="/wizard"
          class="inline-flex shrink-0 items-center rounded-lg bg-brand-crimson px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-crimson-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-crimson"
        >
          Open the wizard
        </a>
      </div>
    </section>
  {/if}

  {#if data.subcategoryGroups.length > 0}
    <div class="space-y-10">
      {#each data.subcategoryGroups as group, idx (group.subcategory)}
        {@const slugPart = group.subcategory
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')}
        {@const headingId = slugPart ? `sub-${slugPart}` : `sub-group-${idx}`}
        <section aria-labelledby={headingId}>
          <h2 id={headingId} class="mb-4 font-heading text-lg sm:text-xl font-bold text-ink-primary">
            {group.subcategory}
          </h2>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {#each group.articles as article (article.slug)}
              <ArticleCard {article} />
            {/each}
          </div>
        </section>
      {/each}
    </div>
  {:else}
    <div class="flex flex-col items-center justify-center py-14 text-center">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        class="h-8 w-8 text-ink-muted"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
        />
      </svg>
      <p class="mt-3 text-sm font-medium text-ink-secondary">
        No articles here yet.
      </p>
    </div>
  {/if}
</div>
