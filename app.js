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
  { id: 'pt',          name: 'PT Session',            emoji: '🏥', spoons: 4,  category: 'medical',    recovery: false },
  { id: 'cmt_class',   name: 'CMT Exercise Class',    emoji: '💪', spoons: 3,  category: 'exercise',   recovery: false },
  { id: 'doctor',      name: 'Doctor Appointment',    emoji: '👨‍⚕️', spoons: 2,  category: 'medical',    recovery: false },
  { id: 'grocery',     name: 'Grocery Shopping',      emoji: '🛒', spoons: 2,  category: 'errand',     recovery: false },
  { id: 'cooking',     name: 'Cooking Meal',          emoji: '🍳', spoons: 1,  category: 'household',  recovery: false },
  { id: 'driving',     name: 'Driving',               emoji: '🚗', spoons: 1,  category: 'errand',     recovery: false },
  { id: 'social',      name: 'Social Outing',         emoji: '👥', spoons: 2,  category: 'social',     recovery: false },
  { id: 'chores_lt',   name: 'Light Chores',          emoji: '🧹', spoons: 1,  category: 'household',  recovery: false },
  { id: 'chores_hv',   name: 'Heavy Chores',          emoji: '🏠', spoons: 2,  category: 'household',  recovery: false },
  { id: 'dog_walk',    name: 'Walking Dog',           emoji: '🐕', spoons: 1,  category: 'exercise',   recovery: false },
  { id: 'tv_rest',     name: 'Watching TV / Resting', emoji: '📺', spoons: 0,  category: 'rest',       recovery: false },
  { id: 'yoga',        name: 'Yoga',                  emoji: '🧘', spoons: 2,  category: 'exercise',   recovery: false },
  { id: 'gym',         name: 'Gym',                   emoji: '🏋️', spoons: 3,  category: 'exercise',   recovery: false },
  { id: 'meditation',  name: 'Meditation',            emoji: '🧘‍♀️', spoons: -1, category: 'recovery',   recovery: true  },
  { id: 'nap',         name: 'Nap',                   emoji: '😴', spoons: -1, category: 'recovery',   recovery: true  },
  { id: 'sleep',       name: 'Full Night Sleep',      emoji: '🌙', spoons: -5, category: 'recovery',   recovery: true  },
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

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function getSettings() {
  return { ...DEFAULT_SETTINGS, ...(load(KEYS.SETTINGS) || {}) };
}

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

function getActivitiesForDate(dateStr) {
  const all = load(KEYS.ACTIVITIES) || {};
  return all[dateStr] || [];
}

function saveActivityForDate(dateStr, entry) {
  const all = load(KEYS.ACTIVITIES) || {};
  if (!all[dateStr]) all[dateStr] = [];
  all[dateStr].push(entry);
  save(KEYS.ACTIVITIES, all);
}

function deleteActivityForDate(dateStr, entryId) {
  const all = load(KEYS.ACTIVITIES) || {};
  if (!all[dateStr]) return;
  all[dateStr] = all[dateStr].filter(e => e.id !== entryId);
  save(KEYS.ACTIVITIES, all);
}

function getCheckin(dateStr) {
  const all = load(KEYS.CHECKINS) || {};
  return all[dateStr] || null;
}

function saveCheckin(dateStr, data) {
  const all = load(KEYS.CHECKINS) || {};
  all[dateStr] = { ...data, date: dateStr };
  save(KEYS.CHECKINS, all);
}

function getSymptoms(dateStr) {
  const all = load(KEYS.SYMPTOMS) || {};
  return all[dateStr] || null;
}

function saveSymptoms(dateStr, data) {
  const all = load(KEYS.SYMPTOMS) || {};
  all[dateStr] = { ...data, date: dateStr };
  save(KEYS.SYMPTOMS, all);
}

// ═══════════════════════════════════════════════════════
// DATE UTILITIES
// ═══════════════════════════════════════════════════════

function today() {
  return new Date().toISOString().slice(0, 10);
}

function dateStr(d) {
  return d.toISOString().slice(0, 10);
}

function fmtDate(str) {
  const d = new Date(str + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function last7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(dateStr(d));
  }
  return days;
}

function last30Days() {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(dateStr(d));
  }
  return days;
}

// ═══════════════════════════════════════════════════════
// SPOON ENGINE
// ═══════════════════════════════════════════════════════

function calcDailyBudget(checkin) {
  const s = getSettings();
  const base = s.baseBudget || 10;
  if (!checkin) return base;
  const { energy = 5, brainFog = false, muscleWeak = false, cpapHours = 0 } = checkin;
  const good = energy >= 8 && !brainFog && !muscleWeak && cpapHours >= 6;
  const poor = energy <= 5 && (brainFog || muscleWeak);
  if (good) return base + 2;
  if (poor) return Math.max(4, base - 4);
  return base;
}

