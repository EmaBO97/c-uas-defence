"use strict";
// ============================================================ utilità
const $ = (id) => document.getElementById(id);
const cv = $('map'), ctx = cv.getContext('2d');
let seed = 7;
const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const vrnd = Math.random;
const TAU = Math.PI * 2;
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const fmt = (v, n = 0) => (+v).toFixed(n).replace('.', ',');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const MONO = getComputedStyle(document.documentElement).getPropertyValue('--f-mono');
const DISP = getComputedStyle(document.documentElement).getPropertyValue('--f-display');

// ============================================================ audio: suoni sintetizzati (niente file esterni), ispirati a suoni reali
let AC = null, soundOn = true, MASTER = null, NOISE = null, VERB = null, TOFF = 0;
function initGraph() {
      const comp = AC.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 4; comp.connect(AC.destination);
      MASTER = AC.createGain(); MASTER.gain.value = 0.9; MASTER.connect(comp);
      // rumore bianco riutilizzabile
      NOISE = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate); const d = NOISE.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      // riverbero corto da esterno (impulso di rumore che decade)
      VERB = AC.createConvolver(); const ir = AC.createBuffer(2, AC.sampleRate * 1.6, AC.sampleRate);
      for (let c = 0; c < 2; c++) { const x = ir.getChannelData(c); for (let i = 0; i < x.length; i++) x[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / x.length, 3.2); }
      VERB.buffer = ir; const vg = AC.createGain(); vg.gain.value = 0.22; VERB.connect(vg); vg.connect(MASTER);
}
function audio() {
  if (!soundOn) return null;
  try {
    if (!AC) { AC = new (window.AudioContext || window.webkitAudioContext)(); initGraph(); }
    if (AC.state === 'suspended' && !(window.OfflineAudioContext && AC instanceof OfflineAudioContext)) AC.resume().catch(() => {});
    return AC;
  } catch { return null; }
}
// uscita con un po' di riverbero
function out(node, wet = 0.3) { node.connect(MASTER); if (wet > 0) { const g = AC.createGain(); g.gain.value = wet; node.connect(g); g.connect(VERB); } }
// inviluppo: attacco breve, decadimento esponenziale
function env(g, t, v, a, d) { g.gain.value = 0.0001; g.gain.setValueAtTime(0.0001, 0); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
// rumore filtrato: { f, f2, q, type, v, a, d, at, wet }
function noise(o) {
  const ac = audio(); if (!ac) return; const t = ac.currentTime + TOFF + (o.at || 0);
  const src = ac.createBufferSource(); src.buffer = NOISE; src.loop = true;
  const fl = ac.createBiquadFilter(); fl.type = o.type || 'bandpass'; fl.frequency.setValueAtTime(o.f || 1000, t); if (o.f2) fl.frequency.exponentialRampToValueAtTime(o.f2, t + (o.a || 0.005) + (o.d || 0.2)); fl.Q.value = o.q || 1;
  const g = ac.createGain(); env(g, t, o.v || 0.2, o.a || 0.005, o.d || 0.2);
  src.connect(fl); fl.connect(g); out(g, o.wet ?? 0.3); src.start(t, Math.random()); src.stop(t + (o.a || 0.005) + (o.d || 0.2) + 0.05);
}
// tono: { f, f2, type, v, a, d, at, wet, vib }
function tone(o) {
  const ac = audio(); if (!ac) return; const t = ac.currentTime + TOFF + (o.at || 0), dur = (o.a || 0.005) + (o.d || 0.2);
  const osc = ac.createOscillator(); osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(o.f, t); if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t + dur);
  if (o.vib) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = o.vib[0]; lg.gain.value = o.vib[1]; l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + dur + 0.05); }
  let node = osc; if (o.lp) { const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = o.lp; osc.connect(fl); node = fl; }
  const g = ac.createGain(); env(g, t, o.v || 0.1, o.a || 0.005, o.d || 0.2); node.connect(g); out(g, o.wet ?? 0.2); osc.start(t); osc.stop(t + dur + 0.05);
}
function beep(f, d = 0.08, type = 'sine', v = 0.04, f2) { tone({ f, f2, d, type, v, wet: 0.1 }); }
const later = (ms, f) => { if (soundOn) setTimeout(f, ms); };
// limita lo stesso suono a una volta ogni pochi millisecondi (sciami, raffiche)
const _last = {}; const gate = (k, ms) => { const n = performance.now(); if (n - (_last[k] || 0) < ms) return false; _last[k] = n; return true; };
const SND = {
  // contatto radar: "ping" con eco, tono diverso per tipo di drone
  detect: (t) => { if (!gate('det', 90)) return; const f = { radio: 1180, fiber: 880, swarm: 1400, heavy: 620, loiter: 1050, fpv: 4160.0, wing: 1320, stealth: 700, lte: 980, spy: 1250, raider: 820, mother: 420, decoy: 1180 }[t] || 1180;
    tone({ f, d: 0.35, v: 0.156, wet: 0.6 }); if (t === 'swarm' || t === 'mother' || t === 'fpv') tone({ f: f * 1.5, d: 0.25, v: 0.091, at: 0.09, wet: 0.6 }); },
  // struttura piazzata: tonfo metallico su terreno
  place: () => { noise({ type: 'lowpass', f: 600, v: 0.25, d: 0.12, wet: 0.1 }); tone({ f: 140, f2: 90, d: 0.15, v: 0.12, wet: 0.1 }); tone({ f: 1900, d: 0.08, v: 0.02, at: 0.02, type: 'triangle', wet: 0.2 }); },
  // decollo di un intercettore: sibilo dei motori che sale e si allontana
  launch: () => { if (!gate('launch', 120)) return; noise({ f: 900, f2: 4200, q: 2, v: 0.36, a: 0.04, d: 0.6 }); tone({ f: 380, f2: 1400, type: 'sawtooth', v: 0.05, a: 0.03, d: 0.55, lp: 2500 }); },
  // lanciareti: colpo di aria compressa
  net: () => { noise({ type: 'highpass', f: 1500, v: 0.24, d: 0.08, wet: 0.2 }); noise({ type: 'lowpass', f: 500, v: 0.16, d: 0.15 }); noise({ f: 2500, f2: 600, q: 1.5, v: 0.064, at: 0.05, d: 0.35 }); },
  // laser: ronzio elettrico e sfrigolio sul bersaglio
  zap: () => { if (!gate('zap', 140)) return; tone({ f: 120, type: 'sawtooth', v: 0.035, d: 0.18, lp: 900, wet: 0.05 }); noise({ type: 'highpass', f: 5000, v: 0.05, d: 0.15, wet: 0.05 }); },
  // disturbatore / spoofing: raffica di statica radio
  jam: () => { for (let i = 0; i < 6; i++) noise({ f: 1800 + Math.random() * 1500, q: 0.8, v: 0.204 + Math.random() * 0.08, a: 0.01, d: 0.07, at: i * 0.08, wet: 0.15 }); tone({ f: 60, type: 'square', v: 0.034, d: 0.5, lp: 400, wet: 0 }); },
  // microonde: colpo sordo con scarica elettrica
  hpm: () => { tone({ f: 95, f2: 32, d: 0.7, v: 0.18, wet: 0.4 }); noise({ type: 'highpass', f: 3000, v: 0.072, d: 0.12, wet: 0.2 }); noise({ type: 'lowpass', f: 300, v: 0.12, a: 0.01, d: 0.5, wet: 0.3 }); },
  // drone neutralizzato: urto e pezzi che cadono
  down: () => { if (!gate('down', 70)) return; noise({ type: 'lowpass', f: 1200, v: 0.308, d: 0.18 }); tone({ f: 2600, d: 0.12, v: 0.028, type: 'triangle', at: 0.04 }); noise({ f: 3000, q: 3, v: 0.07, d: 0.08, at: 0.12 }); },
  // obiettivo colpito: esplosione
  hit: () => { noise({ type: 'lowpass', f: 900, f2: 120, v: 0.36, a: 0.005, d: 1.4, wet: 0.5 }); tone({ f: 70, f2: 28, d: 1.0, v: 0.27, wet: 0.3 }); noise({ type: 'highpass', f: 2500, v: 0.09, d: 0.15, wet: 0.3 }); },
  // struttura distrutta: esplosione più piccola
  boom: () => { noise({ type: 'lowpass', f: 1200, f2: 200, v: 0.27, d: 0.9, wet: 0.45 }); tone({ f: 90, f2: 35, d: 0.6, v: 0.18, wet: 0.3 }); },
  // errore / falso allarme: segnale di errore della console
  bad: () => { tone({ f: 330, type: 'square', v: 0.056, d: 0.12, lp: 1500, wet: 0.05 }); tone({ f: 247, type: 'square', v: 0.056, d: 0.2, lp: 1500, at: 0.14, wet: 0.05 }); },
  // allarme: bip di avviso della sala operativa
  alarm: () => { if (!gate('alarm', 400)) return; for (let i = 0; i < 3; i++) tone({ f: 1050, type: 'square', v: 0.078, a: 0.005, d: 0.07, at: i * 0.13, lp: 3000, wet: 0.1 }); },
  // abilità / ordine via radio: clic del microfono e gracchio
  ability: () => { noise({ type: 'highpass', f: 2000, v: 0.12, d: 0.03, wet: 0 }); noise({ f: 1800, q: 1.2, v: 0.06, a: 0.02, d: 0.22, at: 0.03, wet: 0.1 }); tone({ f: 1000, d: 0.12, v: 0.025, at: 0.05, type: 'triangle' }); noise({ type: 'highpass', f: 2000, v: 0.1, d: 0.03, at: 0.28, wet: 0 }); },
  // potenziamento: servomotore e scatto
  up: () => { tone({ f: 220, f2: 480, type: 'sawtooth', v: 0.03, a: 0.02, d: 0.25, lp: 1200, wet: 0.1 }); noise({ type: 'highpass', f: 3000, v: 0.12, d: 0.025, at: 0.28, wet: 0.1 }); },
  // il drone madre rilascia lo sciame: ronzio di tanti rotori
  release: () => { for (let i = 0; i < 4; i++) tone({ f: 170 + i * 23, type: 'sawtooth', v: 0.04, a: 0.15, d: 0.9, lp: 1400, vib: [28 + i * 3, 6], wet: 0.3 }); },
  // munizione in picchiata: fischio discendente
  dive: () => tone({ f: 1500, f2: 420, d: 1.1, v: 0.08, vib: [9, 15], wet: 0.4 }),
  // fine sito: tre toni della console
  win: () => { [659, 880, 1175].forEach((f, i) => tone({ f, d: 0.35, v: 0.075, at: i * 0.12, type: 'triangle', wet: 0.4 })); },
  // aereo di linea: rombo dei motori che passa
  plane: () => { noise({ type: 'lowpass', f: 300, f2: 900, q: 0.7, v: 0.25, a: 1.5, d: 4, wet: 0.5 }); tone({ f: 2200, f2: 1800, v: 0.03, a: 1.2, d: 3.5, wet: 0.4 }); },
  // elisoccorso: pale del rotore
  heli: () => { for (let i = 0; i < 24; i++) noise({ type: 'lowpass', f: 350, v: 0.32 * Math.min(1, i / 6) * Math.min(1, (24 - i) / 6), a: 0.004, d: 0.05, at: i * 0.075, wet: 0.2 }); },
};

