// Service worker: face aplicația să meargă offline și să ia rapid versiunile noi.
// - index.html, secrete.txt, manifest: întâi de pe internet (fără cache-ul browserului),
//   iar dacă nu e internet sau răspunsul întârzie peste 4 secunde, din cache.
// - iconițe: din cache.  - postere: din cache, descărcate o singură dată.
// Când modifici fișierele, poți crește VERSION (curăță cache-ul vechi).
const VERSION = 'filme-v7';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './secrete.txt',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];
const POSTERS = 'filme-postere';
const FRESH = /(\/|\.html|\.txt|\.webmanifest)$/; // fișiere care trebuie să fie mereu la zi

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION)
      .then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== POSTERS).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function withTimeout(p, ms) {
  return new Promise((ok, fail) => { const t = setTimeout(() => fail(new Error('timeout')), ms); p.then((v) => { clearTimeout(t); ok(v); }, (er) => { clearTimeout(t); fail(er); }); });
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // API-ul TMDB: mereu de pe internet
  if (url.hostname === 'api.themoviedb.org') return;

  // Postere: din cache dacă există, altfel de pe internet și le păstrăm
  if (url.hostname === 'image.tmdb.org') {
    e.respondWith(
      caches.open(POSTERS).then(async (c) => {
        const hit = await c.match(req);
        if (hit) return hit;
        try {
          const res = await fetch(req);
          if (res.ok || res.type === 'opaque') c.put(req, res.clone());
          return res;
        } catch (err) {
          return new Response('', { status: 504 });
        }
      })
    );
    return;
  }

  if (url.origin !== self.location.origin) return;
  const isPage = req.mode === 'navigate';
  const key = isPage ? './index.html' : url.pathname.endsWith('/') ? './index.html' : req;

  // Pagina și textele: întâi rețeaua (fără cache HTTP), cu rezervă din cache
  if (isPage || FRESH.test(url.pathname)) {
    e.respondWith(
      caches.open(VERSION).then(async (c) => {
        const net = fetch(isPage ? url.href.split('#')[0] : req, { cache: 'no-cache', credentials: 'same-origin' })
          .then((res) => { if (res.ok) c.put(key, res.clone()); return res; });
        try { return await withTimeout(net, 4000); }
        catch (err) {
          const hit = await c.match(key);
          if (hit) return hit;
          try { return await net; } catch (er) { return new Response('Offline', { status: 503 }); }
        }
      })
    );
    return;
  }

  // Restul (iconițe): din cache, altfel de pe internet
  e.respondWith(
    caches.open(VERSION).then(async (c) => {
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) c.put(req, res.clone());
      return res;
    })
  );
});
