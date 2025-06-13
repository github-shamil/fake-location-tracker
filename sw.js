self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('location-tracker-cache').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/style.css',
        '/script.js',
        '/offline.html',
        '/assets/location-icon.svg'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request)).then((response) => {
      return response || caches.match('/offline.html');
    })
  );
});
