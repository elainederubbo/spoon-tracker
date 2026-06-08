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

// Morning check-in notification at 5:15 AM Eastern Time
self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE_MORNING') {
    scheduleMorningNotification();
  }
});

// Returns the UTC Date that corresponds to 5:15 AM Eastern Time on the
// current or next Eastern calendar day (whichever is still in the future).
function getNext515amET() {
  const TZ = 'America/New_York';
  const now = new Date();

  // Given an ET calendar date string ("YYYY-MM-DD"), find the UTC Date
  // that represents 5:15 AM on that ET date.
  function et515ToUTC(etDateStr) {
    const [year, month, day] = etDateStr.split('-').map(Number);
    // Try EDT (UTC-4) then EST (UTC-5); pick whichever gives exactly 05:xx ET hour
    for (const off of [4, 5]) {
      const candidate = new Date(Date.UTC(year, month - 1, day, 5 + off, 15));
      const etH = parseInt(
        new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: '2-digit', hour12: false })
          .format(candidate),
        10
      ) % 24;
      if (etH === 5) return candidate;
    }
    // DST edge-case fallback: use EST (-5)
    return new Date(Date.UTC(year, month - 1, day, 10, 15));
  }

  const todayET = now.toLocaleDateString('en-CA', { timeZone: TZ });
  let target = et515ToUTC(todayET);

  if (target <= now) {
    // Get tomorrow's ET date by advancing 24 hours and re-formatting
    const tomorrow = new Date(now.getTime() + 86400000);
    const tomorrowET = tomorrow.toLocaleDateString('en-CA', { timeZone: TZ });
    target = et515ToUTC(tomorrowET);
  }

  return target;
}

function scheduleMorningNotification() {
  const target = getNext515amET();
  const delay = target - Date.now();

  setTimeout(() => {
    self.registration.showNotification('Good morning! 🌅', {
      body: 'Time for your morning check-in. How are you feeling today?',
      icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🥄</text></svg>",
      tag: 'morning-checkin',
      requireInteraction: true,
      actions: [{ action: 'open', title: 'Open Tracker' }]
    });
    scheduleMorningNotification(); // reschedule for the next day
  }, delay);
}
