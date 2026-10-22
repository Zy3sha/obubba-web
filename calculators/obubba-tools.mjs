// OBubba free-tools engine. Shared by the build (prerendered tables in the HTML)
// and the browser (the live calculators, served as /tools/obubba-tools.mjs).
//
// The numbers are a straight port of the app's own engine so the website never
// disagrees with what OBubba shows a parent:
//   wake windows, nap profile, bedtime bounds  <- lib/core/engine/sleep_tables.dart
//   WHO growth percentiles (LMS)               <- lib/core/engine/growth.dart
// Pure functions, no DOM, no dependencies.

export const WEEKS_PER_MONTH = 4.33;

// [maxMonths, minWW, maxWW] (minutes). Same table as _wwStages.
const WW_STAGES = [
  [1.39, 30, 90],
  [3, 45, 90],
  [5, 75, 120],
  [7, 120, 180],
  [9, 150, 210],
  [12, 180, 240],
  [16, 195, 240],
  [19, 300, 360],
  [36, 300, 360],
  [48, 360, 480],
  [9999, 420, 720],
];

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export function wakeWindow(ageWeeks) {
  if (!(ageWeeks >= 0)) return { min: 30, max: 90 };
  const months = ageWeeks / WEEKS_PER_MONTH;
  let idx = WW_STAGES.findIndex((s) => months < s[0]);
  if (idx < 0) idx = WW_STAGES.length - 1;
  let min = WW_STAGES[idx][1];
  let max = WW_STAGES[idx][2];
  // Blend +/- 2 weeks around a stage edge so there is no cliff at a birthday.
  if (idx < WW_STAGES.length - 1) {
    const weeksUntil = (WW_STAGES[idx][0] - months) * WEEKS_PER_MONTH;
    if (weeksUntil <= 2 && weeksUntil >= 0) {
      const nxt = WW_STAGES[idx + 1];
      const blend = clamp((2 - weeksUntil) / 4, 0, 0.5);
      min = Math.round(min * (1 - blend) + nxt[1] * blend);
      max = Math.round(max * (1 - blend) + nxt[2] * blend);
    }
  }
  if (idx > 0) {
    const weeksSince = (months - WW_STAGES[idx - 1][0]) * WEEKS_PER_MONTH;
    if (weeksSince >= 0 && weeksSince <= 2) {
      const prev = WW_STAGES[idx - 1];
      const blend = clamp((2 - weeksSince) / 4, 0, 0.5);
      min = Math.round(min * (1 - blend) + prev[1] * blend);
      max = Math.round(max * (1 - blend) + prev[2] * blend);
    }
  }
  return { min, max };
}

export function napProfile(ageWeeks) {
  const w = ageWeeks;
  const months = w / WEEKS_PER_MONTH;
  const p = (expectedNaps, napMin, napMax, totalMin, totalMax) => ({ expectedNaps, napMin, napMax, totalMin, totalMax });
  if (!(w >= 0)) return p(3, 30, 90, 120, 240);
  if (w < 6) return p(6, 20, 60, 240, 360);
  if (w < 8) return p(5, 25, 70, 220, 340);
  if (months < 3) return p(4, 30, 90, 180, 300);
  if (months < 5) return p(w < 18 ? 4 : 3, 40, 90, 150, 240);
  if (months < 7) return p(3, 45, 120, 120, 240);
  if (months < 9) return p(w >= 28 && w <= 31 ? 3 : 2, 60, 120, 120, 210);
  if (months < 12) return p(2, 60, 120, 120, 180);
  if (months < 15) return p(2, 50, 110, 120, 180);
  if (w < 78) return p(w >= 63 && w <= 68 ? 2 : 1, 60, 120, 120, 180);
  return p(1, 60, 180, 120, 180);
}

export function bedtimeBounds(ageWeeks) {
  const months = ageWeeks / WEEKS_PER_MONTH;
  if (months < 3) return { floor: 17 * 60, ceiling: 21 * 60 };
  if (months >= 18) return { floor: 18 * 60 + 30, ceiling: 20 * 60 };
  return { floor: 18 * 60, ceiling: 20 * 60 };
}

