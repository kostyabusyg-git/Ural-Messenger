const CACHE = 'ural-v5'; // Меняй версию при каждом деплое (v2, v3...)
const ASSETS = [
  '/Ural-Messenger/',
  '/Ural-Messenger/index.html',
  '/Ural-Messenger/manifest.json',
  '/Ural-Messenger/icon-192.png',
  '/Ural-Messenger/icon-512.png'
];

// Принудительно активируем новый SW сразу
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
});

// Захватываем все вкладки и чистим старый кэш
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Сеть в приоритете для index.html, кэш — для остального
self.addEventListener('fetch', e => {
  // Не кэшируем Supabase
  if (e.request.url.includes('supabase.co')) return;
  
  // index.html — всегда из сети (свежий)
  if (e.request.url.endsWith('/index.html') || e.request.url.endsWith('/')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }
  
  // Остальное — кэш, потом сеть
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
