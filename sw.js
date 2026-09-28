/* CSLingo service worker: makes the app work offline and install as an app.
   Registered as sw.js?v=<build> (tools/stamp.py sets the build), so every deploy gets a fresh cache.
   - Page loads: network first, so a new deploy shows up straight away; the cached copy is used offline.
   - Everything else on this site (versioned js/css/vendor/assets): cache first, filled as it's used.
   - Other origins (Supabase sync) are never touched. */
const VERSION = new URL(self.location).searchParams.get("v") || "dev";
const CACHE = "cslingo-" + VERSION;

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["./", "./index.html", "./manifest.webmanifest"])).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("cslingo-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put("./index.html", copy)); return r; }).catch(() => caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return r; })));
});
