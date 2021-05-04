var CACHE_NAME = '2021-05-04 08:50';
var urlsToCache = [
  '/touch-abc/',
  '/touch-abc/index.js',
  '/touch-abc/drill.js',
  '/touch-abc/drill/',
  '/touch-abc/svg/eraser.svg',
  '/touch-abc/svg/sound.svg',
  '/touch-abc/mp3/correct1.mp3',
  '/touch-abc/mp3/correct3.mp3',
  '/touch-abc/mp3/incorrect1.mp3',
  '/touch-abc/mp3/stupid5.mp3',
  'https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/gh/cferdinandi/smooth-scroll@15.0.0/dist/smooth-scroll.polyfills.min.js',
  'https://cdn.jsdelivr.net/npm/signature_pad@2.3.2/dist/signature_pad.min.js',
  'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js',
  'https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.slim.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.min.js',
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches
    .open(CACHE_NAME)
    .then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', function(event) {
  var cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
