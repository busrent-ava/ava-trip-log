// Caches the app so it opens with no signal. Bump VERSION after changing any file.
const VERSION = 'ava-driver-v2';
const SHELL = ['./', 'index.html', 'config.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Same-origin files: try the network first (so updates arrive), fall back to the saved copy when offline.
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;   // the Apps Script API is never cached
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) {const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy))}
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('index.html')))
  );
});
