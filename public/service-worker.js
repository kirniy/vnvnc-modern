// VNVNC Service Worker - Force COMPLETE cache refresh
const CACHE_VERSION = 'vnvnc-v3.0.1-gallery-fix';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;
const VIDEO_CACHE = `videos-${CACHE_VERSION}`;

// Assets to cache immediately - skip videos initially to prevent errors
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  // JS/CSS bundles will be cached on first load
];

// Cache size limits
const CACHE_LIMITS = {
  api: 50, // Max API responses to cache
  images: 100, // Max images
  videos: 25, // Increased to cache more videos for instant loading
};

// Cache TTLs (in milliseconds)
const CACHE_TTL = {
  api: 60 * 1000, // 1 minute for API during high traffic
  images: 7 * 24 * 60 * 60 * 1000, // 7 days for images
  videos: 7 * 24 * 60 * 60 * 1000, // 7 days for videos - they don't change often
  static: 365 * 24 * 60 * 60 * 1000, // 1 year for static assets
};

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      // Cache critical assets individually to prevent one failure from blocking all
      const promises = CRITICAL_ASSETS.map(url => 
        cache.add(url).catch(err => {
          console.log(`Failed to cache ${url}:`, err);
          // Continue with other assets even if one fails
          return Promise.resolve();
        })
      );
      return Promise.all(promises);
    }).then(() => {
      // Skip waiting and activate immediately
      self.skipWaiting();
    }).catch(err => {
      console.log('Service Worker installation error:', err);
      // Still skip waiting even if caching fails
      self.skipWaiting();
    })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return !cacheName.includes(CACHE_VERSION);
          })
          .map((cacheName) => {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Helper to add timestamp to cached responses
function addTimestamp(response) {
  const clonedResponse = response.clone();
  const headers = new Headers(clonedResponse.headers);
  headers.append('sw-cache-timestamp', Date.now().toString());
  
  return new Response(clonedResponse.body, {
    status: clonedResponse.status,
    statusText: clonedResponse.statusText,
    headers: headers,
  });
}

// Check if cached response is expired
function isExpired(response, ttl) {
  const timestamp = response.headers.get('sw-cache-timestamp');
  if (!timestamp) return true;
  
  const age = Date.now() - parseInt(timestamp);
  return age > ttl;
}

// Network-first strategy for API calls (with cache fallback)
async function networkFirstStrategy(request, cacheName, ttl) {
  try {
    const networkResponse = await fetch(request);
    
    // Only cache successful 200 responses - skip 206 partial responses
    if (networkResponse.ok && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      // Add timestamp and cache the response
      cache.put(request, addTimestamp(networkResponse.clone()));
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('Network failed, serving from cache:', request.url);
      // Return even if expired during network failure (stale-while-error)
      return cachedResponse;
    }
    
    throw error;
  }
}

// Cache-first strategy for static assets
async function cacheFirstStrategy(request, cacheName, ttl) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse && !isExpired(cachedResponse, ttl)) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    // Only cache successful 200 responses - skip 206 partial responses
    if (networkResponse.ok && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, addTimestamp(networkResponse.clone()));
    }
    
    return networkResponse;
  } catch (error) {
    // If we have expired cache, use it anyway
    if (cachedResponse) {
      console.log('Network failed, serving stale cache:', request.url);
      return cachedResponse;
    }
    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidateStrategy(request, cacheName, ttl) {
  const cachedResponse = await caches.match(request);
  
  // Fetch fresh data in background
  const fetchPromise = fetch(request).then(async (networkResponse) => {
    // Only cache successful responses (200 OK) - skip 206 partial responses
    if (networkResponse.ok && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, addTimestamp(networkResponse.clone()));
    }
    return networkResponse;
  });
  
  // Return cached response immediately if available
  if (cachedResponse && !isExpired(cachedResponse, ttl)) {
    return cachedResponse;
  }
  
  // Wait for network if no cache
  return fetchPromise;
}

// Limit cache size - FIXED: This function now returns nothing (void)
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const requests = await cache.keys();
  
  if (requests.length > maxSize) {
    // Delete oldest entries
    const toDelete = requests.slice(0, requests.length - maxSize);
    await Promise.all(toDelete.map(request => cache.delete(request)));
  }
}

// Fetch event - handle all requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTP(S) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // API calls to TicketsCloud and our Yandex proxy/download — ALWAYS NETWORK FIRST and DO NOT cache binary downloads
  if (
    url.pathname.startsWith('/api/yandex-disk/download') ||
    url.pathname.startsWith('/api/yandex-disk/proxy') ||
    url.pathname.includes('/api') ||
    url.host.includes('ticketscloud') ||
    url.host.includes('vnvnc-cors-proxy')
  ) {
    event.respondWith(
      (async () => {
        // Для download/proxy не кэшируем совсем
        if (url.pathname.startsWith('/api/yandex-disk/')) {
          return fetch(request);
        }
        const response = await networkFirstStrategy(request, API_CACHE, CACHE_TTL.api);
        // Limit API cache size asynchronously - don't wait for it
        limitCacheSize(API_CACHE, CACHE_LIMITS.api).catch(() => {});
        return response;
      })()
    );
    return;
  }
  
  // Video files - use stale-while-revalidate
  if (request.url.includes('.mp4') || request.url.includes('.webm')) {
    event.respondWith(
      (async () => {
        const response = await staleWhileRevalidateStrategy(request, VIDEO_CACHE, CACHE_TTL.videos);
        // Limit video cache size asynchronously - don't wait for it
        limitCacheSize(VIDEO_CACHE, CACHE_LIMITS.videos).catch(() => {});
        return response;
      })()
    );
    return;
  }
  
  // Images - cache first
  if (request.url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/)) {
    event.respondWith(
      (async () => {
        const response = await cacheFirstStrategy(request, IMAGE_CACHE, CACHE_TTL.images);
        // Limit image cache size asynchronously - don't wait for it
        limitCacheSize(IMAGE_CACHE, CACHE_LIMITS.images).catch(() => {});
        return response;
      })()
    );
    return;
  }
  
  // JavaScript and CSS - cache first with long TTL
  if (request.url.match(/\.(js|css)$/)) {
    event.respondWith(
      cacheFirstStrategy(request, STATIC_CACHE, CACHE_TTL.static)
    );
    return;
  }
  
  // HTML pages - network first for fresh content
  if (request.mode === 'navigate' || request.url.includes('.html')) {
    event.respondWith(
      networkFirstStrategy(request, STATIC_CACHE, CACHE_TTL.api)
    );
    return;
  }
  
  // Default - try network first
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    });
  }
});

// Background sync for ticket purchases (if API supports it)
self.addEventListener('sync', (event) => {
  if (event.tag === 'ticket-purchase') {
    event.waitUntil(
      // Retry ticket purchase when connection is restored
      fetch('/api/retry-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).then(response => {
        if (response.ok) {
          // Notify the app that purchase succeeded
          return self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'PURCHASE_SUCCESS',
                data: response.json(),
              });
            });
          });
        }
      })
    );
  }
});