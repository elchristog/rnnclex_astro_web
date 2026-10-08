// Eventos del sitio de marketing y traspaso de atribucion hacia la web app.
// El registro y la compra (Stripe) ocurren en la app: ver docs/LANZAMIENTO.md seccion 3.
(function () {
  var cfg = window.RNN || {};
  var KEY = 'rnn_attr';
  var PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid', 'fbclid'];

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; }
  }
  function write(v) {
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {}
  }
  function once(name) {
    var k = 'rnn_ev_' + name;
    try {
      if (sessionStorage.getItem(k)) return false;
      sessionStorage.setItem(k, '1');
    } catch (e) {}
    return true;
  }
  function ga(name, params) {
    if (typeof gtag === 'function') gtag('event', name, params || {});
  }
  function fb(name, params, custom) {
    if (typeof fbq === 'function') fbq(custom ? 'trackCustom' : 'track', name, params || {});
  }

  // 1) Recordar de que anuncio o busqueda llego la persona
  var q = new URLSearchParams(location.search);
  var found = {};
  PARAMS.forEach(function (p) { if (q.get(p)) found[p] = q.get(p); });
  var store = read();
  if (Object.keys(found).length) {
    if (!store.first) store.first = found;
    store.last = found;
    if (!store.landing) store.landing = location.pathname;
    write(store);
  }

  // 2) Vista de la pagina de precios (una vez por visita)
  if (location.pathname.indexOf('/precios') === 0 && once('view_pricing')) {
    ga('view_pricing', { value: cfg.price, currency: cfg.currency });
    fb('ViewContent', { content_name: 'Suscripcion mensual NCLEX', value: cfg.price, currency: cfg.currency });
  }

  // 3) Clics hacia la app: medir y pasar la atribucion en el enlace
  function isApp(href) {
    try {
      var u = new URL(href, location.href);
      return (cfg.appHosts || []).indexOf(u.hostname) > -1;
    } catch (e) { return false; }
  }
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || !isApp(a.href)) return;

    var s = read();
    var attr = s.last || {};
    try {
      var u = new URL(a.href);
      Object.keys(attr).forEach(function (k) { u.searchParams.set(k, attr[k]); });
      if (s.landing) u.searchParams.set('rnn_lp', s.landing);
      u.searchParams.set('rnn_from', location.pathname);
      a.href = u.toString();
    } catch (err) {}

    var text = (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
    ga('cta_click', { cta_text: text, cta_page: location.pathname, destination: 'app' });
    fb('CTAClick', { cta_text: text, page: location.pathname }, true);
  }, true);
})();
