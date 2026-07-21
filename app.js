'use strict';

// ═══════════════════════════════════════════════════════
// CONSTANTS & DEFAULTS
// ═══════════════════════════════════════════════════════

const KEYS = {
  ACTIVITIES:      'cmt_activities',
  CHECKINS:        'cmt_checkins',
  SYMPTOMS:        'cmt_symptoms',
  SETTINGS:        'cmt_settings',
  CUSTOM_ACT:      'cmt_custom',
  ENERGY:          'cmt_energy',            // per-day { am:{score,ts}, pm:{score,ts} }
  NOTES:           'cmt_notes',             // per-day freeform notes string
  REFLECTIONS:     'cmt_reflections',       // per-day end-of-day reflection
  BUDGET_OVERRIDE: 'cmt_budget_override',   // per-day starting-balance override
};

const DEFAULT_ACTIVITIES = [
  // Medical / therapy
  { id: 'pt',            name: 'PT Session',              emoji: '🏥', spoons: 4,  category: 'medical',    recovery: false },
  { id: 'pt_ex',         name: 'PT Exercises',            emoji: '🦵', spoons: 1,  category: 'medical',    recovery: false },
  { id: 'ot_ex',         name: 'OT Exercises',            emoji: '🤲', spoons: 1,  category: 'medical',    recovery: false },
  { id: 'slp',           name: 'SLP Work',                emoji: '🗣️', spoons: 1,  category: 'medical',    recovery: false },
  { id: 'doctor',        name: 'Doctor Appointment',      emoji: '👨‍⚕️', spoons: 2,  category: 'medical',    recovery: false },
  { id: 'cmt_class',     name: 'CMT Exercise Class',      emoji: '💪', spoons: 3,  category: 'exercise',   recovery: false },

  // Exercise
  { id: 'daily_workout', name: 'Daily Workout (15 min)',  emoji: '🏃', spoons: 2,  category: 'exercise',   recovery: false },
  { id: 'yoga',          name: 'Yoga',                    emoji: '🧘', spoons: 2,  category: 'exercise',   recovery: false },
  { id: 'gym',           name: 'Gym',                     emoji: '🏋️', spoons: 3,  category: 'exercise',   recovery: false },
  { id: 'dog_walk',      name: 'Walking Dog',             emoji: '🐕', spoons: 1,  category: 'exercise',   recovery: false },

  // Work / job search
  { id: 'work_block',    name: 'Work / Job Search Block', emoji: '💻', spoons: 3,  category: 'work',       recovery: false },
  { id: 'admin',         name: 'Admin / Paperwork',       emoji: '📋', spoons: 1,  category: 'work',       recovery: false },

  // Social
  { id: 'social',        name: 'Social Outing',           emoji: '👥', spoons: 2,  category: 'social',     recovery: false },
  { id: 'call',          name: 'Phone/Video Catch-up',    emoji: '📞', spoons: 1,  category: 'social',     recovery: false },
  { id: 'restaurant',    name: 'Restaurant Meal',         emoji: '🍽️', spoons: 2,  category: 'social',     recovery: false },
  { id: 'event',         name: 'Movie / Live Event',      emoji: '🎬', spoons: 2,  category: 'social',     recovery: false },

  // Errands / travel
  { id: 'grocery',       name: 'Grocery Shopping',        emoji: '🛒', spoons: 2,  category: 'errand',     recovery: false },
  { id: 'errand',        name: 'Quick Errand',            emoji: '📮', spoons: 1,  category: 'errand',     recovery: false },
  { id: 'driving',       name: 'Driving',                 emoji: '🚗', spoons: 1,  category: 'errand',     recovery: false },
  { id: 'pet_care',      name: 'Pet Care (vet/boarding)', emoji: '🐾', spoons: 2,  category: 'errand',     recovery: false },
  { id: 'travel_day',    name: 'Travel Day (Flight)',      emoji: '✈️', spoons: 5,  category: 'travel',     recovery: false },
  { id: 'packing',       name: 'Packing for Trip',        emoji: '🧳', spoons: 2,  category: 'travel',     recovery: false },

  // Household
  { id: 'cooking',       name: 'Cooking Meal',            emoji: '🍳', spoons: 1,  category: 'household',  recovery: false },
  { id: 'baking',        name: 'Baking Project',          emoji: '🥧', spoons: 2,  category: 'household',  recovery: false },
  { id: 'chores_lt',     name: 'Light Chores',            emoji: '🧹', spoons: 1,  category: 'household',  recovery: false },
  { id: 'chores_hv',     name: 'Heavy Chores',            emoji: '🏠', spoons: 2,  category: 'household',  recovery: false },
  { id: 'declutter',     name: 'Decluttering Session',    emoji: '📦', spoons: 3,  category: 'household',  recovery: false },
  { id: 'laundry',       name: 'Folding Laundry',         emoji: '🧺', spoons: 1,  category: 'household',  recovery: false },

  // Self-care / rest / recovery
  { id: 'shower',              name: 'Shower',                    emoji: '🚿', spoons: 1,    category: 'self-care',  recovery: false },
  { id: 'shower_hair',         name: 'Shower — Hair Wash',        emoji: '🧴', spoons: 1.5,  category: 'self-care',  recovery: false },
  { id: 'tv_rest',             name: 'Watching TV / Resting',     emoji: '📺', spoons: 0,    category: 'rest',       recovery: false },
  { id: 'journaling',          name: 'Journaling',                emoji: '✍️', spoons: 0,    category: 'rest',       recovery: false },
  { id: 'meditation',          name: 'Meditation',                emoji: '🧘‍♀️', spoons: -1,   category: 'recovery',   recovery: true  },
  { id: 'yin_yoga',            name: 'Restorative / Yin Yoga',    emoji: '🛋️', spoons: -1,   category: 'recovery',   recovery: true  },
  { id: 'morning_pages',       name: 'Morning Pages',             emoji: '📝', spoons: -1,   category: 'recovery',   recovery: true  },
  { id: 'gratitude_journal',   name: 'Gratitude Journal',         emoji: '🙏', spoons: -0.5, category: 'recovery',   recovery: true  },
  { id: 'charlie_time',        name: 'Time with Charlie',         emoji: '🐕', spoons: -1,   category: 'recovery',   recovery: true  },
  { id: 'nature_time',         name: 'Outdoor / Nature Time',     emoji: '🌳', spoons: -1,   category: 'recovery',   recovery: true  },
  { id: 'reading_fiction',     name: 'Reading — Fiction',         emoji: '📖', spoons: -1,   category: 'recovery',   recovery: true  },
  { id: 'reading_nonfiction',  name: 'Reading — Nonfiction',      emoji: '📚', spoons: -0.5, category: 'recovery',   recovery: true  },
  { id: 'music_fav',           name: 'Music — Favorite Artists',  emoji: '🎵', spoons: -1,   category: 'recovery',   recovery: true  },
  { id: 'music_other',         name: 'Music — Other Playlists',   emoji: '🎧', spoons: -0.5, category: 'recovery',   recovery: true  },
  { id: 'music_radio',         name: 'Music — Radio',             emoji: '📻', spoons: -0.5, category: 'recovery',   recovery: true  },
  { id: 'live_music',          name: 'Live Music',                emoji: '🎤', spoons: 2,    category: 'social',     recovery: false },
  { id: 'live_music_travel',   name: 'Getting to Live Music',     emoji: '🚉', spoons: 2,    category: 'travel',     recovery: false },
  { id: 'puzzle',              name: 'Puzzle',                    emoji: '🧩', spoons: -0.5, category: 'recovery',   recovery: true  },
  { id: 'bowel',               name: 'Bowel Movement',            emoji: '🚽', spoons: 0.5,  category: 'self-care',  recovery: false },
  { id: 'massage',             name: 'Massage',                   emoji: '💆', spoons: -2,   category: 'recovery',   recovery: true  },
  { id: 'nap',                 name: 'Nap',                       emoji: '😴', spoons: -1,   category: 'recovery',   recovery: true  },
  { id: 'sleep',               name: 'Full Night Sleep',          emoji: '🌙', spoons: -5,   category: 'recovery',   recovery: true  },
];

// Category display order + labels (for reporting only — never in daily log)
const CATEGORIES = [
  { id: 'medical',   label: 'Medical',    color: '#2563eb' },
  { id: 'exercise',  label: 'Exercise',   color: '#0891b2' },
  { id: 'work',      label: 'Work',       color: '#7c3aed' },
  { id: 'social',    label: 'Social',     color: '#db2777' },
  { id: 'errand',    label: 'Errand',     color: '#ca8a04' },
  { id: 'household', label: 'Household',  color: '#ea580c' },
  { id: 'travel',    label: 'Travel',     color: '#0d9488' },
  { id: 'self-care', label: 'Self-care',  color: '#16a34a' },
  { id: 'rest',      label: 'Rest',       color: '#64748b' },
  { id: 'recovery',  label: 'Recovery',   color: '#22c55e' },
];

// Default zone per preset activity — kept in the data layer for read-compat with
// older logs. Zones are no longer surfaced anywhere in the UI.
const DEFAULT_ZONES = {
  pt: 'maintenance', pt_ex: 'maintenance', ot_ex: 'maintenance', slp: 'maintenance',
  doctor: 'maintenance', cmt_class: 'maintenance',
  daily_workout: 'maintenance', yoga: 'maintenance', gym: 'competence', dog_walk: 'competence',
  work_block: 'excellence', admin: 'competence',
  social: 'competence', call: 'competence', restaurant: 'competence', event: 'competence',
  grocery: 'competence', errand: 'competence', driving: 'competence',
  pet_care: 'competence', travel_day: 'competence', packing: 'competence',
  cooking: 'competence', baking: 'competence', chores_lt: 'competence',
  chores_hv: 'competence', declutter: 'competence', laundry: 'competence',
  shower: 'maintenance', shower_hair: 'maintenance', tv_rest: 'competence', journaling: 'genius',
  meditation: 'genius', yin_yoga: 'maintenance', morning_pages: 'genius',
  gratitude_journal: 'genius', charlie_time: 'genius', nature_time: 'genius',
  reading_fiction: 'genius', reading_nonfiction: 'competence',
  music_fav: 'genius', music_other: 'competence', music_radio: 'competence',
  live_music: 'genius', live_music_travel: 'competence',
  puzzle: 'competence', bowel: 'maintenance', massage: 'maintenance', nap: 'maintenance', sleep: 'maintenance',
};

const QUICK_IDS = ['pt', 'cmt_class', 'yoga', 'meditation', 'nap', 'dog_walk', 'cooking', 'shower', 'charlie_time'];
const MAX_QUICK = 9;

const DEFAULT_SETTINGS = {
  baseBudget: 10,
  quickIds: QUICK_IDS,
  autoAdjust: true,
  enableAfterSixModifier: true,
  enableStackingPenalty: true,
  enableEveningReminder: false,
};

