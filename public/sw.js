const CACHE_NAME = "ilumitek-cache-v1"
const RUNTIME_CACHE = "ilumitek-runtime-v1"

// Archivos esenciales para cachear durante la instalación
const PRECACHE_URLS = ["/", "/login", "/offline.html"]

// Instalación del Service Worker
self.addEventListener("install", (event) => {
  console.log("[SW] Instalando Service Worker...")
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Precacheando archivos")
        return cache.addAll(PRECACHE_URLS.map((url) => new Request(url, { cache: "reload" })))
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error("[SW] Error en precache:", error)
      }),
  )
})

// Activación del Service Worker
self.addEventListener("activate", (event) => {
  console.log("[SW] Activando Service Worker...")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE
            })
            .map((cacheName) => {
              console.log("[SW] Eliminando cache antigua:", cacheName)
              return caches.delete(cacheName)
            }),
        )
      })
      .then(() => self.clients.claim()),
  )
})

// Estrategia de caché: Network First con fallback a Cache
self.addEventListener("fetch", (event) => {
  // Solo cachear peticiones GET
  if (event.request.method !== "GET") {
    return
  }

  // Ignorar peticiones a APIs externas y chrome-extension
  const url = new URL(event.request.url)
  if (url.origin !== location.origin || url.pathname.startsWith("/api/") || url.protocol === "chrome-extension:") {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, clonarla y guardarla en cache
        if (response && response.status === 200 && response.type === "basic") {
          const responseToCache = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }
        return response
      })
      .catch(() => {
        // Si falla la red, intentar obtener del cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          // Si no hay cache, mostrar página offline para navegación
          if (event.request.mode === "navigate") {
            return caches.match("/offline.html")
          }
          return new Response("Sin conexión", {
            status: 503,
            statusText: "Service Unavailable",
            headers: new Headers({
              "Content-Type": "text/plain",
            }),
          })
        })
      }),
  )
})

// Manejo de mensajes desde el cliente
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
      }),
    )
  }
})
