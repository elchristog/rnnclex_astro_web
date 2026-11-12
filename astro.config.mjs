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

// Reglas SEO tecnico (REGLAS.md punto 6): toda imagen de contenido necesita width/height
// (evita CLS) y lazy loading fuera de pantalla. Astro no lo aplica al markdown, se hace aqui.
const IMG_DIMS = {
  'requisitos-nclex-por-estado.webp': [1200, 800],
  'inscripcion-registro-nclex-pearson-vue.webp': [1200, 800],
  'banco-preguntas-nclex-ngn-rnnclex.webp': [1200, 800],
  'cursos-expertos-nclex-videos-rnnclex.webp': [1200, 800],
  'diferencia-practica-vs-simulacion-nclex.webp': [1200, 800],
  'rn_nclex_logo.webp': [512, 512],
  'rn_nclex_logo_large.webp': [512, 512],
  'rn_nclex_logo-300x300.webp': [300, 300],
  'rn_nclex_logo_large-300x300.webp': [300, 300],
  'alejandra-barreto-rn-bsn-lider-programa-rnnclex.webp': [800, 800],
  'alejandra-martinez-rn-bsn-ibclc-fundadora.webp': [800, 800],
  'andres-cruz-rn-bsn-director-metodologia-nclex.webp': [800, 800],
  'bingley-ortiz-directora-comunicacion-rnnclex.webp': [800, 800],
  'christian-gonzalez-ceo-rnnclex.webp': [800, 800],
  'app-nclex-estudio-movil-rnnclex-e1751659839716.webp': [900, 1200],
  'guia-proceso-examen-nclex-rn.webp': [1200, 800],
  'guia-requisitos-inscripcion-nclex-rnnclex.webp': [1200, 800],
  'app-recursos-guias-nclex-espanol.webp': [1200, 800],
  'plataforma-cursos-nclex-paso-a-paso.webp': [1200, 800],
  'practica-base-de-simulacion-nclex.webp': [1200, 800],
  'banco-preguntas-simulacros-nclex-ngn.webp': [1200, 800],
  'caracteristicas-qbank-nclex-rnnclex.webp': [1200, 800],
  'categorias-preguntas-nclex-rnnclex.webp': [1200, 800],
  'evaluacion-habilidad-nclex-cat-readiness.webp': [1200, 800],
  'herramientas-preparacion-nclex-rnnclex.webp': [1200, 800],
  'app-monitoreo-progreso-nclex.webp': [1200, 800],
  'requisitos-solicitud-examen-nclex-rn-rnnclex.webp': [1200, 800],
  'que-es-examen-cat-nclex-adaptativo.webp': [1200, 800],
};

function rehypeImagePerf() {
  return (tree) => {
    const walk = (node) => {
      if (node.type === 'element' && node.tagName === 'img') {
        const src = String(node.properties.src || '');
        const file = src.split('/').pop();
        const dims = IMG_DIMS[file];
        if (dims && !node.properties.width && !node.properties.height) {
          node.properties.width = dims[0];
          node.properties.height = dims[1];
        }
        if (!node.properties.loading) node.properties.loading = 'lazy';
        if (!node.properties.decoding) node.properties.decoding = 'async';
      }
      (node.children || []).forEach(walk);
    };
    walk(tree);
  };
}

export default defineConfig({
  site: 'https://rnnclex.com',
  trailingSlash: 'always',
  build: {
    inlineStylesheets: 'always'
  },
  // 404 de WordPress con impresiones en GSC (auditoria 2026-10-24, ver seo/redirects-log.json):
  // Astro genera paginas HTML con redireccion y canonical, no 301 reales.
  redirects: {
    '/author/user/': '/blog/',
    '/author/user/page/2/': '/blog/',
  },
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    rehypePlugins: [rehypeFreeTrialLinks, rehypeImagePerf],
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
