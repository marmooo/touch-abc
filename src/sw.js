const CACHE_NAME = "2024-03-03 09:00";
const urlsToCache = [
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
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js",
  "https://cdn.jsdelivr.net/npm/signature_pad@4.1.7/dist/signature_pad.umd.min.js",
  "https://fonts.googleapis.com/css2?family=Roboto&family=PT+Sans&family=Bree+Serif&family=ABeeZee&family=Sriracha&family=Farsan&family=Paprika&display=swap&text=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      );
    }),
  );
});
