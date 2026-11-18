// AddisVault Offline-First Service Worker (Guarded Static Asset & Offline Shell Cache)
const CACHE_NAME = "addisvault-static-v1";
const SHELL_URLS = [
  "/",
  "/manifest.webmanifest",
  "/favicon.png",
  "/icon.svg",
  "/apple-touch-icon.png",
  "/pwa-192x192.png",
  "/pwa-512x512.png",
  "/pwa-maskable-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_URLS).catch(() => undefined))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept server functions, API endpoints, auth, or Supabase calls
  if (
    url.pathname.startsWith("/_server") ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/")
  ) {
    return;
  }

  // Network-first for HTML documents so fresh releases load immediately
  if (req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const clone = res.clone();
            caches
              .open(CACHE_NAME)
              .then((c) => c.put(req, clone))
              .catch(() => undefined);
          }
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match("/"))),
    );
    return;
  }

  // Stale-while-revalidate for static scripts, styles, fonts, and images
  if (
    url.pathname.startsWith("/assets/") ||
    /\.(?:js|css|png|jpg|jpeg|svg|webp|woff2|webmanifest)$/i.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetched = fetch(req)
          .then((res) => {
            if (res && res.status === 200 && res.type === "basic") {
              const clone = res.clone();
              caches
                .open(CACHE_NAME)
                .then((c) => c.put(req, clone))
                .catch(() => undefined);
            }
            return res;
          })
          .catch(() => cached);
        return cached || fetched;
      }),
    );
  }
});
