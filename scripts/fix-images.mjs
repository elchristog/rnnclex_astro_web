// Corrige imagenes de las paginas hechas a mano que apuntan a /images/NOMBRE.webp cuando el archivo
// en realidad vive en /images/wp/NOMBRE.webp. Para 4 imagenes que nunca se copiaron desde WordPress
// se usa una distinta que si existe. Tambien evita imagenes repetidas en la misma pagina y
// cambia el texto 'Prueba Gratuita' (ya no existe) por 'preguntas de muestra gratis'.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const PROVISIONAL = {
  'guia-preparacion-examen-nclex-rn-rnnclex.webp': 'guia-proceso-examen-nclex-rn.webp',
  'banco-de-preguntas-nclex-qbank-rnnclex.webp': 'banco-preguntas-nclex-ngn-rnnclex.webp',
  'simulador-nclex-cat-readiness-rnnclex-e1750962527374.webp': 'evaluacion-habilidad-nclex-cat-readiness.webp',
  'simuladores-examen-nclex-preparacion-certeza.webp': 'herramientas-preparacion-nclex-rnnclex.webp',
};

function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const f = join(dir, n);
    if (statSync(f).isDirectory()) walk(f, out);
    else if (/\.(astro|md|mjs)$/.test(f)) out.push(f);
  }
  return out;
}

let changed = 0;
const log = [];
for (const f of walk('src')) {
  const before = readFileSync(f, 'utf8');
  let after = before.replace(/\/images\/([A-Za-z0-9._-]+\.(?:webp|png|jpe?g))/g, (m, name) => {
    if (existsSync('public/images/' + name)) return m;
    if (existsSync('public/images/wp/' + name)) { log.push(f + ': ' + name + ' -> wp/'); return '/images/wp/' + name; }
    const sub = PROVISIONAL[name];
    if (sub && existsSync('public/images/wp/' + sub)) { log.push(f + ': ' + name + ' -> sustituta ' + sub); return '/images/wp/' + sub; }
    log.push(f + ': ' + name + ' SIN ARREGLO');
    return m;
  });

  // Pagina de simuladores: la imagen principal se repetia mas abajo
  if (f.replace(/\\/g, '/').endsWith('simuladores-examen/index.astro')) {
    const src = '/images/wp/readiness-assessment-nclex-examen-predictivo.webp';
    if (after.split(src).length - 1 >= 2 && existsSync('public/images/wp/herramientas-preparacion-nclex-rnnclex.webp')) {
      after = after.replace(src, '/images/wp/herramientas-preparacion-nclex-rnnclex.webp');
      log.push(f + ': imagen principal repetida -> herramientas-preparacion');
    }
  }

  // Ya no hay prueba gratuita: hay preguntas de muestra gratis y la suscripcion de USD 19/mes
  after = after.replace(/¡?Iniciar Prueba Gratuita!?/g, 'Ver preguntas de muestra gratis');

  if (after !== before) { writeFileSync(f, after); changed++; }
}
console.log('Archivos corregidos:', changed);
console.log(log.join('\n'));