function isAfterSix(isoTimestamp) {
  const h = new Date(isoTimestamp).getHours();
  return h >= 18;
}

function calcEntryEffectiveCost(entry, allEntries, settings) {
  if (entry.isRecovery) return entry.baseCost; // negative already
  let cost = entry.baseCost;

  // After-6pm modifier
  if (settings.enableAfterSixModifier && isAfterSix(entry.timestamp) && cost > 0) {
    cost += 0.5;
  }

  return cost;
}

function calcStackingPenalty(entries, settings) {
  if (!settings.enableStackingPenalty) return 0;
  const highCost = entries.filter(e => !e.isRecovery && e.baseCost >= 3);
  return highCost.length >= 2 ? 1 : 0;
}

function calcSpoonsUsed(entries, settings) {
  let used = 0;
  entries.forEach(e => {
    const cost = calcEntryEffectiveCost(e, entries, settings);
    if (cost > 0) used += cost;
  });
  used += calcStackingPenalty(entries, settings);
  return parseFloat(used.toFixed(1));
}

function calcSpoonsRecovered(entries) {
  let recovered = 0;
  entries.forEach(e => {
    if (e.isRecovery || e.baseCost < 0) recovered += Math.abs(e.baseCost);
  });
  return parseFloat(recovered.toFixed(1));
}

function calcSpoonsRemaining(dateStr_) {
  const checkin = getCheckin(dateStr_);
  const budget = calcDailyBudget(checkin);
  const entries = getActivitiesForDate(dateStr_);
  const settings = getSettings();
  const used = calcSpoonsUsed(entries, settings);
  const recovered = calcSpoonsRecovered(entries);
  const remaining = parseFloat((budget - used + recovered).toFixed(1));
  return { budget, used, recovered, remaining };
}

function spoonColorClass(remaining, budget) {
  const pct = remaining / budget;
  if (remaining <= 2) return 'red';
  if (remaining <= 5) return 'yellow';
  return 'green';
}

// ═══════════════════════════════════════════════════════
// PATTERN DETECTION
// ═══════════════════════════════════════════════════════

function detectPatterns() {
  const days = last30Days();
  const warnings = [];

  days.forEach((d, i) => {
    if (i === 0) return;
    const sym = getSymptoms(d);
    if (sym && sym.nextDayFatigue >= 4) {
      const prevEntries = getActivitiesForDate(days[i - 1]);
      const ids = prevEntries.map(e => e.activityId);
      if (ids.includes('pt') && ids.includes('cmt_class')) {
        warnings.push('pt+cmt_class');
      }
    }
  });

  return warnings;
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
    alerts.push({ type: 'red', icon: '⚠️', text: `Only ${remaining} spoon${remaining === 1 ? '' : 's'} left. Consider resting for the remainder of the day.` });
  } else if (remaining <= 5) {
    alerts.push({ type: 'yellow', icon: '⚡', text: `${remaining} spoons remaining. Pace yourself — lighter activities only.` });
  }

  // Predictive
  if (used >= budget * 0.8) {
    alerts.push({ type: 'yellow', icon: '🔮', text: "Based on today's activity level, you may need extra rest tomorrow." });
  }

  // Pattern-based
  const ids = entries.map(e => e.activityId);
  if (ids.includes('pt') && ids.includes('cmt_class')) {
    alerts.push({ type: 'yellow', icon: '📊', text: "PT + CMT class on the same day has caused next-day fatigue before. Plan light activity tomorrow." });
  }

  // Stacking penalty
  if (settings.enableStackingPenalty) {
    const highCost = entries.filter(e => !e.isRecovery && e.baseCost >= 3);
    if (highCost.length >= 2) {
      alerts.push({ type: 'yellow', icon: '📈', text: "Stacking penalty applied: 2+ high-cost activities today cost an extra spoon." });
    }
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
    case 'today':   renderToday();   break;
    case 'log':     renderLog();     break;
    case 'history': renderHistory(); break;
    case 'weekly':  renderWeekly();  break;
    case 'settings':renderSettings();break;
  }
}

// ═══════════════════════════════════════════════════════
// TODAY PAGE
// ═══════════════════════════════════════════════════════

