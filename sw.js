const V = 'ptk-dash-v458', LOCAL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
const CDN = ['cdn.tailwindcss.com', 'cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com', 'unpkg.com', 'tile.openstreetmap.org'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => Promise.all(LOCAL.map(u => c.add(u).catch(() => { })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
const keep = (req, r) => { if (r && (r.ok || r.type === 'opaque')) { const c = r.clone(); caches.open(V).then(ch => ch.put(req, c)).catch(() => { }); } return r; };
self.addEventListener('fetch', e => {
  const q = e.request, u = new URL(q.url);
  if (q.method !== 'GET') return;
  if (u.origin === location.origin) {                       // l'application : réseau d'abord (mises à jour), cache en secours
    e.respondWith(fetch(q).then(r => keep(q, r)).catch(() => caches.match(q).then(r => r || caches.match('index.html'))));
  } else if (CDN.includes(u.hostname)) {                    // bibliothèques : cache d'abord, mise à jour en arrière-plan
    e.respondWith(caches.match(q).then(c => { const n = fetch(q).then(r => keep(q, r)).catch(() => c); return c || n; }));
  }                                                          // tout le reste (Firebase…) : non intercepté
});
