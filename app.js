'use strict';

// ═══════════════════════════════════════════════════════
// CONSTANTS & DEFAULTS
// ═══════════════════════════════════════════════════════

const KEYS = {
  ACTIVITIES: 'cmt_activities',
  CHECKINS:   'cmt_checkins',
  SYMPTOMS:   'cmt_symptoms',
  SETTINGS:   'cmt_settings',
  CUSTOM_ACT: 'cmt_custom',
};

const DEFAULT_ACTIVITIES = [
  { id: 'pt',          name: 'PT Session',            emoji: '🏥', spoons: 4,  category: 'medical',   recovery: false },
  { id: 'cmt_class',   name: 'CMT Exercise Class',    emoji: '💪', spoons: 3,  category: 'exercise',  recovery: false },
  { id: 'doctor',      name: 'Doctor Appointment',    emoji: '👨‍⚕️', spoons: 2,  category: 'medical',   recovery: false },
  { id: 'grocery',     name: 'Grocery Shopping',      emoji: '🛒', spoons: 2,  category: 'errand',    recovery: false },
  { id: 'cooking',     name: 'Cooking Meal',          emoji: '🍳', spoons: 1,  category: 'household', recovery: false },
  { id: 'driving',     name: 'Driving',               emoji: '🚗', spoons: 1,  category: 'errand',    recovery: false },
  { id: 'social',      name: 'Social Outing',         emoji: '👥', spoons: 2,  category: 'social',    recovery: false },
  { id: 'chores_lt',   name: 'Light Chores',          emoji: '🧹', spoons: 1,  category: 'household', recovery: false },
  { id: 'chores_hv',   name: 'Heavy Chores',          emoji: '🏠', spoons: 2,  category: 'household', recovery: false },
  { id: 'dog_walk',    name: 'Walking Dog',           emoji: '🐕', spoons: 1,  category: 'exercise',  recovery: false },
  { id: 'tv_rest',     name: 'Watching TV / Resting', emoji: '📺', spoons: 0,  category: 'rest',      recovery: false },
  { id: 'yoga',        name: 'Yoga',                  emoji: '🧘', spoons: 2,  category: 'exercise',  recovery: false },
  { id: 'gym',         name: 'Gym',                   emoji: '🏋️', spoons: 3,  category: 'exercise',  recovery: false },
  { id: 'journaling',  name: 'Journaling',            emoji: '✍️', spoons: 0,  category: 'rest',      recovery: false },
  { id: 'meditation',  name: 'Meditation',            emoji: '🧘‍♀️', spoons: -1, category: 'recovery',  recovery: true  },
  { id: 'nap',         name: 'Nap',                   emoji: '😴', spoons: -1, category: 'recovery',  recovery: true  },
  { id: 'sleep',       name: 'Full Night Sleep',      emoji: '🌙', spoons: -5, category: 'recovery',  recovery: true  },
];

// Zone definitions
const ZONES = [
  { id: 'genius',       label: 'Genius',       fullLabel: 'Zone of Genius',       emoji: '🟢', color: '#16a34a', bg: '#dcfce7', costNote: '½ cost'    },
  { id: 'excellence',   label: 'Excellence',   fullLabel: 'Zone of Excellence',   emoji: '🟠', color: '#ea580c', bg: '#ffedd5', costNote: '+0.5'      },
  { id: 'maintenance',  label: 'Maintenance',  fullLabel: 'Maintenance',          emoji: '🔵', color: '#2563eb', bg: '#dbeafe', costNote: 'protected' },
  { id: 'competence',   label: 'Competence',   fullLabel: 'Zone of Competence',   emoji: '⚪', color: '#64748b', bg: '#f1f5f9', costNote: 'full cost' },
  { id: 'incompetence', label: 'Incompetence', fullLabel: 'Zone of Incompetence', emoji: '🔴', color: '#dc2626', bg: '#fee2e2', costNote: 'flag it'   },
];

// Default zone per preset activity
const DEFAULT_ZONES = {
  pt: 'maintenance', cmt_class: 'maintenance', doctor: 'maintenance',
  grocery: 'competence', cooking: 'competence', driving: 'competence',
  social: 'competence', chores_lt: 'competence', chores_hv: 'competence',
  dog_walk: 'competence', tv_rest: 'competence',
  yoga: 'maintenance', gym: 'competence',
  meditation: 'genius', journaling: 'genius',
  nap: 'maintenance', sleep: 'maintenance',
};

// Energy direction options
const ENERGY_DIRS = [
  { id: 'gave',    label: '+', title: 'Gave energy',  color: '#16a34a' },
  { id: 'neutral', label: '0', title: 'Neutral',       color: '#64748b' },
  { id: 'drained', label: '−', title: 'Drained',       color: '#dc2626' },
];

const QUICK_IDS = ['pt', 'cmt_class', 'yoga', 'meditation', 'nap'];

const DEFAULT_SETTINGS = {
  baseBudget: 10,
  quickIds: QUICK_IDS,
  enableAfterSixModifier: true,
  enableStackingPenalty: true,
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
  const custom = getCustomActivities();
  const settings = getSettings();
  const presets = DEFAULT_ACTIVITIES.map(a => {
    const override = settings.spoonOverrides?.[a.id];
    return override !== undefined ? { ...a, spoons: override } : a;
  });
  return [...presets, ...custom];
}

function getActivitiesForDate(ds) { return (load(KEYS.ACTIVITIES) || {})[ds] || []; }

function saveActivityForDate(ds, entry) {
  const all = load(KEYS.ACTIVITIES) || {};
  if (!all[ds]) all[ds] = [];
  all[ds].push(entry);
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
  all[ds] = { ...data, date: ds };
  save(KEYS.CHECKINS, all);
}
function getSymptoms(ds) { return (load(KEYS.SYMPTOMS) || {})[ds] || null; }
function saveSymptoms(ds, data) {
  const all = load(KEYS.SYMPTOMS) || {};
  all[ds] = { ...data, date: ds };
  save(KEYS.SYMPTOMS, all);
}

// ═══════════════════════════════════════════════════════
// DATE UTILITIES
// ═══════════════════════════════════════════════════════

