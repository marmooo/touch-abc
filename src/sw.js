var CACHE_NAME = "2023-07-21 00:10";
var urlsToCache = [
  "/touch-abc/",
  "/touch-abc/index.yomi",
  "/touch-abc/drill/",
  "/touch-abc/drill/index.yomi",
  "/touch-abc/index.js",
  "/touch-abc/drill.js",
  "/touch-abc/mp3/correct1.mp3",
  "/touch-abc/mp3/correct3.mp3",
  "/touch-abc/mp3/incorrect1.mp3",
  "/touch-abc/mp3/stupid5.mp3",
  "/touch-abc/favicon/favicon.svg",
  "https://marmooo.github.io/yomico/yomico.min.js",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js",
  "https://cdn.jsdelivr.net/npm/signature_pad@4.1.5/dist/signature_pad.umd.min.js",
  "https://fonts.googleapis.com/css2?family=Aref+Ruqaa&family=Sansita+Swashed&family=Neucha&family=Bree+Serif&family=Amaranth&family=ABeeZee&family=Sriracha&family=Farsan&family=Ranga&family=Delius+Swash+Caps&family=Kotta+One&family=Bellota&family=Chilanka&family=Poor+Story&family=Paprika&display=swap",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(urlsToCache);
      }),
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }),
  );
});

self.addEventListener("activate", function (event) {
  var cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});
