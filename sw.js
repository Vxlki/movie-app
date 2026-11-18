// Service worker: face aplicația să meargă offline.
// Când modifici index.html, crește VERSION ca telefonul să ia versiunea nouă.
const VERSION = 'filme-v4';
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

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== POSTERS).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

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

  // Fișierele aplicației: răspundem imediat din cache și actualizăm în fundal
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.open(VERSION).then(async (c) => {
        const key = req.mode === 'navigate' ? './index.html' : req;
        const hit = await c.match(key);
        const net = fetch(req)
          .then((res) => { if (res.ok) c.put(key, res.clone()); return res; })
          .catch(() => null);
        return hit || (await net) || new Response('Offline', { status: 503 });
      })
    );
  }
});
