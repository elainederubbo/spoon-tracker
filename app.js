'use strict';

// Build version — shown in Settings so it's easy to confirm the running code.
const APP_VERSION = '15';

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
  CAL_EVENTS:      'cmt_cal_events',        // per-day imported calendar events + review status
  PROFILE:         'sp_profile',            // { id, name, owner, createdAt }
};

// Data keys that belong to a person's profile — used for backup/restore and reset.
const DATA_KEYS = [
  KEYS.ACTIVITIES, KEYS.CHECKINS, KEYS.SYMPTOMS, KEYS.SETTINGS, KEYS.CUSTOM_ACT,
  KEYS.ENERGY, KEYS.NOTES, KEYS.REFLECTIONS, KEYS.BUDGET_OVERRIDE, KEYS.CAL_EVENTS,
];

// Specialized presets that belong only to the owner's (Elaine's) profile. New users
// don't see these in their library; they can add their own via Custom.
const SPECIALIZED_IDS = ['cmt_class', 'ot_ex', 'slp', 'charlie_time'];

// Suggested starter Quick Log for brand-new users (universal activities, pre-checked
// during onboarding — they adjust before finishing).
const STARTER_QUICK = ['shower', 'cooking', 'nap', 'dog_walk', 'daily_workout', 'meditation', 'grocery', 'call', 'tv_rest'];

const DEFAULT_ACTIVITIES = [
  // Medical / therapy
  { id: 'pt',            name: 'PT Session',              emoji: '🏥', spoons: 4,  category: 'medical',    recovery: false },
  { id: 'pt_ex',         name: 'PT Exercises',            emoji: '🦵', spoons: 1,  category: 'medical',    recovery: false },
  { id: 'ot_ex',         name: 'OT Exercises',            emoji: '🤲', spoons: 1,  category: 'medical',    recovery: false, specialized: true },
  { id: 'slp',           name: 'SLP Work',                emoji: '🗣️', spoons: 1,  category: 'medical',    recovery: false, specialized: true },
  { id: 'doctor',        name: 'Doctor Appointment',      emoji: '👨‍⚕️', spoons: 2,  category: 'medical',    recovery: false },
  { id: 'cmt_class',     name: 'CMT Exercise Class',      emoji: '💪', spoons: 3,  category: 'exercise',   recovery: false, specialized: true },

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
  { id: 'charlie_time',        name: 'Time with Charlie',         emoji: '🐕', spoons: -1,   category: 'recovery',   recovery: true, specialized: true  },
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

// Starter tags, seeded from category so the library is filterable on day one. Any item's
// tags can be edited (stored in settings.overrides[id].tags for presets, or on the custom
// activity itself); once edited, the saved list replaces these defaults.
const STARTER_TAGS = ['exercise', 'work', 'restorative'];
const DEFAULT_TAGS_BY_CATEGORY = { exercise: ['exercise'], work: ['work'], recovery: ['restorative'], rest: ['restorative'] };
const DEFAULT_TAGS_BY_ID = { pt_ex: ['exercise'], ot_ex: ['exercise'] };

function defaultTagsFor(a) {
  return [...(DEFAULT_TAGS_BY_ID[a.id] || DEFAULT_TAGS_BY_CATEGORY[a.category] || [])];
}

function normalizeTag(t) {
  return String(t || '').trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 24);
}

const QUICK_IDS = ['pt', 'cmt_class', 'yoga', 'meditation', 'nap', 'dog_walk', 'cooking', 'shower', 'charlie_time'];
const MAX_QUICK = 9;

const DEFAULT_SETTINGS = {
  baseBudget: 10,
  quickIds: QUICK_IDS,
  autoAdjust: true,
  enableAfterSixModifier: true,
  enableStackingPenalty: true,
  enableEveningReminder: false,
  enableMorningPrompt: true,
  enableEnergyDueDot: true,
};

// ═══════════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════════

function load(key) {
  try { return JSON.parse(localStorage.getItem(key)) || null; }
  catch { return null; }
}
function save(key, data) { localStorage.setItem(key, JSON.stringify(data)); }

// ── Profile (local, per-device) ──
function getProfile() { return load(KEYS.PROFILE); }
function saveProfile(p) { save(KEYS.PROFILE, p); }
function hasProfile() { return !!getProfile(); }
function isOwner() { return getProfile()?.owner === true; }
function profileName() { return getProfile()?.name || ''; }
function getSettings() { return { ...DEFAULT_SETTINGS, ...(load(KEYS.SETTINGS) || {}) }; }
function saveSettings(s) { save(KEYS.SETTINGS, s); }
function getCustomActivities() { return load(KEYS.CUSTOM_ACT) || []; }

function getAllActivities() {
  const settings = getSettings();
  const overrides = settings.overrides || {};
  const legacyCost = settings.spoonOverrides || {};
  // Specialized presets are only part of the owner's library.
  const owner = isOwner();
  const presets = DEFAULT_ACTIVITIES.filter(a => owner || !a.specialized).map(a => {
    const ov = overrides[a.id] || {};
    const cost = ov.spoons ?? legacyCost[a.id] ?? a.spoons;
    const category = ov.category ?? a.category;
    return {
      ...a,
      name: ov.name ?? a.name,
      emoji: ov.emoji ?? a.emoji,
      category,
      spoons: cost,
      recovery: cost < 0 ? true : a.recovery,
      tags: ov.tags ?? defaultTagsFor({ id: a.id, category }),
    };
  });
  // Custom activities: default missing category to 'household'
  const custom = getCustomActivities().map(a => {
    const category = a.category || 'household';
    return { ...a, category, tags: a.tags ?? defaultTagsFor({ id: a.id, category }) };
  });
  return [...presets, ...custom];
}

