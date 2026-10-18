const CACHE = 'ural-v1';
const ASSETS = [
  '/Ural-Messenger/',
  '/Ural-Messenger/index.html',
  '/Ural-Messenger/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', e => {
  // Не кэшируем запросы к Supabase (Realtime, API)
  if (e.request.url.includes('supabase.co')) return;
  
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
