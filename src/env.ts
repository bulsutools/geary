import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
  PUBLIC_SITE_URL: {
    public: true,
    static: false,
    schema: (value) => value,
    description: 'Canonical site origin used for sitemap, robots.txt, and JSON-LD URLs',
  },
});
