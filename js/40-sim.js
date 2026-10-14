// ============================================================ statistiche delle strutture
const lvMul = (it) => 1 + 0.12 * (it.lv - 1);
function rangeOf(it) {
  const c = CAT[it.kind], wx = WX(); let m = wx[it.kind] || 1;
  if (it.kind === 'laser' && it.lv >= 3) m = 1 - (1 - m) / 2;
  let r = c.range * lvMul(it) * m;
  if (c.g === 'S' && G.ab.alert && G.ab.alert.on > 0) r *= 1.3;
  if (c.g === 'S' && hasPerk('rete')) r *= 1.1;
  if (it.kind === 'cell' && it.lv >= 3) r *= 1.3;
  return r;
}
const cdOf = (it) => (it.kind === 'longint' && it.lv >= 3 ? 3.5 : CAT[it.kind].cd * (1 - 0.15 * (it.lv - 1))) * (hasPerk('manut') ? 0.85 : 1);
const takeNeed = (it) => (it.kind === 'netblock' ? (it.lv >= 3 ? 1.5 : 3) : it.lv >= 3 ? 1 : 2);
const ammoOf = (it) => (CAT[it.kind].ammo || 0) * (it.kind === 'net' && it.lv >= 3 ? 2 : 1);
const upCost = (it) => (it.lv >= 3 ? 0 : Math.round(CAT[it.kind].cost * (it.lv === 1 ? 0.6 : 0.9) * (hasPerk('logist') ? 0.7 : 1)));
const laserNeed = (it, o) => (o.type === 'wing' ? 1.4 : 1) * 1.5 * (o.by && o.by.has('camera') ? 0.67 : 1) * (it.lv >= 3 ? 0.7 : 1);

// ============================================================ percorso del drone autorizzato
function pathInfo() {
  const ap = S().authPath, pts = ap.loop ? [...ap.pts, ap.pts[0]] : ap.pts, seg = []; let L = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); L += l; }
  return { pts, seg, L, loop: ap.loop };
}
function pathPoint(s) {
  const P = G.pinfo; let d = s;
  for (let i = 0; i < P.seg.length; i++) { if (d <= P.seg[i]) { const k = d / P.seg[i], [ax, ay] = P.pts[i], [bx, by] = P.pts[i + 1]; return { x: ax + (bx - ax) * k, y: ay + (by - ay) * k }; } d -= P.seg[i]; }
  const [x, y] = P.pts[P.pts.length - 1]; return { x, y };
}

// ============================================================ comparsa degli oggetti
const bt = (type) => (G.ws.byType[type] = G.ws.byType[type] || { n: 0, stopped: 0, hit: 0 });
function mk(type, x, y, extra) {
  const T = TYPES[type];
  const o = { id: G.nextId++, type, x, y, vx: 0, vy: 0, alive: true, state: 'fly', seen: false, seenAt: -1, cls: 'unk', cont: -99, radarT: -99, rx: x, ry: y,
    wob: rnd() * 6, trail: [], hp: T.hp || 1, path: [], pi: 0, by: new Set(), rfT: 0, reqAt: -1, mode: 'cruise', ot: 0, rel: 0, relT: 0, ...extra };
  if (T.raid || (extra && extra.def)) o.raid = true;
  if ((T.hostile || T.decoy) && !o.goal) { const tg = extra && extra.tgt !== undefined ? G.assets[extra.tgt] : null; o.goal = tg && tg.hp > 0 ? tg : liveNearest(o); }
  G.objs.push(o);
  if (T.hostile) { G.ws.hostile++; bt(type).n++; }
  if (T.decoy) G.ws.decoys++;
  return o;
}
function nearestItem(o) { let b = null, bd = 1e9; for (const it of G.items) { if (it.dmg) continue; const d = dist(o, it); if (d < bd) { bd = d; b = it; } } return b; }
function liveNearest(o) { let b = null, bd = 1e9; for (const a of G.assets) { if (a.hp <= 0 || a.arrived) continue; const d = Math.hypot(o.x - a.x, o.y - a.y); if (d < bd) { bd = d; b = a; } } return b || G.assets[0]; }
function spawn(p) {
  const [type, , a = 0, opt = {}] = p.spec;
  if (type === 'bird') {
    const z = S().birdZone; let x, y;
    if (z) { const aa = rnd() * TAU, r = Math.sqrt(rnd()) * z.r; x = z.x + Math.cos(aa) * r; y = z.y + Math.sin(aa) * r; }
    else { const aa = rnd() * TAU, r = 300 + rnd() * 600; x = Math.cos(aa) * r; y = Math.sin(aa) * r; }
    mk('bird', x, y, { hd: rnd() * TAU, flap: rnd() * 6 }); return;
  }
  if (type === 'civil') { const aa = rnd() * TAU, r = 380 + rnd() * 380; mk('civil', Math.cos(aa) * r, Math.sin(aa) * r, { wp: null }); return; }
  if (type === 'auth') { const ps = (opt.s || 0) * G.pinfo.L, q = pathPoint(ps); mk('auth', q.x, q.y, { ps, dir: 1 }); return; }
  const n = type === 'swarm' ? opt.n || 8 : opt.n || 1, sp = type === 'swarm' ? 0.22 : opt.sp || 0.3;
  for (let i = 0; i < n; i++) {
    const aa = n > 1 ? a + (rnd() - 0.5) * sp : a, r = (opt.r || R_MAP) + (n > 1 ? rnd() * 140 : 0), j = n > 1 ? 60 : 0;
    mk(type, Math.cos(aa) * r, Math.sin(aa) * r, { tgt: opt.tgt, def: opt.def, path: (opt.via || []).map(([x, y]) => ({ x: x + (rnd() - 0.5) * j, y: y + (rnd() - 0.5) * j })) });
  }
}
function computeTotal() {
  return spawnTotal(WV());
}

