// ============================================================ salvataggio (solo in questo browser)
const SAVE_KEY = 'difesa-strati-v3';
function loadSave() { try { const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (s && Array.isArray(s.best)) return { reached: [], perks: [], ...s }; } catch {} return { unlocked: 0, best: [], reached: [], perks: [] }; }
const available = (k) => (CAT[k].unlock || 0) <= Math.max(G.site, G.mode === 'endless' ? SAVE.unlocked : 0);
const unlockedAt = (i) => Object.keys(CAT).filter((k) => CAT[k].unlock === i);
function writeSave(s) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch {} }
let SAVE = loadSave();

// ============================================================ costruzione
function place(kind, x, y) {
  if (G.phase !== 'setup' && G.phase !== 'wave') return null;
  const e = placeErr(x, y); if (e) { hint(e); return null; }
  const c = CAT[kind]; if (!available(kind)) { hint(`${c.name}: si sblocca completando ${SITES[c.unlock - 1].name}.`); return null; }
  if (c.cost > G.budget) { hint('Crediti insufficienti.'); return null; }
  const it = { kind, x, y, lv: 1, cd: 0, ammo: c.ammo || 0, busy: null, kills: 0, uses: 0, cost: 0, fk: 0, wk: 0, ph: 0, ang: ((x * 0.013 + y * 0.007) % TAU + TAU) % TAU,
    spent: c.cost, dmg: false, fault: false, off: false };
  G.items.push(it); G.budget -= c.cost; SND.place();
  if (G.phase === 'wave') { G.ws.built++; feed(`${c.name} costruito durante l’ondata`, `−${c.cost} crediti`, 'good'); }
  if (c.cost > G.budget) G.tool = null;
  uiDirty = true; hint(); return it;
}
function sell(it) {
  if (G.phase !== 'setup') return hint('Durante l’ondata non si rivende.');
  const i = G.items.indexOf(it); if (i < 0) return;
  G.items.splice(i, 1); G.budget += it.spent; if (G.selItem === it) G.selItem = null; SND.bad(); uiDirty = true;
  hint(`${CAT[it.kind].name} rivenduto: +${it.spent} crediti.`);
}
function upgrade(it) {
  if (!it || it.lv >= 3 || (G.phase !== 'setup' && G.phase !== 'wave')) return false;
  const c = upCost(it); if (c > G.budget) { hint('Crediti insufficienti per il potenziamento.'); return false; }
  G.budget -= c; it.spent += c; it.lv++;
  if (it.kind === 'net' && it.lv === 3) it.ammo += CAT.net.ammo;
  SND.up(); uiDirty = true; hint(`${CAT[it.kind].name} al livello ${it.lv}${it.lv === 3 ? ': ' + CAT[it.kind].s3 : '.'}`);
  return true;
}
function toggleEmit(it) {
  if (!it || !CAT[it.kind].emit) return;
  it.off = !it.off; if (it.off) it.busy = null; SND.place(); uiDirty = true;
  if (G.phase === 'wave') { G.ws.emcon = true; feed(`${CAT[it.kind].name}: emissioni ${it.off ? 'spente' : 'riaccese'}`, it.off ? 'invisibile alle munizioni circuitanti, ma non lavora' : ''); }
}
function baseConfig() {
  const b = S().base; if (!b) return;
  for (const it of G.items) G.budget += it.spent; G.items = []; G.selItem = null;
  for (const [k, x, y] of b) place(k, x, y);
  hint('Difesa di partenza: radar, RF, disturbatore e un hangar. Funziona contro i droni radio… e contro gli altri?');
}

