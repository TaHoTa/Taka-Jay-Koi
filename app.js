import * as C from './config.js';
import { initStore, isDemo } from './store.js';
import { payments, validTrxId } from './payments.js';
import { T, CATS, PRESETS, THEMES, MONTHS, MONTHS_S, WDAYS, WDAYS_S, CHEERS, CAT_COLORS, EMOJI_GROUPS, FONTS_BN, FONTS_EN, DEVELOPER } from './i18n.js';
import { barChart, donut, ring } from './charts.js';
import { I } from './icons.js';

let store;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safe = (s, d) => { try { return JSON.parse(s) ?? d; } catch { return d; } };

/* ───────── state ───────── */
const S = {
  data: { entries: {}, deleted: {} }, entries: new Map(), dirty: new Set(), settings: null,
  user: null, profile: null, payments: [], unsub: [],
  view: 'home', period: null, year: null, chartTab: 'cat', exBig: false,
  sheet: null, syncing: false, lastSync: 0, preferRemote: false, px: innerWidth / 2, py: innerHeight / 2,
};
const LK = { data: 'tk_data', dirty: 'tk_dirty', settings: 'tk_settings', sdirty: 'tk_sdirty' };
let P; // prefs = S.settings.prefs

/* ───────── text & numbers ───────── */
const t = (k, v = {}) => String(T[P.lang]?.[k] ?? T.en[k] ?? k).replace(/\{(\w+)\}/g, (_, x) => v[x] ?? '');
const BN = '০১২৩৪৫৬৭৮৯';
const bnDigits = () => (P.digits ?? (P.lang === 'bn' ? 'bn' : 'en')) === 'bn';
const dg = s => bnDigits() ? String(s).replace(/\d/g, d => BN[d]) : String(s);
const nf = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });
const fmt = n => dg(nf.format(Math.round((n || 0) * 100) / 100));
const tk = n => '৳' + fmt(n);
const nShort = n => tkShort(n).replace('৳', '');
const tkShort = n => n >= 100000 ? '৳' + dg((n / 100000).toFixed(n >= 1000000 ? 0 : 1)) + (P.lang === 'bn' ? ' লাখ' : 'L') : n >= 1000 ? '৳' + dg((n / 1000).toFixed(n >= 10000 ? 0 : 1)) + 'k' : tk(Math.round(n));

/* ───────── dates ───────── */
const pad = n => String(n).padStart(2, '0');
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const parse = s => { const [y, m, d] = s.split('-').map(Number); return { y, m, d }; };
const toStr = (y, m, d) => { const x = new Date(Date.UTC(y, m - 1, d)); return `${x.getUTCFullYear()}-${pad(x.getUTCMonth() + 1)}-${pad(x.getUTCDate())}`; };
const addDays = (s, n) => { const { y, m, d } = parse(s); return toStr(y, m, d + n); };
const dow = s => { const { y, m, d } = parse(s); return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); };
const diffDays = (a, b) => { const A = parse(a), B = parse(b); return Math.round((Date.UTC(B.y, B.m - 1, B.d) - Date.UTC(A.y, A.m - 1, A.d)) / 864e5); };
const dim = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const dShort = s => { const { m, d } = parse(s); return `${dg(d)} ${MONTHS_S[P.lang][m - 1]}`; };
const dLong = s => { const { y, m, d } = parse(s); return `${WDAYS[P.lang][dow(s)]}, ${dg(d)} ${MONTHS[P.lang][m - 1]}` + (y !== new Date().getFullYear() ? ` ${dg(y)}` : ''); };
const dRel = s => { const td = todayStr(); if (s === td) return t('today'); if (s === addDays(td, -1)) return t('yesterday'); return dLong(s); };

const mStart = () => S.settings?.monthStart || 1;
const lateStart = () => mStart() > 15;
function shiftPeriod(pk, n) { const [y, m] = pk.split('-').map(Number); const p = new Date(Date.UTC(y, m - 1 + n, 1)); return `${p.getUTCFullYear()}-${pad(p.getUTCMonth() + 1)}`; }
function periodOf(s) { const { y, m, d } = parse(s); return shiftPeriod(`${y}-${pad(m)}`, (d >= mStart() ? 0 : -1) + (lateStart() ? 1 : 0)); }
function periodRange(pk) { const [y, m] = (lateStart() ? shiftPeriod(pk, -1) : pk).split('-').map(Number); return [toStr(y, m, mStart()), addDays(toStr(y, m + 1, mStart()), -1)]; }
const periodTitle = pk => { const [y, m] = pk.split('-').map(Number); return `${MONTHS[P.lang][m - 1]} ${dg(y)}`; };
const periodSub = pk => { if (mStart() === 1) return ''; const [a, b] = periodRange(pk); return `${dShort(a)} – ${dShort(b)}`; };

/* ───────── data helpers ───────── */
const all = () => [...S.entries.values()];
const sum = a => a.reduce((s, e) => s + e.amt, 0);
const inRange = (a, b, exBig = false) => all().filter(e => e.date >= a && e.date <= b && !(exBig && e.big));
const inPeriod = (pk, exBig = false) => { const [a, b] = periodRange(pk); return inRange(a, b, exBig); };
const byCat = arr => { const m = new Map(); arr.forEach(e => m.set(e.cat, (m.get(e.cat) || 0) + e.amt)); return m; };
const cats = () => S.meta?.cats || S.settings.cats;
const tgts = () => (S.meta ? (S.meta.targets ||= []) : S.settings.targets);
const setTgts = v => { if (S.meta) S.meta.targets = v; else S.settings.targets = v; };
const memberName = uid => { if (uid && uid === S.user?.uid) return t('me'); const m = S.meta?.members?.find(x => x.uid === uid); return m ? m.email.split('@')[0] : '—'; };
const visCats = () => cats().filter(c => !c.hidden);
// free plan: up to FREE_CATS categories (hidden ones count too); more needs Pro
const catLimitHit = () => !isPro() && cats().length >= C.FREE_CATS;
const cat = id => cats().find(c => c.id === id) || { id, bn: 'মুছে ফেলা', en: 'Removed', emoji: '❔', color: '#9CA3AF' };
const catName = c => P.lang === 'bn' ? (c.bn || c.en) : (c.en || c.bn);
const sortEntries = arr => arr.sort((a, b) => b.date.localeCompare(a.date) || (b.created || 0) - (a.created || 0));
const newId = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));

/* ───────── local storage (the app works fully offline, no account needed) ───────── */
function defaultSettings() {
  return {
    v: 2, cats: CATS.map(c => ({ ...c })), targets: [], monthStart: 1, recurring: [],
    prefs: { lang: 'bn', theme: 'red', mode: 'system', digits: null },
    seen: { badges: 0 }, firstOpen: Date.now(), updatedAt: 0,
  };
}
function loadLocal() {
  const d = safe(localStorage.getItem(LK.data), null);
  S.data = d && d.entries ? d : { entries: {}, deleted: {} };
  S.data.deleted ||= {};
  S.dirty = new Set(safe(localStorage.getItem(LK.dirty), []));
  S.settings = safe(localStorage.getItem(LK.settings), null) || defaultSettings();
  const st = S.settings;
  st.cats ||= CATS.map(c => ({ ...c })); st.targets ||= []; st.recurring ||= []; st.seen ||= { badges: 0 };
  st.prefs = Object.assign({ lang: 'bn', theme: 'red', mode: 'system', digits: null }, st.prefs);
  if (!THEMES.find(x => x.id === st.prefs.theme)) st.prefs.theme = 'red';
  st.firstOpen ||= Date.now();
  P = st.prefs;
  S.entries = new Map(Object.entries(S.data.entries));
  if (!localStorage.getItem(LK.settings)) localStorage.setItem(LK.settings, JSON.stringify(st));
}
const bkeys = id => id === 'me' ? { data: LK.data, dirty: LK.dirty } : { data: 'tk_b_' + id, dirty: 'tk_bd_' + id, meta: 'tk_bm_' + id, mdirty: 'tk_bmd_' + id };
let persistT = 0;
function persist() {
  clearTimeout(persistT);
  const k = bkeys(S.bookId), data = S.data, dirty = [...S.dirty];
  persistT = setTimeout(() => {
    localStorage.setItem(k.data, JSON.stringify(data));
    localStorage.setItem(k.dirty, JSON.stringify(dirty));
  }, 50);
}
function flushPersist() { clearTimeout(persistT); const k = bkeys(S.bookId); localStorage.setItem(k.data, JSON.stringify(S.data)); localStorage.setItem(k.dirty, JSON.stringify([...S.dirty])); }
function saveMeta() { if (!S.meta) return; S.meta.updatedAt = Date.now(); const k = bkeys(S.bookId); localStorage.setItem(k.meta, JSON.stringify(S.meta)); localStorage.setItem(k.mdirty, '1'); }
// switch between my own book and a shared family book
function switchBook(id, quiet = false) {
  if (S.bookId) flushPersist();
  const k = bkeys(id);
  const d = safe(localStorage.getItem(k.data), null);
  S.bookId = id;
  S.data = d && d.entries ? d : { entries: {}, deleted: {} }; S.data.deleted ||= {};
  S.dirty = new Set(safe(localStorage.getItem(k.dirty), []));
  S.meta = id === 'me' ? null : (safe(localStorage.getItem(k.meta), null) || { id, name: (S.books || []).find(b => b.id === id)?.name || t('sharedBook'), cats: S.settings.cats.map(c => ({ ...c })), targets: [], members: [] });
  S.entries = new Map(Object.entries(S.data.entries));
  localStorage.setItem('tk_active_book', id);
  if (!quiet) { closeSheet(); render(); sync(); toast(id === 'me' ? t('myBook') : '📒 ' + S.meta.name); }
}
function saveSettings() {
  if (S.meta) saveMeta();
  S.settings.updatedAt = Date.now();
  localStorage.setItem(LK.settings, JSON.stringify(S.settings));
  localStorage.setItem(LK.sdirty, '1');
  scheduleSync();
}
function setPref(k, v) { P[k] = v; saveSettings(); applyPrefs(); }
function loadFont(f) {
  if (!f?.g || document.getElementById('gf-' + f.id)) return;
  const l = document.createElement('link'); l.id = 'gf-' + f.id; l.rel = 'stylesheet';
  l.href = `https://fonts.googleapis.com/css2?family=${f.g}&display=swap`; document.head.appendChild(l);
}
function fontStack() {
  const bn = FONTS_BN.find(f => f.id === P.fontBn) || FONTS_BN[0], en = FONTS_EN.find(f => f.id === P.fontEn) || FONTS_EN[0];
  loadFont(bn); loadFont(en);
  // English font first (it has no Bangla letters), so Bangla text falls through to the Bangla font
  return `${en.css}, ${bn.css}, 'Hind Siliguri', sans-serif`;
}
function applyPrefs() {
  const th = THEMES.find(x => x.id === P.theme) || THEMES[0];
  const r = document.documentElement;
  r.style.setProperty('--font', fontStack());
  r.style.setProperty('--accent', th.color);
  r.style.setProperty('--accent2', th.g || th.color);
  r.style.setProperty('--on-accent', th.on || '#fff');
  r.dataset.grad = th.g ? '1' : '';
  r.dataset.mode = P.mode; r.lang = P.lang;
  const m = $('meta[name=theme-color]'); if (m) m.content = th.color;
}

function putEntry(id, rec) {
  const e = { id, ...rec, updatedAt: Date.now() };
  if (S.meta) e.by ||= S.user?.uid;
  S.data.entries[id] = e; delete S.data.deleted[id];
  S.entries.set(id, e); S.dirty.add(id);
  persist(); scheduleRender(); scheduleSync();
}
function delEntry(id) {
  const e = S.entries.get(id);
  if (e?.rec) { const r = S.settings.recurring.find(x => x.id === e.rec); if (r) { r.skip = [...new Set([...(r.skip || []), e.date.slice(0, 7).replace('-', '')])]; saveSettings(); } }
  delete S.data.entries[id]; S.data.deleted[id] = Date.now();
  S.entries.delete(id); S.dirty.add(id);
  persist(); scheduleRender(); scheduleSync();
}

/* ───────── backup sync (only when signed in) ───────── */
let syncT = 0;
function scheduleSync(ms = 1500) { clearTimeout(syncT); syncT = setTimeout(sync, ms); }
async function sync() {
  if (!S.user || S.syncing || !navigator.onLine) return;
  S.syncing = true; refreshSyncBadge();
  try {
    // 1) push local changes
    const ids = [...S.dirty];
    if (ids.length) {
      const recs = ids.map(id => S.data.entries[id] || { id, deleted: true, updatedAt: S.data.deleted[id] || Date.now() });
      if (S.meta) await store.pushBook(S.bookId, recs); else await store.push(recs);
      ids.forEach(id => S.dirty.delete(id)); persist();
    }
    // 2) pull everything, newest wins
    const remote = S.meta ? await store.pullBook(S.bookId, { full: !S.entries.size }) : await store.pull({ full: S.preferRemote || !S.entries.size });
    let changed = false;
    for (const r of remote) {
      const local = S.data.entries[r.id], lts = local?.updatedAt || S.data.deleted[r.id] || 0;
      if ((r.updatedAt || 0) > lts && !S.dirty.has(r.id)) {
        if (r.deleted) { delete S.data.entries[r.id]; S.data.deleted[r.id] = r.updatedAt; }
        else { S.data.entries[r.id] = r; delete S.data.deleted[r.id]; }
        changed = true;
      }
    }
    if (changed) { S.entries = new Map(Object.entries(S.data.entries)); persist(); }
    // 3) settings
    const rs = await store.getSettings();
    if (rs && (S.preferRemote || rs.updatedAt > (S.settings.updatedAt || 0))) {
      const keepCats = S.settings.cats.filter(c => !rs.data.cats?.some(x => x.id === c.id) && (!S.meta && all().some(e => e.cat === c.id)));
      S.settings = rs.data; S.settings.cats = [...(rs.data.cats || []), ...keepCats];
      S.settings.updatedAt = rs.updatedAt; P = S.settings.prefs;
      localStorage.setItem(LK.settings, JSON.stringify(S.settings)); localStorage.removeItem(LK.sdirty);
      applyPrefs(); changed = true;
    } else if (localStorage.getItem(LK.sdirty) || !rs) {
      await store.putSettings(S.settings, S.settings.updatedAt || Date.now());
      localStorage.removeItem(LK.sdirty);
    }
    // 4) shared book: members, name, its categories & targets
    if (S.meta) {
      const info = await store.bookInfo(S.bookId);
      if (!info) { const old = S.bookId; dropBookLocal(old); switchBook('me', true); toast(t('removedFromBook'), { type: 'warn' }); changed = true; }
      else {
        const k = bkeys(S.bookId);
        Object.assign(S.meta, { name: info.name, owner: info.owner, code: info.code, members: info.members });
        if (localStorage.getItem(k.mdirty) && (S.meta.updatedAt || 0) >= (info.meta?.updatedAt || 0)) { await store.putBookMeta(S.bookId, { cats: S.meta.cats, targets: S.meta.targets, updatedAt: S.meta.updatedAt }); localStorage.removeItem(k.mdirty); }
        else if (info.meta && (info.meta.updatedAt || 0) > (S.meta.updatedAt || 0)) { S.meta.cats = info.meta.cats; S.meta.targets = info.meta.targets || []; S.meta.updatedAt = info.meta.updatedAt; changed = true; }
        localStorage.setItem(k.meta, JSON.stringify(S.meta));
      }
    }
    if (S.user) { try { S.books = await store.myBooks(); localStorage.setItem('tk_books', JSON.stringify(S.books)); } catch { } }
    S.preferRemote = false;
    S.lastSync = Date.now();
    if (changed) { runRecurring(); scheduleRender(); }
  } catch (e) { console.warn('sync later', e); }
  finally { S.syncing = false; refreshSyncBadge(); }
}
function dropBookLocal(id) { const k = bkeys(id); [k.data, k.dirty, k.meta, k.mdirty].forEach(x => localStorage.removeItem(x)); S.books = (S.books || []).filter(b => b.id !== id); localStorage.setItem('tk_books', JSON.stringify(S.books)); }
function refreshSyncBadge() { const b = $('#syncState'); if (b) b.innerHTML = syncLabel(); }
function syncLabel() {
  if (!S.user) return t('backupOff');
  if (S.syncing) return t('syncing');
  if (S.dirty.size) return t('syncPending', { n: dg(S.dirty.size) });
  return S.lastSync ? t('syncedAt', { t: dg(new Date(S.lastSync).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })) }) : t('backupOn');
}

