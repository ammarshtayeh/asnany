const CACHE_NAME = "malamih-shell-v3";
const APP_SHELL = ["/", "/manifest.json", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

function shouldCache(url: URL) {
  if (url.pathname.startsWith("/api/")) return false;
  if (url.pathname.startsWith("/admin")) return false;
  if (url.pathname === "/doctor" || url.pathname.startsWith("/doctor/")) return false;
  return url.origin === self.location.origin;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (!shouldCache(url)) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && request.url.startsWith(self.location.origin)) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") return caches.match("/");
        throw new Error("Offline and no cache match");
      })
  );
});

self.addEventListener("push", (event) => {
  let payload = { title: "ملامح", body: "تحديث على موعدك", url: "/appointments", data: {} };
  try {
    payload = { ...payload, ...(event.data ? event.data.json() : {}) };
  } catch {
    payload.body = event.data?.text() || payload.body;
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icon-512.png",
      badge: "/icon-512.png",
      data: { url: payload.url, ...(payload.data || {}) },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/appointments";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
