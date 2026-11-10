/* Driver offline worker: the app opens and works with no signal (tunnels, parking garages,
 * the edge of town). All the data already lives in the phone (localStorage) and the cloud
 * sync pushes when the signal is back; this worker only keeps the app's own files.
 *
 * - Pages: network first (a fresh version whenever there is signal), the saved copy after
 *   NAV_TIMEOUT_MS or with no signal. On install it saves every tab with the files it needs.
 * - /assets/*: the build's hashed files never change, so the saved copy is used first.
 * - Pictures, animation strips, sounds, fonts: the saved copy right away, refreshed behind.
 * - Everything else (Supabase, server functions, other sites) is not touched.
 *
 * Emergency off switch: replace this file with one that calls self.registration.unregister().
 */
const VERSION = "v1";
const PAGES = `driver-pages-${VERSION}`;
const FILES = `driver-files-${VERSION}`;
const TABS = ["/", "/add", "/trip", "/reports", "/calendar", "/settings", "/map"];
const NAV_TIMEOUT_MS = 3500;
const MAX_FILES = 400;
const STATIC_PREFIXES = ["/anim/", "/characters/", "/backdrops/", "/textures/", "/sounds/"];
const STATIC_FILES = [
  "/manifest.webmanifest",
  "/favicon.png",
  "/favicon.ico",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];
const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", (event) => {
  event.waitUntil(saveTabs().catch(() => undefined));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([PAGES, FILES]);
      for (const key of await caches.keys()) {
        if (key.startsWith("driver-") && !keep.has(key)) await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  );
});

/** The page sends the files it already loaded, so they are kept too. */
self.addEventListener("message", (event) => {
  const msg = event.data;
  if (msg?.type === "keep" && Array.isArray(msg.urls)) {
    event.waitUntil(keepFiles(msg.urls));
  } else if (msg?.type === "refresh-tabs") {
    event.waitUntil(saveTabs().catch(() => undefined));
  }
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    if (req.mode === "navigate") {
      if (url.pathname.startsWith("/app-login") || url.pathname.startsWith("/auth")) return;
      event.respondWith(page(req, url));
      return;
    }
    if (url.pathname.startsWith("/assets/")) {
      event.respondWith(cacheFirst(req));
      return;
    }
    if (isStatic(url.pathname)) {
      event.respondWith(savedThenRefresh(event, req));
    }
    return;
  }
  if (FONT_HOSTS.includes(url.hostname)) event.respondWith(savedThenRefresh(event, req));
});

function isStatic(path) {
  return STATIC_FILES.includes(path) || STATIC_PREFIXES.some((p) => path.startsWith(p));
}

async function page(req, url) {
  const cache = await caches.open(PAGES);
  const key = url.pathname;
  try {
    const res = await withTimeout(fetch(req), NAV_TIMEOUT_MS);
    if (res.ok && (res.headers.get("content-type") || "").includes("text/html")) {
      cache.put(key, res.clone());
    }
    return res;
  } catch {
    // No signal (or too slow): the saved copy of this tab.
    const saved = await cache.match(key);
    if (saved) return saved;
    return new Response(OFFLINE_HTML, {
      status: 503,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(FILES);
  const saved = await cache.match(req);
  if (saved) return saved;
  const res = await fetch(req);
  if (res.ok) {
    await cache.put(req, res.clone());
    trim(cache);
  }
  return res;
}

async function savedThenRefresh(event, req) {
  const cache = await caches.open(FILES);
  const saved = await cache.match(req);
  const fresh = fetch(req)
    .then(async (res) => {
      if (res.ok || res.type === "opaque") await cache.put(req, res.clone());
      return res;
    })
    .catch(() => undefined);
  if (saved) {
    event.waitUntil(fresh);
    return saved;
  }
  return (await fresh) || new Response("", { status: 504 });
}

/** Saves every tab's page and the scripts and styles it names, for the first offline open. */
async function saveTabs() {
  const pages = await caches.open(PAGES);
  const files = new Set();
  for (const tab of TABS) {
    try {
      const res = await fetch(tab, { credentials: "same-origin" });
      if (!res.ok) continue;
      const html = await res.clone().text();
      await pages.put(tab, res);
      for (const m of html.matchAll(/(?:href|src)="(\/assets\/[^"]+)"/g)) files.add(m[1]);
    } catch {
      // One tab failing is fine; it is saved the next time it is opened.
    }
  }
  // Parts that load later (a chart, the PDF export) are named inside the scripts: one more
  // look there finds them, so a tab never breaks offline. Skipped with data saver on.
  if (!self.navigator.connection?.saveData) {
    const seen = new Set();
    for (let round = 0; round < 2; round++) {
      for (const f of [...files]) {
        if (!f.endsWith(".js") || seen.has(f)) continue;
        seen.add(f);
        try {
          const text = await (await cachedOrFetch(f)).text();
          for (const m of text.matchAll(/assets\/([\w.-]+\.(?:js|css))/g)) files.add(`/assets/${m[1]}`);
        } catch {
          // Missing file: skip it.
        }
      }
    }
  }
  await keepFiles([...files, ...STATIC_FILES]);
}

async function cachedOrFetch(path) {
  const cache = await caches.open(FILES);
  const saved = await cache.match(path);
  if (saved) return saved;
  const res = await fetch(path);
  if (res.ok) await cache.put(path, res.clone());
  return res;
}

async function keepFiles(urls) {
  const cache = await caches.open(FILES);
  for (const raw of urls) {
    try {
      const url = new URL(raw, self.location.origin);
      const same = url.origin === self.location.origin;
      if (same && !url.pathname.startsWith("/assets/") && !isStatic(url.pathname)) continue;
      if (!same && !FONT_HOSTS.includes(url.hostname)) continue;
      if (await cache.match(url.href)) continue;
      const res = await fetch(url.href, same ? {} : { mode: "cors" });
      if (res.ok) await cache.put(url.href, res);
    } catch {
      // Skipped; it is saved when the app asks for it.
    }
  }
  trim(cache);
}

/** Keeps the files cache from growing forever across versions (oldest first). */
async function trim(cache) {
  const keys = await cache.keys();
  const extra = keys.length - MAX_FILES;
  for (let i = 0; i < extra; i++) await cache.delete(keys[i]);
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

const OFFLINE_HTML = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>דרייבר</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f3ead3;
color:#2a2118;font-family:system-ui,sans-serif;text-align:center}
.c{border:3px solid #2a2118;border-radius:18px;padding:28px 22px;margin:16px;background:#fffaf0;
box-shadow:5px 5px 0 #2a2118;max-width:320px}h1{margin:0 0 8px;font-size:24px}
button{margin-top:16px;font:inherit;font-weight:700;padding:10px 22px;border-radius:999px;
border:3px solid #2a2118;background:#f5b82e;box-shadow:3px 3px 0 #2a2118}</style></head>
<body><div class="c"><h1>אין קליטה כרגע</h1><p>הנתונים שלך שמורים בטלפון.<br>
ברגע שתחזור קליטה, האפליקציה תיפתח כרגיל.</p>
<button onclick="location.reload()">לנסות שוב</button></div></body></html>`;
