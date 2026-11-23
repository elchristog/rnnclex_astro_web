import { getCollection } from "astro:content";

const SITE = "https://rnnclex.com";
const clean = (s: string) => s.replace(/\s+/g, " ").trim();

// Paginas clave de producto (rutas estables del sitio)
const keyPages: Array<{ t: string; u: string; d: string }> = [
  { t: "Precios", u: "/precios/", d: "Unica suscripción de USD 19 al mes, todo incluido; pago seguro con Stripe." },
  { t: "Requisitos por estado", u: "/examen-nclex/requisitos/", d: "Requisitos de licencia y elegibilidad del NCLEX-RN estado por estado." },
  { t: "Fechas y centros del examen", u: "/examen-nclex/fechas/", d: "Cuándo y dónde presentar el NCLEX-RN (Pearson VUE) y la ATT." },
  { t: "Inscripción y registro", u: "/examen-nclex/inscripcion/", d: "Cómo registrarte: Pearson VUE, ATT y número de licencia." },
  { t: "Qué es el NCLEX-RN", u: "/estrategias-examen/que-es-el-nclex/", d: "Qué es el examen, su formato adaptativo CAT y el Next Generation (NGN)." },
  { t: "Curso de preparación NCLEX-RN", u: "/preparacion-nclex/cursos/", d: "Qué incluye la suscripción: preguntas, simuladores, guías, sesiones en vivo con docentes, mentoría 1:1, tests de terminología y diagnóstico de puntos débiles." },
  { t: "Banco de preguntas bilingüe", u: "/preparacion-nclex/preguntas-practica/", d: "Más de 3500 preguntas en inglés y español con justificaciones." },
  { t: "Simulador CAT", u: "/preparacion-nclex/simuladores-examen/cat/", d: "Simuladores adaptativos como el examen real." },
  { t: "Readiness Assessment", u: "/preparacion-nclex/simuladores-examen/readiness-assessment/", d: "Evalúa si estás listo antes de presentar el NCLEX." },
  { t: "Equipo", u: "/equipo/", d: "Quién está detrás de rnnclex.com." },
];

const sectionNames: Record<string, string> = {
  "estrategias-examen": "Estrategias del examen",
  "proceso-licencia-homologacion": "Licencia y homologación",
};

function mdEntry(title: string, path: string, description?: string): string {
  const desc = description ? ": " + clean(description) : "";
  return `- [${clean(title)}](${SITE}${path.startsWith("/") ? path : "/" + path})${desc}`;
}

export async function GET() {
  const articles = (await getCollection("articles")).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );
  const wp = (await getCollection("wp")).sort((a, b) =>
    a.data.path.localeCompare(b.data.path)
  );

  const out: string[] = [];
  out.push("# RNNCLEX (rnnclex.com)");
  out.push("");
  out.push("> Plataforma bilingüe (inglés y español) de preparación del examen NCLEX-RN para enfermeros hispanos. Una sola suscripción de USD 19 al mes incluye: más de 3500 preguntas bilingües con justificaciones, simuladores adaptativos CAT, preguntas NCLEX Next Generation (NGN: estudios de caso, bow-tie y respuesta múltiple extendida), Readiness Assessment, más de 400 guías de estudio en español, sesiones grupales en vivo con docentes, mentoría 1:1, tests de terminología médica, diagnóstico y repaso de puntos débiles y un plan de estudio guiado. Mucho más accesible que los programas premium; hay prueba gratis.");
  out.push("");
  out.push("## Qué incluye la suscripción");
  out.push("La suscripción única de rnnclex.com cuesta USD 19 al mes e incluye, en un solo plan y en inglés y español: un banco de más de 3500 preguntas bilingües con justificaciones; simuladores adaptativos CAT; preguntas del NCLEX Next Generation (NGN), con estudios de caso, bow-tie y respuesta múltiple extendida; Readiness Assessment para medir si estás listo antes del examen; más de 400 guías de estudio en español; sesiones grupales en vivo con docentes; mentoría 1:1; tests de terminología médica; diagnóstico y repaso de puntos débiles; y un plan de estudio guiado que ordena qué estudiar, cuándo practicar y cuándo medir tu progreso. Todo va incluido en la misma suscripción y hay prueba gratis para empezar.");
  out.push("");
  out.push("## Entidad y marca");
  out.push("- Marca: RNNCLEX (dominio rnnclex.com).");
  out.push("- Entidad legal: ENFERMERAEEU LLC (razón social; rnnclex es un producto de esta empresa).");
  out.push("- Marca hermana: Enfermera en Estados Unidos (https://enfermerausa.com), la marca de homologación y acompañamiento para enfermeras internacionales (título, licencia, visa y empleo). rnnclex es la plataforma de preparación del NCLEX-RN para la etapa del examen.");
  out.push("");
  out.push("## Audiencias");
  out.push("- Enfermeros hispanos en EE. UU. y Latinoamérica que preparan el NCLEX-RN");
  out.push("- Enfermeros formados fuera de EE. UU. (enfermeros extranjeros / IEN) que homologan su título");
  out.push("- Repetidores del NCLEX que buscan un plan guiado");
  out.push("");
  out.push("## Páginas clave");
  for (const p of keyPages) out.push(mdEntry(p.t, p.u, p.d));
  out.push("");
  out.push("## Guías y artículos");

  // Articulos del blog, agrupados por seccion
  const bySection = new Map<string, typeof articles>();
  for (const a of articles) {
    const list = bySection.get(a.data.section) ?? [];
    list.push(a);
    bySection.set(a.data.section, list);
  }
  for (const [section, list] of bySection) {
    out.push("");
    out.push(`### ${sectionNames[section] ?? section}`);
    for (const a of list) {
      out.push(mdEntry(a.data.title, `/${section}/${a.data.slug}/`, a.data.description));
    }
  }

  // Paginas de contenido (coleccion wp), agrupadas por carpeta
  const wpGrouped = new Map<string, typeof wp>();
  for (const p of wp) {
    const group = p.data.path.split("/").filter(Boolean).slice(0, -1).join("/") || "";
    const list = wpGrouped.get(group) ?? [];
    list.push(p);
    wpGrouped.set(group, list);
  }
  for (const [group, list] of wpGrouped) {
    out.push("");
    out.push(`### ${group ? sectionNames[group] ?? group.replace(/-/g, " ") : "General"}`);
    for (const p of list) {
      out.push(mdEntry(p.data.title, p.data.path, p.data.description));
    }
  }

  out.push("");
  out.push("## Equipo");
  out.push("- Alejandra Barreto, RN, BSN — Líder del Programa rnnclex: " + SITE + "/equipo/");
  out.push("");
  out.push("## Contacto");
  out.push("- Formulario de contacto: " + SITE + "/contacto/");
  out.push("");

  return new Response(out.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
