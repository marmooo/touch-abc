const cacheName = "2026-06-17 00:00";
const urlsToCache = [
  "/touch-abc/index.yomi",
  "/touch-abc/drill/index.yomi",
  "/touch-abc/index.js",
  "/touch-abc/drill.js",
  "/touch-abc/mp3/correct1.mp3",
  "/touch-abc/mp3/correct3.mp3",
  "/touch-abc/mp3/incorrect1.mp3",
  "/touch-abc/mp3/stupid5.mp3",
  "/touch-abc/favicon/favicon.svg",
  "https://fonts.googleapis.com/css2?family=Roboto&family=PT+Sans&family=Bree+Serif&family=ABeeZee&family=Sriracha&family=Farsan&family=Paprika&display=swap&text=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
];

async function preCache() {
  const cache = await caches.open(cacheName);
  await Promise.all(
    urlsToCache.map((url) =>
      cache.add(url).catch((err) => console.warn("Failed to cache", url, err))
    ),
  );
  self.skipWaiting();
}

async function handleFetch(event) {
  const cached = await caches.match(event.request);
  return cached || fetch(event.request);
}

async function cleanOldCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map((name) => name !== cacheName ? caches.delete(name) : null),
  );
  self.clients.claim();
}

self.addEventListener("install", (event) => {
  event.waitUntil(preCache());
});
self.addEventListener("fetch", (event) => {
  event.respondWith(handleFetch(event));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(cleanOldCaches());
});
