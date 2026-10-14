// Difese usate dai test: SMART (ragionata) e NAIVE (ingenua) per ogni sito, START = dottrine e crediti all'arrivo
const SMART = [
  [[['radar', 0, -120], ['rf', 110, 50], ['acu', 130, 100], ['hangar', 80, -90]],
    [['camera', 170, 120]],
    [['acu', -130, 40]],
    [['hpm', -160, 0]],
    [['hpm', 30, -200]]],
  [[['radar', -150, 120], ['rf', 120, 60], ['hangar', 100, -60], ['hangar', -100, -60], ['acu', -130, 140], ['net', 0, 90]],
    [['camera', 0, -330], ['jam', -60, -420]],
    [['laser', 100, 120], ['acu', 120, -60]],
    [['acu', 0, -280], ['acu', -200, -60], ['up', 2]],
    [['vedetta', 200, -40]]],
  [[['radar', -120, -120], ['rf', 120, 120], ['jam', 90, -10], ['up', 2], ['up', 2], ['hangar', -60, 110], ['acu', -420, -40]],
    [['camera', 60, -300]],
    [['irst', -300, -250]],
    [['hpm', -480, -60], ['hpm', 480, -480], ['acu', 400, -400]],
    [['takeover', 200, 30], ['net', -90, -60], ['net', 90, 60]]],
  [[['radar', 0, -120], ['rf', 110, -40], ['lowradar', 230, 380], ['hangar', 230, 220], ['hangar', -60, -100], ['laser', 120, 110], ['acu', 230, 300], ['net', 230, 405], ['camera', 230, 160]],
    [['longint', -200, -100]],
    [['net', 0, 100], ['acu', -300, 330], ['longint', 150, -150]],
    [['hpm', 230, 400]],
    [['longint', -150, -150], ['up', 5]]],
  [[['radar', 0, -110], ['rf', -150, 60], ['hangar', -330, -60], ['hangar', 160, 330], ['acu', -560, 60], ['acu', 420, 320], ['laser', -100, 200], ['camera', -300, 100], ['net', -470, 50], ['net', 40, 340]],
    [['pradar', 60, -100], ['acu', -20, 580], ['hangar', 100, 500]],
    [['hpm', 120, 520]],
    [['longint', 0, 150], ['scout', 200, 100]],
    [['longint', -120, -90], ['hpm', -60, -130]]],
  [[['radar', 0, -110], ['rf', 100, 80], ['takeover', -100, 60], ['cell', 120, -60], ['netblock', -120, -40], ['hangar', -300, 200], ['hangar', 330, -220], ['camera', -60, 120], ['lowradar', -380, 380], ['acu', 420, -200], ['net', -430, 220], ['camera', -360, 200]],
    [['camera', 380, -320], ['scout', -200, -40]],
    [['longint', 300, -120], ['net', 360, -300]],
    [['hpm', 600, -330], ['hpm', -600, 380]],
    [['laser', 350, -420], ['up', 14]]],
];
const NAIVE = [
  [[['base']]],
  [[['radar', 0, 100], ['rf', 110, 40], ['jam', -90, 70], ['hangar', 60, -80]]],
  [[['radar', 0, -120], ['rf', 110, 40], ['hangar', 100, -60], ['laser', -100, -60]], [['hpm', -120, 60]]],
  [[['radar', 0, -120], ['rf', 110, 40], ['jam', -90, 70], ['hangar', 60, -80], ['hpm', 100, 90]]],
  [[['radar', 0, -110], ['rf', 110, 40], ['jam', -90, 70], ['hangar', 60, -80], ['hpm', 100, 90]]],
  [[['radar', 0, -110], ['rf', 110, 40], ['jam', -90, 70], ['hangar', 60, -80], ['hpm', 100, 90]]],
];
// crediti e dottrine realistici all'arrivo in ogni sito
const PERKS_RUN = ['fondi', 'guida', 'manut', 'rete', 'riserva'];
const START = [0, 1, 2, 3, 4, 5].map((i) => ({ perks: PERKS_RUN.slice(0, i), carry: i ? 20 : 0 }));

module.exports = { SMART, NAIVE, START, PERKS_RUN };
