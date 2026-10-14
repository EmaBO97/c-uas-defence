// ============================================================ stato
const G = { phase: 'intro', site: 0, wave: 0, budget: 0, items: [], tool: null, t: 0, paused: false, speed: 1, roe: 'prudenti',
  objs: [], fx: [], parts: [], shots: [], sel: null, selItem: null, integrity: 5, maxInteg: 5, assets: [{ x: 0, y: 0, hp: 5, max: 5, r: 70, main: true }], score: 0, ws: null, siteWaves: [], nextId: 1, shake: 0, flash: 0,
  perks: [], carry: 0, camp: [], ab: {}, events: [], planes: [], pending: [], siteScore0: 0, effStats: {}, totalHostile: 0, endIn: null };
const S = () => SITES[G.site];
const WV = () => G.curWave || S().waves[Math.min(G.wave, S().waves.length - 1)];
const WX = () => WEATHER[WV().wx || 'sereno'];
const hasPerk = (k) => G.perks.includes(k);
const isOn = (it) => !it.dmg && !it.fault && !it.off;
// obiettivi da difendere: il primo è il principale, al centro della mappa
const siteAssets = (s) => [{ x: 0, y: 0, label: s.label, kind: s.asset, r: R_HIT, integ: 5, main: true }, ...(s.extra || [])];
const mainAsset = () => G.assets[0];
const siteLost = () => G.assets.some((a) => !a.temp && a.hp <= 0);
const nearestAsset = (o) => { let b = G.assets[0], bd = 1e9; for (const a of G.assets) { const d = Math.hypot(o.x - a.x, o.y - a.y); if (d < bd) { bd = d; b = a; } } return b; };
const distAsset = (o) => { const a = nearestAsset(o); return Math.hypot(o.x - a.x, o.y - a.y); };

// ============================================================ geometria del sito
const inForest = (o) => S().forest.some((f) => Math.hypot(o.x - f.x, o.y - f.y) < f.r);
const inPier = (x, y) => PIERS.some((p) => x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h);
const inReservoir = (x, y) => { const r = S().reservoir; return !!r && ((x - r.x) / r.rx) ** 2 + ((y - r.y) / r.ry) ** 2 < 1; };
const inWater = (x, y) => (!!S().sea && y > coast(x) && !inPier(x, y)) || inReservoir(x, y);
const inRidge = (o) => (S().ridges || []).some((r) => Math.hypot(o.x - r.x, o.y - r.y) < r.r);
const inCorridor = (o) => S().asset === 'airport' && Math.abs(o.y - CY) < 90;
const crowdAt = (o) => (S().crowd || []).find((c) => Math.hypot(o.x - c.x, o.y - c.y) < c.r);
function placeErr(x, y) {
  const d = Math.hypot(x, y);
  if (siteAssets(S()).some((a) => Math.hypot(x - a.x, y - a.y) < (a.main ? 80 : 60))) return 'Dentro il recinto di un obiettivo non si può costruire.';
  if (d > S().place && !(S().extra || []).some((a) => Math.hypot(x - a.x, y - a.y) < 320)) return 'Troppo lontano: piazza entro 700 m dal centro o 320 m da un obiettivo.';
  if (inWater(x, y)) return S().sea ? 'In mare non si costruisce: usa la terraferma o i moli.' : 'Sul lago non si costruisce.';
  if (S().asset === 'airport' && Math.abs(y - CY) < 70) return 'Sulla fascia della pista non si costruisce.';
  if (crowdAt({ x, y })) return 'Sopra la folla non si costruisce.';
  return '';
}
const canPlace = (x, y) => !placeErr(x, y);

// ============================================================ vista
let W = 0, H = 0, dpr = 1, sc = 1, cx0 = 0, cy0 = 0, terrain = null;
function resize() {
  const r = cv.parentElement.getBoundingClientRect();
  const h = Math.max(420, Math.min(r.width * 0.8, innerHeight - 110));
  cv.style.height = h + 'px'; dpr = Math.min(2, devicePixelRatio || 1);
  W = r.width; H = h; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  sc = Math.min(W, H) / (2 * R_MAP * 0.97); cx0 = W / 2; cy0 = H / 2;
  buildTerrain();
}
const X = (x) => cx0 + x * sc, Y = (y) => cy0 + y * sc;
const toWorld = (px, py) => ({ x: (px - cx0) / sc, y: (py - cy0) / sc });

