const CACHE = 'cmt-tracker-v1';
const ASSETS = ['/', '/index.html', '/styles.css', '/app.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => cached))
  );
});

// Morning check-in notification at 7 AM
self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE_MORNING') {
    scheduleMorningNotification();
  }
});

function scheduleMorningNotification() {
  const now = new Date();
  const next7am = new Date();
  next7am.setHours(5, 15, 0, 0);
  if (next7am <= now) next7am.setDate(next7am.getDate() + 1);
  const delay = next7am - now;

  setTimeout(() => {
    self.registration.showNotification('Good morning! 🌅', {
      body: 'Time for your morning check-in. How are you feeling today?',
      icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🥄</text></svg>",
      tag: 'morning-checkin',
      requireInteraction: true,
      actions: [{ action: 'open', title: 'Open Tracker' }]
    });
    scheduleMorningNotification(); // reschedule for next day
  }, delay);
}