// ============================================================ siti
function newCampaign(from = 0, wave = 0, mode = 'campaign') {
  Object.assign(G, { mode, score: 0, perks: (SAVE.perks || []).slice(0, from), carry: from ? 20 : 0, camp: [], effStats: {}, roe: 'prudenti' }); syncRoe();
  const pick = () => (G.perks.length >= from || mode === 'endless' ? startSite(from, wave) : perkPick(`Parti dal sito ${from + 1}: scegli una dottrina (${G.perks.length + 1} di ${from})`, pick));
  pick();
}
function startSite(i, wave = 0) {
  G.curWave = null; G.adapt = null; G.genSeed = G.mode === 'endless' ? 1 + Math.floor(Math.random() * 9999) : 1;
  G.site = i; G.wave = wave; G.startWave0 = wave; G.items = []; G.assets = siteAssets(SITES[i]).map((a) => ({ ...a, max: a.integ + (hasPerk('riserva') ? 1 : 0), hp: a.integ + (hasPerk('riserva') ? 1 : 0) })); G.maxInteg = G.assets[0].max; G.integrity = G.maxInteg; G.spd = 1; G.siteWaves = []; G.selItem = null; G.sel = null; G.tool = null; G.phase = 'site';
  G.siteStart = { score: G.score, carry: G.carry };
  G.budget = SITES[i].budget + (hasPerk('fondi') ? 30 : 0) + G.carry + wave * (BONUS + 10); G.carry = 0;
  G.pinfo = pathInfo(); G.objs = []; G.shots = []; G.fx = []; G.parts = []; idlePanels(); $('cardIntel').hidden = true;
  buildTerrain(); siteIntro();
}
function siteIntro() {
  const s = S(); status();
  const nu = unlockedAt(G.site).filter((k) => G.site > 0);
  const endless = G.mode === 'endless';
  showDlg(`<span class="eyebrow">${endless ? 'PATTUGLIA · ' : ''}SITO ${G.site + 1} DI ${SITES.length}${G.wave ? ` · DALL’ONDATA ${G.wave + 1}` : ''}</span><h2>${s.name}</h2><p>${endless ? `Modalità pattuglia: ondate generate a caso, sempre più difficili, finché il sito regge. Il nemico si adatta e l’intelligence è incerta. Record: <b>${(SAVE.endless || {})[G.site] || 0} ondate</b>.` : s.brief}</p>
    <p class="rule">${s.rule}</p>
    ${endless ? '' : `<h4>ONDATE</h4><ul>${s.waves.map((w, i) => `<li${i < G.wave ? ' style="opacity:.45"' : ''}><b>${i + 1}. ${w.name}</b> · ${WEATHER[w.wx].name.toLowerCase()}</li>`).join('')}</ul>`}
    ${G.assets.length > 1 ? `<div><h4>OBIETTIVI DA DIFENDERE</h4>${G.assets.map((a) => `<span class="pill">${a.label} · ${a.max} punti</span>`).join('')}<p style="margin-top:6px">Se anche uno solo va fuori servizio, il sito è perso.</p></div>` : ''}
    ${nu.length ? `<div><h4>NUOVE STRUTTURE DISPONIBILI</h4>${nu.map((k) => `<span class="pill">${CAT[k].name}</span>`).join('')}</div>` : ''}
    <div class="kpis"><div>Crediti iniziali<b>${G.budget}</b></div><div>Tra le ondate<b>+${BONUS}</b></div><div>Per drone abbattuto<b>+1/+20</b></div><div>Integrità<b>${G.assets.map((a) => a.max).join(' + ')}</b></div></div>
    ${G.perks.length ? `<div><h4>DOTTRINE ATTIVE</h4>${G.perks.map((k) => `<span class="pill">${PERKS.find((p) => p.k === k).name}</span>`).join('')}</div>` : ''}
    <div class="btnrow"><button class="btn big" id="dGo">Progetta la difesa</button><button class="btn ghost" id="dMenu">Menu</button></div>`);
  $('dGo').addEventListener('click', () => { beep(1, 0.001, 'sine', 0.0001); toSetup(); });
  $('dMenu').addEventListener('click', intro);
}
function toSetup() {
  $('banner').hidden = true; $('feed').replaceChildren();
  let fixed = 0; for (const it of G.items) { if (it.dmg || it.fault) fixed++; it.dmg = false; it.fault = false; it.busy = null; }
  G.phase = 'setup'; G.objs = []; G.shots = []; G.fx = []; G.parts = []; G.sel = null; G.paused = false; G.replay = null; $('replayBar').hidden = true; hideDlg();
  G.curWave = buildWave(G.wave); G.intelBought = intelFree();
  document.body.className = 'setup';
  $('cardIntel').hidden = false; $('cardAbil').hidden = true; $('cardReq').hidden = true; $('cardTrack').hidden = true; $('cardWave').hidden = true; $('progress').hidden = true;
  $('setupBtns').hidden = false; $('btnBase').hidden = !S().base; $('shopNote').hidden = false;
  renderIntel(); uiDirty = true; hint(fixed ? `La squadra tecnica ha riparato ${fixed} ${fixed > 1 ? 'strutture' : 'struttura'} tra un’ondata e l’altra.` : undefined); status();
}
function startWave() {
  if (G.phase !== 'setup') return;
  if (!G.items.some((it) => CAT[it.kind].g === 'S')) return hint('Serve almeno un sensore: senza rilevamento nessun effettore può agire.');
  if (!G.items.some((it) => CAT[it.kind].g === 'E')) return hint('Serve almeno un effettore per neutralizzare i droni.');
  const gw = G.mode === 'endless' ? 7777 + G.site * 1000 + G.wave : SITES.slice(0, G.site).reduce((s, x) => s + x.waves.length, 0) + G.wave;
  G.phase = 'wave'; G.t = 0; G.objs = []; G.fx = []; G.parts = []; G.shots = []; G.sel = null; G.tool = null; G.paused = false; G.endIn = null; seed = 11 + gw * 97;
  G.items.forEach((it) => { it.cd = 0; it.busy = null; it.ammo = ammoOf(it); it.wk = 0; it.uav = null; });
  G.ws = { site: G.site, wave: G.wave, hostile: 0, stopped: 0, hits: 0, falseKill: 0, cost: 0, byType: {}, notes: new Set(), holds: new Set(), lostKinds: new Set(), react: [],
    decoys: 0, decoyKill: 0, decoyWaste: 0, decoyPass: 0, civSafe: 0, spyEsc: 0, secHit: new Set(), debris: 0, structLost: 0, requests: 0, built: 0, abil: 0, earned: 0, manual: 0, log: [] };
  G.pending = WV().spawn.map((spec) => ({ spec, type: spec[0], t: spec[1] }));
  G.events = (WV().ev || []).map(([k, t, arg]) => ({ k, t, arg }));
  G.planes = (WV().planes || []).map((t) => ({ t }));
  G.ab = { alert: { cd: 0, on: 0 }, reload: { cd: 0, on: 0 }, repair: { cd: 0, on: 0 } };
  G.totalHostile = computeTotal(); startObjective(); G.rec = { frames: [], ev: [], last: -9 }; MUSIC.start();
  document.body.className = 'wave';
  $('cardIntel').hidden = true; $('cardAbil').hidden = false; $('cardTrack').hidden = false; $('cardWave').hidden = false; $('progress').hidden = false;
  $('setupBtns').hidden = true; $('shopNote').hidden = true;
  $('feed').replaceChildren();
  const bn = $('banner'); bn.innerHTML = `<div><small>${S().short.toUpperCase()} · ${G.mode === 'endless' ? 'PATTUGLIA · ONDATA ' + (G.wave + 1) : 'ONDATA ' + (G.wave + 1) + ' DI ' + S().waves.length}</small><strong>${WV().name}</strong>${WV().wx !== 'sereno' ? `<em>${WX().name}: ${WX().desc}</em>` : ''}</div>`; bn.hidden = false;
  hint(); uiDirty = true; renderTrack(); status();
}

