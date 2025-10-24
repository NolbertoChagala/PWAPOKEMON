const CACHE_NAME = 'pokepwa-v1';
const RUNTIME = 'runtime';

// Recursos a pre-cachear
const PRECACHE_URLS = [
  '/',
  'index.html',
  'manifest.json',
  'logo192.png',
  'logo512.png'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME, RUNTIME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Estrategia de cache para imágenes de Pokemon
const handlePokemonImage = (request) => {
  return caches.match(request).then(response => {
    if (response) return response;

    return fetch(request).then(response => {
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }

      const responseToCache = response.clone();
      caches.open(RUNTIME).then(cache => {
        cache.put(request, responseToCache);
      });

      return response;
    });
  });
};

// Manejo de peticiones
self.addEventListener('fetch', event => {
  // Si la petición es para una imagen de Pokemon
  if (event.request.url.includes('pokeapi.co/api/v2/pokemon')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) return response;

        return fetch(event.request).then(response => {
          // Clonar la respuesta antes de cachearla
          const responseToCache = response.clone();

          caches.open(RUNTIME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
    );
  }
  // Si la petición es para una imagen
  else if (event.request.url.includes('raw.githubusercontent.com') || 
           event.request.destination === 'image') {
    event.respondWith(handlePokemonImage(event.request));
  }
  // Para el resto de las peticiones
  else {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) return cachedResponse;

        return caches.open(RUNTIME).then(cache => {
          return fetch(event.request).then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  }
});