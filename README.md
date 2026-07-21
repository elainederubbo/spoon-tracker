# Spoon Tracker — How to Use

**Live app:** https://elainederubbo.github.io/spoon-tracker
**Demo (sample data):** https://elainederubbo.github.io/spoon-tracker/demo.html
**Case Study:** https://elainederubbo.github.io/spoon-tracker/spoon-tracker-case-study.html

## Opening the App
- Open `index.html` in Safari on your Mac or iPhone.
- **To add to iPhone home screen:** Open in Safari → tap Share → "Add to Home Screen" → it behaves like a native app (full-screen, offline support, morning notifications).

---

## Daily Routine

### Every Morning
1. Tap the purple **"Complete Morning Check-In"** banner at the top.
2. Rate your energy (1–10) and optionally note why, confirm brain fog / muscle weakness (with a 1–5 severity when present), rate next-day fatigue (how yesterday left you), and enter CPAP hours, trazodone, sleep quality, and sleep hours.
3. Your spoon budget adjusts automatically:
   - **Energy 8+, no symptoms, CPAP 6+ hrs** → 12 spoons
   - **Energy 5 or below, symptoms present** → 6 spoons
   - **Anything else** → 10 spoons (your base)

### Throughout the Day
- **Energy check** (Today tab): "How's your energy right now?" — tap 1–10 and optionally note *why did you rate it that way?* Log as many checks as you like through the day; each is timestamped and listed underneath. This is completely separate from the morning check-in.
- **Quick Log buttons**: one-tap entry for up to **9** of your most common activities. Tap **✏️ Edit** on the Quick Log card to add or swap which activities appear (or use the picker in Settings).
- **Log tab**: tap any activity to log it instantly. **+ Custom** adds a new one, **Advanced** lets you back-date or add a note, and **Select multiple** logs several at once.
- **"🌙 Reflect on Today"** (full-width button below your activity list, or the 9 PM reminder): your end-of-day energy level, spoons left, one thing that went well, and a reminder for tomorrow (up to 500 characters) that surfaces on tomorrow's Today tab.

*(Symptom tracking — muscle-weakness severity and next-day fatigue — now lives inside the morning check-in rather than a separate button.)*

### Editing on the fly
- **Starting balance**: tap the ✏️ next to today's budget to override it for the day (e.g. set 15 on a big day).
- **A logged activity's cost**: tap its number in the Today list to adjust it inline.
- **An activity's defaults**: long-press it on the Log screen to edit emoji, name, cost, and category.

### Each Entry Shows
- Spoon cost deducted immediately from your meter
- After-6pm modifier (+0.5 spoons) applied automatically if you log after 6 PM Eastern
- Stacking penalty (+1 spoon) added if you do 2+ high-cost activities (3+ spoons each) in a day

---

## The Spoon Meter
- **Green (7+ spoons)**: You're good — normal activity fine
- **Yellow (3–6 spoons)**: Getting low — lighter tasks only
- **Red (0–2 spoons)**: Stop and rest — alert appears automatically

---

## Pages

| Tab | What it does |
|-----|-------------|
| 🥄 Today | Spoon meter (with editable starting balance), energy checks (as many as you like, each timestamped), quick log (up to 9), activity list, and a full-width Reflect button |
| ➕ Log | One-tap logging from the full activity list · **+ Custom** for new activities · **Advanced** for back-dating & notes · **Select multiple** to log several at once |
| 📋 History | Scroll back through every day · **jump to any date** · tap a day to expand activities, symptoms, check-in, and reflection |
| 📈 Patterns | This-week closing-balance strip + net surplus/deficit · morning-energy trend · spoons-by-category · usage vs. budget · sleep · crash-pattern detection · share & export |
| ⚙️ Settings | Default budget, auto-adjust toggle, modifiers, evening-reminder toggle, quick-log picker, spoon-cost overrides, custom activities, export |

---

## Customizing Spoon Costs

**For preset activities:**
1. Go to ⚙️ Settings → "Customize Spoon Costs"
2. Find any activity and change its number
3. Tap **Save Settings**

**For custom activities:**
1. Settings → "Custom Activities" → Add New
2. Enter an emoji, name, and spoon cost (negative = recovery)
3. Tap **+ Add Activity**
4. Your custom activity appears in the Log screen immediately

---

## Smart Features

### After-6pm Modifier
Any logged activity after 6 PM costs +0.5 extra spoons (evening exertion hits harder). Toggle off in Settings if you don't want this.

### Stacking Penalty
If you do PT (4 spoons) AND CMT class (3 spoons) on the same day, an automatic +1 penalty is added. Mirrors how combined high-exertion days actually feel.