// ============================================================ passo di simulazione
function seek(o, tx, ty, speed, wk) {
  const dx = tx - o.x, dy = ty - o.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d, s = Math.sin(G.t * 0.9 + o.wob) * wk;
  o.vx = (ux - uy * s) * speed; o.vy = (uy + ux * s) * speed; return d;
}
function step(dt) {
  if (G.t > 2.3 && !$('banner').hidden) $('banner').hidden = true;
  G.t += dt;
  for (const p of G.pending) if (!p.done && G.t >= p.t) { p.done = true; spawn(p); }
  for (const e of G.events) if (!e.done && G.t >= e.t) { e.done = true; doEvent(e); }
  for (const p of G.planes) if (!p.done && G.t >= p.t) { p.done = true; mk('plane', 1300, CY, {}); }
  for (const a of Object.values(G.ab)) { a.cd = Math.max(0, a.cd - dt); a.on = Math.max(0, a.on - dt); }
  moveConvoys(dt);
  const wobW = WX().wob || 1;
  for (const o of G.objs) {
    if (!o.alive) { if (o.state === 'falling') { o.fall += dt; if (o.fall > 1.2) o.state = 'gone'; } continue; }
    const T = TYPES[o.type];
    if (o.state === 'jammed') { o.jt -= dt; o.vx *= 0.92; o.vy *= 0.92; if (o.jt <= 0) neutralize(o, o.soft || 'jam'); }
    else if (o.state === 'spoofed') { o.jt -= dt; const a = Math.atan2(o.vy, o.vx) + 1.4 * dt, v = Math.hypot(o.vx, o.vy); o.vx = Math.cos(a) * v; o.vy = Math.sin(a) * v; if (o.jt <= 0) neutralize(o, 'spoof'); }
    else if (o.type === 'civil') {
      if (!o.wp || Math.hypot(o.wp.x - o.x, o.wp.y - o.y) < 40) { const aa = rnd() * TAU, r = 260 + rnd() * 460; o.wp = { x: Math.cos(aa) * r, y: Math.sin(aa) * r }; }
      seek(o, o.wp.x, o.wp.y, T.speed, 0.2);
    }
    else if (o.type === 'bird') { o.hd += (rnd() - 0.5) * 1.4 * dt; if (Math.hypot(o.x, o.y) > 1000) o.hd = Math.atan2(-o.y, -o.x) + (rnd() - 0.5); o.vx = Math.cos(o.hd) * T.speed; o.vy = Math.sin(o.hd) * T.speed; o.flap += dt * 9; }
    else if (o.type === 'auth') {
      const P = G.pinfo; o.ps += o.dir * T.speed * dt;
      if (P.loop) o.ps = ((o.ps % P.L) + P.L) % P.L; else { if (o.ps > P.L) { o.ps = P.L; o.dir = -1; } if (o.ps < 0) { o.ps = 0; o.dir = 1; } }
      const q = pathPoint(o.ps); o.vx = (q.x - o.x) / dt; o.vy = (q.y - o.y) / dt;
    }
    else if (o.type === 'heli') { const d = seek(o, o.lx, o.ly, T.speed, 0); if (d < 25) { o.alive = false; o.state = 'gone'; feed('Elisoccorso atterrato', 'armi ad area di nuovo disponibili', 'good'); continue; } }
    else if (o.type === 'plane') { o.vx = -T.speed; o.vy = 0; if (o.x < -100) { o.alive = false; o.state = 'gone'; continue; } }
    else if (T.hunter) moveHunter(o, T, dt);
    else if (T.spy) { moveSpy(o, T, dt); if (!o.alive) continue; }
    else {
      if (o.goal && (o.goal.hp <= 0 || o.goal.arrived)) o.goal = liveNearest(o);
      if (o.raid && (!o.rtg || o.rtg.dmg || !G.items.includes(o.rtg))) o.rtg = nearestItem(o);
      const tg = o.path[o.pi], gl = o.raid && o.rtg ? o.rtg : o.goal || G.assets[0], tx = tg ? tg.x : gl.x, ty = tg ? tg.y : gl.y;
      const d = seek(o, tx, ty, T.speed * G.spd, (o.type === 'fiber' ? 0.3 : o.type === 'mother' ? 0.05 : 0.14) * wobW);
      if (tg && d < 50) o.pi++;
      if (!tg && o.raid && o.rtg && d < 18) { structHit(o, o.rtg); continue; }
      if (o.type === 'mother' && Math.hypot(o.x - gl.x, o.y - gl.y) < 850 && o.rel < 4) {
        o.relT -= dt;
        if (o.relT <= 0) {
          o.relT = 6; o.rel++;
          for (let i = 0; i < 3; i++) { const a = rnd() * TAU; mk('swarm', o.x + Math.cos(a) * 25, o.y + Math.sin(a) * 25, { goal: gl }); }
          SND.release(); G.ws.notes.add('release'); feed('Il drone madre rilascia uno sciame', `3 droni · rilascio ${o.rel} di 4`, 'bad');
        }
      }
    }
    o.x += o.vx * dt; o.y += o.vy * dt;
    if (!o.alive) continue;
    const ga = o.goal;
    if (ga && T.hostile && !(T.hunter && o.tg) && !(o.raid && o.rtg) && Math.hypot(o.x - ga.x, o.y - ga.y) < ga.r) plantHit(o);
    else if (ga && T.decoy && Math.hypot(o.x - ga.x, o.y - ga.y) < ga.r) decoyArrive(o);
  }
  moveScouts(dt); sense(dt); autoEngage(); effectors(dt);
  for (const o of G.objs) if (o.reqAt < 0 && needsAuth(o)) { o.reqAt = G.t; G.ws.requests++; SND.alarm(); }
  G.fx = G.fx.filter((f) => (f.t += dt) < f.dur);
  for (const p of G.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.96; p.vy *= 0.96; p.life -= dt; }
  G.parts = G.parts.filter((p) => p.life > 0);
  const threat = (t) => TYPES[t].hostile || TYPES[t].decoy;
  recFrame();
  const left = G.objs.some((o) => o.alive && threat(o.type)) || G.pending.some((p) => !p.done && threat(p.type)) || G.assets.some((a) => a.temp && a.hp > 0 && !a.arrived);
  if (!left || siteLost() || G.t > 300) { G.endIn = G.endIn ?? 1.2; G.endIn -= dt; if (G.endIn <= 0) { G.endIn = null; endWave(); } }
}
// droni da ricognizione amici: vanno a vedere le tracce non identificate
const SCOUT_V = 38;
function scoutRange() { return 150 * (WX().scoutcam || 1) * (hasPerk('rete') ? 1.1 : 1); }
function moveScouts(dt) {
  for (const it of G.items) {
    if (it.kind !== 'scout') continue;
    const n = it.lv >= 3 ? 2 : 1;
    it.uav = it.uav || []; while (it.uav.length < n) it.uav.push({ x: it.x, y: it.y, tgt: null });
    const claimed = new Set();
    for (const u of it.uav) {
      if (!isOn(it)) { const d = Math.hypot(it.x - u.x, it.y - u.y); if (d > 2) { u.x += (it.x - u.x) / d * Math.min(d, SCOUT_V * dt); u.y += (it.y - u.y) / d * Math.min(d, SCOUT_V * dt); } u.tgt = null; continue; }
      let t = G.objs.find((o) => o.id === u.tgt);
      if (!t || !t.alive || t.camId || t.state !== 'fly' || dist(t, it) > rangeOf(it) + 100 || claimed.has(t.id)) {
        t = null; let bd = 1e9;
        for (const o of G.objs) { if (!o.alive || o.camId || TYPES[o.type].manned || o.state !== 'fly' || !visible(o) || claimed.has(o.id) || (o.cls !== 'unk' && o.cls !== 'drone' && o.cls !== 'hostile') || dist(o, it) > rangeOf(it)) continue; const d = Math.hypot(o.x - u.x, o.y - u.y); if (d < bd) { bd = d; t = o; } }
        u.tgt = t ? t.id : null;
      }
      if (t) claimed.add(t.id);
      const tx = t ? t.x : it.x + Math.cos(G.t * 0.5) * 60, ty = t ? t.y : it.y + Math.sin(G.t * 0.5) * 60, d = Math.hypot(tx - u.x, ty - u.y);
      if (d > (t ? 60 : 3)) { const v = SCOUT_V * G.spd; u.x += (tx - u.x) / d * Math.min(d, v * dt); u.y += (ty - u.y) / d * Math.min(d, v * dt); }
    }
  }
}
// drone spia: raggiunge un'orbita a 450 m, filma per 20 s e se ne va
function moveSpy(o, T, dt) {
  const d = Math.hypot(o.x, o.y), R = 450;
  if (o.mode === 'leave') { seek(o, o.x * 3, o.y * 3, T.speed * 1.4 * G.spd, 0); if (d > 1150) { o.alive = false; o.state = 'gone'; G.ws.spyEsc++; bt(o.type).hit++; G.score -= 200; recEvent('Il drone spia riparte con le immagini', o.x, o.y, '#FFB547', true); G.ws.notes.add('spy'); feed('Il drone spia se ne va', 'ha filmato il sito: informazioni perse', 'bad'); } return; }
  if (o.mode === 'cruise' && d > R + 5) { seek(o, 0, 0, T.speed * G.spd, 0.1); return; }
  if (o.mode !== 'orbit') { o.mode = 'orbit'; o.ot = 0; feed(`Traccia ${o.id}: gira intorno al sito`, 'un drone spia sta filmando', 'warn'); }
  o.ot += dt; const a = Math.atan2(o.y, o.x) + T.speed / R * dt;
  o.vx = (Math.cos(a) * R - o.x) / dt; o.vy = (Math.sin(a) * R - o.y) / dt;
  if (o.ot > 20) o.mode = 'leave';
}
// munizione circuitante: cerca ciò che emette, gli gira intorno e poi si tuffa
function moveHunter(o, T, dt) {
  if (o.tg && (!G.items.includes(o.tg) || !isOn(o.tg))) { o.tg = null; o.mode = 'cruise'; o.ot = 0; }
  if (!o.tg) { let best = null, bd = 1e9; for (const it of G.items) if (CAT[it.kind].emit && isOn(it)) { const d = dist(o, it); if (d < bd) { bd = d; best = it; } } o.tg = best; }
  const gl = o.goal || G.assets[0], tx = o.tg ? o.tg.x : gl.x, ty = o.tg ? o.tg.y : gl.y, d = Math.hypot(tx - o.x, ty - o.y), R = 380;
  if (o.mode === 'dive') seek(o, tx, ty, T.dive * G.spd, 0);
  else if (d > R + 5 && o.mode === 'cruise') seek(o, tx, ty, T.speed * G.spd, 0.1);
  else {
    if (o.mode !== 'orbit') { o.mode = 'orbit'; o.ot = 0; }
    o.ot += dt; const a = Math.atan2(o.y - ty, o.x - tx) + T.speed / R * dt;
    o.vx = (tx + Math.cos(a) * R - o.x) / dt; o.vy = (ty + Math.sin(a) * R - o.y) / dt;
    if (o.ot > 3.5) { o.mode = 'dive'; SND.dive(); G.ws.notes.add('dive'); feed('Munizione circuitante in picchiata', o.tg ? `bersaglio: ${CAT[o.tg.kind].name}` : `bersaglio: ${gl.label}`, 'bad'); }
  }
  if (o.tg && d < 16) structHit(o, o.tg);
}
function plantHit(o) {
  const T = TYPES[o.type], dm = T.dmg || 1;
  const ga = o.goal || G.assets[0]; G.ws.log.push(`colpo ${o.type} t${G.t.toFixed(0)} ${ga.label}`); o.alive = false; o.state = 'gone'; ga.hp = Math.max(0, ga.hp - dm); G.integrity = mainAsset().hp; if (!ga.main) { G.ws.notes.add('secHit'); G.ws.secHit.add(ga.label); } G.ws.hits++; bt(o.type).hit++; G.score -= 300 * dm;
  if (o.cls === 'unk' && o.seen) G.ws.notes.add('unkPassed'); if (!o.seen) G.ws.notes.add('unseen'); if (o.reqAt >= 0 && !o.prio) G.ws.notes.add('reqIgnored');
  if (o.deny) G.ws.notes.add('denyHit');
  burst(o.x, o.y, '#FF6B5E', 34, 140); G.shake = 0.5; G.flash = 0.6; SND.hit();
  recEvent(`${T.name} colpisce ${ga.label}`, ga.x, ga.y, '#FF6B5E', true); if (ga.temp && ga.hp <= 0) feed(`${ga.label} distrutto`, 'obiettivo d’ondata fallito', 'bad');
  feed(`${T.name} ha colpito: ${ga.label}`, ga.hp <= 0 ? 'obiettivo fuori servizio' : dm > 1 ? `danno ${dm}` : o.seen ? '' : 'mai rilevato', 'bad');
  if (G.sel === o.id) G.sel = null;
}
function decoyArrive(o) { o.alive = false; o.state = 'gone'; G.ws.decoyPass++; feed('Esca arrivata sul sito', 'era vuota: nessun danno'); }
function structHit(o, it) {
  G.ws.log.push(`strutt ${CAT[it.kind].name} da ${o.type} t${G.t.toFixed(0)}`); o.alive = false; o.state = 'gone'; it.dmg = true; it.busy = null; G.ws.structLost++; bt(o.type).hit++; G.score -= 100; G.ws.notes.add('structLost'); G.ws.lostKinds.add(it.kind);
  recEvent(`${CAT[it.kind].name} distrutto da ${TYPES[o.type].name.toLowerCase()}`, it.x, it.y, '#FF6B5E', true); burst(it.x, it.y, '#FF6B5E', 30, 120); G.shake = 0.4; SND.boom();
  feed(`${CAT[it.kind].name} distrutto`, `${TYPES[o.type].name.toLowerCase()} · premi 3 per ripararlo`, 'bad'); if (o.raid) G.ws.notes.add('raidHit');
  if (G.sel === o.id) G.sel = null;
}

