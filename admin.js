// Admin page: verify bKash TrxIDs and unlock Pro. Admins can NOT read anyone's expenses
// (the server only lets each user read their own expenses).
import { initStore, isDemo } from './store.js';
import { PRO_PRICE, BKASH_NUMBER } from './config.js';

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const root = () => $('#root');
let store, pays = [], filter = 'pending', unsub = null;

function toast(m) { const el = document.createElement('div'); el.className = 'toast'; el.textContent = m; $('#toast-layer').appendChild(el); setTimeout(() => el.remove(), 2400); }
const when = ms => new Date(ms).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

async function boot() {
  store = await initStore();
  store.onAuth(u => {
    unsub?.(); unsub = null;
    if (!u) return showLogin();
    if (!store.isAdmin()) return root().innerHTML = `<div class="content" style="padding-top:40px"><div class="card"><b>⛔ এই অ্যাকাউন্টটি অ্যাডমিন না</b><p class="small muted">${esc(u.email)}</p><p class="small muted">Supabase SQL Editor-এ চালাও: <code>insert into public.admins(email) values ('${esc(u.email)}');</code> তারপর আবার লগইন করো।</p><button class="btn soft" id="out">লগআউট</button></div></div>`, $('#out').onclick = () => store.signOut();
    showPanel(u);
  });
}

function showLogin(msg = '') {
  root().innerHTML = `<div class="content" style="padding-top:40px"><h2>অ্যাডমিন</h2><p class="muted">পেমেন্ট যাচাই ও Pro চালু</p>
    <form class="card form" id="f"><label>ইমেইল<input name="e" type="email" required></label><label>পাসওয়ার্ড<input name="p" type="password" required></label>
    <p class="err">${esc(msg)}</p><button class="btn primary big">লগইন</button></form>
    ${isDemo ? '<p class="demo-note">ডেমো মোড: অ্যাপে যে ডেমো অ্যাকাউন্ট খুলেছ সেটা দিয়েই ঢোকো।</p>' : ''}<a class="link" href="./">← অ্যাপে ফেরো</a></div>`;
  $('#f').onsubmit = async e => { e.preventDefault(); try { await store.signIn(e.target.e.value, e.target.p.value); } catch (er) { showLogin('লগইন হয়নি: ' + (er.code || er.message)); } };
}

function showPanel(u) {
  unsub = store.listenAllPayments(ps => { pays = ps; render(u); });
  render(u);
}
function render(u) {
  const counts = { pending: 0, approved: 0, rejected: 0 };
  pays.forEach(p => counts[p.status] = (counts[p.status] || 0) + 1);
  const list = pays.filter(p => filter === 'all' || p.status === filter);
  root().innerHTML = `<header class="top"><h2 class="grow">পেমেন্ট যাচাই</h2><a class="ib" href="./">✕</a></header><div class="content"><p class="small muted">bKash: ${esc(BKASH_NUMBER)} · দাম ৳${PRO_PRICE}</p>
    <div class="card small">🔒 এখানে শুধু পেমেন্টের তথ্য দেখা যায়।</div>
    <div class="card small">✅ approve করার আগে bKash অ্যাপের Statement-এ TrxID আর ৳${PRO_PRICE} মিলিয়ে নাও।</div>
    <div class="filters">${['pending', 'approved', 'rejected', 'all'].map(f => `<button class="chip ${filter === f ? 'on' : ''}" data-f="${f}">${{ pending: '⏳ অপেক্ষায়', approved: '✅ অনুমোদিত', rejected: '❌ বাতিল', all: 'সব' }[f]}${counts[f] ? `<span class="count">${counts[f]}</span>` : ''}</button>`).join('')}</div>
    ${list.length ? list.map(p => `<div class="card pay"><div class="ptop"><code>${esc(p.trxId)}</code><span class="st ${p.status}">${p.status}</span></div>
      <div class="small muted">${esc(p.email)} · ৳${p.amount}${p.sender ? ` · শেষ ৪: ${esc(p.sender)}` : ''}</div><div class="small muted">${when(p.createdAt)}</div>
      ${p.status === 'pending' ? `<div class="row gap"><button class="btn primary grow" data-ok="${esc(p.trxId)}">✅ Approve</button><button class="btn soft grow" data-no="${esc(p.trxId)}">❌ Reject</button></div>` : ''}
      <button class="chip sm" data-cp="${esc(p.trxId)}" style="justify-self:start">📋 TrxID কপি</button></div>`).join('') : '<div class="empty">কিছু নেই 🎉</div>'}
    <div class="sec-h"><h3>ম্যানুয়ালি Pro দাও</h3></div>
    <form class="card row gap" id="g"><input id="ge" type="email" placeholder="user@email.com" required class="grow"><button class="btn primary">দাও</button></form>
    <button class="btn soft wide" id="out">লগআউট (${esc(u.email)})</button></div>`;
  root().querySelectorAll('[data-f]').forEach(b => b.onclick = () => { filter = b.dataset.f; render(u); });
  root().querySelectorAll('[data-ok]').forEach(b => b.onclick = async () => { b.disabled = true; try { await store.approve(pays.find(p => p.trxId === b.dataset.ok)); toast('Pro চালু হয়েছে ✓'); } catch (e) { toast('হয়নি: ' + (e.code || e.message)); b.disabled = false; } });
  root().querySelectorAll('[data-no]').forEach(b => b.onclick = async () => { try { await store.reject(pays.find(p => p.trxId === b.dataset.no)); } catch (e) { toast('হয়নি: ' + (e.code || e.message)); } });
  root().querySelectorAll('[data-cp]').forEach(b => b.onclick = () => navigator.clipboard?.writeText(b.dataset.cp).then(() => toast('কপি হয়েছে')));
  $('#g').onsubmit = async e => { e.preventDefault(); try { await store.grantProByEmail($('#ge').value); toast('Pro চালু হয়েছে ✓'); $('#ge').value = ''; } catch (er) { toast(er.code === 'admin/no-user' ? 'এই ইমেইলে কেউ নেই' : 'হয়নি'); } };
  $('#out').onclick = () => store.signOut();
}

boot();
