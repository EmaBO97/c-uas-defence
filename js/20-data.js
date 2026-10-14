// ============================================================ catalogo delle strutture
// unlock = indice della prima mappa in cui la struttura è disponibile (si sblocca completando la mappa precedente)
const CAT = {
  radar:  { g: 'S', name: 'Radar', cost: 30, range: 900, col: '#3DB8F5', emit: true, unlock: 0, meta: '900 m · rotante',
    desc: '<b>Radar.</b> Vede tutto ciò che vola entro 900 m a ogni giro del fascio (2,5 s), ma non classifica: uccello e drone sono la stessa traccia. Non vede i droni bassi sopra i boschi e, sopra l’acqua, li confonde con le onde. <b>Emette</b>: le munizioni circuitanti lo trovano.',
    s3: 'Micro-Doppler: distingue un uccello da un drone dal battito di ali ed eliche.' },
  rf:     { g: 'S', name: 'Sensore RF', cost: 15, range: 700, col: '#99FFCC', unlock: 0, meta: '700 m · radio',
    desc: '<b>Sensore RF e Remote ID.</b> Ascolta i collegamenti radio: classifica come ostili i droni radiocomandati e riconosce dal Remote ID quelli autorizzati. Cieco a fibra ottica e droni autonomi. È passivo: non si fa trovare.',
    s3: 'Goniometria: localizza il pilota. Dopo 6 s di ascolto il drone radio viene fatto rientrare, senza sparare.' },
  camera: { g: 'S', name: 'Camera EO/IR', cost: 15, range: 400, col: '#E6EDF2', unlock: 0, meta: '400 m · identifica',
    desc: '<b>Camera elettro-ottica e infrarossa.</b> Identifica qualunque oggetto: uccello, drone ostile, autorizzato, civile, esca. Tra gli alberi vede a metà distanza; notte e nebbia la accorciano. Aiuta il laser a puntare.',
    s3: 'Ottica stabilizzata: vede tra gli alberi a piena distanza.' },
  acu:    { g: 'S', name: 'Acustico', cost: 8, range: 250, col: '#FFB547', unlock: 0, meta: '250 m · motori',
    desc: '<b>Sensore acustico.</b> Sente i motori di qualunque drone entro 250 m, anche a fibra ottica e dentro i boschi, ma non ne capisce l’intenzione. Pioggia e vento lo assordano.',
    s3: 'Firma acustica: riconosce il motore dei droni ostili e li classifica.' },
  vedetta: { g: 'S', name: 'Vedetta', cost: 6, range: 220, col: '#E8C9A0', unlock: 1, meta: '220 m · occhio umano',
    desc: '<b>Vedetta.</b> Un osservatore con il binocolo: costa poco e riconosce qualunque oggetto, ma deve guardarlo per 2 s di fila. Di notte e con la nebbia vede molto meno.',
    s3: 'Binocolo stabilizzato: riconosce in 1 s.' },
  scout:  { g: 'S', name: 'Drone da ricognizione', cost: 20, range: 900, col: '#B9F27C', unlock: 1, meta: '900 m · vola a vedere',
    desc: '<b>Drone da ricognizione.</b> Dalla base decolla un piccolo drone con una camera: vola verso la traccia non identificata più vicina, entro 900 m, e la riconosce quando le arriva a 150 m. È una camera che si sposta: utile per esche, civili e tracce dubbie lontane. Notte e nebbia gli accorciano la vista.',
    s3: 'Due droni da ricognizione in volo.' },
  irst:   { g: 'S', name: 'Infrarosso panoramico', cost: 22, range: 600, col: '#FF9F7A', unlock: 2, meta: '600 m · calore',
    desc: '<b>Infrarosso panoramico.</b> Cerca il calore a 360°: vede anche i droni bassi e di notte lavora come di giorno. Distingue un uccello da un drone dal calore dei motori, ma non l’intenzione. Nebbia e pioggia lo accorciano. Passivo.',
    s3: 'Firma termica: riconosce come ostili sciami, droni pesanti, munizioni circuitanti e drone madre.' },
  lowradar: { g: 'S', name: 'Radar bassa quota', cost: 25, range: 550, col: '#7FD4FF', emit: true, unlock: 3, meta: '550 m · continuo',
    desc: '<b>Radar per la bassa quota.</b> Fascio fisso e continuo: vede i droni bassi anche sopra boschi e acqua, senza aspettare il giro. Non classifica. <b>Emette</b>: le munizioni circuitanti lo trovano.',
    s3: 'Micro-Doppler: distingue un uccello da un drone.' },
  pradar: { g: 'S', name: 'Radar passivo', cost: 28, range: 750, col: '#A9B8FF', unlock: 4, meta: '750 m · non emette',
    desc: '<b>Radar passivo.</b> Non trasmette: ascolta i riflessi dei segnali radio e TV già presenti nell’aria. Aggiorna le tracce ogni secondo, vede anche i droni furtivi e non si fa trovare dalle munizioni circuitanti. Non classifica e, come il radar, non vede i droni bassi su boschi e acqua.',
    s3: 'Micro-Doppler: distingue un uccello da un drone.' },
  cell:   { g: 'S', name: 'Monitor rete cellulare', cost: 15, range: 800, col: '#F7A8E0', unlock: 5, meta: '800 m · 4G',
    desc: '<b>Monitor della rete cellulare.</b> In accordo con l’operatore telefonico riconosce i droni che volano collegati alla rete 4G, che il sensore RF scambia per normali telefoni, e li classifica ostili. Non vede nient’altro. Passivo.',
    s3: 'Copertura estesa: portata +30%.' },
  jam:    { g: 'E', name: 'Disturbatore', cost: 20, range: 350, col: '#99FFCC', emit: true, unlock: 0, use: 0, cd: 6, meta: '350 m · area',
    desc: '<b>Disturbatore RF.</b> Impulso ad area: i droni radiocomandati perdono il collegamento e atterrano. Inutile contro fibra ottica e droni autonomi, e colpisce anche il drone autorizzato. <b>Emette</b>: attira le munizioni circuitanti.',
    s3: 'Antenna direzionale: non colpisce più i droni autorizzati.' },
  hangar: { g: 'E', name: 'Intercettori', cost: 25, range: 800, col: '#00D0B4', unlock: 0, use: 3, cd: 4, meta: '800 m · 3 k€ a lancio',
    desc: '<b>Hangar di droni intercettori.</b> Lancia un intercettore contro il bersaglio: funziona su tutti i droni, ma impiega qualche secondo ad arrivare e costa a ogni lancio.',
    s3: 'Doppio lancio: due intercettori alla volta.' },
  hpm:    { g: 'E', name: 'Microonde', cost: 45, range: 250, col: '#B48CFF', unlock: 0, use: 0.5, cd: 4, meta: '250 m · area',
    desc: '<b>Microonde ad alta potenza.</b> Un impulso neutralizza tutti i droni entro 250 m: la risposta agli sciami, con poca portata. I droni pesanti e il drone madre sono schermati.',
    s3: 'Alta potenza: danneggia anche i droni schermati.' },
  net:    { g: 'E', name: 'Lanciareti', cost: 8, range: 120, col: '#C9D3DA', unlock: 0, use: 0.5, cd: 1.5, ammo: 3, meta: '120 m · 3 colpi',
    desc: '<b>Lanciareti.</b> Ultima linea di difesa entro 120 m. Cattura anche i droni pesanti, senza detriti. Tre colpi per ondata.',
    s3: 'Caricatore maggiorato: 6 reti per ondata.' },
  laser:  { g: 'E', name: 'Laser', cost: 40, range: 500, col: '#FF6B5E', unlock: 1, use: 0.1, cd: 1, meta: '500 m · 1,5 s',
    desc: '<b>Laser ad alta energia.</b> Resta puntato 1,5 s sul bersaglio, 1 s se una camera lo segue: un drone alla volta, costo per colpo quasi nullo. La nebbia lo accorcia e non si usa nel corridoio degli aerei.',
    s3: 'Ottica adattiva: puntamento più breve del 30%.' },
  takeover: { g: 'E', name: 'Presa di controllo', cost: 35, range: 500, col: '#5EE3A0', unlock: 2, use: 0, cd: 4, meta: '500 m · 2 s',
    desc: '<b>Presa di controllo.</b> Si inserisce nel collegamento radio di un drone e lo fa atterrare intero: niente detriti, niente danni intorno, e un drone civile non subisce danni. Serve che il sensore RF senta il drone; non funziona su fibra ottica, droni autonomi e link cifrati.',
    s3: 'Più protocolli: presa in 1 s.' },
  netdrone: { g: 'E', name: 'Drone cacciatore', cost: 30, range: 650, col: '#C9E8FF', unlock: 3, use: 1.5, cd: 5, meta: '650 m · cattura',
    desc: '<b>Drone cacciatore con rete.</b> Insegue il bersaglio e lo cattura con una rete: niente detriti, quindi può lavorare anche sopra la folla. Cattura anche i droni pesanti; più lento dell’intercettore.',
    s3: 'Due droni cacciatori alla volta.' },
  spoof:  { g: 'E', name: 'Spoofing GNSS', cost: 30, range: 400, col: '#FFD36B', emit: true, unlock: 4, use: 0, cd: 7, meta: '400 m · area',
    desc: '<b>Spoofing GNSS.</b> Impulso ad area che inganna la navigazione satellitare: sciami, droni pesanti e munizioni circuitanti perdono la rotta e cadono lontano. Inutile sui droni pilotati via radio o fibra e sul drone madre, che naviga a inerzia. Colpisce anche il drone autorizzato. <b>Emette</b>.',
    s3: 'Fascio direzionale: risparmia i droni autorizzati.' },
  longint: { g: 'E', name: 'Intercettore veloce', cost: 35, range: 1000, col: '#7CF0E0', unlock: 3, use: 8, cd: 6, meta: '1000 m · 8 k€ a lancio',
    desc: '<b>Intercettore veloce.</b> Un intercettore molto più rapido e con più portata: raggiunge anche i droni ad ala fissa, e un colpo toglie due punti vita. Costa caro a ogni lancio, e sopra la folla non si usa.',
    s3: 'Ricarica rapida: un lancio ogni 3,5 s.' },
  netblock: { g: 'E', name: 'Blocco di rete', cost: 25, range: 900, col: '#F7A8E0', unlock: 5, use: 0, cd: 3, meta: '900 m · 3 s',
    desc: '<b>Blocco di rete.</b> Con l’operatore telefonico si interrompe il collegamento 4G di un drone, che atterra intero. Serve che il monitor della rete cellulare lo segua. Non ha effetti sugli altri droni né sui telefoni intorno.',
    s3: 'Procedura rapida: blocco in 1,5 s.' },
};
const SENS = ['radar', 'rf', 'camera', 'acu', 'vedetta', 'scout', 'irst', 'lowradar', 'pradar', 'cell'];
const EFF = ['jam', 'hangar', 'hpm', 'net', 'laser', 'takeover', 'netdrone', 'longint', 'spoof', 'netblock'];

