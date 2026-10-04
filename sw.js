/* CSLingo service worker: makes the app work offline and install as an app.
   Registered as sw.js?v=<build> (tools/stamp.py sets the build), so every deploy gets its own cache.
   - Page loads: the network first, so a new deploy shows up straight away. If it hasn't answered in 3 seconds (a bad connection),
     or fails, or answers with an error, the saved copy of the page is used. Only good (200) pages are ever saved.
   - Everything else on this site (versioned js/css/vendor/assets): cache first, filled as it is used.
   - First visit: once the app has loaded, the page posts the list of files it used (performance.getEntriesByType("resource")) and
     this worker saves them, so the app opens offline without having to be visited twice. The big optional downloads (the Python
     runtime, the revision questions, the trailer) are not on that list: they are saved only when somebody uses them.
   - A new deploy keeps the previous cache until the new one is filled (marked with ./__ready), so going offline right after an
     update still opens the old, complete copy instead of a half-empty new one.
   - Other origins (Supabase sync) are never touched. */
const VERSION = new URL(self.location).searchParams.get("v") || "dev";
const CACHE = "cslingo-" + VERSION;
const READY = "./__ready"; // present in a cache once it holds the whole app
const SHELL = "./index.html";
const NAV_WAIT_MS = 3000;
const SKIP = /\/(vendor\/(pyodide|rive)|js\/bank|trailer)\/|\.(mp4|webm|gif|wasm)$/;

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(["./", SHELL, "./manifest.webmanifest"]))
      .then(() => self.skipWaiting()),
  );
});

/* Old caches go only when this one is complete (or was never needed): until then they are still the best offline copy. */
async function ready(name) {
  return !!(await (await caches.open(name)).match(READY));
}
async function dropOld() {
  if (!(await ready(CACHE))) return;
  const ks = await caches.keys();
  await Promise.all(ks.filter((k) => k.startsWith("cslingo-") && k !== CACHE).map((k) => caches.delete(k)));
}
self.addEventListener("activate", (e) => {
  e.waitUntil(dropOld().then(() => self.clients.claim()));
});

/* The caches to look in, best first: this build when it is complete, then any other complete one, then whatever is left. */
async function order() {
  const names = (await caches.keys()).filter((k) => k.startsWith("cslingo-"));
  const flags = await Promise.all(names.map(ready));
  const full = names.filter((_, i) => flags[i]),
    rest = names.filter((_, i) => !flags[i]);
  return [...(full.includes(CACHE) ? [CACHE] : []), ...full.filter((k) => k !== CACHE), ...rest];
}
async function savedShell() {
  for (const name of await order()) {
    const hit = await (await caches.open(name)).match(SHELL);
    if (hit) return hit;
  }
  return null;
}

/* The page posts the files it loaded; fetch the ones not saved yet, a few at a time, then mark the cache complete. */
async function precache(urls) {
  const c = await caches.open(CACHE);
  const todo = [...new Set(urls)].filter((u) => {
    const x = new URL(u, self.location);
    return x.origin === self.location.origin && !SKIP.test(x.pathname);
  });
  let next = 0,
    failed = 0;
  const worker = async () => {
    while (next < todo.length) {
      const u = todo[next++];
      try {
        if (await c.match(u)) continue;
        const r = await fetch(u);
        if (r.ok) await c.put(u, r);
        else failed++;
      } catch {
        failed++;
      }
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  if (!failed) {
    await c.put(READY, new Response("ok"));
    await dropOld();
  }
}
self.addEventListener("message", (e) => {
  const d = e.data;
  if (d && d.type === "precache" && Array.isArray(d.urls)) e.waitUntil(precache(d.urls));
});

/* A page: the network, unless it is slow or broken and a saved copy exists. */
async function page(req) {
  const net = fetch(req).then(async (r) => {
    if (r.ok) (await caches.open(CACHE)).put(SHELL, r.clone());
    return r;
  });
  net.catch(() => {}); // the race below may already have settled: never leave this one unhandled
  const slow = new Promise((ok) => setTimeout(ok, NAV_WAIT_MS)).then(savedShell);
  try {
    const first = await Promise.race([net.then((r) => (r.ok ? r : null)), slow]);
    if (first) return first;
    const saved = await savedShell(); // the network was slow, and the saved copy is gone, or it answered with an error
    return saved || (await net);
  } catch {
    return (await savedShell()) || Response.error();
  }
}

self.addEventListener("fetch", (e) => {
  const req = e.request,
    url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin || req.headers.has("range")) return;
  if (req.mode === "navigate") {
    e.respondWith(page(req));
    return;
  }
  e.respondWith(
    (async () => {
      const own = await (await caches.open(CACHE)).match(req);
      const hit = own || (await caches.match(req));
      if (hit) return hit;
      const r = await fetch(req);
      if (r.ok) (await caches.open(CACHE)).put(req, r.clone());
      return r;
    })(),
  );
});
