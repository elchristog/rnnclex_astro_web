// Revisa que los sitios oficiales de las juntas de enfermeria (src/data/states.mjs) sigan respondiendo.
// Solo informa (anotaciones de advertencia): algunos sitios bloquean bots aunque funcionen en el navegador.
import { states } from '../src/data/states.mjs';

const UA = 'Mozilla/5.0 (compatible; RnnclexLinkCheck/1.0)';
const bad = [];

async function check(s) {
  try {
    const r = await fetch(s.url, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
      headers: { 'user-agent': UA, accept: 'text/html' },
    });
    if (r.status >= 400) bad.push(s.name + ': ' + s.url + ' -> ' + r.status);
  } catch (e) {
    bad.push(s.name + ': ' + s.url + ' -> ' + (e && e.name ? e.name : 'error'));
  }
}

const queue = [...states];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (queue.length) await check(queue.shift());
  })
);

console.log('Enlaces de juntas revisados: ' + states.length + ' | con problema: ' + bad.length);
for (const b of bad) {
  console.log('::warning title=Enlace de junta::' + b);
}
