const CACHE_NAME = 'tripit-shine-v3';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './favicon.svg',
  './favicon.ico',
  './favicon-16x16.png',
  './favicon-32x32.png',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png',
  './site.webmanifest'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Network-first for HTML, cache-first for assets
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
        return r;
      }).catch(() => caches.match(event.request).then(m => m || caches.match('./index.html')))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(r => {
      // cache successful GETs
      if (r.ok && event.request.method === 'GET' && event.request.url.startsWith(self.location.origin)) {
        const copy = r.clone();
        caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
      }
      return r;
    }))
  );
});
