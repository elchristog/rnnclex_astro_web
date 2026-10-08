// Corrige en el contenido copiado de WordPress (y en las paginas ya hechas en Astro) todo lo que ya no es verdad:
// la oferta es UNA sola suscripcion de USD 19/mes que se compra dentro de la app.
// Se ejecuta despues de scripts/migrate-from-wp.mjs. Es idempotente: se puede volver a correr sin riesgo.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, unlinkSync } from 'node:fs';
import { join, basename } from 'node:path';
import { site } from '../src/data/site.mjs';

const APP = site.appUrl;
const PRICE = site.offer.price;

const FLAGS = [
  ['plan-dias', /Acceso\s+(30|90|180)\s+D[ií]as/i],
  ['precio-viejo', /\$\s?(49|89|139)(?![\d,.])/],
  ['desde-100', /desde\s+\$\s?100/i],
  ['whatsapp-compra', /bit\.ly\/rnnclex_whatsapp|mensaje por WhatsApp/i],
  ['otro-sitio', /enfermerausa|G-ZF1G0T80D2/i],
];

// 0) West Virginia y Wyoming no existen en WordPress (alli responde una pagina generica): se usa la guia propia.
for (const f of [
  'src/content/wp/examen-nclex/requisitos/west-virginia.md',
  'src/content/wp/examen-nclex/requisitos/wyoming.md',
]) {
  if (existsSync(f)) unlinkSync(f);
}

// Titulos y descripciones a medida (maximo ~60 y ~155 caracteres)
const TITLES = {
  'mental-health': 'Preguntas NCLEX: Salud Mental | Muestra Gratuita',
  pharmacology: 'Preguntas NCLEX: Farmacología | Muestra Gratuita',
  'desbloquea-el-exito-en-el-nclex-guia-definitiva-de-libros-y-estrategias-de-estudio': 'Guía de libros y estrategias de estudio para el NCLEX',
};
const DESCS = {
  'como-inscribirte-al-examen-nclex-en-2025':
    'Guía paso a paso para inscribirte al NCLEX: elige tu Board of Nursing, envía tus documentos, regístrate en Pearson VUE, recibe el ATT y agenda tu examen.',
};

const SUFFIX = /\s*[|–—-]\s*(rnnclex\.com|RN NCLEX)\s*$/i;
function stripSuffix(t) {
  let s = t.trim();
  let prev;
  do {
    prev = s;
    s = s.replace(SUFFIX, '').trim();
  } while (s !== prev);
  return s;
}
function cleanSeoTitle(t) {
  let s = stripSuffix(t);
  if (s.length > 62) {
    const m = s.match(/^(.{25,}?)\s+\|\s+[^|]+$/);
    if (m) s = m[1];
  }
  return s;
}
function cutDesc(d) {
  if (d.length <= 170) return d;
  const cut = d.slice(0, 155);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.]$/, '') + '…';
}

function setFm(text, key, fn) {
  return text.replace(new RegExp('^' + key + ': (".*")$', 'm'), (m, q) => {
    try {
      return key + ': ' + JSON.stringify(fn(JSON.parse(q)));
    } catch {
      return m;
    }
  });
}

function walk(dir, exts, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, exts, out);
    else if (exts.some((e) => full.endsWith(e))) out.push(full);
  }
  return out;
}

