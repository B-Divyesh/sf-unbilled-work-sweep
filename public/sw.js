const CACHE = 'unbilled-work-sweep-v1';
const SHELL = ['/', '/demo', '/privacy', '/terms', '/offline.html', '/manifest.webmanifest', '/favicon.svg', '/icon-192.png', '/icon-512.png', '/assets/paperwork-garden-720.webp', '/assets/paperwork-garden-1200.webp'];

self.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL))));
self.addEventListener('activate', (event) => event.waitUntil(Promise.all([caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))), self.clients.claim()])));
self.addEventListener('message', (event) => { if (event.data?.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(event.request, copy)); return response;
  }).catch(async () => event.request.mode === 'navigate' ? (await caches.match('/')) || caches.match('/offline.html') : Response.error())));
});
