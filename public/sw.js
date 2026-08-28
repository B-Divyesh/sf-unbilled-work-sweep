const CACHE = '__CACHE_VERSION__';
const BUILT_APP_SHELL = __PRECACHE_ASSETS__;
const SHELL = ['/', '/demo', '/privacy', '/terms', '/offline.html', '/fallback.css', '/manifest.webmanifest', '/favicon.svg', '/icon-192.png', '/icon-512.png', '/assets/paperwork-garden-720.webp', '/assets/paperwork-garden-1200.webp', ...BUILT_APP_SHELL];

self.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL))));
self.addEventListener('activate', (event) => event.waitUntil(Promise.all([caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))), self.clients.claim()])));
self.addEventListener('message', (event) => { if (event.data?.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  event.respondWith(caches.match(event.request, { ignoreVary: true }).then((cached) => cached || fetch(event.request).then((response) => {
    const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(event.request, copy)); return response;
  }).catch(async () => event.request.mode === 'navigate' ? (await caches.match('/', { ignoreVary: true })) || caches.match('/offline.html', { ignoreVary: true }) : Response.error())));
});
