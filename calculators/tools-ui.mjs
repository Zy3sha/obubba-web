// Browser glue for the free tools. Reads the page's translated strings from
// #g-i18n, runs the shared engine (/tools/obubba-tools.mjs) and renders results.
// Nothing typed is stored or sent anywhere.
import * as E from '/calculators/obubba-tools.mjs';

const I = JSON.parse(document.getElementById('g-i18n')?.textContent || '{}');
const ui = I.ui || {};
const tool = I.tool || {};
const out = tool.out || {};
const H24 = I.lang && I.lang !== 'en';
const fill = (s, v) => String(s || '').replace(/\{(\w+)\}/g, (_, k) => (v[k] ?? ''));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const clock = (m) => E.fmtClock(m, H24);
const toMin = (v) => { const [h, m] = String(v || '').split(':').map(Number); return Number.isFinite(h) ? h * 60 + (m || 0) : null; };
const big = (label, value, sub = '') => `<div class="g-stat"><span>${esc(label)}</span><strong>${value}</strong>${sub ? `<small>${sub}</small>` : ''}</div>`;
const range = (a, b, unit = '') => `${a}${unit} ${esc(ui.to)} ${b}${unit}`;
const parseDate = (v) => (v ? new Date(`${v}T12:00:00`) : null);
const fmtDate = (d) => d.toLocaleDateString(I.lang || 'en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const ageStr = (days) => { const m = Math.floor(days / 30.44); const w = Math.floor((days - m * 30.44) / 7); return m > 0 ? `${m} ${ui.ageMonths}${w ? `, ${w} ${ui.ageWeeks}` : ''}` : `${Math.floor(days / 7)} ${ui.ageWeeks}`; };

const R = {
  'wake-window-calculator'(f) {
    const w = +f.age.value; const ww = E.wakeWindow(w); const p = E.napProfile(w);
    return `<div class="g-stats">${big(out.range, range(E.fmtDur(ww.min), E.fmtDur(ww.max)))}${big(out.naps, String(p.expectedNaps))}</div><p>${esc(out.first)}</p>`;
  },
  'baby-sleep-schedule-maker'(f) {
    const w = +f.age.value; const d = E.sampleDay(w, toMin(f.wake.value) ?? 420);
    const rows = d.items.map((i) => {
      if (i.type === 'wake') return `<li class="g-tl-wake"><b>${clock(i.at)}</b> ${esc(ui.wake)}</li>`;
      if (i.type === 'nap') return `<li class="g-tl-awake">${esc(fill(ui.awakeFor, { d: E.fmtDur(i.awakeBefore) }))}</li><li class="g-tl-nap"><b>${clock(i.at)} ${esc(ui.to)} ${clock(i.end)}</b> ${esc(i.catnap ? ui.catnap : fill(ui.nap, { n: i.index }))} <small>${esc(fill(ui.asleepFor, { d: E.fmtDur(i.dur) }))}</small></li>`;
      return `<li class="g-tl-awake">${esc(fill(ui.awakeFor, { d: E.fmtDur(i.awakeBefore) }))}</li><li class="g-tl-bed"><b>${clock(i.at)}</b> ${esc(ui.bedtime)}</li>`;
    }).join('');
    return `<h3>${esc(out.title)}</h3><ol class="g-timeline">${rows}</ol><p class="g-hint">${esc(out.note)}</p>`;
  },
  'bedtime-calculator'(f) {
    const r = E.bedtimeFrom(+f.age.value, toMin(f.last.value) ?? 930);
    return `<div class="g-stats">${big(out.earliest, clock(r.earliest))}${big(out.ideal, clock(r.ideal))}${big(out.latest, clock(r.latest))}</div><p>${esc(out.note)}</p>`;
  },
  'baby-sleep-needs-calculator'(f) {
    const s = E.sleepNeeds(+f.age.value / E.WEEKS_PER_MONTH);
    return `<div class="g-stats">${big(out.total, range(s.total[0], s.total[1]), esc(ui.hours))}${big(out.night, range(s.night[0], s.night[1]), esc(ui.hours))}${big(out.day, range(E.fmtDur(s.dayMinutes[0]), E.fmtDur(s.dayMinutes[1])), `${esc(out.naps)} ${s.naps} ${esc(ui.naps)}`)}</div>`;
  },
  'sleep-regression-checker'(f) {
    const list = E.shakeupsNear(+f.age.value / E.WEEKS_PER_MONTH);
    const now = list.filter((s) => s.status === 'now'); const ahead = list.filter((s) => s.status === 'ahead').slice(0, 1);
    const card = (s, tag) => { const [age, what, helps] = tool.shakeups[s.key]; return `<article class="g-res-card"><span class="g-tag">${esc(tag)}</span><h3>${esc(age)}</h3><p>${esc(what)}</p><p><b>${esc(helps)}</b></p></article>`; };
    return (now.length ? now.map((s) => card(s, out.now)).join('') : `<p>${esc(out.none)}</p>`) + ahead.map((s) => card(s, out.ahead)).join('');
  },
  'nap-transition-checker'(f) {
    const signs = f.querySelectorAll('input[name=sign]:checked').length;
    const r = E.transitionReadiness(+f.age.value / E.WEEKS_PER_MONTH, +f.naps.value, signs);
    if (r.verdict === 'none') return `<p>${esc(out.none)}</p>`;
    const to = r.tr.fromNaps - 1;
    const body = { ready: out.readyBody, maybe: out.maybeBody, notyet: out.notyetBody, early: out.earlyBody }[r.verdict];
    return `<article class="g-res-card"><span class="g-tag">${esc(tool.transitions[r.tr.key])}</span><h3>${esc(out[r.verdict])}</h3><p>${esc(fill(body, { to, from: r.tr.from }))}</p></article>`;
  },
  'formula-amount-calculator'(f) {
    let kg = parseFloat(f.weight.value); if (!(kg > 0)) return '';
    if (f.unit.value === 'lb') kg *= 0.4536;
    const g = E.formulaGuide(kg, +f.age.value / E.WEEKS_PER_MONTH); const oz = (ml) => Math.round(ml / 29.57);
    return `<div class="g-stats">${big(out.daily, range(g.dailyMl[0], g.dailyMl[1], ' ml'), range(oz(g.dailyMl[0]), oz(g.dailyMl[1]), ' oz'))}${big(out.feeds, range(g.feedsPerDay[0], g.feedsPerDay[1]))}${big(out.perFeed, range(g.perFeedMl[0], g.perFeedMl[1], ' ml'), range(oz(g.perFeedMl[0]), oz(g.perFeedMl[1]), ' oz'))}</div>${g.solidsStage ? `<p>${esc(out.solids)}</p>` : ''}<p class="g-hint">${esc(out.note)}</p>`;
  },
  'corrected-age-calculator'(f) {
    const b = parseDate(f.birth.value); const d = parseDate(f.due.value); if (!b || !d) return '';
    const r = E.correctedAge(b, d);
    const early = Math.round(r.earlyDays / 7);
    return `<div class="g-stats">${big(out.actual, esc(ageStr(r.actualDays)))}${r.useCorrected ? big(out.corrected, esc(ageStr(r.correctedDays))) : ''}${early > 0 ? big(out.early, esc(fill(out.weeksEarly, { n: early }))) : ''}</div><p>${esc(r.useCorrected ? out.use : out.notNeeded)}</p>`;
  },
  'baby-growth-percentile-calculator'(f) {
    const m = +f.age.value / E.WEEKS_PER_MONTH; const sex = f.sex.value;
    const items = [['weight', ' kg'], ['length', ' cm'], ['head', ' cm']].map(([k, u]) => { const v = parseFloat(f[k].value); const r = E.growthPercentile(k, sex, m, v); return r ? big(out[k], esc(fill(out.pct, { p: Math.round(r.percentile) })), esc(fill(out.median, { m: r.median.toFixed(1) + u }))) : ''; }).join('');
    return items ? `<div class="g-stats">${items}</div><p class="g-hint">${esc(out.note)}</p>` : '';
  },
  'due-date-calculator'(f) {
    const lmp = parseDate(f.lmp.value); if (!lmp) return '';
    const cyc = Math.min(40, Math.max(21, +f.cycle.value || 28));
    const due = E.dueDateFromLmp(lmp, cyc); const wk = E.pregnancyWeek(lmp, new Date(), cyc);
    const tri = wk.weeks < 14 ? out.t1 : wk.weeks < 28 ? out.t2 : out.t3;
    return `<div class="g-stats">${big(out.due, esc(fmtDate(due)))}${wk.weeks >= 0 && wk.weeks < 43 ? big(out.week, esc(fill(out.weeksDays, { w: wk.weeks, d: wk.days }))) + big(out.trimester, esc(tri)) : ''}</div><p class="g-hint">${esc(out.note)}</p>`;
  },
  'night-waking-checker'(f) {
    const picked = new Set([...f.querySelectorAll('input[name=check]:checked')].map((i) => i.value));
    const months = +f.age.value / E.WEEKS_PER_MONTH;
    const hits = (tool.checks || []).filter(([id]) => picked.has(id) && !(id === 'feeds' && months < 6));
    if (!hits.length) return `<p>${esc(out.none)}</p>`;
    return `<h3>${esc(out.title)}</h3>${hits.map(([, , title, body]) => `<article class="g-res-card"><h3>${esc(title)}</h3><p>${esc(body)}</p></article>`).join('')}<p class="g-hint">${esc(out.more)}</p>`;
  },
};

const params = new URLSearchParams(location.search);
if (params.get('embed') === '1') document.documentElement.classList.add('g-embed');

// The form state lives in the URL, so a result can be shared or bookmarked.
function writeState(form) {
  const q = new URLSearchParams();
  for (const el of form.elements) {
    if (!el.name) continue;
    if (el.type === 'checkbox') { if (el.checked) q.append(el.name, el.value); } else if (el.value) q.set(el.name, el.value);
  }
  if (params.get('embed') === '1') q.set('embed', '1');
  history.replaceState(null, '', `${location.pathname}?${q}`);
}
function readState(form) {
  let any = false;
  for (const el of form.elements) {
    if (!el.name || !params.has(el.name)) continue;
    any = true;
    if (el.type === 'checkbox') el.checked = params.getAll(el.name).includes(el.value); else el.value = params.get(el.name);
  }
  return any;
}
function actions() {
  const canShare = !!navigator.share;
  return `<div class="g-share">${canShare ? `<button type="button" class="button secondary" data-act="share">${esc(ui.share)}</button>` : ''}<button type="button" class="button secondary" data-act="copy">${esc(ui.copyLink)}</button><button type="button" class="button secondary" data-act="print">${esc(ui.print)}</button></div>`;
}
const track = (name, slug) => { try { window.gtag?.('event', name, { tool: slug, lang: I.lang }); } catch {} };

document.querySelectorAll('form.g-form').forEach((form) => {
  const slug = form.dataset.tool; const box = form.parentElement.querySelector('.g-result');
  const run = (save) => { const html = R[slug]?.(form); if (!html) return; box.innerHTML = html + actions(); box.hidden = false; if (save) writeState(form); };
  form.addEventListener('submit', (e) => { e.preventDefault(); run(true); track('tool_use', slug); });
  // Live update once the parent has asked once, so changing an input re-plans instantly.
  form.addEventListener('change', () => { if (!box.hidden) run(true); });
  box.addEventListener('click', async (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act; if (!act) return;
    const link = location.href.replace(/[?&]embed=1/, '');
    if (act === 'share') { try { await navigator.share({ title: document.title, text: ui.shareText, url: link }); track('tool_share', slug); } catch {} }
    if (act === 'copy') { try { await navigator.clipboard.writeText(link); e.target.textContent = ui.linkCopied; track('tool_copy_link', slug); } catch {} }
    if (act === 'print') { track('tool_print', slug); window.print(); }
  });
  const restored = readState(form);
  if (restored || ['wake-window-calculator', 'baby-sleep-schedule-maker', 'baby-sleep-needs-calculator', 'sleep-regression-checker', 'bedtime-calculator'].includes(slug)) run(false);
});

document.querySelectorAll('.g-embed-copy').forEach((btn) => btn.addEventListener('click', async () => {
  const code = btn.parentElement.querySelector('.g-embed-code');
  try { await navigator.clipboard.writeText(code.value); } catch { code.select(); }
  btn.textContent = btn.dataset.done; track('tool_embed_copy', document.querySelector('form.g-form')?.dataset.tool);
}));