### Recovery Credits
Logging a **Nap** immediately adds +1 spoon back to your remaining count. Full night sleep adds +5 (used at next morning's check-in).

### Crash Pattern Detection
After you've been logging for a week or more, the Patterns view automatically flags patterns like "PT + CMT class same day → high fatigue next morning" based on YOUR actual data.

---

## Sharing with Dan
- **Patterns tab → "📤 Share Spoon Count"**
- On iPhone: opens the share sheet so you can text/iMessage directly
- On Mac: copies a text summary to clipboard

## Exporting Data
- Patterns tab → **"📊 Export Last 30 Days (CSV)"**
- Downloads a spreadsheet you can open in Excel or share with your doctor

---

## Notifications (iPhone)
When you first open the app, it will ask for notification permission. If you allow it:
- **5:15 AM Eastern** — morning check-in reminder (always on).
- **9:00 PM Eastern** — end-of-day reflection reminder (opt-in: Settings → "Evening Reflection Reminder").

All dates, day rollovers, and timestamps run on **US Eastern Time** regardless of your device's timezone, so your daily spoon budget always matches your actual day.

---

## Activity Presets & Default Costs

All costs can be overridden in ⚙️ Settings → Customize Spoon Costs (or **long-press any activity** on the Log screen to edit its emoji, name, cost, and category).

**Medical / Therapy**
| Activity | Cost |
|----------|------|
| 🏥 PT Session | 4 spoons |
| 🦵 PT Exercises | 1 spoon |
| 🤲 OT Exercises | 1 spoon |
| 🗣️ SLP Work | 1 spoon |
| 👨‍⚕️ Doctor Appointment | 2 spoons |
| 💪 CMT Exercise Class | 3 spoons |

**Exercise**
| Activity | Cost |
|----------|------|
| 🏃 Daily Workout (15 min) | 2 spoons |
| 🧘 Yoga | 2 spoons |
| 🏋️ Gym | 3 spoons |
| 🐕 Walking Dog | 1 spoon |

**Work / Job Search**
| Activity | Cost |
|----------|------|
| 💻 Work / Job Search Block | 3 spoons |
| 📋 Admin / Paperwork | 1 spoon |

**Social**
| Activity | Cost |
|----------|------|
| 👥 Social Outing | 2 spoons |
| 📞 Phone/Video Catch-up | 1 spoon |
| 🍽️ Restaurant Meal | 2 spoons |
| 🎬 Movie / Live Event | 2 spoons |
| 🎤 Live Music | 2 spoons |

**Errands / Travel**
| Activity | Cost |
|----------|------|
| 🛒 Grocery Shopping | 2 spoons |
| 📮 Quick Errand | 1 spoon |
| 🚗 Driving | 1 spoon |
| 🐾 Pet Care (vet/boarding) | 2 spoons |
| ✈️ Travel Day (Flight) | 5 spoons |
| 🧳 Packing for Trip | 2 spoons |
| 🚉 Getting to Live Music | 2 spoons |

**Household**
| Activity | Cost |
|----------|------|
| 🍳 Cooking Meal | 1 spoon |
| 🥧 Baking Project | 2 spoons |
| 🧹 Light Chores | 1 spoon |
| 🏠 Heavy Chores | 2 spoons |
| 📦 Decluttering Session | 3 spoons |
| 🧺 Folding Laundry | 1 spoon |

**Self-Care / Rest / Recovery**
| Activity | Cost |
|----------|------|
| 🚿 Shower | 1 spoon |
| 🧴 Shower — Hair Wash | 1.5 spoons |
| 🚽 Bowel Movement | 0.5 spoons |
| 📺 Watching TV / Resting | 0 spoons |
| ✍️ Journaling | 0 spoons |
| 📝 Morning Pages | +1 recovery |
| 🙏 Gratitude Journal | +0.5 recovery |
| 🧘‍♀️ Meditation | +1 recovery |
| 🛋️ Restorative / Yin Yoga | +1 recovery |
| 🐕 Time with Charlie | +1 recovery |
| 🌳 Outdoor / Nature Time | +1 recovery |
| 📖 Reading — Fiction | +1 recovery |
| 📚 Reading — Nonfiction | +0.5 recovery |
| 🎵 Music — Favorite Artists | +1 recovery |
| 🎧 Music — Other Playlists | +0.5 recovery |
| 📻 Music — Radio | +0.5 recovery |
| 🧩 Puzzle | +0.5 recovery |
| 💆 Massage | +2 recovery |
| 😴 Nap | +1 recovery |
| 🌙 Full Night Sleep | +5 recovery |

---

## Sample Data
Settings → **"Load Sample Data"** loads 3 days of realistic entries including a PT + CMT class crash day, recovery day, and light activity day — so you can see how everything looks before you have real data.
