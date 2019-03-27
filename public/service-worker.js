/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.1.1/workbox-sw.js");

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "404.html",
    "revision": "0a27a4163254fc8fce870c8cc3a3f94f"
  },
  {
    "url": "favicon.ico",
    "revision": "2cab47d9e04d664d93c8d91aec59e812"
  },
  {
    "url": "help/index.html",
    "revision": "965d1d8dd14a8ef41d32d000ea15c37b"
  },
  {
    "url": "index.html",
    "revision": "4e654090d29219258261c2742b913885"
  },
  {
    "url": "manifest.json",
    "revision": "4d8ed76d07b36dbf2f27bbc993e9c25c"
  },
  {
    "url": "offline.html",
    "revision": "2621f6071a70db3c3e26909ef739a0d4"
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
    "url": "src/images/icons/app-icon-144x144.png",
    "revision": "83011e228238e66949f0aa0f28f128ef"
  },
  {
    "url": "src/images/icons/app-icon-192x192.png",
    "revision": "f927cb7f94b4104142dd6e65dcb600c1"
  },
  {
    "url": "src/images/icons/app-icon-256x256.png",
    "revision": "86c18ed2761e15cd082afb9a86f9093d"
  },
  {
    "url": "src/images/icons/app-icon-384x384.png",
    "revision": "fbb29bd136322381cc69165fd094ac41"
  },
  {
    "url": "src/images/icons/app-icon-48x48.png",
    "revision": "45eb5bd6e938c31cb371481b4719eb14"
  },
  {
    "url": "src/images/icons/app-icon-512x512.png",
    "revision": "d42d62ccce4170072b28e4ae03a8d8d6"
  },
  {
    "url": "src/images/icons/app-icon-96x96.png",
    "revision": "56420472b13ab9ea107f3b6046b0a824"
  },
  {
    "url": "src/images/icons/apple-icon-114x114.png",
    "revision": "74061872747d33e4e9f202bdefef8f03"
  },
  {
    "url": "src/images/icons/apple-icon-120x120.png",
    "revision": "abd1cfb1a51ebe8cddbb9ada65cde578"
  },
  {
    "url": "src/images/icons/apple-icon-144x144.png",
    "revision": "b4b4f7ced5a981dcd18cb2dc9c2b215a"
  },
  {
    "url": "src/images/icons/apple-icon-152x152.png",
    "revision": "841f96b69f9f74931d925afb3f64a9c2"
  },
  {
    "url": "src/images/icons/apple-icon-180x180.png",
    "revision": "2e5e6e6f2685236ab6b0c59b0faebab5"
  },
  {
    "url": "src/images/icons/apple-icon-57x57.png",
    "revision": "cc93af251fd66d09b099e90bfc0427a8"
  },
  {
    "url": "src/images/icons/apple-icon-60x60.png",
    "revision": "18b745d372987b94d72febb4d7b3fd70"
  },
  {
    "url": "src/images/icons/apple-icon-72x72.png",
    "revision": "b650bbe358908a2b217a0087011266b5"
  },
  {
    "url": "src/images/icons/apple-icon-76x76.png",
    "revision": "bf10706510089815f7bacee1f438291c"
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
  },
  {
    "url": "src/js/app.js",
    "revision": "2e47eadab433542109f72d3ae0f010c7"
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
    "url": "sw.js",
    "revision": "68440c7761ca282877df29c0446a0bce"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
