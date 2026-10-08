// Migra el contenido real de rnnclex.com (WordPress) a archivos Markdown de Astro.
// Lo ejecuta GitHub Actions (migrate.yml). Genera:
//   src/content/wp/<ruta>.md        paginas
//   src/content/articles/<slug>.md  articulos del blog
//   public/images/wp/*              imagenes usadas
//   migration/report.json           que se migro bien y que no
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';

const BASE = 'https://rnnclex.com';
const UA = 'Mozilla/5.0 (compatible; RnnclexMigration/1.0)';
const inv = JSON.parse(readFileSync('migration/urls.json', 'utf8'));

// Paginas que se construyen a mano en Astro (no se copian de WordPress)
const SKIP = new Set(['/', '/precios/', '/login/', '/examen-nclex/requisitos/', '/blog/']);

// Restos de la oferta anterior u de otros proyectos: se marcan para corregirlos a mano
const OFFER_BAD = [
  ['plan-dias', /Acceso\s+(30|90|180)\s+D[ií]as/i],
  ['precio-viejo', /\$\s?(49|89|139|350|650|900)(?![\d,])/],
  ['desde-100', /desde\s+\$\s?100/i],
  ['whatsapp-compra', /bit\.ly\/rnnclex_whatsapp/i],
  ['otro-sitio', /enfermerausa|G-ZF1G0T80D2/i],
];

const report = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, asJson = false) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers: { 'user-agent': UA, 'accept-language': 'es' }, redirect: 'follow' });
      if (r.status === 404) return null;
      if (r.ok) return asJson ? await r.json() : await r.text();
    } catch {}
    await sleep(1500 * (i + 1));
  }
  return null;
}

const imgDir = 'public/images/wp';
const savedImages = new Map();
async function saveImage(src) {
  try {
    const u = new URL(src, BASE);
    if (!/(^|\.)rnnclex\.com$/.test(u.hostname)) return null; // nada de imagenes de otros sitios
    const name = basename(u.pathname);
    if (!name) return null;
    if (savedImages.has(name)) return savedImages.get(name);
    const out = join(imgDir, name);
    if (!existsSync(out)) {
      const r = await fetch(u.href, { headers: { 'user-agent': UA } });
      if (!r.ok) return null;
      mkdirSync(imgDir, { recursive: true });
      writeFileSync(out, Buffer.from(await r.arrayBuffer()));
    }
    const pub = '/images/wp/' + name;
    savedImages.set(name, pub);
    return pub;
  } catch {
    return null;
  }
}

const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', codeBlockStyle: 'fenced', emDelimiter: '*' });

async function prepare($, { dropLogo }) {
  $('script,style,noscript,svg,iframe,form,nav,header,footer,select,input,textarea,.screen-reader-text').remove();
  for (const el of $('img').toArray()) {
    const $el = $(el);
    const src = $el.attr('data-lazy-src') || $el.attr('data-src') || $el.attr('src') || '';
    if (!src || src.startsWith('data:') || (dropLogo && /rn_nclex_logo/.test(src))) {
      $el.remove();
      continue;
    }
    const local = await saveImage(src);
    if (!local) {
      $el.remove();
      continue;
    }
    $el.attr('src', local);
    ['srcset', 'data-lazy-src', 'data-src', 'data-lazy-srcset', 'sizes', 'style'].forEach((a) => $el.removeAttr(a));
  }
}

