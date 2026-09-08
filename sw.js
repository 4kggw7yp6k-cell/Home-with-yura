const CACHE="home-with-yura-web-v200a1";
const FILES=["./","./index.html","./style.css","./app.js","./manifest.webmanifest","./icon-180.png","./icon-192.png","./icon-512.png","./assets/yura_morning.png","./assets/yura_day.png","./assets/yura_night.png"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  if(e.request.mode==="navigate"){e.respondWith(fetch(e.request).catch(()=>caches.match("./index.html")));return}
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
