// Corrige imagenes de las paginas hechas a mano que apuntan a /images/NOMBRE.webp cuando el archivo
// en realidad vive en /images/wp/NOMBRE.webp. Para 4 imagenes que nunca se copiaron desde WordPress
// se usa la mas parecida que si existe (provisional: reemplazar por la original cuando se recupere).
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const PROVISIONAL = {
  'guia-preparacion-examen-nclex-rn-rnnclex.webp': 'guia-proceso-examen-nclex-rn.webp',
  'banco-de-preguntas-nclex-qbank-rnnclex.webp': 'banco-preguntas-nclex-ngn-rnnclex.webp',
  'simulador-nclex-cat-readiness-rnnclex-e1750962527374.webp': 'evaluacion-habilidad-nclex-cat-readiness.webp',
  'simuladores-examen-nclex-preparacion-certeza.webp': 'readiness-assessment-nclex-examen-predictivo.webp',
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
  const after = before.replace(/\/images\/([A-Za-z0-9._-]+\.(?:webp|png|jpe?g))/g, (m, name) => {
    if (existsSync('public/images/' + name)) return m;
    if (existsSync('public/images/wp/' + name)) { log.push(f + ': ' + name + ' -> wp/'); return '/images/wp/' + name; }
    const sub = PROVISIONAL[name];
    if (sub && existsSync('public/images/wp/' + sub)) { log.push(f + ': ' + name + ' -> PROVISIONAL ' + sub); return '/images/wp/' + sub; }
    log.push(f + ': ' + name + ' SIN ARREGLO');
    return m;
  });
  if (after !== before) { writeFileSync(f, after); changed++; }
}
console.log('Archivos corregidos:', changed);
console.log(log.join('\n'));
