// Test del gioco: node test-strategie.js (nella cartella con test.html e bot.js).
// 1) per ogni sito gioca una difesa ingenua e una ragionata, e controlla che la prima perda e la seconda prenda 3 stelle;
// 2) gioca la campagna intera di fila, con dottrine e crediti riportati come in una partita vera;
// 3) salva gli screenshot in shots/ e segnala gli errori JavaScript.
const { chromium } = require('playwright');
const fs = require('fs');
const { runSite } = require('./bot.js');
const pol = { rid: true, repair: true, alert: true, reload: true, emcon: true, req: true, civ: true };
const { SMART, NAIVE, START } = require('./plans.js');

(async () => {
  fs.mkdirSync('shots', { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + process.cwd() + '/test.html'); await p.waitForTimeout(600);
  await p.screenshot({ path: 'shots/01-menu.png' });
  let ok = true; const check = (cond, msg) => { console.log((cond ? '  OK  ' : '  KO  ') + msg); if (!cond) ok = false; };

  console.log('== Siti singoli');
  for (let s = 0; s < 6; s++) {
    for (const [name, plan] of [['ingenua', { site: s, w: NAIVE[s] }], ['ragionata', { site: s, pol, ...START[s], w: SMART[s] }]]) {
      const r = await runSite(p, s, plan); const last = r[r.length - 1];
      console.log(`-- sito ${s + 1}, difesa ${name}\n   ` + r.join('\n   '));
      if (name === 'ingenua') check(last.includes('✕') || last.includes('★☆☆'), `sito ${s + 1}: la difesa ingenua non regge`);
      else check(last.includes('★★★'), `sito ${s + 1}: la difesa ragionata prende 3 stelle`);
    }
  }

  console.log('== Campagna completa');
  await p.evaluate(() => { window.__g.intro(); }); await p.waitForTimeout(100);
  await p.click('#dGo');
  await p.evaluate(() => { localStorage.clear(); }); let total = 0;
  for (let s = 0; s < 6; s++) {
    await p.screenshot({ path: `shots/1${s}-briefing.png` });
    const r = await runSite(p, s, { site: s, pol, chain: true, w: SMART[s] });
    console.log(`-- sito ${s + 1} (dottrine: ${await p.evaluate(() => window.__g.G.perks.join(','))})\n   ` + r.join('\n   '));
    total += (r[r.length - 1].match(/★/g) || []).length;
    await p.screenshot({ path: `shots/1${s}-bilancio.png` });
    if (!(await p.$('#dPerk')) && s < 5) { console.log('   campagna interrotta: sito perso'); break; }
    if (s < 5) {
      await p.click('#dPerk'); await p.waitForTimeout(100);
      if (s === 0) await p.screenshot({ path: 'shots/15-dottrina.png' });
      await p.evaluate(() => { const pref = ['fondi', 'guida', 'manut', 'rete', 'riserva', 'fusione', 'addestr', 'logist']; const bs = [...document.querySelectorAll('.perks button')]; (pref.map((k) => bs.find((x) => x.dataset.k === k)).find(Boolean) || bs[0]).click(); });
    } else if (await p.$('#dFinal')) await p.click('#dFinal');
  }
  await p.waitForTimeout(200); await p.screenshot({ path: 'shots/19-finale.png' });
  check(total >= 16, `campagna completa: ${total} stelle su 18`);

  console.log('== Ripartenza da un’ondata');
  const re = await p.evaluate(() => { const H = window.__g; H.intro(); H.pickWave(0); const n = document.querySelectorAll('.sites button[data-w]:not([disabled])').length; document.querySelectorAll('.sites button[data-w]')[2].click(); return { n, wave: H.G.wave, budget: H.G.budget }; });
  check(re.n === 5 && re.wave === 2 && re.budget > 100, `dopo aver finito la Centrale si riparte dall'ondata 3 (${re.n} ondate disponibili, crediti ${re.budget})`);
  await p.screenshot({ path: 'shots/18-ripartenza.png' });
  console.log('== Pattuglia');
  const pat = await p.evaluate(() => {
    const H = window.__g, G = H.G; H.newCampaign(1, 0, 'endless'); document.getElementById('dGo').click();
    for (const [k, x, y] of [['radar', -150, 120], ['rf', 120, 60], ['hangar', 100, -60], ['hangar', -100, -60], ['acu', -130, 140], ['camera', 0, 260]]) H.place(k, x, y);
    let w = 0;
    while (w < 12) { H.startWave(); let g = 0; while (G.phase === 'wave' && g++ < 20000) H.step(0.02); w++; const b = document.getElementById('dNext'); if (!b || /Fine/.test(b.textContent)) break; b.click(); }
    return { waves: w, intel: !!document.getElementById('btnIntel') };
  });
  check(pat.waves >= 1, `pattuglia: ondate generate giocate senza errori (${pat.waves})`);
  await p.screenshot({ path: 'shots/16-pattuglia.png' });
  await p.evaluate(() => { const H = window.__g; if (H.G.rec && H.G.rec.frames.length) H.startReplay(); });
  await p.waitForTimeout(1500); await p.screenshot({ path: 'shots/16-replay.png' });
  await p.evaluate(() => { const b = document.getElementById('rBack'); if (b) b.click(); });
  console.log('== Schede');
  for (const t of ['threats', 'sens', 'eff']) { await p.evaluate((t) => window.__g.openCodex(t), t); await p.waitForTimeout(400); await p.screenshot({ path: `shots/17-schede-${t}.png` }); }
  await p.evaluate(() => window.__g.closeCodex());
  console.log('== Screenshot dal vivo');
  for (let s = 0; s < 6; s++) {
    await p.evaluate(({ s, w }) => { const H = window.__g, G = H.G; G.mode = 'campaign'; G.perks = ['fondi', 'guida', 'manut', 'rete', 'riserva'].slice(0, s); G.carry = 60; H.startSite(s); document.getElementById('dGo').click(); for (const a of w) if (a[0] === 'up') H.upgrade(G.items[a[1]]); else H.place(a[0], a[1], a[2]); }, { s, w: SMART[s][0].concat(SMART[s][1] || []).filter((a) => a[0] !== 'base' && a[0] !== 'up') });
    await p.waitForTimeout(250); await p.screenshot({ path: `shots/2${s}-setup.png` });
    await p.evaluate(() => { const H = window.__g; H.G.selItem = H.G.items[0]; }); await p.waitForTimeout(400); await p.screenshot({ path: `shots/2${s}-struttura.png` });
    await p.evaluate(() => { const H = window.__g; H.G.selItem = null; H.startWave(); for (let i = 0; i < 1500; i++) H.step(0.02); const G = H.G, o = G.objs.find((x) => H.visible(x) && TYPESOK(x)); function TYPESOK(x) { return x.type !== 'bird' && x.type !== 'plane'; } if (o) G.sel = o.id; });
    await p.waitForTimeout(700); await p.screenshot({ path: `shots/3${s}-ondata.png` });
    await p.evaluate(() => { const H = window.__g, G = H.G; let g = 0; while (G.phase === 'wave' && g++ < 20000) H.step(0.02); });
    await p.waitForTimeout(300); await p.screenshot({ path: `shots/4${s}-debriefing.png` });
  }
  await p.setViewportSize({ width: 420, height: 900 }); await p.waitForTimeout(300); await p.screenshot({ path: 'shots/50-telefono.png', fullPage: true });

  console.log('errori JavaScript:', errs.join(' | ') || 'nessuno');
  check(!errs.length, 'nessun errore JavaScript');
  console.log(ok ? 'TUTTO OK' : 'CI SONO PROBLEMI');
  await b.close();
})();