function renderToday() {
  const d = today();
  el('today-date').textContent = fmtDate(d);

  const { budget, used, recovered, remaining } = calcSpoonsRemaining(d);
  const colorClass = spoonColorClass(remaining, budget);

  // Spoon meter
  el('spoon-count').textContent = remaining;
  el('spoon-count').className = 'spoon-count ' + colorClass;
  const pct = Math.max(0, Math.min(100, (remaining / budget) * 100));
  el('spoon-bar').style.width = pct + '%';
  el('spoon-bar').className = 'progress-bar-fill ' + colorClass;
  el('spoon-used').textContent = used;
  el('spoon-budget').textContent = budget;
  if (recovered > 0) {
    el('spoon-recovered').textContent = '+' + recovered + ' recovered';
    el('spoon-recovered').hidden = false;
  } else {
    el('spoon-recovered').hidden = true;
  }

  // Budget source
  const checkin = getCheckin(d);
  let budgetSrc = `Base budget: ${budget} spoons`;
  if (checkin) {
    const diff = budget - getSettings().baseBudget;
    if (diff > 0) budgetSrc = `Morning check-in: +${diff} spoons (feeling good!)`;
    else if (diff < 0) budgetSrc = `Morning check-in: ${diff} spoons (take it easy today)`;
  }
  el('budget-source').textContent = budgetSrc;

  // Morning check-in prompt
  el('morning-prompt').hidden = !!checkin;

  // Alerts
  const alerts = getTodayAlerts();
  const alertsDiv = el('today-alerts');
  alertsDiv.innerHTML = '';
  alerts.forEach(a => {
    const div = document.createElement('div');
    div.className = `alert ${a.type}`;
    div.innerHTML = `<span class="alert-icon">${a.icon}</span><span class="alert-text">${a.text}</span>`;
    alertsDiv.appendChild(div);
  });

  // Quick buttons
  const settings = getSettings();
  const allActs = getAllActivities();
  const quickIds = settings.quickIds || QUICK_IDS;
  const quickActs = quickIds.map(id => allActs.find(a => a.id === id)).filter(Boolean);
  const quickGrid = el('quick-grid');
  quickGrid.innerHTML = '';
  quickActs.forEach(act => {
    const btn = document.createElement('button');
    btn.className = 'quick-btn';
    const costLabel = act.spoons < 0 ? `+${Math.abs(act.spoons)} recovery` : act.spoons === 0 ? 'free' : `${act.spoons} spoons`;
    btn.innerHTML = `<span class="act-emoji">${act.emoji}</span><span class="act-name">${act.name}</span><span class="act-spoons">${costLabel}</span>`;
    btn.addEventListener('click', () => quickLog(act));
    quickGrid.appendChild(btn);
  });

  // Today's activity list
  const entries = getActivitiesForDate(d);
  const listDiv = el('today-activities');
  listDiv.innerHTML = '';
  if (entries.length === 0) {
    listDiv.innerHTML = `<div class="empty-state"><div class="emoji">📋</div><p>No activities logged yet today.<br>Use Quick Log or the + button below.</p></div>`;
  } else {
    entries.slice().reverse().forEach(entry => {
      listDiv.appendChild(makeActivityItem(entry, d));
    });
  }
}

function makeActivityItem(entry, dateStr_) {
  const div = document.createElement('div');
  div.className = 'activity-item';
  const isRecov = entry.isRecovery || entry.baseCost < 0;
  const costDisplay = isRecov
    ? `+${Math.abs(entry.baseCost)}`
    : entry.baseCost === 0 ? '—'
    : `-${entry.effectiveCost || entry.baseCost}`;
  const costClass = isRecov ? 'positive' : entry.baseCost === 0 ? 'zero' : 'negative';
  div.innerHTML = `
    <span class="act-icon">${entry.emoji}</span>
    <div class="act-info">
      <div class="name">${entry.name}</div>
      <div class="time">${fmtTime(entry.timestamp)}${entry.note ? '' : ''}</div>
      ${entry.note ? `<div class="note">"${entry.note}"</div>` : ''}
    </div>
    <span class="act-cost ${costClass}">${costDisplay}</span>
    <button class="act-delete" title="Delete" data-id="${entry.id}">✕</button>
  `;
  div.querySelector('.act-delete').addEventListener('click', () => {
    deleteActivityForDate(dateStr_, entry.id);
    renderPage('today');
  });
  return div;
}

function quickLog(act) {
  const d = today();
  const entries = getActivitiesForDate(d);
  const settings = getSettings();
  const entry = {
    id: Date.now().toString(),
    activityId: act.id,
    name: act.name,
    emoji: act.emoji,
    baseCost: act.spoons,
    isRecovery: act.recovery || act.spoons < 0,
    timestamp: new Date().toISOString(),
    note: '',
  };
  entry.effectiveCost = calcEntryEffectiveCost(entry, entries, settings);
  saveActivityForDate(d, entry);

  const costMsg = entry.isRecovery
    ? `+${Math.abs(act.spoons)} recovery spoons`
    : `${entry.effectiveCost} spoon${entry.effectiveCost === 1 ? '' : 's'}`;
  flash(`${act.emoji} ${act.name} logged (${costMsg})`);
  renderPage('today');
}

