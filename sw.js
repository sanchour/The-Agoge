const CACHE_NAME = 'agoge-cache-v40';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './icon.svg',
  './manifest.json',
  './data/legacy-content.json',
  './css/design-tokens.css',
  './css/reset.css',
  './css/typography.css',
  './css/glass.css',
  './css/animations.css',
  './css/layout.css',
  './css/components.css',
  './css/liquid-slider.css',
  './css/splash.css',
  './css/home.css',
  './css/statistics.css',
  './css/stoa.css',
  './css/settings.css',
  './js/app.js',
  './js/store.js',
  './js/router.js',
  './js/spring.js',
  './js/validation.js',
  './js/ripple-engine.js',
  './js/discipline-index.js',
  './js/icons.js',
  './js/components/tab-bar.js',
  './js/components/modal-sheet.js',
  './js/components/hero-card.js',
  './js/components/liquid-slider.js',
  './js/components/timeline-widget.js',
  './js/components/tdee.js',
  './js/components/discipline-ring.js',
  './js/components/quick-log.js',
  './js/components/onboarding.js',
  './js/components/calendar-view.js',
  './js/components/chart-weight.js',
  './js/components/chart-bf.js',
  './js/components/chart-comparison.js',
  './js/screens/home.js',
  './js/screens/statistics.js',
  './js/screens/stoa.js',
  './js/screens/settings.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((url) => cache.add(url).catch((err) => console.warn('[SW] Cache failed for:', url, err)))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback handled by returning cachedResponse
        });

      return cachedResponse || fetchPromise;
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(event.data.title || 'AGOGE Check-In', {
      body: event.data.body || 'Record your daily metrics, Spartan.',
      icon: './icon.svg',
      badge: './icon.svg',
      tag: 'agoge-daily-checkin'
    });
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./');
      }
    })
  );
});
