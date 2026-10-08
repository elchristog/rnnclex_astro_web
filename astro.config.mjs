import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import { legacyRedirects } from './src/data/legacy-redirects.mjs';

export default defineConfig({
  site: 'https://rnnclex.com',
  trailingSlash: 'always',
  build: {
    inlineStylesheets: 'always'
  },
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    drafts: true,
    shikiConfig: {
      theme: "github-dark",
    }
  },
  shikiConfig: {
    wrap: true,
    skipInline: false,
    drafts: true
  },
  integrations: [ sitemap({
    // Keep legacy redirect shells out of the sitemap
    filter: (page) => !Object.keys(legacyRedirects).some((slug) => page.includes(`/${slug}/`) || page.endsWith(`/${slug}`)),
  }), mdx()],
});