/* ───────── pro / trial ───────── */
function proState() {
  if (S.profile?.pro || (isDemo && localStorage.getItem('tk_demo_pro') === '1')) return { s: 'pro', since: S.profile?.proSince };
  if (isDemo && localStorage.getItem('tk_demo_trial_end') === '1') return { s: 'free' };   // demo: see what a free user sees
  const left = Math.ceil((S.settings.firstOpen + C.TRIAL_DAYS * 864e5 - Date.now()) / 864e5);
  return left > 0 ? { s: 'trial', left } : { s: 'free' };
}
const isPro = () => proState().s !== 'free';
// "Pro" tag shows for trial + free users; only paid Pro members never see it
const proTag = () => proState().s === 'pro' ? '' : '<em class="ptag">Pro</em>';
const activeTargets = () => tgts();   // targets are free & unlimited
function enforceFree() { if (!isPro()) { const th = THEMES.find(x => x.id === P.theme); if (th && !th.free) setPref('theme', 'red'); } }

/* ───────── UI plumbing ───────── */
let rq = 0;
const scheduleRender = () => { cancelAnimationFrame(rq); rq = requestAnimationFrame(render); };
const TQ = []; let tBusy = false;
function toast(msg, { big = false, type = '' } = {}) { TQ.push({ msg, big, type }); if (!tBusy) nextToast(); }
function nextToast() {
  const x = TQ.shift(); if (!x) { tBusy = false; return; }
  tBusy = true;
  const el = document.createElement('div');
  el.className = `toast ${x.big ? 'big' : ''} ${x.type}`; el.textContent = x.msg;
  $('#toast-layer').appendChild(el);
  const life = x.big ? 1300 : 2200;
  setTimeout(() => el.classList.add('out'), life);
  setTimeout(() => { el.remove(); nextToast(); }, life + 280);
}
function coinBurst(x = S.px, y = S.py, n = 8) {
  const L = $('#fx-layer');
  for (let i = 0; i < n; i++) {
    const c = document.createElement('div'); c.className = 'coin'; c.textContent = '🪙';
    c.style.left = x + 'px'; c.style.top = y + 'px';
    c.style.setProperty('--dx', (Math.random() * 180 - 90) + 'px');
    c.style.setProperty('--dy', (-140 - Math.random() * 160) + 'px');
    c.style.setProperty('--r', (Math.random() * 540 - 270) + 'deg');
    c.style.animationDelay = (i * 35) + 'ms';
    L.appendChild(c); setTimeout(() => c.remove(), 1500);
  }
}
function confetti(n = 80) {
  const L = $('#fx-layer');
  const cols = [getComputedStyle(document.documentElement).getPropertyValue('--accent'), '#FBBF24', '#34D399', '#F472B6', '#818CF8', '#60A5FA'];
  for (let i = 0; i < n; i++) {
    const c = document.createElement('i'); c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw'; c.style.background = cols[i % cols.length];
    c.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px'); c.style.setProperty('--r', (Math.random() * 900) + 'deg');
    c.style.animationDuration = (1.6 + Math.random() * 1.2) + 's'; c.style.animationDelay = (Math.random() * 250) + 'ms';
    L.appendChild(c); setTimeout(() => c.remove(), 3200);
  }
}
const buzz = (ms = 10) => { try { navigator.vibrate?.(ms); } catch { } };
const shake = sel => { const el = $(sel); if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };

function openSheet(html, name, cls = '') {
  const L = $('#sheet-layer');
  L.innerHTML = `<div class="scrim" data-a="closeSheet"></div><div class="sheet ${cls}" data-sheet="${name}"><div class="grab" data-a="closeSheet"></div><div class="sheet-body">${html}</div></div>`;
  requestAnimationFrame(() => L.classList.add('on'));
  if (!history.state?.sheet) history.pushState({ sheet: 1 }, '');
  S.sheet = name;
}
function refreshSheet(html) { const b = $('.sheet-body'); if (b) b.innerHTML = html; }
function closeSheet(fromPop) {
  if (!S.sheet) return;
  const L = $('#sheet-layer'); L.classList.remove('on'); S.sheet = null;
  setTimeout(() => { if (!S.sheet) L.innerHTML = ''; }, 260);
  if (!fromPop && history.state?.sheet) history.back();
}
addEventListener('popstate', () => { if ($('.modal-wrap')) { $('.modal-wrap').remove(); return; } if (S.sheet) closeSheet(true); });

function askConfirm(msg, okText, danger = true) {
  return new Promise(res => {
    const d = document.createElement('div'); d.className = 'modal-wrap';
    d.innerHTML = `<div class="modal small"><p>${esc(msg)}</p><div class="row gap"><button class="btn soft grow" data-r="0">${t('cancel')}</button><button class="btn ${danger ? 'danger' : 'primary'} grow" data-r="1">${esc(okText || t('yes'))}</button></div></div>`;
    d.addEventListener('click', e => { const b = e.target.closest('[data-r]'); if (b || e.target === d) { d.remove(); res(b?.dataset.r === '1'); } });
    document.body.appendChild(d);
  });
}

/* ───────── boot ───────── */
async function boot() {
  loadLocal(); applyPrefs();
  S.bookId = 'me'; S.meta = null; S.books = safe(localStorage.getItem('tk_books'), []);
  const ab = localStorage.getItem('tk_active_book');
  if (ab && ab !== 'me' && S.books.some(b => b.id === ab)) switchBook(ab, true);
  S.period = periodOf(todayStr()); S.year = +S.period.slice(0, 4);
  S.hidden = !!(P.hideBtn && isPro());          // "hide money" mode starts hidden if turned on
  showApp();
  if (lockCfg()) showLock();
  attachSwipe($('#root'), dir => {
    if (S.view !== 'calendar' || S.sheet || $('.modal-wrap')) return;
    S.period = shiftPeriod(S.period, dir); render();
    const c = $('.cal'); if (c) c.classList.add(dir > 0 ? 'in-l' : 'in-r');
  });
  store = await initStore();
  store.onRecovery?.(() => setTimeout(openNewPassword, 300));
  store.onAuth(onAuth);
  runRecurring(); checkBadges(true);
  setInterval(() => { if (!document.hidden) sync(); }, 60000);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { S.bgAt = Date.now(); return; }
    const lc = lockCfg();
    if (lc && S.bgAt && Date.now() - S.bgAt >= lc.after * 1000) showLock();
    sync(); scheduleRender();
  });
  addEventListener('online', () => sync());
}

function onAuth(u) {
  S.unsub.forEach(f => f && f()); S.unsub = [];
  S.user = u; S.profile = null; S.payments = [];
  if (u) {
    S.unsub.push(store.listenProfile(p => {
      const was = !!S.profile?.pro; S.profile = p;
      if (!was && p?.pro && S.lastSync) { confetti(120); toast(t('proActivated'), { big: true }); }
      enforceFree(); scheduleRender(); if (S.sheet === 'pay') openPay();
    }));
    S.unsub.push(store.listenMyPayments(ps => { S.payments = ps; if (S.sheet === 'pay') openPay(); scheduleRender(); }));
    sync();
  }
  enforceFree(); scheduleRender();
}

function showApp() {
  $('#root').innerHTML = `<div class="app"><main id="view"></main>
    <nav class="nav">
      ${navBtn('home', I.home, t('navHome'))}${navBtn('charts', I.pie, t('navCharts'))}
      <div class="fab-slot"><button class="fab" data-a="add" aria-label="${t('add')}">${I.plus}</button></div>
      ${navBtn('calendar', I.cal, t('navCal'))}${navBtn('me', I.user, t('navMe'))}
    </nav></div>`;
  render();
}
const navBtn = (v, ic, l) => `<button class="nb ${S.view === v ? 'on' : ''}" data-a="nav" data-v="${v}">${ic}<span>${l}</span></button>`;
function render() {
  const v = $('#view'); if (!v) return;
  const y = scrollY;
  v.innerHTML = ({ home: vHome, charts: vCharts, calendar: vCal, me: vMe })[S.view]();
  $$('.nav .nb').forEach(b => { b.classList.toggle('on', b.dataset.v === S.view); });
  $$('.nav .nb span').forEach((s, i) => s.textContent = [t('navHome'), t('navCharts'), t('navCal'), t('navMe')][i]);
  scrollTo(0, y);
}

/* ───────── shared bits ───────── */
function periodNav() {
  const sub = periodSub(S.period), cur = S.period === periodOf(todayStr());
  return `<div class="pnav"><button class="ib" data-a="pshift" data-v="-1" aria-label="prev">${I.left}</button>
    <div class="pt"><b>${periodTitle(S.period)}</b>${sub ? `<small>${sub}</small>` : ''}${!cur ? `<small class="link-sm" data-a="pnow">${t('backToNow')}</small>` : ''}</div>
    <button class="ib" data-a="pshift" data-v="1" aria-label="next">${I.right}</button></div>`;
}
const catIcon = (c, sm = '') => `<span class="eic ${sm}" style="--c:${c.color}">${c.emoji}</span>`;
function entryRow(e, withDate = false) {
  const c = cat(e.cat), title = e.note || catName(c);
  const sub = [withDate ? dShort(e.date) : '', e.note ? esc(catName(c)) : '', S.meta && e.by ? `👤 ${esc(memberName(e.by))}` : ''].filter(Boolean).join(' · ');
  const tags = (e.rec ? `<span class="tg">${t('tagRec')}</span>` : '');
  return `<button class="erow" data-a="edit" data-id="${e.id}">${catIcon(c)}
    <span class="etx"><b>${esc(title)}</b>${sub || tags ? `<small>${sub}${tags}</small>` : ''}</span>
    <span class="eam">${fmt(e.amt)}</span></button>`;
}
const datesWithEntries = () => new Set(all().map(e => e.date));
function calcStreak() { const ds = datesWithEntries(); let d = todayStr(), n = 0; if (!ds.has(d)) d = addDays(d, -1); while (ds.has(d)) { n++; d = addDays(d, -1); } return n; }
function bestStreak() { const ds = [...datesWithEntries()].sort(); let best = 0, run = 0, prev = null; ds.forEach(d => { run = prev && diffDays(prev, d) === 1 ? run + 1 : 1; best = Math.max(best, run); prev = d; }); return best; }
function missedDays() {
  if (!S.entries.size) return [];
  const first = all().reduce((m, e) => e.date < m ? e.date : m, '9999'), td = todayStr(), ds = datesWithEntries(), out = [];
  for (let i = 7; i >= 1; i--) { const d = addDays(td, -i); if (d >= first && !ds.has(d)) out.push(d); }
  return out;
}
function targetInfo(catId, pk) {
  const tg = activeTargets().find(x => x.cat === catId); if (!tg) return null;
  const spent = sum(inPeriod(pk).filter(e => e.cat === catId));
  return { amt: tg.amt, spent, pct: spent / tg.amt };
}

/* ───────── HOME ───────── */
function vHome() {
  const pk = S.period, es = inPeriod(pk), total = sum(es), td = todayStr(), ps = proState();
  let h = `<header class="top home-top"><div class="app-tag">${t('appName')}</div>${periodNav()}</header>
  <div class="content">
    ${bookChip()}
    <section class="summary">${P.hideBtn && isPro() ? `<button class="eye" data-a="toggleHide" aria-label="hide">${S.hidden ? I.eyeOff : I.eye}</button>` : ''}<small>${t('spentThisPeriod')}</small><div class="big-amt ${S.hidden ? 'masked' : ''}" id="bigAmt">${S.hidden ? '•••••' : fmt(total)}</div><small class="unit">${t('taka')}</small></section>`;

  if (ps.s === 'trial' && ps.left <= 2) h += `<button class="note-card warn" data-a="pay">${I.crown}<span>${t('trialEnding', { d: dg(ps.left) })}</span>${I.chev}</button>`;
  if (S.payments.some(p => p.status === 'pending')) h += `<div class="note-card">⏳ <span>${t('payPendingShort')}</span></div>`;
  if (!S.user && S.entries.size >= 3 && localStorage.getItem('tk_bk_x') !== td) h += `<div class="note-card">${I.cloud}<span><b>${t('backupNudge')}</b><small>${t('backupNudgeSub')}</small></span><button class="btn primary sm" data-a="backup">${t('turnOn')}</button><button class="x" data-a="bkX" aria-label="close">${I.x}</button></div>`;
  const miss = localStorage.getItem('tk_nudge_x') === td ? [] : missedDays();
  if (miss.length) h += `<div class="card nudge"><div class="row between"><b>${t('missedTitle')}</b><button class="x" data-a="nudgeX" aria-label="close">${I.x}</button></div><div class="chips">${miss.map(d => `<button class="chip" data-a="add" data-date="${d}">${dShort(d)}</button>`).join('')}</div></div>`;

  if (!es.length) return h + `<div class="empty"><div class="empty-ic">🪙</div><b>${t('emptyTitle')}</b><p>${t('emptyPeriod')}</p><button class="btn primary" data-a="add">${I.plus} ${t('addFirst')}</button></div></div>`;
  const groups = new Map();
  sortEntries(es).forEach(e => { if (!groups.has(e.date)) groups.set(e.date, []); groups.get(e.date).push(e); });
  for (const [d, arr] of groups) h += `<div class="dhead"><span>${dRel(d)}</span><span>${fmt(sum(arr))}</span></div><div class="card list">${arr.map(e => entryRow(e)).join('')}</div>`;
  return h + `</div>`;
}