// ============================================================ fine ondata
function grade(s) {
  if (siteLost()) return ['F', '#FF6B5E'];
  const r = s.hostile ? s.stopped / s.hostile : 1, pen = s.hits * 0.12 + s.spyEsc * 0.06 + s.falseKill * 0.1 + s.debris * 0.08 + s.structLost * 0.05, v = r - pen;
  return v >= 0.97 ? ['A', '#99FFCC'] : v >= 0.85 ? ['B', '#00D0B4'] : v >= 0.65 ? ['C', '#FFB547'] : ['D', '#FF6B5E'];
}
function endWave() {
  if (G.phase !== 'wave') return;
  G.items.forEach((it) => (it.busy = null)); G.phase = 'debrief'; idlePanels(); MUSIC.stop(); const s = G.ws; const objOk = endObjective(s); s.grade = grade(s); G.siteWaves.push(s);
  const endless = G.mode === 'endless', lastW = G.wave === nWaves() - 1, lost = siteLost(), L = lessons(s), [gl, gc] = s.grade;
  G.adapt = lastW || lost ? null : dominantEffector();
  if (endless && !lost) { SAVE.endless = SAVE.endless || {}; SAVE.endless[G.site] = Math.max(SAVE.endless[G.site] || 0, G.wave + 1); writeSave(SAVE); }
  if (!lost && !endless) { SAVE.reached[G.site] = Math.max(SAVE.reached[G.site] || 0, Math.min(S().waves.length - 1, G.wave + 1)); writeSave(SAVE); }
  showDlg(`<div class="dlghead"><span class="grade" style="background:${gc}">${gl}</span><div><span class="eyebrow">${S().short.toUpperCase()} · ONDATA ${G.wave + 1}</span><h2>${lost ? `${G.assets.find((a) => a.hp <= 0).label}: fuori servizio` : `${WV().name}: superata`}</h2></div></div>
    <div class="kpis"><div>Droni fermati<b>${s.stopped}/${s.hostile}</b></div><div>Colpi subiti<b>${s.hits}</b></div><div>Falsi allarmi<b>${s.falseKill + s.debris}</b></div><div>Costo per drone<b>${s.stopped ? fmt(s.cost / s.stopped, 2) + ' k€' : '—'}</b></div></div>
    ${s.obj ? `<p class="rule" style="border-left-color:${objOk ? 'var(--mint)' : 'var(--coral)'}">${objOk ? '✓ Obiettivo d’ondata riuscito: +30 crediti, +300 punti.' : '✗ Obiettivo d’ondata fallito.'} ${s.obj.k === 'capture' ? `Catturati intatti: ${s.captured} su ${s.obj.n} richiesti.` : s.obj.label}</p>` : ''}
    <ul>${L.map((l) => `<li>${l}</li>`).join('')}</ul>
    ${G.adapt ? `<p><b>Attenzione:</b> il nemico ha notato quanto ha funzionato ${CAT[G.adapt].name.toLowerCase()}, e si adatterà nella prossima ondata.</p>` : ''}
    ${lost || lastW ? '' : `<p>Prossima: <b>${endless ? 'Pattuglia ' + (G.wave + 2) : S().waves[G.wave + 1].name}</b>. Ricevi <b>${BONUS} crediti</b>, più i <b>${s.earned}</b> guadagnati abbattendo droni.</p>`}
    <div class="btnrow"><button class="btn big" id="dNext">${lost || lastW ? (endless ? 'Fine della pattuglia' : 'Bilancio del sito') : 'Prepara la prossima ondata'}</button><button class="btn ghost" id="dReplay">Rivedi l’ondata</button></div>`);
  $('dReplay').addEventListener('click', startReplay);
  $('dNext').addEventListener('click', () => { if (lost && endless) return endlessEnd(); if (lost || lastW) return siteEnd(); G.wave++; G.budget += BONUS; toSetup(); });
  status();
}
function lessons(s) {
  const L = [], has = (k) => G.items.some((it) => it.kind === k), b = s.byType, n = s.notes, H = s.holds;
  if (s.hostile && s.stopped === s.hostile && !s.hits) L.push('<b>Nessun drone è arrivato.</b> Rilevamento, classificazione e ingaggio hanno lavorato insieme.');
  if (b.fiber && b.fiber.hit) L.push(!has('acu') && !has('camera') ? '<b>Un drone a fibra ottica è passato.</b> Volando basso sopra il bosco o sul mare sfugge al radar, e il sensore RF non sente un drone senza radio. Serve un sensore acustico o una camera sulla sua rotta.' : '<b>Un drone a fibra ottica è passato.</b> È stato classificato troppo tardi, o non c’era un effettore adatto vicino alla sua rotta.');
  if (n.has('jamImmune')) L.push('<b>Il disturbatore ha colpito a vuoto.</b> Fibra ottica, droni autonomi e link cifrati non hanno un collegamento radio da disturbare.');
  if (b.swarm && b.swarm.hit) L.push(has('hpm') ? '<b>Parte dello sciame è passata.</b> Le microonde coprono poco: vanno messe sul lato da cui arriva lo sciame.' : '<b>Lo sciame ha saturato la difesa.</b> Gli effettori che colpiscono un drone alla volta non bastano contro tanti bersagli insieme: servono le microonde.');
  if (n.has('shield')) L.push('<b>Le microonde non fermano i droni schermati.</b> Pesanti e drone madre vanno colpiti con laser, intercettori o reti, oppure con microonde al livello 3.');
  if (b.mother && b.mother.hit) L.push('<b>Il drone madre è arrivato al sito.</b> Con dieci punti vita servono più effettori puntati su di lui, e lontano, prima che rilasci gli sciami.');
  if (n.has('raidHit')) L.push('<b>Un drone d’assalto ha distrutto una delle tue strutture.</b> Non puntava la base ma le difese: proteggile con effettori vicini, come lanciareti e drone cacciatore, e tieni pronta la squadra tecnica (tasto 3).');
  if (n.has('structLost') && !n.has('raidHit')) L.push(`<b>Una munizione circuitante ha distrutto ${[...s.lostKinds].map((k) => (k === 'radar' ? 'il radar' : 'il disturbatore')).join(' e ')}.</b> Chi emette si fa trovare: quando una munizione gira intorno, spegni le emissioni (clicca la struttura) o tieni un effettore vicino.`);
  if (s.decoyWaste >= 2) L.push(`<b>${s.decoyWaste} colpi di intercettori o laser sono finiti su esche.</b> Una camera riconosce le esche, e il sistema smette di ingaggiarle.`);
  else if (s.decoys && s.decoyPass) L.push('<b>Le esche arrivate sul sito erano vuote.</b> Lasciarle passare non costa nulla: il problema è il tempo e le munizioni che fanno perdere.');
  if (H.has('aereo')) L.push('<b>Con un aereo vicino disturbatore e microonde sono rimasti fermi.</b> In aeroporto servono effettori che non disturbano l’avionica, come intercettori e reti.');
  if (H.has('corridoio')) L.push('<b>Il laser non spara nel corridoio di volo.</b> I droni che lo usano vanno fermati con gli intercettori, oppure prima che ci entrino.');
  if (H.has('folla')) L.push('<b>Laser, intercettori e microonde hanno trattenuto il fuoco sopra la folla.</b> Conviene ingaggiare lontano, prima delle zone affollate, o usare reti e disturbatore.');
  if (H.has('protetto')) L.push('<b>Disturbatore o microonde hanno trattenuto il fuoco</b> per non colpire una traccia che avevi ordinato di risparmiare: le armi ad area non scelgono il bersaglio.');
  if (n.has('debris')) L.push('<b>Un drone abbattuto è caduto sulla folla.</b> Dove si neutralizza conta quanto il come.');
  if (n.has('ridKill')) L.push('<b>Il drone autorizzato ha perso il Remote ID ed è stato abbattuto.</b> Una camera lo avrebbe riconosciuto; in alternativa bastava selezionarlo e ordinare “Non ingaggiare”.');
  else if (n.has('ridoff')) L.push('<b>Il drone autorizzato ha perso il Remote ID, ma è stato risparmiato.</b> Senza identificazione il sistema vede solo un drone: la decisione resta umana.');
  if (n.has('authKill')) L.push('<b>Un drone autorizzato è stato neutralizzato.</b> Disturbatore e microonde agiscono su un’area e non distinguono un drone legittimo: tienili lontani dalle sue rotte, o porta il disturbatore al livello 3.');
  if (n.has('birdKill')) L.push(G.roe === 'aggressive' ? '<b>Il sistema ha colpito un uccello.</b> Con regole aggressive anche una traccia sconosciuta è un bersaglio.' : '<b>Un uccello è stato colpito.</b> Succede con le microonde vicino a uno stormo, o autorizzando una traccia senza guardarne la velocità.');
  if (n.has('unkPassed')) L.push('<b>Un drone visto solo dal radar è arrivato al sito.</b> Senza camera, acustico o RF resta “sconosciuto”: con regole prudenti il sistema chiede la tua autorizzazione, che non è arrivata.');
  else if (n.has('reqIgnored')) L.push('<b>Una traccia per cui era arrivata una richiesta di ingaggio ha colpito il sito.</b>');
  if (n.has('denyHit')) L.push('<b>Un drone che avevi ordinato di non ingaggiare ha colpito il sito.</b> L’ordine resta valido finché non lo revochi con E.');
  if (n.has('secHit')) L.push(`<b>È stato colpito un obiettivo secondario: ${[...s.secHit].join(', ')}.</b> I droni scelgono il bersaglio meno difeso: la difesa deve coprire tutti gli obiettivi, non solo il principale.`);
  if (n.has('unseen')) L.push('<b>Un drone non è mai stato rilevato.</b> Controlla le zone d’ombra: boschi e mare nascondono i droni bassi al radar.');
  if (n.has('fault')) L.push('<b>Un guasto ha spento un sensore.</b> La squadra tecnica (tasto 3) lo rimette in linea in un attimo.');
  if (b.fpv && b.fpv.hit) L.push('<b>Un FPV da corsa è passato.</b> A 46 m/s lascia pochi secondi: servono sensori che lo vedano presto e un effettore che reagisca subito, come il disturbatore o la presa di controllo.');
  if (b.wing && b.wing.hit) L.push('<b>Un drone ad ala fissa è passato.</b> È veloce e alto: l’acustico lo sente poco e gli intercettori normali spesso lo mancano. Serve l’intercettore veloce, o lo spoofing GNSS.');
  if (b.stealth && b.stealth.hit) L.push('<b>Un drone furtivo è arrivato.</b> Il radar lo vede solo da vicino: radar passivo, infrarosso, acustico e camera sono i sensori giusti.');
  if (b.lte && b.lte.hit) L.push('<b>Un drone 4G è passato.</b> Il suo collegamento passa dalla rete cellulare: l’RF non lo distingue da un telefono e il disturbatore non lo ferma. Servono il monitor della rete cellulare e il blocco di rete.');
  if (n.has('spy')) L.push('<b>Un drone spia ha filmato il sito ed è ripartito.</b> Non fa danni, ma le informazioni raccolte valgono: va neutralizzato mentre gira intorno.');
  if (n.has('civKill')) L.push('<b>Un drone civile è stato abbattuto.</b> Era un hobbista: andava fatto atterrare con la presa di controllo, il disturbatore o la goniometria, oppure risparmiato.');
  else if (s.civSafe) L.push(`<b>${s.civSafe} ${s.civSafe > 1 ? 'droni civili fatti atterrare' : 'drone civile fatto atterrare'} senza danni.</b> È la risposta giusta per chi vola dove non dovrebbe senza cattive intenzioni.`);
  if (n.has('pilot')) L.push('<b>La goniometria ha localizzato i piloti:</b> alcuni droni sono rientrati senza sparare un colpo.');
  if (s.react.length) L.push(`Tempo medio tra rilevamento e neutralizzazione: <b>${fmt(s.react.reduce((a, c) => a + c, 0) / s.react.length, 1)} s</b>.`);
  if (!L.length) L.push('Ondata senza eventi rilevanti.');
  return L.slice(0, 8);
}