// Total sleep per 24h (hours). AASM consensus (Paruthi 2016) for 4m+, NHS/NSF
// newborn guidance below that. Night share is the typical split, not a target.
const SLEEP_NEEDS = [
  { fromM: 0, toM: 3, total: [14, 17], night: [8, 9] },
  { fromM: 3, toM: 4, total: [12, 16], night: [9, 10] },
  { fromM: 4, toM: 12, total: [12, 16], night: [10, 12] },
  { fromM: 12, toM: 24, total: [11, 14], night: [10, 12] },
  { fromM: 24, toM: 61, total: [10, 13], night: [10, 11.5] },
];
export function sleepNeeds(ageMonths) {
  const row = SLEEP_NEEDS.find((r) => ageMonths >= r.fromM && ageMonths < r.toM) || SLEEP_NEEDS[SLEEP_NEEDS.length - 1];
  const weeks = Math.round(ageMonths * WEEKS_PER_MONTH);
  const prof = napProfile(weeks);
  return { total: row.total, night: row.night, dayMinutes: [prof.totalMin, prof.totalMax], naps: prof.expectedNaps };
}

// A sample day that LANDS on an age-safe bedtime: windows lengthen through the
// day (the first is the shortest), the last nap of a 3+ nap day is a catnap, and
// the bedtime is clamped to the age bounds. If the clamp moves bedtime, the
// difference is spread back across the awake windows (never below the age min).
// Typical bedtime of the babies who sleep well in OBubba's own logs
// (goodSleeperProfile in sleep_tables.dart), used as the aim for a sample day.
function targetBedtime(ageWeeks) {
  const m = ageWeeks / WEEKS_PER_MONTH;
  if (m < 3) return 20 * 60;
  if (m < 6) return 19 * 60 + 30;
  if (m < 18) return 19 * 60 + 15;
  return 19 * 60 + 30;
}

function buildPlan(ww, prof, n, wakeMin) {
  const windows = [];
  for (let i = 0; i <= n; i++) {
    const t = n === 0 ? 1 : i / n;
    windows.push(Math.round(ww.min + (ww.max - ww.min) * (0.25 + 0.75 * t)));
  }
  const targetTotal = (prof.totalMin + prof.totalMax) / 2;
  const naps = [];
  for (let i = 0; i < n; i++) {
    const catnap = n >= 3 && i === n - 1;
    const base = catnap ? Math.min(40, prof.napMax) : targetTotal / (n >= 3 ? n - 0.5 : n);
    naps.push(Math.round(clamp(base, catnap ? Math.max(20, prof.napMin - 15) : prof.napMin, prof.napMax) / 5) * 5);
  }
  return { windows, naps };
}

// Move bedtime by `shift` minutes, spread over the awake windows, never taking
// a window outside the age range. Returns the shift that could not be placed.
function spreadShift(windows, shift, ww) {
  let remaining = shift;
  for (let pass = 0; pass < 6 && Math.abs(remaining) > 1; pass++) {
    const each = remaining / windows.length;
    for (let i = 0; i < windows.length; i++) {
      const next = clamp(Math.round(windows[i] + each), ww.min, ww.max);
      remaining -= next - windows[i];
      windows[i] = next;
    }
  }
  return remaining;
}

export function sampleDay(ageWeeks, wakeMin = 7 * 60) {
  const ww = wakeWindow(ageWeeks);
  const prof = napProfile(ageWeeks);
  const bounds = bedtimeBounds(ageWeeks);
  const target = clamp(targetBedtime(ageWeeks), bounds.floor, bounds.ceiling);
  const months = ageWeeks / WEEKS_PER_MONTH;
  const sum = (xs) => xs.reduce((a, b) => a + b, 0);
  let n = prof.expectedNaps;
  let { windows, naps } = buildPlan(ww, prof, n, wakeMin);
  let left = spreadShift(windows, target - (wakeMin + sum(windows) + sum(naps)), ww);
  // A young baby whose windows are already at the age max still runs out of day
  // before bedtime: the real answer is one more short catnap, not a 5pm bedtime.
  while (left > 30 && months < 9 && n < prof.expectedNaps + 2) {
    n += 1;
    ({ windows, naps } = buildPlan(ww, prof, n, wakeMin));
    left = spreadShift(windows, target - (wakeMin + sum(windows) + sum(naps)), ww);
  }
  const napTotal = sum(naps);
  let bed = clamp(wakeMin + sum(windows) + napTotal, bounds.floor, bounds.ceiling);
  bed = Math.round(bed / 5) * 5;
  const items = [{ type: 'wake', at: wakeMin }];
  let t = wakeMin;
  for (let i = 0; i < n; i++) {
    t += windows[i];
    items.push({ type: 'nap', at: t, end: t + naps[i], dur: naps[i], index: i + 1, catnap: n >= 3 && i === n - 1, awakeBefore: windows[i] });
    t += naps[i];
  }
  items.push({ type: 'bed', at: Math.round(bed), awakeBefore: windows[n] });
  return { items, wakeWindow: ww, profile: prof, bounds, daySleep: napTotal };
}

