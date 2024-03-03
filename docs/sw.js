const CACHE_NAME="2024-03-03 14:00",urlsToCache=["/touch-abc/","/touch-abc/index.yomi","/touch-abc/drill/","/touch-abc/drill/index.yomi","/touch-abc/index.js","/touch-abc/drill.js","/touch-abc/mp3/correct1.mp3","/touch-abc/mp3/correct3.mp3","/touch-abc/mp3/incorrect1.mp3","/touch-abc/mp3/stupid5.mp3","/touch-abc/favicon/favicon.svg","https://marmooo.github.io/yomico/yomico.min.js","https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js","https://cdn.jsdelivr.net/npm/signature_pad@4.1.7/dist/signature_pad.umd.min.js","https://fonts.googleapis.com/css2?family=Roboto&family=PT+Sans&family=Bree+Serif&family=ABeeZee&family=Sriracha&family=Farsan&family=Paprika&display=swap&text=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"];self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE_NAME).then(e=>e.addAll(urlsToCache)))}),self.addEventListener("fetch",e=>{e.respondWith(caches.match(e.request).then(t=>t||fetch(e.request)))}),self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(e=>Promise.all(e.filter(e=>e!==CACHE_NAME).map(e=>caches.delete(e)))))})