// ============================================================ fine sito, dottrine, bilancio
function siteStars() {
  const A = G.siteWaves, fk = A.reduce((s, x) => s + x.falseKill + x.debris, 0);
  return siteLost() ? 0 : G.assets.every((a) => a.hp >= a.max) && fk === 0 ? 3 : G.assets.every((a) => a.hp >= a.max * 0.6) ? 2 : 1;
}
const starStr = (n) => '★'.repeat(n) + '☆'.repeat(3 - n);
const starCol = (n) => ['#FF6B5E', '#FFB547', '#00D0B4', '#99FFCC'][n];
function siteEnd() {
  const A = G.siteWaves, lost = siteLost(), stars = siteStars(), tot = (k) => A.reduce((s, x) => s + x[k], 0), last = G.site === SITES.length - 1;
  if (!lost) {
    for (const it of G.items) { const e = (G.effStats[it.kind] = G.effStats[it.kind] || { kills: 0, cost: 0, fk: 0, n: 0 }); e.kills += it.kills; e.cost += it.cost; e.fk += it.fk; e.n++; }
    G.camp[G.site] = { stars, score: G.score - G.siteStart.score, stopped: tot('stopped'), hostile: tot('hostile'), cost: tot('cost'), grades: A.map((x) => x.grade) };
    G.chalRes = (S().chal || []).map((id) => { const [txt, f] = chalDef(id); return [id, txt, f(A)]; }); SAVE.chal = SAVE.chal || {}; SAVE.chal[G.site] = [...new Set([...(SAVE.chal[G.site] || []), ...G.chalRes.filter((c) => c[2]).map((c) => c[0])])];
    SAVE.unlocked = Math.max(SAVE.unlocked, Math.min(SITES.length - 1, G.site + 1)); SAVE.best[G.site] = Math.max(SAVE.best[G.site] || 0, stars); SAVE.reached[G.site] = S().waves.length - 1; if (last) SAVE.done = true; writeSave(SAVE);
    G.carry = Math.floor(G.budget / 2); SND.win();
  }
  G.phase = 'siteEnd'; idlePanels(); status();
  showDlg(`<div class="dlghead"><span class="grade" style="background:${starCol(stars)}">${lost ? '✕' : starStr(stars)}</span><div><span class="eyebrow">SITO ${G.site + 1} DI ${SITES.length}</span><h2>${lost ? `${S().name}: difesa caduta` : `${S().name}: difeso`}</h2></div></div>
    <div class="kpis"><div>Punti del sito<b>${G.score - G.siteStart.score}</b></div><div>Integrità<b>${G.assets.map((a) => `${a.hp}/${a.max}`).join(' · ')}</b></div><div>Droni fermati<b>${tot('stopped')}/${tot('hostile')}</b></div><div>Costo totale<b>${fmt(tot('cost'), 1)} k€</b></div></div>
    ${!lost && G.chalRes && G.chalRes.length ? `<div><h4>SFIDE DEL SITO</h4><ul>${G.chalRes.map(([, t, ok]) => `<li style="color:${ok ? 'var(--mint)' : 'var(--muted)'}">${ok ? '✓' : '✗'} ${t}</li>`).join('')}</ul></div>` : ''}
    <p>Voti per ondata: ${A.map((s, i) => `<b style="color:${s.grade[1]}">${i + 1}: ${s.grade[0]}</b>`).join(' · ')}</p>
    ${lost ? '<p>Un obiettivo ha perso tutta l’integrità. Riprova con una difesa diversa: rileggi le lezioni dell’ultima ondata.</p>'
      : last ? '' : `<p>Metà dei crediti avanzati (<b>${G.carry}</b>) passa al prossimo sito. Prima di partire scegli una <b>dottrina</b>: un vantaggio che resta per tutta la campagna.</p>
        ${unlockedAt(G.site + 1).length ? `<div><h4>SBLOCCATI PER IL PROSSIMO SITO</h4>${unlockedAt(G.site + 1).map((k) => `<span class="pill">${CAT[k].g === 'S' ? 'Sensore' : 'Effettore'}: ${CAT[k].name}</span>`).join('')}</div>` : ''}
        <p>Sbloccato anche il sito <b>${SITES[G.site + 1].name}</b>.</p>`}
    <div class="btnrow">${lost ? '<button class="btn big" id="dRetry">Riprova il sito</button><button class="btn ghost" id="dMenu">Menu</button>'
      : last ? '<button class="btn big" id="dFinal">Bilancio della campagna</button>' : '<button class="btn big" id="dPerk">Scegli una dottrina</button>'}</div>`);
  if (lost) { $('dRetry').addEventListener('click', () => { G.score = G.siteStart.score; G.carry = G.siteStart.carry; startSite(G.site, G.startWave0 || 0); }); $('dMenu').addEventListener('click', intro); }
  else if (last) $('dFinal').addEventListener('click', finalReport);
  else $('dPerk').addEventListener('click', () => perkPick(`Verso il sito ${G.site + 2}: ${SITES[G.site + 1].name}`, () => startSite(G.site + 1)));
}
function perkPick(title, then) {
  const free = PERKS.filter((p) => !G.perks.includes(p.k)), rest = free.slice(2);
  const opts = [free[0], free[1], rest.length ? rest[(G.site * 3 + G.perks.length) % rest.length] : null].filter(Boolean);
  G.phase = 'perk'; idlePanels(); status();
  showDlg(`<span class="eyebrow">DOTTRINA</span><h2>${title}</h2><p>Ogni dottrina resta attiva fino alla fine della campagna.</p>
    <div class="perks">${opts.map((p) => `<button type="button" data-k="${p.k}"><b>${p.name}</b><span>${p.desc}</span></button>`).join('')}</div>`);
  document.querySelectorAll('.perks button').forEach((b) => b.addEventListener('click', () => { G.perks.push(b.dataset.k); SAVE.perks = G.perks.slice(); writeSave(SAVE); SND.up(); then(); }));
}
function finalReport() {
  G.phase = 'final'; idlePanels(); status();
  const C = G.camp, stars = C.reduce((s, x) => s + (x ? x.stars : 0), 0), max = SITES.length * 3;
  const rows = SITES.map((s, i) => { const c = C[i]; return `<tr><td>${s.name}</td><td>${c ? `<span style="color:${starCol(c.stars)}">${starStr(c.stars)}</span>` : '—'}</td><td>${c ? c.score : '—'}</td><td>${c ? `${c.stopped}/${c.hostile}` : '—'}</td></tr>`; }).join('');
  const eff = EFF.map((k) => { const e = G.effStats[k]; if (!e) return ''; return `<tr><td>${CAT[k].name}</td><td>${e.kills}</td><td>${e.kills ? fmt(e.cost / e.kills, 2) + ' k€' : '—'}</td><td>${e.fk}</td></tr>`; }).join('');
  showDlg(`<div class="dlghead"><span class="grade" style="background:${starCol(Math.round(stars / SITES.length))}">${stars}/${max}★</span><div><span class="eyebrow">CAMPAGNA CONCLUSA</span><h2>Bilancio della difesa</h2></div></div>
    <div class="kpis"><div>Punti<b>${G.score}</b></div><div>Siti difesi<b>${C.filter(Boolean).length}/${SITES.length}</b></div><div>Droni fermati<b>${C.reduce((s, x) => s + (x ? x.stopped : 0), 0)}/${C.reduce((s, x) => s + (x ? x.hostile : 0), 0)}</b></div><div>Costo totale<b>${fmt(C.reduce((s, x) => s + (x ? x.cost : 0), 0), 1)} k€</b></div></div>
    <table class="eff"><thead><tr><th>Sito</th><th>Stelle</th><th>Punti</th><th>Droni fermati</th></tr></thead><tbody>${rows}</tbody></table>
    <table class="eff"><thead><tr><th>Effettore</th><th>Neutralizzati</th><th>Costo per drone</th><th>Falsi allarmi</th></tr></thead><tbody>${eff}</tbody></table>
    <h4>COSA PORTARSI A CASA</h4>
    <ul>
      <li><b>Nessun sensore basta da solo:</b> il radar vede ma non classifica, l’RF sente solo i droni radio, camera e acustico vedono poco lontano. La difesa nasce dalla fusione.</li>
      <li><b>Ogni contromisura ha una contromossa:</b> fibra ottica e autonomia rendono inutile il disturbo radio, la schermatura le microonde, le esche consumano le munizioni.</li>
      <li><b>Chi emette si fa trovare:</b> radar e disturbatori sono bersagli. I sensori passivi e il controllo delle emissioni contano.</li>
      <li><b>Il contesto decide le regole:</b> aerei, folla e mare cambiano cosa si può usare e dove.</li>
      <li><b>Un sistema automatico vale quanto la sua classificazione,</b> e i casi dubbi restano una decisione umana.</li>
    </ul>
    <div class="btnrow"><button class="btn big" id="dAgain">Nuova campagna</button><button class="btn ghost" id="dMenu">Menu</button></div>`);
  $('dAgain').addEventListener('click', () => newCampaign(0)); $('dMenu').addEventListener('click', intro);
}
function idlePanels() { for (const id of ['cardAbil', 'cardReq', 'cardTrack', 'cardWave', 'cardItem', 'progress']) $(id).hidden = true; G.selItem = null; G.tool = null; }
function intro() {
  idlePanels(); $('cardIntel').hidden = true; G.phase = 'intro'; G.objs = []; G.items = []; G.shots = []; G.fx = []; G.parts = []; document.body.className = ''; status(); $('progress').hidden = true; $('banner').hidden = true;
  SAVE = loadSave();
  const sites = SITES.map((s, i) => `<button type="button" data-i="${i}" ${i > SAVE.unlocked ? 'disabled' : ''}><b>${i + 1}. ${s.name}</b><span>${s.waves.length} ondate${unlockedAt(i).length && i ? ' · nuove: ' + unlockedAt(i).map((k) => CAT[k].name).join(', ') : ''}</span><i>${i > SAVE.unlocked ? 'bloccato: completa ' + SITES[i - 1].short : starStr(SAVE.best[i] || 0) + ` · sfide ${((SAVE.chal || {})[i] || []).length}/${(s.chal || []).length}` + ((SAVE.endless || {})[i] ? ` · pattuglia ${SAVE.endless[i]}` : '')}</i></button>`).join('');
  showDlg(`<span class="eyebrow">CAMPAGNA C-UAS</span><h2>Difendi sei siti dai droni</h2>
    <p>Centrale, aeroporto, stadio, porto, diga e vertice in città: cinque ondate per sito. Progetti una difesa a strati con un budget, poi la guardi lavorare: sensori ed effettori agiscono da soli, ma durante l’ondata decidi tu sui casi dubbi, usi le abilità e puoi costruire ancora.</p>
    <ul>
      <li><b>Completa un sito</b> per sbloccare il successivo, insieme a nuovi sensori ed effettori.</li>
      <li><b>Scegli da dove partire:</b> un sito sbloccato, e dentro il sito qualunque ondata che hai già raggiunto. Un sito completato sblocca la <b>pattuglia</b>, con ondate casuali senza fine.</li>
      <li><b>L’intelligence è incerta</b> e il nemico si adatta a ciò che funziona. Nel debriefing puoi rivedere l’ondata.</li>
      <li><b>Potenzia</b> le strutture fino al livello 3, che sblocca un’abilità speciale. Dopo ogni sito scegli una <b>dottrina</b>.</li>
      <li>Nelle <b>Schede</b> trovi tutti i droni, i sensori e gli effettori, con disegno, punti di forza e limiti.</li>
    </ul>
    <h4>SITI</h4><div class="sites">${sites}</div>
    <div class="btnrow"><button class="btn big" id="dGo">Nuova campagna</button><button class="btn ghost" id="dCodex">Schede di droni e difese</button></div>
    <p style="font-size:12px">Gioco didattico: portate, costi ed effetti sono semplificati per spiegare i concetti.</p>`);
  $('dGo').addEventListener('click', () => { beep(1, 0.001, 'sine', 0.0001); newCampaign(0); });
  $('dCodex').addEventListener('click', () => openCodex());
  document.querySelectorAll('.sites button').forEach((b) => b.addEventListener('click', () => pickWave(+b.dataset.i)));
}
function pickWave(i) {
  const s = SITES[i], r = SAVE.reached[i] || 0, done = (SAVE.best[i] || 0) > 0, ch = (SAVE.chal || {})[i] || [];
  if (!r && !done) return newCampaign(i, 0);
  showDlg(`<span class="eyebrow">SITO ${i + 1} DI ${SITES.length}</span><h2>${s.name}</h2>
    <p>Riparti da un’ondata già raggiunta (i crediti partono come se avessi giocato le precedenti) oppure, se hai completato il sito, prova la <b>pattuglia</b>: ondate casuali senza fine.</p>
    <div class="sites">${s.waves.map((w, k) => `<button type="button" data-w="${k}" ${k > r ? 'disabled' : ''}><b>Ondata ${k + 1}: ${w.name}</b><span>${WEATHER[w.wx].name}${w.obj ? ' · con obiettivo' : ''}</span><i>${k > r ? 'non ancora raggiunta' : 'disponibile'}</i></button>`).join('')}
      <button type="button" data-p="1" ${done ? '' : 'disabled'}><b>Pattuglia</b><span>Ondate generate, sempre più difficili</span><i>${done ? `record: ${(SAVE.endless || {})[i] || 0} ondate` : 'completa il sito per sbloccarla'}</i></button></div>
    ${(s.chal || []).length ? `<h4>SFIDE</h4><ul>${s.chal.map((id) => `<li style="color:${ch.includes(id) ? 'var(--mint)' : 'var(--muted)'}">${ch.includes(id) ? '✓' : '○'} ${chalDef(id)[0]}</li>`).join('')}</ul>` : ''}
    <div class="btnrow"><button class="btn ghost" id="dBack">Indietro</button></div>`);
  document.querySelectorAll('.sites button').forEach((b) => b.addEventListener('click', () => (b.dataset.p ? newCampaign(i, 0, 'endless') : newCampaign(i, +b.dataset.w))));
  $('dBack').addEventListener('click', intro);
}
function endlessEnd() {
  const n = G.wave, rec = (SAVE.endless || {})[G.site] || 0; G.phase = 'siteEnd'; idlePanels(); status();
  showDlg(`<span class="eyebrow">PATTUGLIA · ${S().name.toUpperCase()}</span><h2>Il sito è caduto all’ondata ${n + 1}</h2>
    <div class="kpis"><div>Ondate superate<b>${n}</b></div><div>Record<b>${rec}</b></div><div>Punti<b>${G.score}</b></div><div>Droni fermati<b>${G.siteWaves.reduce((s, x) => s + x.stopped, 0)}</b></div></div>
    <p>${n >= rec && n > 0 ? '<b>Nuovo record!</b> ' : ''}Rivedi l’ultima ondata nel debriefing per capire dove ha ceduto la difesa.</p>
    <div class="btnrow"><button class="btn big" id="dAgain">Nuova pattuglia</button><button class="btn ghost" id="dMenu">Menu</button></div>`);
  $('dAgain').addEventListener('click', () => newCampaign(G.site, 0, 'endless')); $('dMenu').addEventListener('click', intro);
}