function today() { return new Date().toISOString().slice(0, 10); }
function dateStr(d) { return d.toISOString().slice(0, 10); }
function fmtDate(str) {
  return new Date(str + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}
function last7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); return dateStr(d);
  });
}
function last30Days() {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i)); return dateStr(d);
  });
}

// ═══════════════════════════════════════════════════════
// ZONE HELPERS
// ═══════════════════════════════════════════════════════

function getZone(zoneId) { return ZONES.find(z => z.id === zoneId) || null; }

function getActivityDefaultZone(actId) {
  // Check custom activity zone overrides in settings
  const settings = getSettings();
  if (settings.zoneDefaults?.[actId]) return settings.zoneDefaults[actId];
  return DEFAULT_ZONES[actId] || null;
}

function zoneDot(zoneId) {
  const z = getZone(zoneId);
  if (!z) return '';
  return `<span class="zone-dot" style="background:${z.color}" title="${z.fullLabel}"></span>`;
}

function zoneBadge(zoneId) {
  const z = getZone(zoneId);
  if (!z) return '';
  return `<span class="zone-badge" style="background:${z.bg};color:${z.color}">${z.emoji} ${z.label}</span>`;
}

// ═══════════════════════════════════════════════════════
// SPOON ENGINE
// ═══════════════════════════════════════════════════════

function calcDailyBudget(checkin) {
  const base = (getSettings().baseBudget) || 10;
  if (!checkin) return base;
  const { energy = 5, brainFog = false, muscleWeak = false, cpapHours = 0 } = checkin;
  if (energy >= 8 && !brainFog && !muscleWeak && cpapHours >= 6) return base + 2;
  if (energy <= 5 && (brainFog || muscleWeak)) return Math.max(4, base - 4);
  return base;
}

function isAfterSix(isoTimestamp) { return new Date(isoTimestamp).getHours() >= 18; }

function calcEntryEffectiveCost(entry, allEntries, settings) {
  if (entry.isRecovery || entry.baseCost <= 0) return entry.baseCost;
  let cost = entry.baseCost;

  // Zone modifier
  const zone = entry.zone;
  if (zone === 'genius') {
    cost = Math.round((cost * 0.5) * 2) / 2; // round to nearest 0.5
  } else if (zone === 'excellence') {
    cost += 0.5;
  }
  // maintenance / competence / incompetence = full cost

  // After-6pm modifier
  if (settings.enableAfterSixModifier && isAfterSix(entry.timestamp)) {
    cost += 0.5;
  }

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
  const checkin = getCheckin(ds);
  const budget = calcDailyBudget(checkin);
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
// ZONE AUDIT CALCULATIONS
// ═══════════════════════════════════════════════════════

function calcZoneAudit(days) {
  const totals = {};
  ZONES.forEach(z => { totals[z.id] = 0; });
  let grandTotal = 0;
  const dirCounts = { gave: 0, neutral: 0, drained: 0, unset: 0 };

  days.forEach(d => {
    getActivitiesForDate(d).forEach(e => {
      if (!e.isRecovery && e.baseCost > 0) {
        const cost = e.effectiveCost != null ? e.effectiveCost : e.baseCost;
        const zone = e.zone || 'competence';
        totals[zone] = (totals[zone] || 0) + cost;
        grandTotal += cost;
      }
      if (e.energyDir) dirCounts[e.energyDir] = (dirCounts[e.energyDir] || 0) + 1;
      else dirCounts.unset++;
    });
  });

  return { totals, grandTotal, dirCounts };
}

function calcZoneAuditPrevWeek() {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (14 - i)); return dateStr(d);
  });
  return calcZoneAudit(days);
}

// ═══════════════════════════════════════════════════════
// PATTERN DETECTION & ALERTS
// ═══════════════════════════════════════════════════════

