/* eslint-disable no-restricted-globals */
const CACHE = 'snake-pwa-v2';
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const ks = await caches.keys();
    await Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;

  // HTML: network-first, fallback to cache
  if (r.mode === 'navigate' || (r.headers.get('accept') || '').includes('text/html')) {
    e.respondWith(fetch(r).then((res) => {
      const cp = res.clone(); caches.open(CACHE).then((c) => c.put(r, cp));
      return res;
    }).catch(() => caches.match('./')));
    return;
  }

  // Static: cache-first
  e.respondWith(caches.match(r).then((c) => c || fetch(r).then((res) => {
    const cp = res.clone(); caches.open(CACHE).then((ca) => ca.put(r, cp));
    return res;
  })));
});