// ============================================================ oggetti in volo
const TYPES = {
  radio:  { name: 'Drone radiocomandato', speed: 26, radio: true, hostile: true, pts: 100, bounty: 2 },
  fiber:  { name: 'Drone a fibra ottica', speed: 28, low: true, hostile: true, pts: 100, bounty: 2 },
  swarm:  { name: 'Drone di uno sciame', speed: 30, small: true, gnss: true, hostile: true, pts: 100, bounty: 1 },
  heavy:  { name: 'Drone pesante', speed: 18, hp: 2, dmg: 2, shield: true, gnss: true, hostile: true, big: 1.35, pts: 200, bounty: 5 },
  loiter: { name: 'Munizione circuitante', speed: 24, dive: 62, hunter: true, gnss: true, hostile: true, pts: 150, bounty: 3 },
  fpv:    { name: 'FPV da corsa', speed: 46, radio: true, low: true, hostile: true, pts: 120, bounty: 2 },
  wing:   { name: 'Drone ad ala fissa', speed: 40, gnss: true, high: true, hostile: true, big: 1.2, pts: 150, bounty: 3 },
  stealth: { name: 'Drone furtivo', speed: 22, gnss: true, stealth: true, hostile: true, pts: 150, bounty: 3 },
  lte:    { name: 'Drone 4G', speed: 26, cell: true, hostile: true, pts: 120, bounty: 2 },
  spy:    { name: 'Drone spia', speed: 20, radio: true, spy: true, hostile: true, dmg: 0, pts: 120, bounty: 2 },
  raider: { name: 'Drone d’assalto', speed: 32, small: true, gnss: true, raid: true, hostile: true, pts: 130, bounty: 3 },
  mother: { name: 'Drone madre', speed: 12, hp: 10, dmg: 3, radio: true, jamProof: true, shield: true, hostile: true, big: 2, pts: 600, bounty: 20 },
  decoy:  { name: 'Esca', speed: 24, radio: true, small: true, decoy: true, pts: 0, bounty: 0 },
  civil:  { name: 'Drone di un hobbista', speed: 13, radio: true, small: true, civil: true },
  bird:   { name: 'Uccello', speed: 11, small: true },
  auth:   { name: 'Drone autorizzato', speed: 18, radio: true, gnss: true },
  plane:  { name: 'Aereo di linea', speed: 62, manned: true },
  heli:   { name: 'Elisoccorso', speed: 50, manned: true },
};
const AUTONOMOUS = ['swarm', 'heavy', 'loiter', 'mother', 'wing', 'stealth', 'raider'];
const idCls = (o) => ({ bird: 'bird', auth: 'auth', decoy: 'decoy', plane: 'plane', civil: 'civ' })[o.type] || 'hostile';
const CLS = { unk: ['Sconosciuto', '#8A9AA6', '?'], drone: ['Drone, intenzione ignota', '#FFB547', 'DRN'], hostile: ['Drone ostile', '#FF6B5E', 'OST'],
  bird: ['Uccello', '#99FFCC', 'UCC'], auth: ['Drone autorizzato', '#3DB8F5', 'AUT'], decoy: ['Esca', '#B48CFF', 'ESC'], civ: ['Drone civile', '#9FDBFA', 'CIV'], plane: ['Aereo', '#E6EDF2', 'AER'], heli: ['Elisoccorso', '#FFB547', 'ELI'] };
