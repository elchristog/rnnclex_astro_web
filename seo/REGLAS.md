# Reglas comunes de las tareas SEO mensuales de rnnclex.com

Fuente unica. Cada tarea mensual la lee primero. El Optimizador (dia 28) la mantiene. Si no puedes leerla, detente y avisa.

## Operacion
- Autonomia total: abre PR, fusiona (squash) y verifica sin pedir confirmacion. Excepcion: borrar paginas o archivos solo con lista aprobada por el dueno (nunca borres; fusiona, redirige o propone).
- Sitio: solo el repo elchristog/rnnclex_astro_web (rama main). El workflow 'Publicar sitio' publica en gs://rnnclex.com. WordPress esta retirado.
- Antes de editar: lista PR abiertos y el ultimo run. Fusiona los ryze/* en verde o espera max 10 min. Rama ryze/<tarea>-<fecha> desde el SHA actual de main. Un PR por ejecucion.
- Verificacion: tras el merge espera el run 'Publicar sitio' en success (revisa cada 60 s, max 10 min) y abre la URL en vivo con ?v=<timestamp>. Sin verlo en vivo no esta hecho. Si falla, corrige en un PR nuevo.
- Estado compartido: seo/plan.json (items planned / in_progress / published / merged, edits[], indexation[], backlinks, cannibalization). No repitas items in_progress ni published.

## Marca y oferta
- Oferta unica: suscripcion de USD 19/mes, comprada en la web app https://rnnclex-frontend-v2-989579164577.us-central1.run.app/dashboard-user . CTA a /precios/.
- Sin precios de competidores; sin promesas de aprobacion garantizada; sin enlaces ni botones de WhatsApp.
- Voz: espanol, 'tu', alentadora, datos concretos (+3500 preguntas, CAT, NGN, bilingue).
- Firma de articulos: Alejandra Barreto, RN, BSN, Lider del Programa (enlaza a /equipo/). Alejandra Martinez no es autora. Bingley Ortiz y Andres Cruz ya no trabajan aqui: no deben aparecer en ningun sitio.
- rnnclex es independiente de enfermerausa.com y enfermeraenestadosunidos.com: no uses sus cuentas, remitentes, pixeles ni contenido.
- Redes oficiales: youtube.com/@rnnclex-usa, instagram.com/rnnclex.usa, facebook.com/rnnclex.usa, tiktok.com/@rnnclex.com, linkedin.com/company/rnnclex-com.
- 7 palabras objetivo: nclex, examen nclex, nclex rn, cgfns, fechas examen nclex, cuanto cuesta el nclex, requisitos nclex.

## Datos y limites conocidos
- GSC: sc-domain:rnnclex.com. GA4: propiedad 555401479 (G-QM5PMF11R5). Excluye de las decisiones las fechas de prueba 8 y 11 oct 2026. signup esta inflado (335 eventos para 92 usuarios): no lo uses si el ratio supera 1,3.
- Meta del dueno: 150-250 clics organicos por 28 dias. Base de marca 2026-10-12: 0 impresiones de 'rnnclex'; Google corrige a 'rn nclex'.
- Las redirecciones del sitio son paginas HTML (Astro redirects), no 301 reales; un 301 real requiere regla de Cloudflare (la crea el dueno).
- Google no permite subir el archivo disavow por API. La herramienta de GA4 es de solo lectura (marcar key events es manual).
- Semrush no esta conectado: el dueno sube informes mensuales a seo/semrush/ (no los modifiques). Un volumen en ingles no es volumen en espanol.
- Instantly: remitente permitido hello@rnnclex.com, solo con calentamiento activo y puntaje >=90. Nunca el remitente de Enfermera en Estados Unidos. No toques otras campanas. Pausa solo la tuya si el rebote supera 5%.
- No hay herramienta para publicar en YouTube, foros o comunidades: se prepara el borrador.

## Ahorro de creditos (aplica siempre)
- Lee solo lo necesario. No recorras el repo entero: usa seo/*.json como memoria y no repitas consultas ya registradas este mes.
- Muestras, no universos: auditar <=40 URLs (mas impresiones + nuevas + corregidas), imagenes <=30 por ejecucion, APIs con limit <=50.
- Si un paso no tiene datos o cambios, escribe 'sin cambios' y sigue. No inventes trabajo.
- Un solo PR y un solo despliegue por ejecucion. Verifica por muestra (3 URLs) salvo cambios criticos.
- Email en espanol, corto, para un dueno no tecnico: lo hecho, verificacion, maximo 1 punto humano.

## Calendario mensual (hora de Nueva York, 4:00; un dia por tarea, no se solapan)
- Dia 1: SEO MENSUAL 1 - Investigacion (palabras clave, competencia, IA, clusteres).
- Dia 3: SEO MENSUAL 2 - Publicacion.
- Dia 8: SEO MENSUAL 3 - Optimizacion de paginas, CRO, E-E-A-T.
- Dia 12: SEO MENSUAL 4 - Tecnico (schema, canonical, llms.txt, robots, GA4, velocidad, imagenes).
- Dia 16: SEO MENSUAL 5 - Linkbuilding y menciones.
- Dia 24: SEO MENSUAL 6 - Auditoria y reporte.
- Dia 28: OPTIMIZADOR MENSUAL - revisa y mejora las demas.
- Dia 2: VENTAS MENSUAL (app, embudo, Instantly, retencion) y dia 5: ADS MENSUAL (Meta y Google). Estas dos leen la memoria 'perfil de comprador' y la actualizan; el SEO tambien debe leerla (que paginas y palabras traen registros y compradores) antes de priorizar el dia 1, 3 y 8.
- Limites para no solaparse: la web app (rnnclex-api) y Instantly de activacion son de VENTAS; los anuncios son de ADS; el sitio Astro es SEO. Las campanas administradas por Ryze las revisa su propio agente de campana: ni VENTAS ni SEO tocan presupuestos ni anuncios.

## Cobertura: requisito del dueno -> tarea responsable
- Lote inicial de 30 articulos firmados por una persona real; titulos, metas, H2/H3, FAQ, enlaces internos a la pagina objetivo -> Publicacion (2).
- Intercambio de enlaces (1 por cada 3 articulos) -> Publicacion (2).
- Canibalizacion -> Publicacion (2) antes de escribir y Optimizacion (3).
- Clusteres tematicos -> Investigacion (1) detecta; Publicacion (2) crea el pilar.
- Pagina estancada con CTR bajo y metadatos prioritarios -> Optimizacion (3).
- CRO, embudo y cambios de diseno -> Optimizacion (3).
- E-E-A-T (persona experta en Quienes somos) -> Optimizacion (3).
- Schema (autor, FAQPage, enlace a pagina objetivo) y tipos erroneos -> Tecnico (4).
- Canonical con y sin barra final -> Tecnico (4).
- llms.txt -> Tecnico (4).
- robots.txt y rastreadores de IA -> Tecnico (4).
- Eventos clave GA4 de registro y compra -> Tecnico (4).
- Velocidad, Core Web Vitals e imagenes (peso, WebP, ALT) -> Tecnico (4).
- Guest posts y notas de prensa; outreach con Instantly (12 prospectos al mes, un seguimiento a los 14 dias); depuracion del perfil de enlaces; menciones en YouTube y comunidades -> Linkbuilding (5).
- Expansion de palabras clave; analisis de competencia; auditoria de visibilidad en IA (10 consultas) -> Investigacion (1).
- Auditoria GSC (404, soft-404, indexacion, marcado enriquecido, sitemap); redirecciones; monitoreo de publicacion; verificacion en vivo; control de indexacion a 7 dias; reporte vs 4 semanas previas de las 7 palabras; paginas de interes; eventos organicos; seguimiento de la marca rnnclex -> Auditoria y reporte (6).
- Optimizar las propias tareas y minimizar creditos -> Optimizador (7).
