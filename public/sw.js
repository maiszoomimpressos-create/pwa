const CACHE_NAME = 'cards-app-shell-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/placeholder.svg',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  // Força o Service Worker a pular o estado de espera e ativar imediatamente
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
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
  // Assume o controle dos clientes imediatamente
  event.waitUntil(self.clients.claim());
  
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
});