/* ───────── CHARTS ───────── */
function vCharts() {
  const tabs = ['cat', 'month', 'year', 'compare', 'insights'];
  let h = `<header class="top">${S.chartTab === 'year' ? `<div class="pnav"><button class="ib" data-a="yshift" data-v="-1">${I.left}</button><div class="pt"><b>${dg(S.year)}</b></div><button class="ib" data-a="yshift" data-v="1">${I.right}</button></div>` : periodNav()}</header>
  <div class="content"><div class="seg">${tabs.map(x => `<button class="${S.chartTab === x ? 'on' : ''}" data-a="ctab" data-v="${x}">${t('ct_' + x)}${x === 'insights' && proState().s === 'trial' ? ' 👑' : ''}</button>`).join('')}</div>`;
  h += ({ month: cMonth, year: cYear, cat: cCat, compare: cCompare, insights: cInsights })[S.chartTab]();
  h += `<button class="btn soft wide" data-a="monthCard">${I.share} ${t('monthCard')}</button>`;
  return h + `</div>`;
}
function cMonth() {
  const [a, b] = periodRange(S.period), n = diffDays(a, b) + 1, td = todayStr(), es = inPeriod(S.period);
  const days = [...Array(n)].map((_, i) => addDays(a, i)), vals = days.map(d => sum(es.filter(e => e.date === d)));
  const elapsed = td < a ? 0 : td > b ? n : diffDays(a, td) + 1, total = sum(es), avg = elapsed ? total / elapsed : 0;
  const labels = days.map((d, i) => { const dd = parse(d).d; return (i === 0 || dd % 5 === 0) ? dg(dd) : ''; });
  const maxI = vals.indexOf(Math.max(...vals)), zero = days.slice(0, elapsed).filter((d, i) => !vals[i]).length;
  return `<div class="card chart-card"><div class="row between"><b>${t('perDay')}</b><b>${fmt(total)}</b></div>
    ${barChart({ values: vals, labels, avg, action: 'dayTap', highlight: days.indexOf(td), avgLabel: t('avg') + ' ' + nShort(avg) })}
    <p class="hint">${t('tapBar')}</p></div>
    <div class="stats3"><div class="card"><small>${t('avgDay')}</small><b>${fmt(Math.round(avg))}</b></div>
      <div class="card"><small>${t('maxDay')}</small><b>${vals[maxI] ? fmt(vals[maxI]) : '—'}</b><small>${vals[maxI] ? dShort(days[maxI]) : ''}</small></div>
      <div class="card"><small>${t('zeroDays')}</small><b>${dg(zero)}</b></div></div>`;
}
function cYear() {
  const pks = [...Array(12)].map((_, i) => `${S.year}-${pad(i + 1)}`), vals = pks.map(pk => sum(inPeriod(pk)));
  const total = vals.reduce((a, b) => a + b, 0), filled = vals.filter(v => v > 0).length, maxI = vals.indexOf(Math.max(...vals)), av = filled ? total / filled : 0;
  return `<div class="card chart-card"><div class="row between"><b>${t('perMonth')}</b><b>${fmt(total)}</b></div>
    ${barChart({ values: vals, labels: MONTHS_S[P.lang], avg: filled ? av : null, action: 'monthTap', highlight: pks.indexOf(periodOf(todayStr())), avgLabel: t('avg') + ' ' + nShort(av) })}
    <p class="hint">${t('tapMonth')}</p></div>
    <div class="stats3"><div class="card"><small>${t('yearTotal')}</small><b>${nShort(total)}</b></div><div class="card"><small>${t('avgMonth')}</small><b>${nShort(av)}</b></div>
    <div class="card"><small>${t('maxMonth')}</small><b>${vals[maxI] ? MONTHS_S[P.lang][maxI] : '—'}</b><small>${vals[maxI] ? nShort(vals[maxI]) : ''}</small></div></div>`;
}
// If the biggest category is more than 40% of the month's total, offer a toggle to hide that whole category.
function bigCat(arr) { const tot = sum(arr); if (!tot) return null; const top = [...byCat(arr)].sort((x, y) => y[1] - x[1])[0]; return top && top[1] > 0.4 * tot ? top : null; }
function cCat() {
  const all0 = inPeriod(S.period);
  if (!all0.length) return `<div class="empty"><p>${t('noData')}</p></div>`;
  const big = bigCat(all0);
  let h0 = '';
  if (big) h0 = `<label class="toggle-line"><input type="checkbox" data-a="exBig" ${S.exBig ? 'checked' : ''}><span class="sw"></span><span class="grow">${t('exBig')}<small class="muted block">${S.exBig ? t('bigOff') : t('bigRule')}: ${cat(big[0]).emoji} ${esc(catName(cat(big[0])))} ${fmt(big[1])}</small></span></label>`;
  const es = S.exBig && big ? all0.filter(e => e.cat !== big[0]) : all0, total = sum(es);
  if (!es.length) return h0 + `<div class="empty"><p>${t('noData')}</p></div>`;
  const m = [...byCat(es)].sort((x, y) => y[1] - x[1]), max = m[0][1];
  let h = h0 + `<div class="card chart-card center">${donut({ items: m.map(([id, v]) => ({ id, value: v, color: cat(id).color })), center: fmt(total), sub: t('totalTaka'), action: 'catd' })}</div>
    <div class="card legend-bars">`;
  m.forEach(([id, v]) => {
    const c = cat(id), ti = targetInfo(id, S.period), pct = v / total * 100;
    const tgPos = ti ? Math.min(100, ti.amt / max * 100) : null;
    h += `<button class="lb" data-a="catd" data-id="${id}">
      <span class="lb-top"><i class="dot" style="background:${c.color}"></i><span class="lb-name">${c.emoji} ${esc(catName(c))}</span><b>${fmt(v)}</b><small>${dg(pct.toFixed(pct < 10 ? 1 : 0))}%</small></span>
      <span class="lb-track"><i style="width:${(v / max * 100).toFixed(1)}%;background:${c.color}"></i>${tgPos !== null ? `<em class="tmark" style="left:${tgPos}%"></em>` : ''}</span>
      ${ti ? `<small class="lb-tg ${ti.pct >= 1 ? 'bad' : ti.pct >= .8 ? 'warn' : 'good'}">${t('targetOf', { a: fmt(ti.amt) })} · ${ti.pct >= 1 ? t('overBy', { a: fmt(ti.spent - ti.amt) }) : t('leftAmt', { a: fmt(ti.amt - ti.spent) })}</small>` : ''}
    </button>`;
  });
  h += `</div>`;
  if (S.meta) h += whoSpent(es);
  if (!tgts().length) h += `<button class="note-card" data-a="targets">${I.target}<span><b>${t('setTargetsTitle')}</b><small>${t('setTargetsBody')}</small></span>${I.chev}</button>`;
  return h;
}
function cCompare() {
  const prev = shiftPeriod(S.period, -1), td = todayStr();
  const [a, b] = periodRange(S.period), [pa, pb] = periodRange(prev);
  // current month: compare up to today's date with the same days of last month
  const isCur = td >= a && td <= b;
  const n = isCur ? diffDays(a, td) : diffDays(a, b);
  const aEnd = isCur ? td : b, pEnd = addDays(pa, n) > pb ? pb : addDays(pa, n);
  const A = byCat(inRange(a, aEnd)), B = byCat(inRange(pa, pEnd));
  const tA = [...A.values()].reduce((x, y) => x + y, 0), tB = [...B.values()].reduce((x, y) => x + y, 0);
  const ids = [...new Set([...A.keys(), ...B.keys()])].sort((x, y) => (A.get(y) || 0) - (A.get(x) || 0));
  const lblA = `${dShort(a)} – ${dShort(aEnd)}`, lblB = `${dShort(pa)} – ${dShort(pEnd)}`;
  if (!ids.length) return `<div class="empty"><p>${t('noData')}</p></div>`;
  const max = Math.max(...ids.map(i => Math.max(A.get(i) || 0, B.get(i) || 0)), 1);
  const ch = (x, y) => !y ? (x ? `<em class="up">${t('new')}</em>` : '') : `<em class="${x > y ? 'up' : x < y ? 'down' : ''}">${x > y ? '↑' : x < y ? '↓' : '='} ${dg(Math.abs(Math.round((x - y) / y * 100)))}%</em>`;
  let h = `<p class="hint">${isCur ? t('cmpSameDays', { d: dg(n + 1) }) : t('cmpFull')}</p>
    <div class="card compare-head"><div><small>${lblA}</small><b>${fmt(tA)}</b></div><div>${ch(tA, tB)}</div><div><small>${lblB}</small><b>${fmt(tB)}</b></div></div>
    <p class="hint">${tA <= tB ? t('cmpGood') : t('cmpBad')}</p><div class="card list">`;
  ids.forEach(id => {
    const c = cat(id), x = A.get(id) || 0, y = B.get(id) || 0;
    h += `<button class="cmp" data-a="catd" data-id="${id}"><div class="row between"><span class="row gap6">${c.emoji} <b>${esc(catName(c))}</b></span>${ch(x, y)}</div>
      <div class="pair"><span class="track"><i style="width:${x / max * 100}%;background:${c.color}"></i></span><small>${fmt(x)}</small></div>
      <div class="pair old"><span class="track"><i style="width:${y / max * 100}%"></i></span><small>${fmt(y)}</small></div></button>`;
  });
  return h + `</div><p class="hint">${t('cmpLegend')}</p>`;
}

/* ───────── CALENDAR ───────── */
function vCal() {
  const [a, b] = periodRange(S.period), td = todayStr(), ds = new Map();
  inPeriod(S.period).forEach(e => ds.set(e.date, (ds.get(e.date) || 0) + e.amt));
  const first = S.entries.size ? all().reduce((m, e) => e.date < m ? e.date : m, '9999') : td;
  const lead = dow(a), n = diffDays(a, b) + 1;
  let h = `<header class="top">${periodNav()}</header><div class="content"><div class="card cal"><div class="cal-g wd">${WDAYS_S[P.lang].map(w => `<span>${w}</span>`).join('')}</div><div class="cal-g">`;
  for (let i = 0; i < lead; i++) h += `<span></span>`;
  for (let i = 0; i < n; i++) {
    const d = addDays(a, i), v = ds.get(d) || 0, fut = d > td, missed = !v && !fut && d >= first && d < td;
    h += `<button class="cd ${d === td ? 'today' : ''} ${fut ? 'fut' : ''} ${missed ? 'missed' : ''} ${v ? 'has' : ''}" data-a="day" data-v="${d}" ${fut ? 'disabled' : ''}><b>${dg(parse(d).d)}</b><small>${v ? nShort(v) : missed ? '+' : ''}</small></button>`;
  }
  return h + `</div></div><p class="hint">${t('calHint')}</p></div>`;
}

/* ───────── ME ───────── */
function vMe() {
  const ps = proState(), bd = computeBadges();
  let h = `<header class="top"><h2>${t('navMe')}</h2></header><div class="content">`;
  // backup
  if (S.user) {
    h += `<div class="card backup on"><div class="bk-ic">${I.cloudOk}</div><div class="grow"><b>${t('backupOn')}</b><small>${esc(S.user.email)}</small><small id="syncState">${syncLabel()}</small></div><button class="ib" data-a="syncNow" aria-label="sync">${I.sync}</button></div>`;
  } else {
    h += `<div class="card backup"><div class="bk-ic">${I.cloud}</div><div class="grow"><b>${t('backupTitle')}</b><small>${t('backupSub')}</small></div><button class="btn primary sm" data-a="backup">${t('signIn')}</button></div>`;
  }
  if (ps.s !== 'pro') h += `<button class="card pro-card" data-a="pay"><div class="bk-ic gold">${I.crown}</div><span class="grow"><b>${t('proTitle', { p: dg(C.PRO_PRICE) })}</b><small>${ps.s === 'trial' ? t('trialLeft', { d: dg(ps.left) }) : t('proSub')}</small></span>${I.chev}</button>`;
  else h += `<button class="card pro-card" data-a="proBenefits"><div class="bk-ic gold">${I.crown}</div><span class="grow"><b>${t('proMember')} 👑</b><small>${t('seeBenefits')}</small></span>${I.chev}</button>`;

  h += `<div class="sec-h"><h3>${t('mySetup')}</h3></div><div class="card list">
    ${meRow(I.search, t('searchExp'), '', 'search')}
    ${meRow(I.users, t('sharedBook'), S.books?.[0] ? esc(S.books[0].name) : proTag(), 'shared')}
    ${meRow(I.target, t('targets'), dg(tgts().length), 'targets')}
    ${meRow(I.tag, t('categories'), proState().s === 'pro' ? dg(visCats().length) : dg(cats().length) + '/' + dg(C.FREE_CATS), 'cats')}
    ${meRow(I.repeat, t('recurring'), proTag() + (isPro() ? dg(S.settings.recurring.length) : ''), 'recurring')}
    ${meRow(I.download, t('export'), proTag() + (isPro() ? 'Excel · PDF' : ''), 'export')}
    ${meRow(I.daystart, t('monthStart'), t('monthStartV', { d: dg(mStart()) }), 'monthStart')}
  </div>
  <div class="sec-h"><h3>${t('looks')}</h3></div><div class="card list">
    ${meRow(I.palette, t('theme'), `<i class="swatch" style="background:var(--accent-bg)"></i>`, 'theme')}
    <label class="lrow toggle-row">${I.eye}<span class="grow"><span>${t('hideBtnSet')} ${proTag()}</span><small class="muted">${isPro() ? t('hideBtnSub') : ''}</small></span><input type="checkbox" data-a="hideBtn" ${P.hideBtn && isPro() ? 'checked' : ''}><span class="sw"></span></label>
    <div class="lrow">${I.moon}<span class="grow">${t('mode')}</span><div class="seg mini">${['light', 'dark', 'system'].map(m => `<button class="${P.mode === m ? 'on' : ''}" data-a="mode" data-v="${m}">${t('mode_' + m)}</button>`).join('')}</div></div>
    <div class="lrow">${I.globe}<span class="grow">${t('language')}</span><div class="seg mini"><button class="${P.lang === 'bn' ? 'on' : ''}" data-a="lang" data-v="bn">বাংলা</button><button class="${P.lang === 'en' ? 'on' : ''}" data-a="lang" data-v="en">English</button></div></div>
    ${meRow(I.type, t('fontBn'), esc((FONTS_BN.find(f => f.id === P.fontBn) || FONTS_BN[0]).name), 'fontBn')}
    ${meRow(I.type, t('fontEn'), esc((FONTS_EN.find(f => f.id === P.fontEn) || FONTS_EN[0]).name), 'fontEn')}
    <div class="lrow">${I.hash}<span class="grow">${t('digits')}</span><div class="seg mini"><button class="${bnDigits() ? 'on' : ''}" data-a="digits" data-v="bn">১২৩</button><button class="${!bnDigits() ? 'on' : ''}" data-a="digits" data-v="en">123</button></div></div>
  </div>
  <div class="sec-h"><h3>${t('badges')}</h3></div><div class="badges">${bd.map(b => `<div class="badge ${b.n ? '' : 'locked'}"><span>${b.ic}</span><b>${b.name}</b><small>${b.n ? (b.count ? '×' + dg(b.n) : '✓') : b.hint}</small></div>`).join('')}</div>
  <div class="sec-h"><h3>${t('security')}</h3></div><div class="card list">
    <label class="lrow toggle-row">${I.finger}<span class="grow"><span>${t('appLock')} ${proTag()}</span><small class="muted">${isPro() ? t('appLockSub') : ''}</small></span><input type="checkbox" data-a="lockToggle" ${lockCfg() ? 'checked' : ''}><span class="sw"></span></label>
    ${lockCfg() ? `<div class="lrow"><span class="grow small">${t('lockAfter')}</span><div class="seg mini">${[0, 60, 300].map(v => `<button class="${lockCfg().after === v ? 'on' : ''}" data-a="lockAfter" data-v="${v}">${t('la_' + v)}</button>`).join('')}</div></div>` : ''}
  </div>
  <div class="sec-h"><h3>${t('aboutApp')}</h3></div><div class="card list">
    ${meRow(I.shield, t('privacy'), '', 'privacy')}
    ${meRow(I.user, t('aboutDev'), esc(DEVELOPER.name), 'aboutDev')}
  </div>
  ${shareCard()}
  ${isDemo ? `<label class="toggle-line demo-pro"><input type="checkbox" data-a="demoPro" ${localStorage.getItem('tk_demo_pro') === '1' ? 'checked' : ''}><span class="sw"></span><span class="grow">${t('demoPro')}</span></label>
  <label class="toggle-line demo-pro"><input type="checkbox" data-a="demoTrialEnd" ${localStorage.getItem('tk_demo_trial_end') === '1' ? 'checked' : ''}><span class="sw"></span><span class="grow">${t('demoTrialEnd')}<small class="muted">${t('demoTrialEndSub')}</small></span></label>` : ''}
  ${S.user && store.isAdmin() ? `<a class="btn soft wide" href="admin.html">${t('adminPage')}</a>` : ''}
  ${S.user ? `<button class="btn soft wide danger-t" data-a="logout">${I.logout} ${t('logout')}</button>` : ''}
  <p class="hint">${t('appName')} · v${C.APP_VERSION}${isDemo ? ' · demo' : ''} · ${t('madeBy')} ${esc(DEVELOPER.name)}</p></div>`;
  return h;
}
const meRow = (ic, l, v, a) => `<button class="lrow" data-a="${a}">${ic}<span class="grow">${l}</span><small class="muted">${v}</small><span class="chev">${I.chev}</span></button>`;

