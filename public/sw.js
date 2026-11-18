self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.delete("addisvault-static-v1"),
      self.registration.unregister(),
    ]),
  );
});
