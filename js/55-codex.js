// ============================================================ schede: droni, sensori, effettori
const CODEX = {
  // ---- minacce
  radio:   { pro: ['Economico e facile da trovare', 'Pilotato da lontano via radio'], con: ['Il collegamento radio si sente e si disturba', 'Il pilota si può localizzare'], use: 'Sensore RF, disturbatore, presa di controllo, goniometria.' },
  fiber:   { pro: ['Nessuna emissione radio: l’RF è cieco', 'Vola basso, nascosto da boschi e onde'], con: ['Il cavo limita la distanza', 'Si sente con l’acustico e si vede con la camera'], use: 'Acustico, camera, infrarosso, radar bassa quota; poi intercettori, laser, reti.' },
  swarm:   { pro: ['Tanti bersagli insieme saturano gli effettori singoli', 'Autonomo: niente radio da disturbare'], con: ['Ogni drone è piccolo e fragile', 'Naviga col GNSS'], use: 'Microonde, spoofing GNSS; infrarosso per classificarlo.' },
  heavy:   { pro: ['Due punti vita e danno doppio', 'Schermato contro le microonde'], con: ['Lento', 'Grande: il radar lo vede bene'], use: 'Laser, intercettori (anche veloci), reti e drone cacciatore; microonde solo al livello 3.' },
  loiter:  { pro: ['Cerca radar e disturbatori accesi', 'Gira intorno e poi si tuffa a 62 m/s'], con: ['Se l’emettitore si spegne perde il bersaglio', 'Naviga col GNSS'], use: 'Spegnere le emissioni, radar passivo, effettori vicino agli emettitori, spoofing.' },
  raider:  { pro: ['Non punta la base ma le tue difese: sensori ed effettori', 'Veloce e autonomo'], con: ['Piccolo e fragile', 'Naviga col GNSS'], use: 'Effettori vicino alle strutture (lanciareti, drone cacciatore, microonde), spoofing GNSS, squadra tecnica per riparare.' },
  mother:  { pro: ['Dieci punti vita, schermato, link cifrato', 'Rilascia sciami da tre droni'], con: ['Molto lento', 'Enorme sul radar'], use: 'Laser, intercettori veloci e normali puntati presto; microonde per gli sciami che rilascia.' },
  fpv:     { pro: ['Velocissimo (46 m/s): pochi secondi per reagire', 'Vola basso'], con: ['Pilotato via radio', 'Fragile'], use: 'Disturbatore e presa di controllo vicino al sito; acustico e radar bassa quota per vederlo.' },
  wing:    { pro: ['Veloce e alto: l’acustico lo sente poco', 'Gli intercettori normali spesso lo mancano'], con: ['Grande sul radar', 'Naviga col GNSS'], use: 'Intercettore veloce, spoofing GNSS; il laser ci mette di più a bruciarlo.' },
  stealth: { pro: ['Il radar lo vede solo da vicino', 'Autonomo, niente radio'], con: ['Scalda come ogni drone', 'Fa rumore'], use: 'Radar passivo, infrarosso, acustico, camera; spoofing GNSS.' },
  lte:     { pro: ['Il collegamento passa dalla rete 4G: per l’RF è un telefono', 'Il disturbatore non lo ferma'], con: ['L’operatore telefonico lo può individuare e bloccare'], use: 'Monitor della rete cellulare e blocco di rete; oppure effettori cinetici.' },
  spy:     { pro: ['Non attacca: gira a 450 m e filma per 20 s', 'Se riparte con le immagini perdi punti'], con: ['Pilotato via radio', 'Resta a lungo nella stessa zona'], use: 'Qualunque effettore con portata sufficiente; disturbatore e presa di controllo lo fanno atterrare.' },
  decoy:   { pro: ['Costa poco e fa sprecare munizioni care', 'Per l’RF sembra un drone vero'], con: ['È vuota: arrivata sul sito non fa danni'], use: 'Camera o vedetta per riconoscerla; disturbatore per fermarla gratis.' },
  civil:   { pro: ['Non è una minaccia, ma vola dove non dovrebbe', 'Senza Remote ID sembra un drone qualunque'], con: ['Abbatterlo è un falso allarme'], use: 'Presa di controllo, disturbatore o goniometria: atterra intero. Oppure “Non ingaggiare”.' },
  auth:    { pro: ['Lavora per il sito: ispezioni, polizia, sicurezza'], con: ['Le armi ad area lo colpiscono comunque', 'Se perde il Remote ID il sistema non lo riconosce'], use: 'Tieni lontane le armi ad area dalla sua rotta, o portale al livello 3; camera per riconoscerlo.' },
  bird:    { pro: ['Sul radar è uguale a un drone piccolo'], con: ['Va piano (11 m/s) e cambia direzione di continuo'], use: 'Camera, vedetta, infrarosso o micro-Doppler per riconoscerlo. Regole aggressive = rischio.' },
  plane:   { pro: ['Ha il transponder: il sistema lo conosce'], con: ['Disturbatore, spoofing e microonde non possono lavorare vicino'], use: 'Usa intercettori, reti e presa di controllo nel corridoio di volo.' },
  // ---- sensori
  radar:   { pro: ['Grande portata, vede tutto ciò che vola', 'Base di ogni difesa'], con: ['Non classifica', 'Cieco ai droni bassi su boschi e acqua', 'Emette: attira le munizioni circuitanti'] },
  rf:      { pro: ['Classifica i droni radio come ostili', 'Riconosce il Remote ID', 'Passivo'], con: ['Cieco a fibra ottica, droni autonomi e 4G', 'In città lo spettro affollato lo confonde'] },
  camera:  { pro: ['Identifica tutto: ostili, uccelli, autorizzati, civili, esche', 'Aiuta il laser'], con: ['Portata corta', 'Notte e nebbia la accorciano'] },
  acu:     { pro: ['Costa pochissimo', 'Sente anche fibra ottica e droni nei boschi'], con: ['Portata cortissima', 'Pioggia e vento lo assordano', 'Sente poco i droni alti'] },
  scout:   { pro: ['Va a vedere: identifica tracce lontane dai sensori fissi', 'Riconosce esche, civili e autorizzati'], con: ['Un drone alla volta (due al livello 3)', 'Deve arrivare a 150 m dalla traccia', 'Notte e nebbia gli accorciano la vista'] },
  vedetta: { pro: ['Costa quasi niente', 'Riconosce come una camera'], con: ['Deve guardare per 2 s', 'Di notte e nella nebbia vede pochissimo'] },
  irst:    { pro: ['Vede di notte come di giorno', 'Vede droni bassi e furtivi', 'Distingue uccelli e droni', 'Passivo'], con: ['Non capisce l’intenzione', 'Nebbia e pioggia lo accorciano'] },
  lowradar:{ pro: ['Vede i droni bassi su boschi e acqua', 'Aggiornamento continuo'], con: ['Portata media', 'Non classifica', 'Emette'] },
  pradar:  { pro: ['Non emette: le munizioni circuitanti non lo trovano', 'Vede i droni furtivi'], con: ['Non classifica', 'Come il radar, non vede i droni bassi su boschi e acqua'] },
  cell:    { pro: ['Trova e classifica i droni 4G', 'Passivo'], con: ['Non vede nient’altro', 'Serve l’accordo con l’operatore'] },
  // ---- effettori
  jam:     { pro: ['Ad area e gratuito', 'Il drone atterra intero: va bene anche per i civili'], con: ['Solo droni radio', 'Colpisce anche gli autorizzati', 'Emette', 'Fermo vicino agli aerei'] },
  hangar:  { pro: ['Funziona su tutti i droni', 'Grande portata'], con: ['Costa a ogni lancio', 'Lento ad arrivare', 'Spesso manca l’ala fissa', 'Non sopra la folla'] },
  hpm:     { pro: ['Ferma un intero sciame in un colpo'], con: ['Portata cortissima', 'Inutile sugli schermati', 'Colpisce anche gli autorizzati', 'Fermo vicino a folla e aerei'] },
  net:     { pro: ['Costa poco', 'Cattura senza detriti, anche i pesanti'], con: ['Portata cortissima', 'Pochi colpi per ondata'] },
  laser:   { pro: ['Costo per colpo quasi nullo', 'Preciso: un bersaglio alla volta'], con: ['Deve restare puntato', 'Nebbia', 'Non nel corridoio di volo né sopra la folla'] },
  takeover:{ pro: ['Il drone atterra intero: zero danni intorno', 'Perfetto per i civili e sopra la folla'], con: ['Serve il sensore RF', 'Inutile su fibra, autonomi, 4G e link cifrati', 'Un bersaglio alla volta'] },
  netdrone:{ pro: ['Cattura senza detriti: lavora sopra la folla', 'Prende anche i pesanti'], con: ['Più lento dell’intercettore', 'Costa a ogni lancio'] },
  longint: { pro: ['Velocissimo e con grande portata', 'Due punti vita a colpo'], con: ['Caro: 8 k€ a lancio', 'Non sopra la folla'] },
  spoof:   { pro: ['Ad area contro sciami, pesanti, munizioni, ala fissa, furtivi'], con: ['Inutile su droni radio, fibra e drone madre', 'Colpisce anche gli autorizzati', 'Emette', 'Fermo vicino agli aerei'] },
  netblock:{ pro: ['Ferma i droni 4G senza danni', 'Grande portata'], con: ['Serve il monitor della rete cellulare', 'Inutile su tutto il resto'] },
};
const THREATS = ['radio', 'fiber', 'swarm', 'heavy', 'loiter', 'raider', 'fpv', 'wing', 'stealth', 'lte', 'spy', 'mother', 'decoy', 'civil', 'auth', 'bird', 'plane'];
const FIRST = {}; SITES.forEach((s, i) => s.waves.forEach((w, k) => w.spawn.forEach(([t]) => { if (FIRST[t] === undefined) FIRST[t] = [i, k]; })));