// ═══════════════════════════════════════════════════════
// MORNING CHECK-IN
// ═══════════════════════════════════════════════════════

let _checkinFormState = {};

function openCheckinModal() {
  _checkinFormState = {};
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'checkin-modal';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-handle"></div>
      <div class="modal-title">🌅 Morning Check-In</div>

      <div class="form-group">
        <label class="form-label">Energy Level</label>
        <div class="scale-row" id="ci-energy">
          ${[1,2,3,4,5,6,7,8,9,10].map(n => `<button class="scale-btn" data-val="${n}">${n}</button>`).join('')}
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
            ${[1,2,3,4,5].map(n => `<button class="scale-btn" data-val="${n}">${n}</button>`).join('')}
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
    </div>
  `;

  // Scale button groups
  overlay.querySelectorAll('.scale-row').forEach(row => {
    row.querySelectorAll('.scale-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        row.querySelectorAll('.scale-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
  });

  // Toggle button groups
  overlay.querySelectorAll('.toggle-row').forEach(row => {
    row.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        row.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
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

function renderLog() {
  _selectedActId = null;
  _isCustom = false;

  const allActs = getAllActivities();
  const grid = el('log-activity-grid');
  grid.innerHTML = '';
  allActs.forEach(act => {
    const btn = document.createElement('button');
    btn.className = 'activity-select-btn';
    btn.dataset.id = act.id;
    const costLabel = act.spoons < 0
      ? `+${Math.abs(act.spoons)} recovery`
      : act.spoons === 0 ? 'free'
      : `${act.spoons} spoon${act.spoons === 1 ? '' : 's'}`;
    btn.innerHTML = `<span class="emoji">${act.emoji}</span><div class="info"><div class="n">${act.name}</div><div class="s">${costLabel}</div></div>`;
    btn.addEventListener('click', () => {
      grid.querySelectorAll('.activity-select-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      _selectedActId = act.id;
      _isCustom = false;
      el('log-custom-section').hidden = true;
    });
    grid.appendChild(btn);
  });

  // Custom activity
  el('log-custom-toggle').onclick = () => {
    grid.querySelectorAll('.activity-select-btn').forEach(b => b.classList.remove('selected'));
    _selectedActId = null;
    _isCustom = true;
    el('log-custom-section').hidden = false;
  };

  // Default timestamp = now
  const now = new Date();
  now.setSeconds(0, 0);
  el('log-timestamp').value = now.toISOString().slice(0, 16);
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
    if (!name || isNaN(spoons)) { alert('Please enter a name and spoon cost for your custom activity.'); return; }
    act = { id: 'custom_' + Date.now(), name, spoons, emoji, recovery: spoons < 0 };
  } else if (_selectedActId) {
    const allActs = getAllActivities();
    act = allActs.find(a => a.id === _selectedActId);
    if (!act) { alert('Please select an activity.'); return; }
  } else {
    alert('Please select an activity or create a custom one.');
    return;
  }

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
  };
  entry.effectiveCost = calcEntryEffectiveCost(entry, entries, settings);
  saveActivityForDate(d, entry);

  // Reset form
  el('log-note').value = '';
  el('custom-name') && (el('custom-name').value = '');
  el('custom-spoons') && (el('custom-spoons').value = '');
  el('log-custom-section').hidden = true;
  renderLog();

  const costMsg = entry.isRecovery
    ? `+${Math.abs(act.spoons)} spoons restored`
    : `${entry.effectiveCost} spoon${entry.effectiveCost === 1 ? '' : 's'}`;
  flash(`${act.emoji} ${act.name} logged (${costMsg})`);
  showPage('today');
}

// Symptom logging (accessible from log page)
function openSymptomModal(dateStr_) {
  const existing = getSymptoms(dateStr_ || today()) || {};
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-handle"></div>
      <div class="modal-title">📊 Log Symptoms</div>
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px">For: ${fmtDate(dateStr_ || today())}</p>

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
          ${[1,2,3,4,5].map(n => `<button class="scale-btn${existing.brainFogSev === n ? ' selected' : ''}" data-val="${n}">${n}</button>`).join('')}
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
          ${[1,2,3,4,5].map(n => `<button class="scale-btn${existing.muscleWeakSev === n ? ' selected' : ''}" data-val="${n}">${n}</button>`).join('')}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Next-Day Fatigue <span class="hint">(rate how yesterday left you feeling)</span></label>
        <div class="scale-row" id="sym-fatigue">
          ${[1,2,3,4,5].map(n => `<button class="scale-btn${existing.nextDayFatigue === n ? ' selected' : ''}" data-val="${n}">${n}</button>`).join('')}
        </div>
      </div>

      <button class="btn btn-primary" id="sym-save" style="margin-top:8px">Save Symptoms</button>
      <button class="btn btn-secondary" id="sym-cancel" style="margin-top:8px">Cancel</button>
    </div>
  `;

  overlay.querySelectorAll('.scale-row').forEach(row => {
    row.querySelectorAll('.scale-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        row.querySelectorAll('.scale-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
  });

  overlay.querySelectorAll('.toggle-row').forEach(row => {
    row.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        row.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        if (row.id === 'sym-fog') {
          overlay.querySelector('#sym-fog-sev-wrap').style.display = btn.dataset.val === 'true' ? '' : 'none';
        }
      });
    });
  });

  overlay.querySelector('#sym-save').addEventListener('click', () => {
    const brainFog = overlay.querySelector('#sym-fog .selected')?.dataset.val === 'true';
    const brainFogSev = parseInt(overlay.querySelector('#sym-fog-sev .selected')?.dataset.val || '0');
    const falls = overlay.querySelector('#sym-falls .selected')?.dataset.val === 'true';
    const muscleWeakSev = parseInt(overlay.querySelector('#sym-weak .selected')?.dataset.val || '0');
    const nextDayFatigue = parseInt(overlay.querySelector('#sym-fatigue .selected')?.dataset.val || '0');
    saveSymptoms(dateStr_ || today(), { brainFog, brainFogSev, falls, muscleWeakSev, nextDayFatigue });
    overlay.remove();
    flash('Symptoms saved');
    if (window._currentPage === 'history') renderPage('history');
    if (window._currentPage === 'today') renderPage('today');
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
    const colorClass = spoonColorClass(remaining, budget);

    const dayDiv = document.createElement('div');
    dayDiv.className = 'history-day';

    const header = document.createElement('div');
    header.className = 'history-day-header';
    header.innerHTML = `
      <div>
        <div class="day-name">${isToday ? '📍 Today' : fmtDate(d)}</div>
        <div class="day-stats">${entries.length} activit${entries.length === 1 ? 'y' : 'ies'} · ${used}/${budget} spoons used</div>
      </div>
      <span class="chip ${colorClass}" style="margin-right:8px">${remaining} left</span>
      <span class="expand-icon">›</span>
    `;

    const body = document.createElement('div');
    body.className = 'history-day-body';

    let bodyHTML = '';

    if (entries.length) {
      entries.forEach(e => {
        const isRecov = e.isRecovery || e.baseCost < 0;
        const cost = isRecov ? `+${Math.abs(e.baseCost)} recovery` : e.baseCost === 0 ? 'free' : `-${e.effectiveCost || e.baseCost}`;
        bodyHTML += `<div class="activity-item">
          <span class="act-icon">${e.emoji}</span>
          <div class="act-info"><div class="name">${e.name}</div><div class="time">${fmtTime(e.timestamp)}</div>${e.note ? `<div class="note">"${e.note}"</div>` : ''}</div>
          <span class="act-cost ${isRecov ? 'positive' : e.baseCost === 0 ? 'zero' : 'negative'}">${cost}</span>
        </div>`;
      });
    } else {
      bodyHTML += `<p style="font-size:13px;color:var(--text-muted);padding:8px 0">No activities logged</p>`;
    }

    // Symptoms
    bodyHTML += `<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">`;
    bodyHTML += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><span style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em">Symptoms</span><button class="btn btn-secondary btn-sm" onclick="openSymptomModal('${d}')">Log</button></div>`;
    if (symptoms) {
      bodyHTML += `<div class="symptom-chips">`;
      if (symptoms.brainFog) bodyHTML += `<span class="chip yellow">🌫 Brain fog ${symptoms.brainFogSev ? symptoms.brainFogSev + '/5' : ''}</span>`;
      if (symptoms.falls) bodyHTML += `<span class="chip red">⚠️ Falls</span>`;
      if (symptoms.muscleWeakSev > 0) bodyHTML += `<span class="chip yellow">💪 Weakness ${symptoms.muscleWeakSev}/5</span>`;
      if (symptoms.nextDayFatigue > 0) bodyHTML += `<span class="chip ${symptoms.nextDayFatigue >= 4 ? 'red' : 'yellow'}">😴 Next-day fatigue ${symptoms.nextDayFatigue}/5</span>`;
      bodyHTML += `</div>`;
    } else {
      bodyHTML += `<p style="font-size:13px;color:var(--text-muted)">None logged</p>`;
    }
    bodyHTML += `</div>`;

    // Check-in
    if (checkin) {
      bodyHTML += `<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">`;
      bodyHTML += `<div style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Morning Check-In</div>`;
      bodyHTML += `<div class="tag-row">`;
      if (checkin.energy) bodyHTML += `<span class="tag">⚡ Energy ${checkin.energy}/10</span>`;
      if (checkin.sleepHours) bodyHTML += `<span class="tag">💤 ${checkin.sleepHours}h sleep</span>`;
      if (checkin.cpapHours) bodyHTML += `<span class="tag">😷 CPAP ${checkin.cpapHours}h</span>`;
      if (checkin.trazodone) bodyHTML += `<span class="tag">💊 Trazodone</span>`;
      bodyHTML += `</div></div>`;
    }

    body.innerHTML = bodyHTML;

    header.addEventListener('click', () => {
      body.classList.toggle('open');
      header.querySelector('.expand-icon').textContent = body.classList.contains('open') ? '∨' : '›';
    });

    dayDiv.appendChild(header);
    dayDiv.appendChild(body);
    container.appendChild(dayDiv);

    // Auto-open today
    if (isToday) {
      body.classList.add('open');
      header.querySelector('.expand-icon').textContent = '∨';
    }
  });
}

