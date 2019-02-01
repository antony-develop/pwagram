self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing Service Worker ...', event);

    event.waitUntil(
        caches.open('static_assets')
            .then((cache) => {
               console.log('[Service Worker] Precaching app shell');
               cache.addAll([
                   '/',
                   '/index.html',
                   '/src/js/app.js',
                   '/src/js/feed.js',
                   '/src/js/material.min.js',
                   '/src/css/app.css',
                   '/src/css/feed.css',
                   '/src/images/main-image.jpg',
                   'https://fonts.googleapis.com/css?family=Roboto:400,700',
                   'https://fonts.googleapis.com/icon?family=Material+Icons',
                   'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
               ]);

               // add polyfills for performance
               cache.addAll([
                    '/src/js/promise.js',
                    '/src/js/fetch.js',
                ]);
            })
    );

});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating Service Worker ...', event);
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                } else {
                    return fetch(event.request);
                }
            })
    );
});