/* ───────── badges & cheers ───────── */
function computeBadges() {
  const curPk = periodOf(todayStr()), pks = [...new Set(all().map(e => periodOf(e.date)))].filter(p => p < curPk), act = activeTargets();
  let smart = 0, kept = 0;
  if (act.length) pks.forEach(pk => {
    const tg = act.filter(x => (x.since || '0000') <= pk); if (!tg.length) return;
    const m = byCat(inPeriod(pk)), ok = tg.filter(x => (m.get(x.cat) || 0) <= x.amt).length;
    if (tg.reduce((s, x) => s + (m.get(x.cat) || 0), 0) <= tg.reduce((s, x) => s + x.amt, 0)) smart++;
    if (ok === tg.length) kept++;
  });
  const best = bestStreak();
  return [
    { ic: '🌱', name: t('b_first'), n: S.entries.size ? 1 : 0, hint: t('bh_first') },
    { ic: '🔥', name: t('b_s7'), n: best >= 7 ? 1 : 0, hint: t('bh_s7') },
    { ic: '🏆', name: t('b_s30'), n: best >= 30 ? 1 : 0, hint: t('bh_s30') },
    { ic: '🧠', name: t('b_smart'), n: smart, count: 1, hint: t('bh_smart') },
    { ic: '📒', name: t('b_kept'), n: kept, count: 1, hint: t('bh_kept') },
  ];
}
function checkBadges(silent = false) {
  const total = computeBadges().reduce((s, x) => s + x.n, 0), seen = S.settings.seen.badges || 0;
  if (total > seen) {
    if (!silent && (seen > 0 || total > 1)) { toast(t('newBadge'), { big: true }); if (isPro()) confetti(); }
    S.settings.seen.badges = total; saveSettings();
  }
}
function celebrate(rec, before) {
  const td = todayStr();
  coinBurst(); buzz(15);
  const big = $('#bigAmt'); if (big) { big.classList.remove('bump'); void big.offsetWidth; big.classList.add('bump'); }
  toast(rec.date < td ? t('cheerBackfill') : CHEERS[P.lang][Math.floor(Math.random() * CHEERS[P.lang].length)], { big: true });
  const after = targetInfo(rec.cat, periodOf(rec.date));
  if (after && before) {
    if (after.pct >= 1 && before.pct < 1) toast(t('targetCrossed', { c: catName(cat(rec.cat)) }), { type: 'bad' });
    else if (after.pct >= .8 && before.pct < .8) toast(t('targetNear', { c: catName(cat(rec.cat)) }), { type: 'warn' });
  }
  const s = calcStreak(), key = s + td.slice(0, 7);
  if ([3, 7, 14, 30, 60, 100, 365].includes(s) && S.settings.seen.streak !== key) {
    S.settings.seen.streak = key; saveSettings();
    toast(t('streakCheer', { n: dg(s) }), { big: true }); if (isPro()) setTimeout(() => confetti(), 300);
  }
  checkBadges();
}
function runRecurring() {
  if (!isPro() || !S.settings.recurring.length || S.meta) return;   // recurring only in my own book
  const td = todayStr(), { y, m } = parse(td);
  for (const r of S.settings.recurring) {
    if (!r.active) continue;
    let [sy, sm] = r.start.split('-').map(Number), guard = 0;
    while ((sy < y || (sy === y && sm <= m)) && guard++ < 36) {
      const key = `${sy}${pad(sm)}`, date = toStr(sy, sm, Math.min(r.day, dim(sy, sm))), id = `r_${r.id}_${key}`;
      if (date <= td && !(r.skip || []).includes(key) && !S.data.entries[id] && !S.data.deleted[id])
        putEntry(id, { amt: r.amt, cat: r.cat, note: r.note || '', date, big: false, rec: r.id, created: Date.now() });
      if (++sm > 12) { sm = 1; sy++; }
    }
  }
}

/* ───────── ADD / EDIT ───────── */
let A = null;
function topCats(n = 7) {
  const vis = visCats(), cut = addDays(todayStr(), -90), f = new Map();
  all().forEach(e => { if (e.date >= cut) f.set(e.cat, (f.get(e.cat) || 0) + 1); });
  const pick = [...vis].sort((a, b) => (f.get(b.id) || 0) - (f.get(a.id) || 0) || vis.indexOf(a) - vis.indexOf(b)).slice(0, n);
  return vis.filter(c => pick.includes(c));  // keep the user's order so tiles don't jump around
}
function openAdd({ id = null, date = null, cat: c = null } = {}) {
  const e = id ? S.entries.get(id) : null;
  A = { id: e?.id || null, amt: e ? String(e.amt) : '', cat: e?.cat || c || null, note: e?.note || '', date: e?.date || date || todayStr(), big: !!e?.big, rec: e?.rec || null, created: e?.created || null, more: false };
  openSheet(addHTML(), 'add', 'add-sheet'); wireAdd();
}
function catTiles() {
  const vis = visCats();
  if (A.more || vis.length <= 7) {
    return vis.map(tile).join('') + `<button class="cg new" data-a="newCat">${I.plus}<small>${t('newCat')}</small></button>`;
  }
  let list = topCats(7);
  if (A.cat && !list.some(c => c.id === A.cat)) list = [...list.slice(0, 6), cat(A.cat)];
  return list.map(tile).join('') + `<button class="cg more" data-a="moreCats">${I.grid}<small>${t('more')}</small></button>`;
}
const tile = c => `<button class="cg ${A.cat === c.id ? 'on' : ''}" data-a="acat" data-id="${c.id}" style="--c:${c.color}"><span>${c.emoji}</span><small>${esc(catName(c))}</small></button>`;
function addHTML() {
  const td = todayStr(), yd = addDays(td, -1), other = A.date !== td && A.date !== yd;
  return `<div class="add ${A.id ? 'editing' : ''}">
    ${A.id ? `<div class="edit-banner">${I.edit}<span>${t('editingOld')}</span></div>` : ''}
    ${S.meta ? `<div class="book-line">📒 ${esc(S.meta.name)}</div>` : ''}
    <div class="add-head">
      <div class="chips dates"><button class="chip ${A.date === td ? 'on' : ''}" data-a="adate" data-v="${td}">${t('today')}</button><button class="chip ${A.date === yd ? 'on' : ''}" data-a="adate" data-v="${yd}">${t('yesterday')}</button>
        <button class="chip ${other ? 'on' : ''}" data-a="pickDate">${I.cal}<span>${other ? dShort(A.date) : t('pickDate')}</span></button></div>
      <button class="ib" data-a="closeSheet" aria-label="close">${I.x}</button>
    </div>
    <div class="amt-box"><small>${t('howMuch')}</small><div class="amt-disp" id="amt">${amtDisplay()}</div></div>
    <div class="catgrid ${A.more ? 'open' : ''}" id="catgrid">${catTiles()}</div>
    <div class="note-row"><input id="noteIn" placeholder="${t('notePh')}" value="${esc(A.note)}" maxlength="60" autocomplete="off" enterkeyhint="done"></div>
    <div class="chips tags" id="tags">${tagsHTML()}</div>
    <div class="keypad">${['1', '2', '3', 'del', '4', '5', '6', 'save', '7', '8', '9', '00', '0', '+'].map(k =>
      k === 'save' ? `<button class="k save" data-a="saveAdd">${I.check}<small>${A.id ? t('update') : t('save')}</small></button>` :
        `<button class="k ${k === 'del' || k === '+' ? 'fn' : ''}" data-a="key" data-v="${k}">${k === 'del' ? I.del : k === '+' ? I.plus : dg(k)}</button>`).join('')}</div>
  </div>`;
}
function wireAdd() {
  const n = $('#noteIn'); if (n) { n.oninput = e => { A.note = e.target.value; $$('#tags .chip[data-v]').forEach(c => c.classList.toggle('on', c.dataset.v === A.note)); }; n.onkeydown = e => { if (e.key === 'Enter') n.blur(); }; }
}
function rerenderAdd() { refreshSheet(addHTML()); wireAdd(); }
const evalAmt = s => s.split('+').reduce((a, b) => a + (parseFloat(b) || 0), 0);
function amtDisplay() {
  if (!A.amt) return `<span class="ph">৳${dg(0)}</span>`;
  const parts = A.amt.split('+');
  return (parts.length > 1 ? `<small>${parts.map(p => dg(p || '0')).join(' + ')} =</small>` : '') + `৳${fmt(evalAmt(A.amt))}`;
}
function tagsHTML() {
  const big = '';
  if (!A.cat) return big;
  const f = new Map(); all().filter(e => e.cat === A.cat && e.note).forEach(e => f.set(e.note, (f.get(e.note) || 0) + 1));
  return big + [...f].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([x]) => `<button class="chip sm ${A.note === x ? 'on' : ''}" data-a="atag" data-v="${esc(x)}">${esc(x)}</button>`).join('');
}
function keyPress(k) {
  buzz(5);
  if (k === 'del') A.amt = A.amt.slice(0, -1);
  else if (k === '+') { if (A.amt && !A.amt.endsWith('+')) A.amt += '+'; }
  else { const last = A.amt.split('+').pop(); if (last.length >= 8) return; if (last === '0' || last === '') A.amt = A.amt.slice(0, A.amt.length - last.length) + (k === '00' ? '' : k); else A.amt += k; }
  $('#amt').innerHTML = amtDisplay();
}
function saveAdd() {
  const amt = Math.round(evalAmt(A.amt) * 100) / 100;
  if (!(amt > 0)) { shake('#amt'); toast(t('enterAmount'), { type: 'warn' }); return; }
  if (!A.cat) { shake('#catgrid'); toast(t('pickCat'), { type: 'warn' }); return; }
  const isNew = !A.id, id = A.id || newId();
  const rec = { amt, cat: A.cat, note: (A.note || '').trim(), date: A.date, rec: A.rec || null, created: A.created || Date.now() };
  const before = targetInfo(rec.cat, periodOf(rec.date)), sx = S.px, sy = S.py;
  closeSheet();
  if (periodOf(rec.date) !== S.period && S.view === 'home') S.period = periodOf(rec.date);
  putEntry(id, rec);
  if (isNew) { S.px = sx; S.py = sy; celebrate(rec, before); } else toast(t('updated'));
}

