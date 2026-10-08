# Lanzamiento de rnnclex.com en Astro

Documento de trabajo. Se actualiza en cada PR. El control automatico esta en `scripts/verify-parity.mjs` y la lista de paginas en `migration/urls.json`.

## 1. Reglas que no se rompen

1. **Mismas URLs que hoy en WordPress (92).** Con `trailingSlash: 'always'`. Los articulos viven en `/estrategias-examen/<slug>/` y `/proceso-licencia-homologacion/<slug>/`, NO en `/blog/posts/...`. Si una URL tiene que cambiar, se anota aqui y se redirige con 301 en Cloudflare (Bulk Redirects). Las redirecciones por meta-refresh no cuentan.
2. **Solo contenido de rnnclex.** Hoy el repo trae paginas, articulos e imagenes de enfermerausa.com. Duplicar contenido entre dos dominios propios hace que Google los compita entre si. Antes del corte hay que eliminarlos (lista en la seccion 5).
3. **Un solo GA4 (`G-QM5PMF11R5`) y un solo pixel de Meta**, configurados en `src/data/site.mjs` y cargados una vez por `Tracking.astro`.
4. **Una sola oferta: suscripcion mensual de USD 19.** Todo CTA lleva a la app. Sin planes de 30/90/180 dias, sin WhatsApp como via de compra, sin cifras de competidores que no esten verificadas.
5. **No se publica con errores.** Antes del corte se activa `PARITY_STRICT=true` (Settings > Secrets and variables > Variables) y el workflow bloquea cualquier publicacion que tenga paginas faltantes, titulos/descripciones/H1/canonical incorrectos o restos de otro sitio.

## 2. Mensaje y embudo

Embudo: **Buscador / anuncio -> pagina de aterrizaje -> /precios/ -> registro en la app -> pago con Stripe (USD 19/mes).**

Pilares de mensaje (en este orden):
1. Preparacion completa **bilingue** (ingles + espanol) hecha para enfermeros hispanos.
2. Banco de +3500 preguntas, simuladores CAT y **NCLEX Next Generation (NGN)**.
3. **Preparacion guiada**, no solo banco de preguntas.
4. **USD 19 al mes**, mucho mas accesible que Archer Review, UWorld o Bootcamp (comparar solo con precios verificados y fecha).

Cada pagina de captacion (requisitos por estado, fechas, costo, CGFNS, ATT) termina con un unico bloque: *"Practica con la plataforma bilingue por USD 19/mes"* -> boton a la app.

## 3. Medicion

La app (otro dominio) es donde ocurren el registro y la compra, asi que **esos eventos los debe enviar la app**; el sitio solo mide el interes y pasa la atribucion.

| Evento | Donde ocurre | GA4 | Meta | Google Ads |
|---|---|---|---|---|
| Pagina vista | Sitio | `page_view` | `PageView` | etiqueta global |
| Ve precios | Sitio | `view_pricing` | `ViewContent` | (audiencia) |
| Clic hacia la app | Sitio | `cta_click` | `CTAClick` (personalizado) | (audiencia) |
| Cuenta creada | App | `sign_up` | `CompleteRegistration` | conversion importada de GA4 |
| Inicia pago | App | `begin_checkout` | `InitiateCheckout` | opcional |
| Suscripcion pagada | App + Stripe | `purchase` (value 19, USD) | `Subscribe` o `Purchase` | conversion importada de GA4 / carga offline |

