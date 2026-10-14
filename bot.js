// Giocatore automatico per i test: piazza, potenzia e (se la politica lo prevede) usa abilità e decisioni come farebbe un umano attento.
module.exports.runSite = async function (p, site, plan) {
  return p.evaluate(({ site, plan }) => {
    const H = window.__g, G = H.G, out = [];
    if (!plan.chain) { G.perks = plan.perks || []; G.score = 0; G.carry = plan.carry || 0; H.startSite(site, plan.from || 0); }
    H.setRoe(plan.roe || 'prudenti'); document.getElementById('dGo').click();
    const pol = plan.pol || {};
    function bot() {
      if (pol.rid) for (const o of G.objs) if (o.alive && o.ridOff && !o.deny) H.setDeny(o);
      if (pol.repair && G.items.some((i) => i.dmg || i.fault)) H.useAbility('repair');
      const near = (r) => G.objs.some((o) => o.alive && H.visible(o) && o.cls === 'hostile' && Math.min(...G.assets.map((a) => Math.hypot(o.x - a.x, o.y - a.y))) < r);
      if (pol.alert && near(650)) H.useAbility('alert');
      if (pol.reload && G.items.filter((i) => H.CAT[i.kind].g === 'E' && i.cd > 1.5).length >= 2 && near(450)) H.useAbility('reload');
      if (pol.emcon) for (const it of G.items) if (H.CAT[it.kind].emit) {
        const hunted = G.objs.some((o) => o.alive && o.type === 'loiter' && o.tg === it && o.mode !== 'cruise' && H.visible(o));
        if (hunted && !it.off) H.toggleEmit(it);
        else if (it.off && !G.objs.some((o) => o.alive && o.type === 'loiter' && Math.hypot(o.x - it.x, o.y - it.y) < 700)) H.toggleEmit(it);
      }
      if (pol.civ) for (const o of G.objs) if (o.alive && !o.deny && !o.prio && o.type !== 'mother' && (o.cls === 'civ' || (o.cls === 'drone' && Math.hypot(o.vx, o.vy) < 16 && o.mode !== 'orbit')) && H.visible(o)) H.setDeny(o);
      if (pol.req) for (const o of G.objs) if (H.needsAuth(o)) { if (o.ridOff) H.setDeny(o); else if (Math.hypot(o.vx, o.vy) < 15) H.setDismiss(o); else if (Math.min(...G.assets.map((a) => Math.hypot(o.x - a.x, o.y - a.y))) < 380) H.setPrio(o); }
    }
    for (let w = G.wave; w < 99; w++) {
      for (const a of plan.w[w] || []) {
        if (a[0] === 'base') H.baseConfig();
        else if (a[0] === 'up') { if (!H.upgrade(G.items[a[1]])) out.push('UP FAIL ' + a); }
        else if (a[0] === 'roe') H.setRoe(a[1]);
        else { const n0 = G.items.length; H.place(a[0], a[1], a[2]); if (G.items.length === n0) out.push('PLACE FAIL ' + a + ' ' + document.getElementById('hint').textContent); }
      }
      const b0 = G.budget;
      H.startWave(); let g = 0; while (G.phase === 'wave' && g++ < 20000) { H.step(0.02); if (g % 2 === 0) bot(); }
      const s = G.ws; if (pol.dbg) out.push('   items ' + G.items.map((i) => `${i.kind}${i.lv}@${i.x|0},${i.y|0}:${i.kills}/${i.uses}`).join(' '));
      out.push(`w${w + 1} ${s.grade ? s.grade[0] : '?'} t=${G.t.toFixed(0)} cr=${b0}→${G.budget} fermati ${s.stopped}/${s.hostile} colpi=${s.hits} falsi=${s.falseKill} detriti=${s.debris} strutt=${s.structLost} esche:${s.decoyKill}/${s.decoys} spreco=${s.decoyWaste} int=${G.integrity} costo=${s.cost.toFixed(1)} abil=${s.abil} note=${[...s.notes].join(',')} hold=${[...s.holds].join(',')} ` +
        Object.entries(s.byType).map(([k, v]) => `${k}:${v.stopped}/${v.n}${v.hit ? '!' + v.hit : ''}`).join(' ') + (s.log.length ? ' | ' + s.log.join('; ') : ''));
      if (G.phase !== 'debrief') { out.push('stuck ' + G.phase); return out; }
      const btn = document.getElementById('dNext'); const lastW = btn.textContent.includes('Bilancio');
      btn.click(); if (lastW) break;
    }
    out.push(`SITO ${document.querySelector('#dlg .grade').textContent} punti ${G.score} credito finale ${G.budget}`);
    return out;
  }, { site, plan });
};