/* app-styled date picker (replaces the phone's default one) */
function openDatePicker(cur, onPick) {
  const td = todayStr(); let view = cur.slice(0, 7);
  const d = document.createElement('div'); d.className = 'modal-wrap';
  const draw = (dir = 0) => {
    const [y, m] = view.split('-').map(Number), first = toStr(y, m, 1), n = dim(y, m), lead = dow(first), canNext = view < td.slice(0, 7);
    let g = '';
    for (let i = 0; i < lead; i++) g += '<span></span>';
    for (let k = 1; k <= n; k++) { const ds = toStr(y, m, k); g += `<button class="dp-d ${ds === cur ? 'on' : ''} ${ds === td ? 'today' : ''}" data-d="${ds}" ${ds > td ? 'disabled' : ''}>${dg(k)}</button>`; }
    d.innerHTML = `<div class="modal dp"><div class="dp-head"><button class="ib" data-nav="-1" aria-label="prev">${I.left}</button><b>${MONTHS[P.lang][m - 1]} ${dg(y)}</b><button class="ib" data-nav="1" aria-label="next" ${canNext ? '' : 'disabled'}>${I.right}</button></div>
      <div class="dp-g wd">${WDAYS_S[P.lang].map(w => `<span>${w}</span>`).join('')}</div><div class="dp-g days ${dir > 0 ? 'in-l' : dir < 0 ? 'in-r' : ''}">${g}</div>
      <div class="row gap"><button class="btn soft grow" data-q="${td}">${t('today')}</button><button class="btn soft grow" data-q="${addDays(td, -1)}">${t('yesterday')}</button><button class="btn plain grow" data-x="1">${t('cancel')}</button></div></div>`;
  };
  const go = dir => { const nv = shiftPeriod(view, dir); if (nv > td.slice(0, 7)) return; view = nv; draw(dir); };
  draw();
  d.addEventListener('click', e => {
    if (e.target === d || e.target.closest('[data-x]')) return d.remove();
    const nav = e.target.closest('[data-nav]'), pick = e.target.closest('[data-d],[data-q]');
    if (nav && !nav.disabled) go(+nav.dataset.nav);
    else if (pick && !pick.disabled) { d.remove(); onPick(pick.dataset.d || pick.dataset.q); }
  });
  attachSwipe(d, go);
  document.body.appendChild(d);
}
function attachSwipe(el, cb) {
  let x0 = null, y0 = 0, t0 = 0;
  el.addEventListener('touchstart', e => { const p = e.touches[0]; x0 = p.clientX; y0 = p.clientY; t0 = Date.now(); }, { passive: true });
  el.addEventListener('touchend', e => {
    if (x0 === null) return;
    const p = e.changedTouches[0], dx = p.clientX - x0, dy = p.clientY - y0; x0 = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && Date.now() - t0 < 900) cb(dx < 0 ? 1 : -1);
  }, { passive: true });
}

/* ───────── font picker ───────── */
function openFonts(kind) {
  const list = kind === 'bn' ? FONTS_BN : FONTS_EN, cur = kind === 'bn' ? (P.fontBn || 'hind') : (P.fontEn || 'system');
  list.forEach(loadFont);
  const sample = kind === 'bn' ? 'টাকা যায় কই? ১২,৩৪৫' : 'Money Tracking 12,345';
  openSheet(`<h3>${kind === 'bn' ? t('fontBn') : t('fontEn')}</h3><div class="card list">${list.map(f => `<button class="lrow font-row ${f.id === cur ? 'on' : ''}" data-a="setFont" data-k="${kind}" data-v="${f.id}">
    <span class="grow"><small class="muted">${esc(f.name)}</small><span class="font-sample" style="font-family:${f.css}, ${kind === 'bn' ? 'sans-serif' : "'Hind Siliguri', sans-serif"}">${sample}</span></span>${f.id === cur ? `<span class="accent-t">${I.check}</span>` : ''}</button>`).join('')}</div>`, 'fonts');
}

/* tap on an existing expense → small menu first, so a stray tap never opens the editor */
function openEntryActions(id) {
  const e = S.entries.get(id); if (!e) return;
  const c = cat(e.cat);
  openSheet(`<div class="entry-sum">${catIcon(c, 'lg')}<div class="grow"><b>${esc(e.note || catName(c))}</b><small class="muted">${e.note ? esc(catName(c)) + ' · ' : ''}${dLong(e.date)}</small></div><b class="accent-t">${fmt(e.amt)}</b></div>
    <div class="act-row"><button class="btn soft grow" data-a="editEntry" data-id="${id}">${I.edit} ${t('entryEdit')}</button><button class="btn soft grow danger-t" data-a="delEntryQuick" data-id="${id}">${I.trash} ${t('delete')}</button></div>
    <button class="btn plain wide" data-a="closeSheet">${t('cancel')}</button>`, 'entry');
}

/* ───────── category editor (modal on top of any sheet) ───────── */
function openCatEditor(id = null, onDone = null) {
  const c = id ? cat(id) : null;
  if (!c && catLimitHit()) return openPaywall('cats');
  let emoji = c?.emoji || '🏷️', name = c ? catName(c) : '';
  const used = new Set(cats().map(x => (x.en || '').toLowerCase()));
  const presets = PRESETS.filter(p => !used.has(p.en.toLowerCase()));
  const d = document.createElement('div'); d.className = 'modal-wrap';
  const draw = () => {
    d.innerHTML = `<div class="modal"><div class="row between"><h3>${c ? t('editCat') : t('newCat')}</h3><button class="ib" data-m="close">${I.x}</button></div>
      <div class="cat-preview"><span class="eic lg" style="--c:${c?.color || '#9CA3AF'}">${emoji}</span><input id="cName" value="${esc(name)}" placeholder="${t('catNamePh')}" maxlength="24"></div>
      ${!c && presets.length ? `<small class="muted">${t('suggested')}</small><div class="chips presets">${presets.map(p => `<button class="chip sm" data-pre="${p.en}">${p.emoji} ${P.lang === 'bn' ? p.bn : p.en}</button>`).join('')}</div>` : ''}
      <small class="muted">${t('pickIcon')}</small>
      <div class="chips emoji-tabs">${EMOJI_GROUPS.map(g => `<button class="chip sm" data-eg="${g.id}">${g.list[0]} ${P.lang === 'bn' ? g.bn : g.en}</button>`).join('')}</div>
      <div class="emoji-box">${EMOJI_GROUPS.map(g => `<div class="eg-h" id="eg-${g.id}">${P.lang === 'bn' ? g.bn : g.en}</div><div class="emoji-grid">${g.list.map(e => `<button class="${e === emoji ? 'on' : ''}" data-em="${e}">${e}</button>`).join('')}</div>`).join('')}</div>
      <p class="err" id="cErr"></p>
      <div class="row gap">${c ? `<button class="btn soft grow" data-m="hide">${c.hidden ? t('show') : t('hide')}</button>` : ''}<button class="btn primary grow" data-m="save">${t('save')}</button></div></div>`;
    $('#cName', d).oninput = e => { name = e.target.value; };
  };
  draw();
  d.addEventListener('click', e => {
    if (e.target === d) return d.remove();
    const em = e.target.closest('[data-em]'), pre = e.target.closest('[data-pre]'), m = e.target.closest('[data-m]'), eg = e.target.closest('[data-eg]');
    if (eg) { const box = $('.emoji-box', d), h = $('#eg-' + eg.dataset.eg, d); box.scrollTo({ top: h.offsetTop - box.offsetTop, behavior: 'smooth' }); return; }
    if (em) { emoji = em.dataset.em; $('.cat-preview .eic', d).textContent = emoji; $$('[data-em]', d).forEach(b => b.classList.toggle('on', b === em)); buzz(5); return; }
    else if (pre) { const p = PRESETS.find(x => x.en === pre.dataset.pre); emoji = p.emoji; name = P.lang === 'bn' ? p.bn : p.en; d._preset = p; draw(); }
    else if (m?.dataset.m === 'close') d.remove();
    else if (m?.dataset.m === 'hide') { c.hidden = !c.hidden; saveSettings(); d.remove(); onDone?.(); scheduleRender(); }
    else if (m?.dataset.m === 'save') {
      name = name.trim(); if (!name) { $('#cErr', d).textContent = t('catNameReq'); return; }
      if (c) { c.emoji = emoji; if (name !== catName(c)) { c.bn = name; c.en = name; } }
      else {
        const dup = cats().find(x => [x.bn, x.en].some(n => (n || '').toLowerCase() === name.toLowerCase()));
        if (dup) { $('#cErr', d).textContent = t('catExists'); return; }
        const usedC = new Set(cats().map(x => x.color)), p = d._preset && (d._preset.bn === name || d._preset.en === name) ? d._preset : null;
        const nc = { id: 'c' + Date.now().toString(36), bn: p ? p.bn : name, en: p ? p.en : name, emoji, color: CAT_COLORS.find(x => !usedC.has(x)) || CAT_COLORS[cats().length % CAT_COLORS.length] };
        cats().push(nc); d._newId = nc.id;
      }
      saveSettings(); d.remove(); onDone?.(d._newId); scheduleRender();
    }
  });
  document.body.appendChild(d);
  if (!history.state?.sheet) history.pushState({ sheet: 1 }, '');
}

/* ───────── sheets: category detail, day, search ───────── */
function openCatDetail(id) {
  const c = cat(id), es = sortEntries(inPeriod(S.period).filter(e => e.cat === id)), total = sum(es), ti = targetInfo(id, S.period);
  const nm = new Map(); es.forEach(e => { const k = e.note || t('noNote'); nm.set(k, (nm.get(k) || 0) + e.amt); });
  const notes = [...nm].sort((a, b) => b[1] - a[1]), max = notes[0]?.[1] || 1;
  openSheet(`<div class="sheet-h">${catIcon(c)}<div class="grow"><h3>${esc(catName(c))}</h3><small class="muted">${periodTitle(S.period)}</small></div><b class="accent-t">${fmt(total)}</b></div>
    ${ti ? `<div class="card tline">${ring(ti.pct, { size: 56, label: dg(Math.round(ti.pct * 100)) + '%' })}<div><b>${t('targetOf', { a: fmt(ti.amt) })}</b><small class="muted">${ti.pct >= 1 ? t('overBy', { a: fmt(ti.spent - ti.amt) }) : t('leftAmt', { a: fmt(ti.amt - ti.spent) })}</small></div></div>` : `<button class="btn soft wide" data-a="targets">${I.target} ${t('setTargetFor')}</button>`}
    ${notes.length > 1 ? `<h4>${t('byNote')}</h4><div class="card">${notes.map(([k, v]) => `<div class="hbar static"><span class="hb-mid"><span class="row between"><b>${esc(k)}</b><b>${fmt(v)}</b></span><span class="track"><i style="width:${v / max * 100}%;background:${c.color}"></i></span></span></div>`).join('')}</div>` : ''}
    <h4>${t('entries')}</h4><div class="card list">${es.length ? es.map(e => entryRow(e, true)).join('') : `<p class="muted center pad">${t('noData')}</p>`}</div>
    <button class="btn primary wide" data-a="add" data-cat="${id}">${I.plus} ${t('addHere')}</button>`, 'cat', 'tall');
}
function openDay(d) {
  const es = sortEntries(all().filter(e => e.date === d));
  openSheet(`<div class="sheet-h"><div class="grow"><h3>${dLong(d)}</h3><small class="muted">${es.length ? t('nEntries', { n: dg(es.length) }) : t('nothingYet')}</small></div><b class="accent-t">${fmt(sum(es))}</b></div>
    ${es.length ? `<div class="card list">${es.map(e => entryRow(e)).join('')}</div>` : ''}
    <button class="btn primary wide" data-a="add" data-date="${d}">${I.plus} ${t('addThisDay')}</button>`, 'day');
}
function openSearch(q = '') {
  openSheet(`<div class="search"><div class="search-in">${I.search}<input id="sq" type="search" placeholder="${t('searchPh')}" value="${esc(q)}" autocomplete="off"></div><div id="sres"></div></div>`, 'search', 'tall');
  const inp = $('#sq'); inp.oninput = () => doSearch(inp.value); doSearch(q); setTimeout(() => inp.focus(), 250);
}
function doSearch(q) {
  const box = $('#sres'); if (!box) return;
  q = q.trim().toLowerCase();
  if (!q) {
    const f = new Map(); all().forEach(e => e.note && f.set(e.note, (f.get(e.note) || 0) + 1));
    const top = [...f].sort((a, b) => b[1] - a[1]).slice(0, 12);
    box.innerHTML = top.length ? `<small class="muted">${t('frequent')}</small><div class="chips">${top.map(([n]) => `<button class="chip" data-a="searchFor" data-v="${esc(n)}">${esc(n)}</button>`).join('')}</div>` : `<p class="muted center pad">${t('searchHint')}</p>`;
    return;
  }
  const res = sortEntries(all().filter(e => (e.note || '').toLowerCase().includes(q) || catName(cat(e.cat)).toLowerCase().includes(q)));
  if (!res.length) { box.innerHTML = `<p class="muted center pad">${t('noResult')}</p>`; return; }
  const thisPk = res.filter(e => periodOf(e.date) === periodOf(todayStr()));
  box.innerHTML = `<div class="stats3 two"><div class="card"><small>${t('allTime')}</small><b>${fmt(sum(res))}</b><small>${t('nEntries', { n: dg(res.length) })}</small></div>
    <div class="card"><small>${t('thisMonth')}</small><b>${fmt(sum(thisPk))}</b><small>${t('nEntries', { n: dg(thisPk.length) })}</small></div></div>
    <div class="card list">${res.slice(0, 150).map(e => entryRow(e, true)).join('')}</div>`;
}

/* ───────── targets ───────── */
function openTargets() {
  const tg = tgts(), lim = 0;
  openSheet(`<h3>${t('targets')}</h3><p class="muted small">${t('targetsBody')}</p>
    ${lim ? `<p class="pill">${t('freeTargetsN', { n: dg(lim) })}</p>` : ''}
    <div class="card list">${visCats().map(c => {
      const i = tg.findIndex(x => x.cat === c.id), v = i >= 0 ? tg[i].amt : '', paused = lim && i >= lim;
      return `<div class="lrow">${catIcon(c, 'sm')}<span class="grow">${esc(catName(c))}${paused ? `<small class="warn">${t('pausedPro')}</small>` : ''}</span>
        <span class="tin">৳<input type="number" inputmode="numeric" min="0" step="1" data-tcat="${c.id}" value="${v}" placeholder="—"></span></div>`;
    }).join('')}</div><button class="btn primary wide" data-a="saveTargets">${t('save')}</button>`, 'targets', 'tall');
}
function saveTargets() {
  const old = tgts(), next = [], since = periodOf(todayStr());
  const vals = new Map($$('[data-tcat]').map(i => [i.dataset.tcat, Math.round(+i.value || 0)]));
  old.forEach(x => { const v = vals.get(x.cat); if (v > 0) next.push({ cat: x.cat, amt: v, since: x.since || since }); vals.delete(x.cat); });
  vals.forEach((v, k) => { if (v > 0) next.push({ cat: k, amt: v, since }); });
  setTgts(next); saveSettings(); closeSheet(); render(); toast(t('saved'));
}

/* ───────── categories list ───────── */
function openCats() {
  openSheet(`<h3>${t('categories')}</h3><p class="muted small">${t('catsBody')}</p>
    ${proState().s !== 'pro' ? `<p class="pill">${t('catCount', { n: dg(cats().length), m: dg(C.FREE_CATS) })} ${proTag()}</p>` : ''}
    <div class="card list">${cats().map(c => `<button class="lrow ${c.hidden ? 'dim' : ''}" data-a="editCat" data-id="${c.id}">${catIcon(c, 'sm')}<span class="grow">${esc(catName(c))}${c.hidden ? `<small class="muted">${t('hidden')}</small>` : ''}</span><span class="chev">${I.chev}</span></button>`).join('')}</div>
    <button class="btn primary wide" data-a="newCatList">${I.plus} ${t('newCat')}</button>`, 'cats', 'tall');
}

