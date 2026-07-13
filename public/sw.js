const CACHE_NAME = 'connect-local-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  // Network-first strategy: always fetch live data if online, fallback to cache if offline
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse.ok) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // If offline and request fails, serve from cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;
        
        // If navigation request fails and not in cache, fallback to index
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});