// ============================================================ ambiente sonoro: vento, ronzio dei rotori e battito che crescono con la minaccia
const MUSIC = { on: false, n: null, beat: 0,
  start() { if (this.on) return; const ac = audio(); if (!ac) return; try {
    const g = ac.createGain(); g.gain.value = 0; g.connect(MASTER);
    const wind = ac.createBufferSource(); wind.buffer = NOISE; wind.loop = true; const wf = ac.createBiquadFilter(); wf.type = 'bandpass'; wf.frequency.value = 450; wf.Q.value = 0.6; const wg = ac.createGain(); wg.gain.value = 0.05;
    wind.connect(wf); wf.connect(wg); wg.connect(g);
    const buzz = ac.createOscillator(); buzz.type = 'sawtooth'; buzz.frequency.value = 185; const bf = ac.createBiquadFilter(); bf.type = 'bandpass'; bf.frequency.value = 700; bf.Q.value = 2;
    const trem = ac.createOscillator(), tg = ac.createGain(), bg = ac.createGain(); trem.frequency.value = 23; tg.gain.value = 0.5; bg.gain.value = 0; trem.connect(tg); tg.connect(bg.gain);
    buzz.connect(bf); bf.connect(bg); bg.connect(g);
    const pad = ac.createOscillator(); pad.type = 'sine'; pad.frequency.value = 55; const pg = ac.createGain(); pg.gain.value = 0.25; pad.connect(pg); pg.connect(g);
    wind.start(); buzz.start(); trem.start(); pad.start();
    this.n = { g, wf, bg, buzz, srcs: [wind, buzz, trem, pad] }; this.on = true; this.beat = 0; } catch {} },
  set(level, dt) { if (!this.on) return; try { const n = this.n, t = AC.currentTime;
    n.g.gain.setTargetAtTime(soundOn ? 0.35 : 0, t, 0.8); n.wf.frequency.setTargetAtTime(400 + 300 * Math.sin(t * 0.2), t, 1.5);
    n.bg.gain.setTargetAtTime(0.06 * level, t, 0.5); n.buzz.frequency.setTargetAtTime(170 + 50 * level, t, 0.8);
    this.beat -= dt; if (level > 0.05 && this.beat <= 0) { this.beat = 1.3 - 0.85 * level; tone({ f: 62, f2: 45, d: 0.22, v: 0.08 + 0.12 * level, wet: 0.1 }); } } catch {} },
  stop() { if (!this.on) return; this.on = false; try { const n = this.n; n.g.gain.setTargetAtTime(0, AC.currentTime, 0.3); setTimeout(() => { for (const x of n.srcs) try { x.stop(); } catch {} }, 1500); } catch {} },
};