/* ───────── recurring ───────── */
function openRecurring() {
  if (!isPro()) return openPaywall('recurring');
  const rs = S.settings.recurring;
  openSheet(`<h3>${t('recurring')}</h3><p class="muted small">${t('recBody')}</p>
    ${rs.length ? `<div class="card list">${rs.map(r => { const c = cat(r.cat); return `<div class="lrow ${r.active ? '' : 'dim'}">${catIcon(c, 'sm')}<span class="grow"><b>${esc(r.note || catName(c))}</b><small class="muted">${t('recEvery', { d: dg(r.day) })} · ${tk(r.amt)}</small></span>
      <button class="ib sm" data-a="recToggle" data-id="${r.id}">${r.active ? '⏸' : '▶'}</button><button class="ib sm" data-a="recDel" data-id="${r.id}">${I.trash}</button></div>`; }).join('')}</div>` : ''}
    <form class="card form" id="recForm"><b>${t('recNew')}</b>
      <select id="rCat" required>${visCats().map(c => `<option value="${c.id}">${c.emoji} ${esc(catName(c))}</option>`).join('')}</select>
      <input id="rNote" placeholder="${t('recNotePh')}" maxlength="40">
      <div class="row gap"><label class="grow">${t('amount')}<input id="rAmt" type="number" inputmode="numeric" min="1" required></label>
      <label class="grow">${t('recDay')}<select id="rDay">${[...Array(28)].map((_, i) => `<option value="${i + 1}">${dg(i + 1)}</option>`).join('')}</select></label></div>
      <button class="btn primary">${t('add')}</button></form>`, 'recurring', 'tall');
  $('#recForm').onsubmit = e => {
    e.preventDefault();
    rs.push({ id: Date.now().toString(36), cat: $('#rCat').value, note: $('#rNote').value.trim(), amt: Math.round(+$('#rAmt').value), day: +$('#rDay').value, start: todayStr().slice(0, 7), skip: [], active: true });
    saveSettings(); runRecurring(); openRecurring(); toast(t('saved'));
  };
}

/* ───────── theme ───────── */
function openTheme() {
  const member = proState().s === 'pro';
  const sw = th => {
    const locked = !th.free && !isPro();
    const bg = th.g ? `linear-gradient(135deg, ${th.color}, ${th.g})` : th.color;
    return `<button class="th ${P.theme === th.id ? 'on' : ''}" data-a="setTheme" data-v="${th.id}"><span class="dot-lg" style="background:${bg}">${locked ? '🔒' : P.theme === th.id ? I.check : ''}</span><small>${th[P.lang]}</small>${th.free || member ? '' : '<em>PRO</em>'}</button>`;
  };
  const groups = [['themesFree', THEMES.filter(x => x.free)], ['themesPro', THEMES.filter(x => !x.free)]];
  openSheet(`<h3>${t('theme')}</h3>${groups.map(([k, list]) => `<h4>${t(k)}</h4><div class="themes">${list.map(sw).join('')}</div>`).join('')}
  <div class="seg">${['light', 'dark', 'system'].map(m => `<button class="${P.mode === m ? 'on' : ''}" data-a="mode" data-v="${m}">${t('mode_' + m)}</button>`).join('')}</div>`, 'theme');
}

/* ───────── backup sign-in (one time) ───────── */
let authTab = 'signup', afterAuth = null;
function openBackup(then = null) {
  if (then) afterAuth = then;
  openSheet(`<div class="auth-sheet"><div class="bk-hero">${I.cloud}</div><h3 class="center">${t('backupTitle')}</h3><p class="muted small center">${t('backupLong')}</p>
    <div class="seg"><button class="${authTab === 'signup' ? 'on' : ''}" data-a="authTab" data-v="signup">${t('newAccount')}</button><button class="${authTab === 'login' ? 'on' : ''}" data-a="authTab" data-v="login">${t('haveAccount')}</button></div>
    <form id="authForm" class="form"><input name="email" type="email" required autocomplete="email" inputmode="email" placeholder="${t('email')}">
      <input name="pw" type="password" required minlength="6" autocomplete="${authTab === 'login' ? 'current-password' : 'new-password'}" placeholder="${t('password')}">
      <p class="err" id="authErr"></p><button class="btn primary big" type="submit">${authTab === 'login' ? t('signIn') : t('createAccount')}</button></form>
    ${authTab === 'login' ? `<button class="link" data-a="forgotPw">${t('forgotPw')}</button>` : ''}
    ${isDemo ? `<p class="demo-note">${t('demoNote')}</p>` : ''}</div>`, 'backup');
  $('#authForm').onsubmit = async e => {
    e.preventDefault();
    const f = e.target, b = f.querySelector('button'); b.disabled = true; $('#authErr').textContent = '';
    try {
      if (authTab === 'signup') {
        const r = await store.signUp(f.email.value, f.pw.value);
        if (r.needsConfirm) {   // Supabase "Confirm email" is on: verify first, then sign in here
          authTab = 'login'; openBackup();
          $('#authErr').textContent = t('confirmEmailSent', { e: f.email.value.trim() }); $('#authErr').classList.add('ok');
          return;
        }
      } else { S.preferRemote = true; await store.signIn(f.email.value, f.pw.value); }
      closeSheet(); toast(t('backupOnToast'), { big: true });
      await sync(); render();
      const next = afterAuth; afterAuth = null; if (next) setTimeout(next, 350);
    } catch (er) { console.warn(er); S.preferRemote = false; $('#authErr').textContent = authErr(er); b.disabled = false; }
  };
}
function openNewPassword() {
  openSheet(`<div class="auth-sheet"><div class="bk-hero">${I.cloud}</div><h3 class="center">${t('newPwTitle')}</h3>
    <form id="npForm" class="form"><input id="npIn" type="password" minlength="6" required autocomplete="new-password" placeholder="${t('password')}">
    <p class="err" id="npErr"></p><button class="btn primary big">${t('save')}</button></form></div>`, 'newpw');
  $('#npForm').onsubmit = async e => {
    e.preventDefault();
    try { await store.updatePassword($('#npIn').value); closeSheet(); toast(t('pwUpdated')); history.replaceState(null, '', location.pathname); }
    catch (er) { $('#npErr').textContent = authErr(er); }
  };
}
const authErr = e => {
  const map = { 'auth/invalid-credential': 'errCred', 'auth/email-already-in-use': 'errExists', 'auth/weak-password': 'errWeak', 'auth/invalid-email': 'errEmail', 'auth/network-request-failed': 'netError', 'auth/too-many-requests': 'errMany', 'auth/email-not-confirmed': 'errNotConfirmed', net: 'netError', 'demo/no-reset': 'errDemoReset' };
  return t(map[e?.code] || 'errGeneric');
};

/* ───────── book switcher & shared family book ───────── */
// one shared book per person → a single tap swaps between "my book" and the shared book
function bookChip() {
  const b = S.user && S.books?.[0]; if (!b) return '';
  return `<button class="book-switch" data-a="bookSwap" aria-label="${t('swapBook')}">
    <span class="${!S.meta ? 'on' : ''}">👤 ${t('myBook')}</span><span class="swap-ic">${I.swap}</span><span class="${S.meta ? 'on' : ''}">📒 ${esc(b.name)}</span></button>`;
}
function openBookPick() {
  openSheet(`<h3>${t('pickBook')}</h3><div class="card list">
    <button class="lrow ${!S.meta ? 'on-row' : ''}" data-a="goBook" data-v="me">👤<span class="grow"><b>${t('myBook')}</b><small class="muted">${t('myBookSub')}</small></span>${!S.meta ? I.check : ''}</button>
    ${S.books.map(b => `<button class="lrow ${S.bookId === b.id ? 'on-row' : ''}" data-a="goBook" data-v="${b.id}">📒<span class="grow"><b>${esc(b.name)}</b><small class="muted">${t('nMembers', { n: dg(b.members.length) })}</small></span>${S.bookId === b.id ? I.check : ''}</button>`).join('')}
  </div><button class="btn soft wide" data-a="shared">${t('manageBooks')}</button>`, 'bookpick');
}
function openShared() {
  if (!S.user) return openBackup(openShared);
  const books = S.books || [];
  if (books.length) return openBookDetail(books[0].id);
  openSheet(`<h3>${t('sharedBook')}</h3><p class="muted small">${t('sharedIntro')}</p>
    ${books.length ? `<div class="card list">${books.map(b => `<button class="lrow" data-a="bookDetail" data-v="${b.id}">📒<span class="grow"><b>${esc(b.name)}</b><small class="muted">${t('nMembers', { n: dg(b.members.length) })}${b.owner === S.user.uid ? ' · ' + t('owner') : ''}</small></span><span class="chev">${I.chev}</span></button>`).join('')}</div>` : ''}
    <div class="card form"><b>${t('createBook')}</b><small class="muted">${isPro() ? t('createBookSub') : t('createBookPro')}</small>
      <input id="bkName" placeholder="${t('bookNamePh')}" value="${t('familyBook')}" maxlength="30"><button class="btn primary" data-a="createBook">${isPro() ? '' : '👑 '}${t('createBtn')}</button></div>
    <div class="card form"><b>${t('joinBook')}</b><small class="muted">${t('joinBookSub')}</small>
      <input id="bkCode" placeholder="K7P2QX" maxlength="6" autocapitalize="characters" autocomplete="off" class="code-in"><p class="err" id="bkErr"></p><button class="btn soft" data-a="joinBook">${t('joinBtn')}</button></div>`, 'shared', 'tall');
}
function openBookDetail(id) {
  const b = (S.books || []).find(x => x.id === id); if (!b) return openShared();
  const own = b.owner === S.user.uid;
  openSheet(`<div class="sheet-h"><span class="eic" style="--c:var(--accent)">📒</span><div class="grow"><h3>${esc(b.name)}</h3><small class="muted">${own ? t('owner') : t('member')}</small></div></div>
    ${own ? `<div class="card code-card"><small class="muted">${t('inviteCode')}</small><div class="code">${esc(b.code)}</div>
      <div class="row gap"><button class="btn soft grow" data-a="copyText" data-v="${esc(b.code)}">${t('copy')}</button><button class="btn primary grow" data-a="shareCode" data-v="${esc(b.code)}">${t('share')}</button></div></div>` : ''}
    <h4>${t('members')}</h4><div class="card list">${b.members.map(m => `<div class="lrow"><span class="avatar-sm">${esc(m.email[0].toUpperCase())}</span><span class="grow"><b>${esc(m.uid === S.user.uid ? t('me') : m.email.split('@')[0])}</b><small class="muted">${esc(m.email)}${m.uid === b.owner ? ' · ' + t('owner') : ''}</small></span>
      ${own && m.uid !== b.owner ? `<button class="ib sm danger-t" data-a="kick" data-v="${id}" data-u="${m.uid}">${I.x}</button>` : ''}</div>`).join('')}</div>
    <button class="btn primary wide" data-a="goBook" data-v="${id}">${t('openBook')}</button>
    ${isDemo && own ? `<button class="btn soft wide" data-a="demoPartner" data-v="${id}">${t('demoPartner')}</button>` : ''}
    ${!own ? `<button class="btn soft wide danger-t" data-a="leaveBook" data-v="${id}">${t('leaveBook')}</button>` : `<button class="btn soft wide danger-t" data-a="deleteBook" data-v="${id}">${t('deleteBook')}</button>`}`, 'bookdetail', 'tall');
}
function whoSpent(es) {
  const m = new Map(); es.forEach(e => m.set(e.by || '', (m.get(e.by || '') || 0) + e.amt));
  const list = [...m].sort((a, b) => b[1] - a[1]), max = list[0]?.[1] || 1, total = sum(es) || 1;
  return `<div class="sec-h"><h3>${t('whoSpent')}</h3></div><div class="card legend-bars">${list.map(([uid, v]) => `<div class="lb"><span class="lb-top"><span class="avatar-sm">${esc(memberName(uid)[0] || '?')}</span><span class="lb-name">${esc(memberName(uid))}</span><b>${fmt(v)}</b><small>${dg(Math.round(v / total * 100))}%</small></span>
    <span class="lb-track"><i style="width:${(v / max * 100).toFixed(1)}%;background:var(--accent-bg)"></i></span></div>`).join('')}</div>`;
}

/* ───────── monthly insights (Pro) ───────── */
function cInsights() {
  if (!isPro()) return `<div class="card insight-lock"><div class="crown">${I.crown}</div><b>${t('ps_insights')}</b><p class="muted small">${t('psd_insights')}</p><button class="btn primary" data-a="pay">${t('getPro')}</button></div>`;
  const pk = S.period, [a, b] = periodRange(pk), td = todayStr(), isCur = td >= a && td <= b, es = inPeriod(pk);
  if (!es.length) return `<div class="empty"><p>${t('noData')}</p></div>`;
  const total = sum(es), n = diffDays(a, b) + 1, end = isCur ? td : b, elapsed = diffDays(a, end) + 1, cards = [];
  if (isCur && elapsed >= 3 && elapsed < n) cards.push(['📈', t('in_proj', { a: fmt(Math.round(total / elapsed * n / 100) * 100) })]);
  const [pa, pb] = periodRange(shiftPeriod(pk, -1)), pe = addDays(pa, elapsed - 1) > pb ? pb : addDays(pa, elapsed - 1);
  const A = byCat(es.filter(e => e.date <= end)), B = byCat(inRange(pa, pe));
  const ch = [...new Set([...A.keys(), ...B.keys()])].map(id => [id, (A.get(id) || 0), (B.get(id) || 0)]).filter(x => x[2] > 0);
  const up = ch.filter(x => x[1] > x[2]).sort((x, y) => (y[1] - y[2]) - (x[1] - x[2]))[0];
  const down = ch.filter(x => x[1] < x[2]).sort((x, y) => (x[1] - x[2]) - (y[1] - y[2]))[0];
  if (up) cards.push(['⬆️', t('in_up', { c: catName(cat(up[0])), p: dg(Math.round((up[1] - up[2]) / up[2] * 100)), a: fmt(up[1] - up[2]) })]);
  if (down) cards.push(['⬇️', t('in_down', { c: catName(cat(down[0])), p: dg(Math.round((down[2] - down[1]) / down[2] * 100)), a: fmt(down[2] - down[1]) })]);
  const wd = Array(7).fill(0); es.forEach(e => { wd[dow(e.date)] += e.amt; });
  const wmax = wd.indexOf(Math.max(...wd)); if (wd[wmax] > 0) cards.push(['📅', t('in_wday', { d: WDAYS[P.lang][wmax], a: fmt(wd[wmax]) })]);
  const days = new Set(es.map(e => e.date)), zero = elapsed - [...days].filter(d => d <= end).length;
  cards.push(zero > 0 ? ['🌿', t('in_zero', { n: dg(zero) })] : ['🔥', t('in_nozero')]);
  const nm = new Map(); es.forEach(e => { if (e.note) nm.set(e.note, (nm.get(e.note) || 0) + e.amt); });
  const topN = [...nm].sort((x, y) => y[1] - x[1])[0]; if (topN) cards.push(['🏷️', t('in_note', { n: esc(topN[0]), a: fmt(topN[1]) })]);
  const bigE = [...es].sort((x, y) => y.amt - x.amt)[0];
  cards.push(['💸', t('in_big', { n: esc(bigE.note || catName(cat(bigE.cat))), a: fmt(bigE.amt), d: dShort(bigE.date) })]);
  return `<p class="hint">${isCur ? t('in_sub', { d: dg(elapsed) }) : periodTitle(pk)}</p>` + cards.map(([ic, txt], i) => `<div class="card insight" style="animation-delay:${i * 60}ms"><span class="in-ic">${ic}</span><p>${txt}</p></div>`).join('');
}

