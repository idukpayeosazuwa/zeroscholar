// Service Worker for ZeroScholar PWA
// Version: Update this when you make breaking changes
const CACHE_VERSION = '20260111-v2';
const CACHE_NAME = 'zeroscholar-' + CACHE_VERSION;

// Core app shell - minimal set that MUST exist
const APP_SHELL = [
  '/'
];

// Skip these domains from caching
const SKIP_DOMAINS = [
  'appwrite.io',
  'cloud.appwrite.io'
];

// Install event - cache the app shell
self.addEventListener('install', (event) => {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {

        // Use addAll for critical assets - will fail if any are missing
        return cache.addAll(APP_SHELL);
      })
      .then(() => {

        return self.skipWaiting(); // Activate immediately
      })
      .catch(() => {
        // Still skip waiting even if cache fails
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('zeroscholar-') && name !== CACHE_NAME)
            .map((name) => {

              return caches.delete(name);
            })
        );
      })
      .then(() => {

        return self.clients.claim(); // Take control immediately
      })
  );
});

// Helper: Should we handle this request?
const shouldCache = (url) => {
  // Skip non-http(s)
  if (!url.protocol.startsWith('http')) return false;
  
  // Skip external domains we shouldn't cache
  if (SKIP_DOMAINS.some(domain => url.hostname.includes(domain))) return false;
  
  // Skip auth paths
  if (url.pathname.includes('auth') || url.pathname.includes('signin')) return false;
  
  // Skip API calls
  if (url.pathname.includes('/v1/') || url.pathname.includes('api')) return false;
  
  return true;
};

// Offline fallback HTML
const OFFLINE_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ScholarAI - Offline</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f3f4f6; }
    .container { text-align: center; padding: 2rem; }
    h1 { color: #1f2937; margin-bottom: 1rem; }
    p { color: #6b7280; margin-bottom: 2rem; }
    button { background: #2563eb; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-size: 1rem; }
    button:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📡 You're Offline</h1>
    <p>Please check your internet connection and try again.</p>
    <button onclick="location.reload()">Retry</button>
  </div>
</body>
</html>
`;

// Fetch event - network first with cache fallback
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip requests we shouldn't cache
  if (!shouldCache(url)) return;

  // For navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response && response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          // Offline - return cached version or root
          const cached = await caches.match(event.request);
          if (cached) return cached;
          
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;
          
          // No cache at all - return offline page
          return new Response(OFFLINE_HTML, {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
          });
        })
    );
    return;
  }

  // For static assets (JS, CSS, images, fonts)
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|webp)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then((cached) => {
          if (cached) {
            // Return cached, but update in background
            fetch(event.request)
              .then((response) => {
                if (response && response.ok) {
                  caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, response);
                  });
                }
              })
              .catch(() => {}); // Ignore fetch errors for background update
            return cached;
          }
          
          // Not cached - fetch and cache
          return fetch(event.request)
            .then((response) => {
              if (response && response.ok) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseClone);
                });
              }
              return response;
            });
        })
    );
    return;
  }

  // Default: network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.ok && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data?.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});
