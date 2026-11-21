// Backup / sync server.
// The app works fully on the phone without any account. Signing in once turns on backup:
// entries and settings are pushed to the server and pulled on other phones.
//
//   • Supabase  — when SUPABASE_URL is set in config.js (see supabase.sql)
//   • Demo      — when SUPABASE_URL is empty: a pretend server inside this browser, for trying things out

import { PRO_PRICE, PAYMENT_METHOD, SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

export const isDemo = !SUPABASE_URL;
export let store = null;

export async function initStore() {
  store = isDemo ? demoServer() : await supabaseServer();
  return store;
}

const err = code => Object.assign(new Error(code), { code });
const wait = (ms = 180) => new Promise(r => setTimeout(r, ms));

function demoServer() {
  const KEY = 'tk_demo_server';
  const blank = () => ({ accounts: {}, users: {}, entries: {}, settings: {}, payments: {} });
  const load = () => { try { return Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch { return blank(); } };
  const save = db => localStorage.setItem(KEY, JSON.stringify(db));
  const rid = (n = 16) => Array.from(crypto.getRandomValues(new Uint8Array(n)), b => 'abcdefghijklmnopqrstuvwxyz0123456789'[b % 36]).join('');
  const SESS = 'tk_demo_session';
  let cur = null;
  { const e = localStorage.getItem(SESS), a = e && load().accounts[e]; if (a) cur = { uid: a.uid, email: e }; }
  const authCbs = [], watchers = new Set();
  const ping = () => watchers.forEach(f => f());
  addEventListener('storage', e => { if (e.key === KEY) ping(); });
  const setCur = u => { cur = u; if (u) localStorage.setItem(SESS, u.email); else localStorage.removeItem(SESS); authCbs.forEach(c => c(cur)); };
  const watch = f => { watchers.add(f); f(); return () => watchers.delete(f); };
  const ADMIN_DEMO = true; // demo: every signed-in account can open admin.html to test approvals

  return {
    mode: 'demo',
    onAuth(cb) { authCbs.push(cb); setTimeout(() => cb(cur), 0); },
    currentUser: () => cur,
    isAdmin: () => !!cur && ADMIN_DEMO,

    async signUp(email, pw) {
      await wait();
      email = (email || '').trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(email)) throw err('auth/invalid-email');
      if ((pw || '').length < 6) throw err('auth/weak-password');
      const db = load();
      if (db.accounts[email]) throw err('auth/email-already-in-use');
      const uid = 'u' + rid(10);
      db.accounts[email] = { uid, pw };
      db.users[uid] = { email, pro: false, createdAt: Date.now() };
      save(db); setCur({ uid, email });
      return { user: cur, needsConfirm: false };
    },
    async signIn(email, pw) {
      await wait();
      email = (email || '').trim().toLowerCase();
      const a = load().accounts[email];
      if (!a || a.pw !== pw) throw err('auth/invalid-credential');
      setCur({ uid: a.uid, email });
      return cur;
    },
    async signOut() { setCur(null); },
    async resetPassword() { throw err('demo/no-reset'); },
    async updatePassword() {},
    onRecovery() {},

    async getProfile() { return load().users[cur?.uid] || null; },
    listenProfile(cb) { let last = ''; return watch(() => { const p = load().users[cur?.uid] || null; const s = JSON.stringify(p); if (s !== last) { last = s; cb(p); } }); },

    // entries: [{id, ..., updatedAt, deleted?}]
    async pull() { await wait(); return Object.values(load().entries[cur.uid] || {}); },
    async push(list) {
      await wait();
      const db = load(), box = (db.entries[cur.uid] ||= {});
      list.forEach(r => { const o = box[r.id]; if (!o || (r.updatedAt || 0) >= (o.updatedAt || 0)) box[r.id] = r; });
      save(db);
    },
    async getSettings() { await wait(80); return load().settings[cur.uid] || null; },       // {data, updatedAt}
    async putSettings(data, updatedAt) { const db = load(); db.settings[cur.uid] = { data, updatedAt }; save(db); },

    async submitPayment({ trxId, sender }) {
      await wait();
      const id = trxId.trim().toUpperCase(), db = load();
      if (db.payments[id]) throw err('pay/duplicate');
      db.payments[id] = { uid: cur.uid, email: cur.email, trxId: id, sender: sender || '', amount: PRO_PRICE, status: 'pending', method: PAYMENT_METHOD, createdAt: Date.now() };
      save(db); ping();
    },
    listenMyPayments(cb) { return watch(() => cb(Object.values(load().payments).filter(p => p.uid === cur?.uid).sort((a, b) => b.createdAt - a.createdAt))); },


    // ── shared family books (demo server) ──
    async createBook(name, meta) {
      await wait();
      const db = load(), id = 'b' + rid(10), A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      if (Object.values(db.books || {}).some(x => x.members.some(m => m.uid === cur.uid))) throw err('book/one-only');
      let code; do { code = Array.from(crypto.getRandomValues(new Uint8Array(6)), b => A[b % 32]).join(''); } while (Object.values(db.books || {}).some(b => b.code === code));
      (db.books ||= {})[id] = { id, name, owner: cur.uid, code, members: [{ uid: cur.uid, email: cur.email }], meta };
      (db.bookEntries ||= {})[id] = {};
      save(db); return { id, code };
    },
    async myBooks() {
      const db = load();
      return Object.values(db.books || {}).filter(b => b.members.some(m => m.uid === cur?.uid))
        .map(b => ({ id: b.id, name: b.name, owner: b.owner, members: b.members, code: b.owner === cur.uid ? b.code : null }));
    },
    async joinBook(code) {
      await wait();
      const db = load(), b = Object.values(db.books || {}).find(x => x.code === code);
      if (!b) throw err('book/not-found');
      const already = Object.values(db.books || {}).some(x => x.id !== b.id && x.members.some(m => m.uid === cur.uid));
      if (already) throw err('book/one-only');     // one shared book per person
      if (!b.members.some(m => m.uid === cur.uid)) b.members.push({ uid: cur.uid, email: cur.email });
      save(db); return b.id;
    },
    async bookInfo(id) {
      const b = load().books?.[id];
      if (!b || !b.members.some(m => m.uid === cur?.uid)) return null;
      return { name: b.name, owner: b.owner, members: b.members, code: b.owner === cur.uid ? b.code : null, meta: b.meta };
    },
    async pullBook(id) { await wait(); return Object.values(load().bookEntries?.[id] || {}); },
    async pushBook(id, list) {
      await wait();
      const db = load(), box = ((db.bookEntries ||= {})[id] ||= {});
      list.forEach(r => { const o = box[r.id]; if (!o || (r.updatedAt || 0) >= (o.updatedAt || 0)) box[r.id] = { ...r, by: r.by || o?.by || cur.uid }; });
      save(db);
    },
    async putBookMeta(id, meta) { const db = load(); if (db.books?.[id]) { db.books[id].meta = meta; save(db); } },
    async removeMember(id, uid) { const db = load(), b = db.books[id]; if (b.owner !== cur.uid) throw err('book/not-owner'); b.members = b.members.filter(m => m.uid !== uid); save(db); },
    async leaveBook(id) { const db = load(), b = db.books[id]; b.members = b.members.filter(m => m.uid !== cur.uid); save(db); },
    async deleteBook(id) { const db = load(); if (db.books?.[id]?.owner !== cur.uid) throw err('book/not-owner'); delete db.books[id]; delete db.bookEntries?.[id]; save(db); },
    // demo only: pretend a family member joined and logged a few expenses
    async demoAddPartner(id) {
      const db = load(), b = db.books[id], uid = 'u-demo-partner';
      if (!b.members.some(m => m.uid === uid)) b.members.push({ uid, email: 'nusrat@demo.com' });
      const box = ((db.bookEntries ||= {})[id] ||= {}), d = new Date(), pad = n => String(n).padStart(2, '0');
      const day = k => { const x = new Date(d.getFullYear(), d.getMonth(), Math.max(1, d.getDate() - k)); return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`; };
      [[1850, 'grocery', 'মাছ-সবজি', 0], [650, 'food', '', 1], [1200, 'shopping', 'বাচ্চার জামা', 2], [300, 'transport', 'রিকশা', 3]].forEach(([amt, cat, note, k], i) => {
        const eid = 'demo-p-' + i; box[eid] = { id: eid, amt, cat, note, date: day(k), created: Date.now() - i, updatedAt: Date.now(), by: uid };
      });
      save(db);
    },
    // admin
    listenAllPayments(cb) { return watch(() => cb(Object.values(load().payments).sort((a, b) => b.createdAt - a.createdAt))); },
    async approve(p) { const db = load(); db.payments[p.trxId].status = 'approved'; db.payments[p.trxId].decidedAt = Date.now(); if (db.users[p.uid]) { db.users[p.uid].pro = true; db.users[p.uid].proSince = Date.now(); } save(db); ping(); },
    async reject(p) { const db = load(); db.payments[p.trxId].status = 'rejected'; db.payments[p.trxId].decidedAt = Date.now(); save(db); ping(); },
    async grantProByEmail(email) {
      const db = load(), u = Object.entries(db.users).find(([, v]) => v.email === email.trim().toLowerCase());
      if (!u) throw err('admin/no-user');
      db.users[u[0]].pro = true; db.users[u[0]].proSince = Date.now(); save(db); ping();
    },
  };
}

/* ───────────────────────── Supabase ───────────────────────── */
async function supabaseServer() {
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  const appUrl = location.origin + location.pathname.replace(/admin\.html$/, '');
  const isNet = e => !!e && (e.status === 0 || /fetch|network|offline|timed out/i.test(e.message || ''));
  const fail = e => { throw (isNet(e) ? err('net') : e); };
  const wrapU = u => u ? { uid: u.id, email: u.email } : null;
  const mapAuthErr = e => {
    const m = e?.message || '';
    if (/invalid login/i.test(m)) return err('auth/invalid-credential');
    if (/not confirmed/i.test(m)) return err('auth/email-not-confirmed');
    if (/already (registered|been registered)/i.test(m)) return err('auth/email-already-in-use');
    if (/password.*(at least|short|weak)|weak password/i.test(m)) return err('auth/weak-password');
    if (/invalid.*email|validate email/i.test(m)) return err('auth/invalid-email');
    if (e?.status === 429 || /rate limit/i.test(m)) return err('auth/too-many-requests');
    if (isNet(e) || e?.name === 'AuthRetryableFetchError') return err('auth/network-request-failed');
    return e;
  };

  // ── auth ──
  let user = null, admin = false, bookId = null, authCb = null, recCb = null, known = false, delivered;
  const refreshAdmin = async () => { admin = false; if (!user) return; try { const { data } = await sb.rpc('is_admin'); admin = !!data; } catch { } };
  const deliver = () => {
    if (!authCb || !known) return;
    const k = user?.uid ?? null; if (k === delivered) return;
    delivered = k; bookId = null;
    refreshAdmin().then(() => authCb(user));
  };
  sb.auth.onAuthStateChange((ev, session) => {
    user = wrapU(session?.user); known = true;
    if (ev === 'PASSWORD_RECOVERY') { setTimeout(() => recCb?.(user), 0); }
    setTimeout(deliver, 0);   // never call Supabase directly inside this callback
  });

  // profile + personal book are created on first sign-in (ensure_account in supabase.sql)
  async function getProfile() {
    if (!user) return null;
    const { data, error } = await sb.rpc('ensure_account');
    if (error) fail(error);
    const p = Array.isArray(data) ? data[0] : data;
    bookId = p.book_id;
    return { email: p.email, pro: !!p.pro, proSince: p.pro_since ? Date.parse(p.pro_since) : null, bookId: p.book_id };
  }
  const ready = async () => { if (!bookId) await getProfile(); return bookId; };
  const pullKey = () => 'tk_pull_' + user?.uid;
  const pollers = new Set();
  const runPollers = () => pollers.forEach(f => f());
  document.addEventListener('visibilitychange', () => { if (!document.hidden) runPollers(); });
  function poll(fn, ms) { pollers.add(fn); fn(); const iv = setInterval(() => { if (!document.hidden) fn(); }, ms); return () => { clearInterval(iv); pollers.delete(fn); }; }
  const normPay = r => ({ trxId: r.trx_id, uid: r.uid, email: r.email, sender: r.sender, amount: r.amount, status: r.status, method: r.method, createdAt: Date.parse(r.created_at), decidedAt: r.decided_at ? Date.parse(r.decided_at) : null });


  // ── entries: shared by the personal book and the shared book ──
  // Incremental pull (only rows changed since last time) + a full re-check once a day.
  async function pullFrom(b, curKey, fullKey, full) {
    if (Date.now() - (+localStorage.getItem(fullKey) || 0) > 864e5) full = true;
    const since = full ? null : localStorage.getItem(curKey);
    const rows = [];
    let maxSync = since;
    for (let from = 0; ; from += 1000) {
      let q = sb.from('entries').select('id,amt,cat,note,date,rec,created,updated_at,deleted,who,synced_at').eq('book_id', b);
      if (since) q = q.gt('synced_at', since);
      const { data, error } = await q.order('synced_at').range(from, from + 999);
      if (error) fail(error);
      rows.push(...data);
      if (data.length < 1000) break;
    }
    rows.forEach(r => { if (!maxSync || r.synced_at > maxSync) maxSync = r.synced_at; });
    if (maxSync) localStorage.setItem(curKey, maxSync);
    if (full) localStorage.setItem(fullKey, String(Date.now()));
    return rows.map(r => r.deleted
      ? { id: r.id, deleted: true, updatedAt: Number(r.updated_at) }
      : { id: r.id, amt: Number(r.amt), cat: r.cat, note: r.note || '', date: r.date, rec: r.rec || null, created: Number(r.created) || 0, updatedAt: Number(r.updated_at), ...(r.who ? { by: r.who } : {}) });
  }
  async function pushTo(b, list) {
    const rows = list.map(e => e.deleted
      ? { book_id: b, id: e.id, deleted: true, updated_at: e.updatedAt, by: user.uid, amt: 0 }
      : { book_id: b, id: e.id, amt: e.amt, cat: e.cat, note: e.note || '', date: e.date, rec: e.rec || null, created: e.created || 0, updated_at: e.updatedAt, deleted: false, by: user.uid, who: e.by || user.uid });
    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await sb.from('entries').upsert(rows.slice(i, i + 500), { onConflict: 'book_id,id' });
      if (error) fail(error);
    }
  }
  // shared-book errors come back as messages like "book/one-only"
  const rpc = async (fn, args) => {
    const { data, error } = await sb.rpc(fn, args);
    if (error) { const m = /book\/[a-z-]+/.exec(error.message || ''); if (m) throw err(m[0]); fail(error); }
    return data;
  };
  const bKeys = id => ['tk_pullb_' + user?.uid + '_' + id, 'tk_fullb_' + user?.uid + '_' + id];
  const forgetBook = id => bKeys(id).forEach(k => localStorage.removeItem(k));
  const slimBook = b => ({ id: b.id, name: b.name || '', owner: b.owner, code: b.code || null, members: b.members || [] });

  return {
    mode: 'supabase',
    onAuth(cb) { authCb = cb; deliver(); },
    onRecovery(cb) { recCb = cb; },
    currentUser: () => user,
    isAdmin: () => admin,

    async signUp(email, password) {
      const { data, error } = await sb.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: appUrl } });
      if (error) throw mapAuthErr(error);
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) throw err('auth/email-already-in-use');
      return { user: wrapU(data.user), needsConfirm: !data.session };
    },
    async signIn(email, password) {
      const { data, error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw mapAuthErr(error);
      return wrapU(data.user);
    },
    async signOut() { localStorage.removeItem(pullKey()); localStorage.removeItem('tk_full_' + user?.uid); await sb.auth.signOut(); },
    async resetPassword(email) { const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: appUrl }); if (error) throw mapAuthErr(error); },
    async updatePassword(password) { const { error } = await sb.auth.updateUser({ password }); if (error) throw mapAuthErr(error); },

    getProfile,
    listenProfile(cb) {
      let last = '';
      return poll(async () => { try { const p = await getProfile(); const s = JSON.stringify(p); if (s !== last) { last = s; cb(p); } } catch { } }, 30000);
    },

    // entries — the server keeps the newest version (see trigger in supabase.sql)
    async pull({ full = false } = {}) { return pullFrom(await ready(), pullKey(), 'tk_full_' + user.uid, full); },
    async push(list) { return pushTo(await ready(), list); },
    async getSettings() {
      const { data, error } = await sb.from('user_settings').select('data,updated_at').eq('user_id', user.uid).maybeSingle();
      if (error) fail(error);
      return data ? { data: data.data, updatedAt: Number(data.updated_at) } : null;
    },
    async putSettings(data, updatedAt) {
      const { error } = await sb.from('user_settings').upsert({ user_id: user.uid, data, updated_at: updatedAt });
      if (error) fail(error);
    },

    // payments
    async submitPayment({ trxId, sender }) {
      const { error } = await sb.from('payments').insert({ trx_id: trxId.trim().toUpperCase(), uid: user.uid, email: user.email, sender: sender || null, amount: PRO_PRICE, method: PAYMENT_METHOD });
      if (error) { if (error.code === '23505') throw err('pay/duplicate'); fail(error); }
      runPollers();
    },
    listenMyPayments(cb) {
      return poll(async () => {
        const { data, error } = await sb.from('payments').select('*').eq('uid', user.uid).order('created_at', { ascending: false });
        if (!error) cb(data.map(normPay));
      }, 30000);
    },


    // ── shared family book (see the "Shared family book" part of supabase.sql) ──
    async myBooks() { return ((await rpc('my_books')) || []).map(slimBook); },
    async createBook(name, meta) { const r = await rpc('create_shared_book', { p_name: name, p_meta: meta }); return { id: r.id, code: r.code }; },
    async joinBook(code) { const id = await rpc('join_book', { p_code: code }); forgetBook(id); return id; },
    async bookInfo(id) {
      const b = ((await rpc('my_books')) || []).find(x => x.id === id);
      return b ? { ...slimBook(b), meta: b.meta || null } : null;
    },
    async pullBook(id, { full = false } = {}) { const [c, f] = bKeys(id); return pullFrom(id, c, f, full); },
    async pushBook(id, list) { return pushTo(id, list); },
    async putBookMeta(id, meta) { await rpc('put_book_meta', { p_book: id, p_meta: meta }); },
    async removeMember(id, uid) { await rpc('remove_member', { p_book: id, p_user: uid }); },
    async leaveBook(id) { await rpc('leave_book', { p_book: id }); forgetBook(id); },
    async deleteBook(id) { await rpc('delete_book', { p_book: id }); forgetBook(id); },
    async demoAddPartner() {},
    // admin (every check is repeated on the server inside the SQL functions)
    listenAllPayments(cb) {
      return poll(async () => {
        const { data, error } = await sb.from('payments').select('*').order('created_at', { ascending: false }).limit(300);
        if (!error) cb(data.map(normPay)); else console.error(error);
      }, 20000);
    },
    async approve(p) { const { error } = await sb.rpc('approve_payment', { p_trx: p.trxId }); if (error) throw error; runPollers(); },
    async reject(p) { const { error } = await sb.rpc('reject_payment', { p_trx: p.trxId }); if (error) throw error; runPollers(); },
    async grantProByEmail(email) {
      const { data, error } = await sb.rpc('grant_pro', { p_email: email.trim() });
      if (error) throw error;
      if (!data) throw err('admin/no-user');
    },
  };
}