/* ───────── app lock (fingerprint / face via the phone's own lock) ───────── */
const lockCfg = () => safe(localStorage.getItem('tk_lock'), null);
const rnd = n => crypto.getRandomValues(new Uint8Array(n));
const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64u = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
async function bioAvailable() { try { return !!window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(); } catch { return false; } }
async function enableLock() {
  if (!isPro()) return openPaywall();
  let cred = null;
  if (await bioAvailable()) {
    try {
      const c = await navigator.credentials.create({ publicKey: { challenge: rnd(32), rp: { name: 'Taka Jay Koi' }, user: { id: rnd(16), name: 'taka-user', displayName: t('appName') },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }], authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'discouraged' }, timeout: 60000, attestation: 'none' } });
      cred = b64u(c.rawId);
    } catch (e) { console.warn(e); if (e.name === 'NotAllowedError' && !isDemo) { toast(t('lockCancelled')); return render(); } }
  }
  if (!cred) {
    if (!isDemo) { toast(t('lockUnavailable'), { type: 'warn' }); return render(); }
    if (!await askConfirm(t('lockDemoAsk'), t('yes'), false)) return render();
    cred = 'demo';
  }
  localStorage.setItem('tk_lock', JSON.stringify({ cred, after: 60 })); toast(t('lockOn')); render();
}
async function disableLock() {
  if (!await verifyLock()) return render();
  localStorage.removeItem('tk_lock'); toast(t('lockOff')); render();
}
async function verifyLock() {
  const lc = lockCfg(); if (!lc) return true;
  if (lc.cred === 'demo') { await new Promise(r => setTimeout(r, 500)); return true; }
  try { await navigator.credentials.get({ publicKey: { challenge: rnd(32), allowCredentials: [{ type: 'public-key', id: unb64u(lc.cred), transports: ['internal'] }], userVerification: 'required', timeout: 60000 } }); return true; }
  catch (e) { console.warn(e); return false; }
}
function showLock() {
  if ($('#lock')) return;
  const d = document.createElement('div'); d.id = 'lock';
  d.innerHTML = `<img class="app-logo" src="icons/icon.svg" alt=""><h2>${t('appName')}</h2><p class="muted">${t('lockedMsg')}</p>
    <button class="finger" data-unlock="1">${I.finger}</button><button class="btn primary" data-unlock="1">${t('unlockBtn')}</button><p class="err" id="lockErr"></p>`;
  d.addEventListener('click', async e => {
    if (!e.target.closest('[data-unlock]')) return;
    d.classList.add('checking');
    if (await verifyLock()) { d.classList.add('out'); setTimeout(() => d.remove(), 250); }
    else { d.classList.remove('checking'); $('#lockErr').textContent = t('unlockFail'); }
  });
  document.body.appendChild(d);
}

/* ───────── share the app ───────── */
const appLink = () => location.origin + location.pathname.replace(/(index|admin)\.html$/, '');
function shareCard() {
  const url = encodeURIComponent(appLink()), msg = encodeURIComponent(t('shareMsg') + ' ' + appLink());
  const ext = [
    ['WhatsApp', '#25D366', `https://wa.me/?text=${msg}`],
    ['Facebook', '#1877F2', `https://www.facebook.com/sharer/sharer.php?u=${url}`],
    ['Messenger', '#0084FF', `fb-messenger://share/?link=${url}`],
    ['Telegram', '#229ED9', `https://t.me/share/url?url=${url}&text=${encodeURIComponent(t('shareMsg'))}`],
  ];
  return `<div class="sec-h"><h3>${t('shareTitle')}</h3></div><div class="card share-card">
    <p class="muted small">${t('shareSub')}</p>
    <button class="btn primary wide" data-a="shareNative">${I.share} ${t('shareBtn')}</button>
    <div class="share-row">${ext.map(([n, c, href]) => `<a class="share-ic" href="${href}" target="_blank" rel="noopener"><span style="background:${c}">${n[0]}</span><small>${n}</small></a>`).join('')}
      <button class="share-ic" data-a="copyText" data-v="${esc(appLink())}"><span class="copy">${I.link}</span><small>${t('copyLink')}</small></button></div></div>`;
}

/* ───────── privacy note & about the developer ───────── */
function openPrivacy() {
  openSheet(`<h3>${t('privacy')}</h3><div class="prose">${t('privacyBody')}</div>
    <button class="btn primary wide" data-a="closeSheet">${t('done')}</button>`, 'privacy', 'tall');
}
function openAboutDev() {
  openSheet(`<div class="about"><img class="app-logo" src="icons/icon.svg" alt=""><h2 class="center">${t('appName')}</h2>
    <p class="muted small center">${t('tagline')} · v${C.APP_VERSION}</p><div class="about-sep"></div>
    <small class="muted center">${t('aboutDev')}</small><h3 class="center">${esc(DEVELOPER.name)}</h3>
    <div class="card list"><a class="lrow" href="mailto:${DEVELOPER.email}">${I.mail}<span class="grow">${esc(DEVELOPER.email)}</span><span class="chev">${I.chev}</span></a></div>
    <button class="btn soft wide" data-a="copyText" data-v="${esc(DEVELOPER.email)}">${t('copyEmail')}</button>
    <p class="hint">${t('devNote')}</p></div>`, 'about');
}

/* ───────── Pro ───────── */
const PRO_FEATS = [
  { k: 'insights', ic: 'chart', go: 'goInsights' }, { k: 'shared', ic: 'users', go: 'shared' }, { k: 'cats', ic: 'tag', go: 'cats' },
  { k: 'themes', ic: 'palette', go: 'theme' }, { k: 'lock', ic: 'finger', go: 'goSettings' }, { k: 'hide', ic: 'eye', go: 'goSettings' },
  { k: 'export', ic: 'download', go: 'export' }, { k: 'recurring', ic: 'repeat', go: 'recurring' }, { k: 'fx', ic: 'medal' },
];
const PRO_SOON = [];
function featList(owned) {
  return `<div class="card list feat-list">${PRO_FEATS.map(f => `<${owned && f.go ? 'button' : 'div'} class="lrow feat" ${owned && f.go ? `data-a="proGo" data-v="${f.go}"` : ''}>
    <span class="feat-ic">${owned ? I.check : I[f.ic]}</span><span class="grow"><b>${t('pf_' + f.k)}</b><small class="muted">${t('pd_' + f.k)}</small></span>${owned && f.go ? `<span class="chev">${I.chev}</span>` : ''}</${owned && f.go ? 'button' : 'div'}>`).join('')}</div>
    ${PRO_SOON.length ? `<h4>${t('comingSoon')}</h4>` : ''}<div class="card list feat-list ${PRO_SOON.length ? '' : 'hidden'}">${PRO_SOON.map(k => `<div class="lrow feat soon"><span class="feat-ic">✨</span><span class="grow"><b>${t('ps_' + k)}</b><small class="muted">${t('psd_' + k)}</small></span></div>`).join('')}</div>`;
}
function openPaywall(reason = '') {
  const ps = proState();
  if (ps.s === 'pro') return openProBenefits();
  openSheet(`<div class="paywall"><div class="crown">${I.crown}</div><h2>${t('proName')}</h2>
    ${reason ? `<p class="pill">${t('why_' + reason)}</p>` : ''}
    ${ps.s === 'trial' ? `<p class="trial-note">${t('trialUsing', { d: dg(ps.left) })}</p>` : ''}</div>
    <h4>${t('youGet')}</h4>${featList(false)}
    <div class="paywall"><div class="price"><b>৳${dg(C.PRO_PRICE)}</b><small>${t('oneTime')}</small></div>
    <button class="btn primary big" data-a="payNow">${t('payBkash')}</button><p class="hint">${t('freeForever')}</p></div>`, 'paywall', 'tall');
}
function openProBenefits() {
  const ps = proState();
  openSheet(`<div class="paywall"><div class="crown">${I.crown}</div><h2>${t('youArePro')}</h2>
    ${ps.since ? `<p class="muted small">${t('proSince', { d: dLong(new Date(ps.since).toISOString().slice(0, 10)) })}</p>` : ''}</div>
    <h4>${t('youHave')}</h4>${featList(true)}<p class="hint">${t('thanks')}</p>`, 'benefits', 'tall');
}
function openPay() {
  if (!S.user) return openBackup(openPay);
  if (proState().s === 'pro') return openSheet(`<div class="paywall"><div class="crown">${I.crown}</div><h2>${t('youArePro')}</h2><p class="muted">${t('thanks')}</p><button class="btn primary big" data-a="closeSheet">${t('done')}</button></div>`, 'pay');
  const pend = S.payments.find(p => p.status === 'pending'), rej = S.payments.find(p => p.status === 'rejected');
  const html = `<h3>${t('proTitle', { p: dg(C.PRO_PRICE) })}</h3>
    ${pend ? `<div class="card status pending">⏳<div><b>${t('payPending')}</b><small>TrxID: ${esc(pend.trxId)}</small></div></div>` : ''}
    ${!pend && rej ? `<div class="card status rejected">⚠️<div><b>${t('payRejected')}</b><small>TrxID: ${esc(rej.trxId)}</small></div></div>` : ''}
    <ol class="steps"><li>${t('step1', { p: dg(C.PRO_PRICE) })}<div class="bk-num"><b>${esc(C.BKASH_NUMBER)}</b><button class="chip sm" data-a="copyText" data-v="${esc(C.BKASH_NUMBER)}">${t('copy')}</button></div></li><li>${t('step2')}</li><li>${t('step3')}</li></ol>
    <form class="card form" id="payForm"><label>TrxID<input id="trx" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="BK7A9X2QPL" required maxlength="12"></label>
      <label>${t('senderLast')}<input id="sndr" inputmode="numeric" maxlength="4" placeholder="1234"></label>
      <p class="err" id="payErr"></p><button class="btn primary big" ${pend ? 'disabled' : ''}>${pend ? t('waiting') : t('submitTrx')}</button></form>
    <p class="hint">${t('payNote')}</p>`;
  if (S.sheet === 'pay') refreshSheet(html); else openSheet(html, 'pay', 'tall');
  $('#payForm').onsubmit = async e => {
    e.preventDefault();
    const trx = $('#trx').value.trim().toUpperCase();
    if (!validTrxId(trx)) { $('#payErr').textContent = t('trxInvalid'); return; }
    const b = e.target.querySelector('button'); b.disabled = true;
    try { await payments.submitManual({ trxId: trx, sender: $('#sndr').value.replace(/\D/g, '').slice(-4) }); toast(t('trxSent')); }
    catch (er) { $('#payErr').textContent = er.code === 'pay/duplicate' ? t('trxDup') : t('errGeneric'); b.disabled = false; }
  };
}

/* ───────── export ───────── */
function openExport() {
  if (!isPro()) return openPaywall('export');
  S.exRange = 'period';
  openSheet(`<h3>${t('export')}</h3><p class="muted small">${t('exportBody')}</p>
    <div class="seg" id="exRange"><button class="on" data-a="exRange" data-v="period">${periodTitle(S.period)}</button><button data-a="exRange" data-v="year">${dg(S.period.slice(0, 4))}</button></div>
    <div class="row gap"><button class="btn primary grow" data-a="doExport" data-v="csv">Excel</button><button class="btn primary grow" data-a="doExport" data-v="pdf">PDF</button></div>`, 'export');
}
function doExport(kind) {
  let es, title;
  if (S.exRange === 'year') { const y = S.period.slice(0, 4); es = all().filter(e => periodOf(e.date).startsWith(y)); title = dg(y); }
  else { es = inPeriod(S.period); title = periodTitle(S.period); }
  es = sortEntries(es).reverse();
  if (!es.length) return toast(t('noData'));
  if (kind === 'csv') {
    const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [[t('date'), t('category'), t('note'), t('amount')], ...es.map(e => [e.date, catName(cat(e.cat)), e.note, e.amt])];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + rows.map(r => r.map(q).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    a.download = `taka-jay-koi-${title.replace(/\s+/g, '-')}.csv`; a.click(); return;
  }
  const m = [...byCat(es)].sort((a, b) => b[1] - a[1]), total = sum(es), acc = getComputedStyle(document.documentElement).getPropertyValue('--accent');
  const html = `<!doctype html><html lang="${P.lang}"><head><meta charset="utf-8"><title>${t('appName')} — ${title}</title><link href="${new URL('fonts/fonts.css', location.href)}" rel="stylesheet">
  <style>body{font-family:'Hind Siliguri',system-ui,sans-serif;margin:28px;color:#111}h1{margin:0;color:${acc}}table{width:100%;border-collapse:collapse;margin:14px 0;font-size:13px}th,td{border-bottom:1px solid #e5e7eb;padding:6px 8px;text-align:left}.r{text-align:right}@media print{button{display:none}}</style></head><body>
  <h1>${t('appName')}</h1><p>${title} · ${t('total')}: <b>${tk(total)}</b></p>
  <table><tr><th>${t('category')}</th><th class="r">${t('amount')}</th><th class="r">%</th></tr>${m.map(([id, v]) => `<tr><td>${cat(id).emoji} ${esc(catName(cat(id)))}</td><td class="r">${tk(v)}</td><td class="r">${dg((v / total * 100).toFixed(1))}</td></tr>`).join('')}</table>
  <table><tr><th>${t('date')}</th><th>${t('category')}</th><th>${t('note')}</th><th class="r">${t('amount')}</th></tr>${es.map(e => `<tr><td>${dShort(e.date)}</td><td>${esc(catName(cat(e.cat)))}</td><td>${esc(e.note)}</td><td class="r">${tk(e.amt)}</td></tr>`).join('')}</table>
  <button onclick="print()">PDF</button><script>setTimeout(()=>print(),600)<\/script></body></html>`;
  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); } else toast(t('popupBlocked'));
}

