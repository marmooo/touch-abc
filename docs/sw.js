var CACHE_NAME="2023-07-21 00:10",urlsToCache=["/touch-abc/","/touch-abc/index.yomi","/touch-abc/drill/","/touch-abc/drill/index.yomi","/touch-abc/index.js","/touch-abc/drill.js","/touch-abc/mp3/correct1.mp3","/touch-abc/mp3/correct3.mp3","/touch-abc/mp3/incorrect1.mp3","/touch-abc/mp3/stupid5.mp3","/touch-abc/favicon/favicon.svg","https://marmooo.github.io/yomico/yomico.min.js","https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js","https://cdn.jsdelivr.net/npm/signature_pad@4.1.5/dist/signature_pad.umd.min.js","https://fonts.googleapis.com/css2?family=Aref+Ruqaa&family=Sansita+Swashed&family=Neucha&family=Bree+Serif&family=Amaranth&family=ABeeZee&family=Sriracha&family=Farsan&family=Ranga&family=Delius+Swash+Caps&family=Kotta+One&family=Bellota&family=Chilanka&family=Poor+Story&family=Paprika&display=swap"];self.addEventListener("install",function(a){a.waitUntil(caches.open(CACHE_NAME).then(function(a){return a.addAll(urlsToCache)}))}),self.addEventListener("fetch",function(a){a.respondWith(caches.match(a.request).then(function(b){return b||fetch(a.request)}))}),self.addEventListener("activate",function(a){var b=[CACHE_NAME];a.waitUntil(caches.keys().then(function(a){return Promise.all(a.map(function(a){if(b.indexOf(a)===-1)return caches.delete(a)}))}))})