// ---- illustrazioni
function artQuad(c, x, y, s, col, rot = 0, t = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = Math.max(1.2, s * 0.12);
  c.beginPath(); c.moveTo(-s, -s); c.lineTo(s, s); c.moveTo(s, -s); c.lineTo(-s, s); c.stroke();
  for (const [a, b] of [[-s, -s], [s, -s], [s, s], [-s, s]]) { c.globalAlpha = 0.35; c.beginPath(); c.arc(a, b, s * 0.55, 0, TAU); c.fill(); c.globalAlpha = 1; c.beginPath(); c.arc(a, b, s * 0.55, t * 9, t * 9 + 2); c.stroke(); }
  c.fillRect(-s * 0.35, -s * 0.35, s * 0.7, s * 0.7); c.restore();
}
function artMast(c, x, y, h, col = '#4C6B7A') { c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - h); c.stroke(); c.fillStyle = col; c.fillRect(x - 10, y - 3, 20, 4); }
function waves(c, x, y, a0, a1, n, r0, dr, col, dash) { c.strokeStyle = col; c.lineWidth = 1.6; if (dash) c.setLineDash(dash); for (let i = 0; i < n; i++) { c.globalAlpha = 1 - i / (n + 1); c.beginPath(); c.arc(x, y, r0 + i * dr, a0, a1); c.stroke(); } c.globalAlpha = 1; c.setLineDash([]); }
function artWing(c, x, y, s, col) { c.save(); c.translate(x, y); c.fillStyle = col; c.beginPath(); c.moveTo(s * 1.4, 0); c.lineTo(-s, -s * 1.6); c.lineTo(-s * 0.6, 0); c.lineTo(-s, s * 1.6); c.closePath(); c.fill(); c.fillRect(-s * 1.4, -s * 0.15, s * 2.6, s * 0.3); c.restore(); }
function artPerson(c, x, y, col) { c.fillStyle = col; c.beginPath(); c.arc(x, y - 30, 7, 0, TAU); c.fill(); c.fillRect(x - 7, y - 22, 14, 22); c.fillRect(x - 6, y, 5, 14); c.fillRect(x + 1, y, 5, 14); }
function artTower(c, x, y, col) { c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 14, y); c.lineTo(x, y - 60); c.lineTo(x + 14, y); c.moveTo(x - 9, y - 20); c.lineTo(x + 9, y - 20); c.moveTo(x - 5, y - 40); c.lineTo(x + 5, y - 40); c.stroke(); waves(c, x, y - 60, -2.4, -0.7, 3, 8, 7, col); }
function drawArt(c, key, W, H, t) {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#13232D'); g.addColorStop(1, '#0A1118'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.strokeStyle = 'rgba(153,255,204,0.06)'; c.lineWidth = 1; for (let x = 0; x < W; x += 20) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = 0; y < H; y += 20) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  const gy = H - 22; c.fillStyle = '#16262F'; c.fillRect(0, gy, W, 22);
  const col = CAT[key] ? CAT[key].col : key === 'bird' ? '#99FFCC' : key === 'auth' ? '#3DB8F5' : key === 'civil' ? '#9FDBFA' : key === 'decoy' ? '#B48CFF' : key === 'plane' ? '#E6EDF2' : '#FF6B5E';
  const cx = W / 2, cy = H / 2 - 8, q = (x, y, s, cc = col, r = 0) => artQuad(c, x, y, s, cc, r, t);
  switch (key) {
    case 'radio': q(cx + 30, cy - 10, 12); c.fillStyle = '#8A9AA6'; c.fillRect(40, gy - 18, 22, 14); waves(c, 51, gy - 18, -1.4, -0.4, 4, 10, 12, '#99FFCC'); break;
    case 'fiber': q(cx + 40, gy - 34, 11); c.strokeStyle = '#E6EDF2'; c.lineWidth = 1; c.beginPath(); c.moveTo(cx + 40, gy - 30); for (let x = cx + 40; x > 30; x -= 8) c.lineTo(x, gy - 22 + Math.sin(x * 0.3 + t * 3) * 4); c.stroke(); for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(40,80,60,0.9)'; c.beginPath(); c.arc(60 + i * 26, gy - 4, 14, 0, TAU); c.fill(); } break;
    case 'swarm': for (let i = 0; i < 8; i++) q(cx - 60 + (i % 4) * 36 + Math.sin(t * 2 + i) * 3, cy - 18 + Math.floor(i / 4) * 32, 6); break;
    case 'heavy': c.save(); c.translate(cx, cy); c.strokeStyle = col; c.lineWidth = 3; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 34, Math.sin(a) * 34); c.stroke(); c.globalAlpha = 0.35; c.fillStyle = col; c.beginPath(); c.arc(Math.cos(a) * 34, Math.sin(a) * 34, 11, 0, TAU); c.fill(); c.globalAlpha = 1; } c.fillStyle = '#4C6B7A'; c.fillRect(-14, -10, 28, 26); c.strokeStyle = '#B48CFF'; c.setLineDash([3, 3]); c.beginPath(); c.arc(0, 0, 50, 0, TAU); c.stroke(); c.setLineDash([]); c.restore(); break;
    case 'loiter': c.strokeStyle = 'rgba(255,107,94,0.6)'; c.setLineDash([4, 4]); c.beginPath(); c.ellipse(cx, gy - 30, 90, 26, 0, 0, TAU); c.stroke(); c.setLineDash([]); artMast(c, cx, gy, 26, '#3DB8F5'); artWing(c, cx + 90 * Math.cos(t), gy - 30 + 26 * Math.sin(t) - 20, 9, col); break;
    case 'raider': artMast(c, cx + 70, gy, 30, '#3DB8F5'); c.fillStyle = '#3DB8F5'; c.beginPath(); c.arc(cx + 70, gy - 34, 7, 0, TAU); c.fill(); q(cx - 30 + (t * 25) % 60, cy - 10 + ((t * 25) % 60) * 0.4, 8, col, 0.5); c.strokeStyle = 'rgba(255,107,94,0.6)'; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(cx - 30, cy - 10); c.lineTo(cx + 70, gy - 34); c.stroke(); c.setLineDash([]); break;
    case 'mother': artWing(c, cx - 10, cy - 10, 30, col); for (let i = 0; i < 3; i++) q(cx + 60 + i * 10, cy + 20 + i * 14, 5, '#FF9F7A'); break;
    case 'fpv': for (let i = 0; i < 5; i++) { c.strokeStyle = `rgba(255,107,94,${0.5 - i * 0.08})`; c.beginPath(); c.moveTo(cx - 20 - i * 22, gy - 26 + i); c.lineTo(cx - 40 - i * 22, gy - 26 + i); c.stroke(); } q(cx + 10, gy - 30, 10, col, 0.4); break;
    case 'wing': c.fillStyle = 'rgba(230,237,242,0.08)'; for (const [x, y, r] of [[60, 30, 22], [80, 26, 18], [W - 70, 40, 24]]) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); } artWing(c, cx, 40, 16, col); for (let i = 0; i < 4; i++) { c.strokeStyle = 'rgba(255,107,94,0.3)'; c.beginPath(); c.moveTo(cx - 30 - i * 20, 40 + (i % 2 ? 6 : -6)); c.lineTo(cx - 50 - i * 20, 40 + (i % 2 ? 6 : -6)); c.stroke(); } break;
    case 'stealth': c.fillStyle = '#3A4A55'; c.beginPath(); c.moveTo(cx + 40, cy); c.lineTo(cx - 20, cy - 28); c.lineTo(cx - 8, cy); c.lineTo(cx - 20, cy + 28); c.closePath(); c.fill(); c.strokeStyle = col; c.lineWidth = 1.5; c.stroke(); waves(c, 30, gy - 10, -0.9, 0.2, 4, 40, 18, 'rgba(61,184,245,0.6)', [3, 6]); break;
    case 'lte': q(cx - 30, cy, 11); artTower(c, cx + 70, gy, '#F7A8E0'); c.fillStyle = '#F7A8E0'; c.font = '700 13px ' + DISP; c.fillText('4G', cx + 52, gy - 66); c.strokeStyle = 'rgba(247,168,224,0.6)'; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(cx - 30, cy); c.lineTo(cx + 70, gy - 60); c.stroke(); c.setLineDash([]); break;
    case 'spy': c.fillStyle = '#22343F'; c.fillRect(cx - 25, gy - 40, 50, 40); c.strokeStyle = 'rgba(255,181,71,0.6)'; c.setLineDash([4, 4]); c.beginPath(); c.ellipse(cx, gy - 30, 85, 28, 0, 0, TAU); c.stroke(); c.setLineDash([]); { const x = cx + 85 * Math.cos(t * 0.8), y = gy - 30 + 28 * Math.sin(t * 0.8) - 16; q(x, y, 8); c.fillStyle = 'rgba(255,181,71,0.15)'; c.beginPath(); c.moveTo(x, y); c.lineTo(cx - 20, gy - 40); c.lineTo(cx + 20, gy - 40); c.closePath(); c.fill(); } break;
    case 'decoy': c.setLineDash([4, 4]); q(cx, cy, 16, col); c.setLineDash([]); c.fillStyle = col; c.font = '700 22px ' + DISP; c.fillText('?', cx + 34, cy - 14); break;
    case 'civil': q(cx + 40, cy - 10, 10); c.fillStyle = '#9FDBFA'; c.beginPath(); c.arc(cx + 40, cy + 4, 4, 0, TAU); c.fill(); artPerson(c, cx - 60, gy - 14, '#8A9AA6'); c.fillStyle = '#9FDBFA'; c.fillRect(cx - 50, gy - 46, 8, 12); break;
    case 'auth': q(cx, cy, 13); c.fillStyle = '#3DB8F5'; c.fillRect(cx + 26, cy - 34, 30, 18); c.fillStyle = '#071015'; c.font = '700 11px ' + DISP; c.fillText('ID', cx + 33, cy - 21); waves(c, cx, cy, -1.2, -0.3, 3, 24, 9, '#3DB8F5'); break;
    case 'bird': c.strokeStyle = col; c.lineWidth = 3; const f = Math.sin(t * 6) * 10; c.beginPath(); c.moveTo(cx - 40, cy - f); c.quadraticCurveTo(cx - 15, cy - 20, cx, cy); c.quadraticCurveTo(cx + 15, cy - 20, cx + 40, cy - f); c.stroke(); break;
    case 'plane': c.save(); c.translate(cx, cy); c.scale(3, 3); c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, 13, 2.6, 0, 0, TAU); c.fill(); c.beginPath(); c.moveTo(2, 0); c.lineTo(-4, -13); c.lineTo(-7, -13); c.lineTo(-4, 0); c.lineTo(-7, 13); c.lineTo(-4, 13); c.closePath(); c.fill(); c.restore(); break;
    // sensori
    case 'radar': artMast(c, cx, gy, 40); c.save(); c.translate(cx, gy - 44); c.rotate(Math.sin(t) * 0.6); c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.arc(0, 12, 22, -2.6, -0.5); c.stroke(); c.restore(); c.fillStyle = 'rgba(61,184,245,0.15)'; c.beginPath(); c.moveTo(cx, gy - 44); c.arc(cx, gy - 44, 110, -0.6 + t % TAU, -0.3 + t % TAU); c.closePath(); c.fill(); break;
    case 'rf': artMast(c, cx, gy, 56, col); waves(c, cx, gy - 56, -2.6, -0.5, 4, 10, 10, col); q(cx + 90, 36, 7, '#FF6B5E'); break;
    case 'camera': artMast(c, cx - 40, gy, 30); c.fillStyle = '#E6EDF2'; c.beginPath(); c.arc(cx - 40, gy - 38, 12, 0, TAU); c.fill(); c.fillStyle = '#071015'; c.beginPath(); c.arc(cx - 34, gy - 40, 5, 0, TAU); c.fill(); c.fillStyle = 'rgba(230,237,242,0.1)'; c.beginPath(); c.moveTo(cx - 30, gy - 40); c.lineTo(cx + 110, gy - 90); c.lineTo(cx + 110, gy - 10); c.closePath(); c.fill(); q(cx + 80, gy - 50, 7, '#FF6B5E'); break;
    case 'acu': for (let i = 0; i < 4; i++) { artMast(c, cx - 45 + i * 30, gy, 16); c.fillStyle = col; c.beginPath(); c.arc(cx - 45 + i * 30, gy - 20, 5, 0, TAU); c.fill(); } waves(c, cx, gy - 20, -2.8, -0.3, 4, 30, 14, col, [2, 4]); break;
    case 'scout': artMast(c, 40, gy, 10, col); c.fillStyle = col; c.fillRect(30, gy - 14, 20, 4); { const ux = cx - 20 + Math.sin(t) * 20, uy = cy - 10; q(ux, uy, 7, col); c.strokeStyle = 'rgba(185,242,124,0.4)'; c.setLineDash([3, 4]); c.beginPath(); c.arc(ux, uy, 34, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(ux, uy); c.lineTo(cx + 80, cy - 20); c.stroke(); c.setLineDash([]); c.font = '700 16px ' + DISP; c.fillStyle = '#FFB547'; c.fillText('?', cx + 74, cy - 28); q(cx + 80, cy - 20, 6, '#8A9AA6'); } break;
    case 'vedetta': artPerson(c, cx - 30, gy - 14, '#E8C9A0'); c.fillStyle = '#071015'; c.fillRect(cx - 26, gy - 50, 14, 7); c.fillStyle = 'rgba(232,201,160,0.1)'; c.beginPath(); c.moveTo(cx - 12, gy - 47); c.lineTo(cx + 110, gy - 80); c.lineTo(cx + 110, gy - 30); c.closePath(); c.fill(); break;
    case 'irst': artMast(c, cx, gy, 24); const hg = c.createRadialGradient(cx, gy - 30, 2, cx, gy - 30, 90); hg.addColorStop(0, 'rgba(255,159,122,0.45)'); hg.addColorStop(1, 'rgba(255,159,122,0)'); c.fillStyle = hg; c.beginPath(); c.arc(cx, gy - 30, 90, Math.PI, TAU); c.fill(); c.fillStyle = col; c.beginPath(); c.arc(cx, gy - 30, 11, Math.PI, TAU); c.fill(); q(cx + 70, gy - 70, 6, '#FFD36B'); break;
    case 'lowradar': artMast(c, cx - 60, gy, 14); c.fillStyle = col; c.fillRect(cx - 68, gy - 34, 16, 20); c.fillStyle = 'rgba(127,212,255,0.15)'; c.beginPath(); c.moveTo(cx - 52, gy - 24); c.lineTo(W, gy - 50); c.lineTo(W, gy); c.closePath(); c.fill(); q(cx + 50, gy - 18, 7, '#FF6B5E'); for (let i = 0; i < 3; i++) { c.fillStyle = 'rgba(40,80,60,0.9)'; c.beginPath(); c.arc(cx + 20 + i * 30, gy - 4, 10, 0, TAU); c.fill(); } break;
    case 'pradar': artTower(c, 40, gy, '#8A9AA6'); artMast(c, W - 50, gy, 30, col); q(cx, 40, 8, '#FF6B5E'); c.strokeStyle = col; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(40, gy - 60); c.lineTo(cx, 40); c.lineTo(W - 50, gy - 30); c.stroke(); c.setLineDash([]); break;
    case 'cell': artTower(c, cx, gy, col); c.fillStyle = col; c.font = '700 13px ' + DISP; c.fillText('4G', cx + 14, gy - 50); q(cx + 80, 40, 7, '#FF6B5E'); break;
    // effettori
    case 'jam': artMast(c, cx - 60, gy, 40, col); for (let i = 0; i < 3; i++) { c.strokeStyle = col; c.lineWidth = 1.6; c.beginPath(); for (let x = 0; x < 90; x += 6) c.lineTo(cx - 50 + x, gy - 40 - i * 14 + (x / 6 % 2 ? 5 : -5)); c.stroke(); } q(cx + 70, gy - 60, 8, '#FF6B5E'); c.strokeStyle = '#FF6B5E'; c.beginPath(); c.moveTo(cx + 60, gy - 40); c.lineTo(cx + 80, gy - 20); c.moveTo(cx + 80, gy - 40); c.lineTo(cx + 60, gy - 20); c.stroke(); break;
    case 'hangar': c.fillStyle = '#22343F'; c.beginPath(); c.moveTo(cx - 70, gy); c.lineTo(cx - 70, gy - 30); c.quadraticCurveTo(cx - 40, gy - 50, cx - 10, gy - 30); c.lineTo(cx - 10, gy); c.fill(); q(cx + 30 + (t * 30) % 60, gy - 40 - (t * 20) % 40, 7, col); break;
    case 'hpm': artMast(c, cx - 50, gy, 20); c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.arc(cx - 50, gy - 26, 16, -1.2, 1.2); c.stroke(); for (let i = 0; i < 4; i++) { const r = ((t * 40 + i * 30) % 120); c.strokeStyle = `rgba(180,140,255,${1 - r / 120})`; c.beginPath(); c.arc(cx - 50, gy - 26, r + 10, -0.8, 0.8); c.stroke(); } for (let i = 0; i < 4; i++) q(cx + 40 + (i % 2) * 22, gy - 60 + Math.floor(i / 2) * 26, 5, '#FF6B5E'); break;
    case 'net': c.fillStyle = '#4C6B7A'; c.save(); c.translate(cx - 60, gy - 10); c.rotate(-0.6); c.fillRect(0, -6, 40, 12); c.restore(); c.strokeStyle = col; c.lineWidth = 1; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(cx + 30 + i * 8, gy - 80); c.lineTo(cx + 30 + i * 8, gy - 40); c.moveTo(cx + 14, gy - 60 + i * 8); c.lineTo(cx + 46, gy - 60 + i * 8); c.stroke(); } q(cx + 30, gy - 60, 7, '#FF6B5E'); break;
    case 'laser': artMast(c, cx - 60, gy, 20); c.fillStyle = col; c.fillRect(cx - 70, gy - 34, 20, 14); c.strokeStyle = 'rgba(255,107,94,0.35)'; c.lineWidth = 7; c.beginPath(); c.moveTo(cx - 52, gy - 28); c.lineTo(cx + 70, 40); c.stroke(); c.strokeStyle = '#FFD3CC'; c.lineWidth = 1.6; c.stroke(); q(cx + 70, 40, 8, '#FF6B5E'); break;
    case 'takeover': artMast(c, cx - 70, gy, 46, col); c.strokeStyle = col; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(cx - 70, gy - 46); c.lineTo(cx + 50, cy - 10); c.stroke(); c.setLineDash([]); q(cx + 50, cy - 10 + (t * 10) % 40, 9, '#9FDBFA'); c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.moveTo(cx + 80, cy); c.lineTo(cx + 88, cy + 10); c.lineTo(cx + 104, cy - 10); c.stroke(); break;
    case 'netdrone': q(cx - 20, cy - 20, 9, col); c.strokeStyle = col; c.lineWidth = 1; c.beginPath(); c.moveTo(cx - 20, cy - 10); c.lineTo(cx - 30, cy + 20); c.moveTo(cx - 20, cy - 10); c.lineTo(cx - 10, cy + 20); c.stroke(); for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(cx - 32 + i * 8, cy + 20); c.lineTo(cx - 32 + i * 8, cy + 34); c.stroke(); } q(cx + 70, cy - 10, 7, '#FF6B5E'); break;
    case 'longint': for (let i = 0; i < 6; i++) { c.strokeStyle = `rgba(124,240,224,${0.5 - i * 0.07})`; c.lineWidth = 2; c.beginPath(); c.moveTo(cx - 10 - i * 20, cy + 20 + i * 6); c.lineTo(cx - 30 - i * 20, cy + 26 + i * 6); c.stroke(); } artWing(c, cx, cy + 14, 8, col); artWing(c, cx + 90, cy - 30, 14, '#FF6B5E'); break;
    case 'spoof': c.fillStyle = '#8A9AA6'; c.fillRect(30, 24, 20, 10); c.fillRect(20, 26, 8, 6); c.fillRect(52, 26, 8, 6); c.strokeStyle = 'rgba(230,237,242,0.3)'; c.setLineDash([3, 5]); c.beginPath(); c.moveTo(40, 34); c.lineTo(cx, cy); c.stroke(); c.setLineDash([]); artMast(c, W - 50, gy, 30, col); c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.moveTo(W - 50, gy - 30); c.lineTo(cx, cy); c.stroke(); c.strokeStyle = 'rgba(255,107,94,0.6)'; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(cx, cy); c.quadraticCurveTo(cx - 50, cy + 10, cx - 70, gy); c.stroke(); c.setLineDash([]); artWing(c, cx, cy, 8, '#FF6B5E'); break;
    case 'netblock': artTower(c, cx - 60, gy, col); c.strokeStyle = col; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(cx - 60, gy - 60); c.lineTo(cx + 60, cy - 10); c.stroke(); c.setLineDash([]); c.strokeStyle = '#FF6B5E'; c.lineWidth = 3; c.beginPath(); c.moveTo(cx - 8, cy - 30); c.lineTo(cx + 8, cy - 14); c.moveTo(cx + 8, cy - 30); c.lineTo(cx - 8, cy - 14); c.stroke(); q(cx + 60, cy - 10, 8, '#FF6B5E'); break;
  }
}