// ═══════════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════════

function load(key) {
  try { return JSON.parse(localStorage.getItem(key)) || null; }
  catch { return null; }
}
function save(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
function getSettings() { return { ...DEFAULT_SETTINGS, ...(load(KEYS.SETTINGS) || {}) }; }
function saveSettings(s) { save(KEYS.SETTINGS, s); }
function getCustomActivities() { return load(KEYS.CUSTOM_ACT) || []; }

function getAllActivities() {
  const settings = getSettings();
  const overrides = settings.overrides || {};
  const legacyCost = settings.spoonOverrides || {};
  const presets = DEFAULT_ACTIVITIES.map(a => {
    const ov = overrides[a.id] || {};
    const cost = ov.spoons ?? legacyCost[a.id] ?? a.spoons;
    return {
      ...a,
      name: ov.name ?? a.name,
      emoji: ov.emoji ?? a.emoji,
      category: ov.category ?? a.category,
      spoons: cost,
      recovery: cost < 0 ? true : a.recovery,
    };
  });
  // Custom activities: default missing category to 'household'
  const custom = getCustomActivities().map(a => ({ ...a, category: a.category || 'household' }));
  return [...presets, ...custom];
}

function getActivitiesForDate(ds) { return (load(KEYS.ACTIVITIES) || {})[ds] || []; }

function saveActivityForDate(ds, entry) {
  const all = load(KEYS.ACTIVITIES) || {};
  if (!all[ds]) all[ds] = [];
  all[ds].push(entry);
  save(KEYS.ACTIVITIES, all);
}

function updateActivityForDate(ds, entryId, patch) {
  const all = load(KEYS.ACTIVITIES) || {};
  if (!all[ds]) return;
  all[ds] = all[ds].map(e => e.id === entryId ? { ...e, ...patch } : e);
  save(KEYS.ACTIVITIES, all);
}

function deleteActivityForDate(ds, entryId) {
  const all = load(KEYS.ACTIVITIES) || {};
  if (!all[ds]) return;
  all[ds] = all[ds].filter(e => e.id !== entryId);
  save(KEYS.ACTIVITIES, all);
}

function getCheckin(ds) { return (load(KEYS.CHECKINS) || {})[ds] || null; }
function saveCheckin(ds, data) {
  const all = load(KEYS.CHECKINS) || {};
  all[ds] = { ...(all[ds] || {}), ...data, date: ds };
  save(KEYS.CHECKINS, all);
}
function getSymptoms(ds) { return (load(KEYS.SYMPTOMS) || {})[ds] || null; }
function saveSymptoms(ds, data) {
  const all = load(KEYS.SYMPTOMS) || {};
  all[ds] = { ...data, date: ds };
  save(KEYS.SYMPTOMS, all);
}

// Energy checks — a timestamped list per day (independent of the morning check-in).
// Migrates the old { am:{score,ts}, pm:{score,ts} } shape to an array on read.
function getEnergyChecks(ds) {
  const raw = (load(KEYS.ENERGY) || {})[ds];
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  const arr = [];
  if (raw.am) arr.push({ score: raw.am.score, note: '', ts: raw.am.ts });
  if (raw.pm) arr.push({ score: raw.pm.score, note: '', ts: raw.pm.ts });
  return arr;
}
function addEnergyCheck(ds, score, note) {
  const all = load(KEYS.ENERGY) || {};
  const cur = getEnergyChecks(ds);
  cur.push({ score, note: note || '', ts: new Date().toISOString() });
  all[ds] = cur;
  save(KEYS.ENERGY, all);
}
function deleteEnergyCheck(ds, ts) {
  const all = load(KEYS.ENERGY) || {};
  all[ds] = getEnergyChecks(ds).filter(c => c.ts !== ts);
  save(KEYS.ENERGY, all);
}
// Representative "morning" energy for trends: the morning check-in score if present,
// else the first energy check logged that day.
function morningEnergy(ds) {
  const ci = getCheckin(ds);
  if (ci && ci.energy != null) return ci.energy;
  const checks = getEnergyChecks(ds);
  return checks.length ? checks[0].score : null;
}

// Next-day fatigue now lives on the morning check-in; fall back to legacy symptom data.
function getNextDayFatigue(ds) {
  const ci = getCheckin(ds);
  if (ci && ci.nextDayFatigue != null) return ci.nextDayFatigue;
  return getSymptoms(ds)?.nextDayFatigue ?? null;
}

// End-of-day reflections
function getReflection(ds) { return (load(KEYS.REFLECTIONS) || {})[ds] || null; }
function saveReflection(ds, data) {
  const all = load(KEYS.REFLECTIONS) || {};
  all[ds] = { ...data, timestamp: new Date().toISOString() };
  save(KEYS.REFLECTIONS, all);
}

// Per-day starting-balance override
function getBudgetOverride(ds) {
  const v = (load(KEYS.BUDGET_OVERRIDE) || {})[ds];
  return (v === undefined || v === null) ? null : v;
}
function setBudgetOverride(ds, n) {
  const all = load(KEYS.BUDGET_OVERRIDE) || {};
  if (n === null) delete all[ds]; else all[ds] = n;
  save(KEYS.BUDGET_OVERRIDE, all);
}

// ═══════════════════════════════════════════════════════
// DATE UTILITIES  (all times anchored to US Eastern Time)
// ═══════════════════════════════════════════════════════

const TZ = 'America/New_York';

// Current date in Eastern Time → "YYYY-MM-DD"
function today() {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ });
}

// Date object → "YYYY-MM-DD" in Eastern Time
function dateStr(d) {
  return d.toLocaleDateString('en-CA', { timeZone: TZ });
}

function yesterdayStr() {
  return dateStr(new Date(Date.now() - 86400000));
}

// Current hour (0-23) in Eastern Time
function etHourNow() {
  return parseInt(new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, hour: '2-digit', hour12: false,
  }).format(new Date()), 10) % 24;
}

// Format a date-string for display (input is already an ET date key)
function fmtDate(str) {
  return new Date(str + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// Format an ISO timestamp as Eastern Time for display (e.g. "2:30 PM")
function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true, timeZone: TZ,
  });
}

// "Now" as "YYYY-MM-DDTHH:MM" in Eastern Time — used to pre-fill datetime-local inputs
function etNowInput() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date());
  const p = {};
  parts.forEach(x => { p[x.type] = x.value; });
  const h = p.hour === '24' ? '00' : p.hour;
  return `${p.year}-${p.month}-${p.day}T${h}:${p.minute}`;
}

// Parse a datetime-local input value ("YYYY-MM-DDTHH:MM") treating it as Eastern Time.
// Returns an ISO UTC string suitable for storage.
function parseETInput(str) {
  if (!str) return new Date().toISOString();
  const [datePart, timePart] = str.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  for (const off of [4, 5]) {
    const candidate = new Date(Date.UTC(year, month - 1, day, hours + off, minutes));
    const etH = parseInt(new Intl.DateTimeFormat('en-US', {
      timeZone: TZ, hour: '2-digit', hour12: false,
    }).format(candidate), 10) % 24;
    if (etH === hours) return candidate.toISOString();
  }
  return new Date(`${str}:00Z`).toISOString();
}

function last7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); return dateStr(d);
  });
}
function lastNDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (n - 1 - i)); return dateStr(d);
  });
}
function last30Days() { return lastNDays(30); }

// ═══════════════════════════════════════════════════════
// ACTIVITY / CATEGORY HELPERS
// ═══════════════════════════════════════════════════════

function getActivityDefaultZone(actId) {
  const settings = getSettings();
  if (settings.zoneDefaults?.[actId]) return settings.zoneDefaults[actId];
  return DEFAULT_ZONES[actId] || null;
}

function entryCategory(e) {
  if (e.category) return e.category;
  const preset = DEFAULT_ACTIVITIES.find(a => a.id === e.activityId);
  if (preset) return preset.category;
  const custom = getCustomActivities().find(a => a.id === e.activityId);
  return custom?.category || 'household';
}

// ═══════════════════════════════════════════════════════
// SPOON ENGINE  (formula unchanged — override/toggle layers added around it)
// ═══════════════════════════════════════════════════════

function calcBudgetBreakdown(checkin) {
  const base = (getSettings().baseBudget) || 10;
  if (!checkin) return { base, goodDay: 0, poorDay: 0, sleepBonus: 0, qualityBonus: 0, total: base, description: `Base: ${base} spoons` };

  const { energy = 5, brainFog = false, muscleWeak = false, cpapHours = 0, sleepHours = 0, sleepQuality = 3 } = checkin;

  let goodDay = 0, poorDay = 0;
  const isGood = energy >= 8 && !brainFog && !muscleWeak && cpapHours >= 6;
  const isPoor = energy <= 5 && (brainFog || muscleWeak);
  if (isGood) goodDay = 2;
  if (isPoor) poorDay = Math.min(base - 4, base);

  const sleepBonus = sleepHours > 7 ? 1 : 0;
  const qualityBonus = (sleepQuality >= 4 && cpapHours > 7.5) ? 2 : 0;

  let total;
  if (isPoor) total = Math.max(4, base - 4) + sleepBonus + qualityBonus;
  else total = base + goodDay + sleepBonus + qualityBonus;

  const parts = [`Base ${base}`];
  if (goodDay)      parts.push(`good check-in +${goodDay}`);
  if (isPoor)       parts.push(`symptoms −${base - Math.max(4, base - 4)}`);
  if (sleepBonus)   parts.push(`sleep >7h +${sleepBonus}`);
  if (qualityBonus) parts.push(`quality/CPAP +${qualityBonus}`);
  const description = parts.join(' · ') + ` = ${total} spoons`;

  return { base, goodDay, poorDay, sleepBonus, qualityBonus, total, description };
}

function calcDailyBudget(checkin) {
  return calcBudgetBreakdown(checkin).total;
}

// Resolves the actual budget for a day: manual override > auto-adjust > base.
function getDailyBudget(ds) {
  const override = getBudgetOverride(ds);
  if (override !== null) return override;
  const settings = getSettings();
  const checkin = getCheckin(ds);
  if (settings.autoAdjust === false) return settings.baseBudget || 10;
  return calcDailyBudget(checkin);
}

function isAfterSix(isoTimestamp) {
  const etHour = parseInt(new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, hour: '2-digit', hour12: false,
  }).format(new Date(isoTimestamp)), 10) % 24;
  return etHour >= 18;
}

function calcEntryEffectiveCost(entry, allEntries, settings) {
  // Manual per-entry cost edit wins over everything.
  if (entry.costOverride !== undefined && entry.costOverride !== null) return entry.costOverride;
  if (entry.isRecovery || entry.baseCost <= 0) return entry.baseCost;
  let cost = entry.baseCost;

  // Zone modifier retained for read-compat with older zoned entries.
  const zone = entry.zone;
  if (zone === 'genius') cost = Math.round((cost * 0.5) * 2) / 2;
  else if (zone === 'excellence') cost += 0.5;

  if (settings.enableAfterSixModifier && isAfterSix(entry.timestamp)) cost += 0.5;

  return parseFloat(cost.toFixed(1));
}