// ============================================================ eventi
function doEvent(e) {
  if (e.k === 'guasto') {
    const it = G.items.find((i) => i.kind === e.arg && isOn(i)) || G.items.find((i) => CAT[i.kind].g === 'S' && isOn(i)); if (!it) return;
    it.fault = true; it.busy = null; G.ws.notes.add('fault'); SND.bad(); feed(`Guasto: ${CAT[it.kind].name} fuori servizio`, 'premi 3 per la squadra tecnica', 'warn');
  } else if (e.k === 'ridoff') {
    const o = G.objs.find((x) => x.alive && x.type === 'auth'); if (!o) return;
    o.ridOff = true; if (!o.camId) o.cls = 'unk'; G.ws.notes.add('ridoff'); SND.alarm();
    feed('Drone autorizzato: Remote ID perso', `traccia ${o.id}: il sistema non lo riconosce più`, 'warn');
  } else if (e.k === 'blackout') {
    const on = G.items.filter(isOn); let n = 0;
    on.forEach((it, i) => { if ((i * 7 + G.wave * 3) % 5 < 2) { it.fault = true; it.busy = null; n++; } });
    if (!n) return; G.ws.notes.add('blackout'); SND.bad(); feed(`Blackout: ${n} strutture senza corrente`, 'premi 3 per la squadra tecnica', 'bad');
  } else if (e.k === 'heli') {
    const a = rnd() * TAU, la = a + (rnd() - 0.5) * 1.2; mk('heli', Math.cos(a) * 1150, Math.sin(a) * 1150, { lx: Math.cos(la) * 420, ly: Math.sin(la) * 420 });
    G.ws.notes.add('heli'); SND.alarm(); feed('Elisoccorso in arrivo', 'ordine: niente armi ad area finché non atterra', 'warn');
  } else if (e.k === 'stormo') {
    const a = rnd() * TAU; for (let i = 0; i < 6; i++) mk('bird', Math.cos(a) * 520 + (rnd() - 0.5) * 80, Math.sin(a) * 520 + (rnd() - 0.5) * 80, { hd: a + PI + (rnd() - 0.5) * 0.4, flap: rnd() * 6 });
    feed('Stormo di uccelli', '6 tracce in più sul radar', 'warn');
  }
}