/* ───────── month card ───────── */
async function monthCard() {
  const pk = S.period, es = inPeriod(pk), total = sum(es);
  if (!es.length) return toast(t('noData'));
  const m = [...byCat(es)].sort((a, b) => b[1] - a[1]), tg = activeTargets(), bc = byCat(es), kept = tg.filter(x => (bc.get(x.cat) || 0) <= x.amt).length;
  const cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1350;
  const g = cv.getContext('2d'), acc = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  try { await document.fonts.load('700 40px "Hind Siliguri"'); } catch { }
  const F = (w, s) => `${w} ${s}px "Hind Siliguri", system-ui, sans-serif`;
  g.fillStyle = acc; g.fillRect(0, 0, 1080, 1350);
  g.fillStyle = '#fff'; g.font = F(600, 44); g.fillText(t('appName'), 80, 120);
  g.font = F(700, 76); g.fillText(periodTitle(pk), 80, 240);
  g.globalAlpha = .85; g.font = F(400, 40); g.fillText(t('spentThisPeriod'), 80, 360); g.globalAlpha = 1;
  g.font = F(700, 140); g.fillText(tk(total), 80, 500);
  let y = 650;
  m.slice(0, 4).forEach(([id, v]) => {
    const c = cat(id);
    g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(80, y - 50, 920, 64);
    g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(80, y - 50, 920 * v / total, 64);
    g.fillStyle = '#fff'; g.font = F(600, 36); g.fillText(`${c.emoji} ${catName(c)}`, 100, y - 6);
    g.textAlign = 'right'; g.fillText(tk(v), 980, y - 6); g.textAlign = 'left'; y += 84;
  });
  y += 60; g.font = F(600, 42);
  if (tg.length) { g.fillText(t('cardTargets', { k: dg(kept), n: dg(tg.length) }), 80, y); y += 70; }
  g.fillText(t('cardStreak', { n: dg(bestStreak()) }), 80, y);
  const blob = await new Promise(r => cv.toBlob(r, 'image/png')), file = new File([blob], `taka-jay-koi-${pk}.png`, { type: 'image/png' });
  openSheet(`<h3>${t('monthCard')}</h3><img class="card-img" src="${URL.createObjectURL(blob)}" alt=""><button class="btn primary wide" id="shareCard">${I.share} ${t('share')}</button>`, 'card');
  $('#shareCard').onclick = async () => {
    if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: t('appName') }); } catch { } }
    else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; a.click(); }
  };
}
function openMonthStart() {
  openSheet(`<h3>${t('monthStart')}</h3><p class="muted small">${t('monthStartBody')}</p><div class="daygrid">${[...Array(28)].map((_, i) => `<button class="${mStart() === i + 1 ? 'on' : ''}" data-a="setMs" data-v="${i + 1}">${dg(i + 1)}</button>`).join('')}</div>`, 'ms');
}

/* ───────── actions ───────── */
const ACT = {
  closeSheet: () => closeSheet(),
  async copyText(el) { try { await navigator.clipboard.writeText(el.dataset.v); toast(t('copied')); } catch { toast(el.dataset.v); } },
  nav: el => { S.view = el.dataset.v; closeSheet(); render(); scrollTo(0, 0); },
  pshift: el => { S.period = shiftPeriod(S.period, +el.dataset.v); render(); },
  pnow: () => { S.period = periodOf(todayStr()); render(); },
  yshift: el => { S.year += +el.dataset.v; render(); },
  ctab: el => { S.chartTab = el.dataset.v; if (S.chartTab === 'year') S.year = +S.period.slice(0, 4); render(); },
  exBig: el => { S.exBig = el.checked; render(); },
  dayTap: el => { const d = addDays(periodRange(S.period)[0], +el.dataset.i); if (d <= todayStr()) openDay(d); },
  monthTap: el => { S.period = `${S.year}-${pad(+el.dataset.i + 1)}`; S.chartTab = 'month'; render(); },
  day: el => openDay(el.dataset.v),
  catd: el => openCatDetail(el.dataset.id),
  search: () => openSearch(),
  searchFor: el => { if (S.sheet === 'search') { $('#sq').value = el.dataset.v; doSearch(el.dataset.v); } else openSearch(el.dataset.v); },
  nudgeX: () => { localStorage.setItem('tk_nudge_x', todayStr()); render(); },
  bkX: () => { localStorage.setItem('tk_bk_x', todayStr()); render(); },

  add: el => openAdd({ date: el.dataset.date, cat: el.dataset.cat }),
  edit: el => openEntryActions(el.dataset.id),
  editEntry: el => openAdd({ id: el.dataset.id }),
  async delEntryQuick(el) { if (await askConfirm(t('delConfirm'), t('delete'))) { closeSheet(); delEntry(el.dataset.id); toast(t('deleted')); } },
  key: el => keyPress(el.dataset.v),
  acat: el => { A.cat = el.dataset.id; buzz(5); $$('#catgrid .cg').forEach(b => b.classList.toggle('on', b.dataset.id === A.cat)); $('#tags').innerHTML = tagsHTML(); if (A.more) { A.more = false; $('#catgrid').classList.remove('open'); $('#catgrid').innerHTML = catTiles(); } },
  moreCats: () => { A.more = true; $('#catgrid').classList.add('open'); $('#catgrid').innerHTML = catTiles(); },
  newCat: () => openCatEditor(null, id => { if (id) A.cat = id; A.more = false; if (S.sheet === 'add') { $('#catgrid').classList.remove('open'); $('#catgrid').innerHTML = catTiles(); $('#tags').innerHTML = tagsHTML(); } }),
  atag: el => { A.note = A.note === el.dataset.v ? '' : el.dataset.v; $('#noteIn').value = A.note; $$('#tags .chip[data-v]').forEach(c => c.classList.toggle('on', c.dataset.v === A.note)); },
  pickDate: () => openDatePicker(A.date, d => { A.date = d; rerenderAdd(); }),
  fontBn: () => openFonts('bn'),
  fontEn: () => openFonts('en'),
  setFont: el => { setPref(el.dataset.k === 'bn' ? 'fontBn' : 'fontEn', el.dataset.v); openFonts(el.dataset.k); render(); },
  adate: el => { A.date = el.dataset.v; rerenderAdd(); },
  saveAdd: () => saveAdd(),
  async delEntry() { if (await askConfirm(t('delConfirm'), t('delete'))) { const id = A.id; closeSheet(); delEntry(id); toast(t('deleted')); } },

  targets: () => openTargets(),
  saveTargets: () => saveTargets(),
  cats: () => openCats(),
  editCat: el => openCatEditor(el.dataset.id, () => openCats()),
  newCatList: () => openCatEditor(null, () => openCats()),
  recurring: () => openRecurring(),
  recToggle: el => { const r = S.settings.recurring.find(x => x.id === el.dataset.id); r.active = !r.active; saveSettings(); runRecurring(); openRecurring(); },
  async recDel(el) { if (!await askConfirm(t('recDelConfirm'), t('delete'))) return; S.settings.recurring = S.settings.recurring.filter(x => x.id !== el.dataset.id); saveSettings(); openRecurring(); },
  export: () => openExport(),
  exRange: el => { S.exRange = el.dataset.v; $$('#exRange button').forEach(b => b.classList.toggle('on', b === el)); },
  doExport: el => doExport(el.dataset.v),
  monthCard: () => monthCard(),
  monthStart: () => openMonthStart(),
  setMs: el => { S.settings.monthStart = +el.dataset.v; saveSettings(); S.period = periodOf(todayStr()); closeSheet(); render(); toast(t('saved')); },
  theme: () => openTheme(),
  setTheme: el => { const th = THEMES.find(x => x.id === el.dataset.v); if (!th.free && !isPro()) return openPaywall('themes'); setPref('theme', th.id); openTheme(); render(); },
  mode: el => { setPref('mode', el.dataset.v); if (S.sheet === 'theme') openTheme(); render(); },
  lang: el => { setPref('lang', el.dataset.v); render(); },
  digits: el => { setPref('digits', el.dataset.v); render(); },

  backup: () => openBackup(),
  authTab: el => { authTab = el.dataset.v; openBackup(); },
  async forgotPw() {
    const email = $('#authForm input[name=email]').value;
    if (!email) { $('#authErr').textContent = t('enterEmailFirst'); return; }
    try { await store.resetPassword(email); $('#authErr').textContent = t('resetSent'); } catch (e) { $('#authErr').textContent = authErr(e); }
  },
  syncNow: () => sync(),
  async logout() {
    if (!await askConfirm(t('logoutConfirm'), t('logout'))) return;
    await sync();
    if (S.dirty.size) { toast(t('logoutUnsynced'), { type: 'warn' }); return; }
    await store.signOut();
    const prefs = { ...P }, first = S.settings.firstOpen;
    (S.books || []).forEach(b => dropBookLocal(b.id)); S.books = []; localStorage.removeItem('tk_books'); localStorage.setItem('tk_active_book', 'me');
    [LK.data, LK.dirty, LK.settings, LK.sdirty].forEach(k => localStorage.removeItem(k));
    S.bookId = 'me'; S.meta = null;
    loadLocal(); Object.assign(P, prefs); S.settings.firstOpen = first; localStorage.setItem(LK.settings, JSON.stringify(S.settings));
    applyPrefs(); render(); toast(t('loggedOut'));
  },
  pay: () => openPaywall(),
  privacy: () => openPrivacy(),
  goInsights: () => { S.view = 'charts'; S.chartTab = 'insights'; render(); scrollTo(0, 0); },
  goSettings: () => { S.view = 'me'; render(); setTimeout(() => $('.toggle-row')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); },
  toggleHide: () => { S.hidden = !S.hidden; buzz(8); render(); },
  hideBtn: el => { if (!isPro()) { el.checked = false; return openPaywall(); } setPref('hideBtn', el.checked); S.hidden = el.checked; render(); },
  lockToggle: el => { if (el.checked) enableLock(); else disableLock(); },
  lockAfter: el => { const lc = lockCfg(); lc.after = +el.dataset.v; localStorage.setItem('tk_lock', JSON.stringify(lc)); render(); },
  shared: () => openShared(),
  bookPick: () => openBookPick(),
  bookSwap: () => { const b = S.books?.[0]; if (b) switchBook(S.meta ? 'me' : b.id); },
  goBook: el => switchBook(el.dataset.v),
  bookDetail: el => openBookDetail(el.dataset.v),
  async createBook() {
    if (!isPro()) return openPaywall();
    if (S.books?.length) return toast(t('oneBookOnly'), { type: 'warn' });
    const name = ($('#bkName').value || t('familyBook')).trim();
    try {
      const b = await store.createBook(name, { cats: S.settings.cats.map(c => ({ ...c })), targets: [], updatedAt: Date.now() });
      S.books = await store.myBooks(); localStorage.setItem('tk_books', JSON.stringify(S.books));
      confetti(60); openBookDetail(b.id);
    } catch (e) {
      if (e.code === 'book/need-pro') return openPaywall();
      toast(t(e.code === 'book/one-only' ? 'oneBookOnly' : e.code === 'net' ? 'netError' : 'errGeneric'), { type: 'warn' });
    }
  },
  async joinBook() {
    const code = ($('#bkCode').value || '').trim().toUpperCase();
    try { const id = await store.joinBook(code); S.books = await store.myBooks(); localStorage.setItem('tk_books', JSON.stringify(S.books)); toast(t('joined'), { big: true }); switchBook(id); }
    catch (e) { $('#bkErr').textContent = t(e.code === 'book/not-found' ? 'codeWrong' : e.code === 'book/one-only' ? 'oneBookOnly' : e.code === 'net' ? 'netError' : 'errGeneric'); }
  },
  async kick(el) {
    if (!await askConfirm(t('kickConfirm'), t('remove'))) return;
    try { await store.removeMember(el.dataset.v, el.dataset.u); S.books = await store.myBooks(); localStorage.setItem('tk_books', JSON.stringify(S.books)); openBookDetail(el.dataset.v); }
    catch (e) { toast(t(e.code === 'net' ? 'netError' : 'errGeneric'), { type: 'warn' }); }
  },
  async leaveBook(el) {
    if (!await askConfirm(t('leaveConfirm'), t('leaveBook'))) return; const id = el.dataset.v;
    try { await store.leaveBook(id); } catch (e) { return toast(t(e.code === 'net' ? 'netError' : 'errGeneric'), { type: 'warn' }); }
    dropBookLocal(id); S.books = (S.books || []).filter(b => b.id !== id); localStorage.setItem('tk_books', JSON.stringify(S.books)); closeSheet(); switchBook('me');
  },
  async deleteBook(el) {
    if (!await askConfirm(t('deleteBookConfirm'), t('deleteBook'))) return; const id = el.dataset.v;
    try { await store.deleteBook(id); } catch (e) { return toast(t(e.code === 'net' ? 'netError' : 'errGeneric'), { type: 'warn' }); }
    dropBookLocal(id); S.books = (S.books || []).filter(b => b.id !== id); localStorage.setItem('tk_books', JSON.stringify(S.books)); closeSheet(); switchBook('me');
  },
  async shareCode(el) { const txt = t('inviteMsg', { c: el.dataset.v }) + ' ' + appLink(); if (navigator.share) { try { await navigator.share({ text: txt }); } catch { } } else { try { await navigator.clipboard.writeText(txt); toast(t('copied')); } catch { } } },
  async demoPartner(el) { await store.demoAddPartner(el.dataset.v); S.books = await store.myBooks(); localStorage.setItem('tk_books', JSON.stringify(S.books)); if (S.bookId === el.dataset.v) await sync(); openBookDetail(el.dataset.v); toast(t('demoPartnerDone')); },
  proBenefits: () => openProBenefits(),
  proGo: el => { closeSheet(); setTimeout(() => ACT[el.dataset.v]?.(), 300); },
  demoPro: el => { localStorage.setItem('tk_demo_pro', el.checked ? '1' : '0'); if (el.checked) localStorage.setItem('tk_demo_trial_end', '0'); enforceFree(); render(); },
  demoTrialEnd: el => { localStorage.setItem('tk_demo_trial_end', el.checked ? '1' : '0'); if (el.checked) { localStorage.setItem('tk_demo_pro', '0'); if (P.hideBtn) { S.hidden = false; } } enforceFree(); render(); },
  async shareNative() {
    const data = { title: t('appName'), text: t('shareMsg'), url: appLink() };
    if (navigator.share) { try { await navigator.share(data); } catch { } }
    else { try { await navigator.clipboard.writeText(t('shareMsg') + ' ' + appLink()); toast(t('copied')); } catch { toast(appLink()); } }
  },
  aboutDev: () => openAboutDev(),
  payNow: () => openPay(),
};

document.addEventListener('pointerdown', e => { S.px = e.clientX; S.py = e.clientY; }, true);
document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]'); if (!el) return;
  if (el.tagName === 'INPUT' && el.type === 'checkbox') { ACT[el.dataset.a]?.(el, e); return; }
  e.preventDefault();
  ACT[el.dataset.a]?.(el, e);
});

boot();
