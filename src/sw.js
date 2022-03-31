var CACHE_NAME = '2022-04-01 06:30';
var urlsToCache = [
  "/touch-abc/",
  "/touch-abc/index.js",
  "/touch-abc/drill.js",
  "/touch-abc/drill/",
  "/touch-abc/svg/eraser.svg",
  "/touch-abc/svg/sound.svg",
  "/touch-abc/mp3/correct1.mp3",
  "/touch-abc/mp3/correct3.mp3",
  "/touch-abc/mp3/incorrect1.mp3",
  "/touch-abc/mp3/stupid5.mp3",
  "/touch-abc/favicon/original.svg",
  "https://cdn.jsdelivr.net/npm/signature_pad@4.0.3/dist/signature_pad.umd.min.js",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js",
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
