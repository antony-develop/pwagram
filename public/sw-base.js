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