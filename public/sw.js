const CACHE_NAME = 'zeroscholar-v10';
const OFFLINE_URL = '/offline';

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
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch((err) => console.log('[SW] Pre-cache failed:', err.message))
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
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
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
          cacheResponse(event.request, response);
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          return cached || caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Static assets: Cache first, network update
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff|woff2|ttf|webp)$/)) {
    event.respondWith(
      caches.match(event.request).then(async (cached) => {
        // Return cached immediately if available
        if (cached) {
          // Update cache in background (don't await)
          fetch(event.request)
            .then((response) => cacheResponse(event.request, response))
            .catch(() => {});
          return cached;
        }
        
        // No cache, fetch from network
        try {
          const response = await fetch(event.request);
          cacheResponse(event.request, response);
          return response;
        } catch (err) {
          // Return nothing if both cache and network fail
          return new Response('', { status: 404 });
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
