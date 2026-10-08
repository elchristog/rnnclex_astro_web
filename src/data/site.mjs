// Configuracion central de rnnclex.com. Cambiar aqui, no en cada pagina.
export const site = {
  url: 'https://rnnclex.com',
  // GA4 propio de rnnclex.com (propiedad 555401479). NO usar el de enfermera_en_estados_unidos.
  ga4Id: 'G-QM5PMF11R5',
  // Pixel de Meta. Confirmar que pertenece a rnnclex y no a otro proyecto.
  metaPixelId: '309464551754526',
  // Google Ads: completar con el ID de conversion (formato AW-XXXXXXXXXX) cuando se cree la cuenta/campana.
  googleAdsId: '',
  // La web app (registro, login y pago con Stripe). Ideal: moverla a app.rnnclex.com.
  appUrl: 'https://rnnclex-frontend-v2-989579164577.us-central1.run.app/dashboard-user',
  appHosts: ['rnnclex-frontend-v2-989579164577.us-central1.run.app', 'app.rnnclex.com'],
  // Oferta unica
  offer: { price: 19, currency: 'USD', interval: 'mes' },
};