function calcStackingPenalty(entries, settings) {
  if (!settings.enableStackingPenalty) return 0;
  return entries.filter(e => !e.isRecovery && e.baseCost >= 3).length >= 2 ? 1 : 0;
}

function calcSpoonsUsed(entries, settings) {
  let used = entries.reduce((sum, e) => {
    const c = calcEntryEffectiveCost(e, entries, settings);
    return sum + (c > 0 ? c : 0);
  }, 0);
  used += calcStackingPenalty(entries, settings);
  return parseFloat(used.toFixed(1));
}

function calcSpoonsRecovered(entries) {
  return parseFloat(entries.reduce((sum, e) => {
    return sum + ((e.isRecovery || e.baseCost < 0) ? Math.abs(e.baseCost) : 0);
  }, 0).toFixed(1));
}

function calcSpoonsRemaining(ds) {
  const budget = getDailyBudget(ds);
  const entries = getActivitiesForDate(ds);
  const settings = getSettings();
  const used = calcSpoonsUsed(entries, settings);
  const recovered = calcSpoonsRecovered(entries);
  return { budget, used, recovered, remaining: parseFloat((budget - used + recovered).toFixed(1)) };
}

function spoonColorClass(remaining) {
  if (remaining <= 2) return 'red';
  if (remaining <= 5) return 'yellow';
  return 'green';
}

// ═══════════════════════════════════════════════════════
// PATTERN DETECTION & ALERTS
// ═══════════════════════════════════════════════════════

function detectPatterns() {
  const days = last30Days();
  const warnings = [];
  days.forEach((d, i) => {
    if (i === 0) return;
    if (getNextDayFatigue(d) >= 4) {
      const ids = getActivitiesForDate(days[i - 1]).map(e => e.activityId);
      if (ids.includes('pt') && ids.includes('cmt_class')) warnings.push('pt+cmt_class');
    }
  });
  return [...new Set(warnings)];
}

function getTodayAlerts() {
  const alerts = [];
  const d = today();
  const { remaining, budget, used } = calcSpoonsRemaining(d);
  const settings = getSettings();
  const entries = getActivitiesForDate(d);

  if (remaining <= 0) {
    alerts.push({ type: 'red', icon: '🚨', text: "You're out of spoons for today. Please rest — no more activities." });
  } else if (remaining <= 2) {
    alerts.push({ type: 'red', icon: '⚠️', text: `Only ${remaining} spoon${remaining === 1 ? '' : 's'} left. Rest for the remainder of the day.` });
  } else if (remaining <= 5) {
    alerts.push({ type: 'yellow', icon: '⚡', text: `${remaining} spoons remaining. Lighter activities only.` });
  }
  if (used >= budget * 0.8) {
    alerts.push({ type: 'yellow', icon: '🔮', text: "Based on today's activity, you may need extra rest tomorrow." });
  }
  const ids = entries.map(e => e.activityId);
  if (ids.includes('pt') && ids.includes('cmt_class')) {
    alerts.push({ type: 'yellow', icon: '📊', text: "PT + CMT class same day has caused next-day fatigue before. Plan light tomorrow." });
  }
  if (settings.enableStackingPenalty && entries.filter(e => !e.isRecovery && e.baseCost >= 3).length >= 2) {
    alerts.push({ type: 'yellow', icon: '📈', text: "Stacking penalty applied: 2+ high-cost activities today cost an extra spoon." });
  }
  return alerts;
}

// ═══════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════

function el(id) { return document.getElementById(id); }

function flash(msg) {
  const div = document.createElement('div');
  div.className = 'success-flash';
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 2100);
}

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.hidden = true);
  const page = el('page-' + name);
  if (page) page.hidden = false;
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  const btn = el('nav-' + name);
  if (btn) btn.classList.add('active');
  window._currentPage = name;
  renderPage(name);
}

function renderPage(name) {
  switch (name) {
    case 'today':    renderToday();    break;
    case 'log':      renderLog();      break;
    case 'history':  renderHistory();  break;
    case 'weekly':   renderWeekly();   break;
    case 'settings': renderSettings(); break;
  }
}

function scaleButtonsHTML(max, selected) {
  return Array.from({ length: max }, (_, i) => i + 1)
    .map(n => `<button class="scale-btn${selected === n ? ' selected' : ''}" data-val="${n}">${n}</button>`)
    .join('');
}

// ═══════════════════════════════════════════════════════
// TODAY PAGE
// ═══════════════════════════════════════════════════════

let _energySelectedScore = null;

