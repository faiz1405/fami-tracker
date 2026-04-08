const SW_VERSION = "v3";
const STATIC_CACHE = `fami-static-${SW_VERSION}`;
const RUNTIME_CACHE = `fami-runtime-${SW_VERSION}`;
const CACHE_PREFIX = "fami-";
const MAX_RUNTIME_ENTRIES = 120;

const PRECACHE_URLS = [
  "/",
  "/dashboard",
  "/history",
  "/analytics",
  "/offline",
  "/manifest.webmanifest",
  "/logo.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX))
            .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.match(/\.(?:js|css|png|jpg|jpeg|webp|svg|woff2?)$/i)
  );
}

function isRscDataRequest(request, url) {
  return (
    request.headers.has("rsc") ||
    request.headers.has("next-router-state-tree") ||
    request.headers.has("next-url") ||
    url.searchParams.has("_rsc")
  );
}

function trimRuntimeCache(cacheName, maxEntries) {
  return caches.open(cacheName).then(async (cache) => {
    const keys = await cache.keys();
    if (keys.length <= maxEntries) {
      return;
    }
    const toDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(toDelete.map((request) => cache.delete(request)));
  });
}

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    await cache.put(request, response.clone());
    await trimRuntimeCache(RUNTIME_CACHE, MAX_RUNTIME_ENTRIES);
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return (await caches.match("/offline")) || Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const networkPromise = fetch(request)
    .then(async (response) => {
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put(request, response.clone());
      await trimRuntimeCache(RUNTIME_CACHE, MAX_RUNTIME_ENTRIES);
      return response;
    })
    .catch(() => null);

  if (cached) {
    return cached;
  }
  const network = await networkPromise;
  return network || Response.error();
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // External API selalu network only.
  if (url.origin !== self.location.origin) {
    return;
  }

  // API internal juga network only agar data selalu fresh.
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Request data dinamis Next.js (RSC/flight) harus selalu fresh.
  if (isRscDataRequest(request, url)) {
    event.respondWith(fetch(request));
    return;
  }
  // Untuk request lain yang bukan aset statis, utamakan network agar tidak stale.
  event.respondWith(fetch(request));
});
