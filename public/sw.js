// Service Worker básico para permitir la instalación de la PWA
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
});

self.addEventListener('fetch', (event) => {
  // Simplemente dejamos pasar las peticiones
  event.respondWith(fetch(event.request));
});