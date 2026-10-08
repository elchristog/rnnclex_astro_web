// Escanea TODO el sitio construido (dist) y lista:
//  1) imagenes/archivos/enlaces que apuntan a WordPress (wp-content, wp-includes, wp-json, wp-admin, wp-login)
//  2) src/href locales (y absolutos de rnnclex.com) que NO existen en el sitio nuevo (imagenes rotas, enlaces que caen en 404)
//  3) enlaces a dominios de otros proyectos
// Uso: node scripts/check-assets.mjs   (STRICT=true hace fallar el proceso si encuentra algo)
import { readFileSync, readdirSync, existsSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';

const strict = process.env.STRICT === 'true';
const OTHER = ['enfermerausa', 'enfermeraenestadosunidos', 'improved365', 'usnurses', 'bit.ly/rnnclex_whatsapp', 'wa.me/'];
const WP = /wp-content|wp-includes|wp-json|wp-admin|wp-login|xmlrpc\.php/i;

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const f = join(dir, e.name);
    if (e.isDirectory()) walk(f, out);
    else out.push(f.replace(/\\/g, '/'));
  }
  return out;
}
if (!existsSync('dist')) { console.error('Falta dist: ejecuta npm run build'); process.exit(1); }

const files = walk('dist');
const have = new Set();
for (const f of files) {
  const rel = '/' + f.replace(/^dist\//, '');
  have.add(rel);
  if (rel.endsWith('/index.html')) { have.add(rel.slice(0, -10)); have.add(rel.slice(0, -11)); }
}

const wpHits = new Map();   // url -> paginas
const missing = new Map();  // url -> paginas
const other = new Map();

function add(map, key, page) { if (!map.has(key)) map.set(key, new Set()); map.get(key).add(page); }

for (const f of files.filter((x) => x.endsWith('.html'))) {
  const page = f.replace(/^dist/, '').replace(/index\.html$/, '') || '/';
  const html = readFileSync(f, 'utf8');
  // todas las URLs en src, href, srcset, content (og:image), url(...)
  const urls = new Set();
  for (const m of html.matchAll(/(?:src|href|data-src|poster|content)="([^"]+)"/gi)) urls.add(m[1]);
  for (const m of html.matchAll(/srcset="([^"]+)"/gi)) for (const p of m[1].split(',')) urls.add(p.trim().split(/\s+/)[0]);
  for (const m of html.matchAll(/url\(['"]?([^'")]+)['"]?\)/gi)) urls.add(m[1]);

  for (let u of urls) {
    if (!u || u.startsWith('data:') || u.startsWith('mailto:') || u.startsWith('tel:') || u.startsWith('#') || u.startsWith('javascript:')) continue;
    if (WP.test(u)) { add(wpHits, u, page); continue; }
    if (OTHER.some((o) => u.toLowerCase().includes(o))) { add(other, u, page); continue; }
    // absolutos propios -> ruta local
    let local = u;
    const abs = u.match(/^https?:\/\/(www\.)?rnnclex\.com(\/[^?#]*)?/i);
    if (abs) local = abs[2] || '/';
    if (!local.startsWith('/') || local.startsWith('//')) continue; // externos
    local = local.split('?')[0].split('#')[0];
    if (!have.has(local) && !have.has(local.replace(/\/$/, '')) && !have.has(local + (local.endsWith('/') ? '' : '/'))) add(missing, u, page);
  }
  // contenido de texto que mencione wp-content (JSON-LD, scripts)
  if (WP.test(html)) {
    for (const m of html.matchAll(/[^\s"'(]*wp-(?:content|includes|json)[^\s"')]*/gi)) add(wpHits, m[0], page);
  }
}

const fmt = (map) => [...map].map(([u, p]) => '- ' + u + '  <-  ' + [...p].slice(0, 4).join(', ') + (p.size > 4 ? ' (+' + (p.size - 4) + ')' : ''));
const lines = [
  '## Revision de imagenes y enlaces',
  '- Apuntan a WordPress: ' + wpHits.size + ' | no existen en el sitio nuevo: ' + missing.size + ' | otros proyectos / WhatsApp: ' + other.size,
];
if (wpHits.size) lines.push('', '### Apuntan a WordPress', ...fmt(wpHits));
if (missing.size) lines.push('', '### No existen en el sitio nuevo (404)', ...fmt(missing));
if (other.size) lines.push('', '### Otros proyectos / WhatsApp', ...fmt(other));
const report = lines.join('\n');
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report + '\n');
const lvl = strict ? 'error' : 'warning';
for (const [u, p] of [...wpHits].slice(0, 40)) console.log('::' + lvl + ' title=Apunta a WordPress::' + u + ' <- ' + [...p].slice(0, 3).join(', '));
for (const [u, p] of [...missing].slice(0, 40)) console.log('::' + lvl + ' title=No existe::' + u + ' <- ' + [...p].slice(0, 3).join(', '));
for (const [u, p] of [...other].slice(0, 20)) console.log('::' + lvl + ' title=Otro proyecto::' + u + ' <- ' + [...p].slice(0, 3).join(', '));
if (strict && (wpHits.size || missing.size || other.size)) process.exit(1);