// Bedtime from the end of the last nap: last window of the day, inside bounds.
export function bedtimeFrom(ageWeeks, lastNapEndMin) {
  const ww = wakeWindow(ageWeeks);
  const b = bedtimeBounds(ageWeeks);
  const earliest = clamp(lastNapEndMin + ww.min, b.floor, b.ceiling);
  const latest = clamp(lastNapEndMin + ww.max, b.floor, b.ceiling);
  const ideal = clamp(lastNapEndMin + Math.round((ww.min + ww.max * 3) / 4), b.floor, b.ceiling);
  return { earliest, ideal, latest, bounds: b, ww };
}

// Corrected (adjusted) age for babies born before 37 weeks. Used for development
// and sleep expectations up to about 2 years, per NHS / AAP practice.
export function correctedAge(birthDate, dueDate, today = new Date()) {
  const day = 86400000;
  const actualDays = Math.floor((today - birthDate) / day);
  const earlyDays = Math.max(0, Math.round((dueDate - birthDate) / day));
  const correctedDays = Math.max(0, actualDays - earlyDays);
  const gestWeeks = 40 - earlyDays / 7;
  return { actualDays, earlyDays, correctedDays, gestationWeeks: Math.round(gestWeeks * 10) / 10, useCorrected: earlyDays >= 21 && correctedDays < 730 };
}

// Formula guide: NHS typical range 150 to 200 ml per kg per day for the first
// months, levelling off near 1 litre a day; fewer, bigger feeds with age.
export function formulaGuide(weightKg, ageMonths) {
  const feeds = ageMonths < 1 ? [7, 8] : ageMonths < 2 ? [6, 7] : ageMonths < 4 ? [5, 6] : ageMonths < 6 ? [5, 5] : [4, 5];
  let lo = weightKg * 150;
  let hi = weightKg * 200;
  if (ageMonths >= 6) { lo = 500; hi = 700; }
  lo = Math.min(lo, 1000);
  hi = Math.min(hi, 1000);
  const r10 = (x) => Math.round(x / 10) * 10;
  return { dailyMl: [r10(lo), r10(hi)], feedsPerDay: feeds, perFeedMl: [r10(lo / feeds[1]), r10(hi / feeds[0])], solidsStage: ageMonths >= 6 };
}

export function dueDateFromLmp(lmp, cycleDays = 28) {
  const day = 86400000;
  const due = new Date(lmp.getTime() + (280 + (cycleDays - 28)) * day);
  return due;
}
export function pregnancyWeek(lmp, today = new Date(), cycleDays = 28) {
  const days = Math.floor((today - lmp) / 86400000) - (cycleDays - 28);
  return { weeks: Math.floor(days / 7), days: ((days % 7) + 7) % 7 };
}

