importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.1.1/workbox-sw.js");
importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');

workbox.setConfig({ debug: false });

const dynamicContentUrl = 'https://pwagram-4967b.firebaseio.com/posts.json';

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

workbox.routing.registerRoute(/.*(?:firebasestorage\.googleapis)\.com.*$/, new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'post-images',
}));

workbox.routing.registerRoute(/.*(?:googleapis|gstatic)\.com.*$/, new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'google-fonts',
    plugins: [
        new workbox.expiration.Plugin({
            maxEntries: 3,
            maxAgeSeconds: 30*24*60*60,
        }),
    ]
}));

workbox.routing.registerRoute('https://code.getmdl.io/1.3.0/material.indigo-pink.min.css', new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'material-css',
}));

workbox.routing.registerRoute(dynamicContentUrl, ({url, event, params}) => {
    return fetch(event.request)
        .then(response => {
            response.clone().json()
                .then(data => {
                    clearAllData('posts')
                        .then(() => {
                            for (let item of Object.values(data)) {
                                writeData('posts', item);
                            }
                        });
                });

            return response;
        });
});

workbox.routing.registerRoute(({url, event}) => {
    return (event.request.headers.get('accept').includes('text/html'));
}, ({url, event, params}) => {
    return caches.match(event.request)
        .then((response) => {
            if (response) {
                return response;
            } else {
                return fetch(event.request)
                    .then((res) => {
                        return caches.open('dynamic')
                            .then((cache) => {
                                cache.put(event.request.url, res.clone());
                                return res;
                            });
                    })
                    .catch((error) => {
                        return caches.match(
                            workbox.precaching.getCacheKeyForURL('/offline.html')
                        )
                            .then(response => {
                                return response;
                            });
                    });
            }
        });
});

workbox.precaching.precacheAndRoute([]);