Puntos tecnicos:
- **Cross-domain:** `Tracking.astro` ya activa el *linker* de GA4 hacia los hosts de `appHosts`. En GA4 > Admin > Flujo de datos > Configurar ajustes de etiqueta > Configurar dominios, agregar tambien el dominio de la app. Lo ideal es mover la app a `app.rnnclex.com` (mismo dominio raiz, menos perdida de atribucion y cookies).
- **Atribucion:** `rnn-events.js` guarda `utm_*`, `gclid`, `gbraid`, `wbraid` y `fbclid` en el navegador y los agrega al enlace hacia la app (`rnn_lp`, `rnn_from` ademas). La app debe guardarlos al crear la cuenta.
- **La compra debe medirse desde el servidor:** el evento `purchase` hay que enviarlo desde el webhook de Stripe (`invoice.paid` / `checkout.session.completed`), no desde el navegador, porque bloqueadores y cierres de pestana pierden compras. Enviar: (a) GA4 por Measurement Protocol con el `client_id` y `session_id` guardados al registrarse, (b) Meta Conversions API con `fbp`, `fbc` y el mismo `event_id` que el navegador para evitar duplicados, (c) Google Ads: importar `purchase` desde GA4 o subir la conversion con `gclid`.
- **Una suscripcion = una compra por cobro nuevo.** Las renovaciones mensuales se envian con otro nombre (`subscription_renewal`) para no inflar las compras nuevas.
- Marcar como eventos clave en GA4: `sign_up`, `begin_checkout`, `purchase`, `cta_click`.

## 4. Corte de dominio (en este orden)

1. Crear el bucket `rnnclex.com` (misma region que el de enfermerausa), acceso publico de lectura, sitio web `index.html` / `404.html`. El dominio ya esta verificado en Search Console con la misma cuenta de Google.
2. Dar a `github-deploy@company-data-driven.iam.gserviceaccount.com` el rol *Storage Object Admin* sobre ese bucket y permitir el repo `elchristog/rnnclex_astro_web` en el Workload Identity Pool `github-deployments`.
3. Primera publicacion desde GitHub Actions al bucket. Probar el sitio nuevo en una URL temporal antes de tocar el DNS.
4. Bajar el TTL del DNS actual a 300 s con 24 h de anticipacion.
5. En Cloudflare: agregar la zona `rnnclex.com`, copiar los registros actuales (incluido correo MX/SPF/DKIM) y **cambiar los servidores de nombres en Squarespace Domains** a los de Cloudflare.
6. Registro `CNAME rnnclex.com -> c.storage.googleapis.com` con proxy activado (nube naranja). Regla para `www` -> `rnnclex.com` (301). Cloudflare en modo SSL *Flexible* (GCS por CNAME solo sirve HTTP).
7. Redirecciones 301 de cualquier URL que haya cambiado. `/login/` -> app.
8. Verificar en vivo las 92 URLs, `sitemap-index.xml`, `robots.txt` y la medicion en GA4 Tiempo real. Reenviar el sitemap en Search Console.
9. **Mantener la VM de WordPress apagada pero no borrada 30 dias** (con un snapshot del disco). Solo despues de 30 dias sin problemas se elimina. Rollback: volver a apuntar el CNAME a la IP de la VM.
10. Vigilar Search Console 14 dias. Alerta: si las impresiones caen mas de 30% durante 3 dias seguidos, hay URLs mal migradas.

## 5. Archivos heredados de enfermerausa que hay que quitar antes del corte

Paginas: `evaluacion-y-homologacion-de-titulo-enfermeria-usa`, `licencia-de-enfermeria-y-examen-nclex-usa`, `ofertas-de-empleo-para-enfermeras-en-usa`, `proceso-de-visa-y-relocalizacion-para-enfermeras`, `salarios-de-enfermeros-en-estados-unidos`, `sesion-informativa`, `validar-enfermeria-en-usa`, `[...legacy].astro`.

Datos: `src/data/legacy-redirects.mjs` (mapea URLs de otro dominio) y `public/js/calendly-reservation-tracking.js`.

Articulos de `src/content/posts/` que no son de rnnclex: visa EB-3, salarios, dia de una enfermera, costo del proceso en EE. UU., homologacion en Colombia/Mexico, etc. Los articulos reales de rnnclex son los 12 de `migration/urls.json`.

## 6. Pendiente de definir

- Confirmar que el pixel `309464551754526` es de rnnclex.
- Confirmar la clave del pixel de Ryze en `BaseLayout.astro` (`px.get-ryze.ai`) para este espacio.
- Paginas que no existen en WordPress y conviene crear: West Virginia y Wyoming (faltan para cubrir los 50 estados).
- Mover la app a `app.rnnclex.com`.
