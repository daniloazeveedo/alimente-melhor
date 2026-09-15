/* ============================================================
   Service Worker — Alimente Melhor
   Estratégia: cache-first para assets, network-first para HTML
   ============================================================ */

const CACHE_NAME = 'alimente-melhor-v6';

const PRECACHE_URLS = [
  './',
  './index.html',
  './calculadora.html',
  './receitas.html',
  './guia.html',
  './unidades.html',
  './rotulo.html',
  './peso.html',
  './lembretes.html',
  './manifest.json',
  './css/variables.css',
  './css/style.css',
  './css/unidades.css',
  './css/peso.css',
  './js/imc.js',
  './js/unidades.js',
  './js/ui.js',
  './js/favoritos.js',
  './js/peso.js',
  './js/lembretes.js',
  './js/hero.js',
  './data/unidades.json',
  './assets/icons/icon.svg',
  './assets/icons/icon-192.png'
];

// Instalação — pré-cache dos arquivos essenciais
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Ativação — limpa caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch — network-first para HTML, cache-first para o resto
self.addEventListener('fetch', event => {
  const req = event.request;

  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // HTML: tenta rede, fallback pro cache
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          return response;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // CSS/JS/imagens: cache-first, atualiza em background
  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(response => {
        if (response && response.status === 200 && url.origin === self.location.origin) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        }
        return response;
      }).catch(() => cached);

      return cached || network;
    })
  );
});
