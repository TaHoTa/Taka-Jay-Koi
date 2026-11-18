// Offline support: network first (so updates arrive), cache as fallback.
const V = 'tk-v2.0.1';
const SHELL = ['./', './index.html', './styles.css', './app.js', './store.js', './i18n.js', './charts.js', './icons.js', './config.js', './payments.js', './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png', './fonts/fonts.css'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(V).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
