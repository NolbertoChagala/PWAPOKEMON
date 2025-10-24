/* eslint-disable no-restricted-globals */
/* Service Worker: handle caching for offline support on Vercel */
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
  // Install should be resilient: don't fail the install if one asset is missing on the host.
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      // Add each precache URL individually and ignore failures for missing assets.
      await Promise.all(PRECACHE_URLS.map(async (url) => {
        try {
          // Use cache.add which will fetch and add; wrap in try to avoid rejecting install
          await cache.add(url);
        } catch (e) {
          // Log but don't fail the installation
          console.warn('SW precache failed for', url, e && e.message);
        }
      }));
    }).then(() => {
      // Wait until skipWaiting is called properly
      return self.skipWaiting();
    })
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
      // Cache successful responses; allow opaque/CORS responses as well so cross-origin sprites work offline
      try {
        if (response && (response.status === 200 || response.type === 'opaque' || response.type === 'cors')) {
          const responseToCache = response.clone();
          caches.open(RUNTIME).then(cache => {
            try { cache.put(request, responseToCache); } catch (e) { /* ignore */ }
          });
        }
      } catch (e) {
        // ignore caching errors
      }

      return response;
    }).catch(() => {
      // If fetch fails and there is no cached image, try a local placeholder
      return caches.match('/logo192.png');
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