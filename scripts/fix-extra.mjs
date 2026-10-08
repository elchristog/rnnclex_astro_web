// Ajustes finales de independencia y titulos. Idempotente; corre despues de fix-offer.mjs.
// rnnclex.com es un proyecto independiente: no se promociona ningun otro sitio ni canal de otro proyecto.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

function walk(dir, ext, out = []) {
  if (!existsSync(dir)) return out;
  for (const n of readdirSync(dir)) {
    const f = join(dir, n);
    if (statSync(f).isDirectory()) walk(f, ext, out);
    else if (f.endsWith(ext)) out.push(f);
  }
  return out;
}

let changed = 0;
function edit(file, fn) {
  if (!existsSync(file)) return;
  const before = readFileSync(file, 'utf8');
  const after = fn(before);
  if (after !== before) {
    writeFileSync(file, after);
    changed++;
    console.log('Ajustado:', file);
  }
}

// 1) Titulo corto para el articulo de repetidores
edit('src/content/articles/cuantas-veces-se-puede-hacer-el-nclex.md', (t) =>
  t.replace(/^seoTitle: ".*"$/m, 'seoTitle: ' + JSON.stringify('¿Cuántas veces puedes repetir el NCLEX? Guía para repetidores'))
);

// 2) Paginas Astro hechas a mano: sin el sufijo ' | rnnclex.com' dentro del titulo (el titulo ya queda corto)
for (const f of walk('src/pages', '.astro')) {
  edit(f, (t) => t.replace(/(title=")([^"]*?)\s*\|\s*rnnclex\.com(")/g, '$1$2$3'));
}

// 3) Pagina de videos: solo el canal de rnnclex (el otro canal es de otro proyecto)
edit('src/content/wp/recursos-nclex/videos.md', (t) => {
  let s = t;
  s = s.replace(/### Canal: Enfermera en Estados Unidos[\s\S]*?(?=\n## )/, '');
  s = s.replace(
    /Además, te presentamos nuestros dos canales de YouTube especializados, cada uno diseñado para apoyarte en una etapa diferente de tu viaje para convertirte en enfermera en Estados Unidos\./,
    'Además, te presentamos nuestro canal de YouTube, creado para apoyarte durante toda tu preparación.'
  );
  s = s.replace('## Nuestros Canales de YouTube: Tu Dosis Diaria de Conocimiento', '## Nuestro Canal de YouTube: Tu Dosis Diaria de Conocimiento');
  if (!s.includes('youtube.com/@rnnclex-usa')) {
    s = s.replace(
      /(\*\*\\-\*\* Noticias y actualizaciones importantes sobre el NCLEX\.)/,
      '$1\n\n[Suscríbete al canal de rnnclex](https://www.youtube.com/@rnnclex-usa)'
    );
  }
  return s.replace(/\n{3,}/g, '\n\n');
});

console.log('Ajustes de independencia:', changed);