// ============================================================ abilità
function useAbility(k) {
  if (G.phase !== 'wave') return false;
  const a = G.ab[k], def = ABIL.find((x) => x.k === k); if (!a || a.cd > 0) return false;
  a.cd = def.cd * (hasPerk('addestr') ? 0.65 : 1); G.ws.abil++;
  if (k === 'alert') { a.on = def.dur; feed('Allerta sensori', 'portata +30% per 10 s', 'good'); }
  else if (k === 'reload') { for (const it of G.items) if (CAT[it.kind].g === 'E') { it.cd = 0; if (it.kind === 'net') it.ammo += 2; } feed('Ricarica rapida', 'tutti gli effettori pronti', 'good'); }
  else if (k === 'repair') {
    let n = 0; for (const it of G.items) if (it.dmg || it.fault) { it.dmg = false; it.fault = false; n++; }
    if (!n) { a.cd = 0; G.ws.abil--; feed('Squadra tecnica', 'nessuna struttura da riparare'); return false; }
    feed('Squadra tecnica', `${n} ${n > 1 ? 'strutture rimesse' : 'struttura rimessa'} in linea`, 'good');
  }
  SND.ability(); renderAbil(); return true;
}

// ============================================================ sensori e classificazione
function sense(dt) {
  const sweep = SWEEP / (G.ab.alert && G.ab.alert.on > 0 ? 2 : 1);
  const crowded = !!S().rfCrowded, ridged = !!S().ridges;
  for (const it of G.items) if (it.kind === 'radar') { it.a0 = it.ang; if (isOn(it)) it.ang = (it.ang + TAU * dt / sweep) % TAU; it.a1 = it.ang; }
  for (const o of G.objs) {
    if (!o.alive) continue;
    const T = TYPES[o.type];
    if (T.manned) { o.seen = true; o.cls = o.type === 'heli' ? 'heli' : 'plane'; o.cont = G.t; continue; }
    const fo = inForest(o), wat = T.low && inWater(o.x, o.y), rid = ridged && inRidge(o), stl = T.stealth ? 0.35 : 1, by = new Set(); let rf3 = null, acu3 = false, irst3 = false, ved = 0;
    for (const it of G.items) {
      if (!isOn(it)) continue;
      const d = dist(o, it), rng = rangeOf(it);
      if (rid && d > 250 && it.kind !== 'scout') continue;
      if (it.kind === 'radar') {
        const r = rng * (T.small ? 0.7 : 1) * (T.big ? 1.2 : 1) * (wat ? 0.4 : 1) * stl;
        if (d <= r && !(T.low && fo)) {
          let b = Math.atan2(o.y - it.y, o.x - it.x); if (b < 0) b += TAU;
          const swept = it.a0 <= it.a1 ? b > it.a0 && b <= it.a1 : b > it.a0 || b <= it.a1;
          if (swept) { o.radarT = G.t; o.rx = o.x; o.ry = o.y; if (it.lv >= 3) o.mdop = true; }
          if (G.t - o.radarT < sweep + 0.2) by.add('radar');
        }
      } else if (it.kind === 'rf') { if (T.radio && d <= rng) { by.add('rf'); if (it.lv >= 3) rf3 = it; } }
      else if (it.kind === 'acu') { if (o.type !== 'bird' && d <= rng * (T.high ? 0.5 : 1)) { by.add('acu'); if (it.lv >= 3) acu3 = true; } }
      else if (it.kind === 'camera') { if (d <= rng * (fo && it.lv < 3 ? 0.5 : 1)) by.add('camera'); }
      else if (it.kind === 'vedetta') { if (d <= rng * (fo ? 0.5 : 1)) ved = Math.max(ved, it.lv >= 3 ? 2 : 1); }
      else if (it.kind === 'scout') { if (isOn(it) && it.uav && it.uav.some((u) => Math.hypot(o.x - u.x, o.y - u.y) <= scoutRange())) by.add('scout'); }
      else if (it.kind === 'irst') { if (d <= rng * (fo ? 0.7 : 1)) { by.add('irst'); if (it.lv >= 3) irst3 = true; } }
      else if (it.kind === 'pradar') { if (d <= rng * (T.small ? 0.8 : 1) * (wat ? 0.4 : 1) && !(T.low && fo)) { if (G.t - (o.pT ?? -9) >= 1) { o.pT = G.t; o.radarT = G.t; o.rx = o.x; o.ry = o.y; if (it.lv >= 3) o.mdop = true; } by.add('pradar'); } }
      else if (it.kind === 'cell') { if (T.cell && d <= rng) by.add('cell'); }
      else if (it.kind === 'lowradar') { if (d <= rng * (T.small ? 0.8 : 1) * stl) { by.add('lowradar'); o.radarT = G.t; o.rx = o.x; o.ry = o.y; if (it.lv >= 3) o.mdop = true; } }
    }
    if (ved) { o.vedT = (o.vedT || 0) + dt * ved; if (o.vedT >= 2) by.add('vedetta'); } else o.vedT = 0;
    o.by = by;
    if (by.has('rf') || by.has('acu') || by.has('camera') || by.has('vedetta') || by.has('irst') || by.has('cell') || by.has('scout')) o.cont = G.t;
    if (!by.size) continue;
    if (!o.seen) { o.seen = true; o.seenAt = G.t; if (T.hostile || o.type === 'auth') SND.detect(o.type); }
    let cls = o.cls;
    if (by.has('camera') || by.has('vedetta') || by.has('scout')) { cls = idCls(o); o.camId = true; }
    else if (o.camId) { /* l'identificazione visiva resta valida */ }
    else if (by.has('rf')) cls = o.type === 'auth' ? (o.ridOff ? 'drone' : 'auth') : crowded || o.type === 'civil' ? (cls === 'hostile' ? cls : 'drone') : 'hostile';
    else if (by.has('cell')) cls = 'hostile';
    else if (irst3 && AUTONOMOUS.includes(o.type)) cls = 'hostile';
    else if (by.has('irst') && (cls === 'unk' || cls === 'bird')) cls = o.type === 'bird' ? 'bird' : 'drone';
    else if (acu3 && (cls === 'unk' || cls === 'bird' || cls === 'drone')) cls = T.hostile ? 'hostile' : 'drone';
    else if (by.has('acu') && (cls === 'unk' || cls === 'bird')) cls = 'drone';
    if (cls === 'unk' && o.mdop) cls = o.type === 'bird' ? 'bird' : 'drone';
    if (cls === 'drone' && hasPerk('fusione') && by.size >= 2 && (T.hostile || T.decoy)) cls = 'hostile';
    if (cls !== o.cls) o.clsAt = G.t;
    o.cls = cls;
    if (rf3 && (o.type === 'radio' || o.type === 'decoy' || o.type === 'civil') && o.state === 'fly') { o.rfT += dt; if (o.rfT >= 6) neutralize(o, 'pilot', rf3); }
  }
}
const contNow = (o) => G.t - o.cont < 0.25;
const visible = (o) => o.alive && (TYPES[o.type].manned || contNow(o) || G.t - o.radarT < SWEEP + 0.2);
const shownPos = (o) => (contNow(o) ? { x: o.x, y: o.y } : { x: o.rx, y: o.ry });

// ============================================================ regole di ingaggio
const roeOK = (cls) => cls === 'hostile' || (cls === 'drone' && G.roe !== 'rigorose') || (cls === 'unk' && G.roe === 'aggressive');
const engageable = (o) => !TYPES[o.type].manned && (o.prio || (!o.deny && roeOK(o.cls) && G.t - (o.clsAt ?? -9) >= 0.6)); // 0,6 s per confermare la traccia
const needsAuth = (o) => o.alive && o.state === 'fly' && !o.prio && !o.deny && !o.dismiss && !TYPES[o.type].manned && (o.cls === 'unk' || o.cls === 'drone') && !roeOK(o.cls) && visible(o) && closing(o);
const closing = (o) => { const a = nearestAsset(o), dx = o.x - a.x, dy = o.y - a.y, d = Math.hypot(dx, dy); return d < 600 && (d < 250 || -(dx * o.vx + dy * o.vy) / (d || 1) > 6); };
function holdReason(it, o) {
  const k = it.kind, s = S();
  if ((k === 'jam' || k === 'hpm' || k === 'spoof') && G.objs.some((p) => p.alive && p.type === 'heli')) return 'elisoccorso';
  if (s.asset === 'airport') {
    if ((k === 'jam' || k === 'hpm' || k === 'spoof') && G.objs.some((p) => p.alive && p.type === 'plane' && dist(p, it) < rangeOf(it) + 100)) return 'aereo';
    if (k === 'laser' && inCorridor(o)) return 'corridoio';
  }
  if (s.crowd && (k === 'laser' || k === 'hangar' || k === 'longint') && crowdAt(o)) return 'folla';
  if ((k === 'jam' || k === 'hpm' || k === 'spoof') && G.objs.some((t) => t.alive && t.deny && t.type !== 'bird' && (k === 'hpm' || (k === 'jam' ? TYPES[t.type].radio && !TYPES[t.type].jamProof : TYPES[t.type].gnss)) && dist(t, it) <= rangeOf(it))) return 'protetto';
  if (k === 'netblock' && !(o.by && o.by.has('cell'))) return 'nolink';
  if (k === 'takeover' && !(o.by && o.by.has('rf') && TYPES[o.type].radio && !TYPES[o.type].jamProof)) return 'nolink';
  if (s.crowd && k === 'hpm' && G.objs.some((t) => t.alive && t.type !== 'bird' && !TYPES[t.type].manned && dist(t, it) <= rangeOf(it) && crowdAt(t))) return 'folla';
  return '';
}
function setPrio(o) { if (!o || !o.alive || TYPES[o.type].manned) return; o.prio = true; o.deny = false; G.ws.manual++; feed(`Traccia ${o.id}: ingaggio autorizzato`, CLS[o.cls][0], 'warn'); }
function setDismiss(o) { if (!o || !o.alive) return; o.dismiss = true; }
function setDeny(o) { if (!o || !o.alive) return; o.deny = true; o.prio = false; feed(`Traccia ${o.id}: non ingaggiare`, CLS[o.cls][0]); for (const it of G.items) if (it.busy && it.busy.tgt === o.id) it.busy = null; G.shots = G.shots.filter((s) => s.tgt !== o.id); }

// ============================================================ effettori automatici
const prioKey = (o) => (o.prio ? -1e5 : 0) + (o.mode === 'dive' ? -1e4 : 0) + (o.goal ? Math.hypot(o.x - o.goal.x, o.y - o.goal.y) : distAsset(o));
function autoEngage() {
  const eng = new Map(), add = (id) => eng.set(id, (eng.get(id) || 0) + 1);
  G.shots.forEach((s) => add(s.tgt)); G.items.forEach((it) => it.busy && add(it.busy.tgt));
  for (const it of G.items) {
    const c = CAT[it.kind]; if (c.g !== 'E' || !isOn(it) || it.cd > 0 || it.busy || (c.ammo && it.ammo <= 0)) continue;
    const area = it.kind === 'jam' || it.kind === 'hpm' || it.kind === 'spoof', rng = rangeOf(it), cand = [];
    for (const o of G.objs) {
      if (!visible(o) || o.state !== 'fly' || !engageable(o) || dist(it, o) > rng) continue;
      if (!area && (eng.get(o.id) || 0) >= o.hp) continue;
      const h = holdReason(it, o); if (h) { if (h !== 'nolink') G.ws.holds.add(h); continue; }
      cand.push(o);
    }
    if (!cand.length) continue;
    cand.sort((a, b) => prioKey(a) - prioKey(b));
    fire(it, cand[0]); if (!area) add(cand[0].id);
    if ((it.kind === 'hangar' || it.kind === 'netdrone') && it.lv >= 3) { const o2 = cand.find((o) => (eng.get(o.id) || 0) < o.hp); if (o2) { launch(it, o2, true); add(o2.id); } }
  }
}
function launch(it, o, extra) {
  if (extra) { it.uses++; it.cost += CAT[it.kind].use; G.ws.cost += CAT[it.kind].use; }
  G.shots.push({ k: it.kind === 'netdrone' ? 'nd' : it.kind === 'longint' ? 'li' : 'int', x: it.x, y: it.y, tgt: o.id, from: it, trail: [] }); SND.launch();
}
function fire(it, o) {
  const k = it.kind, c = CAT[k], rng = rangeOf(it); it.uses++; it.cost += c.use; G.ws.cost += c.use;
  if (k === 'jam') {
    it.cd = cdOf(it); G.fx.push({ k: 'jam', x: it.x, y: it.y, r: rng, t: 0, dur: 1.3 }); SND.jam();
    let n = 0, immune = 0;
    for (const t of G.objs) {
      if (!t.alive || t.state !== 'fly' || TYPES[t.type].manned || t.type === 'bird' || dist(it, t) > rng) continue;
      const T = TYPES[t.type]; if (t.type === 'auth' && it.lv >= 3) continue;
      if (T.radio && !T.jamProof) { t.state = 'jammed'; t.jt = 1.6; t.by_it = it; n++; } else immune++;
    }
    if (immune) { G.ws.notes.add('jamImmune'); feed('Disturbatore attivato', `${n ? n + ' a terra, ' : ''}${immune} senza radio o con link cifrato non ne risentono`, 'warn'); }
    else feed('Disturbatore attivato', n ? `${n} droni perdono il collegamento` : 'nessun effetto');
  } else if (k === 'hangar' || k === 'netdrone' || k === 'longint') { it.cd = cdOf(it); launch(it, o); }
  else if (k === 'takeover' || k === 'netblock') { it.busy = { tgt: o.id, t: 0, need: takeNeed(it) }; }
  else if (k === 'spoof') {
    it.cd = cdOf(it); G.fx.push({ k: 'spoof', x: it.x, y: it.y, r: rng, t: 0, dur: 1.2 }); SND.jam();
    let n = 0, immune = 0;
    for (const t of G.objs) {
      if (!t.alive || t.state !== 'fly' || TYPES[t.type].manned || t.type === 'bird' || dist(it, t) > rng) continue;
      const T = TYPES[t.type]; if (t.type === 'auth' && it.lv >= 3) continue;
      if (T.gnss) { t.state = 'spoofed'; t.jt = 2.2; t.by_it = it; n++; } else immune++;
    }
    if (immune) G.ws.notes.add('spoofImmune');
    feed('Spoofing GNSS', `${n} droni perdono la rotta${immune ? `, ${immune} pilotati o inerziali non ne risentono` : ''}`, n ? 'good' : 'warn');
  }
  else if (k === 'laser') { it.busy = { tgt: o.id, t: 0, need: laserNeed(it, o) }; }
  else if (k === 'hpm') {
    it.cd = cdOf(it); G.fx.push({ k: 'hpm', x: it.x, y: it.y, r: rng, t: 0, dur: 0.8 }); SND.hpm(); G.shake = Math.max(G.shake, 0.15);
    let n = 0, res = 0;
    for (const t of [...G.objs]) {
      if (!t.alive || t.type === 'bird' || TYPES[t.type].manned || dist(it, t) > rng) continue;
      const T = TYPES[t.type]; if (T.shield && it.lv < 3) { res++; continue; }
      damage(t, T.shield ? 2 : 99, 'hpm', it); n++;
    }
    if (res) G.ws.notes.add('shield');
    feed('Impulso a microonde', `${n} droni colpiti${res ? `, ${res} schermati resistono` : ''}`, n ? 'good' : res ? 'warn' : '');
  } else if (k === 'net') { it.cd = cdOf(it); it.ammo--; G.shots.push({ k: 'net', x: it.x, y: it.y, tgt: o.id, from: it, trail: [] }); SND.launch(); }
}
function effectors(dt) {
  for (const it of G.items) {
    if (it.cd > 0) it.cd -= dt;
    if ((it.kind === 'takeover' || it.kind === 'netblock') && it.busy) {
      const o = G.objs.find((x) => x.id === it.busy.tgt);
      if (!o || !o.alive || o.state !== 'fly' || !isOn(it) || dist(it, o) > rangeOf(it) || holdReason(it, o) || (o.deny && !o.prio)) { it.busy = null; it.cd = cdOf(it); continue; }
      it.busy.t += dt;
      if (it.busy.t >= it.busy.need) { o.state = 'jammed'; o.jt = 1.2; o.by_it = it; o.soft = it.kind; it.busy = null; it.cd = cdOf(it); feed(`${CAT[it.kind].name}: traccia ${o.id}`, 'atterraggio guidato'); }
    }
    if (it.kind === 'laser' && it.busy) {
      const o = G.objs.find((x) => x.id === it.busy.tgt);
      if (!o || !o.alive || !isOn(it) || dist(it, o) > rangeOf(it) || !visible(o) || holdReason(it, o) || (o.deny && !o.prio)) { it.busy = null; it.cd = cdOf(it); continue; }
      it.busy.need = laserNeed(it, o); it.busy.t += dt;
      if (vrnd() < 0.5) G.parts.push({ x: o.x, y: o.y, vx: (vrnd() - 0.5) * 60, vy: (vrnd() - 0.5) * 60, life: 0.3, col: '#FFD0A0', s: 1.5 });
      if (Math.floor(it.busy.t * 10) !== Math.floor((it.busy.t - dt) * 10)) SND.zap();
      if (it.busy.t >= it.busy.need) { damage(o, 1, 'laser', it); if (o.alive) it.busy.t = 0; else { it.busy = null; it.cd = cdOf(it); } }
    }
  }
  for (const s of G.shots) {
    const o = G.objs.find((x) => x.id === s.tgt);
    if (!o || !o.alive) { s.done = true; continue; }
    if (!engageable(o)) { s.done = true; if (o.cls === 'decoy') G.ws.notes.add('abort'); feed(s.k === 'net' ? 'Rete annullata' : 'Intercettore richiamato', `traccia ${o.id}: ${CLS[o.cls][0].toLowerCase()}`); continue; }
    const sp = s.k === 'int' ? 78 : s.k === 'nd' ? 66 : s.k === 'li' ? 140 : 95, d = dist(s, o);
    s.trail.push([s.x, s.y]); if (s.trail.length > 18) s.trail.shift();
    if (d < 14 && (s.k === 'int' || s.k === 'li') && holdReason(s.from, o)) { s.x = o.x; s.y = o.y; s.wait = true; continue; }
    s.wait = false;
    if (d < 14) {
      s.done = true;
      const pk = s.k === 'net' ? 0.9 : s.k === 'li' ? (hasPerk('guida') ? 0.97 : 0.92) : (hasPerk('guida') ? 0.95 : 0.85) * (o.type === 'wing' ? 0.65 : 1);
      if (rnd() < pk) { if ((s.k === 'net' || s.k === 'nd') && o.hp <= 2) neutralize(o, s.k === 'nd' ? 'netdrone' : 'net', s.from); else damage(o, s.k === 'li' ? 2 : 1, { int: 'hangar', nd: 'netdrone', li: 'longint', net: 'net' }[s.k], s.from); }
      else feed(s.k === 'int' ? 'Intercettore mancato' : s.k === 'nd' ? 'Drone cacciatore: rete a vuoto' : 'Rete mancata', `traccia ${o.id}`, 'warn');
    } else { s.x += (o.x - s.x) / d * sp * dt; s.y += (o.y - s.y) / d * sp * dt; if (s.k === 'net' && dist(s, s.from) > rangeOf(s.from) * 1.4) s.done = true; }
  }
  G.shots = G.shots.filter((s) => !s.done);
}
function burst(x, y, col, n, sp) { for (let i = 0; i < n; i++) { const a = vrnd() * TAU, v = sp * (0.3 + vrnd()); G.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.5 + vrnd() * 0.6, col, s: 1.2 + vrnd() * 2 }); } }
const HOW = { jam: 'disturbatore', hangar: 'intercettore', laser: 'laser', hpm: 'microonde', net: 'rete', pilot: 'pilota localizzato', takeover: 'presa di controllo', netblock: 'blocco di rete', longint: 'intercettore veloce', netdrone: 'drone cacciatore', spoof: 'spoofing GNSS' };
function damage(o, n, how, it) {
  if (!o.alive) return; o.hp -= n;
  if (o.hp <= 0) return neutralize(o, how, it);
  burst(o.x, o.y, '#FFB547', 8, 40);
  if (o.type !== 'mother' || o.hp % 3 === 0) feed(`${TYPES[o.type].name} colpito`, `${HOW[how]} · resiste ancora (${o.hp})`, 'warn');
}
function neutralize(o, how, it) {
  if (!o.alive) return; o.alive = false; o.state = 'falling'; o.fall = 0;
  it = it || o.by_it; const T = TYPES[o.type], crowd = ['laser', 'hangar', 'hpm', 'longint'].includes(how) && crowdAt(o);
  burst(o.x, o.y, T.hostile ? '#99FFCC' : '#FFB547', T.big ? 40 : 16, T.big ? 110 : 60);
  if (T.hostile) {
    G.ws.stopped++; bt(o.type).stopped++; G.score += T.pts; G.budget += T.bounty; G.ws.earned += T.bounty;
    if (o.seenAt >= 0) G.ws.react.push(G.t - o.seenAt); if (it) { it.kills++; it.wk = (it.wk || 0) + 1; }
    if (how === 'pilot') G.ws.notes.add('pilot');
    if (CAPT.includes(how)) G.ws.captured = (G.ws.captured || 0) + 1;
    recEvent(`${T.name}: ${HOW[how]}`, o.x, o.y, '#99FFCC', o.type === 'mother');
    SND.down(); feed(`${T.name} neutralizzato`, HOW[how], 'good'); if (o.type === 'mother') { G.shake = 0.6; SND.win(); }
  } else if (T.decoy) {
    G.ws.decoyKill++; if (how === 'hangar' || how === 'laser') G.ws.decoyWaste++;
    if (it) it.wk = (it.wk || 0) + 1;
    feed('Era un’esca', `${HOW[how]}: colpo speso su un bersaglio innocuo`, 'warn');
  } else if (o.type === 'civil' && SOFT.includes(how)) {
    G.ws.civSafe++; G.score += 20; G.ws.notes.add('civSafe'); if (it) it.wk = (it.wk || 0) + 1;
    feed('Drone civile fatto atterrare', `${HOW[how]}: intero, nessun danno`, 'good');
  } else {
    recEvent(`Falso allarme: ${T.name.toLowerCase()} (${HOW[how]})`, o.x, o.y, '#FFB547', true);
    G.ws.falseKill++; G.ws.log.push(`falso ${o.type} ${how} cls=${o.cls} prio=${!!o.prio} t${G.t.toFixed(0)} @${o.x.toFixed(0)},${o.y.toFixed(0)}`); if (it) it.fk++; SND.bad();
    if (o.type === 'auth') { G.score -= 250; G.ws.notes.add(o.ridOff ? 'ridKill' : 'authKill'); feed('Drone autorizzato neutralizzato', `${HOW[how]}: ${o.ridOff ? 'aveva solo perso il Remote ID' : 'era in servizio regolare'}`, 'bad'); }
    else if (o.type === 'civil') { G.score -= 150; G.ws.notes.add('civKill'); feed('Drone civile abbattuto', `${HOW[how]}: era un hobbista`, 'bad'); }
    else { G.score -= 150; G.ws.notes.add('birdKill'); feed('Era un uccello', `${HOW[how]}: falso allarme`, 'bad'); }
  }
  if (crowd) { G.ws.log.push(`detriti ${o.type} ${how} ${crowd.name}`); G.ws.debris++; G.score -= 100; G.ws.notes.add('debris'); feed('Detriti sulla folla', `${HOW[how]} sopra la ${crowd.name}`, 'bad'); }
  if (G.sel === o.id) G.sel = null;
  uiDirty = true;
}
