// ProArena TV — Service Worker
const CACHE_NAME = 'proarena-v1';
const SHELL_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './channels.json',
  './manifest.json',
];

// Install: cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for static
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests and cross-origin streaming URLs
  if (event.request.method !== 'GET') return;
  if (url.origin !== location.origin) return;

  event.respondWith(
    // Try network first, fall back to cache
    fetch(event.request)
      .then((response) => {
        // Cache a copy of fresh responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
