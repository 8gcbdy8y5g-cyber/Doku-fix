// Winkelmessung: eigener Service Worker, damit die App offline startet.
// Erst Netz (neue Fassung kommt an), ohne Netz die gespeicherte Datei.
const CACHE = 'winkel-v3';
const KERN = ['./', './index.html', './kern.js', './katalog.js', './app.js', './erkennung.js', './anleitung.js', './anleitung3d.js', './figur3.js',
  './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png',
  './mp/vision_bundle.mjs', './mp/wasm/vision_wasm_module_internal.js', './mp/wasm/vision_wasm_module_internal.wasm',
  './mp/wasm/vision_wasm_internal.js', './mp/wasm/vision_wasm_internal.wasm', './mp/pose_landmarker_full.task.wasm', './mp/hand_landmarker.task.wasm'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(KERN)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('winkel-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  const gross = /\.(wasm)$/.test(new URL(r.url).pathname);
  /* Große Modelldateien zuerst aus dem Speicher, alles andere zuerst aus dem Netz */
  if (gross) { e.respondWith(caches.match(r).then(g => g || fetch(r).then(a => { if (a.ok) { const k = a.clone(); caches.open(CACHE).then(c => c.put(r, k)); } return a; }))); return; }
  e.respondWith(fetch(r.mode === 'navigate' ? r.url : r, { cache: 'no-cache' }).then(a => {
    if (a.ok) { const k = a.clone(); caches.open(CACHE).then(c => c.put(r, k)); } return a;
  }).catch(() => caches.match(r, { ignoreSearch: true }).then(g => g || (r.mode === 'navigate' ? caches.match('./index.html') : undefined))));
});