function cleanMd(md) {
  return md
    .replace(/\[\s*(?:Iniciar Prueba Gratuita|Ir a Preguntas de Práctica|TEST GRATIS|LOGIN)\s*\]\([^)]*\)/gi, '')
    .replace(/^\s*-\s*$/gm, '')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function cutFooter(md) {
  const m = md.match(/^#{2,4}\s*RN NCLEX\s*$/m);
  return m ? md.slice(0, m.index) : md;
}

function splitH1(md) {
  const m = md.match(/^#\s+(.+)$/m);
  if (!m) return { title: null, body: md };
  return { title: m[1].trim(), body: md.slice(m.index + m[0].length) };
}

function plain(s) {
  return s
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Convierte la seccion "Preguntas Frecuentes" del Markdown en datos (para el esquema FAQ de Google)
function extractFaqsFromMd(md) {
  const m = md.match(/^(#{2,3})\s*Preguntas\s+Frecuentes[^\n]*\n/im);
  if (!m) return { md, faqs: [] };
  const level = m[1].length;
  const start = m.index;
  const rest = md.slice(start + m[0].length);
  const endRe = new RegExp('^#{1,' + level + '}\\s', 'm');
  const em = rest.match(endRe);
  const block = em ? rest.slice(0, em.index) : rest;
  const after = em ? rest.slice(em.index) : '';
  const faqs = [];
  for (const part of block.split(/^#{3,5}\s+/m).slice(1)) {
    const nl = part.indexOf('\n');
    if (nl < 0) continue;
    const question = plain(part.slice(0, nl));
    const answer = plain(part.slice(nl + 1));
    if (question && answer) faqs.push({ question, answer });
  }
  if (!faqs.length) return { md, faqs: [] };
  return { md: md.slice(0, start) + after, faqs };
}

const flagsOf = (text) => OFFER_BAD.filter(([, re]) => re.test(text)).map(([n]) => n);

function seoOf($) {
  let t = ($('title').first().text() || '').trim();
  t = t.replace(/\s*[|–-]\s*(rnnclex\.com|RN NCLEX)\s*$/i, '').trim();
  const d = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
  return { seoTitle: t, description: d.trim() };
}

function firstParagraph(md) {
  for (const line of md.split('\n')) {
    const s = plain(line);
    if (s.length > 60 && !line.startsWith('#')) return s.slice(0, 155);
  }
  return '';
}

function writeEntry(file, fm, body) {
  mkdirSync(dirname(file), { recursive: true });
  const yaml = Object.entries(fm)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => k + ': ' + JSON.stringify(v))
    .join('\n');
  writeFileSync(file, '---\n' + yaml + '\n---\n\n' + body + '\n');
}

function hasAstroPage(p) {
  const clean = p.replace(/^\/|\/$/g, '');
  return existsSync('src/pages/' + clean + '/index.astro') || existsSync('src/pages/' + clean + '.astro');
}

async function migratePage(path) {
  const html = await get(BASE + path);
  if (!html) {
    report.push({ path, status: 'no-existe-en-wp' });
    return;
  }
  const $ = cheerio.load(html);
  const seo = seoOf($);
  await prepare($, { dropLogo: false });
  let md = td.turndown($('body').html() || '');
  md = cutFooter(md);
  const { title, body } = splitH1(md);
  let text = cleanMd(body);
  const f = extractFaqsFromMd(text);
  text = cleanMd(f.md);
  const id = path.replace(/^\/|\/$/g, '');
  const finalTitle = title || seo.seoTitle || id;
  const description = seo.description || firstParagraph(text);
  const flags = flagsOf(text);
  writeEntry('src/content/wp/' + id + '.md', {
    title: finalTitle,
    seoTitle: seo.seoTitle || finalTitle,
    description,
    path,
    thin: text.length < 400,
    flags,
    faqs: f.faqs,
  }, text);
  report.push({ path, status: text.length < 400 ? 'poco-contenido' : 'ok', chars: text.length, faqs: f.faqs.length, flags });
}

async function migratePosts() {
  const posts = await get(BASE + '/wp-json/wp/v2/posts?per_page=100&_fields=slug,link,date,modified,title,content,yoast_head_json', true);
  if (!Array.isArray(posts)) {
    report.push({ path: 'posts', status: 'error-api' });
    return;
  }
  const decode = (s) => cheerio.load('<p>' + s + '</p>')('p').text().trim();
  for (const p of posts) {
    const section = new URL(p.link).pathname.split('/').filter(Boolean)[0];
    const $ = cheerio.load('<div id="root">' + p.content.rendered + '</div>');
    const faqs = [];
    $('.schema-faq-section').each((_, el) => {
      const q = $(el).find('.schema-faq-question').first().text().trim();
      const a = $(el).find('.schema-faq-answer').first().text().trim();
      if (q && a) faqs.push({ question: q, answer: a });
    });
    $('.wp-block-yoast-faq-block').remove();
    await prepare($, { dropLogo: true });
    let md = cleanMd(td.turndown($('#root').html() || ''));
    if (faqs.length) md = cleanMd(md.replace(/^#{2,3}\s*Preguntas\s+frecuentes[^\n]*$/gim, ''));
    const y = p.yoast_head_json || {};
    const title = decode(p.title.rendered);
    const seoTitle = (y.title || title).replace(/\s*[|–-]\s*(rnnclex\.com|RN NCLEX)\s*$/i, '').trim();
    const description = y.description || y.og_description || firstParagraph(md);
    const flags = flagsOf(md);
    const okSection = ['estrategias-examen', 'proceso-licencia-homologacion'].includes(section) ? section : 'estrategias-examen';
    writeEntry('src/content/articles/' + p.slug + '.md', {
      title,
      seoTitle,
      description,
      date: p.date,
      updated: p.modified,
      section: okSection,
      slug: p.slug,
      flags,
      faqs,
    }, md);
    report.push({ path: '/' + okSection + '/' + p.slug + '/', status: md.length < 400 ? 'poco-contenido' : 'ok', chars: md.length, faqs: faqs.length, flags });
  }
}

const pagePaths = [
  ...inv.core,
  ...inv.states.map((s) => '/examen-nclex/requisitos/' + s + '/'),
  ...inv.qbank.map((s) => '/preparacion-nclex/preguntas-practica/' + s + '/'),
].filter((p) => !SKIP.has(p));

for (const p of pagePaths) {
  if (hasAstroPage(p)) {
    report.push({ path: p, status: 'ya-existe-en-astro' });
    continue;
  }
  await migratePage(p);
  await sleep(300);
}
await migratePosts();

mkdirSync('migration', { recursive: true });
writeFileSync('migration/report.json', JSON.stringify(report, null, 2));
const count = (s) => report.filter((r) => r.status === s).length;
console.log('Migradas ok:', count('ok'), '| poco contenido:', count('poco-contenido'), '| no existen en WP:', count('no-existe-en-wp'), '| ya en Astro:', count('ya-existe-en-astro'));
for (const r of report.filter((r) => r.flags && r.flags.length)) console.log('Revisar oferta/otros:', r.path, r.flags.join(','));