// ---- WHO growth (0 to 24 months), LMS rows [month, L, M, S] ----
const WHO = {
  weight: {
    boy: [[0,0.3487,3.3464,0.14602],[1,0.2297,4.4709,0.13395],[2,0.1970,5.5675,0.12979],[3,0.1738,6.3762,0.12703],[4,0.1553,7.0023,0.12512],[5,0.1395,7.5105,0.12357],[6,0.1257,7.9340,0.12232],[7,0.1134,8.2970,0.12138],[8,0.1021,8.6151,0.12060],[9,0.0917,8.9014,0.12007],[10,0.0822,9.1649,0.11972],[11,0.0734,9.4122,0.11953],[12,0.0650,9.6479,0.11953],[13,0.0569,9.8749,0.11961],[14,0.0492,10.0953,0.11980],[15,0.0417,10.3108,0.12007],[16,0.0345,10.5228,0.12039],[17,0.0275,10.7319,0.12076],[18,0.0208,10.9385,0.12118],[19,0.0143,11.1430,0.12164],[20,0.0079,11.3462,0.12214],[21,0.0017,11.5480,0.12268],[22,-0.0043,11.7490,0.12326],[23,-0.0102,11.9493,0.12386],[24,-0.0160,12.1515,0.12450]],
    girl: [[0,0.3809,3.2322,0.14171],[1,0.1714,4.1873,0.13724],[2,0.0962,5.1282,0.13000],[3,0.0402,5.8458,0.12619],[4,-0.0050,6.4237,0.12402],[5,-0.0430,6.8985,0.12274],[6,-0.0756,7.2970,0.12204],[7,-0.1039,7.6422,0.12178],[8,-0.1288,7.9487,0.12181],[9,-0.1507,8.2254,0.12211],[10,-0.1700,8.4800,0.12262],[11,-0.1872,8.7192,0.12331],[12,-0.2024,8.9481,0.12418],[13,-0.2158,9.1699,0.12519],[14,-0.2278,9.3870,0.12632],[15,-0.2384,9.6008,0.12757],[16,-0.2478,9.8124,0.12893],[17,-0.2562,10.0226,0.13039],[18,-0.2637,10.2315,0.13193],[19,-0.2703,10.4393,0.13354],[20,-0.2762,10.6464,0.13522],[21,-0.2814,10.8534,0.13696],[22,-0.2860,11.0608,0.13875],[23,-0.2902,11.2688,0.14058],[24,-0.2941,11.4775,0.14244]],
  },
  length: {
    boy: [[0,1,49.8842,0.03795],[1,1,54.7244,0.03557],[2,1,58.4249,0.03424],[3,1,61.4292,0.03328],[4,1,63.8860,0.03257],[5,1,65.9026,0.03204],[6,1,67.6236,0.03165],[7,1,69.1645,0.03139],[8,1,70.5994,0.03124],[9,1,71.9687,0.03117],[10,1,73.2812,0.03118],[11,1,74.5388,0.03125],[12,1,75.7488,0.03137],[13,1,76.9186,0.03154],[14,1,78.0497,0.03174],[15,1,79.1458,0.03197],[16,1,80.2113,0.03222],[17,1,81.2487,0.03248],[18,1,82.2587,0.03277],[19,1,83.2418,0.03307],[20,1,84.1996,0.03337],[21,1,85.1348,0.03369],[22,1,86.0477,0.03401],[23,1,86.9412,0.03433],[24,1,87.8161,0.03466]],
    girl: [[0,1,49.1477,0.03790],[1,1,53.6872,0.03614],[2,1,57.0673,0.03508],[3,1,59.8029,0.03428],[4,1,62.0899,0.03362],[5,1,64.0301,0.03310],[6,1,65.7311,0.03272],[7,1,67.2873,0.03246],[8,1,68.7498,0.03229],[9,1,70.1435,0.03222],[10,1,71.4818,0.03222],[11,1,72.7710,0.03229],[12,1,74.0153,0.03241],[13,1,75.2172,0.03259],[14,1,76.3817,0.03280],[15,1,77.5099,0.03305],[16,1,78.6055,0.03331],[17,1,79.6713,0.03360],[18,1,80.7079,0.03390],[19,1,81.7182,0.03422],[20,1,82.7065,0.03455],[21,1,83.6742,0.03489],[22,1,84.6235,0.03524],[23,1,85.5573,0.03560],[24,1,86.4767,0.03596]],
  },
  head: {
    boy: [[0,1,34.46,0.03686],[1,1,37.28,0.03133],[2,1,39.13,0.02997],[3,1,40.51,0.02918],[4,1,41.63,0.02868],[5,1,42.56,0.02837],[6,1,43.30,0.02817],[7,1,43.95,0.02804],[8,1,44.53,0.02796],[9,1,45.04,0.02792],[10,1,45.50,0.02790],[11,1,45.91,0.02790],[12,1,46.28,0.02791],[13,1,46.61,0.02793],[14,1,46.90,0.02795],[15,1,47.17,0.02798],[16,1,47.41,0.02800],[17,1,47.63,0.02803],[18,1,47.82,0.02806],[19,1,48.00,0.02808],[20,1,48.17,0.02811],[21,1,48.32,0.02813],[22,1,48.46,0.02815],[23,1,48.59,0.02817],[24,1,48.72,0.02819]],
    girl: [[0,1,33.88,0.03496],[1,1,36.55,0.03065],[2,1,38.25,0.02997],[3,1,39.53,0.02949],[4,1,40.58,0.02916],[5,1,41.45,0.02894],[6,1,42.17,0.02880],[7,1,42.78,0.02870],[8,1,43.31,0.02864],[9,1,43.78,0.02860],[10,1,44.19,0.02858],[11,1,44.55,0.02857],[12,1,44.87,0.02857],[13,1,45.16,0.02858],[14,1,45.42,0.02859],[15,1,45.65,0.02860],[16,1,45.86,0.02862],[17,1,46.05,0.02863],[18,1,46.22,0.02865],[19,1,46.38,0.02866],[20,1,46.53,0.02868],[21,1,46.67,0.02869],[22,1,46.80,0.02871],[23,1,46.92,0.02872],[24,1,47.04,0.02873]],
  },
};

