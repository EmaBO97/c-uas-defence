// ============================================================ ondate costruite: adattamento del nemico, pattuglia, intelligence, obiettivi, sfide, replay
const SECTN = ['est', 'sud-est', 'sud', 'sud-ovest', 'ovest', 'nord-ovest', 'nord', 'nord-est'];
const sectorOf = (a) => SECTN[Math.round((((a % TAU) + TAU) % TAU) / (TAU / 8)) % 8];
const nWaves = () => (G.mode === 'endless' ? Infinity : S().waves.length);
const CAPT = ['net', 'netdrone', 'takeover', 'jam', 'netblock', 'pilot'];
const spawnTotal = (w) => w.spawn.reduce((s, [t, , , o = {}]) => s + (t === 'swarm' ? o.n || 8 : t === 'mother' ? 13 : TYPES[t].hostile ? o.n || 1 : 0), 0);

function buildWave(i) {
  const w = G.mode === 'endless' ? genWave(i) : JSON.parse(JSON.stringify(S().waves[i]));
  w.adaptNote = '';
  if (G.adapt && i > 0) applyAdapt(w, G.adapt);
  w.intel = makeIntel(w, i);
  return w;
}

// ---- il nemico si adatta all'effettore che ha funzionato di più nell'ondata precedente
function convert(w, from, to, max) {
  let n = 0;
  for (const sp of w.spawn) { if (n >= max) break; if (from.includes(sp[0])) { if (sp[0] === 'swarm') { sp[3] = { ...(sp[3] || {}), n: 3 }; } sp[0] = to; n++; } }
  return n;
}
const firstAngle = (w) => { const s = w.spawn.find(([t]) => TYPES[t].hostile); return s ? s[2] || 0 : 0; };
const ADAPT = {
  jam: ['Il disturbatore ha fermato molti droni radio: il nemico passa alla fibra ottica, che non ha un collegamento da disturbare.', (w) => convert(w, ['radio'], 'fiber', 2)],
  takeover: ['La presa di controllo ha fatto atterrare molti droni radio: il nemico passa alla fibra ottica.', (w) => convert(w, ['radio'], 'fiber', 2)],
  netblock: ['Il blocco di rete ha funzionato: il nemico abbandona il 4G e passa alla fibra ottica.', (w) => convert(w, ['lte'], 'fiber', 2)],
  hpm: ['Le microonde hanno fermato gli sciami: il nemico aggiunge droni pesanti, schermati.', (w) => { const sw = w.spawn.filter(([t]) => t === 'swarm').slice(0, 2); sw.forEach((s) => w.spawn.push(['heavy', s[1] + 2, s[2]])); return sw.length || (w.spawn.push(['heavy', 6, firstAngle(w)]), 1); }],
  hangar: ['Gli intercettori hanno fatto quasi tutto il lavoro: il nemico manda esche per consumarli.', (w) => (w.spawn.push(['decoy', 3, firstAngle(w), { n: 4, sp: 0.4 }]), 1)],
  longint: ['Gli intercettori veloci hanno fatto il lavoro: il nemico manda esche per consumarli.', (w) => (w.spawn.push(['decoy', 3, firstAngle(w), { n: 4, sp: 0.4 }]), 1)],
  netdrone: ['I droni cacciatori hanno catturato molto: il nemico manda esche per tenerli occupati.', (w) => (w.spawn.push(['decoy', 3, firstAngle(w), { n: 4, sp: 0.4 }]), 1)],
  laser: ['Il laser ha bisogno di tempo sul bersaglio: il nemico manda droni più veloci.', (w) => convert(w, ['radio', 'fiber'], 'fpv', 2)],
  net: ['Le reti hanno catturato i droni arrivati vicino: il nemico attacca prima le tue difese.', (w) => (w.spawn.push(['raider', 8, firstAngle(w) + 0.6]), 1)],
  spoof: ['Lo spoofing ha deviato i droni autonomi: il nemico torna ai droni pilotati via radio.', (w) => convert(w, ['swarm', 'heavy', 'raider'], 'radio', 2)],
};
function applyAdapt(w, dom) {
  const a = ADAPT[dom]; if (!a) return;
  if (a[1](w)) { w.adaptNote = a[0]; w.threats = [...w.threats, ['il nemico si è adattato', 0]]; }
}
function dominantEffector() {
  const k = {}; let tot = 0;
  for (const it of G.items) if (CAT[it.kind].g === 'E' && it.wk) { k[it.kind] = (k[it.kind] || 0) + it.wk; tot += it.wk; }
  const best = Object.entries(k).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] >= 3 && best[1] >= tot * 0.4 ? best[0] : null;
}