// ============================================================ terreno (canvas fuori schermo, ridisegnato a ogni sito)
function buildTerrain() {
  const s = S();
  terrain = document.createElement('canvas'); terrain.width = cv.width; terrain.height = cv.height;
  const t = terrain.getContext('2d'); t.setTransform(dpr, 0, 0, dpr, 0, 0);
  let sd = 3 + G.site * 101; const r2 = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  const pal = { plant: ['#132430', '#0A141B'], airport: ['#14242C', '#0A1319'], stadium: ['#111C27', '#090F16'], port: ['#14242C', '#0A141B'], dam: ['#13232B', '#091218'], summit: ['#121B26', '#080D14'] }[s.asset];
  const g = t.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, Math.max(W, H) * 0.75);
  g.addColorStop(0, pal[0]); g.addColorStop(1, pal[1]); t.fillStyle = g; t.fillRect(0, 0, W, H);
  // campi coltivati
  if (!s.city) for (let i = 0; i < 70; i++) {
    const x = (r2() - 0.5) * 2300, y = (r2() - 0.5) * 2300, w = 80 + r2() * 160, h = 60 + r2() * 120;
    if (Math.hypot(x, y) < 180 || (s.sea && y > coast(x) - 30)) continue;
    t.fillStyle = `rgba(${120 + r2() * 40},${150 + r2() * 40},110,${0.025 + r2() * 0.03})`;
    t.save(); t.translate(X(x), Y(y)); t.rotate((r2() - 0.5) * 0.5); t.fillRect(-w * sc / 2, -h * sc / 2, w * sc, h * sc); t.restore();
  }
  // colline con curve di livello
  for (const hl of s.hills) for (let k = 1; k <= 7; k++) {
    const rr = hl.r * (1 - (k - 1) / 7.5);
    t.strokeStyle = `rgba(130,190,200,${0.05 + k * 0.012})`; t.lineWidth = 1; t.beginPath();
    for (let a = 0; a <= TAU + 0.01; a += 0.05) {
      const p = rr * (1 + 0.12 * Math.sin(3 * a + hl.x * 0.01 + k) + 0.07 * Math.sin(5 * a + hl.y * 0.02));
      const px = X(hl.x + Math.cos(a) * p), py = Y(hl.y + Math.sin(a) * p); a ? t.lineTo(px, py) : t.moveTo(px, py);
    } t.stroke();
  }
  // creste: ombra radar
  for (const rg of s.ridges || []) {
    const gr = t.createRadialGradient(X(rg.x), Y(rg.y), 0, X(rg.x), Y(rg.y), rg.r * sc); gr.addColorStop(0, 'rgba(150,170,180,0.13)'); gr.addColorStop(1, 'rgba(150,170,180,0.03)');
    t.fillStyle = gr; t.beginPath(); t.arc(X(rg.x), Y(rg.y), rg.r * sc, 0, TAU); t.fill();
    for (let k = 1; k <= 8; k++) { const rr = rg.r * (1 - (k - 1) / 8.5); t.strokeStyle = `rgba(170,200,210,${0.06 + k * 0.014})`; t.lineWidth = 1; t.beginPath();
      for (let a = 0; a <= TAU + 0.01; a += 0.05) { const p = rr * (1 + 0.1 * Math.sin(4 * a + rg.x * 0.01 + k) + 0.06 * Math.sin(7 * a + rg.y * 0.02)); const px = X(rg.x + Math.cos(a) * p), py = Y(rg.y + Math.sin(a) * p); a ? t.lineTo(px, py) : t.moveTo(px, py); } t.stroke(); }
    t.strokeStyle = 'rgba(255,181,71,0.35)'; t.setLineDash([3, 6]); t.beginPath(); t.arc(X(rg.x), Y(rg.y), rg.r * sc, 0, TAU); t.stroke(); t.setLineDash([]);
  }
  // lago del bacino
  if (s.reservoir) { const R = s.reservoir; const lg = t.createRadialGradient(X(R.x), Y(R.y), 4, X(R.x), Y(R.y), R.rx * sc); lg.addColorStop(0, '#1A4A63'); lg.addColorStop(1, '#0F2E40');
    t.fillStyle = lg; t.beginPath(); t.ellipse(X(R.x), Y(R.y), R.rx * sc, R.ry * sc, 0, 0, TAU); t.fill(); t.strokeStyle = 'rgba(120,200,230,0.4)'; t.lineWidth = 1.5; t.stroke();
    for (let k = 1; k < 5; k++) { t.strokeStyle = 'rgba(120,200,230,0.06)'; t.setLineDash([10, 12]); t.beginPath(); t.ellipse(X(R.x), Y(R.y), R.rx * sc * k / 5, R.ry * sc * k / 5, 0, 0, TAU); t.stroke(); } t.setLineDash([]); }
  // mare
  if (s.sea) {
    t.beginPath(); t.moveTo(X(-1300), Y(1300));
    for (let x = -1300; x <= 1300; x += 15) t.lineTo(X(x), Y(coast(x)));
    t.lineTo(X(1300), Y(1300)); t.closePath();
    const sg = t.createLinearGradient(0, Y(150), 0, Y(1100)); sg.addColorStop(0, '#0E2A3A'); sg.addColorStop(1, '#071722'); t.fillStyle = sg; t.fill();
    t.strokeStyle = 'rgba(120,200,230,0.35)'; t.lineWidth = 1.5; t.beginPath(); for (let x = -1300; x <= 1300; x += 15) (x === -1300 ? t.moveTo(X(x), Y(coast(x))) : t.lineTo(X(x), Y(coast(x)))); t.stroke();
    for (let k = 1; k < 9; k++) { t.strokeStyle = `rgba(120,200,230,${0.07 - k * 0.006})`; t.lineWidth = 1; t.setLineDash([10, 14]); t.beginPath();
      for (let x = -1300; x <= 1300; x += 20) { const y = coast(x) + k * 70 + 8 * Math.sin(x / 90 + k); x === -1300 ? t.moveTo(X(x), Y(y)) : t.lineTo(X(x), Y(y)); } t.stroke(); }
    t.setLineDash([]);
    for (const p of PIERS) { t.fillStyle = '#25343D'; t.fillRect(X(p.x), Y(p.y), p.w * sc, p.h * sc); t.strokeStyle = 'rgba(230,237,242,0.25)'; t.strokeRect(X(p.x), Y(p.y), p.w * sc, p.h * sc);
      for (let yy = p.y + 60; yy < p.y + p.h - 20; yy += 90) { t.strokeStyle = 'rgba(255,181,71,0.55)'; t.lineWidth = 1.5; t.beginPath(); t.moveTo(X(p.x + p.w / 2), Y(yy)); t.lineTo(X(p.x + p.w + 40), Y(yy - 14)); t.moveTo(X(p.x + p.w / 2), Y(yy)); t.lineTo(X(p.x + p.w / 2), Y(yy + 16)); t.stroke(); } }
    t.fillStyle = '#2A3A44'; t.save(); t.translate(X(470), Y(600)); t.rotate(-0.25); t.beginPath(); t.moveTo(-90 * sc, -16 * sc); t.lineTo(80 * sc, -16 * sc); t.lineTo(100 * sc, 0); t.lineTo(80 * sc, 16 * sc); t.lineTo(-90 * sc, 16 * sc); t.closePath(); t.fill();
    for (let i = 0; i < 5; i++) { t.fillStyle = ['#3DB8F5', '#FF6B5E', '#FFB547', '#99FFCC', '#3DB8F5'][i] + '55'; t.fillRect((-80 + i * 30) * sc, -11 * sc, 24 * sc, 22 * sc); } t.restore();
  }
  // lago
  if (s.lake) { const L = s.lake; const lg = t.createRadialGradient(X(L.x), Y(L.y), 4, X(L.x), Y(L.y), L.r * sc); lg.addColorStop(0, '#1A4A63'); lg.addColorStop(1, '#123448');
    t.fillStyle = lg; t.beginPath(); t.ellipse(X(L.x), Y(L.y), L.r * sc * 1.25, L.r * sc * 0.8, 0.3, 0, TAU); t.fill(); t.strokeStyle = 'rgba(120,200,230,0.35)'; t.stroke(); }
  // fiume
  t.lineCap = 'round'; t.lineJoin = 'round';
  if (s.river) for (const [w, c] of [[30, 'rgba(30,90,120,0.55)'], [16, 'rgba(50,130,170,0.55)']]) {
    t.strokeStyle = c; t.lineWidth = w * sc; t.beginPath();
    s.river.forEach(([x, y], i) => { if (!i) return t.moveTo(X(x), Y(y)); const [px, py] = s.river[i - 1]; t.quadraticCurveTo(X(px), Y(py), X((x + px) / 2), Y((y + py) / 2)); });
    t.stroke();
  }
  // città
  if (s.city) {
    const riverY = (x) => { const R = s.river; for (let i = 1; i < R.length; i++) if (x <= R[i][0]) { const [ax, ay] = R[i - 1], [bx, by] = R[i]; return ay + (by - ay) * (x - ax) / (bx - ax); } return R[R.length - 1][1]; };
    for (let gx = -1150; gx < 1150; gx += 92) for (let gy = -1150; gy < 1150; gy += 84) {
      const x = gx + 10, y = gy + 10, cxb = x + 35, cyb = y + 30;
      if (Math.hypot(cxb, cyb) < 250 || crowdAt({ x: cxb, y: cyb }) || s.forest.some((f) => Math.hypot(cxb - f.x, cyb - f.y) < f.r + 20) || Math.abs(cyb - riverY(cxb)) < 60) continue;
      if ((s.crowd || []).some((c) => Math.hypot(cxb - c.x, cyb - c.y) < c.r + 40)) continue;
      if (r2() < 0.4) continue; const bw = 36 + r2() * 28, bh = 30 + r2() * 24; t.fillStyle = `rgba(${34 + r2() * 14},${48 + r2() * 14},${58 + r2() * 14},0.38)`; t.fillRect(X(x), Y(y), bw * sc, bh * sc);
      for (let k = 0; k < 4; k++) if (r2() < 0.45) { t.fillStyle = `rgba(255,${190 + r2() * 40},120,${0.25 + r2() * 0.35})`; t.fillRect(X(x + 4 + r2() * (bw - 8)), Y(y + 4 + r2() * (bh - 8)), 1.5, 1.5); }
    }
  }
  // strade
  t.strokeStyle = 'rgba(200,210,215,0.12)'; t.lineWidth = 6 * sc + 1;
  for (const pts of s.roads) { t.beginPath(); pts.forEach(([x, y], i) => (i ? t.lineTo(X(x), Y(y)) : t.moveTo(X(x), Y(y)))); t.stroke(); }
  // zone affollate
  for (const c of s.crowd || []) {
    t.fillStyle = 'rgba(255,181,71,0.07)'; t.beginPath(); t.arc(X(c.x), Y(c.y), c.r * sc, 0, TAU); t.fill();
    t.strokeStyle = 'rgba(255,181,71,0.45)'; t.setLineDash([4, 4]); t.lineWidth = 1.2; t.stroke(); t.setLineDash([]);
    for (let i = 0; i < c.r * c.r / 260; i++) { const a = r2() * TAU, rr = Math.sqrt(r2()) * c.r * 0.92; t.fillStyle = `rgba(255,${200 + r2() * 40},150,${0.25 + r2() * 0.35})`; t.fillRect(X(c.x + Math.cos(a) * rr), Y(c.y + Math.sin(a) * rr), 1.3, 1.3); }
  }
  // aeroporto: pista, raccordo, piazzale, corridoio
  if (s.asset === 'airport') {
    t.fillStyle = 'rgba(255,181,71,0.05)'; t.fillRect(0, Y(CY - 90), W, 180 * sc);
    t.strokeStyle = 'rgba(255,181,71,0.35)'; t.setLineDash([8, 6]); t.lineWidth = 1; for (const dy of [-90, 90]) { t.beginPath(); t.moveTo(0, Y(CY + dy)); t.lineTo(W, Y(CY + dy)); t.stroke(); } t.setLineDash([]);
    t.fillStyle = '#26323A'; t.fillRect(X(-620), Y(CY - 22), 1240 * sc, 44 * sc);
    t.strokeStyle = 'rgba(230,237,242,0.55)'; t.lineWidth = 1.2; t.setLineDash([10 * sc, 9 * sc]); t.beginPath(); t.moveTo(X(-590), Y(CY)); t.lineTo(X(590), Y(CY)); t.stroke(); t.setLineDash([]);
    for (const ex of [-612, 600]) for (let k = -3; k <= 3; k++) { t.fillStyle = 'rgba(230,237,242,0.55)'; t.fillRect(X(ex), Y(CY + k * 5.5 - 1.5), 12 * sc, 3 * sc); }
    t.fillStyle = '#222D34'; t.fillRect(X(-12), Y(CY + 22), 24 * sc, (-60 - CY - 22) * sc); t.fillRect(X(-150), Y(-60), 300 * sc, 120 * sc);
    for (let x = -1100; x < -620; x += 60) { t.fillStyle = 'rgba(255,181,71,0.6)'; t.beginPath(); t.arc(X(x), Y(CY), 1.6, 0, TAU); t.fill(); }
    for (let x = 640; x < 1100; x += 60) { t.fillStyle = 'rgba(255,181,71,0.6)'; t.beginPath(); t.arc(X(x), Y(CY), 1.6, 0, TAU); t.fill(); }
  }
  // linea elettrica e tralicci
  if (s.pline) {
    const [[ax, ay], [bx, by]] = s.pline;
    t.strokeStyle = 'rgba(61,184,245,0.28)'; t.lineWidth = 1.2; t.beginPath(); t.moveTo(X(ax), Y(ay)); t.lineTo(X(bx), Y(by)); t.stroke();
    const L = Math.hypot(bx - ax, by - ay);
    for (let d = 80; d < L; d += 110) { const x = ax + (bx - ax) * d / L, y = ay + (by - ay) * d / L; t.fillStyle = 'rgba(61,184,245,0.6)'; t.beginPath(); t.moveTo(X(x), Y(y) - 4); t.lineTo(X(x) + 3.5, Y(y) + 3); t.lineTo(X(x) - 3.5, Y(y) + 3); t.closePath(); t.fill(); }
  }
  // boschi
  const canopy = [];
  for (const f of s.forest) { const n = Math.round(f.r * f.r / 900); for (let i = 0; i < n; i++) { const a = r2() * TAU, rr = Math.sqrt(r2()) * f.r; canopy.push({ x: f.x + Math.cos(a) * rr, y: f.y + Math.sin(a) * rr, r: 14 + r2() * 16 }); } }
  for (const c of canopy) { t.fillStyle = 'rgba(40,80,60,0.55)'; t.beginPath(); t.arc(X(c.x), Y(c.y), c.r * sc, 0, TAU); t.fill(); }
  for (const c of canopy) { t.fillStyle = 'rgba(80,130,95,0.35)'; t.beginPath(); t.arc(X(c.x) - c.r * sc * 0.25, Y(c.y) - c.r * sc * 0.25, c.r * sc * 0.45, 0, TAU); t.fill(); }
  // villaggio
  if (s.village) { const v = s.village; for (let i = 0; i < 26; i++) { const x = v.x + r2() * v.w, y = v.y + r2() * v.h; t.fillStyle = 'rgba(255,190,110,0.10)'; t.fillRect(X(x), Y(y), 14 * sc + 2, 10 * sc + 2); if (r2() < 0.4) { t.fillStyle = 'rgba(255,200,120,0.55)'; t.fillRect(X(x) + 2, Y(y) + 2, 1.6, 1.6); } } }
  // anelli di distanza
  t.font = '10.5px ' + MONO;
  for (const r of [250, 500, 750, 1000]) {
    t.strokeStyle = 'rgba(153,255,204,0.08)'; t.lineWidth = 1; t.setLineDash([2, 5]); t.beginPath(); t.arc(X(0), Y(0), r * sc, 0, TAU); t.stroke(); t.setLineDash([]);
    t.fillStyle = 'rgba(153,255,204,0.35)'; t.fillText(r + ' m', X(r * 0.707) + 4, Y(-r * 0.707) - 3);
  }
  t.fillStyle = 'rgba(230,237,242,0.5)'; t.font = '600 12px ' + DISP; t.textAlign = 'center';
  t.fillText('N', X(0), Y(-1040)); t.fillText('S', X(0), Y(1060)); t.fillText('E', X(1050), Y(4)); t.fillText('O', X(-1050), Y(4)); t.textAlign = 'left';
  t.fillStyle = 'rgba(230,237,242,0.32)'; t.font = '11px ' + DISP;
  for (const [txt, x, y] of s.labels) t.fillText(txt, X(x), Y(y));
  for (const rg of s.ridges || []) { t.fillStyle = 'rgba(255,181,71,0.6)'; t.textAlign = 'center'; t.fillText(rg.n, X(rg.x), Y(rg.y)); t.textAlign = 'left'; }
  for (const c of s.crowd || []) { t.fillStyle = 'rgba(255,181,71,0.7)'; t.textAlign = 'center'; t.fillText(c.name, X(c.x), Y(c.y - c.r) - 4); t.textAlign = 'left'; }
}