// ═══════════════════════════════════════════════════════
// WEEKLY PAGE (Charts)
// ═══════════════════════════════════════════════════════

let _charts = {};

function renderWeekly() {
  const days = last7Days();
  const labels = days.map(d => fmtDate(d).split(',')[0]);

  const usedData = days.map(d => {
    const entries = getActivitiesForDate(d);
    const settings = getSettings();
    return calcSpoonsUsed(entries, settings);
  });

  const budgetData = days.map(d => {
    const checkin = getCheckin(d);
    return calcDailyBudget(checkin);
  });

  const energyData = days.map(d => {
    const c = getCheckin(d);
    return c ? c.energy : null;
  });

  const fatigueData = days.map(d => {
    const s = getSymptoms(d);
    return s ? s.nextDayFatigue : null;
  });

  const sleepData = days.map(d => {
    const c = getCheckin(d);
    return c ? c.sleepHours : null;
  });

  if (typeof Chart === 'undefined') return;

  // Spoon usage chart
  renderChart('chart-spoons', 'bar', labels, [
    { label: 'Spoons Used', data: usedData, backgroundColor: '#6366f1cc', borderColor: '#6366f1', borderWidth: 2, borderRadius: 6 },
    { label: 'Daily Budget', data: budgetData, type: 'line', borderColor: '#16a34a', borderWidth: 2, pointRadius: 3, fill: false, tension: 0.4, borderDash: [4, 4] },
  ], { y: { beginAtZero: true, max: 16 } });

  // Energy vs fatigue
  renderChart('chart-energy', 'line', labels, [
    { label: 'Morning Energy', data: energyData, borderColor: '#f59e0b', backgroundColor: '#f59e0b22', fill: true, tension: 0.4, spanGaps: true },
    { label: 'Next-Day Fatigue', data: fatigueData, borderColor: '#ef4444', backgroundColor: '#ef444422', fill: true, tension: 0.4, spanGaps: true },
  ], { y: { beginAtZero: true, max: 10 } });

  // Sleep hours
  renderChart('chart-sleep', 'bar', labels, [
    { label: 'Sleep Hours', data: sleepData, backgroundColor: '#8b5cf6cc', borderColor: '#8b5cf6', borderWidth: 2, borderRadius: 6, spanGaps: true },
  ], { y: { beginAtZero: true, max: 12 } });

  // Weekly summary stats
  const totalUsed = usedData.reduce((a, b) => a + b, 0);
  const avgUsed = (totalUsed / 7).toFixed(1);
  const daysWithFatigue = fatigueData.filter(f => f >= 4).length;
  const avgEnergy = energyData.filter(e => e !== null);
  const avgEnergyVal = avgEnergy.length ? (avgEnergy.reduce((a, b) => a + b, 0) / avgEnergy.length).toFixed(1) : '—';

  el('weekly-total-used').textContent = totalUsed.toFixed(1);
  el('weekly-avg-used').textContent = avgUsed;
  el('weekly-days-fatigue').textContent = daysWithFatigue;
  el('weekly-avg-energy').textContent = avgEnergyVal;

  // Pattern detection
  const patterns = detectPatterns();
  const patternDiv = el('weekly-patterns');
  patternDiv.innerHTML = '';
  if (patterns.includes('pt+cmt_class')) {
    const d = document.createElement('div');
    d.className = 'pattern-warning';
    d.innerHTML = `<div class="pw-title">⚠️ Pattern Detected</div><div class="pw-text">PT + CMT class on the same day has led to high next-day fatigue (4+/5) in the last 30 days. Consider spacing these activities.</div>`;
    patternDiv.appendChild(d);
  }
  if (patterns.length === 0) {
    patternDiv.innerHTML = `<p style="font-size:13px;color:var(--text-muted)">No crash patterns detected yet. Keep logging to build your pattern library.</p>`;
  }
}

