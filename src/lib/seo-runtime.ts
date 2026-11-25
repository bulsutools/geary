import { PUBLIC_SITE_URL } from '$app/env/public';
import { resolveRequestOrigin } from './seo';

/** Resolve canonical origin using the declared public env var (runtime value on Workers). */
export function requestOrigin(requestUrl?: URL): URL {
  return resolveRequestOrigin(requestUrl, {
    ...process.env,
    PUBLIC_SITE_URL: PUBLIC_SITE_URL ?? process.env.PUBLIC_SITE_URL,
  });
}
