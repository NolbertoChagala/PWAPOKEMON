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

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      await Promise.all(PRECACHE_URLS.map(async (url) => {
        try {
          await cache.add(url);
        } catch (e) {
          console.warn('SW precache failed for', url, e && e.message);
        }
      }));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME, RUNTIME];
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(cacheName => !currentCaches.includes(cacheName))
          .map(cacheToDelete => caches.delete(cacheToDelete))
      )
    ).then(() => self.clients.claim())
  );
});

const handlePokemonImage = (request) => {
  return caches.match(request).then(response => {
    if (response) return response;
    return fetch(request).then(response => {
      try {
        if (response && (response.status === 200 || response.type === 'opaque' || response.type === 'cors')) {
          const responseToCache = response.clone();
          caches.open(RUNTIME).then(cache => {
            try { cache.put(request, responseToCache); } catch (e) { /* ignore */ }
          });
        }
      } catch (e) { }
      return response;
    }).catch(() => caches.match('/logo192.png'));
  });
};

// Manejo de peticiones
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('index.html').then(cachedIndex =>
        cachedIndex || fetch(event.request).then(response => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put('index.html', copy));
          }
          return response;
        }).catch(() => caches.match('/'))
      )
    );
    return;
  }

  if (event.request.url.includes('pokeapi.co/api/v2/pokemon')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) return response;
        return fetch(event.request).then(response => {
          try {
            const responseToCache = response.clone();
            caches.open(RUNTIME).then(cache => {
              try { cache.put(event.request, responseToCache); } catch(e) { }
            });
          } catch (e) { }
          return response;
        }).catch(() =>
          caches.match(event.request).then(cached =>
            cached || new Response(JSON.stringify({ error: 'offline', message: 'No network and no cached data' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            })
          )
        );
      })
    );
    return;
  }

  if (event.request.destination === 'image' || event.request.url.includes('raw.githubusercontent.com')) {
    event.respondWith(handlePokemonImage(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;
      return caches.open(RUNTIME).then(cache =>
        fetch(event.request).then(response => {
          if (response && (response.status === 200 || response.type === 'opaque' || response.type === 'cors')) {
            try { cache.put(event.request, response.clone()); } catch (e) { }
          }
          return response;
        }).catch(() => {
          if (event.request.destination === 'image') {
            return caches.match('/logo192.png');
          }
          return caches.match(event.request);
        })
      );
    })
  );
});

/* ==============================
   🔔 NOTIFICACIONES LOCALES
   ============================== */
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    self.registration.showNotification(event.data.title, {
      body: event.data.body,
      icon: "/logo192.png",
      vibrate: [100, 50, 100],
      tag: "pokemon-alert"
    });
  }
});
