

export function register() {
  // Solo registrar el service worker en producción
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL || ''}/service-worker.js`;
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('Service Worker registered for production');
          // Verificar actualizaciones
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) return;

            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New content available; please refresh');
              }
            });
          });
        })
        .catch((error) => {
          console.error('Error during service worker registration:', error);
        });
    });
  } else {
    console.log('Development mode - Service Worker disabled');
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => registration.unregister())
      .then(() => {
        console.log('Service Worker unregistered');
      })
      .catch((error) => {
        console.error('Error during Service Worker unregister:', error);
      });
  }
}
