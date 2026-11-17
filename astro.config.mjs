// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const site = process.env.PUBLIC_SITE_URL || 'https://geary.example.com';

// https://astro.build/config
export default defineConfig({
  site,
  output: 'static',
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.endsWith('/404') && !page.endsWith('/404/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