const SOFT = ['jam', 'takeover', 'pilot', 'netblock']; // neutralizzazioni che fanno atterrare il drone intero

// ============================================================ meteo, abilità, dottrine
const WEATHER = {
  sereno:  { name: 'Sereno', desc: 'Nessun effetto sui sensori.' },
  notte:   { name: 'Notte', camera: 0.8, scoutcam: 0.8, vedetta: 0.5, desc: 'Camera solo all’infrarosso (−20%), vedetta a metà portata.' },
  nebbia:  { name: 'Nebbia', camera: 0.5, scoutcam: 0.5, laser: 0.6, vedetta: 0.4, irst: 0.5, desc: 'Camera e infrarosso a metà portata, laser −40%, vedetta quasi cieca.' },
  pioggia: { name: 'Pioggia', radar: 0.8, lowradar: 0.8, acu: 0.6, laser: 0.8, irst: 0.7, vedetta: 0.7, desc: 'Radar −20%, acustico −40%, laser −20%, infrarosso −30%.' },
  vento:   { name: 'Vento forte', acu: 0.6, wob: 2, desc: 'Il vento copre i motori: acustico −40%. I droni sbandano di più.' },
};
const ABIL = [
  { k: 'alert', key: '1', name: 'Allerta sensori', cd: 40, dur: 10, desc: 'Per 10 s i sensori hanno +30% di portata e il radar gira al doppio.' },
  { k: 'reload', key: '2', name: 'Ricarica rapida', cd: 45, desc: 'Tutti gli effettori tornano pronti, e ogni lanciareti riceve 2 reti.' },
  { k: 'repair', key: '3', name: 'Squadra tecnica', cd: 30, desc: 'Ripara le strutture danneggiate o guaste e le rimette in linea.' },
];
const PERKS = [
  { k: 'fondi', name: 'Bilancio rafforzato', desc: '+30 crediti all’inizio di ogni sito.' },
  { k: 'guida', name: 'Guida terminale', desc: 'Intercettori e droni cacciatori vanno a segno nel 95% dei casi.' },
  { k: 'manut', name: 'Manutenzione predittiva', desc: 'Gli effettori si ricaricano il 15% più in fretta.' },
  { k: 'rete', name: 'Rete di sensori', desc: 'Tutti i sensori hanno il 10% di portata in più.' },
  { k: 'riserva', name: 'Ridondanza', desc: 'Ogni obiettivo ha un punto di integrità in più.' },
  { k: 'fusione', name: 'Fusione dei dati', desc: 'Se due sensori di tipo diverso seguono un drone di intenzione ignota, il sistema lo classifica ostile.' },
  { k: 'addestr', name: 'Squadre addestrate', desc: 'Le abilità d’ondata si ricaricano il 35% più in fretta.' },
  { k: 'logist', name: 'Logistica', desc: 'I potenziamenti costano il 30% in meno.' },
];
const R_MAP = 1100, R_HIT = 70, BONUS = 25, SWEEP = 2.5;
