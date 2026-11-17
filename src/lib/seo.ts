export interface BreadcrumbItemInput {
  name: string;
  url?: string;
}

export interface ArticleJsonLdInput {
  title: string;
  description: string;
  url: string;
  dateModified: Date;
  section: string;
  source?: string;
  sourceUrl?: string;
}

export type JsonLdObject = Record<string, unknown>;

const PUBLISHER_ENTITY: JsonLdObject = {
  '@type': 'Organization',
  name: 'Geary (Unofficial BulSU Student Hub)',
};

/** Build Schema.org WebSite JSON-LD for the Home page. */
export function buildWebsiteJsonLd(siteUrl: string): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Geary - The Better BulSU Student Handbook',
    url: new URL('/', siteUrl).href,
    description:
      'Unofficial student-managed Bulacan State University guides covering enrollment, academics, Registrar records, scholarships, policies, student organizations, and campus life.',
    inLanguage: 'en',
  };
}

/** Build Schema.org BreadcrumbList JSON-LD matching visual page breadcrumbs. */
export function buildBreadcrumbJsonLd(items: readonly BreadcrumbItemInput[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}

/** Build Schema.org Article JSON-LD for handbook student guides. */
export function buildArticleJsonLd(input: ArticleJsonLdInput): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    url: input.url,
    mainEntityOfPage: input.url,
    dateModified: input.dateModified.toISOString(),
    articleSection: input.section,
    inLanguage: 'en',
    author: PUBLISHER_ENTITY,
    publisher: PUBLISHER_ENTITY,
    ...(input.source
      ? {
          citation: input.sourceUrl
            ? {
                '@type': 'CreativeWork',
                name: input.source,
                url: input.sourceUrl,
              }
            : input.source,
        }
      : {}),
  };
}

/** Escape `<` to prevent closing `</script>` injection inside inline JSON-LD tags. */
export function serializeJsonLd(data: JsonLdObject): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