function renderToday() {
  const d = today();
  el('today-date').textContent = fmtDate(d);
  const { budget, used, recovered, remaining } = calcSpoonsRemaining(d);
  const cls = spoonColorClass(remaining);

  el('spoon-count').textContent = remaining;
  el('spoon-count').className = 'spoon-count ' + cls;
  const pct = Math.max(0, Math.min(100, budget > 0 ? (remaining / budget) * 100 : 0));
  el('spoon-bar').style.width = pct + '%';
  el('spoon-bar').className = 'progress-bar-fill ' + cls;
  el('spoon-used').textContent = used;
  el('spoon-budget').textContent = budget;
  if (recovered > 0) {
    el('spoon-recovered').textContent = '+' + recovered + ' recovered';
    el('spoon-recovered').hidden = false;
  } else { el('spoon-recovered').hidden = true; }

  const checkin = getCheckin(d);
  const override = getBudgetOverride(d);
  const breakdown = calcBudgetBreakdown(checkin);
  if (override !== null) {
    el('budget-source').textContent = `Custom starting balance: ${override} spoons (today only)`;
  } else if (checkin && getSettings().autoAdjust !== false) {
    el('budget-source').textContent = breakdown.description;
  } else {
    el('budget-source').textContent = `Base budget: ${budget} spoons — complete morning check-in to adjust`;
  }

  el('morning-prompt').hidden = !!checkin;

  // Reminder-for-today banner (from yesterday's reflection)
  const reminderBanner = el('today-reminder');
  const yRef = getReflection(yesterdayStr());
  if (reminderBanner) {
    if (yRef && yRef.tomorrow) {
      reminderBanner.hidden = false;
      reminderBanner.innerHTML = `<span class="rb-icon">📌</span><span>Note from yesterday: ${escapeHTML(yRef.tomorrow)}</span>`;
    } else {
      reminderBanner.hidden = true;
    }
  }

  // Alerts
  const alertsDiv = el('today-alerts');
  alertsDiv.innerHTML = '';
  getTodayAlerts().forEach(a => {
    const div = document.createElement('div');
    div.className = `alert ${a.type}`;
    div.innerHTML = `<span class="alert-icon">${a.icon}</span><span class="alert-text">${a.text}</span>`;
    alertsDiv.appendChild(div);
  });

  renderEnergyCard(d);

  // Quick buttons
  const settings = getSettings();
  const allActs = getAllActivities();
  const quickIds = settings.quickIds || QUICK_IDS;
  const quickGrid = el('quick-grid');
  quickGrid.innerHTML = '';
  quickIds.map(id => allActs.find(a => a.id === id)).filter(Boolean).forEach(act => {
    const btn = document.createElement('button');
    btn.className = 'quick-btn';
    const costLabel = act.spoons < 0 ? `+${Math.abs(act.spoons)} 💚` : act.spoons === 0 ? 'free' : `${act.spoons} 🥄`;
    btn.innerHTML = `<span class="act-emoji">${act.emoji}</span><span class="act-name">${act.name}</span><span class="act-spoons">${costLabel}</span>`;
    btn.addEventListener('click', () => quickLog(act));
    quickGrid.appendChild(btn);
  });

  // Activity list
  const entries = getActivitiesForDate(d);
  const listDiv = el('today-activities');
  listDiv.innerHTML = '';
  if (entries.length === 0) {
    listDiv.innerHTML = `<div class="empty-state"><div class="emoji">📋</div><p>No activities logged yet today.</p></div>`;
  } else {
    entries.slice().reverse().forEach(e => listDiv.appendChild(makeActivityItem(e, d)));
  }
}

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderEnergyCard(ds) {
  const scaleRow = el('energy-scale');
  if (!scaleRow) return;
  scaleRow.innerHTML = scaleButtonsHTML(10, _energySelectedScore);
  scaleRow.querySelectorAll('.scale-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      _energySelectedScore = parseInt(btn.dataset.val, 10);
      scaleRow.querySelectorAll('.scale-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  const logDiv = el('energy-log');
  if (!logDiv) return;
  const checks = getEnergyChecks(ds);
  if (checks.length === 0) {
    logDiv.innerHTML = '';
    return;
  }
  logDiv.innerHTML = `<div class="energy-log-title">Today's checks</div>` +
    checks.slice().reverse().map(c => `
      <div class="energy-log-item">
        <span class="eli-score">🔋 ${c.score}/10</span>
        <span class="eli-time">${fmtTime(c.ts)}</span>
        ${c.note ? `<span class="eli-note">${escapeHTML(c.note)}</span>` : '<span class="eli-note"></span>'}
        <button class="eli-del" data-ts="${c.ts}" title="Delete">✕</button>
      </div>`).join('');
  logDiv.querySelectorAll('.eli-del').forEach(btn => {
    btn.addEventListener('click', () => { deleteEnergyCheck(ds, btn.dataset.ts); renderEnergyCard(ds); });
  });
}

function saveEnergyCheck() {
  if (_energySelectedScore == null) { flash('Pick a number first'); return; }
  const why = el('energy-why').value.trim();
  addEnergyCheck(today(), _energySelectedScore, why);
  _energySelectedScore = null;
  el('energy-why').value = '';
  flash('Energy check saved 🔋');
  renderEnergyCard(today());
}

function makeActivityItem(entry, ds) {
  const div = document.createElement('div');
  div.className = 'activity-item';
  const settings = getSettings();
  const isRecov = entry.isRecovery || entry.baseCost < 0;
  const effective = calcEntryEffectiveCost(entry, getActivitiesForDate(ds), settings);
  const costDisplay = isRecov ? `+${Math.abs(entry.baseCost)}` : effective === 0 ? '—' : `-${effective}`;
  const costClass = isRecov ? 'positive' : entry.baseCost === 0 ? 'zero' : 'negative';

  div.innerHTML = `
    <span class="act-icon">${entry.emoji}</span>
    <div class="act-info">
      <div class="name">${entry.name}</div>
      <div class="time">${fmtTime(entry.timestamp)}</div>
      ${entry.note ? `<div class="note">"${escapeHTML(entry.note)}"</div>` : ''}
    </div>
    <div class="act-right">
      <span class="act-cost ${costClass}" title="Tap to adjust">${costDisplay}</span>
    </div>
    <button class="act-delete" title="Delete" data-id="${entry.id}">✕</button>
  `;

  // Inline cost edit (only for cost activities)
  if (!isRecov && entry.baseCost > 0) {
    const costEl = div.querySelector('.act-cost');
    costEl.style.cursor = 'pointer';
    costEl.addEventListener('click', () => startInlineCostEdit(costEl, entry, ds));
  }

  div.querySelector('.act-delete').addEventListener('click', () => {
    deleteActivityForDate(ds, entry.id);
    renderPage(window._currentPage);
  });
  return div;
}

function startInlineCostEdit(costEl, entry, ds) {
  const current = entry.costOverride ?? calcEntryEffectiveCost(entry, getActivitiesForDate(ds), getSettings());
  const input = document.createElement('input');
  input.type = 'number';
  input.step = '0.5';
  input.min = '0';
  input.value = current;
  input.className = 'inline-cost-input';
  costEl.replaceWith(input);
  input.focus();
  input.select();
  const commit = () => {
    const val = parseFloat(input.value);
    if (!isNaN(val)) updateActivityForDate(ds, entry.id, { costOverride: val, effectiveCost: val });
    renderPage(window._currentPage);
  };
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') input.blur(); });
}

function editBudget() {
  const d = today();
  const current = getDailyBudget(d);
  const val = prompt("Today's starting spoon balance:", current);
  if (val === null) return;
  const n = parseFloat(val);
  if (isNaN(n)) return;
  setBudgetOverride(d, n);
  flash(`Starting balance set to ${n}`);
  renderToday();
}

function quickLog(act) {
  logActivity(act, {});
  const costMsg = (act.spoons < 0) ? `+${Math.abs(act.spoons)} recovery` : `${act.spoons} spoon${act.spoons === 1 ? '' : 's'}`;
  flash(`${act.emoji} ${act.name} (${costMsg})`);
  renderPage('today');
}

// Shared logger — stamps zone default silently (data layer), no confirm step.
function logActivity(act, opts) {
  const d = today();
  const settings = getSettings();
  const entries = getActivitiesForDate(d);
  const entry = {
    id: Date.now().toString() + Math.floor(Math.random() * 1000),
    activityId: act.id,
    name: act.name,
    emoji: act.emoji,
    baseCost: act.spoons,
    category: act.category || 'household',
    isRecovery: act.recovery || act.spoons < 0,
    timestamp: opts?.timestamp || new Date().toISOString(),
    note: opts?.note || '',
    zone: getActivityDefaultZone(act.id) || null,
  };
  entry.effectiveCost = calcEntryEffectiveCost(entry, entries, settings);
  saveActivityForDate(d, entry);
  return entry;
}

// ═══════════════════════════════════════════════════════
// MORNING CHECK-IN
// ═══════════════════════════════════════════════════════

function openCheckinModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-handle"></div>
      <div class="modal-title">🌅 Morning Check-In</div>
      <div class="form-group">
        <label class="form-label">Energy Level</label>
        <div class="scale-row" id="ci-energy">${scaleButtonsHTML(10)}</div>
      </div>
      <div class="form-group">
        <label class="form-label">Why? <span class="hint">(optional)</span></label>
        <input type="text" id="ci-why" placeholder="e.g. slept poorly, big day ahead" />
      </div>
      <div class="form-group">
        <label class="form-label">Brain Fog?</label>
        <div class="toggle-row" id="ci-fog">
          <button class="toggle-btn yes" data-val="true">Yes</button>
          <button class="toggle-btn no" data-val="false">No</button>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Muscle Weakness?</label>
        <div class="toggle-row" id="ci-weak">
          <button class="toggle-btn yes" data-val="true">Yes</button>
          <button class="toggle-btn no" data-val="false">No</button>
        </div>
      </div>
      <div class="form-group" id="ci-weak-sev-wrap" style="display:none">
        <label class="form-label">Muscle Weakness Severity <span class="hint">(1-5)</span></label>
        <div class="scale-row" id="ci-weak-sev">${scaleButtonsHTML(5)}</div>
      </div>
      <div class="form-group">
        <label class="form-label">Next-Day Fatigue <span class="hint">(how did yesterday leave you? 1-5)</span></label>
        <div class="scale-row" id="ci-fatigue">${scaleButtonsHTML(5)}</div>
      </div>
      <div class="row">
        <div class="form-group">
          <label class="form-label">CPAP Hours</label>
          <input type="number" id="ci-cpap" min="0" max="12" step="0.5" placeholder="hrs" />
        </div>
        <div class="form-group">
          <label class="form-label">Trazodone?</label>
          <div class="toggle-row" id="ci-traz" style="margin-top:0">
            <button class="toggle-btn yes" data-val="true">Yes</button>
            <button class="toggle-btn no" data-val="false">No</button>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="form-group">
          <label class="form-label">Sleep Quality <span class="hint">(1-5)</span></label>
          <div class="scale-row" id="ci-sq">${scaleButtonsHTML(5)}</div>
        </div>
      </div>
      <div class="row">
        <div class="form-group">
          <label class="form-label">Sleep Hours</label>
          <input type="number" id="ci-hours" min="0" max="12" step="0.5" placeholder="hrs" />
        </div>
      </div>
      <button class="btn btn-primary" id="ci-save" style="margin-top:8px">Save Check-In</button>
      <button class="btn btn-secondary" id="ci-cancel" style="margin-top:8px">Cancel</button>
    </div>`;

  wireScalePickers(overlay);
  wireTogglePickers(overlay);
  overlay.querySelector('#ci-save').addEventListener('click', () => {
    const energy = parseInt(overlay.querySelector('#ci-energy .selected')?.dataset.val || '5');
    const whyText = overlay.querySelector('#ci-why').value.trim() || null;
    const brainFog = overlay.querySelector('#ci-fog .selected')?.dataset.val === 'true';
    const muscleWeak = overlay.querySelector('#ci-weak .selected')?.dataset.val === 'true';
    const muscleWeakSev = muscleWeak ? parseInt(overlay.querySelector('#ci-weak-sev .selected')?.dataset.val || '0') : 0;
    const nextDayFatigue = parseInt(overlay.querySelector('#ci-fatigue .selected')?.dataset.val || '0');
    const cpapHours = parseFloat(overlay.querySelector('#ci-cpap').value || '0');
    const trazodone = overlay.querySelector('#ci-traz .selected')?.dataset.val === 'true';
    const sleepQuality = parseInt(overlay.querySelector('#ci-sq .selected')?.dataset.val || '3');
    const sleepHours = parseFloat(overlay.querySelector('#ci-hours').value || '0');
    saveCheckin(today(), { energy, whyText, brainFog, muscleWeak, muscleWeakSev, nextDayFatigue, cpapHours, trazodone, sleepQuality, sleepHours });
    overlay.remove();
    flash('Morning check-in saved!');
    renderPage('today');
  });
  overlay.querySelector('#ci-cancel').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

function wireScalePickers(root) {
  root.querySelectorAll('.scale-row').forEach(row => {
    row.querySelectorAll('.scale-btn').forEach(btn => btn.addEventListener('click', () => {
      row.querySelectorAll('.scale-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    }));
  });
}
function wireTogglePickers(root) {
  root.querySelectorAll('.toggle-row').forEach(row => {
    row.querySelectorAll('.toggle-btn').forEach(btn => btn.addEventListener('click', () => {
      row.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      if (row.id === 'sym-fog') {
        const wrap = root.querySelector('#sym-fog-sev-wrap');
        if (wrap) wrap.style.display = btn.dataset.val === 'true' ? '' : 'none';
      }
      if (row.id === 'ci-weak') {
        const wrap = root.querySelector('#ci-weak-sev-wrap');
        if (wrap) wrap.style.display = btn.dataset.val === 'true' ? '' : 'none';
      }
    }));
  });
}

// ═══════════════════════════════════════════════════════
// END-OF-DAY REFLECTION
// ═══════════════════════════════════════════════════════

const TOMORROW_MAX = 500;

function openReflectionModal(ds) {
  ds = ds || today();
  const existing = getReflection(ds) || {};
  const { remaining, budget } = calcSpoonsRemaining(ds);
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-handle"></div>
      <div class="modal-title">🌙 End-of-Day Reflection</div>
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px">For: ${fmtDate(ds)}</p>
      <div class="reflect-spoons">
        <span class="rs-num">${remaining}</span>
        <span class="rs-label">of ${budget} spoons left at day's end</span>
      </div>
      <div class="form-group">
        <label class="form-label">Energy level right now <span class="hint">(1-10)</span></label>
        <div class="scale-row" id="rf-energy">${scaleButtonsHTML(10, existing.endEnergy)}</div>
      </div>
      <div class="form-group">
        <label class="form-label">What went well today? <span class="hint">(optional)</span></label>
        <textarea id="rf-well" placeholder="One good thing…">${existing.wentWell ? escapeHTML(existing.wentWell) : ''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Reminder for tomorrow? <span class="hint">(optional)</span></label>
        <textarea id="rf-tomorrow" maxlength="${TOMORROW_MAX}" placeholder="Shows on tomorrow's Today tab">${existing.tomorrow ? escapeHTML(existing.tomorrow) : ''}</textarea>
        <div class="char-count" id="rf-tomorrow-count"></div>
      </div>
      <button class="btn btn-primary" id="rf-save" style="margin-top:8px">Save Reflection</button>
      <button class="btn btn-secondary" id="rf-cancel" style="margin-top:8px">Cancel</button>
    </div>`;
  wireScalePickers(overlay);

  const tmr = overlay.querySelector('#rf-tomorrow');
  const cnt = overlay.querySelector('#rf-tomorrow-count');
  const updateCount = () => { cnt.textContent = `${tmr.value.length}/${TOMORROW_MAX}`; };
  tmr.addEventListener('input', updateCount);
  updateCount();

  overlay.querySelector('#rf-save').addEventListener('click', () => {
    const endEnergy = parseInt(overlay.querySelector('#rf-energy .selected')?.dataset.val || '0') || null;
    const wentWell = overlay.querySelector('#rf-well').value.trim();
    const tomorrow = tmr.value.trim().slice(0, TOMORROW_MAX);
    saveReflection(ds, { endEnergy, spoonsLeft: remaining, wentWell, tomorrow });
    overlay.remove();
    flash('Reflection saved 🌙');
    if (['today', 'history'].includes(window._currentPage)) renderPage(window._currentPage);
  });
  overlay.querySelector('#rf-cancel').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

// ═══════════════════════════════════════════════════════
// LOG PAGE  (one-tap logging)
// ═══════════════════════════════════════════════════════

let _multiMode = false;
let _multiSel = new Set();
let _longPressTimer = null;

function renderLog() {
  _multiMode = false;
  _multiSel = new Set();

  const allActs = getAllActivities();
  const grid = el('log-activity-grid');
  grid.innerHTML = '';

  allActs.forEach(act => {
    grid.appendChild(makeLogButton(act));
  });

  const multiToggle = el('log-multi-toggle');
  if (multiToggle) {
    multiToggle.hidden = false;
    multiToggle.textContent = 'Select multiple';
    multiToggle.classList.remove('active');
    multiToggle.onclick = toggleMultiMode;
  }
  const multiSubmit = el('log-multi-submit');
  if (multiSubmit) { multiSubmit.hidden = true; multiSubmit.onclick = submitMultiLog; }

  // Custom + advanced toggles
  el('log-custom-toggle').onclick = () => {
    const sec = el('log-custom-section');
    sec.hidden = !sec.hidden;
    if (!sec.hidden) sec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };
  el('log-advanced-toggle').onclick = () => {
    const sec = el('log-advanced-section');
    sec.hidden = !sec.hidden;
    if (!sec.hidden) {
      el('log-timestamp').value = etNowInput();
      sec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };
  el('log-custom-submit').onclick = submitCustomLog;

  const cat = el('custom-category'); if (cat) cat.value = 'household';
}

function makeLogButton(act) {
  const btn = document.createElement('button');
  btn.className = 'activity-select-btn';
  btn.dataset.id = act.id;
  const costLabel = act.spoons < 0 ? `+${Math.abs(act.spoons)} recovery`
    : act.spoons === 0 ? 'free'
    : `${act.spoons} spoon${act.spoons === 1 ? '' : 's'}`;
  btn.innerHTML = `<span class="emoji">${act.emoji}</span><div class="info"><div class="n">${act.name}</div><div class="s">${costLabel}</div></div>`;

  btn.addEventListener('click', () => {
    if (_multiMode) {
      toggleMultiSelect(act.id, btn);
    } else {
      logFromGrid(act, btn);
    }
  });

  // Long-press → edit this activity's library entry
  btn.addEventListener('contextmenu', e => { e.preventDefault(); openActivityEditor(act); });
  btn.addEventListener('touchstart', () => {
    _longPressTimer = setTimeout(() => openActivityEditor(act), 550);
  }, { passive: true });
  ['touchend', 'touchmove', 'touchcancel'].forEach(ev =>
    btn.addEventListener(ev, () => clearTimeout(_longPressTimer), { passive: true }));

  return btn;
}

function readAdvancedOpts() {
  const advSec = el('log-advanced-section');
  const opts = {};
  if (advSec && !advSec.hidden) {
    const ts = el('log-timestamp').value;
    if (ts) opts.timestamp = parseETInput(ts);
    const note = el('log-note').value.trim();
    if (note) opts.note = note;
  }
  return opts;
}

function logFromGrid(act, btn) {
  const opts = readAdvancedOpts();
  logActivity(act, opts);
  const costMsg = act.spoons < 0 ? `+${Math.abs(act.spoons)} recovery` : `${act.spoons} spoon${act.spoons === 1 ? '' : 's'}`;
  flash(`${act.emoji} ${act.name} logged (${costMsg})`);
  // brief visual confirmation
  btn.classList.add('just-logged');
  setTimeout(() => btn.classList.remove('just-logged'), 700);
  // reset advanced note after use
  const noteEl = el('log-note'); if (noteEl) noteEl.value = '';
}

function toggleMultiMode() {
  _multiMode = !_multiMode;
  _multiSel = new Set();
  const multiToggle = el('log-multi-toggle');
  const multiSubmit = el('log-multi-submit');
  const hint = el('log-hint');
  multiToggle.textContent = _multiMode ? 'Cancel' : 'Select multiple';
  multiToggle.classList.toggle('active', _multiMode);
  if (multiSubmit) multiSubmit.hidden = !_multiMode;
  if (hint) hint.textContent = _multiMode ? 'Tap activities to select, then "Log Selected".' : 'Tap any activity to log it instantly.';
  el('log-activity-grid').querySelectorAll('.activity-select-btn').forEach(b => b.classList.remove('selected'));
  updateMultiSubmit();
}

function toggleMultiSelect(id, btn) {
  if (_multiSel.has(id)) { _multiSel.delete(id); btn.classList.remove('selected'); }
  else { _multiSel.add(id); btn.classList.add('selected'); }
  updateMultiSubmit();
}

function updateMultiSubmit() {
  const multiSubmit = el('log-multi-submit');
  if (multiSubmit) multiSubmit.textContent = `Log Selected (${_multiSel.size})`;
}

function submitMultiLog() {
  if (_multiSel.size === 0) { flash('Nothing selected'); return; }
  const opts = readAdvancedOpts();
  const ts = opts.timestamp || new Date().toISOString();
  const allActs = getAllActivities();
  let n = 0;
  _multiSel.forEach(id => {
    const act = allActs.find(a => a.id === id);
    if (act) { logActivity(act, { ...opts, timestamp: ts }); n++; }
  });
  flash(`${n} activit${n === 1 ? 'y' : 'ies'} logged`);
  showPage('today');
}

function submitCustomLog() {
  const name = el('custom-name').value.trim();
  const spoons = parseFloat(el('custom-spoons').value);
  const emoji = el('custom-emoji').value.trim() || '⚡';
  const category = el('custom-category').value || 'household';
  if (!name || isNaN(spoons)) { alert('Please enter a name and spoon cost.'); return; }
  const act = { id: 'custom_' + Date.now(), name, spoons, emoji, category, recovery: spoons < 0 };

  if (el('custom-save-lib').checked) {
    const customs = getCustomActivities();
    customs.push({ ...act });
    save(KEYS.CUSTOM_ACT, customs);
  }

  logActivity(act, readAdvancedOpts());
  el('custom-name').value = '';
  el('custom-spoons').value = '';
  el('custom-emoji').value = '';
  el('log-custom-section').hidden = true;
  flash(`${emoji} ${name} logged`);
  showPage('today');
}

// ═══════════════════════════════════════════════════════
// ACTIVITY EDITOR (long-press on Log grid / Settings)
// ═══════════════════════════════════════════════════════

function openActivityEditor(act) {
  const isCustom = act.id.startsWith('custom_');
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-handle"></div>
      <div class="modal-title">Edit ${escapeHTML(act.name)}</div>
      <div class="row" style="margin-bottom:12px">
        <div class="form-group" style="flex:0 0 64px;margin-bottom:0">
          <label class="form-label">Emoji</label>
          <input type="text" id="ae-emoji" maxlength="2" style="text-align:center" value="${escapeHTML(act.emoji)}" />
        </div>
        <div class="form-group" style="flex:1;margin-bottom:0">
          <label class="form-label">Name</label>
          <input type="text" id="ae-name" value="${escapeHTML(act.name)}" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Spoon Cost <span class="hint">(negative = recovery)</span></label>
        <input type="number" id="ae-spoons" min="-5" max="10" step="0.5" value="${act.spoons}" />
      </div>
      <div class="form-group">
        <label class="form-label">Category</label>
        <select id="ae-category">
          ${CATEGORIES.map(c => `<option value="${c.id}"${(act.category || 'household') === c.id ? ' selected' : ''}>${c.label}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-primary" id="ae-save" style="margin-top:8px">Save</button>
      ${isCustom ? '<button class="btn btn-danger" id="ae-delete" style="margin-top:8px">Delete Activity</button>' : ''}
      <button class="btn btn-secondary" id="ae-cancel" style="margin-top:8px">Cancel</button>
    </div>`;

  overlay.querySelector('#ae-save').addEventListener('click', () => {
    const name = overlay.querySelector('#ae-name').value.trim() || act.name;
    const emoji = overlay.querySelector('#ae-emoji').value.trim() || act.emoji;
    const spoons = parseFloat(overlay.querySelector('#ae-spoons').value);
    const category = overlay.querySelector('#ae-category').value;
    if (isCustom) {
      const customs = getCustomActivities().map(a => a.id === act.id
        ? { ...a, name, emoji, spoons: isNaN(spoons) ? a.spoons : spoons, category, recovery: (isNaN(spoons) ? a.spoons : spoons) < 0 }
        : a);
      save(KEYS.CUSTOM_ACT, customs);
    } else {
      const settings = getSettings();
      if (!settings.overrides) settings.overrides = {};
      const ov = { name, emoji, category };
      if (!isNaN(spoons)) ov.spoons = spoons;
      settings.overrides[act.id] = ov;
      // keep legacy spoonOverrides in sync so the Settings cost table matches
      if (!settings.spoonOverrides) settings.spoonOverrides = {};
      if (!isNaN(spoons)) settings.spoonOverrides[act.id] = spoons;
      saveSettings(settings);
    }
    overlay.remove();
    flash('Activity updated');
    renderPage(window._currentPage);
  });
  const delBtn = overlay.querySelector('#ae-delete');
  if (delBtn) delBtn.addEventListener('click', () => {
    if (!confirm(`Delete "${act.name}" from your library?`)) return;
    save(KEYS.CUSTOM_ACT, getCustomActivities().filter(a => a.id !== act.id));
    overlay.remove();
    flash('Activity deleted');
    renderPage(window._currentPage);
  });
  overlay.querySelector('#ae-cancel').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

// ═══════════════════════════════════════════════════════
// HISTORY PAGE
// ═══════════════════════════════════════════════════════

let _historyDaysShown = 7;

function renderHistory() {
  const container = el('history-list');
  container.innerHTML = '';

  // Build the set of dates that actually have data, plus the last N days
  const dataKeys = new Set([
    ...Object.keys(load(KEYS.ACTIVITIES) || {}),
    ...Object.keys(load(KEYS.CHECKINS) || {}),
    ...Object.keys(load(KEYS.SYMPTOMS) || {}),
    ...Object.keys(load(KEYS.REFLECTIONS) || {}),
  ]);
  lastNDays(_historyDaysShown).forEach(d => dataKeys.add(d));
  const allDays = [...dataKeys].sort().reverse().slice(0, _historyDaysShown);

  allDays.forEach(d => container.appendChild(makeHistoryDay(d)));

  const moreBtn = el('history-more');
  if (moreBtn) {
    const totalAvailable = new Set([...dataKeys]).size;
    moreBtn.hidden = allDays.length >= totalAvailable && _historyDaysShown >= 30;
    moreBtn.onclick = () => { _historyDaysShown += 14; renderHistory(); };
  }

  const jump = el('history-jump');
  if (jump && !jump._wired) {
    jump._wired = true;
    jump.addEventListener('change', () => {
      const ds = jump.value;
      if (!ds) return;
      const existing = document.getElementById('hist-' + ds);
      if (existing) {
        existing.querySelector('.history-day-header').click();
        existing.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // insert a standalone day card at the top
        const card = makeHistoryDay(ds);
        container.prepend(card);
        card.querySelector('.history-day-header').click();
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
}

function makeHistoryDay(d) {
  const entries = getActivitiesForDate(d);
  const checkin = getCheckin(d);
  const symptoms = getSymptoms(d);
  const reflection = getReflection(d);
  const checks = getEnergyChecks(d);
  const { budget, used, remaining } = calcSpoonsRemaining(d);
  const isToday = d === today();
  const cls = spoonColorClass(remaining);

  const dayDiv = document.createElement('div');
  dayDiv.className = 'history-day';
  dayDiv.id = 'hist-' + d;

  const header = document.createElement('div');
  header.className = 'history-day-header';
  header.innerHTML = `
    <div>
      <div class="day-name">${isToday ? '📍 Today' : fmtDate(d)}</div>
      <div class="day-stats">${entries.length} activit${entries.length === 1 ? 'y' : 'ies'} · ${used}/${budget} spoons used</div>
    </div>
    <span class="chip ${cls}" style="margin-right:8px">${remaining} left</span>
    <span class="expand-icon">›</span>`;

  const body = document.createElement('div');
  body.className = 'history-day-body';
  let html = '';

  if (entries.length) {
    const settings = getSettings();
    entries.forEach(e => {
      const isRecov = e.isRecovery || e.baseCost < 0;
      const eff = calcEntryEffectiveCost(e, entries, settings);
      const cost = isRecov ? `+${Math.abs(e.baseCost)}` : eff === 0 ? 'free' : `-${eff}`;
      html += `<div class="activity-item">
        <span class="act-icon">${e.emoji}</span>
        <div class="act-info">
          <div class="name">${e.name}</div>
          <div class="time">${fmtTime(e.timestamp)}</div>
          ${e.note ? `<div class="note">"${escapeHTML(e.note)}"</div>` : ''}
        </div>
        <div class="act-right">
          <span class="act-cost ${isRecov ? 'positive' : e.baseCost === 0 ? 'zero' : 'negative'}">${cost}</span>
        </div>
      </div>`;
    });
  } else {
    html += `<p style="font-size:13px;color:var(--text-muted);padding:8px 0">No activities logged</p>`;
  }

  // Energy checks
  if (checks.length) {
    html += `<div class="hist-section">
      <div class="hist-section-head"><span>Energy Checks</span></div>`;
    checks.forEach(c => {
      html += `<div class="hist-energy-line">🔋 <strong>${c.score}/10</strong> · ${fmtTime(c.ts)}${c.note ? ` — ${escapeHTML(c.note)}` : ''}</div>`;
    });
    html += `</div>`;
  }

  // Morning check-in (now includes weakness severity + next-day fatigue)
  if (checkin) {
    const weakChip = checkin.muscleWeak
      ? `<span class="chip yellow">💪 Weakness${checkin.muscleWeakSev ? ' ' + checkin.muscleWeakSev + '/5' : ''}</span>` : '';
    const fatigue = checkin.nextDayFatigue;
    const fatigueChip = fatigue > 0 ? `<span class="chip ${fatigue >= 4 ? 'red' : 'yellow'}">😴 Fatigue ${fatigue}/5</span>` : '';
    html += `<div class="hist-section">
      <div class="hist-section-head"><span>Morning Check-In</span></div>
      <div class="tag-row">
        ${checkin.energy ? `<span class="tag">⚡ Energy ${checkin.energy}/10</span>` : ''}
        ${checkin.brainFog ? `<span class="chip yellow">🌫 Brain fog</span>` : ''}
        ${weakChip}
        ${fatigueChip}
        ${checkin.sleepHours ? `<span class="tag">💤 ${checkin.sleepHours}h sleep</span>` : ''}
        ${checkin.cpapHours ? `<span class="tag">😷 CPAP ${checkin.cpapHours}h</span>` : ''}
        ${checkin.trazodone ? `<span class="tag">💊 Trazodone</span>` : ''}
      </div>
      ${checkin.whyText ? `<div class="note" style="margin-top:6px">"${escapeHTML(checkin.whyText)}"</div>` : ''}
    </div>`;
  }

  // Legacy symptom data (older logs only) — read-only
  if (symptoms && !checkin?.nextDayFatigue && (symptoms.brainFog || symptoms.falls || symptoms.muscleWeakSev > 0 || symptoms.nextDayFatigue > 0)) {
    html += `<div class="hist-section">
      <div class="hist-section-head"><span>Symptoms (logged)</span></div>
      <div class="symptom-chips">`;
    if (symptoms.brainFog) html += `<span class="chip yellow">🌫 Brain fog${symptoms.brainFogSev ? ' ' + symptoms.brainFogSev + '/5' : ''}</span>`;
    if (symptoms.falls) html += `<span class="chip red">⚠️ Falls</span>`;
    if (symptoms.muscleWeakSev > 0) html += `<span class="chip yellow">💪 Weakness ${symptoms.muscleWeakSev}/5</span>`;
    if (symptoms.nextDayFatigue > 0) html += `<span class="chip ${symptoms.nextDayFatigue >= 4 ? 'red' : 'yellow'}">😴 Fatigue ${symptoms.nextDayFatigue}/5</span>`;
    html += `</div></div>`;
  }

  // End-of-day reflection
  html += `<div class="hist-section">
    <div class="hist-section-head">
      <span>Reflection</span>
      <button class="btn btn-secondary btn-sm" onclick="openReflectionModal('${d}')">${reflection ? 'Edit' : 'Add'}</button>
    </div>`;
  if (reflection) {
    html += `<div class="reflection-block">`;
    if (reflection.endEnergy) html += `<div class="rf-line"><strong>Energy:</strong> ${reflection.endEnergy}/10</div>`;
    if (reflection.spoonsLeft != null) html += `<div class="rf-line"><strong>Spoons left:</strong> ${reflection.spoonsLeft}</div>`;
    if (reflection.wentWell) html += `<div class="rf-line"><strong>Went well:</strong> ${escapeHTML(reflection.wentWell)}</div>`;
    if (reflection.tomorrow) html += `<div class="rf-line"><strong>For tomorrow:</strong> ${escapeHTML(reflection.tomorrow)}</div>`;
    html += `</div>`;
  } else { html += `<p style="font-size:13px;color:var(--text-muted)">None logged</p>`; }
  html += `</div>`;

  body.innerHTML = html;
  header.addEventListener('click', () => {
    body.classList.toggle('open');
    header.querySelector('.expand-icon').textContent = body.classList.contains('open') ? '∨' : '›';
  });

  dayDiv.appendChild(header);
  dayDiv.appendChild(body);
  if (isToday) { body.classList.add('open'); header.querySelector('.expand-icon').textContent = '∨'; }
  return dayDiv;
}

// ═══════════════════════════════════════════════════════
// PATTERNS PAGE  (formerly Weekly)
// ═══════════════════════════════════════════════════════

let _charts = {};

function renderWeekly() {
  const days = last7Days();
  const settings = getSettings();

  // Section A — week strip + net
  const strip = el('week-strip');
  if (strip) {
    strip.innerHTML = '';
    days.forEach(d => {
      const { remaining } = calcSpoonsRemaining(d);
      const cls = remaining < 0 ? 'red' : remaining <= 1 ? 'yellow' : 'green';
      const cell = document.createElement('div');
      cell.className = `week-cell ${cls}`;
      cell.innerHTML = `<div class="wc-day">${fmtDate(d).split(',')[0].split(' ')[0]}</div><div class="wc-bal">${remaining}</div>`;
      strip.appendChild(cell);
    });
  }
  const net = el('week-net');
  if (net) {
    const netVal = parseFloat(days.reduce((sum, d) => sum + calcSpoonsRemaining(d).remaining, 0).toFixed(1));
    const label = netVal >= 0 ? 'surplus' : 'deficit';
    net.className = 'week-net ' + (netVal >= 0 ? 'pos' : 'neg');
    net.innerHTML = `<span class="wn-num">${netVal >= 0 ? '+' : ''}${netVal}</span><span class="wn-label">net spoon ${label} this week</span>`;
  }

  const usedData = days.map(d => calcSpoonsUsed(getActivitiesForDate(d), settings));
  const budgetData = days.map(d => getDailyBudget(d));
  const sleepData = days.map(d => getCheckin(d)?.sleepHours ?? null);
  const labels = days.map(d => fmtDate(d).split(',')[0]);

  // Stat tiles
  const totalUsed = usedData.reduce((a, b) => a + b, 0);
  el('weekly-total-used').textContent = totalUsed.toFixed(1);
  el('weekly-avg-used').textContent = (totalUsed / 7).toFixed(1);
  const fatigueData = days.map(d => getNextDayFatigue(d));
  el('weekly-days-fatigue').textContent = fatigueData.filter(f => f >= 4).length;
  const energyData = days.map(d => morningEnergy(d));
  const validEnergy = energyData.filter(e => e !== null);
  el('weekly-avg-energy').textContent = validEnergy.length
    ? (validEnergy.reduce((a, b) => a + b, 0) / validEnergy.length).toFixed(1) : '—';

  // Section C — category breakdown (last 7 days)
  renderCategoryBreakdown(days);

  if (typeof Chart === 'undefined') return;

  // Section B — 30-day morning energy vs. closing balance
  const days30 = last30Days();
  const labels30 = days30.map(d => fmtDate(d).split(',')[0].split(' ')[1] || fmtDate(d).split(' ')[2]);
  const energy30 = days30.map(d => morningEnergy(d));
  const balance30 = days30.map(d => calcSpoonsRemaining(d).remaining);
  renderChart('chart-energy-trend', 'line', labels30, [
    { label: 'Morning Energy', data: energy30, borderColor: '#f59e0b', backgroundColor: '#f59e0b22', tension: 0.4, spanGaps: true, yAxisID: 'y' },
    { label: 'Closing Balance', data: balance30, borderColor: '#6366f1', backgroundColor: '#6366f122', tension: 0.4, yAxisID: 'y1' },
  ], {
    y: { beginAtZero: true, max: 10, position: 'left', title: { display: true, text: 'Energy', font: { size: 10 } } },
    y1: { position: 'right', grid: { display: false }, title: { display: true, text: 'Balance', font: { size: 10 } } },
  });

  renderChart('chart-spoons', 'bar', labels, [
    { label: 'Spoons Used', data: usedData, backgroundColor: '#6366f1cc', borderColor: '#6366f1', borderWidth: 2, borderRadius: 6 },
    { label: 'Daily Budget', data: budgetData, type: 'line', borderColor: '#16a34a', borderWidth: 2, pointRadius: 3, fill: false, tension: 0.4, borderDash: [4, 4] },
  ], { y: { beginAtZero: true, max: 16 } });

  renderChart('chart-sleep', 'bar', labels, [
    { label: 'Sleep Hours', data: sleepData, backgroundColor: '#8b5cf6cc', borderColor: '#8b5cf6', borderWidth: 2, borderRadius: 6, spanGaps: true },
  ], { y: { beginAtZero: true, max: 12 } });

  const patterns = detectPatterns();
  const patternDiv = el('weekly-patterns');
  patternDiv.innerHTML = '';
  if (patterns.includes('pt+cmt_class')) {
    patternDiv.innerHTML = `<div class="pattern-warning"><div class="pw-title">⚠️ Pattern Detected</div><div class="pw-text">PT + CMT class on the same day has led to high next-day fatigue in the last 30 days. Consider spacing these activities.</div></div>`;
  } else {
    patternDiv.innerHTML = `<p style="font-size:13px;color:var(--text-muted)">No crash patterns detected yet. Keep logging to build your pattern library.</p>`;
  }
}

function renderCategoryBreakdown(days) {
  const container = el('category-breakdown');
  if (!container) return;
  const settings = getSettings();
  const totals = {};
  let grand = 0;
  days.forEach(d => {
    const entries = getActivitiesForDate(d);
    entries.forEach(e => {
      const cost = calcEntryEffectiveCost(e, entries, settings);
      if (cost > 0) {
        const cat = entryCategory(e);
        totals[cat] = (totals[cat] || 0) + cost;
        grand += cost;
      }
    });
  });

  if (grand === 0) {
    container.innerHTML = `<p style="font-size:13px;color:var(--text-muted)">No spending logged this week yet.</p>`;
    return;
  }

  container.innerHTML = '';
  CATEGORIES.filter(c => totals[c.id] > 0)
    .sort((a, b) => totals[b.id] - totals[a.id])
    .forEach(c => {
      const spoons = parseFloat(totals[c.id].toFixed(1));
      const pct = Math.round(spoons / grand * 100);
      const row = document.createElement('div');
      row.className = 'cat-bar-row';
      row.innerHTML = `
        <div class="cat-bar-head">
          <span class="cat-label">${c.label}</span>
          <span class="cat-stats">${spoons} · ${pct}%</span>
        </div>
        <div class="cat-track"><div class="cat-fill" style="width:${pct}%;background:${c.color}"></div></div>`;
      container.appendChild(row);
    });
}

function renderChart(canvasId, type, labels, datasets, scales = {}) {
  const canvas = el(canvasId);
  if (!canvas) return;
  if (_charts[canvasId]) { _charts[canvasId].destroy(); }
  _charts[canvasId] = new Chart(canvas, {
    type, data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, autoSkip: true } },
        y: { grid: { color: '#e2e8f0' }, ticks: { font: { size: 11 } }, ...scales.y },
        ...(scales.y1 ? { y1: scales.y1 } : {}),
      },
    },
  });
}

// ═══════════════════════════════════════════════════════
// SETTINGS PAGE
// ═══════════════════════════════════════════════════════

function renderSettings() {
  const settings = getSettings();
  el('set-base-budget').value = settings.baseBudget || 10;
  setToggle('set-auto-adjust', settings.autoAdjust !== false);
  setToggle('set-after-six', settings.enableAfterSixModifier !== false);
  setToggle('set-stacking', settings.enableStackingPenalty !== false);
  setToggle('set-evening-reminder', settings.enableEveningReminder === true);

  // Spoon overrides
  const allActs = getAllActivities();
  const tbody = el('spoon-overrides-body');
  tbody.innerHTML = '';
  allActs.filter(a => !a.id.startsWith('custom_')).forEach(act => {
    const currentCost = act.spoons;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="padding:8px 4px;font-size:14px">${act.emoji} ${act.name}</td>
      <td style="padding:8px 4px;text-align:center">
        <input type="number" class="spoon-override-input" data-id="${act.id}" value="${currentCost}"
          min="-5" max="10" step="0.5" style="width:65px;padding:6px;text-align:center;border:1.5px solid var(--border);border-radius:8px;font-size:14px" />
      </td>`;
    tbody.appendChild(tr);
  });

  renderQuickPicker();

  // Custom activities — inline editable
  const customActs = getCustomActivities();
  const customList = el('custom-activities-list');
  customList.innerHTML = '';
  if (customActs.length === 0) {
    customList.innerHTML = `<p style="font-size:13px;color:var(--text-muted)">No custom activities yet.</p>`;
  } else {
    customActs.forEach(act => customList.appendChild(makeCustomEditRow(act)));
  }
}

function setToggle(id, on) {
  const input = el(id);
  if (!input) return;
  input.checked = on;
  const span = input.nextElementSibling;
  if (span) span.style.background = on ? 'var(--primary)' : '#ccc';
}

function makeCustomEditRow(act) {
  const row = document.createElement('div');
  row.className = 'custom-edit-row';
  row.innerHTML = `
    <input type="text" class="ce-emoji" maxlength="2" value="${escapeHTML(act.emoji)}" />
    <input type="text" class="ce-name" value="${escapeHTML(act.name)}" />
    <input type="number" class="ce-spoons" step="0.5" min="-5" max="10" value="${act.spoons}" />
    <select class="ce-cat">${CATEGORIES.map(c => `<option value="${c.id}"${(act.category || 'household') === c.id ? ' selected' : ''}>${c.label}</option>`).join('')}</select>
    <button class="act-delete" title="Delete">✕</button>`;

  const commit = () => {
    const emoji = row.querySelector('.ce-emoji').value.trim() || act.emoji;
    const name = row.querySelector('.ce-name').value.trim() || act.name;
    const spoons = parseFloat(row.querySelector('.ce-spoons').value);
    const category = row.querySelector('.ce-cat').value;
    const customs = getCustomActivities().map(a => a.id === act.id
      ? { ...a, emoji, name, spoons: isNaN(spoons) ? a.spoons : spoons, category, recovery: (isNaN(spoons) ? a.spoons : spoons) < 0 }
      : a);
    save(KEYS.CUSTOM_ACT, customs);
  };
  row.querySelectorAll('.ce-emoji, .ce-name, .ce-spoons').forEach(inp =>
    inp.addEventListener('blur', commit));
  row.querySelector('.ce-cat').addEventListener('change', commit);
  row.querySelector('.act-delete').addEventListener('click', () => {
    save(KEYS.CUSTOM_ACT, getCustomActivities().filter(a => a.id !== act.id));
    renderSettings();
  });
  return row;
}

// Quick Log editor reachable directly from the Today tab
function openQuickLogEditor() {
  const allActs = getAllActivities();
  let ids = [...(getSettings().quickIds || QUICK_IDS)];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-handle"></div>
      <div class="modal-title">Edit Quick Log</div>
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:4px">Tap to add or remove. Choose up to ${MAX_QUICK}.</p>
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:10px" id="qle-count"></div>
      <div class="quick-picker-grid" id="qle-grid"></div>
      <button class="btn btn-primary" id="qle-done" style="margin-top:14px">Done</button>
      <button class="btn btn-secondary" id="qle-cancel" style="margin-top:8px">Cancel</button>
    </div>`;
  const grid = overlay.querySelector('#qle-grid');
  const countEl = overlay.querySelector('#qle-count');
  function draw() {
    countEl.textContent = `${ids.length}/${MAX_QUICK} selected`;
    grid.innerHTML = '';
    allActs.forEach(act => {
      const sel = ids.includes(act.id);
      const btn = document.createElement('button');
      btn.className = 'quick-pick-btn' + (sel ? ' selected' : '');
      btn.innerHTML = `<span class="qp-emoji">${act.emoji}</span><span class="qp-name">${act.name}</span><span class="qp-check">${sel ? '✓' : ''}</span>`;
      btn.addEventListener('click', () => {
        if (ids.includes(act.id)) ids = ids.filter(i => i !== act.id);
        else {
          if (ids.length >= MAX_QUICK) { flash(`Max ${MAX_QUICK}. Remove one first.`); return; }
          ids.push(act.id);
        }
        draw();
      });
      grid.appendChild(btn);
    });
  }
  draw();
  overlay.querySelector('#qle-done').addEventListener('click', () => {
    const s = getSettings();
    s.quickIds = ids;
    saveSettings(s);
    overlay.remove();
    flash('Quick Log updated');
    renderToday();
  });
  overlay.querySelector('#qle-cancel').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

function renderQuickPicker() {
  const settings = getSettings();
  const allActs = getAllActivities();
  const currentIds = settings.quickIds || QUICK_IDS;
  const grid = el('quick-picker-grid');
  if (!grid) return;
  grid.innerHTML = '';
  el('quick-picker-count').textContent = `${currentIds.length}/${MAX_QUICK} selected`;

  allActs.forEach(act => {
    const isSelected = currentIds.includes(act.id);
    const btn = document.createElement('button');
    btn.className = 'quick-pick-btn' + (isSelected ? ' selected' : '');
    btn.dataset.id = act.id;
    btn.innerHTML = `<span class="qp-emoji">${act.emoji}</span><span class="qp-name">${act.name}</span>${isSelected ? '<span class="qp-check">✓</span>' : '<span class="qp-check"></span>'}`;
    btn.addEventListener('click', () => toggleQuickPick(act.id));
    grid.appendChild(btn);
  });
}

function toggleQuickPick(actId) {
  const settings = getSettings();
  let ids = [...(settings.quickIds || QUICK_IDS)];
  if (ids.includes(actId)) {
    ids = ids.filter(id => id !== actId);
  } else {
    if (ids.length >= MAX_QUICK) { flash(`Max ${MAX_QUICK} quick buttons. Remove one first.`); return; }
    ids.push(actId);
  }
  settings.quickIds = ids;
  saveSettings(settings);
  renderQuickPicker();
}

function saveSettingsForm() {
  const settings = getSettings();
  settings.baseBudget = parseFloat(el('set-base-budget').value) || 10;
  settings.autoAdjust = el('set-auto-adjust').checked;
  settings.enableAfterSixModifier = el('set-after-six').checked;
  settings.enableStackingPenalty = el('set-stacking').checked;
  const wasEvening = settings.enableEveningReminder === true;
  settings.enableEveningReminder = el('set-evening-reminder').checked;

  if (!settings.spoonOverrides) settings.spoonOverrides = {};
  document.querySelectorAll('.spoon-override-input').forEach(input => {
    const id = input.dataset.id;
    const val = parseFloat(input.value);
    const defAct = DEFAULT_ACTIVITIES.find(a => a.id === id);
    if (defAct && val !== defAct.spoons) settings.spoonOverrides[id] = val;
    else delete settings.spoonOverrides[id];
    // keep overrides map cost in sync
    if (settings.overrides?.[id]) {
      if (defAct && val !== defAct.spoons) settings.overrides[id].spoons = val;
      else delete settings.overrides[id].spoons;
    }
  });

  saveSettings(settings);
  // (Re)schedule evening reminder if it was just enabled
  if (!wasEvening && settings.enableEveningReminder) scheduleEvening();
  flash('Settings saved!');
}

function addCustomActivity() {
  const name = el('new-custom-name').value.trim();
  const spoons = parseFloat(el('new-custom-spoons').value);
  const emoji = el('new-custom-emoji').value.trim() || '⚡';
  const category = el('new-custom-category')?.value || 'household';
  if (!name || isNaN(spoons)) { alert('Please enter a name and spoon cost.'); return; }
  const customs = getCustomActivities();
  customs.push({ id: 'custom_' + Date.now(), name, spoons, emoji, category, recovery: spoons < 0 });
  save(KEYS.CUSTOM_ACT, customs);
  el('new-custom-name').value = '';
  el('new-custom-spoons').value = '';
  el('new-custom-emoji').value = '';
  renderSettings();
  flash('Custom activity added!');
}

// ═══════════════════════════════════════════════════════
// SHARE / EXPORT
// ═══════════════════════════════════════════════════════

function shareToHusband() {
  const d = today();
  const { remaining, budget, used } = calcSpoonsRemaining(d);
  const energy = morningEnergy(d);
  const text = `🥄 Elaine's Energy Update — ${fmtDate(d)}\n\nSpoons remaining: ${remaining}/${budget}\nSpoons used: ${used}\nMorning energy: ${energy ? energy + '/10' : '?'}\n\nSent via CMT Energy Tracker`;
  if (navigator.share) navigator.share({ title: 'Energy Update', text }).catch(() => copyToClipboard(text));
  else copyToClipboard(text);
}

function copyToClipboard(text) {
  navigator.clipboard?.writeText(text).then(() => flash('Copied!')).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    flash('Copied to clipboard!');
  });
}

function exportCSV() {
  const days = last30Days();
  const rows = [['Date', 'Budget', 'Spoons Used', 'Spoons Remaining', 'Activities',
    'Energy Checks', 'Morning Energy', 'Morning Why', 'Sleep Hours', 'CPAP Hours', 'Trazodone',
    'Brain Fog', 'Muscle Weakness', 'Next-Day Fatigue',
    'End-of-Day Energy', 'What Went Well', 'Tomorrow Reminder']];

  days.forEach(d => {
    const entries = getActivitiesForDate(d);
    const { budget, used, remaining } = calcSpoonsRemaining(d);
    const ci = getCheckin(d) || {};
    const rf = getReflection(d) || {};
    const sym = getSymptoms(d) || {};
    const acts = entries.map(e => e.name).join('; ');
    const checksStr = getEnergyChecks(d).map(c => `${c.score}/10 ${fmtTime(c.ts)}${c.note ? ' (' + c.note + ')' : ''}`).join('; ');
    const weakness = ci.muscleWeak ? (ci.muscleWeakSev || 'Yes') : (sym.muscleWeakSev || '');
    rows.push([d, budget, used, remaining, acts,
      checksStr, morningEnergy(d) ?? '', ci.whyText || '',
      ci.sleepHours || '', ci.cpapHours || '', ci.trazodone ? 'Yes' : 'No',
      ci.brainFog ? 'Yes' : (sym.brainFog ? 'Yes' : 'No'), weakness, getNextDayFatigue(d) ?? '',
      rf.endEnergy || '', rf.wentWell || '', rf.tomorrow || '']);
  });

  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cmt-tracker-${today()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  flash('CSV exported!');
}

// ═══════════════════════════════════════════════════════
// SAMPLE DATA
// ═══════════════════════════════════════════════════════

function loadSampleData() {
  if (!confirm('Load sample data? This will add example entries for the last 3 days.')) return;
  const d = today();
  const yesterday = yesterdayStr();
  const two = dateStr(new Date(Date.now() - 2 * 86400000));

  const all = load(KEYS.ACTIVITIES) || {};
  all[two] = [
    { id: 's1', activityId: 'pt', name: 'PT Session', emoji: '🏥', baseCost: 4, effectiveCost: 4, category: 'medical', isRecovery: false, timestamp: two + 'T14:00:00Z', note: 'Balance focus', zone: 'maintenance' },
    { id: 's2', activityId: 'cmt_class', name: 'CMT Exercise Class', emoji: '💪', baseCost: 3, effectiveCost: 3, category: 'exercise', isRecovery: false, timestamp: two + 'T18:00:00Z', note: '', zone: 'maintenance' },
    { id: 's3', activityId: 'journaling', name: 'Journaling', emoji: '✍️', baseCost: 0, effectiveCost: 0, category: 'rest', isRecovery: false, timestamp: two + 'T23:00:00Z', note: 'Evening reflection', zone: 'genius' },
  ];
  all[yesterday] = [
    { id: 's4', activityId: 'tv_rest', name: 'Watching TV / Resting', emoji: '📺', baseCost: 0, effectiveCost: 0, category: 'rest', isRecovery: false, timestamp: yesterday + 'T14:00:00Z', note: '', zone: 'competence' },
    { id: 's5', activityId: 'meditation', name: 'Meditation', emoji: '🧘‍♀️', baseCost: -1, effectiveCost: -1, category: 'recovery', isRecovery: true, timestamp: yesterday + 'T17:00:00Z', note: '20 min guided', zone: 'genius' },
    { id: 's6', activityId: 'dog_walk', name: 'Walking Dog', emoji: '🐕', baseCost: 1, effectiveCost: 1, category: 'exercise', isRecovery: false, timestamp: yesterday + 'T20:00:00Z', note: 'Short walk', zone: 'competence' },
  ];
  all[d] = [
    { id: 's7', activityId: 'cooking', name: 'Cooking Meal', emoji: '🍳', baseCost: 1, effectiveCost: 1, category: 'household', isRecovery: false, timestamp: d + 'T13:00:00Z', note: '', zone: 'competence' },
    { id: 's8', activityId: 'yoga', name: 'Yoga', emoji: '🧘', baseCost: 2, effectiveCost: 2, category: 'exercise', isRecovery: false, timestamp: d + 'T15:00:00Z', note: 'Gentle flow', zone: 'maintenance' },
  ];
  save(KEYS.ACTIVITIES, all);

  const checkins = load(KEYS.CHECKINS) || {};
  checkins[two] = { date: two, energy: 7, whyText: 'Slept okay', brainFog: false, muscleWeak: false, muscleWeakSev: 0, nextDayFatigue: 0, cpapHours: 6, trazodone: true, sleepQuality: 3, sleepHours: 7 };
  checkins[yesterday] = { date: yesterday, energy: 4, whyText: 'Rough night', brainFog: true, muscleWeak: true, muscleWeakSev: 3, nextDayFatigue: 5, cpapHours: 5, trazodone: true, sleepQuality: 2, sleepHours: 6 };
  checkins[d] = { date: d, energy: 6, brainFog: false, muscleWeak: false, muscleWeakSev: 0, nextDayFatigue: 2, cpapHours: 6, trazodone: true, sleepQuality: 3, sleepHours: 7.5 };
  save(KEYS.CHECKINS, checkins);

  const energy = load(KEYS.ENERGY) || {};
  energy[two] = [{ score: 7, note: 'morning', ts: two + 'T14:00:00Z' }, { score: 5, note: 'after PT', ts: two + 'T20:00:00Z' }];
  energy[yesterday] = [{ score: 4, note: '', ts: yesterday + 'T14:00:00Z' }, { score: 3, note: 'wiped out', ts: yesterday + 'T23:00:00Z' }];
  energy[d] = [{ score: 6, note: '', ts: d + 'T14:00:00Z' }];
  save(KEYS.ENERGY, energy);

  const reflections = load(KEYS.REFLECTIONS) || {};
  reflections[yesterday] = { endEnergy: 3, spoonsLeft: 2, wentWell: 'Got a good walk in with Charlie', tomorrow: 'Take it easy — no stacking PT and class', timestamp: yesterday + 'T23:30:00Z' };
  save(KEYS.REFLECTIONS, reflections);

  flash('Sample data loaded!');
  renderPage(window._currentPage || 'today');
}

// ═══════════════════════════════════════════════════════
// SERVICE WORKER SCHEDULING
// ═══════════════════════════════════════════════════════

let _sw = null;

function scheduleMorning() {
  if (_sw) _sw.postMessage({ type: 'SCHEDULE_MORNING' });
}
function scheduleEvening() {
  if (_sw && getSettings().enableEveningReminder) _sw.postMessage({ type: 'SCHEDULE_EVENING' });
}

// ═══════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════

// One-time migration: users whose saved Quick Log is the old 5-item default get the
// expanded 9-item default. Custom selections are left untouched.
function migrateQuickIds() {
  const s = load(KEYS.SETTINGS);
  if (!s || !Array.isArray(s.quickIds)) return;
  const OLD_DEFAULT = ['pt', 'cmt_class', 'yoga', 'meditation', 'nap'];
  const isOldDefault = s.quickIds.length === OLD_DEFAULT.length
    && OLD_DEFAULT.every((id, i) => s.quickIds[i] === id);
  if (isOldDefault) {
    s.quickIds = QUICK_IDS.slice();
    saveSettings(s);
  }
}

let _swReloading = false;

function init() {
  migrateQuickIds();
  if ('serviceWorker' in navigator) {
    // When a new service worker takes control (after an update), reload once so the
    // page immediately runs the new code instead of waiting for a manual refresh.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (_swReloading) return;
      _swReloading = true;
      window.location.reload();
    });
    navigator.serviceWorker.register('sw.js').then(reg => {
      // Proactively check for an updated worker on every launch.
      reg.update().catch(() => {});
      _sw = reg.active;
      if (reg.active) {
        reg.active.postMessage({ type: 'SCHEDULE_MORNING' });
        if (getSettings().enableEveningReminder) reg.active.postMessage({ type: 'SCHEDULE_EVENING' });
      }
    }).catch(() => {});
  }
  if ('Notification' in window && Notification.permission === 'default') {
    setTimeout(() => Notification.requestPermission(), 3000);
  }

  document.querySelectorAll('nav button[data-page]').forEach(btn => {
    btn.addEventListener('click', () => showPage(btn.dataset.page));
  });

  el('morning-prompt').addEventListener('click', openCheckinModal);
  el('reflect-btn').addEventListener('click', () => openReflectionModal(today()));
  el('budget-edit-btn').addEventListener('click', editBudget);
  el('energy-save').addEventListener('click', saveEnergyCheck);
  el('quick-edit-btn').addEventListener('click', openQuickLogEditor);

  el('settings-save').addEventListener('click', saveSettingsForm);
  el('add-custom-btn').addEventListener('click', addCustomActivity);
  el('share-btn').addEventListener('click', shareToHusband);
  el('export-csv-btn').addEventListener('click', exportCSV);
  el('load-sample-btn').addEventListener('click', loadSampleData);
  el('clear-data-btn').addEventListener('click', () => {
    if (confirm('Delete ALL tracking data? This cannot be undone.')) {
      Object.values(KEYS).forEach(k => localStorage.removeItem(k));
      flash('All data cleared');
      renderPage('today');
    }
  });

  showPage('today');
}

document.addEventListener('DOMContentLoaded', init);