// Every tag in use across the library, starter tags first.
function getAllTags() {
  const seen = new Set(STARTER_TAGS);
  getAllActivities().forEach(a => (a.tags || []).forEach(t => seen.add(t)));
  return [...STARTER_TAGS, ...[...seen].filter(t => !STARTER_TAGS.includes(t)).sort()];
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
  all[ds] = { ...(all[ds] || {}), ...data, date: ds, savedAt: new Date().toISOString() };
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

function spoonGuidance(remaining) {
  if (remaining <= 0) return 'Out of spoons — please rest';
  if (remaining <= 2) return 'Rest for the rest of the day';
  if (remaining <= 5) return 'Lighter activities only';
  return '';
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
  const { budget, used } = calcSpoonsRemaining(d);
  const settings = getSettings();
  const entries = getActivitiesForDate(d);

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
  // Drop a stale deep-link hash so a reload doesn't jump back to that tab.
  if (location.hash && pageFromHash() !== name) history.replaceState(null, '', location.pathname + location.search);
  renderPage(name);
  updateEnergyDueDot();
}

// Deep links: #energy, #log, etc. open that tab (used by calendar reminders).
const PAGE_ALIASES = { spoons: 'today', home: 'today' };
function pageFromHash() {
  const h = (location.hash || '').replace('#', '').toLowerCase();
  const name = PAGE_ALIASES[h] || h;
  return el('page-' + name) ? name : null;
}

function renderPage(name) {
  switch (name) {
    case 'today':    renderToday();    break;
    case 'log':      renderLog();      break;
    case 'energy':   renderEnergy();   break;
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
let _todayAlertsOpen = false;

function renderToday() {
  const d = today();
  const titleEl = el('today-title');
  if (titleEl) {
    const n = profileName();
    titleEl.textContent = `🥄 ${n ? n + '’s' : 'My'} Spoons`;
  }
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

  // Pacing guidance lives under the big number (it used to be a separate alert that
  // repeated the count).
  el('spoon-guidance').textContent = spoonGuidance(remaining);
  el('spoon-guidance').className = 'spoon-guidance ' + cls;

  // Latest energy reading — the newest energy check, else the morning check-in.
  const latestCheck = getEnergyChecks(d).slice().sort((a, b) => a.ts < b.ts ? -1 : 1).pop();
  const latest = latestCheck ? { score: latestCheck.score, ts: latestCheck.ts }
    : (checkin?.energy ? { score: checkin.energy, ts: checkin.savedAt, morning: true } : null);
  el('energy-latest').innerHTML = latest
    ? `🔋 Energy <strong>${latest.score}/10</strong>${latest.ts ? ` ${latest.morning ? 'this morning' : 'at ' + fmtTime(latest.ts)}` : ''} <span class="el-arrow">›</span>`
    : `🔋 No energy check yet today · <span class="el-link">Check in ›</span>`;

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

  // Alerts — only the most urgent one shows; the rest sit behind "more".
  const alertsDiv = el('today-alerts');
  alertsDiv.innerHTML = '';
  const alerts = getTodayAlerts();
  alerts.forEach((a, i) => {
    const div = document.createElement('div');
    div.className = `alert ${a.type}`;
    div.hidden = i > 0 && !_todayAlertsOpen;
    div.innerHTML = `<span class="alert-icon">${a.icon}</span><span class="alert-text">${a.text}</span>`;
    alertsDiv.appendChild(div);
  });
  if (alerts.length > 1) {
    const more = document.createElement('button');
    more.className = 'link-btn';
    more.textContent = _todayAlertsOpen ? 'Show fewer alerts' : `+${alerts.length - 1} more alert${alerts.length > 2 ? 's' : ''}`;
    more.addEventListener('click', () => { _todayAlertsOpen = !_todayAlertsOpen; renderToday(); });
    alertsDiv.appendChild(more);
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
  renderEnergy();
  updateEnergyDueDot();
}

// ═══════════════════════════════════════════════════════
// ENERGY CHECK PAGE
// ═══════════════════════════════════════════════════════

// A check is "due" during waking hours when nothing (morning check-in or energy
// check) has been logged in the last 3 hours. Drives the dot on the Energy tab.
const ENERGY_DUE_HOURS = 3;
const ENERGY_WAKE_START = 7;   // 7 AM Eastern
const ENERGY_WAKE_END = 21;    // 9 PM Eastern

function lastEnergyTouch(ds) {
  const times = getEnergyChecks(ds).map(c => c.ts);
  const ci = getCheckin(ds);
  if (ci?.savedAt) times.push(ci.savedAt);
  return times.length ? times.sort().pop() : null;
}

function energyCheckStatus() {
  const hour = etHourNow();
  const last = lastEnergyTouch(today());
  const awake = hour >= ENERGY_WAKE_START && hour < ENERGY_WAKE_END;
  const nextAt = last ? new Date(new Date(last).getTime() + ENERGY_DUE_HOURS * 3600000) : null;
  const due = awake && (!nextAt || nextAt <= new Date());
  return { last, nextAt, due };
}

function updateEnergyDueDot() {
  const dot = el('energy-due-dot');
  if (dot) dot.hidden = getSettings().enableEnergyDueDot === false || !energyCheckStatus().due;
}

function renderEnergy() {
  const d = today();

  // Morning check-in status
  const body = el('energy-morning-body');
  const ci = getCheckin(d);
  if (ci) {
    const bits = [];
    if (ci.energy) bits.push(`⚡ Energy ${ci.energy}/10`);
    const sleepMin = toMinutes(ci.sleepMinutes, ci.sleepHours);
    const cpapMin = toMinutes(ci.cpapMinutes, ci.cpapHours);
    if (sleepMin) bits.push(`💤 ${fmtHM(sleepMin)} sleep`);
    if (cpapMin) bits.push(`😷 CPAP ${fmtHM(cpapMin)}`);
    else if (ci.cpapUsed === false) bits.push('😷 No CPAP');
    if (ci.trazodone) bits.push('💊 Trazodone');
    if (ci.brainFog) bits.push('🌫 Brain fog');
    if (ci.muscleWeak) bits.push(`💪 Weakness${ci.muscleWeakSev ? ' ' + ci.muscleWeakSev + '/5' : ''}`);
    (ci.otherSymptoms || []).forEach(t => bits.push(escapeHTML(t)));
    body.innerHTML = `<div class="ci-done-row"><span class="ci-done">✓ Done${ci.savedAt ? ' at ' + fmtTime(ci.savedAt) : ''}</span>
        <button class="link-btn" id="energy-morning-edit" style="margin:0">Edit</button></div>
      <div class="tag-row">${bits.map(b => `<span class="tag">${b}</span>`).join('')}</div>
      ${ci.whyText ? `<div class="note" style="margin-top:6px">"${escapeHTML(ci.whyText)}"</div>` : ''}
      ${ci.symptomNote ? `<div class="note" style="margin-top:4px">"${escapeHTML(ci.symptomNote)}"</div>` : ''}`;
    el('energy-morning-edit').addEventListener('click', () => openCheckinModal());
  } else {
    body.innerHTML = `<p class="card-note">Not done yet today. It sets your spoon budget.</p>
      <button class="btn btn-primary" id="energy-morning-start">Start Morning Check-In</button>`;
    el('energy-morning-start').addEventListener('click', () => openCheckinModal());
  }

  // Due / next-check hint
  const { last, nextAt, due } = energyCheckStatus();
  const dueEl = el('energy-due');
  if (due) {
    dueEl.className = 'energy-due due';
    dueEl.textContent = last ? `Time for a check-in — last one was at ${fmtTime(last)}.` : 'Time for your first check-in of the day.';
  } else if (nextAt) {
    dueEl.className = 'energy-due';
    dueEl.textContent = `Last check ${fmtTime(last)} · next suggested around ${fmtTime(nextAt.toISOString())}`;
  } else {
    dueEl.className = 'energy-due';
    dueEl.textContent = '';
  }

  renderEnergyCard(d);
  updateReminderPreview();
}

// ── Calendar reminders (.ics) ──

function reminderTimes() {
  const toMin = v => { const [h, m] = (v || '0:0').split(':').map(Number); return h * 60 + m; };
  const start = toMin(el('rem-start').value || '09:30');
  const end = toMin(el('rem-end').value || '20:00');
  const step = parseInt(el('rem-interval').value, 10) || 150;
  const out = [];
  for (let t = start; t <= end && out.length < 12; t += step) out.push(t);
  return out;
}

function fmtMinutes(t) {
  const h = Math.floor(t / 60), m = t % 60;
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

function updateReminderPreview() {
  const prev = el('rem-preview');
  if (!prev) return;
  const times = reminderTimes();
  prev.textContent = times.length ? `Daily alerts at ${times.map(fmtMinutes).join(', ')} (Eastern)` : 'Pick a first check before the last check.';
}

function downloadReminderCalendar() {
  const times = reminderTimes();
  if (!times.length) { flash('Pick a first check before the last check'); return; }
  const appUrl = location.origin + location.pathname + '#energy';
  const pad = n => String(n).padStart(2, '0');
  const dateKey = today().replace(/-/g, '');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Spoon Tracker//Energy Checks//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VTIMEZONE', 'TZID:America/New_York',
    'BEGIN:DAYLIGHT', 'TZOFFSETFROM:-0500', 'TZOFFSETTO:-0400', 'TZNAME:EDT', 'DTSTART:19700308T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU', 'END:DAYLIGHT',
    'BEGIN:STANDARD', 'TZOFFSETFROM:-0400', 'TZOFFSETTO:-0500', 'TZNAME:EST', 'DTSTART:19701101T020000', 'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU', 'END:STANDARD',
    'END:VTIMEZONE',
  ];
  times.forEach((t, i) => {
    lines.push(
      'BEGIN:VEVENT',
      `UID:spoon-energy-${dateKey}-${i}-${Date.now()}@spoon-tracker`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=America/New_York:${dateKey}T${pad(Math.floor(t / 60))}${pad(t % 60)}00`,
      'DURATION:PT5M',
      'RRULE:FREQ=DAILY',
      'SUMMARY:🔋 Energy check',
      `DESCRIPTION:How's your energy right now? Open Spoon Tracker: ${appUrl}`,
      `URL:${appUrl}`,
      'TRANSP:TRANSPARENT',
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:🔋 Energy check', 'TRIGGER:PT0M', 'END:VALARM',
      'END:VEVENT',
    );
  });
  lines.push('END:VCALENDAR');
  const blob = new Blob([lines.join('\r\n') + '\r\n'], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'spoon-tracker-energy-checks.ics';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  flash('Calendar file downloaded 📅');
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
    tags: act.tags || [],
  };
  entry.effectiveCost = calcEntryEffectiveCost(entry, entries, settings);
  saveActivityForDate(d, entry);
  return entry;
}

// ═══════════════════════════════════════════════════════
// MORNING CHECK-IN
// ═══════════════════════════════════════════════════════

// Time entry as hours + minutes (minutes in 5-minute steps). Stored as whole minutes;
// decimal hours (sleepHours / cpapHours) are kept alongside so the budget formula,
// Patterns charts, and CSV keep working unchanged.
function hmInputHTML(id, totalMin) {
  const has = totalMin != null && totalMin > 0;
  const h = has ? Math.floor(totalMin / 60) : '';
  const m = has ? totalMin % 60 : 0;
  const mins = Array.from({ length: 12 }, (_, i) => i * 5)
    .map(v => `<option value="${v}"${v === m ? ' selected' : ''}>${String(v).padStart(2, '0')} m</option>`).join('');
  return `<div class="hm-row" id="${id}">
      <input type="number" class="hm-h" min="0" max="16" step="1" inputmode="numeric" placeholder="0" value="${h}" />
      <span class="hm-unit">h</span>
      <select class="hm-m">${mins}</select>
    </div>`;
}
function readHM(root, id) {
  const row = root.querySelector('#' + id);
  const hRaw = row.querySelector('.hm-h').value;
  const m = parseInt(row.querySelector('.hm-m').value, 10) || 0;
  if (hRaw === '' && m === 0) return null;
  return (parseInt(hRaw, 10) || 0) * 60 + m;
}
// Older check-ins only have decimal hours; round to the nearest 5 minutes.
function toMinutes(minutes, hours) {
  if (minutes != null) return minutes;
  return hours ? Math.round(hours * 12) * 5 : null;
}
function fmtHM(totalMin) {
  if (!totalMin) return '0h';
  const h = Math.floor(totalMin / 60), m = totalMin % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

// Symptoms you've added yourself are remembered (per device) so they show up as
// chips on later mornings.
function getSavedSymptoms() { return getSettings().customSymptoms || []; }
function rememberSymptoms(list) {
  const s = getSettings();
  s.customSymptoms = [...new Set([...(s.customSymptoms || []), ...list])].slice(0, 20);
  saveSettings(s);
}

const FATIGUE_LABELS = { 1: 'Barely tired', 2: 'A little tired', 3: 'Tired', 4: 'Very tired', 5: 'Wiped out' };

function openCheckinModal(opts = {}) {
  const ds = today();
  const ex = getCheckin(ds) || {};
  const cpapUsedEx = ex.cpapUsed ?? (ex.cpapHours > 0 ? true : (ex.date ? false : null));
  const otherEx = ex.otherSymptoms || [];
  const symptomChoices = [...new Set([...getSavedSymptoms(), ...otherEx])];
  const fatigueEx = ex.nextDayFatigue > 0 ? ex.nextDayFatigue : null;
  const yn = (id, val) => `<div class="toggle-row" id="${id}">
      <button class="toggle-btn yes${val === true ? ' selected' : ''}" data-val="true">Yes</button>
      <button class="toggle-btn no${val === false ? ' selected' : ''}" data-val="false">No</button>
    </div>`;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-handle"></div>
      <div class="modal-title">🌅 Morning Check-In</div>
      ${opts.auto ? '<p class="card-note">Good morning! A quick check-in sets today’s spoon budget.</p>' : ''}
      <div class="form-group">
        <label class="form-label">Energy Level</label>
        <div class="scale-row" id="ci-energy">${scaleButtonsHTML(10, ex.energy)}</div>
      </div>
      <div class="form-group">
        <label class="form-label">Why? <span class="hint">(optional)</span></label>
        <input type="text" id="ci-why" placeholder="e.g. slept poorly, big day ahead" value="${ex.whyText ? escapeHTML(ex.whyText) : ''}" />
      </div>

      <div class="form-group">
        <label class="form-label">Symptoms this morning <span class="hint">(tap any that apply)</span></label>
        <div class="tag-chips tag-picker" id="ci-symptoms">
          <button type="button" class="tag-chip${ex.brainFog ? ' active' : ''}" data-sym="brainFog">🌫 Brain fog</button>
          <button type="button" class="tag-chip${ex.muscleWeak ? ' active' : ''}" data-sym="muscleWeak">💪 Muscle weakness</button>
          ${symptomChoices.map(t => `<button type="button" class="tag-chip${otherEx.includes(t) ? ' active' : ''}" data-other="${escapeHTML(t)}">${escapeHTML(t)}</button>`).join('')}
        </div>
        <div class="tag-add-row">
          <input type="text" id="ci-sym-new" placeholder="Add another symptom" maxlength="40" />
          <button type="button" class="btn btn-secondary btn-sm" id="ci-sym-add" style="margin:0;width:auto">Add</button>
        </div>
      </div>
      <div class="form-group" id="ci-weak-sev-wrap"${ex.muscleWeak ? '' : ' style="display:none"'}>
        <label class="form-label">Muscle Weakness Severity <span class="hint">(1-5)</span></label>
        <div class="scale-row" id="ci-weak-sev">${scaleButtonsHTML(5, ex.muscleWeakSev || null)}</div>
      </div>
      <div class="form-group">
        <label class="form-label">Anything else to explain? <span class="hint">(optional)</span></label>
        <input type="text" id="ci-sym-note" placeholder="e.g. tingling in feet, headache since 3 AM" value="${ex.symptomNote ? escapeHTML(ex.symptomNote) : ''}" />
      </div>

      <div class="ci-section-label">Last night</div>
      <div class="form-group">
        <label class="form-label">Did you take Trazodone?</label>
        ${yn('ci-traz', ex.date ? !!ex.trazodone : null)}
      </div>
      <div class="form-group">
        <label class="form-label">Did you use your CPAP?</label>
        ${yn('ci-cpap-used', cpapUsedEx)}
      </div>
      <div class="form-group" id="ci-cpap-time-wrap"${cpapUsedEx ? '' : ' style="display:none"'}>
        <label class="form-label">Time on CPAP</label>
        ${hmInputHTML('ci-cpap-time', toMinutes(ex.cpapMinutes, ex.cpapHours))}
      </div>
      <div class="form-group">
        <label class="form-label">Total sleep</label>
        ${hmInputHTML('ci-sleep-time', toMinutes(ex.sleepMinutes, ex.sleepHours))}
      </div>
      <div class="form-group">
        <label class="form-label">Sleep Quality <span class="hint">(1-5)</span></label>
        <div class="scale-row" id="ci-sq">${scaleButtonsHTML(5, ex.sleepQuality || null)}</div>
      </div>

      <div class="form-group">
        <label class="form-label">Next-Day Fatigue <span class="hint">(how did yesterday leave you?)</span></label>
        <input type="range" id="ci-fatigue" min="1" max="5" step="0.5" value="${fatigueEx ?? 3}" class="fatigue-slider${fatigueEx ? '' : ' unset'}" />
        <div class="slider-ends"><span>1 · Barely tired</span><span>5 · Wiped out</span></div>
        <div class="slider-value" id="ci-fatigue-val"></div>
      </div>

      <button class="btn btn-primary" id="ci-save" style="margin-top:8px">Save Check-In</button>
      <button class="btn btn-secondary" id="ci-cancel" style="margin-top:8px">${opts.auto ? 'Skip for now' : 'Cancel'}</button>
    </div>`;

  wireScalePickers(overlay);
  wireTogglePickers(overlay);

  // Symptom chips
  const symWrap = overlay.querySelector('#ci-symptoms');
  const wireChip = chip => chip.addEventListener('click', () => {
    chip.classList.toggle('active');
    if (chip.dataset.sym === 'muscleWeak') {
      overlay.querySelector('#ci-weak-sev-wrap').style.display = chip.classList.contains('active') ? '' : 'none';
    }
  });
  symWrap.querySelectorAll('.tag-chip').forEach(wireChip);
  const symInput = overlay.querySelector('#ci-sym-new');
  const addSym = () => {
    const t = symInput.value.trim().slice(0, 40);
    if (!t) return;
    let chip = [...symWrap.querySelectorAll('[data-other]')].find(c => c.dataset.other.toLowerCase() === t.toLowerCase());
    if (!chip) {
      chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'tag-chip';
      chip.dataset.other = t;
      chip.textContent = t;
      wireChip(chip);
      symWrap.appendChild(chip);
    }
    chip.classList.add('active');
    symInput.value = '';
  };
  overlay.querySelector('#ci-sym-add').addEventListener('click', addSym);
  symInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addSym(); } });

  // Fatigue slider — stays "not set" until touched, so an untouched slider saves nothing.
  const slider = overlay.querySelector('#ci-fatigue');
  const sliderVal = overlay.querySelector('#ci-fatigue-val');
  let fatigueTouched = fatigueEx != null;
  const showFatigue = () => {
    const v = parseFloat(slider.value);
    sliderVal.textContent = fatigueTouched ? `${v} · ${FATIGUE_LABELS[Math.round(v)]}` : 'Not set — slide to answer';
  };
  slider.addEventListener('input', () => { fatigueTouched = true; slider.classList.remove('unset'); showFatigue(); });
  showFatigue();

  const close = () => overlay.remove();
  overlay.querySelector('#ci-save').addEventListener('click', () => {
    const energy = parseInt(overlay.querySelector('#ci-energy .selected')?.dataset.val || '5');
    const whyText = overlay.querySelector('#ci-why').value.trim() || null;
    const brainFog = !!symWrap.querySelector('[data-sym="brainFog"].active');
    const muscleWeak = !!symWrap.querySelector('[data-sym="muscleWeak"].active');
    const muscleWeakSev = muscleWeak ? parseInt(overlay.querySelector('#ci-weak-sev .selected')?.dataset.val || '0') : 0;
    const otherSymptoms = [...symWrap.querySelectorAll('[data-other].active')].map(c => c.dataset.other);
    const symptomNote = overlay.querySelector('#ci-sym-note').value.trim() || null;
    const trazodone = overlay.querySelector('#ci-traz .selected')?.dataset.val === 'true';
    const cpapAns = overlay.querySelector('#ci-cpap-used .selected')?.dataset.val;
    const cpapUsed = cpapAns === undefined ? null : cpapAns === 'true';
    const cpapMinutes = cpapUsed ? (readHM(overlay, 'ci-cpap-time') || 0) : 0;
    const sleepMinutes = readHM(overlay, 'ci-sleep-time');
    const sleepQuality = parseInt(overlay.querySelector('#ci-sq .selected')?.dataset.val || '3');
    const nextDayFatigue = fatigueTouched ? parseFloat(slider.value) : 0;
    rememberSymptoms(otherSymptoms);
    saveCheckin(ds, {
      energy, whyText, brainFog, muscleWeak, muscleWeakSev, otherSymptoms, symptomNote,
      trazodone, cpapUsed, cpapMinutes, cpapHours: +(cpapMinutes / 60).toFixed(2),
      sleepMinutes, sleepHours: sleepMinutes ? +(sleepMinutes / 60).toFixed(2) : 0,
      sleepQuality, nextDayFatigue,
    });
    close();
    flash('Morning check-in saved!');
    if (opts.auto) showPage('today');
    else renderPage(window._currentPage || 'today');
    updateEnergyDueDot();
  });
  overlay.querySelector('#ci-cancel').addEventListener('click', () => {
    if (opts.auto) markMorningPromptSkipped();
    close();
  });
  overlay.addEventListener('click', e => {
    if (e.target !== overlay) return;
    if (opts.auto) markMorningPromptSkipped();
    close();
  });
  document.body.appendChild(overlay);
}

// ── Automatic morning prompt (5–7 AM Eastern) ──
// Opens the check-in when the app is opened in that window, unless today's check-in
// is already done or was skipped this morning. Skips are remembered per device only.
const MORNING_PROMPT_START = 5;
const MORNING_PROMPT_END = 7;
const MORNING_SKIP_KEY = 'sp_morning_skip';

function markMorningPromptSkipped() {
  try { localStorage.setItem(MORNING_SKIP_KEY, today()); } catch {}
}

function maybePromptMorningCheckin() {
  if (getSettings().enableMorningPrompt === false) return;
  const h = etHourNow();
  if (h < MORNING_PROMPT_START || h >= MORNING_PROMPT_END) return;
  if (getCheckin(today())) return;
  let skipped = null;
  try { skipped = localStorage.getItem(MORNING_SKIP_KEY); } catch {}
  if (skipped === today()) return;
  if (document.querySelector('.modal-overlay')) return;
  openCheckinModal({ auto: true });
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
      if (row.id === 'ci-cpap-used') {
        const wrap = root.querySelector('#ci-cpap-time-wrap');
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
let _editMode = false;
let _logFilter = 'all';   // 'all' | 'fav' | a tag
let _logSearch = '';
let _customTagPicker = null;

function renderLog() {
  _multiMode = false;
  _multiSel = new Set();
  _editMode = false;

  const multiToggle = el('log-multi-toggle');
  multiToggle.textContent = 'Select multiple';
  multiToggle.classList.remove('active');
  multiToggle.onclick = toggleMultiMode;
  const editToggle = el('log-edit-toggle');
  editToggle.textContent = '✏️ Edit items';
  editToggle.classList.remove('active');
  editToggle.onclick = toggleEditMode;
  const multiSubmit = el('log-multi-submit');
  multiSubmit.hidden = true;
  multiSubmit.onclick = submitMultiLog;
  updateLogHint();

  const search = el('log-search');
  search.value = _logSearch;
  search.oninput = () => { _logSearch = search.value; drawLogGroups(); };

  // New item + time/note toggles
  el('log-custom-toggle').onclick = () => {
    const sec = el('log-custom-section');
    sec.hidden = !sec.hidden;
    if (!sec.hidden) {
      _customTagPicker = makeTagPicker(el('custom-tags'), []);
      sec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
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
  _loggedTodayAll = false;
  drawCalendarReview();
  drawLoggedToday();
  drawLogGroups();
}

// "Logged today" strip at the top of the Log tab — the place to delete a mistaken
// entry or tap its cost to change it. Shows the latest 3 unless expanded.
const LOGGED_TODAY_PREVIEW = 3;
let _loggedTodayAll = false;

function drawLoggedToday() {
  const d = today();
  const entries = getActivitiesForDate(d).slice().reverse();
  const card = el('logged-today');
  card.hidden = entries.length === 0;
  if (!entries.length) return;
  el('logged-today-count').textContent = entries.length;
  const list = el('logged-today-list');
  list.innerHTML = '';
  (_loggedTodayAll ? entries : entries.slice(0, LOGGED_TODAY_PREVIEW))
    .forEach(e => list.appendChild(makeActivityItem(e, d)));
  const more = el('logged-today-more');
  more.hidden = entries.length <= LOGGED_TODAY_PREVIEW;
  more.textContent = _loggedTodayAll ? 'Show less' : `Show all ${entries.length}`;
  more.onclick = () => { _loggedTodayAll = !_loggedTodayAll; drawLoggedToday(); };
}

function updateLogHint() {
  const hint = el('log-hint');
  if (!hint) return;
  hint.textContent = _editMode ? 'Tap an item to edit its name, cost, category, or tags.'
    : _multiMode ? 'Tap items to select, then "Log Selected".'
    : 'Tap any item to log it instantly.';
}

function drawTagChips() {
  const wrap = el('log-tag-chips');
  const chips = [{ id: 'all', label: 'All' }, { id: 'fav', label: '⭐ Favorites' },
    ...getAllTags().map(t => ({ id: t, label: '#' + t }))];
  if (!chips.some(c => c.id === _logFilter)) _logFilter = 'all';
  wrap.innerHTML = '';
  chips.forEach(c => {
    const b = document.createElement('button');
    b.className = 'tag-chip' + (_logFilter === c.id ? ' active' : '');
    b.textContent = c.label;
    b.addEventListener('click', () => { _logFilter = c.id; drawLogGroups(); });
    wrap.appendChild(b);
  });
}

function activityMatchesSearch(act, q) {
  if (!q) return true;
  const catLabel = CATEGORIES.find(c => c.id === act.category)?.label || '';
  return [act.name, catLabel, ...(act.tags || [])].some(v => v.toLowerCase().includes(q));
}

// Full library, grouped by category, with favorites pinned on top.
function drawLogGroups() {
  drawTagChips();
  const container = el('log-groups');
  container.innerHTML = '';
  const q = _logSearch.trim().toLowerCase();
  const favIds = getSettings().quickIds || QUICK_IDS;
  let acts = getAllActivities().filter(a => activityMatchesSearch(a, q));
  if (_logFilter === 'fav') acts = acts.filter(a => favIds.includes(a.id));
  else if (_logFilter !== 'all') acts = acts.filter(a => (a.tags || []).includes(_logFilter));

  const groups = [];
  if (_logFilter === 'all' && !q) {
    const favs = favIds.map(id => acts.find(a => a.id === id)).filter(Boolean);
    if (favs.length) groups.push({ id: 'fav', label: '⭐ Favorites', acts: favs });
  }
  CATEGORIES.forEach(c => {
    const inCat = acts.filter(a => (a.category || 'household') === c.id);
    if (inCat.length) groups.push({ id: c.id, label: c.label, color: c.color, acts: inCat });
  });

  if (!groups.length) {
    container.innerHTML = `<div class="card"><div class="empty-state"><div class="emoji">🔍</div><p>No items match. Try another search, or add it with ＋ New item.</p></div></div>`;
    return;
  }

  groups.forEach(g => {
    const card = document.createElement('div');
    card.className = 'card log-group';
    card.innerHTML = `<div class="log-group-head">
        <span class="card-title" style="margin:0">${g.color ? `<span class="cat-dot" style="background:${g.color}"></span>` : ''}${g.label} <span class="lg-count">${g.acts.length}</span></span>
        ${g.id === 'fav' ? '<button class="link-btn" style="margin:0">Edit favorites</button>' : ''}
      </div>
      <div class="activity-grid"></div>`;
    const favEdit = card.querySelector('.link-btn');
    if (favEdit) favEdit.addEventListener('click', openQuickLogEditor);
    const grid = card.querySelector('.activity-grid');
    g.acts.forEach(act => grid.appendChild(makeLogButton(act)));
    container.appendChild(card);
  });
}

function makeLogButton(act) {
  const btn = document.createElement('button');
  btn.className = 'activity-select-btn' + (_multiSel.has(act.id) ? ' selected' : '') + (_editMode ? ' editing' : '');
  btn.dataset.id = act.id;
  const costLabel = act.spoons < 0 ? `+${Math.abs(act.spoons)} recovery`
    : act.spoons === 0 ? 'free'
    : `${act.spoons} spoon${act.spoons === 1 ? '' : 's'}`;
  const tags = (act.tags || []).map(t => `<span class="item-tag">#${escapeHTML(t)}</span>`).join('');
  btn.innerHTML = `<span class="emoji">${act.emoji}</span><div class="info"><div class="n">${escapeHTML(act.name)}</div><div class="s">${costLabel}</div>${tags ? `<div class="item-tags">${tags}</div>` : ''}</div>${_editMode ? '<span class="edit-pencil">✏️</span>' : ''}`;

  btn.addEventListener('click', () => {
    if (_editMode) openActivityEditor(act);
    else if (_multiMode) toggleMultiSelect(act.id);
    else logFromGrid(act, btn);
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

// After a library edit, redraw the Log list in place so edit / multi-select mode,
// search, and tag filter all survive; other pages re-render normally.
function refreshAfterLibraryEdit() {
  if (window._currentPage === 'log') drawLogGroups();
  else renderPage(window._currentPage);
}

function toggleEditMode() {
  _editMode = !_editMode;
  if (_editMode && _multiMode) toggleMultiMode();
  const t = el('log-edit-toggle');
  t.textContent = _editMode ? 'Done editing' : '✏️ Edit items';
  t.classList.toggle('active', _editMode);
  updateLogHint();
  drawLogGroups();
}

// Chip-style tag picker: toggle existing tags or type a new one.
function makeTagPicker(container, initial) {
  const selected = new Set((initial || []).map(normalizeTag).filter(Boolean));
  const extra = new Set();   // tags created here that aren't in the library yet
  function draw() {
    const all = [...new Set([...getAllTags(), ...extra, ...selected])];
    container.innerHTML = `<div class="tag-chips tag-picker">${all.map(t =>
        `<button type="button" class="tag-chip${selected.has(t) ? ' active' : ''}" data-tag="${escapeHTML(t)}">#${escapeHTML(t)}</button>`).join('')}</div>
      <div class="tag-add-row">
        <input type="text" class="tag-add-input" placeholder="Add a tag (e.g. social, pt)" maxlength="24" />
        <button type="button" class="btn btn-secondary btn-sm tag-add-btn" style="margin:0;width:auto">Add</button>
      </div>`;
    container.querySelectorAll('.tag-chip').forEach(b => b.addEventListener('click', () => {
      const t = b.dataset.tag;
      if (selected.has(t)) selected.delete(t); else selected.add(t);
      draw();
    }));
    const input = container.querySelector('.tag-add-input');
    const add = () => {
      const t = normalizeTag(input.value);
      if (!t) return;
      extra.add(t); selected.add(t);
      draw();
      container.querySelector('.tag-add-input').focus();
    };
    container.querySelector('.tag-add-btn').addEventListener('click', add);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); add(); } });
  }
  draw();
  return { get: () => [...selected] };
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
  drawLoggedToday();
  // reset advanced note after use
  const noteEl = el('log-note'); if (noteEl) noteEl.value = '';
}

function toggleMultiMode() {
  _multiMode = !_multiMode;
  _multiSel = new Set();
  if (_multiMode && _editMode) toggleEditMode();
  const multiToggle = el('log-multi-toggle');
  const multiSubmit = el('log-multi-submit');
  multiToggle.textContent = _multiMode ? 'Cancel' : 'Select multiple';
  multiToggle.classList.toggle('active', _multiMode);
  if (multiSubmit) multiSubmit.hidden = !_multiMode;
  updateLogHint();
  el('log-groups').querySelectorAll('.activity-select-btn').forEach(b => b.classList.remove('selected'));
  updateMultiSubmit();
}

function toggleMultiSelect(id) {
  if (_multiSel.has(id)) _multiSel.delete(id); else _multiSel.add(id);
  // Favorites show twice (pinned + in their category), so sync every copy.
  el('log-groups').querySelectorAll(`.activity-select-btn[data-id="${CSS.escape(id)}"]`)
    .forEach(b => b.classList.toggle('selected', _multiSel.has(id)));
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
  const tags = _customTagPicker ? _customTagPicker.get() : [];
  const act = { id: 'custom_' + Date.now(), name, spoons, emoji, category, recovery: spoons < 0, tags };

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
  _customTagPicker = null;
  flash(`${emoji} ${name} logged`);
  showPage('today');
}

// ═══════════════════════════════════════════════════════
// CALENDAR IMPORT  (fed by an iPhone Shortcut via the URL hash)
// ═══════════════════════════════════════════════════════
//
// The Shortcut opens  …/spoon-tracker/#cal=<url-encoded text>  where each line is
//   Title|Start (ISO 8601)|End (ISO 8601)|Calendar name
// Everything after "#" stays in the browser — it is never sent to the server.
// Imported events wait on the Log tab until you log or skip each one.

const CAL_SKIP = '__skip';

// Starter guesses from event titles. Your own corrections (calTitleMap) always win.
const CAL_ALIASES = [
  [/massage/i, 'massage'],
  [/\bpt\b|physical therap/i, 'pt'],
  [/cmt.*class|exercise class/i, 'cmt_class'],
  [/\bdr\b\.?|doctor|appointment|\bappt\b|clinic|dentist|neurolog/i, 'doctor'],
  [/grocer/i, 'grocery'],
  [/yin|restorative yoga/i, 'yin_yoga'],
  [/yoga/i, 'yoga'],
  [/\bgym\b/i, 'gym'],
  [/\bcall\b|zoom|facetime|catch.?up/i, 'call'],
  [/lunch|dinner|brunch|breakfast with|restaurant/i, 'restaurant'],
  [/flight|airport/i, 'travel_day'],
  [/\bvet\b|groom/i, 'pet_care'],
  [/concert|live music/i, 'live_music'],
  [/movie|theat|show\b/i, 'event'],
  [/interview|meeting|work/i, 'work_block'],
];

const CAL_STOPWORDS = new Set(['night', 'time', 'with', 'full', 'session', 'class', 'light', 'heavy',
  'quick', 'other', 'favorite', 'artists', 'playlists', 'block', 'meal', 'getting', 'search', 'outing', 'project', 'trip']);

function getCalEvents(ds) { return (load(KEYS.CAL_EVENTS) || {})[ds] || []; }
function saveCalEvents(ds, list) {
  const all = load(KEYS.CAL_EVENTS) || {};
  all[ds] = list;
  save(KEYS.CAL_EVENTS, all);
}
function updateCalEvent(ds, uid, patch) {
  saveCalEvents(ds, getCalEvents(ds).map(e => e.uid === uid ? { ...e, ...patch } : e));
}

function calNormTitle(t) { return String(t || '').trim().toLowerCase().replace(/\s+/g, ' '); }

function parseCalLines(text) {
  return String(text || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => {
    // Split from the right so titles may contain "|".
    const parts = line.split('|');
    if (parts.length < 3) return null;
    const calendar = parts.length >= 4 ? parts.pop().trim() : '';
    const end = parts.pop().trim();
    const start = parts.pop().trim();
    const title = parts.join('|').trim();
    const startD = new Date(start);
    if (!title || isNaN(startD)) return null;
    const endD = new Date(end);
    const allDay = !/T\d/.test(start) || (!isNaN(endD) && endD - startD >= 23 * 3600000);
    return { title, start: startD.toISOString(), end: isNaN(endD) ? null : endD.toISOString(), calendar, allDay };
  }).filter(Boolean);
}

// Merge imported events into storage by day; re-imports keep earlier decisions.
function importCalendarText(text) {
  const parsed = parseCalLines(text);
  const byDay = {};
  parsed.forEach(ev => {
    const ds = dateStr(new Date(ev.start));
    (byDay[ds] = byDay[ds] || []).push(ev);
  });
  let added = 0;
  Object.entries(byDay).forEach(([ds, evs]) => {
    const existing = getCalEvents(ds);
    evs.forEach(ev => {
      const uid = calNormTitle(ev.title) + '@' + ev.start;
      if (existing.some(e => e.uid === uid)) return;
      existing.push({ ...ev, uid, status: 'pending' });
      added++;
    });
    existing.sort((a, b) => a.start < b.start ? -1 : 1);
    saveCalEvents(ds, existing);
  });
  const s = getSettings();
  s.calLastImport = new Date().toISOString();
  saveSettings(s);
  return { found: parsed.length, added };
}

function importCalendarFromHash() {
  const h = location.hash || '';
  if (!h.startsWith('#cal=')) return false;
  let text = '';
  try { text = decodeURIComponent(h.slice(5).replace(/\+/g, ' ')); } catch { text = h.slice(5); }
  const { found, added } = importCalendarText(text);
  history.replaceState(null, '', location.pathname + location.search);
  flash(found ? `📅 ${added} new event${added === 1 ? '' : 's'} to review` : '📅 No events found in that import');
  return true;
}

// Suggest an activity id (or CAL_SKIP) for an event; null = no idea.
function suggestCalActivity(ev) {
  const s = getSettings();
  const norm = calNormTitle(ev.title);
  const remembered = (s.calTitleMap || {})[norm];
  const acts = getAllActivities();
  if (remembered && (remembered === CAL_SKIP || acts.some(a => a.id === remembered))) return { id: remembered, why: 'remembered' };
  // Whole-word match, so "dan" skips "Dan Soccer" but not "Dance class".
  const startsWithWords = p => { p = p.toLowerCase(); return norm === p || (norm.startsWith(p) && !/[a-z0-9]/.test(norm[p.length])); };
  if ((s.calSkipPrefixes || []).some(p => p && startsWithWords(p))) return { id: CAL_SKIP, why: 'rule' };
  if (ev.allDay) return { id: CAL_SKIP, why: 'all-day' };
  for (const [re, id] of CAL_ALIASES) {
    if (re.test(ev.title) && acts.some(a => a.id === id)) return { id, why: 'guess' };
  }
  // Fall back to a word match against activity names (custom ones included),
  // ignoring generic words like "night" or "time" that caused bad guesses.
  const words = norm.split(/[^a-z]+/).filter(w => w.length >= 4 && !CAL_STOPWORDS.has(w));
  const hit = acts.find(a => calNormTitle(a.name).split(/[^a-z]+/).some(w => w.length >= 4 && !CAL_STOPWORDS.has(w) && words.includes(w)));
  return hit ? { id: hit.id, why: 'guess' } : null;
}

function rememberCalChoice(title, id) {
  const s = getSettings();
  s.calTitleMap = { ...(s.calTitleMap || {}), [calNormTitle(title)]: id };
  saveSettings(s);
}

function activityOptionsHTML(selectedId) {
  const acts = getAllActivities();
  const groups = CATEGORIES.map(c => {
    const inCat = acts.filter(a => (a.category || 'household') === c.id);
    if (!inCat.length) return '';
    return `<optgroup label="${c.label}">${inCat.map(a =>
      `<option value="${a.id}"${a.id === selectedId ? ' selected' : ''}>${a.emoji} ${escapeHTML(a.name)}</option>`).join('')}</optgroup>`;
  }).join('');
  return `<option value=""${!selectedId ? ' selected' : ''}>Choose an activity…</option>
    <option value="${CAL_SKIP}"${selectedId === CAL_SKIP ? ' selected' : ''}>Skip — not mine / don't log</option>${groups}`;
}

let _calReviewedOpen = false;

function drawCalendarReview() {
  const card = el('cal-review');
  if (!card) return;
  const d = today();
  const events = getCalEvents(d);
  const pending = events.filter(e => e.status === 'pending');
  const reviewed = events.filter(e => e.status !== 'pending');
  const everImported = !!getSettings().calLastImport;
  card.hidden = false;

  const body = el('cal-review-body');
  el('cal-review-count').textContent = pending.length ? pending.length : '';
  if (!events.length) {
    body.innerHTML = everImported
      ? '<p class="card-note" style="margin:0">No calendar events imported for today. Run your Spoon Tracker Shortcut to bring them in.</p>'
      : '<p class="card-note" style="margin:0">Bring in today’s calendar events to review and log. <button class="link-btn" data-goto="settings" style="margin:0">Set up the Shortcut ›</button></p>';
    body.querySelectorAll('[data-goto]').forEach(b => b.addEventListener('click', () => {
      showPage(b.dataset.goto);
      el('cal-settings-card')?.scrollIntoView({ behavior: 'smooth' });
    }));
    return;
  }

  const now = new Date();
  const acts = getAllActivities();
  body.innerHTML = '';
  if (!pending.length) {
    body.insertAdjacentHTML('beforeend', '<p class="card-note" style="margin:0 0 6px">✓ All of today’s events are reviewed.</p>');
  }
  pending.forEach(ev => {
    const sug = suggestCalActivity(ev);
    const later = new Date(ev.start) > now;
    const mins = ev.end ? Math.round((new Date(ev.end) - new Date(ev.start)) / 60000) : null;
    const row = document.createElement('div');
    row.className = 'cal-row' + (later ? ' later' : '');
    const whyLabel = sug?.why === 'remembered' ? 'Remembered' : sug?.why === 'rule' ? 'Skip rule' : sug?.why === 'all-day' ? 'All-day event' : sug ? 'Suggested' : '';
    row.innerHTML = `
      <div class="cal-head">
        <span class="cal-time">${ev.allDay ? 'All day' : fmtTime(ev.start)}</span>
        <span class="cal-title">${escapeHTML(ev.title)}</span>
      </div>
      <div class="cal-sub">${[ev.calendar && escapeHTML(ev.calendar), mins && !ev.allDay ? `${mins} min` : '', later ? 'Later today' : ''].filter(Boolean).join(' · ')}${whyLabel ? ` <span class="cal-why">${whyLabel}</span>` : ''}</div>
      <select class="cal-act">${activityOptionsHTML(sug?.id || '')}</select>
      <label class="cal-remember"><input type="checkbox" checked /> Remember for “${escapeHTML(ev.title.length > 40 ? ev.title.slice(0, 40) + '…' : ev.title)}”</label>
      <div class="cal-actions">
        <button class="btn btn-primary btn-sm cal-confirm" style="margin:0"></button>
        <button class="btn btn-secondary btn-sm cal-skip" style="margin:0">Skip</button>
      </div>`;
    const sel = row.querySelector('.cal-act');
    const confirmBtn = row.querySelector('.cal-confirm');
    const remember = row.querySelector('.cal-remember input');
    const syncBtn = () => {
      const v = sel.value;
      const act = acts.find(a => a.id === v);
      confirmBtn.disabled = !v;
      confirmBtn.textContent = v === CAL_SKIP ? 'Skip this event'
        : act ? `✓ Log · ${act.spoons < 0 ? `+${Math.abs(act.spoons)} recovery` : act.spoons === 0 ? 'free' : `${act.spoons} spoon${act.spoons === 1 ? '' : 's'}`}`
        : '✓ Log';
      row.querySelector('.cal-skip').hidden = v === CAL_SKIP;
    };
    sel.addEventListener('change', syncBtn);
    syncBtn();
    const decide = id => {
      if (remember.checked) rememberCalChoice(ev.title, id);
      if (id === CAL_SKIP) {
        updateCalEvent(d, ev.uid, { status: 'skipped' });
        flash('Skipped');
      } else {
        const act = getAllActivities().find(a => a.id === id);
        if (!act) return;
        const entry = logActivity(act, { timestamp: ev.start, note: `📅 ${ev.title}` });
        updateCalEvent(d, ev.uid, { status: 'logged', entryId: entry.id, activityId: id });
        flash(`${act.emoji} ${act.name} logged`);
      }
      drawCalendarReview();
      drawLoggedToday();
    };
    confirmBtn.addEventListener('click', () => sel.value && decide(sel.value));
    row.querySelector('.cal-skip').addEventListener('click', () => decide(CAL_SKIP));
    body.appendChild(row);
  });

  if (reviewed.length) {
    const toggle = document.createElement('button');
    toggle.className = 'link-btn';
    toggle.style.margin = '6px 0 0';
    toggle.textContent = `${_calReviewedOpen ? '∨' : '›'} Reviewed (${reviewed.length})`;
    toggle.addEventListener('click', () => { _calReviewedOpen = !_calReviewedOpen; drawCalendarReview(); });
    body.appendChild(toggle);
    if (_calReviewedOpen) {
      reviewed.forEach(ev => {
        const act = acts.find(a => a.id === ev.activityId);
        const line = document.createElement('div');
        line.className = 'cal-done';
        line.innerHTML = `<span>${ev.allDay ? 'All day' : fmtTime(ev.start)} · ${escapeHTML(ev.title)}</span>
          <span class="cal-done-status">${ev.status === 'logged' ? `✓ ${act ? act.emoji + ' ' + escapeHTML(act.name) : 'Logged'}` : 'Skipped'}</span>
          <button class="link-btn" style="margin:0">Undo</button>`;
        line.querySelector('button').addEventListener('click', () => {
          if (ev.status === 'logged' && ev.entryId) deleteActivityForDate(d, ev.entryId);
          updateCalEvent(d, ev.uid, { status: 'pending', entryId: null, activityId: null });
          drawCalendarReview();
          drawLoggedToday();
        });
        body.appendChild(line);
      });
    }
  }
}

// ── Settings: calendar import ──


function renderCalendarSettings() {
  const s = getSettings();
  const wrap = el('cal-skip-list');
  if (!wrap) return;
  const prefixes = s.calSkipPrefixes || [];
  wrap.innerHTML = prefixes.length
    ? prefixes.map(p => `<button type="button" class="tag-chip" data-p="${escapeHTML(p)}">${escapeHTML(p)} ✕</button>`).join('')
    : '<span class="s-sub">No skip rules yet.</span>';
  wrap.querySelectorAll('.tag-chip').forEach(b => b.addEventListener('click', () => {
    const st = getSettings();
    st.calSkipPrefixes = (st.calSkipPrefixes || []).filter(x => x !== b.dataset.p);
    saveSettings(st);
    renderCalendarSettings();
  }));
  const n = Object.keys(s.calTitleMap || {}).length;
  el('cal-memory-count').textContent = n ? `${n} remembered event name${n === 1 ? '' : 's'}` : 'No remembered event names yet';
  el('cal-memory-clear').hidden = !n;
  el('cal-last-import').textContent = s.calLastImport ? `Last import: ${fmtDate(dateStr(new Date(s.calLastImport)))} at ${fmtTime(s.calLastImport)}` : 'No imports yet';
  el('cal-url-base').textContent = location.origin + location.pathname + '#cal=';
}

function addCalSkipPrefix() {
  const input = el('cal-skip-input');
  const p = input.value.trim().toLowerCase().slice(0, 30);
  if (!p) return;
  const s = getSettings();
  s.calSkipPrefixes = [...new Set([...(s.calSkipPrefixes || []), p])];
  saveSettings(s);
  input.value = '';
  renderCalendarSettings();
}

function clearCalMemory() {
  if (!confirm('Forget all remembered event names? Suggestions will go back to guesses.')) return;
  const s = getSettings();
  s.calTitleMap = {};
  saveSettings(s);
  renderCalendarSettings();
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
      <div class="form-group">
        <label class="form-label">Tags</label>
        <div id="ae-tags"></div>
      </div>
      <button class="btn btn-primary" id="ae-save" style="margin-top:8px">Save</button>
      ${isCustom ? '<button class="btn btn-danger" id="ae-delete" style="margin-top:8px">Delete Activity</button>' : ''}
      <button class="btn btn-secondary" id="ae-cancel" style="margin-top:8px">Cancel</button>
    </div>`;

  const tagPicker = makeTagPicker(overlay.querySelector('#ae-tags'), act.tags || []);
  overlay.querySelector('#ae-save').addEventListener('click', () => {
    const tags = tagPicker.get();
    const name = overlay.querySelector('#ae-name').value.trim() || act.name;
    const emoji = overlay.querySelector('#ae-emoji').value.trim() || act.emoji;
    const spoons = parseFloat(overlay.querySelector('#ae-spoons').value);
    const category = overlay.querySelector('#ae-category').value;
    if (isCustom) {
      const customs = getCustomActivities().map(a => a.id === act.id
        ? { ...a, name, emoji, spoons: isNaN(spoons) ? a.spoons : spoons, category, recovery: (isNaN(spoons) ? a.spoons : spoons) < 0, tags }
        : a);
      save(KEYS.CUSTOM_ACT, customs);
    } else {
      const settings = getSettings();
      if (!settings.overrides) settings.overrides = {};
      const ov = { ...(settings.overrides[act.id] || {}), name, emoji, category, tags };
      if (!isNaN(spoons)) ov.spoons = spoons;
      settings.overrides[act.id] = ov;
      // keep legacy spoonOverrides in sync so the Settings cost table matches
      if (!settings.spoonOverrides) settings.spoonOverrides = {};
      if (!isNaN(spoons)) settings.spoonOverrides[act.id] = spoons;
      saveSettings(settings);
    }
    overlay.remove();
    flash('Activity updated');
    refreshAfterLibraryEdit();
  });
  const delBtn = overlay.querySelector('#ae-delete');
  if (delBtn) delBtn.addEventListener('click', () => {
    if (!confirm(`Delete "${act.name}" from your library?`)) return;
    save(KEYS.CUSTOM_ACT, getCustomActivities().filter(a => a.id !== act.id));
    overlay.remove();
    flash('Activity deleted');
    refreshAfterLibraryEdit();
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
        ${(checkin.otherSymptoms || []).map(t => `<span class="chip yellow">${escapeHTML(t)}</span>`).join('')}
        ${checkin.trazodone ? `<span class="tag">💊 Trazodone</span>` : ''}
        ${checkin.cpapHours ? `<span class="tag">😷 CPAP ${fmtHM(toMinutes(checkin.cpapMinutes, checkin.cpapHours))}</span>` : checkin.cpapUsed === false ? `<span class="tag">😷 No CPAP</span>` : ''}
        ${checkin.sleepHours ? `<span class="tag">💤 ${fmtHM(toMinutes(checkin.sleepMinutes, checkin.sleepHours))} sleep</span>` : ''}
      </div>
      ${checkin.whyText ? `<div class="note" style="margin-top:6px">"${escapeHTML(checkin.whyText)}"</div>` : ''}
      ${checkin.symptomNote ? `<div class="note" style="margin-top:4px">"${escapeHTML(checkin.symptomNote)}"</div>` : ''}
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
  const ver = el('app-version');
  if (ver) ver.textContent = `Version ${APP_VERSION}`;
  const pn = el('profile-name');
  if (pn) pn.textContent = profileName() || '—';
  el('set-base-budget').value = settings.baseBudget || 10;
  setToggle('set-auto-adjust', settings.autoAdjust !== false);
  setToggle('set-after-six', settings.enableAfterSixModifier !== false);
  setToggle('set-stacking', settings.enableStackingPenalty !== false);
  setToggle('set-evening-reminder', settings.enableEveningReminder === true);
  setToggle('set-morning-prompt', settings.enableMorningPrompt !== false);
  setToggle('set-energy-dot', settings.enableEnergyDueDot !== false);
  renderSavedSymptoms();
  renderCalendarSettings();
  _newCustomTagPicker = makeTagPicker(el('new-custom-tags'), []);

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

let _newCustomTagPicker = null;

function renderSavedSymptoms() {
  const wrap = el('saved-symptoms-list');
  if (!wrap) return;
  const list = getSavedSymptoms();
  if (!list.length) {
    wrap.innerHTML = '<span class="s-sub">None yet — add one from the morning check-in.</span>';
    return;
  }
  wrap.innerHTML = list.map(t => `<button type="button" class="tag-chip" data-sym="${escapeHTML(t)}">${escapeHTML(t)} ✕</button>`).join('');
  wrap.querySelectorAll('.tag-chip').forEach(b => b.addEventListener('click', () => {
    const s = getSettings();
    s.customSymptoms = (s.customSymptoms || []).filter(x => x !== b.dataset.sym);
    saveSettings(s);
    renderSavedSymptoms();
  }));
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
      <div class="modal-title">Edit Favorites</div>
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
    flash('Favorites updated');
    refreshAfterLibraryEdit();
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
  settings.enableMorningPrompt = el('set-morning-prompt').checked;
  settings.enableEnergyDueDot = el('set-energy-dot').checked;

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
  updateEnergyDueDot();
  flash('Settings saved!');
}

function addCustomActivity() {
  const name = el('new-custom-name').value.trim();
  const spoons = parseFloat(el('new-custom-spoons').value);
  const emoji = el('new-custom-emoji').value.trim() || '⚡';
  const category = el('new-custom-category')?.value || 'household';
  if (!name || isNaN(spoons)) { alert('Please enter a name and spoon cost.'); return; }
  const customs = getCustomActivities();
  const tags = _newCustomTagPicker ? _newCustomTagPicker.get() : [];
  customs.push({ id: 'custom_' + Date.now(), name, spoons, emoji, category, recovery: spoons < 0, tags });
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

function shareSpoonCount() {
  const d = today();
  const { remaining, budget, used } = calcSpoonsRemaining(d);
  const energy = morningEnergy(d);
  const name = profileName();
  const title = name ? `${name}’s Energy Update` : 'My Energy Update';
  const text = `🥄 ${title} — ${fmtDate(d)}\n\nSpoons remaining: ${remaining}/${budget}\nSpoons used: ${used}\nMorning energy: ${energy ? energy + '/10' : '?'}\n\nSent via Spoon Tracker`;
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
    'Energy Checks', 'Morning Energy', 'Morning Why', 'Sleep Hours', 'CPAP Used', 'CPAP Hours', 'Trazodone',
    'Brain Fog', 'Muscle Weakness', 'Other Symptoms', 'Symptom Notes', 'Next-Day Fatigue',
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
      ci.sleepHours || '', ci.cpapUsed == null ? (ci.cpapHours ? 'Yes' : '') : (ci.cpapUsed ? 'Yes' : 'No'), ci.cpapHours || '', ci.trazodone ? 'Yes' : 'No',
      ci.brainFog ? 'Yes' : (sym.brainFog ? 'Yes' : 'No'), weakness, (ci.otherSymptoms || []).join('; '), ci.symptomNote || '', getNextDayFatigue(d) ?? '',
      rf.endEnergy || '', rf.wentWell || '', rf.tomorrow || '']);
  });

  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `spoon-tracker-${today()}.csv`;
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

// One-time migration to the 9-slot Quick Log. Keeps whatever the user already had
// and tops the list up to 9 with the defaults, so nobody is left on 5. Runs once
// (guarded by a flag), after which the user's own edits are always respected.
function migrateQuickIds() {
  const s = load(KEYS.SETTINGS) || {};
  if (s.quickMigratedTo9) return;
  const cur = (Array.isArray(s.quickIds) ? s.quickIds : []).slice(0, 9);
  for (const id of QUICK_IDS) {
    if (cur.length >= 9) break;
    if (!cur.includes(id)) cur.push(id);
  }
  s.quickIds = cur;
  s.quickMigratedTo9 = true;
  saveSettings(s);
}

let _swReloading = false;

// A device that already has tracking data but no profile is the original owner
// install (Elaine's). Wrap that data in an owner profile without disturbing it, so
// her specialized activities and setup carry over untouched.
function runProfileMigration() {
  if (hasProfile()) return;
  const hasLegacyData = DATA_KEYS.some(k => localStorage.getItem(k) !== null);
  if (hasLegacyData) {
    saveProfile({ id: 'p_' + Date.now(), name: 'Elaine', owner: true, createdAt: new Date().toISOString() });
  }
}

function init() {
  runProfileMigration();
  if (!hasProfile()) {
    renderOnboarding();
    return;
  }
  startApp();
}

function startApp() {
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

  el('morning-prompt').addEventListener('click', () => openCheckinModal());
  el('budget-edit-btn').addEventListener('click', editBudget);
  el('energy-save').addEventListener('click', saveEnergyCheck);
  el('rem-download').addEventListener('click', downloadReminderCalendar);
  ['rem-start', 'rem-end', 'rem-interval'].forEach(id => el(id).addEventListener('change', updateReminderPreview));
  document.querySelectorAll('[data-goto]').forEach(b =>
    b.addEventListener('click', () => showPage(b.dataset.goto)));

  el('settings-save').addEventListener('click', saveSettingsForm);
  el('add-custom-btn').addEventListener('click', addCustomActivity);
  el('share-btn').addEventListener('click', shareSpoonCount);
  el('export-csv-btn').addEventListener('click', exportCSV);
  el('load-sample-btn').addEventListener('click', loadSampleData);
  el('clear-data-btn').addEventListener('click', () => {
    if (confirm('Delete ALL tracking data? Your profile stays, but every logged day, check-in, and setting is erased. This cannot be undone.')) {
      DATA_KEYS.forEach(k => localStorage.removeItem(k));
      flash('All data cleared');
      renderPage('today');
    }
  });

  const rn = el('profile-rename-btn'); if (rn) rn.addEventListener('click', renameProfile);
  const so = el('profile-startover-btn'); if (so) so.addEventListener('click', startOver);
  const be = el('backup-export-btn'); if (be) be.addEventListener('click', exportBackup);
  const bi = el('backup-import-btn'); if (bi) bi.addEventListener('click', () => el('backup-import-file').click());
  const bf = el('backup-import-file'); if (bf) bf.addEventListener('change', importBackup);
  el('cal-skip-add').addEventListener('click', addCalSkipPrefix);
  el('cal-skip-input').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addCalSkipPrefix(); } });
  el('cal-memory-clear').addEventListener('click', clearCalMemory);

  window.addEventListener('hashchange', () => {
    if (importCalendarFromHash()) { showPage('log'); return; }
    const p = pageFromHash();
    if (p) showPage(p);
  });
  // Keep the Energy tab's "check due" dot current while the app stays open.
  setInterval(updateEnergyDueDot, 5 * 60000);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    updateEnergyDueDot();
    maybePromptMorningCheckin();
  });

  if (importCalendarFromHash()) showPage('log');
  else showPage(pageFromHash() || 'today');
  maybePromptMorningCheckin();
}

// ═══════════════════════════════════════════════════════
// ONBOARDING (new users)
// ═══════════════════════════════════════════════════════

let _onboardSel = new Set();

function renderOnboarding() {
  _onboardSel = new Set(STARTER_QUICK);
  const overlay = document.createElement('div');
  overlay.className = 'onboarding';
  overlay.id = 'onboarding';
  overlay.innerHTML = `
    <div class="onboard-inner">
      <div class="onboard-hero">
        <div class="onboard-emoji">🥄</div>
        <h1>Welcome to Spoon Tracker</h1>
        <p>Track your daily energy in "spoons," pace yourself, and spot the patterns that wear you down. Everything stays private on this device.</p>
      </div>
      <div class="onboard-card">
        <label class="form-label">What should we call you?</label>
        <input type="text" id="onboard-name" placeholder="Your name" maxlength="40" autocomplete="off" />
      </div>
      <div class="onboard-card">
        <div class="form-label" style="display:flex;justify-content:space-between;align-items:center">
          <span>Pick your favorites</span>
          <span id="onboard-count" style="font-weight:400;color:var(--text-muted)"></span>
        </div>
        <p style="font-size:13px;color:var(--text-muted);margin:4px 0 10px">The activities you do most — pinned to the top of your Log tab. Choose up to 9; you can change these anytime.</p>
        <div class="quick-picker-grid" id="onboard-grid"></div>
      </div>
      <button class="btn btn-primary" id="onboard-start">Start tracking →</button>
    </div>`;
  document.body.appendChild(overlay);

  drawOnboardGrid();
  overlay.querySelector('#onboard-start').addEventListener('click', () => {
    const name = overlay.querySelector('#onboard-name').value.trim();
    if (!name) { overlay.querySelector('#onboard-name').focus(); flash('Please enter a name first'); return; }
    completeOnboarding(name, [..._onboardSel]);
  });
}

function drawOnboardGrid() {
  const grid = el('onboard-grid');
  const countEl = el('onboard-count');
  if (!grid) return;
  countEl.textContent = `${_onboardSel.size}/9`;
  grid.innerHTML = '';
  // Only universal activities are offered to new users.
  getAllActivities().filter(a => !a.id.startsWith('custom_')).forEach(act => {
    const sel = _onboardSel.has(act.id);
    const btn = document.createElement('button');
    btn.className = 'quick-pick-btn' + (sel ? ' selected' : '');
    btn.innerHTML = `<span class="qp-emoji">${act.emoji}</span><span class="qp-name">${act.name}</span><span class="qp-check">${sel ? '✓' : ''}</span>`;
    btn.addEventListener('click', () => {
      if (_onboardSel.has(act.id)) _onboardSel.delete(act.id);
      else {
        if (_onboardSel.size >= 9) { flash('Max 9 — remove one first'); return; }
        _onboardSel.add(act.id);
      }
      drawOnboardGrid();
    });
    grid.appendChild(btn);
  });
}

function completeOnboarding(name, quickIds) {
  saveProfile({ id: 'p_' + Date.now(), name, owner: false, createdAt: new Date().toISOString() });
  const s = getSettings();
  s.quickIds = quickIds.slice(0, 9);
  s.quickMigratedTo9 = true; // they chose their own; don't auto-top-up
  saveSettings(s);
  const ob = el('onboarding'); if (ob) ob.remove();
  flash(`Welcome, ${name}! 🥄`);
  startApp();
}

// ═══════════════════════════════════════════════════════
// PROFILE + BACKUP
// ═══════════════════════════════════════════════════════

function renameProfile() {
  const p = getProfile();
  const name = prompt('Your name:', p?.name || '');
  if (name === null) return;
  const trimmed = name.trim();
  if (!trimmed) return;
  saveProfile({ ...p, name: trimmed });
  flash('Name updated');
  renderSettings();
  if (window._currentPage === 'today') renderToday();
}

function startOver() {
  if (!confirm('Start over? This permanently erases your profile and ALL data on this device, then returns to the welcome screen. This cannot be undone.')) return;
  if (!confirm('Are you sure? Everything on this device will be gone.')) return;
  localStorage.removeItem(KEYS.PROFILE);
  DATA_KEYS.forEach(k => localStorage.removeItem(k));
  window.location.reload();
}

function exportBackup() {
  const dump = { app: 'spoon-tracker', version: APP_VERSION, exportedAt: new Date().toISOString(), keys: {} };
  [KEYS.PROFILE, ...DATA_KEYS].forEach(k => {
    const v = localStorage.getItem(k);
    if (v !== null) dump.keys[k] = v;
  });
  const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = (profileName() || 'me').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  a.download = `spoon-tracker-backup-${safeName}-${today()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  flash('Backup downloaded');
}

function importBackup(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    let dump;
    try { dump = JSON.parse(reader.result); } catch { alert('That file is not a valid backup.'); return; }
    if (!dump || dump.app !== 'spoon-tracker' || !dump.keys) { alert('That does not look like a Spoon Tracker backup.'); return; }
    if (!confirm('Restore this backup? It will REPLACE all data currently on this device.')) { e.target.value = ''; return; }
    [KEYS.PROFILE, ...DATA_KEYS].forEach(k => localStorage.removeItem(k));
    Object.entries(dump.keys).forEach(([k, v]) => localStorage.setItem(k, v));
    flash('Backup restored');
    window.location.reload();
  };
  reader.readAsText(file);
  e.target.value = '';
}

document.addEventListener('DOMContentLoaded', init);