// anteprima dei suoni (usata dai test): li suona uno dopo l'altro in un contesto offline e restituisce un WAV
async function soundPreview(names) {
  const sr = 44100, step = 2.2, ctxO = new OfflineAudioContext(2, sr * step * names.length, sr), prev = AC;
  AC = ctxO; initGraph(); for (const k in _last) delete _last[k];
  names.forEach((k, i) => { TOFF = i * step; SND[k](); }); TOFF = 0;
  const buf = await ctxO.startRendering(); AC = prev; if (prev) initGraph();
  const L = buf.getChannelData(0), R = buf.getChannelData(1), peaks = names.map((k, i) => { let m = 0; for (let j = Math.floor(i * step * sr); j < Math.floor((i + 1) * step * sr); j++) m = Math.max(m, Math.abs(L[j]), Math.abs(R[j])); return [k, +m.toFixed(3)]; });
  const n = L.length, b = new DataView(new ArrayBuffer(44 + n * 4)), w = (o, s) => [...s].forEach((c, i) => b.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); b.setUint32(4, 36 + n * 4, true); w(8, 'WAVEfmt '); b.setUint32(16, 16, true); b.setUint16(20, 1, true); b.setUint16(22, 2, true); b.setUint32(24, sr, true); b.setUint32(28, sr * 4, true); b.setUint16(32, 4, true); b.setUint16(34, 16, true); w(36, 'data'); b.setUint32(40, n * 4, true);
  for (let i = 0; i < n; i++) { b.setInt16(44 + i * 4, Math.max(-1, Math.min(1, L[i])) * 32767, true); b.setInt16(46 + i * 4, Math.max(-1, Math.min(1, R[i])) * 32767, true); }
  let bin = ''; const u = new Uint8Array(b.buffer); for (let i = 0; i < u.length; i += 0x8000) bin += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
  return { peaks, wav: btoa(bin) };
}
