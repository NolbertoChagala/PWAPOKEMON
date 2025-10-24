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
  // Navigation requests: serve cached index.html so the SPA loads offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('index.html').then(cachedIndex => {
        return cachedIndex || fetch(event.request).then(response => {
          // If online, update the cache with the latest index.html
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put('index.html', copy));
          }
          return response;
        }).catch(() => {
          // If offline and no cached index, try to return root cached
          return caches.match('/');
        });
      })
    );
    return;
  }

  // If the request is for a Pokemon API JSON (metadata), cache it (runtime)
  if (event.request.url.includes('pokeapi.co/api/v2/pokemon')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) return response;
        return fetch(event.request).then(response => {
          // Cache responses even if they are CORS/opaque (external images handled below)
          try {
            const responseToCache = response.clone();
            caches.open(RUNTIME).then(cache => {
              try { cache.put(event.request, responseToCache); } catch(e) { /* ignore */ }
            });
          } catch (e) {
            // ignore cloning/cache errors
          }
          return response;
        }).catch(() => {
          // If offline and we have a cached metadata JSON, return it
          return caches.match(event.request).then(cached => {
            if (cached) return cached;
            // Return a JSON 503 response so the client can handle it gracefully
            return new Response(JSON.stringify({ error: 'offline', message: 'No network and no cached data' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        });
      })
    );
    return;
  }

  // Images (including cross-origin sprites hosted on raw.githubusercontent) should be cached
  if (event.request.destination === 'image' || event.request.url.includes('raw.githubusercontent.com')) {
    event.respondWith(handlePokemonImage(event.request));
    return;
  }

  // Default: try cache first, then network, and cache successful responses.
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return caches.open(RUNTIME).then(cache => {
        return fetch(event.request).then(response => {
          // Allow caching of successful responses including CORS/opaque types.
          if (response && (response.status === 200 || response.type === 'opaque' || response.type === 'cors')) {
            try {
              cache.put(event.request, response.clone());
            } catch (e) {
              // Some requests (e.g. chrome-extension://) can't be cached; ignore silently.
            }
          }
          return response;
        }).catch(() => {
          // If network fails, and we requested an image, try to serve a placeholder from cache
          if (event.request.destination === 'image') {
            return caches.match('/logo192.png');
          }
          return caches.match(event.request);
        });
      });
    })
  );
});