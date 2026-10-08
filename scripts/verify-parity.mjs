// Revisa que el sitio nuevo tenga TODAS las paginas del sitio anterior y sin errores basicos.
// Uso: npm run build && node scripts/verify-parity.mjs
// PARITY_STRICT=true hace que el proceso falle (y bloquee la publicacion) si algo no cumple.
import { readFileSync, existsSync, readdirSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';

const strict = process.env.PARITY_STRICT === 'true';
const SITE = 'https://rnnclex.com';
const inv = JSON.parse(readFileSync('migration/urls.json', 'utf8'));

const paths = [
  ...inv.core,
  ...inv.states.map((s) => '/examen-nclex/requisitos/' + s + '/'),
  ...inv.qbank.map((s) => '/preparacion-nclex/preguntas-practica/' + s + '/'),
  ...inv.posts,
];
const expected = new Set(paths);

function walk(dir, out) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function attr(tag, name) {
  const m = tag && tag.match(new RegExp(name + '=["\']([^"\']*)["\']', 'i'));
  return m ? m[1] : '';
}

const missing = [];
const problems = [];
let ok = 0;

for (const p of paths) {
  const file = join('dist', p, 'index.html');
  if (!existsSync(file)) {
    missing.push(p);
    continue;
  }
  const html = readFileSync(file, 'utf8');
  if (/http-equiv=["']refresh["']/i.test(html)) {
    if ((inv.redirects || []).includes(p)) ok++;
    else problems.push(p + ' -> es solo una redireccion, debe ser una pagina real');
    continue;
  }
  const issues = [];
  const title = ((html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || '').trim();
  if (!title) issues.push('sin titulo');
  else if (title.length > 65) issues.push('titulo largo (' + title.length + ')');
  const metaTag = (html.match(/<meta[^>]*name=["']description["'][^>]*>/i) || [])[0];
  if (attr(metaTag, 'content').length < 50) issues.push('descripcion ausente o corta');
  const h1s = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1s !== 1) issues.push('h1 encontrados: ' + h1s);
  const canonTag = (html.match(/<link[^>]*rel=["']canonical["'][^>]*>/i) || [])[0];
  const canon = attr(canonTag, 'href');
  if (canon !== SITE + p) issues.push('canonical incorrecto: ' + (canon || 'falta'));
  if (!/<html[^>]*lang=["']es/i.test(html)) issues.push('idioma no es es');
  if (issues.length) problems.push(p + ' -> ' + issues.join('; '));
  else ok++;
}

// Textos que NO deben aparecer (restos de otro sitio) y paginas que no pertenecen
const leaks = {};
const extras = [];
for (const f of walk('dist', [])) {
  const html = readFileSync(f, 'utf8').toLowerCase();
  for (const bad of inv.forbidden) {
    if (html.includes(bad)) (leaks[bad] = leaks[bad] || []).push(f.replace(/^dist/, ''));
  }
  const rel = f.replace(/^dist/, '').replace(/index\.html$/, '');
  if (rel.endsWith('/') && !expected.has(rel) && rel !== '/404/') extras.push(rel);
}

const leakKeys = Object.keys(leaks);
const lines = [];
lines.push('## Revision del sitio nuevo');
lines.push('- URLs esperadas: ' + paths.length + ' | correctas: ' + ok);
lines.push('- Faltan: ' + missing.length + ' | con problemas: ' + problems.length + ' | restos de otro sitio: ' + leakKeys.length);
if (missing.length) lines.push('', '### Faltan', ...missing.slice(0, 120).map((x) => '- ' + x));
if (problems.length) lines.push('', '### Problemas', ...problems.slice(0, 120).map((x) => '- ' + x));
if (leakKeys.length) {
  lines.push('', '### Restos de otro sitio');
  for (const k of leakKeys) lines.push('- "' + k + '" en ' + leaks[k].length + ' paginas, por ejemplo: ' + leaks[k].slice(0, 5).join(', '));
}
if (extras.length) lines.push('', '### Paginas que no existen en WordPress (revisar si deben quedarse)', ...extras.slice(0, 80).map((x) => '- ' + x));

const report = lines.join('\n');
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report + '\n');

if (strict && (missing.length || problems.length || leakKeys.length)) {
  console.error('\nPARITY_STRICT activo: el sitio no esta listo, no se publica.');
  process.exit(1);
}
