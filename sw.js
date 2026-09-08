const CACHE="home-with-yura-v001";
const ASSETS=["./","./index.html","./style.css","./app.js","./manifest.webmanifest","./icon-180.png","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener("fetch",e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
