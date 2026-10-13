// Doku-Fix Service Worker: App-Dateien zwischenspeichern, damit sie ohne Netz starten.
// Strategie: erst Netz (neue Version kommt an), bei fehlendem Netz die gespeicherte Datei.
const CACHE = 'doku-fix-v9';
const DATEIEN = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(DATEIEN)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r).then(antwort => {
      if (antwort.ok) { const kopie = antwort.clone(); caches.open(CACHE).then(c => c.put(r, kopie)); }
      return antwort;
    }).catch(() => caches.match(r, { ignoreSearch: true }).then(g => g || (r.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});
