import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";

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
    shikiConfig: {
      theme: "github-dark",
    }
  },
  integrations: [
    // La pagina /login/ solo redirige a la app: no va en el sitemap
    sitemap({ filter: (page) => !page.includes('/login/') }),
    mdx(),
  ],
});
