// Configuracion central de rnnclex.com. Cambiar aqui, no en cada pagina.
// rnnclex es un proyecto TOTALMENTE independiente de enfermerausa.com / enfermeraenestadosunidos.com:
// bucket, analitica, pixel, anuncios y SEO propios. No reutilizar IDs de otros proyectos.
export const site = {
  url: 'https://rnnclex.com',
  // GA4 propio de rnnclex.com (propiedad 555401479).
  ga4Id: 'G-QM5PMF11R5',
  // Pixel de Meta propio de rnnclex. VACIO a proposito: el 309464551754526 es de enfermera en Estados Unidos.
  // Crear el pixel en el Business Manager de rnnclex y pegar aqui su ID; hasta entonces no se carga Meta.
  metaPixelId: '',
  // Google Ads propio: completar con AW-XXXXXXXXXX cuando se cree la cuenta de rnnclex.
  googleAdsId: '',
  // La web app (registro, login y pago con Stripe). Ideal: moverla a app.rnnclex.com.
  appUrl: 'https://rnnclex-frontend-v2-989579164577.us-central1.run.app/dashboard-user',
  appHosts: ['rnnclex-frontend-v2-989579164577.us-central1.run.app', 'app.rnnclex.com'],
  // Oferta unica
  offer: { price: 19, currency: 'USD', interval: 'mes' },
};
