const CACHE_PREFIX = "jarvis-";
const STATIC_CACHE = `${CACHE_PREFIX}static-v1`;
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./app.js",
  "./styles.css",
  "./manifest.webmanifest",
  "./404.html",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png"
];
const MANIFEST_PATH = "brain-manifest.json";
const BRAIN_ASSETS = new Set(["brain-meta.enc", "brain-vectors.enc"]);
// Sursă unică de adevăr pentru „care e pachetul curent". Fără ea, după o repornire a
// service worker-ului alegerea dintre mai multe cache-uri BRAIN ar fi arbitrară și s-ar
// putea păstra versiunea veche, ștergându-se cea nouă.
const CURRENT_MANIFEST_KEY = "./__jarvis_current_manifest";

let currentBrainCache = "";

function relativePath(url) {
  const scope = new URL(self.registration.scope);
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return "";
  return url.pathname.slice(scope.pathname.length);
}

function brainCacheName(manifest) {
  const metaIntegrity = manifest.integrity?.[manifest.metaFile];
  const vectorsIntegrity = manifest.integrity?.[manifest.vectorsFile];
  if (!metaIntegrity || !vectorsIntegrity) return "";
  return `${CACHE_PREFIX}brain-${metaIntegrity}-${vectorsIntegrity}`;
}

async function removeOldBrainCaches(cacheToKeep) {
  const names = await caches.keys();
  await Promise.all(
    names
      .filter(
        (name) =>
          name.startsWith(`${CACHE_PREFIX}brain-`) &&
          name !== cacheToKeep
      )
      .map((name) => caches.delete(name))
  );
}

async function rememberManifest(response) {
  const manifest = await response.clone().json();
  const nextBrainCache = brainCacheName(manifest);
  if (!nextBrainCache) throw new Error("Manifest BRAIN fără valori integrity valide.");

  const previousBrainCache = currentBrainCache;
  currentBrainCache = nextBrainCache;
  const cache = await caches.open(currentBrainCache);
  await cache.put("./brain-manifest.json", response.clone());

  // Marcăm explicit care pachet e cel curent, ca alegerea de după o repornire să nu depindă
  // de ordinea în care caches.keys() întoarce numele.
  const staticCache = await caches.open(STATIC_CACHE);
  await staticCache.put(CURRENT_MANIFEST_KEY, response.clone());

  if (previousBrainCache && previousBrainCache !== currentBrainCache) {
    await removeOldBrainCaches(currentBrainCache);
  }
  return response;
}

async function cachedManifestResponse() {
  if (currentBrainCache) {
    const currentCache = await caches.open(currentBrainCache);
    const currentMatch = await currentCache.match("./brain-manifest.json");
    if (currentMatch) return currentMatch;
  }

  // Marcajul explicit are întâietate față de o căutare prin cache-uri.
  const staticCache = await caches.open(STATIC_CACHE);
  const marked = await staticCache.match(CURRENT_MANIFEST_KEY);
  if (marked) {
    try {
      const name = brainCacheName(await marked.clone().json());
      if (name && (await caches.has(name))) {
        currentBrainCache = name;
        return marked;
      }
    } catch {
      // marcaj corupt — cădem pe căutarea de mai jos
    }
  }

  const names = await caches.keys();
  for (const name of names) {
    if (!name.startsWith(`${CACHE_PREFIX}brain-`)) continue;
    const cache = await caches.open(name);
    const match = await cache.match("./brain-manifest.json");
    if (match) {
      currentBrainCache = name;
      return match;
    }
  }

  return staticCache.match("./brain-manifest.json");
}

async function networkFirstManifest(request) {
  try {
    const response = await fetch(request);
    if (!response.ok) throw new Error(`Manifest HTTP ${response.status}`);
    return await rememberManifest(response);
  } catch {
    const cached = await cachedManifestResponse();
    if (cached) return cached;
    throw new Error("Manifestul BRAIN nu este disponibil offline.");
  }
}

async function ensureBrainCache() {
  if (currentBrainCache) return currentBrainCache;
  const manifestResponse = await cachedManifestResponse();
  if (!manifestResponse) throw new Error("Manifestul BRAIN nu este în cache.");
  const manifest = await manifestResponse.clone().json();
  currentBrainCache = brainCacheName(manifest);
  if (!currentBrainCache) throw new Error("Manifest BRAIN fără valori integrity valide.");
  return currentBrainCache;
}

function toHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map((octet) => octet.toString(16).padStart(2, "0"))
    .join("");
}

async function expectedIntegrity(path) {
  const manifestResponse = await cachedManifestResponse();
  if (!manifestResponse) return "";
  try {
    const manifest = await manifestResponse.clone().json();
    return manifest.integrity?.[path] || "";
  } catch {
    return "";
  }
}

async function cacheFirstBrainAsset(request, path) {
  const cacheName = await ensureBrainCache();
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  // Ocolim cache-ul HTTP al browserului: aplicația cere fișierele .enc cu force-cache,
  // iar dacă acolo a rămas o versiune greșită, ea ar fi servită la nesfârșit chiar și
  // după ce serverul s-a reparat. Cu service worker activ, Cache API e singura memorie.
  const response = await fetch(new Request(request.url, { cache: "no-store" }));
  if (!response.ok) return response;

  // Valorile din integrity se VERIFICĂ, nu se folosesc doar ca etichetă de cache.
  // Altfel, o publicare neatomică (manifest nou servit înaintea fișierelor noi) ar
  // otrăvi permanent cache-ul versiunii noi cu octeți vechi, iar reîncercările nu ar
  // mai ajunge niciodată la rețea.
  const expected = await expectedIntegrity(path);
  if (expected) {
    const bytes = await response.clone().arrayBuffer();
    const actual = toHex(await crypto.subtle.digest("SHA-256", bytes));
    if (actual !== expected) {
      return new Response(bytes, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
    }
  }

  await cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidateStatic(request, event) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request, { ignoreSearch: true });
  const networkUpdate = fetch(request).then(async (response) => {
    if (response.ok) await cache.put(request, response.clone());
    return response;
  });

  event.waitUntil(networkUpdate.then(() => undefined).catch(() => undefined));
  if (cached) return cached;
  return networkUpdate;
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(STATIC_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    const cached =
      (await cache.match(request, { ignoreSearch: true })) ||
      (await cache.match("./index.html")) ||
      (await cache.match("./"));
    if (cached) return cached;
    throw new Error("Aplicația nu este disponibilă offline.");
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const manifestResponse = await cachedManifestResponse();
      if (manifestResponse) {
        const manifest = await manifestResponse.clone().json();
        currentBrainCache = brainCacheName(manifest);
      }

      const names = await caches.keys();
      await Promise.all(
        names
          .filter(
            (name) =>
              name.startsWith(CACHE_PREFIX) &&
              name !== STATIC_CACHE &&
              name !== currentBrainCache
          )
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  const path = relativePath(url);

  if (event.request.mode === "navigate" && url.origin === location.origin) {
    event.respondWith(networkFirstNavigation(event.request));
    return;
  }

  if (path === MANIFEST_PATH) {
    event.respondWith(networkFirstManifest(event.request));
    return;
  }

  if (BRAIN_ASSETS.has(path)) {
    event.respondWith(cacheFirstBrainAsset(event.request, path));
    return;
  }

  if (url.origin === location.origin) {
    event.respondWith(staleWhileRevalidateStatic(event.request, event));
  }
});
