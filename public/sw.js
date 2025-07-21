// Hypertoons Minting Website Service Worker
const CACHE_NAME = 'hypertoons-v1.0.0'
const STATIC_CACHE = 'hypertoons-static-v1'
const API_CACHE = 'hypertoons-api-v1'
const IMAGE_CACHE = 'hypertoons-images-v1'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/index.css',
  '/images/logo.jpg',
  '/images/background.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap'
]

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/collection-data',
  '/api/mint-events',
  '/api/eligibility'
]

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('🔧 Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('✅ Static assets cached successfully')
        return self.skipWaiting()
      })
      .catch(error => {
        console.error('❌ Failed to cache static assets:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              // Delete old versions of our caches
              return cacheName.startsWith('hypertoons-') && 
                     cacheName !== STATIC_CACHE && 
                     cacheName !== API_CACHE && 
                     cacheName !== IMAGE_CACHE
            })
            .map(cacheName => {
              console.log('🗑️ Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      })
      .then(() => {
        console.log('✅ Cache cleanup completed')
        return self.clients.claim()
      })
  )
})

// Fetch event - handle network requests
self.addEventListener('fetch', event => {
  const request = event.request
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Handle different types of requests
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request))
  } else if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request))
  } else if (isImageRequest(url)) {
    event.respondWith(handleImageRequest(request))
  } else if (isBlockchainRequest(url)) {
    event.respondWith(handleBlockchainRequest(request))
  } else {
    event.respondWith(handleGenericRequest(request))
  }
})

// Check if request is for static assets
function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.html', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2']
  return staticExtensions.some(ext => url.pathname.endsWith(ext)) ||
         url.pathname === '/' ||
         url.hostname === 'fonts.googleapis.com' ||
         url.hostname === 'fonts.gstatic.com'
}

// Check if request is for API
function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') ||
         API_ENDPOINTS.some(endpoint => url.pathname.includes(endpoint))
}

// Check if request is for images
function isImageRequest(url) {
  return url.pathname.includes('/images/') ||
         /\.(png|jpg|jpeg|gif|svg|webp)(\?.*)?$/i.test(url.pathname)
}

// Check if request is for blockchain/RPC
function isBlockchainRequest(url) {
  return url.hostname.includes('hyperliquid') ||
         url.hostname.includes('ethereum') ||
         url.pathname.includes('rpc') ||
         url.pathname.includes('api/v1')
}

// Handle static assets - Cache First strategy
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      console.log('📋 Serving from cache:', request.url)
      return cachedResponse
    }

    console.log('🌐 Fetching static asset:', request.url)
    const response = await fetch(request)
    
    if (response.ok) {
      console.log('💾 Caching static asset:', request.url)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    console.error('❌ Static asset fetch failed:', error)
    
    // Return offline fallback for HTML requests
    if (request.destination === 'document') {
      const cache = await caches.open(STATIC_CACHE)
      return cache.match('/') || new Response('Offline - Please check your connection')
    }
    
    throw error
  }
}

// Handle API requests - Network First with fallback
async function handleAPIRequest(request) {
  try {
    console.log('🌐 Fetching API request:', request.url)
    
    // Try network first
    const response = await fetch(request, {
      headers: {
        ...request.headers,
        'Cache-Control': 'no-cache'
      }
    })

    if (response.ok) {
      const cache = await caches.open(API_CACHE)
      console.log('💾 Caching API response:', request.url)
      cache.put(request, response.clone())
      return response
    }

    throw new Error(`API request failed: ${response.status}`)
  } catch (error) {
    console.warn('⚠️ API request failed, trying cache:', error.message)
    
    // Fallback to cache
    const cache = await caches.open(API_CACHE)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      console.log('📋 Serving stale API data from cache:', request.url)
      return cachedResponse
    }

    // Return mock data for critical endpoints
    return createMockAPIResponse(request)
  }
}

// Handle image requests - Cache First with optimization
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(IMAGE_CACHE)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      console.log('🖼️ Serving image from cache:', request.url)
      return cachedResponse
    }

    console.log('🌐 Fetching image:', request.url)
    const response = await fetch(request)
    
    if (response.ok) {
      console.log('💾 Caching image:', request.url)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    console.error('❌ Image fetch failed:', error)
    
    // Return placeholder image
    return new Response(createPlaceholderImage(), {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400'
      }
    })
  }
}

// Handle blockchain requests - Network Only (real-time data)
async function handleBlockchainRequest(request) {
  try {
    console.log('⛓️ Blockchain request (network only):', request.url)
    return await fetch(request, {
      headers: {
        ...request.headers,
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error) {
    console.error('❌ Blockchain request failed:', error)
    
    // Return error response for blockchain calls
    return new Response(JSON.stringify({
      error: 'Network unavailable',
      message: 'Please check your connection and try again'
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

// Handle generic requests
async function handleGenericRequest(request) {
  try {
    return await fetch(request)
  } catch (error) {
    console.error('❌ Generic request failed:', request.url, error)
    throw error
  }
}

// Create mock API responses for offline functionality
function createMockAPIResponse(request) {
  const url = new URL(request.url)
  let mockData = {}

  if (url.pathname.includes('collection-data')) {
    mockData = {
      totalSupply: 3247,
      maxSupply: 5000,
      progress: 64.94,
      currentPhase: 'public'
    }
  } else if (url.pathname.includes('mint-events')) {
    mockData = {
      events: [
        { address: '0x123...abc', amount: 5, time: Date.now() - 30000 },
        { address: '0x456...def', amount: 2, time: Date.now() - 60000 }
      ]
    }
  } else if (url.pathname.includes('eligibility')) {
    mockData = {
      isEligible: true,
      phase: 'public',
      maxMints: 20
    }
  } else {
    mockData = { message: 'Offline mode - using cached data' }
  }

  return new Response(JSON.stringify(mockData), {
    headers: {
      'Content-Type': 'application/json',
      'X-From-Cache': 'offline-fallback'
    }
  })
}

// Create placeholder SVG image
function createPlaceholderImage() {
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="Arial, sans-serif" font-size="18" fill="#9ca3af">
        Image Unavailable
      </text>
      <text x="50%" y="60%" text-anchor="middle" dy="0.3em" font-family="Arial, sans-serif" font-size="12" fill="#6b7280">
        Please check your connection
      </text>
    </svg>
  `
  return svg
}

// Background sync for failed requests
self.addEventListener('sync', event => {
  if (event.tag === 'retry-failed-requests') {
    console.log('🔄 Retrying failed requests...')
    event.waitUntil(retryFailedRequests())
  }
})

// Retry failed requests when online
async function retryFailedRequests() {
  // Implementation would depend on how you store failed requests
  // This is a placeholder for the concept
  console.log('🔄 Background sync - retrying failed requests')
}

// Push notification handling
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/images/logo.jpg',
      badge: '/images/logo.jpg',
      data: data.data,
      requireInteraction: false,
      silent: false
    }

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close()
  
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  )
})

// Message handling from main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    getCacheSize().then(size => {
      event.ports[0].postMessage({ cacheSize: size })
    })
  }
})

// Get total cache size
async function getCacheSize() {
  const cacheNames = await caches.keys()
  let totalSize = 0
  
  for (const cacheName of cacheNames) {
    if (cacheName.startsWith('hypertoons-')) {
      const cache = await caches.open(cacheName)
      const keys = await cache.keys()
      totalSize += keys.length
    }
  }
  
  return totalSize
}

console.log('✅ Hypertoons Service Worker loaded successfully') 