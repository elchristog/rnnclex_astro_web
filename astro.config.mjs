import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import { site } from './src/data/site.mjs';

// Todo enlace del contenido (articulos, guias por estado) que iba directo a comprar en la app
// ahora lleva a la pagina de prueba gratis. Asi el contenido nuevo tambien queda cubierto.
function rehypeFreeTrialLinks() {
  const isApp = (href) => typeof href === 'string' && site.appHosts.some((h) => href.includes(h));
  const textOf = (n) => (n.type === 'text' ? n.value : (n.children || []).map(textOf).join(''));
  const walk = (node) => {
    if (node.type === 'element' && node.tagName === 'a' && isApp(node.properties && node.properties.href)) {
      node.properties.href = '/prueba-gratis/';
      delete node.properties.dataCta;
      if (/USD|\/mes|suscrib|comprar|Empezar ahora|Practicar con el banco/i.test(textOf(node))) {
        node.children = [{ type: 'text', value: 'Prueba gratis la plataforma bilingüe' }];
      }
    }
    (node.children || []).forEach(walk);
  };
  return (tree) => walk(tree);
}

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
    rehypePlugins: [rehypeFreeTrialLinks],
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
