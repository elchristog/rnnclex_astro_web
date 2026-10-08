// Configuracion central de rnnclex.com. Cambiar aqui, no en cada pagina.
// rnnclex es un proyecto TOTALMENTE independiente de enfermerausa.com / enfermeraenestadosunidos.com:
// bucket, analitica, pixel, anuncios y SEO propios. No reutilizar IDs de otros proyectos.
export const site = {
  url: 'https://rnnclex.com',
  // GA4 propio de rnnclex.com (propiedad 555401479).
  ga4Id: 'G-QM5PMF11R5',
  // Pixel de Meta propio de rnnclex: conjunto de datos "Datos rnnclex.com" del portafolio Rnnclex (cuenta publicitaria 1580454663293852).
  // NO es el 309464551754526 (ese es de enfermera en Estados Unidos).
  metaPixelId: '2546835659134179',
  // Google Ads propio de rnnclex: cuenta 749-688-7944. Conversiones: registro A8NKCNjZhJYdEMOMuvZE, compra BfkUCNvZhJYdEMOMuvZE.
  googleAdsId: 'AW-18502026819',
  googleAdsLabels: { signup: 'A8NKCNjZhJYdEMOMuvZE', purchase: 'BfkUCNvZhJYdEMOMuvZE' },
  // La web app (Cloud Run): login, registro y pago con Stripe. Ideal: moverla a app.rnnclex.com.
  appBase: 'https://rnnclex-frontend-v2-989579164577.us-central1.run.app/',
  appUrl: 'https://rnnclex-frontend-v2-989579164577.us-central1.run.app/dashboard-user',
  appLoginUrl: 'https://rnnclex-frontend-v2-989579164577.us-central1.run.app/',
  appHosts: ['rnnclex-frontend-v2-989579164577.us-central1.run.app', 'app.rnnclex.com'],
  // Oferta unica
  offer: { price: 19, currency: 'USD', interval: 'mes' },
};