// Reglas comunes (markdown y astro)
function fixCommon(t) {
  t = t.replace(/Ver planes desde \$\s?100/gi, `Ver el plan de USD ${PRICE}/mes`);
  t = t.replace(/empieza desde \$\s?100/gi, `cuesta USD ${PRICE} al mes`);
  t = t.replace(/desde \$\s?100/gi, `por USD ${PRICE} al mes`);
  // No prometer una prueba gratis que no existe: lo que si hay son preguntas de muestra
  t = t.replace(/85 preguntas(?: (?:reales|bilingües))? gratis/gi, 'preguntas de muestra gratis');
  // Enlaces a las paginas de simuladores con la ruta correcta (minusculas, completa)
  t = t.replace(/(?:\/preparacion-nclex)?\/simuladores-examen\/CAT\//g, '/preparacion-nclex/simuladores-examen/cat/');
  t = t.replace(/(?:\/preparacion-nclex)?\/simuladores-examen\/readiness-assessment\//g, '/preparacion-nclex/simuladores-examen/readiness-assessment/');
  return t;
}

// Reglas de contenido markdown
function fixMarkdown(text, file) {
  const m = text.match(/^---\n[\s\S]*?\n---\n/);
  let head = m ? m[0] : '';
  let body = m ? text.slice(head.length) : text;

  body = body.replace(/^\*\*Para recibir tu acceso[^\n]*\*\*[ \t]*\n+/gm, '');
  body = body.replace(
    /te ofrecemos una prueba completamente gratuita de nuestro Qbank premium\./g,
    `aquí tienes preguntas de muestra gratuitas de nuestro Qbank. El banco completo, con más de 3500 preguntas, está dentro de la plataforma por USD ${PRICE} al mes.`
  );
  body = body.replace(
    /### ¿Necesitas ayuda personalizada\?[\s\S]*$/,
    `### ¿Quieres practicar mientras avanzas con el trámite?\n\nAccede a la plataforma bilingüe: más de 3500 preguntas, simuladores CAT, NGN y guías en español por USD ${PRICE} al mes.\n\n[**Empezar ahora — USD ${PRICE}/mes**](${APP})\n`
  );
  body = body.replace(
    /\[([^\]]*)\]\(https:\/\/bit\.ly\/rnnclex_whatsapp\)/g,
    `[Practicar con el banco completo — USD ${PRICE}/mes](${APP})`
  );
  body = body.replace(/^\[\]\(https:\/\/rnnclex\.com\/\)[ \t]*\n/gm, '');
  // El titulo de la pagina ya es el unico H1
  body = body.replace(/^# (?!#)/gm, '## ');

  head = fixCommon(head);
  body = fixCommon(body);
  head = setFm(head, 'title', (v) => stripSuffix(v));
  const key = basename(file, '.md');
  head = setFm(head, 'seoTitle', (v) => TITLES[key] ?? cleanSeoTitle(v));
  head = setFm(head, 'description', (v) => DESCS[key] ?? cutDesc(v));
  return head + body;
}

let changed = 0;
const remaining = [];

for (const f of [...walk('src/content/wp', ['.md']), ...walk('src/content/articles', ['.md'])]) {
  const before = readFileSync(f, 'utf8');
  let after = fixMarkdown(before, f);
  const flags = FLAGS.filter(([, re]) => re.test(after)).map(([n]) => n);
  after = after.replace(/^flags:.*$/m, 'flags: ' + JSON.stringify(flags));
  if (flags.length) remaining.push(f + ' -> ' + flags.join(','));
  if (after !== before) {
    writeFileSync(f, after);
    changed++;
  }
}

// Paginas hechas a mano en Astro
const QB = 'src/pages/preparacion-nclex/preguntas-practica/index.astro';
for (const f of [...walk('src/pages', ['.astro']), ...walk('src/components', ['.astro'])]) {
  const before = readFileSync(f, 'utf8');
  let after = fixCommon(before);
  if (f.replace(/\\/g, '/') === QB) {
    after = after
      .replace(
        /Por eso, te ofrecemos una prueba completamente gratuita de nuestro Qbank premium\.<br\/><br\/>\s*<b>Para recibir tu acceso[^<]*<\/b>/,
        `Por eso, aquí tienes preguntas de muestra gratuitas de nuestro Qbank; el banco completo, con más de 3500 preguntas, está dentro de la plataforma por USD ${PRICE} al mes.`
      )
      .replace(/href="https:\/\/bit\.ly\/rnnclex_whatsapp"/g, `href="${APP}" data-cta="app"`)
      .replace(/¡Solicitar Mi Prueba Gratuita por WhatsApp!/g, `Empezar ahora — USD ${PRICE}/mes`)
      .replace(/Solicitar Prueba Por WhatsApp/g, `Empezar ahora — USD ${PRICE}/mes`)
      .replace(/Te invitamos a comprobarlo con nuestra prueba gratuita por WhatsApp\./, 'Te invitamos a comprobarlo con las preguntas de muestra gratuitas de esta página.')
      .replace(/Puedes solicitar un acceso gratuito directamente en esta página para una inmersión total\./, `Accedes a todo el banco con la suscripción de USD ${PRICE} al mes desde la plataforma.`)
      .replace(/¿Quieres ver un adelanto antes de solicitar tu prueba\?/, '¿Quieres ver un adelanto antes de suscribirte?')
      .replace(/title="\+3500 preguntas NCLEX en inglés y español \| Gratis"/, 'title="+3500 preguntas NCLEX en inglés y español | Muestra gratis"');
  }
  if (after !== before) {
    writeFileSync(f, after);
    changed++;
  }
}

console.log('Archivos corregidos:', changed);
if (remaining.length) {
  console.log('Siguen con avisos (revisar a mano):');
  for (const r of remaining) console.log(' - ' + r);
}
