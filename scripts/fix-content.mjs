// Limpia restos de la migracion desde WordPress en el texto de las paginas (solo el cuerpo, no el encabezado YAML).
// 1) Bloques de VARIAS lineas envueltos en [ ... ](url) -> lista con vinetas (los enlaces de una linea, como botones, NO se tocan)
// 2) Secciones cuyo texto es identico al de la seccion anterior -> se quita la seccion repetida (se informa)
// 3) Secciones de pasos con parrafos cortos -> lista numerada
// 4) Etiquetas cortas "Titulo: texto" al inicio de parrafo -> negrita (maximo 5 palabras, sin comas)
// 5) Marcas sobrantes de FAQ en el encabezado
// Escribe scripts/cleanup-report.md con todo lo cambiado y lo que requiere decision humana.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const f = join(dir, n);
    if (statSync(f).isDirectory()) walk(f, out);
    else if (f.endsWith('.md')) out.push(f.replace(/\\/g, '/'));
  }
  return out;
}

const report = { wrapper: [], dup: [], steps: [], labels: [], faqMarks: [], pending: [] };
const STEP_HEAD = /(paso a paso|pasos|proceso de solicitud|cómo (inscribirte|solicitar|aplicar))/i;

function splitDoc(txt) {
  const m = txt.match(/^---\n[\s\S]*?\n---\n/);
  if (!m) return { head: '', body: txt };
  return { head: m[0], body: txt.slice(m[0].length) };
}

function fixWrapper(body, file) {
  const re = /^\[(\*\*[\s\S]*?)\s*\]\((https?:\/\/[^)]*)\)[ \t]*$/gm;
  return body.replace(re, (all, inner, url) => {
    const lines = inner.split(/\n/).map((l) => l.trim()).filter(Boolean);
    // Solo bloques de varias lineas; un enlace de una linea es un boton y se conserva tal cual
    if (lines.length < 2 || !lines.every((l) => l.startsWith('**'))) return all;
    report.wrapper.push(file);
    return lines
      .map((l) => '- ' + l.replace(/(^|\s)(https?:\/\/[^\s)]+)(?=\s|$)/g, (mm, sp, u) => sp + '[' + u.replace(/^https?:\/\//, '').replace(/\/$/, '') + '](' + u + ')'))
      .join('\n') + '\n';
  });
}

function sections(body) {
  const parts = body.split(/^(?=#{2,3} )/m);
  return parts.map((p) => {
    const m = p.match(/^(#{2,3}) (.+)\n?/);
    return m ? { level: m[1].length, title: m[2].trim(), head: m[0].trimEnd(), text: p.slice(m[0].length).trim() } : { level: 0, title: null, head: null, text: p.trim() };
  });
}
const join2 = (secs) => secs.map((s) => (s.head ? s.head + '\n\n' : '') + s.text).filter(Boolean).join('\n\n') + '\n';

function fixDup(body, file) {
  const secs = sections(body);
  const out = [];
  let prev = null;
  let changed = false;
  for (const s of secs) {
    const norm = s.text.replace(/\s+/g, ' ').trim();
    if (s.head && prev && norm.length > 60 && norm === prev) {
      report.dup.push(file + ' -> quitada sección repetida "' + s.title + '"');
      changed = true;
      continue;
    }
    out.push(s);
    if (s.head) prev = norm;
  }
  return changed ? join2(out) : body;
}

function fixSteps(body, file) {
  const secs = sections(body);
  let changed = false;
  for (const s of secs) {
    if (!s.head || !STEP_HEAD.test(s.title)) continue;
    const paras = s.text.split(/\n{2,}/).map((x) => x.trim()).filter(Boolean);
    const plain = paras.every((p) => !/^([-*+]|\d+\.|>|\||#|!|<|\[)/.test(p) && !p.includes('\n') && p.length < 260);
    if (paras.length >= 3 && plain) {
      s.text = paras.map((p, i) => (i + 1) + '. ' + p).join('\n');
      report.steps.push(file + ' -> "' + s.title + '" (' + paras.length + ' pasos)');
      changed = true;
    }
  }
  return changed ? join2(secs) : body;
}

function fixLabels(body, file) {
  let n = 0;
  const out = body.split(/\n{2,}/).map((blk) => {
    const m = blk.match(/^([A-ZÁÉÍÓÚÑ][^:\n.*#\[\],]{2,50}):(\s|\n)/);
    if (m && !blk.startsWith('**') && m[1].trim().split(/\s+/).length <= 5) {
      n++;
      return '**' + m[1] + ':**' + blk.slice(m[0].length - m[2].length);
    }
    return blk;
  }).join('\n\n');
  if (n) report.labels.push(file + ' -> ' + n + ' etiquetas en negrita');
  return out;
}

for (const f of walk('src/content')) {
  const raw = readFileSync(f, 'utf8');
  let { head, body } = splitDoc(raw);
  const before = head + body;
  let h2 = head;
  if (h2.includes(' \\\\-"')) { h2 = h2.split(' \\\\-"').join('"'); report.faqMarks.push(f); }
  body = fixWrapper(body, f);
  body = fixDup(body, f);
  body = fixSteps(body, f);
  body = fixLabels(body, f);
  if (/^\[\*\*[^\n]*\n/m.test(body)) report.pending.push(f + ' -> aún hay un bloque [ ... ](url) sin resolver');
  if (/\\\[ \\\]/.test(body)) report.pending.push(f + ' -> casillas "[ ]" sueltas');
  const after = h2 + body;
  if (after !== before) writeFileSync(f, after);
}

const sec = (t, a) => (a.length ? '\n### ' + t + ' (' + a.length + ')\n' + a.map((x) => '- ' + x).join('\n') + '\n' : '');
const md = '# Informe de limpieza de contenido\n' + sec('Bloques [ ](url) convertidos en lista', [...new Set(report.wrapper)]) + sec('Secciones repetidas quitadas', report.dup) + sec('Pasos numerados', report.steps) + sec('Etiquetas en negrita', report.labels) + sec('Marcas sobrantes quitadas en preguntas frecuentes', report.faqMarks) + sec('Pendiente de revisión humana', report.pending);
writeFileSync('scripts/cleanup-report.md', md);
console.log(md);
