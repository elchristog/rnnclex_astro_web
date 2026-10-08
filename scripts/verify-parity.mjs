// Revisa que el sitio nuevo tenga TODAS las paginas del sitio anterior y sin errores basicos.
// Uso: npm run build && node scripts/verify-parity.mjs
// PARITY_STRICT=true hace que el proceso falle (y bloquee la publicacion) si algo no cumple.
import { readFileSync, existsSync, readdirSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';

const strict = process.env.PARITY_STRICT === 'true';
const SITE = 'https://rnnclex.com';
const inv = JSON.parse(readFileSync('migration/urls.json', 'utf8'));
// rnnclex es independiente: nada de otros proyectos
const FORBIDDEN = [...inv.forbidden, 'enfermeraenestadosunidos', 'helpcenter'];

const paths = [
  ...inv.core,
  ...inv.states.map((s) => '/examen-nclex/requisitos/' + s + '/'),
  ...inv.qbank.map((s) => '/preparacion-nclex/preguntas-practica/' + s + '/'),
  ...inv.posts,
];
const expected = new Set(paths);

// Restos de la oferta anterior o de otros proyectos que no deben salir publicados (texto visible)
// Nota: $350/$650/$900 NO se buscan porque son tarifas reales de juntas estatales y del CES.
const OFFER_BAD = [
  /Acceso\s+(30|90|180)\s+D[ií]as/i,
  /\$\s?(49|89|139)(?![\d,.])/,
  /desde\s+\$\s?100/i,
  /mensaje por WhatsApp/i,
  /\bEB-?3\b|Schedule A|Visa Bulletin|Sesi[oó]n Informativa/i,
];
// Enlaces de compra/contacto antiguos (en el HTML)
const OLD_LINKS = [/bit\.ly\//i, /wa\.me\//i, /api\.whatsapp\.com/i, /calendly\.com/i];

function walkAll(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) walkAll(full, out);
    else out.push(full);
  }
  return out;
}

function attr(tag, name) {
  const m = tag && tag.match(new RegExp(name + '=["\']([^"\']*)["\']', 'i'));
  return m ? m[1] : '';
}

const level = strict ? 'error' : 'warning';
const note = (lvl, title, msg) =>
  console.log('::' + lvl + ' title=' + title + '::' + String(msg).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A'));

if (!existsSync('dist')) {
  console.error('No existe la carpeta dist: ejecuta npm run build primero.');
  process.exit(1);
}

const allFiles = walkAll('dist').map((f) => f.replace(/\\/g, '/'));
const have = new Set();
for (const f of allFiles) {
  const rel = '/' + f.replace(/^dist\//, '');
  have.add(rel);
  if (rel.endsWith('/index.html')) have.add(rel.slice(0, -'index.html'.length));
}
const htmlFiles = allFiles.filter((f) => f.endsWith('.html'));

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
  else if (title.length > 65) issues.push('titulo largo (' + title.length + '): ' + title);
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

// Restos de otro sitio, oferta vieja y paginas que no pertenecen
const leaks = {};
const offerLeaks = [];
const extras = [];
const broken = new Map();
for (const f of htmlFiles) {
  const raw = readFileSync(f, 'utf8');
  const html = raw.toLowerCase();
  const rel = f.replace(/^dist/, '').replace(/index\.html$/, '');
  for (const bad of FORBIDDEN) {
    if (html.includes(bad)) (leaks[bad] = leaks[bad] || []).push(rel);
  }
  if (!/http-equiv=["']refresh["']/i.test(raw)) {
    const visible = raw.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ');
    for (const re of OFFER_BAD) if (re.test(visible)) offerLeaks.push(rel + ' (' + re.source.slice(0, 24) + ')');
    for (const re of OLD_LINKS) if (re.test(raw)) offerLeaks.push(rel + ' (enlace antiguo ' + re.source.slice(0, 18) + ')');
  }
  if (rel.endsWith('/') && !expected.has(rel) && rel !== '/404/') extras.push(rel);
  // Enlaces internos rotos
  for (const m of raw.matchAll(/href="(\/[^"#?]*)/g)) {
    const target = m[1];
    if (target.startsWith('//')) continue;
    const exists = target.endsWith('/') ? have.has(target) : have.has(target) || have.has(target + '/');
    if (!exists) {
      if (!broken.has(target)) broken.set(target, []);
      broken.get(target).push(rel);
    }
  }
}

const leakKeys = Object.keys(leaks);
const lines = [];
lines.push('## Revision del sitio nuevo');
lines.push('- URLs esperadas: ' + paths.length + ' | correctas: ' + ok);
lines.push('- Faltan: ' + missing.length + ' | con problemas: ' + problems.length + ' | restos de otro sitio: ' + leakKeys.length + ' | oferta vieja: ' + offerLeaks.length + ' | enlaces rotos: ' + broken.size);
if (missing.length) lines.push('', '### Faltan', ...missing.map((x) => '- ' + x));
if (problems.length) lines.push('', '### Problemas', ...problems.map((x) => '- ' + x));
if (leakKeys.length) {
  lines.push('', '### Restos de otro sitio');
  for (const k of leakKeys) lines.push('- "' + k + '" en ' + leaks[k].length + ' paginas, por ejemplo: ' + leaks[k].slice(0, 5).join(', '));
}
if (offerLeaks.length) lines.push('', '### Oferta vieja (hay que reescribir)', ...offerLeaks.map((x) => '- ' + x));
if (broken.size) lines.push('', '### Enlaces internos rotos', ...[...broken].map(([t, from]) => '- ' + t + ' <- ' + from.slice(0, 3).join(', ')));
if (extras.length) lines.push('', '### Paginas que no existen en WordPress (revisar si deben quedarse)', ...extras.map((x) => '- ' + x));

const report = lines.join('\n');
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report + '\n');

// Anotaciones visibles en la pestana del PR / checks (GitHub muestra solo las primeras 10 de cada tipo: el detalle completo esta en el log)
note('notice', 'Resumen', 'esperadas ' + paths.length + ', correctas ' + ok + ', faltan ' + missing.length + ', con problemas ' + problems.length + ', otro sitio ' + leakKeys.length + ', oferta vieja ' + offerLeaks.length + ', enlaces rotos ' + broken.size + ', extra ' + extras.length);
for (const x of missing.slice(0, 40)) note(level, 'Falta', x);
for (const x of problems.slice(0, 40)) note(level, 'Problema', x);
for (const k of leakKeys) note(level, 'Otro sitio', k + ': ' + leaks[k].slice(0, 6).join(', '));
for (const x of offerLeaks.slice(0, 40)) note(level, 'Oferta vieja', x);
for (const [t, from] of [...broken].slice(0, 40)) note(level, 'Enlace roto', t + ' <- ' + from.slice(0, 3).join(', '));
for (const x of extras.slice(0, 20)) note('notice', 'Pagina extra', x);

if (strict && (missing.length || problems.length || leakKeys.length || offerLeaks.length || broken.size)) {
  console.error('\nPARITY_STRICT activo: el sitio no esta listo, no se publica.');
  process.exit(1);
}
