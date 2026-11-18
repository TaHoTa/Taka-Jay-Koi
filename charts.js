// Tiny hand-made SVG charts (no library). All return SVG strings.

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Vertical bars. values[], labels[] ('' to hide), optional avg line, tap → data-a=action data-i=index
export function barChart({ values, labels, avg = null, action = '', highlight = -1, height = 180, avgLabel = '' }) {
  const n = values.length, W = 340, H = height, pt = 16, pb = 22;
  const max = Math.max(...values, avg || 0, 1) * 1.08;
  const bw = W / n, gap = Math.max(1.5, Math.min(bw * 0.3, 8)), w = bw - gap;
  const y = v => pt + (H - pt - pb) * (1 - v / max);
  let s = `<svg class="chart bars" viewBox="0 0 ${W} ${H}" role="img">`;
  s += `<line x1="0" x2="${W}" y1="${H - pb}" y2="${H - pb}" class="axis"/>`;
  values.forEach((v, i) => {
    const x = i * bw + gap / 2, top = y(v), h = Math.max(v > 0 ? 2.5 : 0, H - pb - top);
    const cls = i === highlight ? 'bar hi' : (v > 0 ? 'bar' : 'bar zero');
    s += `<rect class="${cls}" x="${x.toFixed(1)}" y="${(H - pb - h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${Math.min(5, w / 3).toFixed(1)}" style="animation-delay:${Math.min(i * 18, 500)}ms"/>`;
    if (labels[i]) s += `<text class="lbl${i === highlight ? ' hi' : ''}" x="${(x + w / 2).toFixed(1)}" y="${H - 6}" text-anchor="middle">${esc(labels[i])}</text>`;
    if (action) s += `<rect class="hit" data-a="${action}" data-i="${i}" x="${(i * bw).toFixed(1)}" y="0" width="${bw.toFixed(1)}" height="${H}"/>`;
  });
  if (avg) {
    const ay = y(avg).toFixed(1);
    s += `<line class="avg" x1="0" x2="${W}" y1="${ay}" y2="${ay}"/>`;
    if (avgLabel) s += `<text class="avglbl" x="${W - 2}" y="${(+ay - 4).toFixed(1)}" text-anchor="end">${esc(avgLabel)}</text>`;
  }
  return s + '</svg>';
}

// Donut. items: [{id, value, color}], tap → data-a=action data-id
export function donut({ items, center = '', sub = '', action = '' }) {
  const R = 70, SW = 28, C = 2 * Math.PI * R, total = items.reduce((a, b) => a + b.value, 0) || 1;
  let off = 0;
  let s = `<svg class="chart donut" viewBox="0 0 200 200" role="img"><g transform="rotate(-90 100 100)">`;
  s += `<circle cx="100" cy="100" r="${R}" fill="none" class="track" stroke-width="${SW}"/>`;
  items.forEach(it => {
    const len = (it.value / total) * C;
    const g = items.length > 1 ? Math.min(2, len / 3) : 0;
    s += `<circle cx="100" cy="100" r="${R}" fill="none" stroke="${it.color}" stroke-width="${SW}" stroke-dasharray="${Math.max(0, len - g).toFixed(2)} ${(C - len + g).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" ${action ? `data-a="${action}" data-id="${esc(it.id)}"` : ''} class="seg"/>`;
    off += len;
  });
  s += `</g><text x="100" y="98" text-anchor="middle" class="dc">${esc(center)}</text><text x="100" y="120" text-anchor="middle" class="ds">${esc(sub)}</text></svg>`;
  return s;
}

// Progress ring for targets
export function ring(pct, { size = 64, stroke = 7, label = '' } = {}) {
  const r = (size - stroke) / 2, C = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, pct));
  const cls = pct >= 1 ? 'bad' : pct >= 0.8 ? 'warn' : 'good';
  return `<svg class="ring ${cls}" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" class="rtrack" stroke-width="${stroke}"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" class="rbar" stroke-width="${stroke}" stroke-linecap="round"
      stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${(C * (1 - p)).toFixed(2)}" style="--len:${C.toFixed(2)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
    <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" class="rtxt">${esc(label)}</text></svg>`;
}
