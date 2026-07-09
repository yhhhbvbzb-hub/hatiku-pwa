// Service Worker para Hatiku Furniture Design PWA
const CACHE_NAME = 'hatiku-v1';
const urlsToCache = [
  './hatiku-furniture-calculator.html',
  './manifest.json'
  // Nota: Los CDNs de Tailwind, jsPDF y Font Awesome se cachean automáticamente por el navegador
  // en la mayoría de los casos cuando se visita la página.
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Eliminando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si está en caché, devolverlo
        if (response) {
          return response;
        }
        
        // Si no está en caché, intentar fetch normal
        return fetch(event.request).then((fetchResponse) => {
          // Solo cachear respuestas válidas
          if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
            return fetchResponse;
          }

          // Clonar la respuesta para guardarla en caché
          const responseToCache = fetchResponse.clone();
          
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return fetchResponse;
        }).catch(() => {
          // Si falla el fetch (sin internet), devolver la página principal si es navegación
          if (event.request.mode === 'navigate') {
            return caches.match('./hatiku-furniture-calculator.html');
          }
        });
      })
  );
});
