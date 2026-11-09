// Rad-Fix: eigener Service Worker, damit die App offline startet.
// Erst Netz (neue Fassung kommt an), ohne Netz die gespeicherte Datei.
const CACHE = 'radfix-v1';
const KERN = ['./', './index.html', './app.js', './fonts/outfit-latin-wght-normal.woff2', './manifest.webmanifest', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(KERN)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('radfix-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(fetch(r.mode === 'navigate' ? r.url : r, { cache: 'no-cache' }).then(a => {
    if (a.ok) { const k = a.clone(); caches.open(CACHE).then(c => c.put(r, k)); } return a;
  }).catch(() => caches.match(r, { ignoreSearch: true }).then(g => g || (r.mode === 'navigate' ? caches.match('./index.html') : undefined))));
});