function normalCdf(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const poly = t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const p = 1 - (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z) * poly;
  return z >= 0 ? p : 1 - p;
}

function lmsAt(table, ageMonths) {
  const a = clamp(ageMonths, 0, 24);
  const lo = Math.floor(a);
  const hi = Math.min(lo + 1, 24);
  const f = a - lo;
  const r0 = table[lo];
  const r1 = table[hi];
  return { l: r0[1] + (r1[1] - r0[1]) * f, m: r0[2] + (r1[2] - r0[2]) * f, s: r0[3] + (r1[3] - r0[3]) * f };
}

export function growthPercentile(measure, sex, ageMonths, value) {
  const table = WHO[measure]?.[sex];
  if (!table || !(value > 0)) return null;
  const { l, m, s } = lmsAt(table, ageMonths);
  let z = Math.abs(l) < 0.0001 ? Math.log(value / m) / s : (Math.pow(value / m, l) - 1) / (l * s);
  z = clamp(z, -3.5, 3.5);
  return { percentile: Math.round(normalCdf(z) * 1000) / 10, median: Math.round(m * 100) / 100, z: Math.round(z * 100) / 100 };
}

// Common sleep shake-ups by age (months). Not a diagnosis: the usual windows
// in which many families see unsettled sleep, and what tends to help.
export const SLEEP_SHAKEUPS = [
  { key: 'm4', from: 3, to: 5 },
  { key: 'm6', from: 5.5, to: 7 },
  { key: 'm8', from: 8, to: 10 },
  { key: 'm12', from: 11, to: 13 },
  { key: 'm18', from: 17, to: 19 },
  { key: 'm24', from: 23, to: 25 },
];
export function shakeupsNear(ageMonths) {
  return SLEEP_SHAKEUPS.map((s) => ({ ...s, status: ageMonths >= s.from && ageMonths <= s.to ? 'now' : ageMonths < s.from ? 'ahead' : 'past' }));
}

// Nap transitions. Ready signs over ~2 weeks, not one bad day.
export const NAP_TRANSITIONS = [
  { key: '4to3', from: 3, to: 5, fromNaps: 4 },
  { key: '3to2', from: 6, to: 9, fromNaps: 3 },
  { key: '2to1', from: 13, to: 18, fromNaps: 2 },
  { key: '1to0', from: 30, to: 48, fromNaps: 1 },
];
export function transitionReadiness(ageMonths, currentNaps, signsCount) {
  const tr = NAP_TRANSITIONS.find((t) => t.fromNaps === currentNaps);
  if (!tr) return { verdict: 'none' };
  const inRange = ageMonths >= tr.from - 0.5;
  if (!inRange) return { verdict: 'early', tr };
  if (signsCount >= 2) return { verdict: 'ready', tr };
  if (signsCount === 1) return { verdict: 'maybe', tr };
  return { verdict: 'notyet', tr };
}

export function fmtClock(min, h24 = false) {
  const m = ((Math.round(min) % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, '0');
  if (h24) return `${String(h).padStart(2, '0')}:${mm}`;
  const ap = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mm}${ap}`;
}
export function fmtDur(min) {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}
