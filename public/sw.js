const STATIC_CACHE_NAME = 'static_assets_v2';
const DYNAMIC_CACHE_NAME = 'dynamic_assets_v1';

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing Service Worker ...', event);

    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
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
    event.waitUntil(
        caches.keys()
            .then((keyList) => {
                return Promise.all(keyList.map(key => {
                    if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
                        console.log('[Service Worker] Removing old cahce', key);
                        return caches.delete(key);
                    }
                }))
            })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                } else {
                    return fetch(event.request)
                        .then((res) => {
                            return caches.open(DYNAMIC_CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request.url, res.clone());
                                    return res;
                                });
                        })
                        .catch((error) => {});
                }
            })
    );
});