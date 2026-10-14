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

// ============================================================ audio
let AC = null, soundOn = true;
function beep(f, d = 0.08, type = 'sine', v = 0.04, f2) {
  if (!soundOn) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime;
    o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + d + 0.02);
  } catch {}
}
const later = (ms, f) => { if (soundOn) setTimeout(f, ms); };
const SND = {
  detect: (t) => { const f = { radio: 1250, fiber: 900, swarm: 1500, heavy: 600, loiter: 1100, fpv: 1700, wing: 1400, stealth: 700, lte: 1000, spy: 1300, raider: 800, mother: 300, decoy: 1250 }[t] || 1250;
    beep(f, 0.06, t === 'heavy' || t === 'mother' ? 'triangle' : 'sine', 0.03); if (t === 'swarm' || t === 'mother' || t === 'fpv') later(80, () => beep(f * 1.25, 0.05, 'sine', 0.025)); }, place: () => beep(520, 0.08, 'triangle', 0.05, 780), launch: () => beep(300, 0.25, 'sawtooth', 0.025, 900),
  zap: () => beep(1800, 0.2, 'square', 0.015, 600), jam: () => beep(140, 0.5, 'sawtooth', 0.03, 90), hpm: () => beep(90, 0.6, 'sine', 0.08, 40),
  down: () => beep(660, 0.12, 'triangle', 0.05, 990), hit: () => beep(70, 0.7, 'sawtooth', 0.09, 30), bad: () => beep(220, 0.3, 'square', 0.03, 150),
  alarm: () => { beep(880, 0.09, 'square', 0.022); later(120, () => beep(660, 0.12, 'square', 0.022)); },
  ability: () => beep(380, 0.35, 'triangle', 0.05, 1200), up: () => { beep(520, 0.08, 'triangle', 0.05); later(90, () => beep(780, 0.12, 'triangle', 0.05)); },
  boom: () => beep(55, 0.9, 'sawtooth', 0.1, 25), release: () => beep(210, 0.4, 'sawtooth', 0.03, 520), dive: () => beep(900, 0.6, 'sine', 0.03, 300),
  win: () => { [523, 659, 784, 1046].forEach((f, i) => later(i * 110, () => beep(f, 0.18, 'triangle', 0.05))); },
};

// ============================================================ musica di tensione (cresce con la minaccia)
const MUSIC = { on: false, n: null, beat: 0,
  start() { if (!soundOn || this.on) return; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const g = AC.createGain(), f = AC.createBiquadFilter(), o1 = AC.createOscillator(), o2 = AC.createOscillator();
    g.gain.value = 0; f.type = 'lowpass'; f.frequency.value = 300; o1.type = 'sine'; o2.type = 'triangle'; o1.frequency.value = 55; o2.frequency.value = 82.4;
    o1.connect(f); o2.connect(f); f.connect(g); g.connect(AC.destination); o1.start(); o2.start(); this.n = { g, f, o1, o2 }; this.on = true; this.beat = 0; } catch {} },
  set(level, dt) { if (!this.on) return; try { const n = this.n, t = AC.currentTime; n.g.gain.setTargetAtTime(soundOn ? 0.012 + 0.03 * level : 0, t, 0.6); n.f.frequency.setTargetAtTime(300 + 1000 * level, t, 0.6); n.o2.frequency.setTargetAtTime(82.4 * (1 + 0.06 * level), t, 1);
    this.beat -= dt; if (level > 0.05 && this.beat <= 0) { this.beat = 1.25 - 0.85 * level; beep(110, 0.12, 'sine', 0.018 + 0.03 * level, 70); } } catch {} },
  stop() { if (!this.on) return; this.on = false; try { const n = this.n; n.g.gain.setTargetAtTime(0, AC.currentTime, 0.3); setTimeout(() => { try { n.o1.stop(); n.o2.stop(); } catch {} }, 1500); } catch {} },
};
