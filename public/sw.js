
// Service Worker básico para permitir la instalación como PWA
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Requerido para pasar los criterios de instalación de Chrome/Edge
  event.respondWith(fetch(event.request).catch(() => {
    return new Response('Offline');
  }));
});