// ---- finestra delle schede
let codexTab = 'threats', codexAnim = null;
function openCodex(tab) {
  if (G.phase === 'wave' && !G.paused) togglePause();
  codexTab = tab || codexTab; $('codex').hidden = false; renderCodex();
}
function closeCodex() { $('codex').hidden = true; cancelAnimationFrame(codexAnim); codexAnim = null; }
function renderCodex() {
  document.querySelectorAll('#codexTabs button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.t === codexTab)));
  const grid = $('codexGrid'); grid.replaceChildren();
  const keys = codexTab === 'threats' ? THREATS : codexTab === 'sens' ? SENS : EFF, arts = [];
  for (const k of keys) {
    const card = document.createElement('article'); card.className = 'cx';
    const cvs = document.createElement('canvas'); cvs.width = 520; cvs.height = 260; arts.push([cvs, k]);
    const x = CODEX[k], isT = codexTab === 'threats', T = TYPES[k], C = CAT[k];
    const tags = isT ? [T.speed ? `${T.speed} m/s` : '', T.hp ? `${T.hp} punti vita` : '', T.dmg !== undefined ? (T.dmg ? `danno ${T.dmg}` : 'nessun danno diretto') : T.hostile ? 'danno 1' : '', T.hostile ? 'minaccia' : T.decoy ? 'esca' : 'non è un bersaglio',
      FIRST[k] ? `prima volta: ${SITES[FIRST[k][0]].short}, ondata ${FIRST[k][1] + 1}` : ''].filter(Boolean)
      : [`costo ${C.cost}`, `portata ${C.range} m`, C.cd ? `ricarica ${fmt(C.cd, 1)} s` : '', C.use ? `${fmt(C.use, 1)} k€ a colpo` : '', C.emit ? 'emette' : 'passivo', C.unlock ? `si sblocca con: ${SITES[C.unlock].short}` : 'disponibile da subito'].filter(Boolean);
    const desc = isT ? TYPES[k].name : C.desc.replace(/<b>.*?<\/b>\s*/, '');
    card.innerHTML = `<h4>${isT ? T.name : C.name}</h4><div class="cxtags">${tags.map((t) => `<span>${t}</span>`).join('')}</div>
      ${isT ? '' : `<p>${desc}</p>`}
      <div class="cxpc"><div><b>${isT ? 'Perché è pericoloso' : 'Punti di forza'}</b><ul>${x.pro.map((p) => `<li>${p}</li>`).join('')}</ul></div>
      <div><b>${isT ? 'Punti deboli' : 'Limiti'}</b><ul>${x.con.map((p) => `<li>${p}</li>`).join('')}</ul></div></div>
      ${isT ? `<p class="cxuse"><b>Contromisure:</b> ${x.use}</p>` : `<p class="cxuse"><b>Livello 3:</b> ${C.s3}</p>`}`;
    card.prepend(cvs); grid.append(card);
  }
  cancelAnimationFrame(codexAnim);
  const loop = (now) => { for (const [cvs, k] of arts) { const c = cvs.getContext('2d'); c.setTransform(2, 0, 0, 2, 0, 0); drawArt(c, k, 260, 130, now / 1000); } codexAnim = requestAnimationFrame(loop); };
  codexAnim = requestAnimationFrame(loop);
}