function detectPatterns() {
  const days = last30Days();
  const warnings = [];
  days.forEach((d, i) => {
    if (i === 0) return;
    const sym = getSymptoms(d);
    if (sym?.nextDayFatigue >= 4) {
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
  // Incompetence flag
  const hasIncomp = entries.some(e => e.zone === 'incompetence');
  if (hasIncomp) {
    alerts.push({ type: 'yellow', icon: '🔴', text: "Could someone else do this? You logged an Incompetence-zone activity today." });
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
    case 'zones':    renderZones();    break;
    case 'settings': renderSettings(); break;
  }
}

// ═══════════════════════════════════════════════════════
// TODAY PAGE
// ═══════════════════════════════════════════════════════

function renderToday() {
  const d = today();
  el('today-date').textContent = fmtDate(d);
  const { budget, used, recovered, remaining } = calcSpoonsRemaining(d);
  const cls = spoonColorClass(remaining);

  el('spoon-count').textContent = remaining;
  el('spoon-count').className = 'spoon-count ' + cls;
  const pct = Math.max(0, Math.min(100, (remaining / budget) * 100));
  el('spoon-bar').style.width = pct + '%';
  el('spoon-bar').className = 'progress-bar-fill ' + cls;
  el('spoon-used').textContent = used;
  el('spoon-budget').textContent = budget;
  if (recovered > 0) {
    el('spoon-recovered').textContent = '+' + recovered + ' recovered';
    el('spoon-recovered').hidden = false;
  } else { el('spoon-recovered').hidden = true; }

  const checkin = getCheckin(d);
  const diff = budget - (getSettings().baseBudget || 10);
  el('budget-source').textContent = checkin
    ? diff > 0 ? `Morning check-in: +${diff} spoons (feeling good!)`
    : diff < 0 ? `Morning check-in: ${diff} spoons (take it easy today)`
    : `Morning check-in complete · Budget: ${budget} spoons`
    : `Base budget: ${budget} spoons`;

  el('morning-prompt').hidden = !!checkin;

  // Alerts
  const alertsDiv = el('today-alerts');
  alertsDiv.innerHTML = '';
  getTodayAlerts().forEach(a => {
    const div = document.createElement('div');
    div.className = `alert ${a.type}`;
    div.innerHTML = `<span class="alert-icon">${a.icon}</span><span class="alert-text">${a.text}</span>`;
    alertsDiv.appendChild(div);
  });

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
    const zId = getActivityDefaultZone(act.id);
    const z = getZone(zId);
    btn.innerHTML = `<span class="act-emoji">${act.emoji}</span><span class="act-name">${act.name}</span><span class="act-spoons">${costLabel}</span>${z ? `<span class="quick-zone-dot" style="background:${z.color}"></span>` : ''}`;
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

function makeActivityItem(entry, ds) {
  const div = document.createElement('div');
  div.className = 'activity-item';
  const isRecov = entry.isRecovery || entry.baseCost < 0;
  const costDisplay = isRecov
    ? `+${Math.abs(entry.baseCost)}`
    : entry.baseCost === 0 ? '—'
    : `-${entry.effectiveCost != null ? entry.effectiveCost : entry.baseCost}`;
  const costClass = isRecov ? 'positive' : entry.baseCost === 0 ? 'zero' : 'negative';
  const z = entry.zone ? getZone(entry.zone) : null;
  const dirEl = entry.energyDir
    ? `<span class="energy-dir-badge ${entry.energyDir}" title="${ENERGY_DIRS.find(d=>d.id===entry.energyDir)?.title}">${ENERGY_DIRS.find(d=>d.id===entry.energyDir)?.label}</span>`
    : '';

  div.innerHTML = `
    <span class="act-icon">${entry.emoji}</span>
    <div class="act-info">
      <div class="name">${entry.name}${z ? `<span class="zone-dot" style="background:${z.color}" title="${z.fullLabel}"></span>` : ''}</div>
      <div class="time">${fmtTime(entry.timestamp)}</div>
      ${entry.note ? `<div class="note">"${entry.note}"</div>` : ''}
      ${entry.zone === 'incompetence' ? `<div class="incomp-flag">🔴 Could someone else do this?</div>` : ''}
    </div>
    <div class="act-right">
      ${dirEl}
      <span class="act-cost ${costClass}">${costDisplay}</span>
    </div>
    <button class="act-delete" title="Delete" data-id="${entry.id}">✕</button>
  `;
  div.querySelector('.act-delete').addEventListener('click', () => {
    deleteActivityForDate(ds, entry.id);
    renderPage(window._currentPage);
  });
  return div;
}

function quickLog(act) {
  const d = today();
  const entries = getActivitiesForDate(d);
  const settings = getSettings();
  const defaultZone = getActivityDefaultZone(act.id);
  const entry = {
    id: Date.now().toString(),
    activityId: act.id,
    name: act.name,
    emoji: act.emoji,
    baseCost: act.spoons,
    isRecovery: act.recovery || act.spoons < 0,
    timestamp: new Date().toISOString(),
    note: '',
    zone: defaultZone,
    energyDir: null,
  };
  entry.effectiveCost = calcEntryEffectiveCost(entry, entries, settings);
  saveActivityForDate(d, entry);
  const costMsg = entry.isRecovery ? `+${Math.abs(act.spoons)} recovery` : `${entry.effectiveCost} spoon${entry.effectiveCost === 1 ? '' : 's'}`;
  flash(`${act.emoji} ${act.name} (${costMsg})`);
  renderPage('today');
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
        <div class="scale-row" id="ci-energy">
          ${[1,2,3,4,5,6,7,8,9,10].map(n=>`<button class="scale-btn" data-val="${n}">${n}</button>`).join('')}
        </div>
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
          <div class="scale-row" id="ci-sq">
            ${[1,2,3,4,5].map(n=>`<button class="scale-btn" data-val="${n}">${n}</button>`).join('')}
          </div>
        </div>
      </div>
      <div class="row">
        <div class="form-group">
          <label class="form-label">Sleep Hours</label>
          <input type="number" id="ci-hours" min="0" max="12" step="0.5" placeholder="hrs" />
        </div>
        <div class="form-group">
          <label class="form-label">Naps <span class="hint">(#)</span></label>
          <input type="number" id="ci-naps" min="0" max="10" placeholder="0" />
        </div>
      </div>
      <button class="btn btn-primary" id="ci-save" style="margin-top:8px">Save Check-In</button>
      <button class="btn btn-secondary" id="ci-cancel" style="margin-top:8px">Cancel</button>
    </div>`;

  overlay.querySelectorAll('.scale-row').forEach(row => {
    row.querySelectorAll('.scale-btn').forEach(btn => btn.addEventListener('click', () => {
      row.querySelectorAll('.scale-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    }));
  });
  overlay.querySelectorAll('.toggle-row').forEach(row => {
    row.querySelectorAll('.toggle-btn').forEach(btn => btn.addEventListener('click', () => {
      row.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    }));
  });
  overlay.querySelector('#ci-save').addEventListener('click', () => {
    const energy = parseInt(overlay.querySelector('#ci-energy .selected')?.dataset.val || '5');
    const brainFog = overlay.querySelector('#ci-fog .selected')?.dataset.val === 'true';
    const muscleWeak = overlay.querySelector('#ci-weak .selected')?.dataset.val === 'true';
    const cpapHours = parseFloat(overlay.querySelector('#ci-cpap').value || '0');
    const trazodone = overlay.querySelector('#ci-traz .selected')?.dataset.val === 'true';
    const sleepQuality = parseInt(overlay.querySelector('#ci-sq .selected')?.dataset.val || '3');
    const sleepHours = parseFloat(overlay.querySelector('#ci-hours').value || '0');
    const napCount = parseInt(overlay.querySelector('#ci-naps').value || '0');
    saveCheckin(today(), { energy, brainFog, muscleWeak, cpapHours, trazodone, sleepQuality, sleepHours, napCount });
    overlay.remove();
    flash('Morning check-in saved!');
    renderPage('today');
  });
  overlay.querySelector('#ci-cancel').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

// ═══════════════════════════════════════════════════════
// LOG PAGE
// ═══════════════════════════════════════════════════════

let _selectedActId = null;
let _isCustom = false;
let _selectedZone = null;
let _selectedDir = null;

function renderLog() {
  _selectedActId = null;
  _isCustom = false;
  _selectedZone = null;
  _selectedDir = null;

  const allActs = getAllActivities();
  const grid = el('log-activity-grid');
  grid.innerHTML = '';

  allActs.forEach(act => {
    const btn = document.createElement('button');
    btn.className = 'activity-select-btn';
    btn.dataset.id = act.id;
    const costLabel = act.spoons < 0 ? `+${Math.abs(act.spoons)} recovery`
      : act.spoons === 0 ? 'free'
      : `${act.spoons} spoon${act.spoons === 1 ? '' : 's'}`;
    const zId = getActivityDefaultZone(act.id);
    const z = getZone(zId);
    btn.innerHTML = `<span class="emoji">${act.emoji}</span><div class="info"><div class="n">${act.name}${z ? `<span class="zone-dot" style="background:${z.color};margin-left:4px"></span>` : ''}</div><div class="s">${costLabel}</div></div>`;
    btn.addEventListener('click', () => {
      grid.querySelectorAll('.activity-select-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      _selectedActId = act.id;
      _isCustom = false;
      el('log-custom-section').hidden = true;
      // Pre-select default zone
      const defZone = getActivityDefaultZone(act.id);
      if (defZone) selectZoneBtn(defZone);
    });
    grid.appendChild(btn);
  });

  el('log-custom-toggle').onclick = () => {
    grid.querySelectorAll('.activity-select-btn').forEach(b => b.classList.remove('selected'));
    _selectedActId = null;
    _isCustom = true;
    el('log-custom-section').hidden = false;
    selectZoneBtn(null);
  };

  // Zone picker
  const zonePicker = el('log-zone-picker');
  zonePicker.innerHTML = '';
  ZONES.forEach(z => {
    const btn = document.createElement('button');
    btn.className = 'zone-pick-btn';
    btn.dataset.zone = z.id;
    btn.innerHTML = `<span>${z.emoji}</span><span class="zpb-label">${z.label}</span>`;
    btn.title = `${z.fullLabel} — ${z.costNote}`;
    btn.style.setProperty('--zone-color', z.color);
    btn.style.setProperty('--zone-bg', z.bg);
    btn.addEventListener('click', () => selectZoneBtn(z.id));
    zonePicker.appendChild(btn);
  });

  // Energy direction picker
  const dirPicker = el('log-dir-picker');
  dirPicker.innerHTML = '';
  ENERGY_DIRS.forEach(dir => {
    const btn = document.createElement('button');
    btn.className = 'dir-pick-btn';
    btn.dataset.dir = dir.id;
    btn.innerHTML = `<span class="dir-label">${dir.label}</span><span class="dir-title">${dir.title}</span>`;
    btn.style.setProperty('--dir-color', dir.color);
    btn.addEventListener('click', () => {
      dirPicker.querySelectorAll('.dir-pick-btn').forEach(b => b.classList.remove('selected'));
      if (_selectedDir === dir.id) { _selectedDir = null; }
      else { btn.classList.add('selected'); _selectedDir = dir.id; }
    });
    dirPicker.appendChild(btn);
  });

  const now = new Date(); now.setSeconds(0, 0);
  el('log-timestamp').value = now.toISOString().slice(0, 16);
}

function selectZoneBtn(zoneId) {
  _selectedZone = zoneId;
  document.querySelectorAll('#log-zone-picker .zone-pick-btn').forEach(b => {
    b.classList.toggle('selected', b.dataset.zone === zoneId);
  });
}

function submitLog() {
  const d = today();
  const settings = getSettings();
  const timestamp = el('log-timestamp').value
    ? new Date(el('log-timestamp').value).toISOString()
    : new Date().toISOString();
  const note = el('log-note').value.trim();

  let act;
  if (_isCustom) {
    const name = el('custom-name').value.trim();
    const spoons = parseFloat(el('custom-spoons').value);
    const emoji = el('custom-emoji').value.trim() || '⚡';
    if (!name || isNaN(spoons)) { alert('Please enter a name and spoon cost.'); return; }
    act = { id: 'custom_' + Date.now(), name, spoons, emoji, recovery: spoons < 0 };
  } else if (_selectedActId) {
    act = getAllActivities().find(a => a.id === _selectedActId);
    if (!act) { alert('Please select an activity.'); return; }
  } else { alert('Please select an activity.'); return; }

  const entries = getActivitiesForDate(d);
  const entry = {
    id: Date.now().toString(),
    activityId: act.id,
    name: act.name,
    emoji: act.emoji,
    baseCost: act.spoons,
    isRecovery: act.recovery || act.spoons < 0,
    timestamp,
    note,
    zone: _selectedZone || getActivityDefaultZone(act.id) || null,
    energyDir: _selectedDir,
  };
  entry.effectiveCost = calcEntryEffectiveCost(entry, entries, settings);
  saveActivityForDate(d, entry);

  el('log-note').value = '';
  if (el('custom-name')) el('custom-name').value = '';
  if (el('custom-spoons')) el('custom-spoons').value = '';
  el('log-custom-section').hidden = true;
  renderLog();

  const costMsg = entry.isRecovery ? `+${Math.abs(act.spoons)} spoons restored` : `${entry.effectiveCost} spoon${entry.effectiveCost === 1 ? '' : 's'}`;
  flash(`${act.emoji} ${act.name} logged (${costMsg})`);
  showPage('today');
}

// ═══════════════════════════════════════════════════════
// SYMPTOM MODAL
// ═══════════════════════════════════════════════════════

function openSymptomModal(ds) {
  const existing = getSymptoms(ds || today()) || {};
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-handle"></div>
      <div class="modal-title">📊 Log Symptoms</div>
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px">For: ${fmtDate(ds || today())}</p>
      <div class="form-group">
        <label class="form-label">Brain Fog?</label>
        <div class="toggle-row" id="sym-fog">
          <button class="toggle-btn yes${existing.brainFog ? ' selected' : ''}" data-val="true">Yes</button>
          <button class="toggle-btn no${existing.brainFog === false ? ' selected' : ''}" data-val="false">No</button>
        </div>
      </div>
      <div class="form-group" id="sym-fog-sev-wrap" style="${existing.brainFog ? '' : 'display:none'}">
        <label class="form-label">Brain Fog Severity <span class="hint">(1-5)</span></label>
        <div class="scale-row" id="sym-fog-sev">
          ${[1,2,3,4,5].map(n=>`<button class="scale-btn${existing.brainFogSev===n?' selected':''}" data-val="${n}">${n}</button>`).join('')}
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Falls / Balance Issues?</label>
        <div class="toggle-row" id="sym-falls">
          <button class="toggle-btn yes${existing.falls ? ' selected' : ''}" data-val="true">Yes</button>
          <button class="toggle-btn no${existing.falls === false ? ' selected' : ''}" data-val="false">No</button>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Muscle Weakness Severity <span class="hint">(1-5)</span></label>
        <div class="scale-row" id="sym-weak">
          ${[1,2,3,4,5].map(n=>`<button class="scale-btn${existing.muscleWeakSev===n?' selected':''}" data-val="${n}">${n}</button>`).join('')}
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Next-Day Fatigue <span class="hint">(how did yesterday leave you?)</span></label>
        <div class="scale-row" id="sym-fatigue">
          ${[1,2,3,4,5].map(n=>`<button class="scale-btn${existing.nextDayFatigue===n?' selected':''}" data-val="${n}">${n}</button>`).join('')}
        </div>
      </div>
      <button class="btn btn-primary" id="sym-save" style="margin-top:8px">Save Symptoms</button>
      <button class="btn btn-secondary" id="sym-cancel" style="margin-top:8px">Cancel</button>
    </div>`;

  overlay.querySelectorAll('.scale-row').forEach(row => {
    row.querySelectorAll('.scale-btn').forEach(btn => btn.addEventListener('click', () => {
      row.querySelectorAll('.scale-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    }));
  });
  overlay.querySelectorAll('.toggle-row').forEach(row => {
    row.querySelectorAll('.toggle-btn').forEach(btn => btn.addEventListener('click', () => {
      row.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      if (row.id === 'sym-fog') overlay.querySelector('#sym-fog-sev-wrap').style.display = btn.dataset.val === 'true' ? '' : 'none';
    }));
  });
  overlay.querySelector('#sym-save').addEventListener('click', () => {
    const brainFog = overlay.querySelector('#sym-fog .selected')?.dataset.val === 'true';
    const brainFogSev = parseInt(overlay.querySelector('#sym-fog-sev .selected')?.dataset.val || '0');
    const falls = overlay.querySelector('#sym-falls .selected')?.dataset.val === 'true';
    const muscleWeakSev = parseInt(overlay.querySelector('#sym-weak .selected')?.dataset.val || '0');
    const nextDayFatigue = parseInt(overlay.querySelector('#sym-fatigue .selected')?.dataset.val || '0');
    saveSymptoms(ds || today(), { brainFog, brainFogSev, falls, muscleWeakSev, nextDayFatigue });
    overlay.remove();
    flash('Symptoms saved');
    if (['history','today'].includes(window._currentPage)) renderPage(window._currentPage);
  });
  overlay.querySelector('#sym-cancel').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

// ═══════════════════════════════════════════════════════
// HISTORY PAGE
// ═══════════════════════════════════════════════════════

function renderHistory() {
  const days = last7Days().reverse();
  const container = el('history-list');
  container.innerHTML = '';

  days.forEach(d => {
    const entries = getActivitiesForDate(d);
    const checkin = getCheckin(d);
    const symptoms = getSymptoms(d);
    const { budget, used, remaining } = calcSpoonsRemaining(d);
    const isToday = d === today();
    const cls = spoonColorClass(remaining);

    const dayDiv = document.createElement('div');
    dayDiv.className = 'history-day';

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
      entries.forEach(e => {
        const isRecov = e.isRecovery || e.baseCost < 0;
        const cost = isRecov ? `+${Math.abs(e.baseCost)}` : e.baseCost === 0 ? 'free' : `-${e.effectiveCost != null ? e.effectiveCost : e.baseCost}`;
        const z = e.zone ? getZone(e.zone) : null;
        const dir = e.energyDir ? ENERGY_DIRS.find(x=>x.id===e.energyDir) : null;
        html += `<div class="activity-item">
          <span class="act-icon">${e.emoji}</span>
          <div class="act-info">
            <div class="name">${e.name}${z ? `<span class="zone-dot" style="background:${z.color}"></span>` : ''}</div>
            <div class="time">${fmtTime(e.timestamp)}</div>
            ${e.note ? `<div class="note">"${e.note}"</div>` : ''}
          </div>
          <div class="act-right">
            ${dir ? `<span class="energy-dir-badge ${dir.id}">${dir.label}</span>` : ''}
            <span class="act-cost ${isRecov ? 'positive' : e.baseCost === 0 ? 'zero' : 'negative'}">${cost}</span>
          </div>
        </div>`;
      });
    } else {
      html += `<p style="font-size:13px;color:var(--text-muted);padding:8px 0">No activities logged</p>`;
    }

    html += `<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em">Symptoms</span>
        <button class="btn btn-secondary btn-sm" onclick="openSymptomModal('${d}')">Log</button>
      </div>`;
    if (symptoms) {
      html += `<div class="symptom-chips">`;
      if (symptoms.brainFog) html += `<span class="chip yellow">🌫 Brain fog${symptoms.brainFogSev ? ' '+symptoms.brainFogSev+'/5' : ''}</span>`;
      if (symptoms.falls) html += `<span class="chip red">⚠️ Falls</span>`;
      if (symptoms.muscleWeakSev > 0) html += `<span class="chip yellow">💪 Weakness ${symptoms.muscleWeakSev}/5</span>`;
      if (symptoms.nextDayFatigue > 0) html += `<span class="chip ${symptoms.nextDayFatigue >= 4 ? 'red' : 'yellow'}">😴 Fatigue ${symptoms.nextDayFatigue}/5</span>`;
      html += `</div>`;
    } else { html += `<p style="font-size:13px;color:var(--text-muted)">None logged</p>`; }
    html += `</div>`;

    if (checkin) {
      html += `<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
        <div style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Morning Check-In</div>
        <div class="tag-row">
          ${checkin.energy ? `<span class="tag">⚡ Energy ${checkin.energy}/10</span>` : ''}
          ${checkin.sleepHours ? `<span class="tag">💤 ${checkin.sleepHours}h sleep</span>` : ''}
          ${checkin.cpapHours ? `<span class="tag">😷 CPAP ${checkin.cpapHours}h</span>` : ''}
          ${checkin.trazodone ? `<span class="tag">💊 Trazodone</span>` : ''}
        </div>
      </div>`;
    }

    body.innerHTML = html;
    header.addEventListener('click', () => {
      body.classList.toggle('open');
      header.querySelector('.expand-icon').textContent = body.classList.contains('open') ? '∨' : '›';
    });

    dayDiv.appendChild(header);
    dayDiv.appendChild(body);
    container.appendChild(dayDiv);

    if (isToday) { body.classList.add('open'); header.querySelector('.expand-icon').textContent = '∨'; }
  });
}

// ═══════════════════════════════════════════════════════
// WEEKLY PAGE
// ═══════════════════════════════════════════════════════

let _charts = {};

function renderWeekly() {
  const days = last7Days();
  const labels = days.map(d => fmtDate(d).split(',')[0]);
  const settings = getSettings();

  const usedData = days.map(d => calcSpoonsUsed(getActivitiesForDate(d), settings));
  const budgetData = days.map(d => calcDailyBudget(getCheckin(d)));
  const energyData = days.map(d => getCheckin(d)?.energy ?? null);
  const fatigueData = days.map(d => getSymptoms(d)?.nextDayFatigue ?? null);
  const sleepData = days.map(d => getCheckin(d)?.sleepHours ?? null);

  if (typeof Chart === 'undefined') return;

  renderChart('chart-spoons', 'bar', labels, [
    { label: 'Spoons Used', data: usedData, backgroundColor: '#6366f1cc', borderColor: '#6366f1', borderWidth: 2, borderRadius: 6 },
    { label: 'Daily Budget', data: budgetData, type: 'line', borderColor: '#16a34a', borderWidth: 2, pointRadius: 3, fill: false, tension: 0.4, borderDash: [4,4] },
  ], { y: { beginAtZero: true, max: 16 } });

  renderChart('chart-energy', 'line', labels, [
    { label: 'Morning Energy', data: energyData, borderColor: '#f59e0b', backgroundColor: '#f59e0b22', fill: true, tension: 0.4, spanGaps: true },
    { label: 'Next-Day Fatigue', data: fatigueData, borderColor: '#ef4444', backgroundColor: '#ef444422', fill: true, tension: 0.4, spanGaps: true },
  ], { y: { beginAtZero: true, max: 10 } });

  renderChart('chart-sleep', 'bar', labels, [
    { label: 'Sleep Hours', data: sleepData, backgroundColor: '#8b5cf6cc', borderColor: '#8b5cf6', borderWidth: 2, borderRadius: 6, spanGaps: true },
  ], { y: { beginAtZero: true, max: 12 } });

  const totalUsed = usedData.reduce((a,b) => a+b, 0);
  el('weekly-total-used').textContent = totalUsed.toFixed(1);
  el('weekly-avg-used').textContent = (totalUsed / 7).toFixed(1);
  el('weekly-days-fatigue').textContent = fatigueData.filter(f => f >= 4).length;
  const validEnergy = energyData.filter(e => e !== null);
  el('weekly-avg-energy').textContent = validEnergy.length
    ? (validEnergy.reduce((a,b) => a+b, 0) / validEnergy.length).toFixed(1) : '—';

  const patterns = detectPatterns();
  const patternDiv = el('weekly-patterns');
  patternDiv.innerHTML = '';
  if (patterns.includes('pt+cmt_class')) {
    patternDiv.innerHTML = `<div class="pattern-warning"><div class="pw-title">⚠️ Pattern Detected</div><div class="pw-text">PT + CMT class on the same day has led to high next-day fatigue in the last 30 days. Consider spacing these activities.</div></div>`;
  } else {
    patternDiv.innerHTML = `<p style="font-size:13px;color:var(--text-muted)">No crash patterns detected yet. Keep logging to build your pattern library.</p>`;
  }
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
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: { grid: { color: '#e2e8f0' }, ticks: { font: { size: 11 } }, ...scales.y },
      },
    },
  });
}

// ═══════════════════════════════════════════════════════
// ZONES AUDIT PAGE
// ═══════════════════════════════════════════════════════

function renderZones() {
  const days = last7Days();
  const { totals, grandTotal, dirCounts } = calcZoneAudit(days);
  const prevAudit = calcZoneAuditPrevWeek();

  // Genius callout
  const geniusSpoons = totals.genius || 0;
  const prevGenius = prevAudit.totals.genius || 0;
  const genuisTrend = prevGenius > 0
    ? geniusSpoons > prevGenius ? `↑ +${(geniusSpoons - prevGenius).toFixed(1)} vs last week`
    : geniusSpoons < prevGenius ? `↓ ${(geniusSpoons - prevGenius).toFixed(1)} vs last week`
    : '→ Same as last week'
    : '';
  el('genius-callout').innerHTML = `
    <div class="genius-num">${geniusSpoons.toFixed(1)}</div>
    <div class="genius-label">spoons in Zone of Genius this week</div>
    ${genuisTrend ? `<div class="genius-trend">${genuisTrend}</div>` : ''}
    <div class="genius-sub">This is your target zone — where time disappears and energy flows.</div>`;

  // Leak warning
  const leakAlert = el('zone-leak-alert');
  const leakPct = grandTotal > 0
    ? Math.round(((totals.incompetence || 0) + (totals.competence || 0)) / grandTotal * 100) : 0;
  const maintPct = grandTotal > 0 ? Math.round((totals.maintenance || 0) / grandTotal * 100) : 0;

  leakAlert.innerHTML = '';
  if (grandTotal > 0) {
    const leakDiv = document.createElement('div');
    leakDiv.className = `alert ${leakPct > 20 ? 'yellow' : 'green'}`;
    leakDiv.innerHTML = leakPct > 20
      ? `<span class="alert-icon">⚠️</span><span class="alert-text"><strong>Leak zones: ${leakPct}%</strong> — above your 20% target. This is energy you need for your job search.</span>`
      : `<span class="alert-icon">✅</span><span class="alert-text"><strong>Leak zones: ${leakPct}%</strong> — within your 20% target. Your energy is well-allocated.</span>`;
    leakAlert.appendChild(leakDiv);

    const maintDiv = document.createElement('div');
    maintDiv.className = 'alert blue';
    maintDiv.innerHTML = `<span class="alert-icon">🔵</span><span class="alert-text"><strong>Maintenance (protected): ${maintPct}%</strong> — PT, medical, infrastructure. Not a leak.</span>`;
    leakAlert.appendChild(maintDiv);
  }

  // Zone breakdown bars
  const breakdown = el('zone-breakdown');
  breakdown.innerHTML = '';
  if (grandTotal === 0) {
    breakdown.innerHTML = `<p style="font-size:13px;color:var(--text-muted)">No activity data yet this week. Start logging to see your zone breakdown.</p>`;
  } else {
    ZONES.forEach(z => {
      const spoons = totals[z.id] || 0;
      const pct = grandTotal > 0 ? Math.round(spoons / grandTotal * 100) : 0;
      const row = document.createElement('div');
      row.className = 'zone-bar-row';
      row.innerHTML = `
        <div class="zb-header">
          <span class="zb-label">${z.emoji} ${z.fullLabel}</span>
          <span class="zb-stats">${spoons.toFixed(1)} spoons · ${pct}%</span>
        </div>
        <div class="zb-track">
          <div class="zb-fill" style="width:${pct}%;background:${z.color}"></div>
        </div>`;
      breakdown.appendChild(row);
    });
  }

  // Zone doughnut chart
  if (typeof Chart !== 'undefined' && grandTotal > 0) {
    const zoneData = ZONES.map(z => totals[z.id] || 0);
    const zoneColors = ZONES.map(z => z.color);
    if (_charts['chart-zones']) _charts['chart-zones'].destroy();
    _charts['chart-zones'] = new Chart(el('chart-zones'), {
      type: 'doughnut',
      data: {
        labels: ZONES.map(z => z.label),
        datasets: [{ data: zoneData, backgroundColor: zoneColors, borderWidth: 2, borderColor: '#fff' }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 12 } } },
        cutout: '60%',
      },
    });
    el('chart-zones-wrap').hidden = false;
  } else {
    el('chart-zones-wrap').hidden = true;
  }

  // Energy direction summary
  const dirDiv = el('zone-energy-dir');
  const totalLogged = dirCounts.gave + dirCounts.neutral + dirCounts.drained;
  if (totalLogged === 0) {
    dirDiv.innerHTML = `<p style="font-size:13px;color:var(--text-muted)">No energy direction data yet. Tag activities with +/0/− when logging.</p>`;
  } else {
    dirDiv.innerHTML = `
      <div class="dir-summary-row">
        <div class="dir-sum-item gave"><span class="dir-sum-num">${dirCounts.gave}</span><span class="dir-sum-label">+ gave energy</span></div>
        <div class="dir-sum-item neutral"><span class="dir-sum-num">${dirCounts.neutral}</span><span class="dir-sum-label">0 neutral</span></div>
        <div class="dir-sum-item drained"><span class="dir-sum-num">${dirCounts.drained}</span><span class="dir-sum-label">− drained</span></div>
      </div>`;
  }
}

// ═══════════════════════════════════════════════════════
// SETTINGS PAGE
// ═══════════════════════════════════════════════════════

function renderSettings() {
  const settings = getSettings();
  el('set-base-budget').value = settings.baseBudget || 10;
  el('set-after-six').checked = settings.enableAfterSixModifier !== false;
  el('set-stacking').checked = settings.enableStackingPenalty !== false;

  // Spoon overrides
  const allActs = getAllActivities();
  const tbody = el('spoon-overrides-body');
  tbody.innerHTML = '';
  allActs.filter(a => !a.id.startsWith('custom_')).forEach(act => {
    const currentCost = settings.spoonOverrides?.[act.id] ?? act.spoons;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="padding:8px 4px;font-size:14px">${act.emoji} ${act.name}</td>
      <td style="padding:8px 4px;text-align:center">
        <input type="number" class="spoon-override-input" data-id="${act.id}" value="${currentCost}"
          min="-5" max="10" step="0.5" style="width:65px;padding:6px;text-align:center;border:1.5px solid var(--border);border-radius:8px;font-size:14px" />
      </td>`;
    tbody.appendChild(tr);
  });

  // Quick log customizer
  renderQuickPicker();

  // Custom activities
  const customActs = getCustomActivities();
  const customList = el('custom-activities-list');
  customList.innerHTML = '';
  if (customActs.length === 0) {
    customList.innerHTML = `<p style="font-size:13px;color:var(--text-muted)">No custom activities yet.</p>`;
  } else {
    customActs.forEach(act => {
      const div = document.createElement('div');
      div.className = 'activity-item';
      div.innerHTML = `
        <span class="act-icon">${act.emoji}</span>
        <div class="act-info"><div class="name">${act.name}</div><div class="time">${act.spoons} spoons</div></div>
        <button class="act-delete" data-id="${act.id}">✕</button>`;
      div.querySelector('.act-delete').addEventListener('click', () => {
        save(KEYS.CUSTOM_ACT, getCustomActivities().filter(a => a.id !== act.id));
        renderSettings();
      });
      customList.appendChild(div);
    });
  }
}

function renderQuickPicker() {
  const settings = getSettings();
  const allActs = getAllActivities();
  const currentIds = settings.quickIds || QUICK_IDS;
  const grid = el('quick-picker-grid');
  if (!grid) return;
  grid.innerHTML = '';

  el('quick-picker-count').textContent = `${currentIds.length}/5 selected`;

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
    if (ids.length >= 5) { flash('Max 5 quick buttons. Remove one first.'); return; }
    ids.push(actId);
  }
  settings.quickIds = ids;
  saveSettings(settings);
  renderQuickPicker();
}

function saveSettingsForm() {
  const settings = getSettings();
  settings.baseBudget = parseFloat(el('set-base-budget').value) || 10;
  settings.enableAfterSixModifier = el('set-after-six').checked;
  settings.enableStackingPenalty = el('set-stacking').checked;

  if (!settings.spoonOverrides) settings.spoonOverrides = {};
  document.querySelectorAll('.spoon-override-input').forEach(input => {
    const id = input.dataset.id;
    const val = parseFloat(input.value);
    const defAct = DEFAULT_ACTIVITIES.find(a => a.id === id);
    if (defAct && val !== defAct.spoons) settings.spoonOverrides[id] = val;
    else delete settings.spoonOverrides[id];
  });

  saveSettings(settings);
  flash('Settings saved!');
}

function addCustomActivity() {
  const name = el('new-custom-name').value.trim();
  const spoons = parseFloat(el('new-custom-spoons').value);
  const emoji = el('new-custom-emoji').value.trim() || '⚡';
  if (!name || isNaN(spoons)) { alert('Please enter a name and spoon cost.'); return; }
  const customs = getCustomActivities();
  customs.push({ id: 'custom_' + Date.now(), name, spoons, emoji, category: 'custom', recovery: spoons < 0 });
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
  const ci = getCheckin(d);
  const text = `🥄 Elaine's Energy Update — ${fmtDate(d)}\n\nSpoons remaining: ${remaining}/${budget}\nSpoons used: ${used}\nMorning energy: ${ci ? ci.energy + '/10' : '?'}\n\nSent via CMT Energy Tracker`;
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
  const settings = getSettings();
  const rows = [['Date','Budget','Spoons Used','Spoons Remaining','Activities','Zones','Energy Direction','Brain Fog','Falls','Muscle Weakness','Next-Day Fatigue','Morning Energy','Sleep Hours','CPAP Hours','Trazodone']];

  days.forEach(d => {
    const entries = getActivitiesForDate(d);
    const { budget, used, remaining } = calcSpoonsRemaining(d);
    const sym = getSymptoms(d) || {};
    const ci = getCheckin(d) || {};
    const acts = entries.map(e => e.name).join('; ');
    const zones = entries.map(e => e.zone || '').join('; ');
    const dirs = entries.map(e => e.energyDir || '').join('; ');
    rows.push([d, budget, used, remaining, acts, zones, dirs,
      sym.brainFog ? 'Yes' : 'No', sym.falls ? 'Yes' : 'No',
      sym.muscleWeakSev || '', sym.nextDayFatigue || '',
      ci.energy || '', ci.sleepHours || '', ci.cpapHours || '',
      ci.trazodone ? 'Yes' : 'No']);
  });

  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
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
  const yesterday = dateStr(new Date(Date.now() - 86400000));
  const two = dateStr(new Date(Date.now() - 2 * 86400000));

  const all = load(KEYS.ACTIVITIES) || {};
  all[two] = [
    { id:'s1', activityId:'pt', name:'PT Session', emoji:'🏥', baseCost:4, effectiveCost:4, isRecovery:false, timestamp:two+'T10:00:00Z', note:'Balance focus', zone:'maintenance', energyDir:'drained' },
    { id:'s2', activityId:'cmt_class', name:'CMT Exercise Class', emoji:'💪', baseCost:3, effectiveCost:3, isRecovery:false, timestamp:two+'T14:00:00Z', note:'', zone:'maintenance', energyDir:'drained' },
    { id:'s3', activityId:'journaling', name:'Journaling', emoji:'✍️', baseCost:0, effectiveCost:0, isRecovery:false, timestamp:two+'T20:00:00Z', note:'Evening reflection', zone:'genius', energyDir:'gave' },
  ];
  all[yesterday] = [
    { id:'s4', activityId:'tv_rest', name:'Watching TV / Resting', emoji:'📺', baseCost:0, effectiveCost:0, isRecovery:false, timestamp:yesterday+'T10:00:00Z', note:'', zone:'competence', energyDir:'neutral' },
    { id:'s5', activityId:'meditation', name:'Meditation', emoji:'🧘‍♀️', baseCost:-1, effectiveCost:-1, isRecovery:true, timestamp:yesterday+'T13:00:00Z', note:'20 min guided', zone:'genius', energyDir:'gave' },
    { id:'s6', activityId:'dog_walk', name:'Walking Dog', emoji:'🐕', baseCost:1, effectiveCost:1, isRecovery:false, timestamp:yesterday+'T16:00:00Z', note:'Short walk', zone:'competence', energyDir:'neutral' },
  ];
  all[d] = [
    { id:'s7', activityId:'cooking', name:'Cooking Meal', emoji:'🍳', baseCost:1, effectiveCost:1, isRecovery:false, timestamp:d+'T09:00:00Z', note:'', zone:'competence', energyDir:'neutral' },
    { id:'s8', activityId:'yoga', name:'Yoga', emoji:'🧘', baseCost:2, effectiveCost:2, isRecovery:false, timestamp:d+'T11:00:00Z', note:'Gentle flow', zone:'maintenance', energyDir:'gave' },
  ];
  save(KEYS.ACTIVITIES, all);

  const checkins = load(KEYS.CHECKINS) || {};
  checkins[two] = { date:two, energy:7, brainFog:false, muscleWeak:false, cpapHours:6, trazodone:true, sleepQuality:3, sleepHours:7, napCount:0 };
  checkins[yesterday] = { date:yesterday, energy:4, brainFog:true, muscleWeak:true, cpapHours:5, trazodone:true, sleepQuality:2, sleepHours:6, napCount:0 };
  checkins[d] = { date:d, energy:6, brainFog:false, muscleWeak:false, cpapHours:6, trazodone:true, sleepQuality:3, sleepHours:7.5, napCount:0 };
  save(KEYS.CHECKINS, checkins);

  const symptoms = load(KEYS.SYMPTOMS) || {};
  symptoms[two] = { date:two, brainFog:false, falls:false, muscleWeakSev:1, nextDayFatigue:0 };
  symptoms[yesterday] = { date:yesterday, brainFog:true, brainFogSev:4, falls:false, muscleWeakSev:3, nextDayFatigue:5 };
  symptoms[d] = { date:d, brainFog:false, falls:false, muscleWeakSev:1, nextDayFatigue:2 };
  save(KEYS.SYMPTOMS, symptoms);

  flash('Sample data loaded!');
  renderPage(window._currentPage || 'today');
}

// ═══════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════

function init() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(reg => {
      if (reg.active) reg.active.postMessage({ type: 'SCHEDULE_MORNING' });
    }).catch(() => {});
  }
  if ('Notification' in window && Notification.permission === 'default') {
    setTimeout(() => Notification.requestPermission(), 3000);
  }

  document.querySelectorAll('nav button[data-page]').forEach(btn => {
    btn.addEventListener('click', () => showPage(btn.dataset.page));
  });

  el('morning-prompt').addEventListener('click', openCheckinModal);
  el('log-submit').addEventListener('click', submitLog);
  el('log-symptom-btn').addEventListener('click', () => openSymptomModal(today()));
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
