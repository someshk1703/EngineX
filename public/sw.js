// EngineX Service Worker — Cache-first for static assets, network-first for API
const CACHE_NAME = 'enginex-v1'
const STATIC_ASSETS = ['/', '/index.html', '/manifest.json']

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET, chrome-extension, and cross-origin API calls
  if (request.method !== 'GET') return
  if (url.protocol === 'chrome-extension:') return
  if (url.hostname !== self.location.hostname && !url.pathname.startsWith('/')) return

  // Network-first for navigation (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((c) => c.put(request, clone))
          return res
        })
        .catch(() => caches.match('/index.html'))
    )
    return
  }

  // Cache-first for static assets (JS, CSS, fonts, images)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((res) => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((c) => c.put(request, clone))
        }
        return res
      })
    })
  )
})
