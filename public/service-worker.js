const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/favorites.html',
    '/topic.html',
    '/assets/css/style.css',
    '/dist/app.bundle.js',
    '/dist/favorites.bundle.js',
    '/dist/topic.bundle.js',
    'https://fonts.googleapis.com/css?family=Istok+Web|Montserrat:800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css',
  ];
  
  const CACHE_NAME = 'static-cache-v2';
  const DATA_CACHE_NAME = 'data-cache-v1';
  
  self.addEventListener('install', (evt) => {
    evt.waitUntil(
      caches
        .open(CACHE_NAME)
        .then((cache) => cache.addAll(FILES_TO_CACHE))
        .then(self.skipWaiting())
    );
  });
  
  self.addEventListener('activate', (evt) => {
    const currentCaches = [CACHE_NAME, DATA_CACHE_NAME];
    evt.waitUntil(
      caches
        .keys()
        .then((cacheNames) => {
          return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
        })
        .then((cachesToDelete) => {
          return Promise.all(
            cachesToDelete.map((cacheToDelete) => {
              return caches.delete(cacheToDelete);
            })
          );
        })
        .then(() => self.clients.claim())
    );
  });
  
  self.addEventListener('fetch', (evt) => {
    if (evt.request.url.startsWith(self.location.origin)) {
      evt.respondWith(
        caches.match(evt.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
  
          return caches.open(DATA_CACHE_NAME).then((cache) => {
            return fetch(evt.request).then((response) => {
              return cache.put(evt.request, response.clone()).then(() => {
                return response;
              });
            });
          });
        })
      );
    }
  });
  