// ============================================================ il sito da difendere
function drawAsset(time) {
  const K = 1.28, sc1 = sc * K, x = (v) => cx0 + v * sc1, y = (v) => cy0 + v * sc1, kind = S().asset;
  ctx.save();
  const hr = 95 * sc1, low = mainAsset().hp < 3 && G.phase !== 'intro', hp = low && G.phase === 'wave' ? 0.10 + 0.08 * Math.sin(time * 6) : 0.07;
  const hg = ctx.createRadialGradient(cx0, cy0, 0, cx0, cy0, hr);
  hg.addColorStop(0, low ? `rgba(255,107,94,${hp})` : `rgba(0,208,180,${hp})`); hg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(cx0, cy0, hr, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(0,208,180,0.45)'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]); ctx.strokeRect(x(-62), y(-55), 124 * sc1, 110 * sc1); ctx.setLineDash([]);
  const blink = Math.sin(time * 3) > 0;
  if (kind === 'plant') {
    ctx.fillStyle = '#1C2C36'; ctx.fillRect(x(-40), y(-10), 60 * sc1, 34 * sc1);
    ctx.fillStyle = '#22343F'; for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) ctx.fillRect(x(28 + i * 7), y(-6 + j * 9), 4 * sc1, 5 * sc1);
    for (const [tx, ty] of [[-28, -32], [6, -34]]) {
      const cx = x(tx), cy = y(ty), rr = 15 * sc1;
      const g = ctx.createRadialGradient(cx - rr * 0.3, cy - rr * 0.3, 1, cx, cy, rr); g.addColorStop(0, '#3A5664'); g.addColorStop(1, '#1A2A33');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, TAU); ctx.fill(); ctx.strokeStyle = '#4C6B7A'; ctx.lineWidth = 1; ctx.stroke();
      for (let k = 0; k < 3; k++) { const ph = (time * 0.25 + k / 3 + tx * 0.01) % 1; ctx.fillStyle = `rgba(220,235,240,${0.16 * (1 - ph)})`; ctx.beginPath(); ctx.arc(cx + ph * 20 * sc1 + 3, cy - ph * 26 * sc1, rr * (0.5 + ph * 0.9), 0, TAU); ctx.fill(); }
    }
  } else if (kind === 'airport') {
    ctx.fillStyle = '#1F2F39'; ctx.beginPath(); ctx.moveTo(x(-52), y(-4)); ctx.quadraticCurveTo(x(0), y(-26), x(52), y(-4)); ctx.lineTo(x(52), y(18)); ctx.quadraticCurveTo(x(0), y(-2), x(-52), y(18)); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(61,184,245,0.5)'; ctx.lineWidth = 1; ctx.stroke();
    for (let i = -4; i <= 4; i++) { ctx.fillStyle = 'rgba(255,220,150,0.5)'; ctx.fillRect(x(i * 10 - 1.5), y(2 - Math.abs(i) * 0.6), 3 * sc1, 2 * sc1); }
    for (const [gx, gy] of [[-30, 30], [0, 34], [30, 30]]) { ctx.strokeStyle = 'rgba(230,237,242,0.35)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x(gx), y(gy - 7)); ctx.lineTo(x(gx), y(gy + 7)); ctx.moveTo(x(gx - 7), y(gy)); ctx.lineTo(x(gx + 7), y(gy)); ctx.stroke(); }
    ctx.fillStyle = '#2A3E4A'; ctx.beginPath(); ctx.arc(x(44), y(-34), 8 * sc1, 0, TAU); ctx.fill(); ctx.strokeStyle = '#4C6B7A'; ctx.stroke();
    const ba = time * 2.4; ctx.fillStyle = 'rgba(153,255,204,0.18)'; ctx.beginPath(); ctx.moveTo(x(44), y(-34)); ctx.arc(x(44), y(-34), 40 * sc1, ba, ba + 0.35); ctx.closePath(); ctx.fill();
    ctx.fillStyle = blink ? '#99FFCC' : '#3B5F55'; ctx.beginPath(); ctx.arc(x(44), y(-34), 2.4, 0, TAU); ctx.fill();
  } else if (kind === 'stadium') {
    ctx.fillStyle = '#22343F'; ctx.beginPath(); ctx.ellipse(cx0, cy0, 56 * sc1, 42 * sc1, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#4C6B7A'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#1E4A35'; ctx.beginPath(); ctx.ellipse(cx0, cy0, 36 * sc1, 24 * sc1, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(230,237,242,0.4)'; ctx.strokeRect(x(-26), y(-15), 52 * sc1, 30 * sc1); ctx.beginPath(); ctx.moveTo(cx0, y(-15)); ctx.lineTo(cx0, y(15)); ctx.stroke(); ctx.beginPath(); ctx.arc(cx0, cy0, 5 * sc1, 0, TAU); ctx.stroke();
    for (let i = 0; i < 60; i++) { const a = i / 60 * TAU, f = (Math.sin(time * 4 + i * 1.7) + 1) / 2; ctx.fillStyle = `rgba(255,${210 + f * 40},170,${0.25 + 0.4 * f})`; ctx.fillRect(cx0 + Math.cos(a) * 46 * sc1, cy0 + Math.sin(a) * 33 * sc1, 1.4, 1.4); }
    for (const [fx, fy] of [[-50, -38], [50, -38], [-50, 38], [50, 38]]) { const g = ctx.createRadialGradient(x(fx), y(fy), 0, x(fx), y(fy), 24 * sc1); g.addColorStop(0, 'rgba(255,245,220,0.55)'); g.addColorStop(1, 'rgba(255,245,220,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x(fx), y(fy), 24 * sc1, 0, TAU); ctx.fill(); ctx.fillStyle = '#FFF6E0'; ctx.beginPath(); ctx.arc(x(fx), y(fy), 2, 0, TAU); ctx.fill(); }
  } else if (kind === 'port') {
    ctx.strokeStyle = 'rgba(230,237,242,0.3)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x(0), y(20)); ctx.lineTo(x(0), y(55)); ctx.stroke();
    for (const [tx, ty] of [[-34, -14], [4, -26], [38, -6]]) { const cx = x(tx), cy = y(ty), rr = 16 * sc1;
      const g = ctx.createRadialGradient(cx - rr * 0.35, cy - rr * 0.35, 1, cx, cy, rr); g.addColorStop(0, '#E6EDF2'); g.addColorStop(0.4, '#9FB3BF'); g.addColorStop(1, '#4C6B7A');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, TAU); ctx.fill(); ctx.strokeStyle = '#2A3E4A'; ctx.lineWidth = 1; ctx.stroke(); }
    const fl = 0.6 + 0.4 * Math.sin(time * 11) * Math.sin(time * 7); ctx.fillStyle = '#3A4A55'; ctx.fillRect(x(-50), y(26), 3 * sc1, 3 * sc1);
    const g = ctx.createRadialGradient(x(-48.5), y(22), 0, x(-48.5), y(22), 14 * sc1 * fl); g.addColorStop(0, 'rgba(255,200,120,0.9)'); g.addColorStop(1, 'rgba(255,107,94,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x(-48.5), y(22), 14 * sc1, 0, TAU); ctx.fill();
  }
  else if (kind === 'dam') {
    ctx.fillStyle = '#2A3E4A'; ctx.beginPath(); ctx.moveTo(x(-58), y(-30)); ctx.quadraticCurveTo(x(0), y(-58), x(58), y(-30)); ctx.lineTo(x(58), y(-18)); ctx.quadraticCurveTo(x(0), y(-46), x(-58), y(-18)); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#6E8C9A'; ctx.lineWidth = 1; ctx.stroke();
    for (let i = -3; i <= 3; i++) { const ph = (time * 0.8 + i * 0.13) % 1; ctx.fillStyle = `rgba(150,210,240,${0.35 * (1 - ph)})`; ctx.fillRect(x(i * 8 - 2), y(-24 + ph * 30), 4 * sc1, 6 * sc1); }
    ctx.fillStyle = '#1F2F39'; ctx.fillRect(x(-26), y(8), 52 * sc1, 22 * sc1); ctx.strokeStyle = 'rgba(61,184,245,0.5)'; ctx.strokeRect(x(-26), y(8), 52 * sc1, 22 * sc1);
    for (let i = 0; i < 4; i++) { ctx.fillStyle = Math.sin(time * 4 + i) > 0 ? 'rgba(153,255,204,0.8)' : 'rgba(153,255,204,0.3)'; ctx.fillRect(x(-20 + i * 12), y(16), 5 * sc1, 4 * sc1); }
  } else if (kind === 'summit') {
    ctx.fillStyle = '#22343F'; ctx.fillRect(x(-50), y(-36), 100 * sc1, 72 * sc1); ctx.fillStyle = '#14212A'; ctx.fillRect(x(-28), y(-18), 56 * sc1, 36 * sc1);
    ctx.strokeStyle = '#6E8C9A'; ctx.lineWidth = 1; ctx.strokeRect(x(-50), y(-36), 100 * sc1, 72 * sc1);
    for (let i = 0; i < 7; i++) { const fx = -42 + i * 14, wv = Math.sin(time * 3 + i) * 2; ctx.strokeStyle = '#9FB3BF'; ctx.beginPath(); ctx.moveTo(x(fx), y(46)); ctx.lineTo(x(fx), y(58)); ctx.stroke(); ctx.fillStyle = ['#3DB8F5', '#FF6B5E', '#FFB547', '#99FFCC', '#B48CFF', '#E6EDF2', '#00D0B4'][i]; ctx.fillRect(x(fx), y(46) + wv * 0.3, 7 * sc1, 4.5 * sc1); }
    for (let i = 0; i < 10; i++) { ctx.fillStyle = `rgba(255,220,150,${0.3 + 0.3 * ((i * 7) % 3) / 2})`; ctx.fillRect(x(-46 + i * 9.5), y(-32), 3 * sc1, 3 * sc1); }
  }
  ctx.fillStyle = blink ? '#FFB547' : 'rgba(255,181,71,0.35)'; for (const [px, py] of [[-60, -53], [60, -53], [-60, 53], [60, 53]]) { ctx.beginPath(); ctx.arc(x(px), y(py), 2, 0, TAU); ctx.fill(); }
  if (mainAsset().hp < mainAsset().max && G.phase !== 'intro') { const dmg = Math.min(6, mainAsset().max - mainAsset().hp); for (let i = 0; i < dmg; i++) { const ph = (time * 0.6 + i * 0.37) % 1; ctx.fillStyle = `rgba(40,40,45,${0.5 * (1 - ph)})`; ctx.beginPath(); ctx.arc(x(-20 + i * 12) + ph * 14, y(10) - ph * 40, 6 + ph * 14, 0, TAU); ctx.fill(); } }
  ctx.font = '500 11px ' + DISP; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(153,255,204,0.75)'; ctx.fillText(S().label, cx0, y(55) + 15);
  ctx.restore();
}

// obiettivi secondari
function drawExtra(time) {
  for (const a of G.assets) {
    if (a.main) continue;
    const px = X(a.x), py = Y(a.y), k = sc * 1.25, lowA = a.hp <= 1, gone = a.hp <= 0;
    const g = ctx.createRadialGradient(px, py, 0, px, py, 70 * k); g.addColorStop(0, lowA ? 'rgba(255,107,94,0.14)' : 'rgba(0,208,180,0.09)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, 70 * k, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(0,208,180,0.45)'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(px, py, a.r * sc, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.save(); ctx.translate(px, py);
    if (a.kind === 'ship') { ctx.rotate(-0.2); ctx.fillStyle = '#2E4350'; ctx.beginPath(); ctx.moveTo(-40 * k, -10 * k); ctx.lineTo(34 * k, -10 * k); ctx.lineTo(44 * k, 0); ctx.lineTo(34 * k, 10 * k); ctx.lineTo(-40 * k, 10 * k); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#6E8C9A'; ctx.lineWidth = 1; ctx.stroke(); for (let i = 0; i < 4; i++) { ctx.fillStyle = '#C9D3DA'; ctx.beginPath(); ctx.arc((-26 + i * 16) * k, 0, 6 * k, 0, TAU); ctx.fill(); } }
    else if (a.kind === 'hydro') { ctx.fillStyle = '#22343F'; ctx.fillRect(-24 * k, -14 * k, 48 * k, 28 * k); ctx.strokeStyle = '#6E8C9A'; ctx.strokeRect(-24 * k, -14 * k, 48 * k, 28 * k); for (let i = 0; i < 3; i++) { ctx.strokeStyle = '#3DB8F5'; ctx.beginPath(); ctx.arc((-12 + i * 12) * k, 0, 5 * k, time * 4 + i, time * 4 + i + 4.5); ctx.stroke(); } }
    else if (a.kind === 'substation') { ctx.strokeStyle = '#FFB547'; ctx.lineWidth = 1.2; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { ctx.strokeRect((-22 + i * 16) * k, (-14 + j * 16) * k, 10 * k, 10 * k); } ctx.beginPath(); ctx.moveTo(-26 * k, -18 * k); ctx.lineTo(26 * k, -18 * k); ctx.stroke(); }
    else if (a.kind === 'hotel') { ctx.fillStyle = '#22343F'; ctx.fillRect(-18 * k, -24 * k, 36 * k, 48 * k); for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) { ctx.fillStyle = (i * 7 + j * 3) % 5 ? 'rgba(255,220,150,0.5)' : 'rgba(255,220,150,0.15)'; ctx.fillRect((-14 + i * 8) * k, (-20 + j * 7) * k, 4 * k, 3 * k); } }
    else if (a.kind === 'convoy') { ctx.rotate(Math.atan2(a.path[Math.min(a.pi, a.path.length - 1)][1] - a.y, a.path[Math.min(a.pi, a.path.length - 1)][0] - a.x)); for (let i = 0; i < 3; i++) { ctx.fillStyle = i === 1 ? '#FFB547' : '#C9D3DA'; ctx.fillRect((-30 + i * 22) * k * 0.6, -5 * k, 16 * k * 0.6, 10 * k); } }
    else if (a.kind === 'press') { ctx.fillStyle = '#22343F'; ctx.fillRect(-24 * k, -12 * k, 48 * k, 24 * k); ctx.strokeStyle = '#E6EDF2'; ctx.lineWidth = 1.4; for (const dx of [-12, 8]) { ctx.beginPath(); ctx.arc(dx * k, -14 * k, 6 * k, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); } }
    ctx.restore();
    if (gone) { ctx.strokeStyle = '#FF6B5E'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(px - 14, py - 14); ctx.lineTo(px + 14, py + 14); ctx.moveTo(px + 14, py - 14); ctx.lineTo(px - 14, py + 14); ctx.stroke(); }
    if (a.hp < a.max && G.phase !== 'intro') for (let i = 0; i < a.max - a.hp; i++) { const ph = (time * 0.6 + i * 0.37) % 1; ctx.fillStyle = `rgba(40,40,45,${0.5 * (1 - ph)})`; ctx.beginPath(); ctx.arc(px - 8 + i * 8 + ph * 10, py - ph * 34, 5 + ph * 11, 0, TAU); ctx.fill(); }
    ctx.font = '500 11px ' + DISP; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(153,255,204,0.8)'; ctx.fillText(a.label, px, py + 34 * k + 8);
    for (let i = 0; i < a.max; i++) { ctx.fillStyle = i < a.hp ? '#00D0B4' : '#2B3A44'; ctx.fillRect(px - a.max * 5 + i * 10, py + 34 * k + 13, 8, 4); }
    ctx.textAlign = 'left';
  }
}
