const CACHE = 'cmt-tracker-v4';
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

// Network-first for same-origin GETs so new code is always picked up when online;
// the freshly fetched response is cached for offline use. Falls back to cache when
// the network is unavailable. This avoids stale app.js/CSS after an update.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const sameOrigin = new URL(req.url).origin === self.location.origin;

  if (sameOrigin) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(req).then(cached => cached || caches.match('/index.html')))
    );
  } else {
    // Cross-origin (e.g. the Chart.js CDN): cache-first, then network.
    e.respondWith(caches.match(req).then(cached => cached || fetch(req)));
  }
});

const TZ = 'America/New_York';

// Notification scheduling
self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE_MORNING') scheduleMorningNotification();
  if (e.data?.type === 'SCHEDULE_EVENING') scheduleEveningNotification();
});

// Returns the UTC Date corresponding to a given hour:minute in Eastern Time on the
// current or next Eastern calendar day (whichever is still in the future).
function getNextETTime(hour, minute) {
  const now = new Date();

  function etToUTC(etDateStr) {
    const [year, month, day] = etDateStr.split('-').map(Number);
    // Try EDT (UTC-4) then EST (UTC-5); pick whichever gives the intended ET hour
    for (const off of [4, 5]) {
      const candidate = new Date(Date.UTC(year, month - 1, day, hour + off, minute));
      const etH = parseInt(
        new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: '2-digit', hour12: false })
          .format(candidate),
        10
      ) % 24;
      if (etH === hour) return candidate;
    }
    // DST edge-case fallback: assume EST (-5)
    return new Date(Date.UTC(year, month - 1, day, hour + 5, minute));
  }

  const todayET = now.toLocaleDateString('en-CA', { timeZone: TZ });
  let target = etToUTC(todayET);
  if (target <= now) {
    const tomorrowET = new Date(now.getTime() + 86400000).toLocaleDateString('en-CA', { timeZone: TZ });
    target = etToUTC(tomorrowET);
  }
  return target;
}

const ICON = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🥄</text></svg>";

// Morning check-in — 5:15 AM Eastern
function scheduleMorningNotification() {
  const delay = getNextETTime(5, 15) - Date.now();
  setTimeout(() => {
    self.registration.showNotification('Good morning! 🌅', {
      body: 'Time for your morning check-in. How are you feeling today?',
      icon: ICON,
      tag: 'morning-checkin',
      requireInteraction: true,
      actions: [{ action: 'open', title: 'Open Tracker' }]
    });
    scheduleMorningNotification();
  }, delay);
}

// End-of-day reflection — 9:00 PM Eastern (opt-in)
function scheduleEveningNotification() {
  const delay = getNextETTime(21, 0) - Date.now();
  setTimeout(() => {
    self.registration.showNotification('How was today? 🌙', {
      body: 'Take a moment for your end-of-day reflection.',
      icon: ICON,
      tag: 'evening-reflection',
      requireInteraction: true,
      actions: [{ action: 'open', title: 'Open Tracker' }]
    });
    scheduleEveningNotification();
  }, delay);
}
