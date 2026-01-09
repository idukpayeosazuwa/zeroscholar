const fs = require('fs');

const content = `// Smart versioning: Only changes when you deploy new code
// Uses build date so cache updates on each deployment
const CACHE_VERSION = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const CACHE_NAME = 'zeroscholar-v' + CACHE_VERSION;

// Assets to pre-cache immediately - these are essential for offline
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Dynamic assets that should be cached when fetched
const CACHE_ON_FETCH = [
  /\\.js$/,
  /\\.css$/,
  /\\.woff2?$/,
  /\\.ttf$/,
  /\\.png$/,
  /\\.jpg$/,
  /\\.jpeg$/,
  /\\.svg$/,
  /\\.webp$/,
  /\\.ico$/
];

const OFFLINE_URL = '/'; // Redirect to home when offline
const SKIP_DOMAINS = [
  'appwrite.io',
  'cloud.appwrite.io',
  'github.dev',
  'app.github.dev'
];

// Helper: Check if we should handle this request
const shouldHandle = (url) => {
  // Skip non-http(s) requests
  if (!url.protocol.startsWith('http')) return false;
  
  // Skip external domains we shouldn't cache
  if (SKIP_DOMAINS.some(domain => url.hostname.includes(domain))) return false;
  
  // Skip auth-related paths
  if (url.pathname.includes('signin') || 
      url.pathname.includes('auth') || 
      url.pathname.includes('postback')) return false;
  
  return true;
};

// Helper: Check if response is cacheable
const isCacheable = (response) => {
  if (!response) return false;
  if (!response.ok) return false;
  if (response.type === 'opaque') return false;
  if (response.redirected) return false;
  return true;
};

// Helper: Safely cache a response
const cacheResponse = async (request, response) => {
  if (!isCacheable(response)) return;
  
  try {
    // Check if body is already used
    if (response.bodyUsed) return;
    
    const cache = await caches.open(CACHE_NAME);
    
    // Check if already cached to avoid unnecessary writes
    const existing = await cache.match(request);
    if (existing) return;
    
    // Clone before caching
    await cache.put(request, response.clone());
  } catch (err) {
    // Silently fail - caching is best-effort
  }
};

// Install: Pre-cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((err) => {
        // Silent catch
      })
  );
  self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('zeroscholar-') && name !== CACHE_NAME)
          .map((name) => {
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
  console.log('[SW] Service Worker Activated');
});

// Fetch handler
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip requests we shouldn't handle
  if (!shouldHandle(url)) return;

  // Navigation requests (page loads/refreshes)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        // If offline, try cache FIRST (don't waste time on network)
        if (!navigator.onLine) {
          const cached = await caches.match(event.request) || await caches.match('/');
          if (cached) {
            return cached;
          }
        }
        
        // Online: try network first
        try {
          const response = await fetch(event.request);
          if (response && response.ok) {
            cacheResponse(event.request, response);
          }
          return response;
        } catch (err) {
          const cached = await caches.match(event.request) || await caches.match('/');
          if (cached) {
            return cached;
          }
          return new Response('Offline - Please check your connection', { 
            status: 503,
            headers: { 'Content-Type': 'text/html' }
          });
        }
      })()
    );
    return;
  }

  // Static assets (JS, CSS, fonts, images): Cache first, network fallback
  if (url.pathname.match(/\\.(js|css|png|jpg|jpeg|svg|ico|woff|woff2|ttf|webp)$/)) {
    event.respondWith(
      (async () => {
        // Always check cache first for static assets
        const cached = await caches.match(event.request);
        if (cached) {
          // Update cache in background if online (don't await)
          if (navigator.onLine) {
            fetch(event.request)
              .then((response) => {
                if (response && response.ok) {
                  cacheResponse(event.request, response);
                }
              })
              .catch(() => {});
          }
          return cached;
        }
        
        // No cache - must fetch from network
        try {
          const response = await fetch(event.request);
          if (response && response.ok) {
            // IMPORTANT: Cache JS/CSS bundles for offline use
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, response.clone());
          }
          return response;
        } catch (err) {
          // Return empty response to avoid breaking the app
          return new Response('', { 
            status: 200, 
            statusText: 'OK',
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        }
      })()
    );
    return;
  }

  // Default: Network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        cacheResponse(event.request, response);
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Handle messages
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
`;

fs.writeFileSync('public/sw.js', content);
console.log('sw.js updated');
