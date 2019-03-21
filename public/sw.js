importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');

const STATIC_CACHE_NAME = 'static_assets_v43';
const DYNAMIC_CACHE_NAME = 'dynamic_assets_v3';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/offline.html',
    '/src/js/app.js',
    '/src/js/utility.js',
    '/src/js/feed.js',
    '/src/js/idb.js',
    '/src/js/material.min.js',
    '/src/css/app.css',
    '/src/css/feed.css',
    '/src/images/main-image.jpg',
    'https://fonts.googleapis.com/css?family=Roboto:400,700',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
];

const dynamicContentUrl = 'https://pwagram-4967b.firebaseio.com/posts.json';

function trimCache(cacheName, maxItems) {
    caches.open(cacheName)
        .then(cache => {
            return cache.keys()
                .then(keys => {
                    if (keys.length > maxItems) {
                        cache.delete(keys[0])
                            .then(trimCache(cacheName, maxItems));
                    }
                });
        });
}

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing Service Worker ...', event);

    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
               console.log('[Service Worker] Precaching app shell');
               cache.addAll(STATIC_ASSETS);

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
    // if (event.request.url.indexOf(dynamicUrl) > -1) {
    //     event.respondWith(
    //         caches.open(DYNAMIC_CACHE_NAME)
    //             .then(cache => {
    //                 return cache.match(event.request)
    //                     .then(response => {
    //                         if (response) {
    //                             fetch(event.request)
    //                                 .then(result => {
    //                                     cache.put(event.request, result.clone());
    //                                 });
    //                             console.log('boat', 'from cache', response);
    //                             return response;
    //                         } else {
    //                             return fetch(event.request)
    //                                 .then(result => {
    //                                     cache.put(event.request, result.clone());
    //                                     console.log('boat', 'from network', result);
    //                                     return result;
    //                                 });
    //                         }
    //                     });
    //             })
    //     )
    if (event.request.url.indexOf(dynamicContentUrl) > -1) {
        event.respondWith(fetch(event.request)
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
            })
        );
    } else if (STATIC_ASSETS.includes(event.request.url)) {
        event.respondWith(
            caches.match(event.request)
        );
    } else {
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
                                        // trimCache(DYNAMIC_CACHE_NAME, 10);
                                        cache.put(event.request.url, res.clone());
                                        return res;
                                    });
                            })
                            .catch((error) => {
                                return caches.open(STATIC_CACHE_NAME)
                                    .then(cache => {
                                        if (event.request.headers.get('accept').includes('text/html')) {
                                            return cache.match('/offline.html');
                                        }
                                    });
                            });
                    }
                })
        );
    }
});

// Cache-only strategy
// self.addEventListener('fetch', event => {
//     event.respondWith(
//         caches.match(event.request)
//     )
// });

// Network-only strategy
// self.addEventListener('fetch', event => {
//    event.respondWith(
//        fetch(event.request)
//    );
// });

// Network with cache fallback strategy
// self.addEventListener('fetch', event => {
//     event.respondWith(
//         fetch(event.request)
//             .then(response => {
//                 return caches.open(DYNAMIC_CACHE_NAME)
//                     .then((cache) => {
//                         cache.put(event.request.url, response.clone());
//                         return response;
//                     });
//             })
//             .catch(error => {
//                 return caches.match(event.request);
//             })
//     );
// });

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