// ---- intelligence: una stima, completa solo con la ricognizione avanzata
const intelCost = () => 8 + G.site * 3;
const intelFree = () => G.mode !== 'endless' && G.site === 0 && G.wave < 2;
function makeIntel(w, i) {
  let sd = G.site * 131 + i * 17 + 5 + (G.mode === 'endless' ? 999 : 0); const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const n = spawnTotal(w), hostile = w.spawn.filter(([t]) => TYPES[t].hostile);
  const sectors = [...new Set(hostile.map(([, , a]) => sectorOf(a || 0)))];
  const shown = sectors.filter(() => r() < 0.7); if (!shown.length && sectors.length) shown.push(sectors[0]);
  if (r() < 0.45) { const f = SECTN[Math.floor(r() * 8)]; if (!shown.includes(f)) shown.push(f); }
  const chips = w.threats.filter(([, ok]) => !ok).filter(() => r() < 0.5);
  return { lo: Math.max(1, Math.round(n * (0.6 + r() * 0.2))), hi: Math.max(2, Math.round(n * (1.2 + r() * 0.3))), sectors: shown, chips };
}

// ---- pattuglia: ondate generate sempre più difficili
const GEN = [['radio', 1, 0], ['fiber', 1.2, 0], ['swarm', 4, 0], ['fpv', 1.3, 1], ['heavy', 2, 1], ['loiter', 2, 1], ['decoy', 1, 1], ['spy', 1.2, 2], ['raider', 1.5, 2], ['wing', 2, 3], ['stealth', 2, 4], ['lte', 1.3, 5]];
const PLURAL = { radio: 'droni radio', fiber: 'a fibra ottica', swarm: 'sciame', fpv: 'FPV', heavy: 'pesanti', loiter: 'munizioni circuitanti', decoy: 'esche', spy: 'droni spia', raider: 'droni d’assalto', wing: 'ala fissa', stealth: 'furtivi', lte: 'droni 4G', mother: 'drone madre' };
function genWave(i) {
  let sd = G.site * 977 + i * 131 + (G.genSeed || 1); const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const lvl = Math.max(G.site, SAVE.unlocked), pool = GEN.filter((g) => g[2] <= lvl);
  const spawn = [['auth', 0], ['bird', 0], ['bird', 2]], count = {};
  let pts = 4 + i * 2.2 + G.site * 0.8;
  if (i % 5 === 4 && lvl >= 3) { spawn.push(['mother', 3, r() * TAU]); count.mother = 1; pts -= 8; }
  let guard = 0;
  while (pts > 0.9 && guard++ < 60) {
    const opts = pool.filter((g) => g[1] <= pts + 0.4); if (!opts.length) break;
    const [t, c] = opts[Math.floor(r() * opts.length)], a = r() * TAU, tt = Math.round(r() * (10 + i * 1.5));
    spawn.push(t === 'swarm' ? [t, tt, a, { n: 4 + Math.min(6, i) }] : t === 'decoy' ? [t, tt, a, { n: 4, sp: 0.4 }] : [t, tt, a]);
    count[t] = (count[t] || 0) + (t === 'swarm' ? 4 + Math.min(6, i) : t === 'decoy' ? 4 : 1); pts -= c;
  }
  const wxs = ['sereno', 'sereno', 'notte', 'nebbia', 'pioggia', 'vento'], wx = i < 2 ? 'sereno' : wxs[Math.floor(r() * wxs.length)];
  const ev = [];
  if (r() < 0.35) ev.push(['guasto', 10 + Math.round(r() * 15), ['radar', 'camera', 'rf'][Math.floor(r() * 3)]]);
  if (r() < 0.25) ev.push(['stormo', 8 + Math.round(r() * 10)]);
  if (i >= 3 && r() < 0.25) ev.push(['blackout', 12 + Math.round(r() * 10)]);
  if (r() < 0.2) ev.push(['heli', 6 + Math.round(r() * 12)]);
  if (r() < 0.2) ev.push(['ridoff', 18]);
  const threats = Object.entries(count).map(([t, n]) => [`${t === 'mother' || t === 'swarm' ? '' : n + ' '}${PLURAL[t]}${t === 'swarm' ? ' da ' + n : ''}`, 0]);
  return { name: `Pattuglia ${i + 1}`, wx, spawn, ev, planes: S().asset === 'airport' ? [3, 35] : [],
    obj: i % 3 === 2 ? { k: 'capture', n: 2 } : null,
    brief: `Ondata generata numero ${i + 1}: ${Object.values(count).reduce((a, b) => a + b, 0)} droni ostili da direzioni diverse. Più vai avanti, più la pressione cresce.`, threats };
}

