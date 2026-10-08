// Corrige en el contenido copiado de WordPress todo lo que ya no es verdad:
// la oferta es UNA sola suscripcion de USD 19/mes que se compra dentro de la app.
// Se ejecuta despues de scripts/migrate-from-wp.mjs (y se puede volver a correr sin riesgo).
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
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

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (full.endsWith('.md')) out.push(full);
  }
  return out;
}

function fix(text) {
  let t = text;
  // 1) Prueba por WhatsApp (oferta anterior)
  t = t.replace(/^\*\*Para recibir tu acceso[^\n]*\*\*[ \t]*\n+/gm, '');
  t = t.replace(
    /te ofrecemos una prueba completamente gratuita de nuestro Qbank premium\./g,
    `aquí tienes preguntas de muestra gratuitas de nuestro Qbank. El banco completo, con más de 3500 preguntas, está dentro de la plataforma por USD ${PRICE} al mes.`
  );
  t = t.replace(
    /### ¿Necesitas ayuda personalizada\?[\s\S]*$/,
    `### ¿Quieres practicar mientras avanzas con el trámite?\n\nAccede a la plataforma bilingüe: más de 3500 preguntas, simuladores CAT, NGN y guías en español por USD ${PRICE} al mes.\n\n[**Empezar ahora — USD ${PRICE}/mes**](${APP})\n`
  );
  t = t.replace(
    /\[([^\]]*)\]\(https:\/\/bit\.ly\/rnnclex_whatsapp\)/g,
    `[Practicar con el banco completo — USD ${PRICE}/mes](${APP})`
  );
  // 2) Precios viejos ('desde $100')
  t = t.replace(/Ver planes desde \$\s?100/gi, `Ver el plan de USD ${PRICE}/mes`);
  t = t.replace(/empieza desde \$\s?100/gi, `cuesta USD ${PRICE} al mes`);
  t = t.replace(/desde \$\s?100/gi, `por USD ${PRICE} al mes`);
  // 3) No prometer una prueba gratis que no existe: lo que si hay son preguntas de muestra
  t = t.replace(/85 preguntas(?: (?:reales|bilingües))? gratis/gi, 'preguntas de muestra gratis');
  // 4) Restos de maquetacion de WordPress
  t = t.replace(/^\[\]\(https:\/\/rnnclex\.com\/\)[ \t]*\n/gm, '');
  return t;
}

let changed = 0;
const remaining = [];
for (const f of [...walk('src/content/wp'), ...walk('src/content/articles')]) {
  const before = readFileSync(f, 'utf8');
  let after = fix(before);
  const flags = FLAGS.filter(([, re]) => re.test(after)).map(([n]) => n);
  after = after.replace(/^flags:.*$/m, 'flags: ' + JSON.stringify(flags));
  if (flags.length) remaining.push(f + ' -> ' + flags.join(','));
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
