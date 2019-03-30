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

workbox.precaching.precacheAndRoute([
  {
    "url": "404.html",
    "revision": "0a27a4163254fc8fce870c8cc3a3f94f"
  },
  {
    "url": "favicon.ico",
    "revision": "2cab47d9e04d664d93c8d91aec59e812"
  },
  {
    "url": "index.html",
    "revision": "49e87076aa3542f8acf8c277a54a4cda"
  },
  {
    "url": "manifest.json",
    "revision": "4d8ed76d07b36dbf2f27bbc993e9c25c"
  },
  {
    "url": "offline.html",
    "revision": "c31a356646794e12b07281d93b0f1b06"
  },
  {
    "url": "src/css/app.css",
    "revision": "f27b4d5a6a99f7b6ed6d06f6583b73fa"
  },
  {
    "url": "src/css/feed.css",
    "revision": "d4fcd40ceac30fee21304e3350a31a17"
  },
  {
    "url": "src/css/help.css",
    "revision": "1c6d81b27c9d423bece9869b07a7bd73"
  },
  {
    "url": "src/js/app.js",
    "revision": "caf17942272d612b15415ab320c0f2d6"
  },
  {
    "url": "src/js/feed.js",
    "revision": "ff374877d9691565a171140a9f56a877"
  },
  {
    "url": "src/js/fetch.js",
    "revision": "6b82fbb55ae19be4935964ae8c338e92"
  },
  {
    "url": "src/js/idb.js",
    "revision": "f7aa2594e36afff964749cc86672d00d"
  },
  {
    "url": "src/js/material.min.js",
    "revision": "713af0c6ce93dbbce2f00bf0a98d0541"
  },
  {
    "url": "src/js/promise.js",
    "revision": "10c2238dcd105eb23f703ee53067417f"
  },
  {
    "url": "src/js/utility.js",
    "revision": "77bb552fcd530a3e5f44856f93326722"
  },
  {
    "url": "sw-base.js",
    "revision": "b0e6cd062c443f2fbd9cb5b10691670e"
  },
  {
    "url": "src/images/main-image-lg.jpg",
    "revision": "31b19bffae4ea13ca0f2178ddb639403"
  },
  {
    "url": "src/images/main-image-sm.jpg",
    "revision": "c6bb733c2f39c60e3c139f814d2d14bb"
  },
  {
    "url": "src/images/main-image.jpg",
    "revision": "5c66d091b0dc200e8e89e56c589821fb"
  },
  {
    "url": "src/images/sf-boat.jpg",
    "revision": "0f282d64b0fb306daf12050e812d6a19"
  }
]);

self.addEventListener('sync', (event) => {
    console.log('[Service worker] Background syncing', event);

    if (event.tag === 'sync-new-post') {
        console.log('[Service worker] Syncing new Posts');
        event.waitUntil(
            readAllData('sync-posts')
                .then(data => {
                    for (let post of data) {
                        const postData = new FormData();
                        postData.append('id', post.id);
                        postData.append('title', post.title);
                        postData.append('location', post.location);
                        postData.append('file', post.picture, `${post.id}.png`);

                        fetch('https://us-central1-pwagram-4967b.cloudfunctions.net/storePostData', {
                            method: 'POST',
                            body: postData
                        })
                            .then(response => {
                                console.log('Sent data', response);

                                if (response.ok) {
                                    response.json()
                                        .then(post => {
                                            deleteItemFromData('sync-posts', post.id);
                                        });
                                }
                            })
                            .catch(error => {
                                console.log('Error while sending post data', error);
                            });
                    }
                })
        );
    }
});

self.addEventListener('notificationclick', e => {
    console.log('Notification have been clicked', e);
    console.log(e.notification);

    if (e.action === 'confirm') {
        console.log('Confirm have been chosen');
    } else {
        console.log(e.action);
        e.waitUntil(
            clients.matchAll()
                .then(activeClients => {
                    const client = activeClients.find(activeClient => {
                        return activeClient.visibilityState === 'visible';
                    });

                    if (client) {
                        client.navigate(e.notification.data.url);
                        client.focus();
                    } else {
                        clients.openWindow(e.notification.data.url);
                    }

                    e.notification.close();
                })
        );
    }

    e.notification.close();
});

self.addEventListener('notificationclose', e => {
    console.log('Notification have been closed', e);
});

self.addEventListener('push', event => {
    console.log('push notification received', event);

    if (event.data) {
        data = JSON.parse(event.data.text());

        event.waitUntil(
            self.registration.showNotification(data.title, {
                body: data.content,
                icon: '/src/images/icons/app-icon-96x96.png',
                badge: '/src/images/icons/app-icon-96x96.png',
                data: {
                    url: data.openUrl
                }
            })
        )
    }
});