function renderChart(canvasId, type, labels, datasets, scales = {}) {
  const canvas = el(canvasId);
  if (!canvas) return;
  if (_charts[canvasId]) { _charts[canvasId].destroy(); }
  _charts[canvasId] = new Chart(canvas, {
    type,
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: { grid: { color: '#e2e8f0' }, ticks: { font: { size: 11 } }, ...scales.y },
        ...scales,
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
  el('set-after-six').checked = settings.enableAfterSixModifier !== false;
  el('set-stacking').checked = settings.enableStackingPenalty !== false;

  // Spoon overrides table
  const allActs = getAllActivities();
  const tbody = el('spoon-overrides-body');
  tbody.innerHTML = '';
  allActs.filter(a => !a.id.startsWith('custom_')).forEach(act => {
    const tr = document.createElement('tr');
    const currentCost = settings.spoonOverrides?.[act.id] ?? act.spoons;
    tr.innerHTML = `
      <td style="padding:8px 4px;font-size:14px">${act.emoji} ${act.name}</td>
      <td style="padding:8px 4px;text-align:center">
        <input type="number" class="spoon-override-input" data-id="${act.id}" value="${currentCost}" min="-5" max="10" step="0.5"
          style="width:65px;padding:6px;text-align:center;border:1.5px solid var(--border);border-radius:8px;font-size:14px" />
      </td>
    `;
    tbody.appendChild(tr);
  });

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
        <button class="act-delete" data-id="${act.id}">✕</button>
      `;
      div.querySelector('.act-delete').addEventListener('click', () => {
        const customs = getCustomActivities().filter(a => a.id !== act.id);
        save(KEYS.CUSTOM_ACT, customs);
        renderSettings();
      });
      customList.appendChild(div);
    });
  }
}

function saveSettingsForm() {
  const settings = getSettings();
  settings.baseBudget = parseFloat(el('set-base-budget').value) || 10;
  settings.enableAfterSixModifier = el('set-after-six').checked;
  settings.enableStackingPenalty = el('set-stacking').checked;

  // Spoon overrides
  if (!settings.spoonOverrides) settings.spoonOverrides = {};
  document.querySelectorAll('.spoon-override-input').forEach(input => {
    const id = input.dataset.id;
    const val = parseFloat(input.value);
    const defaultAct = DEFAULT_ACTIVITIES.find(a => a.id === id);
    if (defaultAct && val !== defaultAct.spoons) {
      settings.spoonOverrides[id] = val;
    } else {
      delete settings.spoonOverrides[id];
    }
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

function generateShareText() {
  const d = today();
  const { remaining, budget, used } = calcSpoonsRemaining(d);
  const checkin = getCheckin(d);
  const energy = checkin ? checkin.energy : '?';
  return `🥄 Elaine's Energy Update — ${fmtDate(d)}\n\n` +
    `Spoons remaining: ${remaining}/${budget}\n` +
    `Spoons used: ${used}\n` +
    `Morning energy: ${energy}/10\n` +
    `\nSent via CMT Energy Tracker`;
}

function shareToHusband() {
  const text = generateShareText();
  if (navigator.share) {
    navigator.share({ title: 'Energy Update', text }).catch(() => copyToClipboard(text));
  } else {
    copyToClipboard(text);
  }
}

function copyToClipboard(text) {
  navigator.clipboard?.writeText(text).then(() => flash('Copied to clipboard!')).catch(() => {
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
  const rows = [['Date', 'Budget', 'Spoons Used', 'Spoons Remaining', 'Activities', 'Brain Fog', 'Falls', 'Muscle Weakness', 'Next-Day Fatigue', 'Morning Energy', 'Sleep Hours', 'CPAP Hours', 'Trazodone']];

  days.forEach(d => {
    const entries = getActivitiesForDate(d);
    const { budget, used, remaining } = calcSpoonsRemaining(d);
    const sym = getSymptoms(d) || {};
    const ci = getCheckin(d) || {};
    const acts = entries.map(e => e.name).join('; ');
    rows.push([d, budget, used, remaining, acts, sym.brainFog ? 'Yes' : 'No', sym.falls ? 'Yes' : 'No', sym.muscleWeakSev || '', sym.nextDayFatigue || '', ci.energy || '', ci.sleepHours || '', ci.cpapHours || '', ci.trazodone ? 'Yes' : 'No']);
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
  const twoDaysAgo = dateStr(new Date(Date.now() - 2 * 86400000));
  const settings = getSettings();

  // Two days ago: PT + CMT class (crash day)
  const entries2 = [
    { id: 's1', activityId: 'pt', name: 'PT Session', emoji: '🏥', baseCost: 4, effectiveCost: 4, isRecovery: false, timestamp: twoDaysAgo + 'T10:00:00Z', note: 'Focused on balance exercises' },
    { id: 's2', activityId: 'cmt_class', name: 'CMT Exercise Class', emoji: '💪', baseCost: 3, effectiveCost: 3, isRecovery: false, timestamp: twoDaysAgo + 'T14:00:00Z', note: '' },
    { id: 's3', activityId: 'cooking', name: 'Cooking Meal', emoji: '🍳', baseCost: 1, effectiveCost: 1, isRecovery: false, timestamp: twoDaysAgo + 'T18:30:00Z', note: '' },
  ];
  const all = load(KEYS.ACTIVITIES) || {};
  all[twoDaysAgo] = entries2;

  // Yesterday: recovery day
  const entries1 = [
    { id: 's4', activityId: 'tv_rest', name: 'Watching TV / Resting', emoji: '📺', baseCost: 0, effectiveCost: 0, isRecovery: false, timestamp: yesterday + 'T10:00:00Z', note: '' },
    { id: 's5', activityId: 'nap', name: 'Nap', emoji: '😴', baseCost: -1, effectiveCost: -1, isRecovery: true, timestamp: yesterday + 'T13:00:00Z', note: '90 min' },
    { id: 's6', activityId: 'dog_walk', name: 'Walking Dog', emoji: '🐕', baseCost: 1, effectiveCost: 1, isRecovery: false, timestamp: yesterday + 'T16:00:00Z', note: 'Short walk only' },
  ];
  all[yesterday] = entries1;

  // Today: light day
  const entries0 = [
    { id: 's7', activityId: 'cooking', name: 'Cooking Meal', emoji: '🍳', baseCost: 1, effectiveCost: 1, isRecovery: false, timestamp: d + 'T09:00:00Z', note: '' },
    { id: 's8', activityId: 'driving', name: 'Driving', emoji: '🚗', baseCost: 1, effectiveCost: 1, isRecovery: false, timestamp: d + 'T11:00:00Z', note: 'Pharmacy run' },
  ];
  all[d] = entries0;
  save(KEYS.ACTIVITIES, all);

  // Checkins
  const checkins = load(KEYS.CHECKINS) || {};
  checkins[twoDaysAgo] = { date: twoDaysAgo, energy: 7, brainFog: false, muscleWeak: false, cpapHours: 6, trazodone: true, sleepQuality: 3, sleepHours: 7, napCount: 0 };
  checkins[yesterday] = { date: yesterday, energy: 4, brainFog: true, muscleWeak: true, cpapHours: 5, trazodone: true, sleepQuality: 2, sleepHours: 6, napCount: 0 };
  checkins[d] = { date: d, energy: 6, brainFog: false, muscleWeak: false, cpapHours: 6, trazodone: true, sleepQuality: 3, sleepHours: 7.5, napCount: 0 };
  save(KEYS.CHECKINS, checkins);

  // Symptoms
  const symptoms = load(KEYS.SYMPTOMS) || {};
  symptoms[twoDaysAgo] = { date: twoDaysAgo, brainFog: false, falls: false, muscleWeakSev: 1, nextDayFatigue: 0 };
  symptoms[yesterday] = { date: yesterday, brainFog: true, brainFogSev: 4, falls: false, muscleWeakSev: 3, nextDayFatigue: 5 };
  symptoms[d] = { date: d, brainFog: false, falls: false, muscleWeakSev: 1, nextDayFatigue: 2 };
  save(KEYS.SYMPTOMS, symptoms);

  flash('Sample data loaded!');
  renderPage(window._currentPage || 'today');
}

// ═══════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════

function init() {
  // Service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(reg => {
      if (reg.active) reg.active.postMessage({ type: 'SCHEDULE_MORNING' });
    }).catch(() => {});
  }

  // Notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    setTimeout(() => Notification.requestPermission(), 3000);
  }

  // Nav
  document.querySelectorAll('nav button[data-page]').forEach(btn => {
    btn.addEventListener('click', () => showPage(btn.dataset.page));
  });

  // Morning prompt
  el('morning-prompt').addEventListener('click', openCheckinModal);

  // Log form
  el('log-submit').addEventListener('click', submitLog);
  el('log-symptom-btn').addEventListener('click', () => openSymptomModal(today()));

  // Settings
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
