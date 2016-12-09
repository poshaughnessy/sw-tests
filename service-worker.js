var CACHE_NAME = 'test-v1';

function cacheAssets() {
  return caches.open(CACHE_NAME)
      .then(function(cache) {
          // This was a quick test to see whether we still needed to cache both '/' and 'index.html'
          // It seems not - just with the 'index.html' entry here, it creates a cache entry for both
          // 'http://localhost:8000/' and 'http://localhost:8000/index.html'.
          return cache.addAll([
            //'/',
            'index.html'
          ]);
        });
}

self.addEventListener('install', function(event) {
  event.waitUntil(
    cacheAssets()
  );
});

self.addEventListener('fetch', function(event) {

  console.log(event.request.url);

  // If we can fetch latest version, then do so
  var responsePromise = fetch(event.request)
    .then(function(response) {

      if (!response || !response.ok || response.type !== 'basic') {
        // Don't cache response if it's not within our domain or not 2xx status
        return response;
      }

      // Clone it to allow us to cache it
      var responseToCache = response.clone();

      caches.open(CACHE_NAME)
        .then(function(cache) {
          cache.put(event.request, responseToCache);
        });

      return response;
    })
    .catch(function(err) {

      console.log('Fetch failed, maybe we are offline. Try cache...', err);

      return caches.match(event.request)
        .then(function(response) {
          if (response) {
            console.log('Cache hit', event.request);
            return response;
          } else {
            console.log('Offline cache miss =(');
          }
        });

    });

  event.respondWith(responsePromise);

});