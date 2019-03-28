importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.1.1/workbox-sw.js");

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


workbox.precaching.precacheAndRoute([]);