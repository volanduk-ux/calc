const CACHE = 'magic-calc-v5';
const ASSETS = ['./', './index.html?v=5', './manifest.json?v=5'];
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
function isHTML(req){ return req.mode === 'navigate' || (req.headers.get('accept')||'').includes('text/html'); }
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (isHTML(req)) {
    e.respondWith(fetch(req).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
      return resp;
    }).catch(() => caches.match(req, {ignoreSearch:true}).then(r => r || caches.match('./index.html?v=5'))));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
self.addEventListener('message', (e) => { if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });
