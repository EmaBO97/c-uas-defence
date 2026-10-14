// ============================================================ icone delle strutture
function glyph(c, kind, x, y, s, col) {
  c.save(); c.translate(x, y); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 1.6; c.lineCap = 'round';
  const k = s / 10;
  c.fillStyle = '#0A1118'; c.beginPath(); c.arc(0, 0, 10 * k, 0, TAU); c.fill(); c.strokeStyle = col; c.stroke(); c.fillStyle = col;
  if (kind === 'radar') { c.beginPath(); c.arc(0, 2 * k, 5 * k, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); c.beginPath(); c.moveTo(0, 2 * k); c.lineTo(3 * k, -4 * k); c.stroke(); }
  else if (kind === 'rf') { c.beginPath(); c.moveTo(0, 5 * k); c.lineTo(0, -3 * k); c.stroke(); c.beginPath(); c.arc(0, -3 * k, 3 * k, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); c.beginPath(); c.arc(0, -3 * k, 5.5 * k, Math.PI * 1.2, Math.PI * 1.8); c.stroke(); }
  else if (kind === 'camera') { c.beginPath(); c.ellipse(0, 0, 6 * k, 3.5 * k, 0, 0, TAU); c.stroke(); c.beginPath(); c.arc(0, 0, 1.8 * k, 0, TAU); c.fill(); }
  else if (kind === 'acu') { for (const r of [2, 4.5, 7]) { c.beginPath(); c.arc(-3 * k, 0, r * k, -0.7, 0.7); c.stroke(); } }
  else if (kind === 'jam') { c.beginPath(); c.moveTo(-6 * k, 0); for (let i = 0; i < 6; i++) c.lineTo((-6 + (i + 1) * 2) * k, (i % 2 ? 3 : -3) * k); c.stroke(); }
  else if (kind === 'hangar') { for (const [a, b] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) { c.beginPath(); c.arc(a * k, b * k, 1.8 * k, 0, TAU); c.stroke(); } c.beginPath(); c.moveTo(-3 * k, -3 * k); c.lineTo(3 * k, 3 * k); c.moveTo(3 * k, -3 * k); c.lineTo(-3 * k, 3 * k); c.stroke(); }
  else if (kind === 'laser') { c.beginPath(); c.moveTo(0, -6 * k); c.lineTo(4 * k, 0); c.lineTo(0, 6 * k); c.lineTo(-4 * k, 0); c.closePath(); c.stroke(); c.beginPath(); c.arc(0, 0, 1.5 * k, 0, TAU); c.fill(); }
  else if (kind === 'hpm') { c.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; c.lineTo(Math.cos(a) * 5.5 * k, Math.sin(a) * 5.5 * k); } c.closePath(); c.stroke(); c.beginPath(); c.arc(0, 0, 2 * k, 0, TAU); c.fill(); }
  else if (kind === 'vedetta') { c.beginPath(); c.arc(-2.5 * k, 0, 2.4 * k, 0, TAU); c.arc(2.5 * k, 0, 2.4 * k, 0, TAU); c.stroke(); }
  else if (kind === 'scout') { c.beginPath(); c.moveTo(-5 * k, -2 * k); c.lineTo(5 * k, -2 * k); c.stroke(); c.beginPath(); c.arc(0, 1.5 * k, 2.5 * k, 0, TAU); c.stroke(); c.beginPath(); c.arc(-5 * k, -2 * k, 1.5 * k, 0, TAU); c.arc(5 * k, -2 * k, 1.5 * k, 0, TAU); c.fill(); }
  else if (kind === 'irst') { c.beginPath(); c.arc(0, 2 * k, 5 * k, Math.PI, TAU); c.closePath(); c.stroke(); for (const a of [-2.3, -1.57, -0.8]) { c.beginPath(); c.moveTo(Math.cos(a) * 6 * k, 2 * k + Math.sin(a) * 6 * k); c.lineTo(Math.cos(a) * 8 * k, 2 * k + Math.sin(a) * 8 * k); c.stroke(); } }
  else if (kind === 'lowradar') { c.strokeRect(-5 * k, -4 * k, 4 * k, 8 * k); c.beginPath(); c.moveTo(0, 0); c.lineTo(6 * k, -2 * k); c.moveTo(0, 0); c.lineTo(6 * k, 2 * k); c.stroke(); }
  else if (kind === 'pradar') { c.setLineDash([1.5, 1.5]); c.beginPath(); c.arc(0, 2 * k, 5 * k, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); c.setLineDash([]); c.beginPath(); c.arc(0, 2 * k, 1.5 * k, 0, TAU); c.fill(); }
  else if (kind === 'cell') { c.font = `700 ${6.5 * k}px ${DISP}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('4G', 0, 0.5 * k); }
  else if (kind === 'takeover') { c.beginPath(); c.moveTo(-5 * k, -3 * k); c.lineTo(5 * k, -3 * k); c.moveTo(0, -3 * k); c.lineTo(0, 4 * k); c.moveTo(-3 * k, 1.5 * k); c.lineTo(0, 4.5 * k); c.lineTo(3 * k, 1.5 * k); c.stroke(); }
  else if (kind === 'netdrone') { c.beginPath(); c.moveTo(-5 * k, -4 * k); c.lineTo(5 * k, -4 * k); c.stroke(); for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(i * 3 * k, -1 * k); c.lineTo(i * 3 * k, 5 * k); c.moveTo(-4 * k, 2 * k + i); c.lineTo(4 * k, 2 * k + i); c.stroke(); } }
  else if (kind === 'longint') { c.beginPath(); c.moveTo(6 * k, 0); c.lineTo(-4 * k, -4 * k); c.lineTo(-2 * k, 0); c.lineTo(-4 * k, 4 * k); c.closePath(); c.fill(); }
  else if (kind === 'spoof') { c.strokeRect(-2 * k, -5 * k, 4 * k, 3 * k); c.beginPath(); c.moveTo(-5 * k, -3.5 * k); c.lineTo(5 * k, -3.5 * k); c.stroke(); c.setLineDash([1.5, 1.5]); c.beginPath(); c.moveTo(0, -1 * k); c.quadraticCurveTo(4 * k, 2 * k, 0, 5 * k); c.stroke(); c.setLineDash([]); }
  else if (kind === 'netblock') { c.beginPath(); c.moveTo(-3 * k, 5 * k); c.lineTo(0, -5 * k); c.lineTo(3 * k, 5 * k); c.stroke(); c.beginPath(); c.moveTo(2 * k, -3 * k); c.lineTo(6 * k, 1 * k); c.moveTo(6 * k, -3 * k); c.lineTo(2 * k, 1 * k); c.stroke(); }
  else if (kind === 'net') { for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(i * 3 * k, -5 * k); c.lineTo(i * 3 * k, 5 * k); c.moveTo(-5 * k, i * 3 * k); c.lineTo(5 * k, i * 3 * k); c.stroke(); } }
  c.restore();
}
function glyphCanvas(kind) { const cvs = document.createElement('canvas'); cvs.width = cvs.height = 44; const c = cvs.getContext('2d'); c.scale(2, 2); glyph(c, kind, 11, 11, 10, CAT[kind].col); cvs.style.width = cvs.style.height = '22px'; return cvs; }

// ============================================================ pannelli
let uiDirty = true;
const shopBtns = {};
function initShop() {
  for (const [grp, el] of [['S', $('shopS')], ['E', $('shopE')]]) for (const k in CAT) {
    const c = CAT[k]; if (c.g !== grp) continue;
    const b = document.createElement('button'); b.type = 'button';
    const top = document.createElement('div'); top.className = 'top'; top.append(glyphCanvas(k));
    const nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = c.name; top.append(nm);
    const meta = document.createElement('span'); meta.className = 'meta'; meta.textContent = c.meta;
    const cost = document.createElement('span'); cost.className = 'cost'; cost.textContent = c.cost;
    const lock = document.createElement('span'); lock.className = 'lock'; lock.textContent = c.unlock ? `si sblocca con: ${SITES[c.unlock].short}` : '';
    b.append(top, meta, cost, lock);
    const show = () => ($('shopDesc').innerHTML = c.desc + `<br><span style="color:var(--violet)">Livello 3: ${c.s3}</span>`);
    b.addEventListener('mouseenter', show); b.addEventListener('focus', show);
    b.addEventListener('click', () => { if (c.cost <= G.budget && available(k)) { G.tool = G.tool === k ? null : k; G.selItem = null; show(); uiDirty = true; hint(); } });
    el.append(b); shopBtns[k] = b;
  }
}
function renderShop() {
  for (const k in shopBtns) { const b = shopBtns[k], av = available(k); b.setAttribute('aria-pressed', String(G.tool === k)); b.disabled = !av || CAT[k].cost > G.budget || (G.phase !== 'setup' && G.phase !== 'wave'); b.querySelector('.lock').hidden = av; b.querySelector('.meta').hidden = !av; }
  $('bLeft').textContent = G.budget; if (G.phase === 'setup' && G.curWave) $('btnIntel').disabled = G.budget < intelCost();
}
function renderIntel() {
  const w = WV(), wx = WX(), full = G.intelBought, I = w.intel;
  $('intelTitle').textContent = G.mode === 'endless' ? `Pattuglia · ondata ${G.wave + 1}` : `Ondata ${G.wave + 1} di ${S().waves.length}: ${w.name}`;
  $('intelText').innerHTML = full ? w.brief : `<b>Intelligence parziale.</b> Stima: tra ${I.lo} e ${I.hi} droni ostili. Direzioni segnalate: ${I.sectors.join(', ') || 'non note'}. Alcune minacce potrebbero mancare o essere sbagliate.`;
  const th = $('intelThreats'); th.replaceChildren();
  const chip = (t, cls) => { const s = document.createElement('span'); if (cls) s.className = cls; s.textContent = t; th.append(s); };
  if (full) { for (const [t, ok] of w.threats) chip(t, ok ? 'ok' : ''); }
  else { for (const [t] of I.chips) chip(t); chip('altre minacce non confermate', 'ev'); }
  chip(`${wx.name}${w.wx !== 'sereno' ? ': ' + wx.desc : ''}`, 'wx');
  if (full) for (const [k] of w.ev || []) chip({ guasto: 'possibile guasto', ridoff: 'evento: Remote ID', stormo: 'stormo in arrivo', blackout: 'rischio blackout', heli: 'elisoccorso in zona' }[k], 'ev');
  const ad = $('intelAdapt'); ad.hidden = !w.adaptNote; ad.textContent = w.adaptNote ? 'Il nemico si adatta. ' + w.adaptNote : '';
  const ob = $('intelObj'); ob.hidden = !w.obj; ob.textContent = objText(w.obj);
  const bi = $('btnIntel'); bi.hidden = full; bi.textContent = `Ricognizione avanzata · ${intelCost()} crediti`; bi.disabled = G.budget < intelCost();
  const r = $('intelRule'); r.hidden = G.wave > 0 && G.site === 0; r.textContent = S().rule;
}
function hint(t) {
  $('hint').textContent = t || (G.phase === 'setup' ? (G.tool ? `Clicca sulla mappa per piazzare: ${CAT[G.tool].name}. Esc per annullare.` : 'Scegli una struttura a destra e piazzala sulla mappa (Maiusc per piazzarne più di una). Clicca una struttura per potenziarla.')
    : G.phase === 'wave' ? (G.tool ? `Costruzione durante l’ondata: clicca sulla mappa per piazzare ${CAT[G.tool].name}.` : 'La difesa è automatica. Clicca una traccia per i dettagli, una struttura per potenziarla.') : '');
}
function renderItem() {
  const it = G.selItem, card = $('cardItem');
  if (!it || !G.items.includes(it) || (G.phase !== 'setup' && G.phase !== 'wave')) { card.hidden = true; return; }
  card.hidden = false; const c = CAT[it.kind], uc = upCost(it);
  $('itemTitle').innerHTML = ''; $('itemTitle').append(glyphCanvas(it.kind), document.createTextNode(c.name));
  const state = it.dmg ? '<b style="color:var(--coral)">Distrutto</b>' : it.fault ? '<b style="color:var(--amber)">Guasto</b>' : it.off ? '<b style="color:var(--muted)">Emissioni spente</b>' : '<b style="color:var(--mint)">In linea</b>';
  const extra = c.g === 'E' ? `<div>Ricarica<b>${c.cd ? fmt(cdOf(it), 1) + ' s' : '—'}</b></div>` : `<div>Distanza dal sito<b>${fmt(Math.hypot(it.x, it.y))} m</b></div>`;
  $('itemBody').innerHTML = `<div class="lv">${[1, 2, 3].map((l) => `<i class="${l <= it.lv ? 'on' : ''}"></i>`).join('')}</div>
    <div class="kv"><div>Livello<b>${it.lv} di 3</b></div><div>Portata<b>${fmt(rangeOf(it))} m</b></div>${extra}<div>Stato${state}</div></div>
    <p class="note">${it.lv < 3 ? `Livello ${it.lv + 1}: portata +12%${c.g === 'E' && c.cd ? ', ricarica −15%' : ''}.${it.lv === 2 ? ` <b style="color:var(--violet)">${c.s3}</b>` : ` Al livello 3: ${c.s3}`}` : `<b style="color:var(--violet)">${c.s3}</b>`}${it.kills ? ` Ha neutralizzato ${it.kills} droni.` : ''}</p>`;
  const up = $('btnUp'); up.hidden = it.lv >= 3; up.disabled = uc > G.budget; up.textContent = `Potenzia · ${uc}`;
  const em = $('btnEmit'); em.hidden = !c.emit || G.phase !== 'wave'; em.textContent = it.off ? 'Riaccendi' : 'Spegni emissioni';
  const sl = $('btnSell'); sl.hidden = G.phase !== 'setup'; sl.textContent = `Rivendi · +${it.spent}`;
}
function renderTrack() {
  const body = $('trackBody'), o = G.objs.find((x) => x.id === G.sel), act = $('trackAct');
  if (!o || !visible(o)) { act.hidden = true; body.innerHTML = '<p class="note">Clicca una traccia sulla mappa: vedrai quali sensori la seguono, come è classificata e quali effettori la possono raggiungere. Puoi ordinare di ingaggiarla o di risparmiarla.</p>'; return; }
  act.hidden = !!TYPES[o.type].manned;
  const [lab, col] = CLS[o.cls], d = Math.hypot(o.x, o.y), v = Math.hypot(o.vx, o.vy), by = o.by || new Set();
  const ga = o.goal || nearestAsset(o), dg = Math.hypot(o.x - ga.x, o.y - ga.y), eta = ['bird', 'auth', 'plane', 'heli', 'decoy', 'civ'].includes(o.cls) ? '—' : fmt(Math.max(0, (dg - ga.r) / Math.max(1, v))) + ' s';
  const tags = [inForest(o) ? 'sopra il bosco' : '', inWater(o.x, o.y) ? 'sopra il mare' : '', inCorridor(o) ? 'nel corridoio' : '', o.raid && o.rtg && o.camId ? `punta: ${CAT[o.rtg.kind].name}` : '', crowdAt(o) ? 'sopra la folla' : '', o.prio ? 'ingaggio ordinato' : '', o.deny ? 'da non ingaggiare' : '', o.hp > 1 && o.cls === 'hostile' ? `${o.hp} punti vita` : ''].filter(Boolean).join(' · ');
  const why = o.type === 'heli' ? 'Elisoccorso in volo: finché è nell’area, disturbatore, spoofing e microonde non sparano.' : o.type === 'plane' ? 'Aereo con transponder: il sistema lo conosce e non lo ingaggia mai.'
    : o.prio ? 'Hai ordinato l’ingaggio: gli effettori in portata la colpiscono, qualunque sia la classe.'
    : o.deny ? 'Hai ordinato di non ingaggiarla. Puoi cambiare idea con E.'
    : o.cls === 'unk' ? (G.roe === 'aggressive' ? 'Sconosciuta: con regole aggressive il sistema la ingaggia.' : 'Solo il radar la vede: senza classificazione il sistema non la ingaggia da solo. Guarda la velocità: un uccello va piano.')
    : o.cls === 'drone' ? (G.roe === 'rigorose' ? 'Drone di intenzione ignota: con regole rigorose serve la tua autorizzazione.' : 'Drone di intenzione ignota: il sistema lo ingaggia. Se fosse un drone amico, ordina “Non ingaggiare”.')
    : o.cls === 'auth' ? 'Remote ID valido: il sistema non la ingaggia, ma gli effettori ad area possono colpirla.'
    : o.cls === 'bird' ? 'Uccello: il sistema lo ignora.' : o.cls === 'decoy' ? 'Esca riconosciuta dalla camera: il sistema non spreca colpi.' : 'Bersaglio valido: gli effettori in portata la ingaggiano da soli.';
  body.innerHTML = `<div class="head"><span class="badge" style="background:${col}">${lab}</span><span class="note">traccia ${o.id}${tags ? ' · ' + tags : ''}</span></div>
    <div class="kv"><div>Distanza${G.assets.length > 1 ? ' da ' + nearestAsset(o).label : ''}<b>${fmt(distAsset(o))} m</b></div><div>Velocità<b>${fmt(v)} m/s</b></div><div>Arrivo stimato<b>${eta}</b></div><div>Radio<b>${o.type === 'plane' ? 'transponder' : by.has('rf') ? 'sì' : by.has('camera') || by.has('acu') ? 'no' : '?'}</b></div></div>
    <div class="chips">${SENS.map((k) => `<span class="${by.has(k) ? 'on' : ''}">${CAT[k].name}</span>`).join('')}</div>
    <div class="reach">${EFF.map((k) => { const its = G.items.filter((it) => it.kind === k && isOn(it)); if (!its.length) return '';
      const near = its.filter((it) => dist(it, o) <= rangeOf(it)), hold = near.map((it) => holdReason(it, o)).find(Boolean), ready = near.filter((it) => it.cd <= 0 && !it.busy && (!CAT[k].ammo || it.ammo > 0));
      return `<div class="${hold ? 'hold' : near.length ? 'on' : ''}"><b>${CAT[k].name}</b><span>${!near.length ? 'fuori portata' : hold ? ({ aereo: 'fermo: aereo vicino', corridoio: 'fermo: corridoio di volo', folla: 'fermo: sopra la folla', protetto: 'fermo: traccia protetta', nolink: 'non agisce su questo drone' })[hold] : ready.length ? 'in portata' : 'in ricarica'}</span></div>`; }).join('')}</div>
    <p class="note">${why}</p>`;
  $('btnPrio').disabled = !!o.prio; $('btnDeny').disabled = !!o.deny;
}
let reqSig = '';
function renderReq() {
  const list = G.phase === 'wave' ? G.objs.filter(needsAuth).sort((a, b) => distAsset(a) - distAsset(b)).slice(0, 4) : [];
  $('cardReq').hidden = !list.length;
  const el = $('reqList'), sig = list.map((o) => o.id).join(',');
  if (sig !== reqSig) {
    reqSig = sig; el.replaceChildren();
    for (const o of list) {
      const r = document.createElement('div'); r.className = 'r'; r.dataset.id = o.id;
      r.innerHTML = `<div class="t"><b></b><span></span></div><button class="btn small" data-a="e">Ingaggia</button><button class="btn ghost small" data-a="n">Ignora</button>`;
      el.append(r);
    }
  }
  for (const r of el.children) { const o = G.objs.find((x) => x.id === +r.dataset.id); if (!o) continue;
    r.querySelector('b').textContent = `Traccia ${o.id} · ${CLS[o.cls][0]}`; r.querySelector('span').textContent = `${fmt(distAsset(o))} m · ${fmt(Math.hypot(o.vx, o.vy))} m/s`; }
}
function renderAbil() {
  const el = $('abil');
  if (!el.children.length) for (const a of ABIL) {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.k = a.k; b.title = a.desc;
    b.innerHTML = `<b>${a.name}</b><span></span><kbd>${a.key}</kbd><i></i>`; b.addEventListener('click', () => useAbility(a.k)); el.append(b);
  }
  for (const b of el.children) { const a = G.ab[b.dataset.k], def = ABIL.find((x) => x.k === b.dataset.k); if (!a) continue;
    const full = def.cd * (hasPerk('addestr') ? 0.65 : 1);
    b.classList.toggle('on', a.on > 0); b.classList.toggle('cd', a.cd > 0 && !(a.on > 0));
    b.querySelector('span').textContent = a.on > 0 ? `attiva ${fmt(a.on)} s` : a.cd > 0 ? `pronta tra ${fmt(a.cd)} s` : 'pronta';
    b.querySelector('i').style.width = (a.cd > 0 ? (1 - a.cd / full) * 100 : 100) + '%'; }
}
function renderTally() {
  const el = $('tally'); el.replaceChildren();
  for (const k of EFF) { const its = G.items.filter((it) => it.kind === k); if (!its.length) continue;
    const row = document.createElement('div'); const i = document.createElement('i'); i.style.background = CAT[k].col;
    const n = document.createElement('span'); n.textContent = CAT[k].name + (its.length > 1 ? ' ×' + its.length : '');
    const b = document.createElement('b'); b.textContent = its.reduce((s, x) => s + (x.wk || 0), 0); row.append(i, n, b); el.append(row); }
  if (G.ws && G.ws.earned) { const row = document.createElement('div'); row.innerHTML = `<i style="background:var(--mint)"></i><span>Crediti guadagnati</span><b>+${G.ws.earned}</b>`; el.append(row); }
}
function feed(a, b, cls) {
  const d = document.createElement('div'); if (cls) d.className = cls;
  const t = document.createElement('b'); t.textContent = a; d.append(t); if (b) d.append(document.createTextNode(' · ' + b));
  const f = $('feed'); f.prepend(d); while (f.children.length > 5) f.lastChild.remove();
  setTimeout(() => d.remove(), 6000);
}
function status() {
  const ph = G.phase;
  $('sPhase').textContent = { intro: 'Menu', site: 'Briefing', setup: 'Setup', wave: G.paused ? 'In pausa' : 'Attacco', debrief: 'Debriefing', siteEnd: 'Bilancio', perk: 'Dottrina', final: 'Fine' }[ph] || '—';
  const inSite = ph !== 'intro' && ph !== 'final';
  $('sSite').textContent = inSite ? `${G.site + 1}. ${S().short}` : '—';
  $('sWave').textContent = inSite ? (G.mode === 'endless' ? `${G.wave + 1} · pattuglia` : `${G.wave + 1} di ${S().waves.length}`) : '—';
  $('sWx').textContent = inSite ? WX().name : '—';
  const ig = $('integ'); ig.replaceChildren();
  G.assets.forEach((a, k) => { if (k) { const sp = document.createElement('b'); sp.className = 'sep'; ig.append(sp); } for (let i = 0; i < a.max; i++) { const x = document.createElement('i'); if (i >= a.hp) x.className = 'off'; if (a.hp <= Math.ceil(a.max / 2) && i < a.hp) x.className = 'red'; x.title = a.label; ig.append(x); } });
  ig.classList.toggle('multi', G.assets.length > 1);
  $('sScore').textContent = G.score; $('sCred').textContent = G.budget;
  if (ph === 'wave') { const done = G.ws.stopped + G.ws.hits + G.ws.structLost + G.ws.spyEsc; $('progBar').style.width = Math.min(100, (done / Math.max(1, G.totalHostile)) * 100) + '%'; $('progTxt').textContent = `${done}/${G.totalHostile} minacce risolte · ${fmt(G.t)} s${G.ws.obj ? (G.ws.obj.k === 'capture' ? ` · catturati ${G.ws.captured || 0}/${G.ws.obj.n}` : ` · ${G.ws.obj.label.toLowerCase()}: ${(G.assets.find((a) => a.temp) || {}).arrived ? 'arrivato' : 'in viaggio'}`) : ''}`; }
}
function syncRoe() { document.querySelectorAll('#roe button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.roe === G.roe))); }
function setRoe(r) { G.roe = r; syncRoe(); if (G.phase === 'wave') feed('Regole di ingaggio', { rigorose: 'rigorose', prudenti: 'prudenti', aggressive: 'aggressive' }[r]); uiDirty = true; }
function showDlg(h) { $('dlg').innerHTML = h; $('overlay').hidden = false; $('dlg').scrollTop = 0; }
function hideDlg() { $('overlay').hidden = true; }
function legend() {
  const el = $('legend');
  for (const k of ['unk', 'hostile', 'drone', 'bird', 'auth', 'civ', 'decoy']) { const s = document.createElement('span'); const c = document.createElement('canvas'); c.width = c.height = 28; c.style.width = c.style.height = '14px'; const x = c.getContext('2d'); x.scale(2, 2); drawTrackIcon(x, 7, 7, 0, k, CLS[k][1], 0.8); s.append(c, document.createTextNode(CLS[k][0])); el.append(s); }
  const s = document.createElement('span'); s.innerHTML = '<i style="display:inline-block;width:14px;height:10px;border-radius:5px;background:rgba(40,80,60,.9)"></i>Bosco: nasconde i droni bassi'; el.append(s);
  const s2 = document.createElement('span'); s2.innerHTML = '<i style="display:inline-block;width:14px;height:10px;border-radius:5px;border:1.5px solid #FFB547"></i>Richiesta di ingaggio'; el.append(s2);
}

// ============================================================ disegno
function drawTrackIcon(c, x, y, a, cls, col, k = 1) {
  c.save(); c.translate(x, y); c.fillStyle = col; c.strokeStyle = col;
  if (cls === 'unk') { c.beginPath(); c.moveTo(0, -6 * k); c.lineTo(6 * k, 0); c.lineTo(0, 6 * k); c.lineTo(-6 * k, 0); c.closePath(); c.lineWidth = 1.6; c.stroke(); }
  else if (cls === 'bird') { c.rotate(a); c.lineWidth = 1.8; c.beginPath(); c.moveTo(-6 * k, -4 * k); c.quadraticCurveTo(-2 * k, 0, 0, 0); c.quadraticCurveTo(-2 * k, 0, -6 * k, 4 * k); c.stroke(); c.beginPath(); c.arc(1.5 * k, 0, 1.6 * k, 0, TAU); c.fill(); }
  else if (cls === 'decoy') { c.rotate(a + Math.PI / 4); c.lineWidth = 1.2; c.setLineDash([2, 2]); c.beginPath(); c.moveTo(-4.5 * k, -4.5 * k); c.lineTo(4.5 * k, 4.5 * k); c.moveTo(4.5 * k, -4.5 * k); c.lineTo(-4.5 * k, 4.5 * k); c.stroke(); for (const [p, q] of [[-4.5, -4.5], [4.5, 4.5], [4.5, -4.5], [-4.5, 4.5]]) { c.beginPath(); c.arc(p * k, q * k, 2.1 * k, 0, TAU); c.stroke(); } c.setLineDash([]); }
  else { c.rotate(a + Math.PI / 4); c.lineWidth = 1.4; c.beginPath(); c.moveTo(-4.5 * k, -4.5 * k); c.lineTo(4.5 * k, 4.5 * k); c.moveTo(4.5 * k, -4.5 * k); c.lineTo(-4.5 * k, 4.5 * k); c.stroke(); for (const [p, q] of [[-4.5, -4.5], [4.5, 4.5], [4.5, -4.5], [-4.5, 4.5]]) { c.beginPath(); c.arc(p * k, q * k, 2.3 * k, 0, TAU); c.stroke(); } c.beginPath(); c.arc(0, 0, 1.8 * k, 0, TAU); c.fill(); }
  c.restore();
}
function drawPlane(px, py, a, time) {
  ctx.save(); ctx.translate(px, py); ctx.rotate(a); ctx.fillStyle = 'rgba(230,237,242,0.9)';
  ctx.beginPath(); ctx.ellipse(0, 0, 13, 2.6, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(2, 0); ctx.lineTo(-4, -13); ctx.lineTo(-7, -13); ctx.lineTo(-4, 0); ctx.lineTo(-7, 13); ctx.lineTo(-4, 13); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-13, -5); ctx.lineTo(-14, -5); ctx.lineTo(-13, 0); ctx.lineTo(-14, 5); ctx.lineTo(-13, 5); ctx.closePath(); ctx.fill();
  if (Math.sin(time * 8) > 0) { ctx.fillStyle = '#FF6B5E'; ctx.beginPath(); ctx.arc(-5.5, -13, 1.6, 0, TAU); ctx.fill(); ctx.fillStyle = '#99FFCC'; ctx.beginPath(); ctx.arc(-5.5, 13, 1.6, 0, TAU); ctx.fill(); }
  ctx.restore();
}
const RAIN = Array.from({ length: 140 }, () => ({ x: Math.random(), y: Math.random(), s: 0.6 + Math.random() * 0.8 }));
const FOG = Array.from({ length: 9 }, (_, i) => ({ x: Math.random(), y: Math.random(), r: 0.18 + Math.random() * 0.2, v: 0.004 + Math.random() * 0.008, i }));
function weatherUnder() {
  const w = G.phase === 'intro' ? 'sereno' : WV().wx;
  if (w === 'notte') { ctx.fillStyle = 'rgba(2,4,14,0.32)'; ctx.fillRect(0, 0, W, H); }
}
function weatherOver(time) {
  const w = G.phase === 'intro' ? 'sereno' : WV().wx;
  if (w === 'nebbia') for (const f of FOG) { const x = ((f.x + time * f.v) % 1.4 - 0.2) * W, y = f.y * H, r = f.r * Math.max(W, H); const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(200,215,225,0.13)'); g.addColorStop(1, 'rgba(200,215,225,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
  if (w === 'pioggia') { ctx.strokeStyle = 'rgba(160,200,230,0.22)'; ctx.lineWidth = 1; ctx.beginPath(); for (const d of RAIN) { const x = ((d.x + time * 0.05 * d.s) % 1) * W, y = ((d.y + time * 0.9 * d.s) % 1) * H; ctx.moveTo(x, y); ctx.lineTo(x - 3, y + 12 * d.s); } ctx.stroke(); }
  if (w === 'vento') { ctx.strokeStyle = 'rgba(200,220,230,0.12)'; ctx.lineWidth = 1; ctx.beginPath(); for (const d of RAIN.slice(0, 40)) { const x = ((d.x + time * 0.35 * d.s) % 1.2 - 0.1) * W, y = d.y * H + Math.sin(time * 2 + d.x * 10) * 6; ctx.moveTo(x, y); ctx.lineTo(x - 40 * d.s, y + 2); } ctx.stroke(); }
}
let hoverItem = null, mouse = null, drag = null;
function draw(time) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  let sx = 0, sy = 0; if (G.shake > 0) { sx = (vrnd() - 0.5) * 10 * G.shake; sy = (vrnd() - 0.5) * 10 * G.shake; }
  ctx.save(); ctx.translate(sx, sy);
  if (terrain) ctx.drawImage(terrain, 0, 0, W, H);
  weatherUnder();
  const live = G.phase === 'wave' || G.phase === 'setup' || G.phase === 'debrief';
  if (G.phase === 'setup' || (G.phase === 'wave' && G.tool)) { ctx.strokeStyle = 'rgba(0,208,180,0.4)'; ctx.setLineDash([6, 6]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(X(0), Y(0), S().place * sc, 0, TAU); ctx.stroke(); for (const a of S().extra || []) { ctx.beginPath(); ctx.arc(X(a.x), Y(a.y), 320 * sc, 0, TAU); ctx.stroke(); } ctx.setLineDash([]); }
  // coperture
  if (live) for (const it of G.items) {
    if (drag && drag.moved && drag.it === it) continue;
    const c = CAT[it.kind], r = rangeOf(it) * sc, show = G.phase === 'setup' || it === hoverItem || it === G.selItem || c.g === 'E', on = isOn(it);
    if (c.g === 'S' && on) { const g = ctx.createRadialGradient(X(it.x), Y(it.y), r * 0.2, X(it.x), Y(it.y), r); g.addColorStop(0, c.col + '00'); g.addColorStop(1, c.col + (show ? '18' : '0C')); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(X(it.x), Y(it.y), r, 0, TAU); ctx.fill(); }
    ctx.strokeStyle = on ? c.col + (it === hoverItem || it === G.selItem ? 'AA' : c.g === 'S' ? '30' : '45') : 'rgba(255,107,94,0.25)'; ctx.lineWidth = it === hoverItem || it === G.selItem ? 1.6 : 1; if (c.g === 'E' || !on) ctx.setLineDash([3, 5]);
    ctx.beginPath(); ctx.arc(X(it.x), Y(it.y), r, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  }
  // fascio radar
  if (live) for (const it of G.items) if (it.kind === 'radar' && isOn(it)) {
    const a = G.phase === 'wave' ? it.ang : ((time / SWEEP) * TAU + it.ang) % TAU, r = rangeOf(it) * sc;
    for (let i = 0; i < 18; i++) { ctx.fillStyle = `rgba(61,184,245,${0.11 * (1 - i / 18)})`; ctx.beginPath(); ctx.moveTo(X(it.x), Y(it.y)); ctx.arc(X(it.x), Y(it.y), r, a - (i + 1) * 0.035, a - i * 0.035); ctx.closePath(); ctx.fill(); }
    ctx.strokeStyle = 'rgba(153,220,255,0.55)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X(it.x), Y(it.y)); ctx.lineTo(X(it.x) + Math.cos(a) * r, Y(it.y) + Math.sin(a) * r); ctx.stroke();
  }
  drawAsset(time); if (G.phase !== 'intro') drawExtra(time);
  // effetti ad area
  for (const f of G.fx) {
    const k = f.t / f.dur;
    if (f.k === 'jam') { for (let j = 0; j < 3; j++) { const kk = (k + j / 3) % 1; ctx.strokeStyle = `rgba(153,255,204,${0.5 * (1 - kk)})`; ctx.lineWidth = 2; ctx.beginPath(); for (let a = 0; a <= TAU + 0.01; a += 0.08) { const rr = f.r * sc * kk * (1 + 0.03 * Math.sin(a * 14 + f.t * 20)); const px = X(f.x) + Math.cos(a) * rr, py = Y(f.y) + Math.sin(a) * rr; a ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); } }
    if (f.k === 'spoof') { for (let j = 0; j < 2; j++) { const kk = (k + j / 2) % 1; ctx.strokeStyle = `rgba(255,211,107,${0.55 * (1 - kk)})`; ctx.lineWidth = 1.6; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.arc(X(f.x), Y(f.y), f.r * sc * kk, 0, TAU); ctx.stroke(); ctx.setLineDash([]); } }
    if (f.k === 'hpm') { const rr = f.r * sc * Math.min(1, k * 1.6); const g = ctx.createRadialGradient(X(f.x), Y(f.y), rr * 0.6, X(f.x), Y(f.y), rr); g.addColorStop(0, 'rgba(180,140,255,0)'); g.addColorStop(1, `rgba(180,140,255,${0.55 * (1 - k)})`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(X(f.x), Y(f.y), rr, 0, TAU); ctx.fill(); }
  }
  // strutture
  if (live) for (const it of G.items) {
    const moving = drag && drag.moved && drag.it === it, c = CAT[it.kind], px = moving && mouse ? X(mouse.x) : X(it.x), py = moving && mouse ? Y(mouse.y) : Y(it.y), on = isOn(it);
    ctx.globalAlpha = on ? 1 : 0.55; glyph(ctx, it.kind, px, py, it === hoverItem || it === G.selItem ? 12 : 10, it.dmg ? '#FF6B5E' : it.fault ? '#FFB547' : c.col); ctx.globalAlpha = 1;
    if (it.lv > 1) for (let l = 1; l < it.lv; l++) { ctx.fillStyle = '#B48CFF'; ctx.beginPath(); ctx.arc(px - 4 + (l - 1) * 8, py + 15, 2.4, 0, TAU); ctx.fill(); }
    if (it === G.selItem) { ctx.strokeStyle = '#E6EDF2'; ctx.lineWidth = 1.4; for (let i = 0; i < 4; i++) { const aa = i * Math.PI / 2 + time; ctx.beginPath(); ctx.arc(px, py, 16, aa, aa + 0.9); ctx.stroke(); } }
    if (it.dmg) { ctx.strokeStyle = '#FF6B5E'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px - 9, py - 9); ctx.lineTo(px + 9, py + 9); ctx.moveTo(px + 9, py - 9); ctx.lineTo(px - 9, py + 9); ctx.stroke(); }
    else if (it.fault && Math.sin(time * 8) > 0) { ctx.fillStyle = '#FFB547'; ctx.font = '700 12px ' + DISP; ctx.textAlign = 'center'; ctx.fillText('!', px + 12, py - 8); ctx.textAlign = 'left'; }
    else if (it.off) { ctx.fillStyle = '#8A9AA6'; ctx.font = '600 9px ' + MONO; ctx.textAlign = 'center'; ctx.fillText('OFF', px, py - 14); ctx.textAlign = 'left'; }
    if (G.phase === 'wave' && on && (it.cd > 0 || it.busy) && c.g === 'E') { ctx.strokeStyle = '#FFB547'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, py, 14, -Math.PI / 2, -Math.PI / 2 + TAU * (it.busy ? Math.min(1, it.busy.t / (it.busy.need || 1.5)) : 1 - it.cd / cdOf(it))); ctx.stroke(); }
    if (G.phase === 'wave' && it.wk) { ctx.fillStyle = '#071015'; ctx.beginPath(); ctx.arc(px + 11, py - 11, 7, 0, TAU); ctx.fill(); ctx.fillStyle = '#99FFCC'; ctx.font = '600 10px ' + MONO; ctx.textAlign = 'center'; ctx.fillText(String(it.wk), px + 11, py - 7.5); ctx.textAlign = 'left'; }
    if (it.kind === 'scout' && it.uav && G.phase === 'wave') for (const u of it.uav) {
      const ux = X(u.x), uy = Y(u.y), t = G.objs.find((o) => o.id === u.tgt);
      ctx.strokeStyle = 'rgba(185,242,124,0.35)'; ctx.setLineDash([2, 4]); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(ux, uy, scoutRange() * sc, 0, TAU); ctx.stroke();
      if (t) { ctx.beginPath(); ctx.moveTo(ux, uy); ctx.lineTo(X(t.x), Y(t.y)); ctx.stroke(); } ctx.setLineDash([]);
      drawTrackIcon(ctx, ux, uy, time * 2, 'hostile', '#B9F27C', 0.55);
    }
    if ((it.kind === 'takeover' || it.kind === 'netblock') && it.busy) { const o = G.objs.find((x) => x.id === it.busy.tgt); if (o) { ctx.strokeStyle = c.col; ctx.lineWidth = 1.4; ctx.setLineDash([5, 4]); ctx.lineDashOffset = -time * 30; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(X(o.x), Y(o.y)); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0; } }
    if (it.kind === 'laser' && it.busy) { const o = G.objs.find((x) => x.id === it.busy.tgt); if (o) { ctx.strokeStyle = 'rgba(255,107,94,0.25)'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(X(o.x), Y(o.y)); ctx.stroke(); ctx.strokeStyle = '#FFD3CC'; ctx.lineWidth = 1.6; ctx.stroke(); ctx.fillStyle = '#FFF2E0'; ctx.beginPath(); ctx.arc(X(o.x), Y(o.y), 3 + Math.sin(time * 40) * 1.2, 0, TAU); ctx.fill(); } }
  }
  // anteprima di piazzamento
  if ((G.phase === 'setup' || G.phase === 'wave') && (G.tool || (drag && drag.moved)) && mouse) {
    const kind = drag && drag.moved ? drag.it.kind : G.tool, c = CAT[kind], ok = canPlace(mouse.x, mouse.y), r = c.range * (drag && drag.moved ? lvMul(drag.it) : 1) * (WX()[kind] || 1);
    ctx.strokeStyle = ok ? c.col : '#FF6B5E'; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X(mouse.x), Y(mouse.y), r * sc, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    if (!drag) { ctx.globalAlpha = 0.85; glyph(ctx, kind, X(mouse.x), Y(mouse.y), 11, ok ? c.col : '#FF6B5E'); ctx.globalAlpha = 1; }
  }
  // tracce
  if (G.replay) drawReplay(time); else for (const o of G.objs) {
    const T = TYPES[o.type], big = T.big || 1;
    if (o.state === 'falling') { const k = o.fall / 1.2; ctx.globalAlpha = 1 - k; drawTrackIcon(ctx, X(o.x), Y(o.y), o.fall * 8, 'hostile', '#8A9AA6', (1 - k * 0.6) * big); ctx.globalAlpha = 1; continue; }
    if (!visible(o)) continue;
    const p = shownPos(o), [, col, abbr] = CLS[o.cls], a = Math.atan2(o.vy, o.vx), px = X(p.x), py = Y(p.y), radarOnly = !contNow(o);
    if (o.type === 'heli') { ctx.save(); ctx.translate(px, py); ctx.fillStyle = '#FFB547'; ctx.beginPath(); ctx.ellipse(0, 0, 7, 4, Math.atan2(o.vy, o.vx), 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(255,181,71,0.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); const ra = time * 20; ctx.moveTo(Math.cos(ra) * 14, Math.sin(ra) * 14); ctx.lineTo(-Math.cos(ra) * 14, -Math.sin(ra) * 14); ctx.stroke(); ctx.restore(); ctx.font = '10.5px ' + MONO; ctx.fillStyle = '#FFB547'; ctx.fillText('ELI · elisoccorso', px + 16, py - 10); continue; }
    if (o.type === 'plane') { drawPlane(px, py, Math.PI, time); ctx.font = '10.5px ' + MONO; ctx.fillStyle = '#E6EDF2'; ctx.fillText('AER · in atterraggio', px + 16, py - 10); continue; }
    o.trail.push([p.x, p.y]); if (o.trail.length > 26) o.trail.shift();
    if (!radarOnly) { ctx.strokeStyle = col + '55'; ctx.lineWidth = 1.5; ctx.beginPath(); o.trail.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)))); ctx.stroke(); }
    const fade = radarOnly ? Math.max(0.35, 1 - (G.t - o.radarT) / (SWEEP + 0.2)) : 1;
    ctx.globalAlpha = fade;
    if (radarOnly) { ctx.fillStyle = 'rgba(61,184,245,0.18)'; ctx.beginPath(); ctx.arc(px, py, 10 * big, 0, TAU); ctx.fill(); }
    drawTrackIcon(ctx, px, py, a, o.cls, col, (o.cls === 'unk' ? 1 : 1.05) * (o.cls === 'unk' ? Math.min(big, 1.3) : big));
    if (o.state === 'jammed') { ctx.strokeStyle = '#99FFCC'; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.arc(px, py, 12 + Math.sin(time * 20) * 2, 0, TAU); ctx.stroke(); ctx.setLineDash([]); }
    if (!radarOnly && o.cls !== 'bird') { ctx.strokeStyle = col + '99'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + o.vx * sc * 4, py + o.vy * sc * 4); ctx.stroke(); }
    if (o.cls !== 'bird' || o.id === G.sel) { ctx.font = '10.5px ' + MONO; ctx.fillStyle = col; ctx.fillText(`${o.id} ${abbr}`, px + 10 * big, py - 8); }
    if (o.hp > 1 && !radarOnly && o.cls === 'hostile') { const mx = T.hp, w = 22 * big; ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(px - w / 2, py + 10 * big, w, 3); ctx.fillStyle = '#FF6B5E'; ctx.fillRect(px - w / 2, py + 10 * big, w * o.hp / mx, 3); }
    ctx.globalAlpha = 1;
    if (o.raid && o.rtg && o.cls === 'hostile' && !radarOnly) { ctx.strokeStyle = 'rgba(255,107,94,0.45)'; ctx.setLineDash([3, 5]); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(X(o.rtg.x), Y(o.rtg.y)); ctx.stroke(); ctx.setLineDash([]); }
    if (T.hunter && o.mode === 'dive' && !radarOnly) { const tx = o.tg ? o.tg.x : 0, ty = o.tg ? o.tg.y : 0; ctx.strokeStyle = 'rgba(255,107,94,0.7)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(X(tx), Y(ty)); ctx.stroke(); ctx.setLineDash([]); }
    if (o.reqAt >= 0 && needsAuth(o)) { const pr = 13 + Math.sin(time * 7) * 2; ctx.strokeStyle = '#FFB547'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(px, py, pr, 0, TAU); ctx.stroke(); ctx.fillStyle = '#FFB547'; ctx.font = '700 11px ' + DISP; ctx.fillText('!', px - 16, py - 9); }
    if (o.prio) { ctx.strokeStyle = '#FF6B5E'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(px - 15, py); ctx.lineTo(px - 9, py); ctx.moveTo(px + 9, py); ctx.lineTo(px + 15, py); ctx.moveTo(px, py - 15); ctx.lineTo(px, py - 9); ctx.moveTo(px, py + 9); ctx.lineTo(px, py + 15); ctx.stroke(); }
    if (o.deny) { ctx.strokeStyle = '#3DB8F5'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(px, py, 12, 0, TAU); ctx.moveTo(px - 8, py + 8); ctx.lineTo(px + 8, py - 8); ctx.stroke(); }
    if (o.id === G.sel) { ctx.strokeStyle = '#E6EDF2'; ctx.lineWidth = 1.5; const r = 15 * Math.min(big, 1.5); for (let i = 0; i < 4; i++) { const aa = i * Math.PI / 2 + time; ctx.beginPath(); ctx.arc(px, py, r, aa, aa + 0.9); ctx.stroke(); } }
  }
  for (const s of G.shots) {
    const scol = { int: '#00D0B4', nd: '#C9E8FF', li: '#7CF0E0', net: '#C9D3DA' }[s.k]; ctx.strokeStyle = scol + '73'; ctx.lineWidth = 2; ctx.beginPath(); s.trail.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)))); ctx.stroke();
    if (s.k !== 'net') drawTrackIcon(ctx, X(s.x), Y(s.y), 0, 'hostile', scol, s.k === 'li' ? 0.5 : 0.6); else { ctx.strokeStyle = '#C9D3DA'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(X(s.x), Y(s.y), 5, 0, TAU); ctx.stroke(); }
  }
  for (const p of G.parts) { ctx.globalAlpha = Math.min(1, p.life * 2); ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), p.s, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 1;
  weatherOver(time);
  ctx.restore();
  const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  if (G.slow > 0 && G.phase === 'wave') { ctx.fillStyle = `rgba(255,107,94,${0.06 * Math.min(1, G.slow * 2)})`; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#FFB3AB'; ctx.font = '600 13px ' + DISP; ctx.textAlign = 'center'; ctx.fillText('Drone vicino a un obiettivo', W / 2, 60); ctx.textAlign = 'left'; }
  if (G.ab.alert && G.ab.alert.on > 0 && G.phase === 'wave') { ctx.strokeStyle = `rgba(180,140,255,${0.35 + 0.2 * Math.sin(time * 6)})`; ctx.lineWidth = 4; ctx.strokeRect(2, 2, W - 4, H - 4); }
  if (G.flash > 0) { ctx.fillStyle = `rgba(255,70,60,${G.flash * 0.35})`; ctx.fillRect(0, 0, W, H); }
  if (G.paused && G.phase === 'wave') { ctx.fillStyle = 'rgba(6,10,14,0.5)'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#E6EDF2'; ctx.font = '600 20px ' + DISP; ctx.textAlign = 'center'; ctx.fillText('In pausa · Spazio per riprendere', W / 2, H / 2); ctx.textAlign = 'left'; }
}

// ============================================================ replay
const SHORT = { radio: 'radio', fiber: 'fibra', swarm: 'sciame', heavy: 'pesante', loiter: 'circuitante', fpv: 'FPV', wing: 'ala fissa', stealth: 'furtivo', lte: '4G', spy: 'spia', raider: 'assalto', mother: 'madre', decoy: 'esca', civil: 'civile', auth: 'autorizzato', plane: 'aereo', heli: 'elisoccorso' };
function replayIdx(t) { const F = G.rec.frames; let lo = 0, hi = F.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (F[m].t <= t) lo = m; else hi = m - 1; } return lo; }
function drawReplay(time) {
  const R = G.rec, F = R && R.frames; if (!F || !F.length) return;
  const i = replayIdx(G.replay.t), f = F[i], trail = new Map();
  for (let k = Math.max(0, i - 16); k <= i; k++) for (const [id, , x, y] of F[k].o) { if (!trail.has(id)) trail.set(id, []); trail.get(id).push([x, y]); }
  for (const [id, type, x, y, cls, seen] of f.o) {
    const T = TYPES[type], col = seen ? CLS[cls][1] : '#6B7C88', pts = trail.get(id) || [], px = X(x), py = Y(y);
    ctx.strokeStyle = col + '77'; ctx.lineWidth = 1.4; ctx.beginPath(); pts.forEach(([a, b], k) => (k ? ctx.lineTo(X(a), Y(b)) : ctx.moveTo(X(a), Y(b)))); ctx.stroke();
    const p0 = pts.length > 1 ? pts[pts.length - 2] : [x, y], ang = Math.atan2(y - p0[1], x - p0[0]);
    ctx.globalAlpha = seen ? 1 : 0.6;
    if (type === 'plane') drawPlane(px, py, Math.PI, time); else drawTrackIcon(ctx, px, py, ang, seen ? cls : 'unk', col, (T.big || 1));
    if (!seen && T.hostile) { ctx.strokeStyle = '#FF6B5E'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(px, py, 13, 0, TAU); ctx.stroke(); ctx.setLineDash([]); }
    if (type !== 'bird') { ctx.font = '10px ' + MONO; ctx.fillStyle = col; ctx.fillText(SHORT[type] + (!seen && T.hostile ? ' · non visto' : ''), px + 10, py - 8); }
    ctx.globalAlpha = 1;
  }
  for (const e of R.ev) { const d = G.replay.t - e.t; if (d < 0 || d > 2.5) continue; const k = d / 2.5;
    ctx.strokeStyle = e.col; ctx.globalAlpha = 1 - k; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(e.x), Y(e.y), 10 + 30 * k, 0, TAU); ctx.stroke();
    if (e.key) { ctx.font = '600 12px ' + DISP; ctx.fillStyle = e.col; ctx.fillText(e.txt, X(e.x) + 16, Y(e.y) + 20); } ctx.globalAlpha = 1; }
  ctx.fillStyle = 'rgba(10,17,24,.8)'; ctx.fillRect(12, 12, 210, 26); ctx.fillStyle = '#E6EDF2'; ctx.font = '600 13px ' + DISP; ctx.fillText(`REPLAY · ${fmt(G.replay.t, 1)} s · la verità sul campo`, 20, 30);
}
function startReplay() {
  if (!G.rec || !G.rec.frames.length) return;
  const T = G.rec.frames[G.rec.frames.length - 1].t; G.replay = { t: 0, playing: true, speed: 4, T };
  $('overlay').hidden = true; $('replayBar').hidden = false; $('rSlider').max = T; $('rPlay').textContent = 'Pausa'; $('rSpeed').textContent = '×4';
  const m = $('rMoments'); m.replaceChildren(); $('feed').replaceChildren(); $('hint').textContent = '';
  const ks = []; for (const e of G.rec.ev.filter((x) => x.key)) { const p = ks[ks.length - 1]; if (p && p.txt.replace(/ ×\d+$/, '') === e.txt && e.t - p.t < 4) { p.n = (p.n || 1) + 1; p.txt = e.txt + ' ×' + p.n; } else ks.push({ ...e }); }
  for (const e of ks.slice(0, 12)) { const b = document.createElement('button'); b.type = 'button'; b.innerHTML = `<i>${fmt(e.t)} s</i>`; b.append(document.createTextNode(e.txt)); b.style.borderColor = e.col + '88'; b.addEventListener('click', () => { G.replay.t = Math.max(0, e.t - 2); G.replay.playing = true; $('rPlay').textContent = 'Pausa'; }); m.append(b); }
  if (!m.children.length) { const sp = document.createElement('button'); sp.textContent = 'Nessun momento critico: ondata pulita'; m.append(sp); }
}
$('rPlay').addEventListener('click', () => { if (!G.replay) return; if (G.replay.t >= G.replay.T) G.replay.t = 0; G.replay.playing = !G.replay.playing; $('rPlay').textContent = G.replay.playing ? 'Pausa' : 'Riproduci'; });
$('rSpeed').addEventListener('click', () => { if (!G.replay) return; G.replay.speed = G.replay.speed === 2 ? 4 : G.replay.speed === 4 ? 8 : 2; $('rSpeed').textContent = '×' + G.replay.speed; });
$('rSlider').addEventListener('input', (e) => { if (G.replay) { G.replay.t = +e.target.value; } });
$('rBack').addEventListener('click', () => { G.replay = null; $('replayBar').hidden = true; $('overlay').hidden = false; });

// ============================================================ input
const pos = (ev) => { const r = cv.getBoundingClientRect(); return { px: ev.clientX - r.left, py: ev.clientY - r.top }; };
function itemAt(px, py) { let best = null, bd = 14; for (const it of G.items) { const d = Math.hypot(X(it.x) - px, Y(it.y) - py); if (d < bd) { bd = d; best = it; } } return best; }
function trackAt(w) { let best = null, bd = 22 / sc; for (const o of G.objs) if (visible(o)) { const p = shownPos(o), d = Math.hypot(p.x - w.x, p.y - w.y); if (d < bd) { bd = d; best = o; } } return best; }
cv.addEventListener('pointermove', (ev) => {
  const { px, py } = pos(ev); mouse = toWorld(px, py);
  if (drag && !drag.moved && Math.hypot(px - drag.px, py - drag.py) > 5) drag.moved = true;
  hoverItem = itemAt(px, py);
  const tip = $('tip');
  if (hoverItem && !drag && (G.phase === 'setup' || G.phase === 'wave')) { const c = CAT[hoverItem.kind]; tip.textContent = `${c.name} · livello ${hoverItem.lv} · portata ${fmt(rangeOf(hoverItem))} m${hoverItem.dmg ? ' · distrutto' : hoverItem.fault ? ' · guasto' : ''}${G.phase === 'setup' ? ' · clicca per potenziare, trascina per spostare' : hoverItem.kills ? ` · ${hoverItem.kills} neutralizzati` : ''}`; tip.style.left = Math.min(px + 14, W - 270) + 'px'; tip.style.top = (py + 14) + 'px'; tip.hidden = false; }
  else tip.hidden = true;
  cv.style.cursor = G.phase === 'setup' && hoverItem ? 'grab' : 'crosshair';
});
cv.addEventListener('pointerleave', () => { mouse = null; hoverItem = null; $('tip').hidden = true; });
cv.addEventListener('pointerdown', (ev) => {
  if (ev.button === 2) return;
  const { px, py } = pos(ev), w = toWorld(px, py); mouse = w;
  if (G.phase === 'setup') {
    const it = itemAt(px, py);
    if (it) { G.tool = null; drag = { it, px, py, moved: false }; cv.setPointerCapture(ev.pointerId); return; }
    if (G.tool) { const k = G.tool; if (place(k, w.x, w.y) && !ev.shiftKey) G.tool = null; else if (ev.shiftKey && CAT[k].cost <= G.budget) G.tool = k; uiDirty = true; hint(); return; }
    G.selItem = null; uiDirty = true; return;
  }
  if (G.phase === 'wave') {
    if (G.tool) { const k = G.tool; if (place(k, w.x, w.y) && !ev.shiftKey) G.tool = null; uiDirty = true; hint(); return; }
    const o = trackAt(w);
    if (o) { G.sel = o.id; G.selItem = null; }
    else { const it = itemAt(px, py); G.selItem = it; G.sel = it ? G.sel : null; }
    uiDirty = true; renderTrack();
  }
});
cv.addEventListener('pointerup', () => {
  if (!drag) return;
  const d = drag; drag = null;
  if (!d.moved) { G.selItem = d.it; G.tool = null; uiDirty = true; return; }
  const e = mouse ? placeErr(mouse.x, mouse.y) : 'Posizione non valida.';
  if (!e) { d.it.x = mouse.x; d.it.y = mouse.y; d.it.ang = ((d.it.x * 0.013 + d.it.y * 0.007) % TAU + TAU) % TAU; SND.place(); } else hint(e + ' La struttura torna dov’era.');
  G.selItem = d.it; uiDirty = true;
});
cv.addEventListener('contextmenu', (ev) => { ev.preventDefault(); if (G.phase !== 'setup') return; const { px, py } = pos(ev), it = itemAt(px, py); if (it) sell(it); });
addEventListener('keydown', (ev) => {
  if (ev.target && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA')) return;
  if (ev.code === 'Space' && G.phase === 'wave') { togglePause(); ev.preventDefault(); }
  if (ev.key === 'Escape' && !$('codex').hidden) { closeCodex(); return; }
  if (!$('codex').hidden) return;
  if (ev.key === 'Escape') { G.tool = null; G.selItem = null; uiDirty = true; hint(); }
  if (G.phase === 'wave') {
    const a = ABIL.find((x) => x.key === ev.key); if (a) useAbility(a.k);
    const o = G.objs.find((x) => x.id === G.sel);
    if ((ev.key === 'e' || ev.key === 'E') && o) { setPrio(o); renderTrack(); }
    if ((ev.key === 'n' || ev.key === 'N') && o) { setDeny(o); renderTrack(); }
  }
  if ((ev.key === 'u' || ev.key === 'U') && G.selItem) upgrade(G.selItem);
});
function togglePause() { G.paused = !G.paused; $('btnPause').textContent = G.paused ? 'Riprendi' : 'Pausa'; status(); }
$('btnStart').addEventListener('click', startWave);
$('btnBase').addEventListener('click', baseConfig);
$('btnPause').addEventListener('click', togglePause);
$('btnFast').addEventListener('click', () => { G.speed = G.speed === 1 ? 2 : G.speed === 2 ? 3 : G.speed === 3 ? 0.5 : 1; $('btnFast').textContent = 'Velocità ×' + fmt(G.speed, G.speed === 0.5 ? 1 : 0); });
$('btnSound').addEventListener('click', (ev) => { soundOn = !soundOn; if (!soundOn) MUSIC.stop(); else if (G.phase === 'wave') MUSIC.start(); ev.currentTarget.setAttribute('aria-pressed', String(soundOn)); ev.currentTarget.textContent = soundOn ? 'Suono attivo' : 'Suono spento'; });
$('btnUp').addEventListener('click', () => upgrade(G.selItem));
$('btnIntel').addEventListener('click', () => { if (G.phase !== 'setup' || G.intelBought || G.budget < intelCost()) return; G.budget -= intelCost(); G.intelBought = true; SND.up(); renderIntel(); uiDirty = true; });
$('btnCodex').addEventListener('click', () => openCodex(G.selItem ? (CAT[G.selItem.kind].g === 'S' ? 'sens' : 'eff') : undefined));
$('codexClose').addEventListener('click', closeCodex);
document.querySelectorAll('#codexTabs button').forEach((b) => b.addEventListener('click', () => { codexTab = b.dataset.t; renderCodex(); $('codexGrid').scrollTop = 0; }));
$('btnSell').addEventListener('click', () => G.selItem && sell(G.selItem));
$('btnEmit').addEventListener('click', () => toggleEmit(G.selItem));
$('btnPrio').addEventListener('click', () => { setPrio(G.objs.find((x) => x.id === G.sel)); renderTrack(); });
$('btnDeny').addEventListener('click', () => { setDeny(G.objs.find((x) => x.id === G.sel)); renderTrack(); });
$('reqList').addEventListener('click', (ev) => {
  const r = ev.target.closest('.r'); if (!r) return; const o = G.objs.find((x) => x.id === +r.dataset.id); if (!o) return;
  const a = ev.target.closest('button'); if (!a) { G.sel = o.id; renderTrack(); return; }
  if (a.dataset.a === 'e') setPrio(o); else setDismiss(o); renderReq();
});
document.querySelectorAll('#roe button').forEach((b) => b.addEventListener('click', () => setRoe(b.dataset.roe)));

// ============================================================ ciclo
let last = performance.now(), ui = 0;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; const time = now / 1000;
  if (G.phase === 'wave' && !G.paused) {
    let sp = G.speed; G.slowCd = Math.max(0, (G.slowCd || 0) - dt);
    if (G.slow > 0) { G.slow -= dt; sp *= 0.3; }
    const n = Math.ceil(4 * sp), h = dt * sp / n; for (let i = 0; i < n && G.phase === 'wave'; i++) step(h);
    let lvl = 0;
    for (const o of G.objs) { if (!o.alive || !TYPES[o.type].hostile || !visible(o)) continue; const d = distAsset(o); if (d < 600) lvl += d < 250 ? 0.3 : 0.15;
      if (d < 200 && !o.closeA && o.cls !== 'unk') { o.closeA = true; if (!G.slowCd) { G.slow = 0.8; G.slowCd = 4; } } }
    MUSIC.set(Math.min(1, lvl), dt);
  }
  if (G.replay && G.replay.playing) { G.replay.t = Math.min(G.replay.T, G.replay.t + dt * G.replay.speed); if (G.replay.t >= G.replay.T) { G.replay.playing = false; $('rPlay').textContent = 'Riproduci'; } }
  if (G.replay) { $('rSlider').value = G.replay.t; $('rTime').textContent = fmt(G.replay.t) + ' s'; }
  ui += dt; if (ui > 0.25 || uiDirty) { ui = 0; if (G.phase === 'wave') { renderTrack(); renderReq(); renderAbil(); renderTally(); } renderShop(); renderItem(); status(); uiDirty = false; }
  G.shake = Math.max(0, G.shake - dt); G.flash = Math.max(0, G.flash - dt);
  draw(time);
  requestAnimationFrame(frame);
}
resize(); addEventListener('resize', resize);
initShop(); legend(); syncRoe(); renderAbil(); intro();
requestAnimationFrame(frame);
window.__g = { G, startReplay, buildWave, openCodex, closeCodex, pickWave, available, step, startWave, place, baseConfig, toSetup, visible, upgrade, useAbility, startSite, newCampaign, setRoe, setPrio, setDeny, toggleEmit, setDismiss, siteEnd, finalReport, SITES, CAT, needsAuth, perkPick, intro };
