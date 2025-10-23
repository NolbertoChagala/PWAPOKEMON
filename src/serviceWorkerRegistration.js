// Minimal service worker registration helper
// Registers the service worker file placed in the public folder (service-worker.js)
// Usage: import * as serviceWorkerRegistration from './serviceWorkerRegistration';
//        serviceWorkerRegistration.register();

export function register() {
  if ('serviceWorker' in navigator) {
    // Wait for the page to load before registering the SW
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL || ''}/service-worker.js`;
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    });
  } else {
    // Service workers not supported
    // No-op, but keep for parity with CRA helper API
    console.log('Service Worker not supported in this browser.');
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
