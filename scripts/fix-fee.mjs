// Temporal: aclara la tarifa de registro del NCLEX (USD 200 antes del 1-feb-2027; USD 350 desde esa fecha).
// Reemplazos exactos; no toca lineas que ya mencionan la fecha.
import fs from "node:fs";
import path from "node:path";

const ROOT = "src/content";
const FEB = "1-feb-2027";

const rules = [
  // Readiness (articulo)
  ["antes de que gastes los $200 de la tarifa de Pearson VUE", `antes de que pagues la tarifa de registro de Pearson VUE (USD 200 si te registras antes del ${FEB}; USD 350 desde esa fecha)`],
  ["las detectara Pearson VUE por $200.", `las detectara Pearson VUE al costo de otra tarifa de registro (USD 200 antes del ${FEB}; USD 350 desde esa fecha).`],
  ["si pagas los $200 del intento", `si pagas la tarifa de registro del intento (USD 200 antes del ${FEB}; USD 350 desde esa fecha)`],
  // Que es el NCLEX
  ["La tarifa de Pearson VUE es de USD 200", `La tarifa de registro de Pearson VUE es de USD 200 si te registras antes del ${FEB} (USD 350 desde esa fecha)`],
  ["La tarifa de Pearson VUE es de **USD 200**", `La tarifa de registro de Pearson VUE es de **USD 200 si te registras antes del ${FEB}** (USD 350 desde esa fecha; cuenta la fecha de registro, no la del examen)`],
  // Cuantas veces
  ["Cada intento cuesta $200 USD con Pearson VUE", `Cada intento cuesta USD 200 con Pearson VUE si te registras antes del ${FEB} (USD 350 desde esa fecha)`],
  ["pagar la tarifa del examen de $200 USD.", `pagar la tarifa de registro: USD 200 si te registras antes del ${FEB}; USD 350 desde esa fecha.`],
  ["**$200 USD por cada intento.**", `**USD 200 por cada intento si te registras antes del ${FEB}; USD 350 desde esa fecha.**`],
  // Como pasar
  ["la tarifa de $200 por re-examen", `la tarifa de registro por re-examen (USD 200 antes del ${FEB}; USD 350 desde esa fecha)`],
  ["un cargo accidental de $200 en tu tarjeta", `un cargo accidental en tu tarjeta (la tarifa de registro: USD 200 antes del ${FEB}; USD 350 desde esa fecha)`],
  // Extranjeros
  ["($200 por intento)", `(USD 200 por intento si te registras antes del ${FEB}; USD 350 desde esa fecha)`],
  ["tarifa Pearson de $200,", `tarifa Pearson (USD 200 antes del ${FEB}; USD 350 desde esa fecha),`],
  // CGFNS
  ["en Pearson VUE** ($200)", `en Pearson VUE** (USD 200 antes del ${FEB}; USD 350 desde esa fecha)`],
  // ATT
  ["pagar otra vez los $200.", `pagar otra vez la tarifa de registro (USD 200 antes del ${FEB}; USD 350 desde esa fecha).`],
  ["($200 USD por intento, tarjeta", `(USD 200 por intento si te registras antes del ${FEB}, USD 350 desde esa fecha; tarjeta`],
  ["para pagar los $200: el registro", "para pagar la tarifa: el registro"],
  ["otros $200 + mínimo 45 días", `otra tarifa de registro (USD 200 antes del ${FEB}; USD 350 desde esa fecha) + mínimo 45 días`],
  // Homologar
  ["Registro Pearson ($200)", `Registro Pearson (USD 200 antes del ${FEB}; USD 350 desde esa fecha)`],
  ["NCLEX $200 (+~$150", `NCLEX USD 200 antes del ${FEB}, USD 350 desde esa fecha (+~$150`],
  // Plan 8 semanas
  ["Reprobar cuesta $200 y 45 días.", `Reprobar cuesta otra tarifa de registro (USD 200 antes del ${FEB}; USD 350 desde esa fecha) y 45 días.`],
  // Paginas wp (cursos, app, libros, videos)
  ["$200 USD para", `USD 200 antes del ${FEB} (USD 350 desde esa fecha) para`],
  // Paginas de estados
  ["paga la tarifa de $200.", `paga la tarifa de registro: $200 si te registras antes del ${FEB} ($350 desde esa fecha).`],
  // Titulo y descripcion de /que-es-el-nclex/ (aprobado por el cliente)
  ["seoTitle: \"¿Qué es el NCLEX-RN? Guía en español (2026)\"", "seoTitle: \"NCLEX en español: qué es el NCLEX-RN y cómo funciona (2026)\""],
  ["description: \"¿Qué es el NCLEX-RN? Es el examen para obtener tu licencia de enfermería en EE. UU. Formato CAT y NGN, 85 a 150 preguntas, costo y cómo prepararte en español.\"", "description: \"NCLEX en español: qué es el NCLEX-RN, el examen para tu licencia de enfermería en EE. UU. Formato CAT y NGN, 85 a 150 preguntas, costo y cómo prepararte.\""],
];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : p.endsWith(".md") ? [p] : [];
  });
}

const changedFiles = [];
const counts = new Map();
for (const file of walk(ROOT)) {
  let text = fs.readFileSync(file, "utf8");
  const before = text;
  for (const [from, to] of rules) {
    if (text.includes(from)) {
      const n = text.split(from).length - 1;
      counts.set(from, (counts.get(from) || 0) + n);
      text = text.split(from).join(to);
    }
  }
  if (text !== before) {
    fs.writeFileSync(file, text);
    changedFiles.push(file);
  }
}

console.log(`Archivos cambiados: ${changedFiles.length}`);
for (const f of changedFiles) console.log(" -", f);
for (const [from] of rules) console.log(`${counts.get(from) || 0}x  ${from.slice(0, 70)}`);

// Informe de lo que sigue diciendo 200 sin aclarar la fecha
const left = [];
for (const file of walk(ROOT)) {
  fs.readFileSync(file, "utf8").split("\n").forEach((line, i) => {
    if (/\$\s?200|USD\s?200/.test(line) && !line.includes("1-feb") && !line.includes("350")) left.push(`${file}:${i + 1}`);
  });
}
fs.writeFileSync("scripts/fee-fix-left.txt", left.join("\n") + "\n");
console.log(`Lineas con 200 sin fecha: ${left.length}`);
