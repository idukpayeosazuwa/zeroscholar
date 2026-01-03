// Smart versioning: Only changes when code actually changes
// This hash is injected by Vite at build time (YYYYMMDD format)
// Combined with Vite's content hashing in filenames, ensures efficient caching
const CACHE_VERSION = '__VITE_CACHE_VERSION__' || new Date().toISOString().slice(0, 10).replace(/-/g, '');
const CACHE_NAME = 'zeroscholar-v' + CACHE_VERSION;
const OFFLINE_URL = '/offline';

// Log for mobile debugging
console.log('[SW] Service Worker starting, version:', CACHE_VERSION, 'cache name:', CACHE_NAME);

// Assets to pre-cache immediately
const STATIC_ASSETS = [
  '/',
  '/offline'
];

// Domains to NEVER cache (API, auth, dev environments)
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
    console.log('[SW] Cache error:', err.message);
  }
};

// Install: Pre-cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching essential assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((err) => {
        console.error('[SW] Pre-cache failed:', err.message);
        // Don't block install if pre-cache fails (important for mobile)
      })
  );
  self.skipWaiting();
  console.log('[SW] Install complete');
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      console.log('[SW] Found caches:', cacheNames);
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('zeroscholar-') && name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
  console.log('[SW] Activation complete');
});

// Fetch handler
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip requests we shouldn't handle
  if (!shouldHandle(url)) return;

  // Navigation: Network first, cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful navigation responses
          if (response && response.ok) {
            cacheResponse(event.request, response);
          }
          return response;
        })
        .catch(async () => {
          console.log('[SW] Navigation failed, trying cache');
          const cached = await caches.match(event.request);
          if (cached) {
            console.log('[SW] Serving cached navigation');
            return cached;
          }
          console.log('[SW] No cache, serving offline page');
          return caches.match(OFFLINE_URL) || new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  // Static assets: Cache first, network update
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff|woff2|ttf|webp)$/)) {
    event.respondWith(
      caches.match(event.request).then(async (cached) => {
        // If cached, return it and update in background
        if (cached) {
          // Update cache in background (don't await)
          fetch(event.request)
            .then((response) => {
              if (response && response.ok) {
                cacheResponse(event.request, response);
              }
            })
            .catch(() => {});
          return cached;
        }
        
        // No cache (MOBILE OFTEN STARTS HERE), fetch from network
        try {
          const response = await fetch(event.request);
          // Cache successful responses for future
          if (response && response.ok) {
            cacheResponse(event.request, response);
          }
          return response;
        } catch (err) {
          console.log('[SW] Network failed for:', url.pathname);
          // Return empty response instead of 404 to avoid breaking the app
          return new Response('', { 
            status: 200, 
            statusText: 'OK',
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        }
      })
    );
    return;
  }

  // Default: Network first
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
