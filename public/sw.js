const CACHE_NAME = 'cards-app-shell-v2'; // Incrementando a versão do cache
const urlsToCache = [
  '/',
  '/index.html',
  '/placeholder.svg',
  '/manifest.json',
  // Adicione outros recursos estáticos importantes aqui, se houver
];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('[Service Worker] Failed to cache essential assets:', err);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Ignora requisições de extensões ou outros protocolos
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }
      // Fallback to network
      return fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Garante que o Service Worker assuma o controle imediatamente
  event.waitUntil(self.clients.claim());
});