const CACHE_NAME = 'advb-v2';
const ASSETS = [
  '/login.html',
  '/index.html',
  '/admin.html',
  '/icon.jpg',
  '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Ignorar requisições não-GET (POST, PUT, etc.) e extensões de Chrome
  if (e.request.method !== 'GET') return;
  if (e.request.url.startsWith('chrome-extension://')) return;
  if (e.request.url.includes('firestore.googleapis.com')) return;
  if (e.request.url.includes('firebase')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Só cachear respostas válidas
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
