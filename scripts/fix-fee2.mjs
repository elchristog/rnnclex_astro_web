import fs from "node:fs";
import path from "node:path";
const FEB = "1-feb-2027";
const rules = [
  ["la tarifa de $200 para registrarte en el examen NCLEX con Pearson VUE", `la tarifa de registro del examen NCLEX con Pearson VUE (USD 200 antes del ${FEB}; USD 350 desde esa fecha)`],
  ["la tarifa de $200 USD directamente a Pearson VUE", `la tarifa de registro (USD 200 antes del ${FEB}; USD 350 desde esa fecha) directamente a Pearson VUE`],
];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => { const p = path.join(d, e.name); return e.isDirectory() ? walk(p) : p.endsWith(".md") ? [p] : []; });
let n = 0;
for (const f of walk("src/content")) {
  let t = fs.readFileSync(f, "utf8"); const b = t;
  for (const [a, c] of rules) t = t.split(a).join(c);
  if (t !== b) { fs.writeFileSync(f, t); n++; console.log("cambiado", f); }
}
console.log("archivos:", n);