// ---- obiettivi d'ondata
function objText(o) {
  if (!o) return '';
  if (o.k === 'capture') return `Obiettivo: cattura almeno ${o.n} droni ostili intatti (reti, drone cacciatore, disturbatore, presa di controllo, blocco di rete, goniometria).`;
  if (o.k === 'escort') return `Obiettivo: scorta ${o.label.toLowerCase()} fino a destinazione. I droni possono puntarlo.`;
  return '';
}
function startObjective() {
  const o = WV().obj; G.ws.obj = o || null; G.ws.captured = 0;
  if (o && o.k === 'escort') { const [x, y] = o.path[0]; G.assets.push({ x, y, label: o.label, kind: 'convoy', r: 40, hp: 3, max: 3, temp: true, path: o.path, pi: 1, speed: o.speed || 9 }); }
}
function moveConvoys(dt) {
  for (const a of G.assets) {
    if (!a.temp || a.hp <= 0 || a.arrived) continue;
    const [tx, ty] = a.path[a.pi], d = Math.hypot(tx - a.x, ty - a.y), v = a.speed * dt;
    if (d <= v) { a.x = tx; a.y = ty; a.pi++; if (a.pi >= a.path.length) { a.arrived = true; feed(`${a.label}: arrivato a destinazione`, 'obiettivo raggiunto', 'good'); recEvent(`${a.label} arrivato`, a.x, a.y, '#99FFCC', true); } }
    else { a.x += (tx - a.x) / d * v; a.y += (ty - a.y) / d * v; }
  }
}
function endObjective(s) {
  const o = s.obj; if (!o) return null;
  let ok = false;
  if (o.k === 'capture') ok = s.captured >= o.n;
  if (o.k === 'escort') { const a = G.assets.find((x) => x.temp); ok = !!(a && a.hp > 0 && a.arrived); }
  G.assets = G.assets.filter((a) => !a.temp);
  s.objOk = ok;
  if (ok) { G.budget += 30; G.score += 300; } else if (o.k === 'escort') G.score -= 300;
  return ok;
}

// ---- sfide per sito
const CHAL = {
  decoy: ['Nessun colpo di intercettori o laser sulle esche', (A) => A.reduce((s, x) => s + x.decoyWaste, 0) === 0],
  struct: ['Nessuna struttura distrutta', (A) => A.reduce((s, x) => s + x.structLost, 0) === 0],
  noabil: ['Senza abilità d’ondata', (A) => A.reduce((s, x) => s + x.abil, 0) === 0],
  obj: ['Tutti gli obiettivi d’ondata riusciti', (A) => A.filter((x) => x.obj).every((x) => x.objOk)],
  civ: ['Nessun drone civile abbattuto', (A) => A.every((x) => !x.notes.has('civKill'))],
  noreq: ['Nessuna richiesta di ingaggio ignorata', (A) => A.every((x) => !x.notes.has('reqIgnored'))],
};
const chalDef = (id) => { const [k, v] = id.split(':'); if (k === 'cost') return [`Costo medio per drone sotto ${v.replace('.', ',')} k€`, (A) => { const c = A.reduce((s, x) => s + x.cost, 0), n = A.reduce((s, x) => s + x.stopped, 0); return n > 0 && c / n < +v; }];
  if (k === 'react') return [`Reazione media sotto ${v} s`, (A) => { const r = A.flatMap((x) => x.react); return r.length > 0 && r.reduce((a, b) => a + b, 0) / r.length < +v; }]; return CHAL[k]; };

// ---- registrazione per il replay
function recFrame() {
  const R = G.rec; if (!R || G.t - R.last < 0.25) return; R.last = G.t;
  R.frames.push({ t: G.t, o: G.objs.filter((o) => o.alive && o.type !== 'bird').map((o) => [o.id, o.type, Math.round(o.x), Math.round(o.y), o.cls, o.seen ? 1 : 0]), a: G.assets.map((a) => [Math.round(a.x), Math.round(a.y), a.hp, a.max, a.temp ? 1 : 0]), d: G.items.filter((i) => i.dmg || i.fault).map((i) => G.items.indexOf(i)) });
}
function recEvent(txt, x, y, col, key) { if (G.rec && G.phase === 'wave') G.rec.ev.push({ t: G.t, txt, x, y, col, key: !!key }); }
