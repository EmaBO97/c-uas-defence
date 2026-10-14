# Difesa a Strati: note di sviluppo (versione 4)

Regole, dati, bilanciamento e struttura del codice. Per giocare o compilare il gioco vedi il [README](../README.md).

## Che cos'è

È un gioco didattico sulle contromisure anti-drone (C-UAS) per un corso sui droni in italiano. È **separato dal deck**.

- È un solo file HTML che funziona **offline**: niente CDN, niente rete, font Poppins incorporati in base64, disegni fatti con il canvas.
- È una **campagna di 6 siti con 5 ondate ciascuno**, 30 ondate in tutto: circa 60–90 minuti se si gioca dall'inizio alla fine.
- Il gioco è **automatico con decisioni attive**: sensori ed effettori agiscono da soli, mentre il giocatore piazza, potenzia, decide sui casi dubbi, usa le abilità e può costruire anche durante l'ondata.
- È concettuale, **senza dettagli operativi reali**: portate, costi ed effetti sono semplificati. Tutti i testi sono in italiano.

## Progressione

- **Sblocco dei siti:** completare un sito sblocca il successivo. Il progresso si salva nel `localStorage` del browser, sotto la chiave `difesa-strati-v3`, e il gioco funziona anche se il salvataggio non è disponibile.
- **Scelta di sito e ondata:** dal menu si sceglie un sito sbloccato. Se nel sito si è già arrivati a una certa ondata, si può ripartire da quella.
  - Per ogni ondata saltata i crediti iniziali aumentano di 35.
  - Le strutture vanno piazzate da capo.
  - Il dato salvato è `SAVE.reached[sito]`.
- **Strutture:** ogni struttura ha `CAT[k].unlock`, l'indice della prima mappa in cui è disponibile. Si sblocca quindi completando la mappa precedente. Nel negozio le strutture bloccate mostrano "si sblocca con: …".
- **Dottrine:** dopo ogni sito se ne sceglie una tra 3, e restano salvate. Le prime due proposte seguono l'ordine dell'elenco `PERKS`, la terza ruota tra le altre. Ripartendo da un sito già sbloccato si riusano quelle scelte nella partita salvata.

## Siti

| Sito | Crediti | Regola | Strutture nuove |
|---|---|---|---|
| 1. Centrale | 100 | Boschi che nascondono i droni bassi | — (base: radar, RF, camera, acustico, disturbatore, intercettori, microonde, lanciareti) |
| 2. Aeroporto | 120 | Corridoio di volo: aerei, laser fermo nel corridoio, disturbatore, spoofing e microonde fermi vicino agli aerei | Vedetta, drone da ricognizione, laser |
| 3. Stadio | 150 | Zone affollate: niente laser e intercettori sopra la folla, microonde ferme se c'è un drone sulla folla | Infrarosso panoramico, presa di controllo |
| 4. Porto | 175 | Si costruisce solo a terra e sui moli, il radar vede male i droni bassi sul mare | Radar bassa quota, drone cacciatore, intercettore veloce |
| 5. Diga | 210 | Creste: un drone dentro una cresta è visto solo da sensori entro 250 m. Il lago del bacino fa da specchio per il radar | Radar passivo, spoofing GNSS |
| 6. Vertice in città | 250 | Spettro affollato: l'RF segnala i droni radio come "intenzione ignota". Droni civili da far atterrare. Zone affollate. Droni che decollano dai tetti | Monitor rete cellulare, blocco di rete |

**Obiettivi multipli nelle ultime mappe**
- Nel Porto si difendono il terminale e la nave metaniera.
- Nella Diga la diga, la centrale idroelettrica e la sottostazione.
- Nel Vertice il palazzo, l'hotel delle delegazioni e il centro stampa.

Gli obiettivi secondari hanno 4 punti di integrità, raggio 50 m, e sono definiti in `SITES[i].extra`. Ogni drone punta l'obiettivo ancora in piedi più vicino al punto in cui compare; con l'opzione di comparsa `tgt` si può forzare l'obiettivo. Se un obiettivo arriva a 0 il sito è perso. Si può costruire entro 700 m dal centro o entro 320 m da un obiettivo secondario. Le 3★ richiedono tutti gli obiettivi intatti.

**Economia:** +25 crediti tra un'ondata e l'altra, da +1 a +20 crediti per ogni drone abbattuto. Al sito successivo passa metà dei crediti avanzati.

**Stelle del sito**
- 3★: integrità piena, nessun falso allarme e nessun detrito.
- 2★: integrità almeno 3.
- 1★: integrità sotto 3.

## Droni (`TYPES`)

| Tipo | Caratteristiche |
|---|---|
| radio | Con radio |
| fiber | Basso, senza radio |
| swarm | Piccolo, autonomo, GNSS |
| heavy | 2 punti vita, danno 2, schermato |
| loiter | Caccia gli emettitori accesi |
| raider (d'assalto) | 32 m/s, punta le strutture del giocatore invece della base. Con l'opzione di comparsa `def: 1` anche FPV e pesanti fanno lo stesso; una struttura colpita resta fuori uso fino alla riparazione |
| fpv | 46 m/s, radio, basso |
| wing (ala fissa) | 40 m/s, alto. L'acustico lo sente a metà portata, gli intercettori lo colpiscono solo il 65% delle volte |
| stealth (furtivo) | Il radar lo vede al 35% della portata |
| lte (4G) | Collegamento via rete cellulare: RF, disturbatore e presa di controllo non funzionano |
| spy (spia) | Orbita a 450 m per 20 s e poi riparte: −200 punti se riparte |
| mother (madre) | 10 punti vita, rilascia sciami |
| decoy (esca) | Senza carico |
| civil (hobbista) | Abbatterlo è un falso allarme. Farlo atterrare con disturbatore, presa di controllo, goniometria o blocco di rete non costa nulla |
| auth (autorizzato) | Drone legittimo con Remote ID |
| bird | Uccello |
| plane | Aereo di linea |

## Strutture (`CAT`)

| Gruppo | Strutture |
|---|---|
| Sensori (10) | radar, rf, camera, acu, vedetta (deve osservare per 2 s), scout (drone da ricognizione: vola verso la traccia non identificata più vicina, entro 900 m dalla base, e la riconosce a 150 m; due droni al livello 3), irst, lowradar (continuo, vede i bassi), pradar (passivo, vede i furtivi), cell (vede solo i droni 4G) |
| Effettori (10) | jam, hangar, hpm, net, laser, takeover (serve l'RF, atterraggio intero, ammesso sopra la folla), netdrone (cattura, ammesso sopra la folla), longint (140 m/s, 1000 m, 2 punti vita a colpo), spoof (area, solo droni GNSS), netblock (serve il monitor cellulare) |

**Livello 3:** ogni struttura ha un'abilità speciale (vedi `s3`).

**Durante l'ondata**
- Abilità: 1 Allerta sensori, 2 Ricarica rapida, 3 Squadra tecnica.
- Ordini sulla traccia: E per ingaggiarla, N per non ingaggiarla.
- Richieste di autorizzazione per le tracce dubbie che si avvicinano.
- Radar, disturbatore e spoofing si possono spegnere per sfuggire alle munizioni circuitanti.

**Regole di ingaggio:** rigorose, prudenti, aggressive. Il sistema ingaggia una traccia solo 0,6 s dopo che ne è cambiata la classificazione: è il tempo di conferma, che lascia al giocatore il tempo di intervenire.

## Schede

Il pulsante **Schede** è nell'intestazione e nel menu. Durante l'ondata, aprirle mette il gioco in pausa.

Ci sono 3 schede: Droni e minacce, Sensori, Effettori. Ogni voce ha:
- un disegno animato, generato da `drawArt()`;
- i dati principali (costo, portata, sblocco, prima apparizione);
- punti di forza e limiti;
- contromisure (per i droni) o abilità del livello 3 (per le strutture).

I testi sono in `CODEX`, nel file `js/55-codex.js`.


## Meccaniche aggiunte nella versione 4

Il codice di queste meccaniche è in `js/45-waves.js`.

- **Intelligence incerta.** In fase di preparazione la scheda dell'ondata mostra solo una stima:
  - un intervallo di numero di droni;
  - alcune direzioni di arrivo, a volte una sbagliata;
  - circa metà delle minacce.

  "Ricognizione avanzata" costa `8 + 3 × sito` crediti e mostra il briefing completo. Le prime 2 ondate della Centrale sono sempre complete. Funzioni: `makeIntel()`, `G.intelBought`.
- **Il nemico si adatta.** A fine ondata `dominantEffector()` trova l'effettore con più abbattimenti (almeno 3, e almeno il 40% del totale). `applyAdapt()` modifica l'ondata successiva secondo la tabella `ADAPT`:

  | Effettore che ha funzionato | Risposta del nemico |
  |---|---|
  | Disturbatore, presa di controllo | Droni radio → fibra ottica |
  | Microonde | Droni pesanti in più |
  | Intercettori | Esche in più |
  | Laser | Droni FPV |
  | Lanciareti | Drone d'assalto |
  | Spoofing GNSS | Si torna ai droni radio |

  Il debriefing e la scheda d'ondata lo annunciano. L'ondata effettiva viene costruita in `toSetup()` da `buildWave()` e salvata in `G.curWave`; `WV()` restituisce quella.
- **Pattuglia** (`G.mode = 'endless'`). Si sblocca completando un sito. `genWave(i)` genera ondate casuali sempre più dense (punti = 4 + 2,2 × i), con il drone madre ogni 5 ondate, meteo ed eventi casuali, e l'obiettivo di cattura ogni 3. Sono disponibili tutte le strutture già sbloccate. Il record si salva in `SAVE.endless[sito]`.
- **Nuovi eventi.**
  - `blackout`: circa il 40% delle strutture va in guasto.
  - `heli`: un elisoccorso atterra a 420 m dal centro; finché è in volo disturbatore, spoofing e microonde restano fermi (`holdReason` 'elisoccorso').
- **Obiettivi d'ondata** (`wave.obj`).
  - `capture`: catturare N droni ostili intatti, con reti, drone cacciatore, disturbatore, presa di controllo, blocco di rete o goniometria.
  - `escort`: un convoglio (`G.assets` con `temp: true`) segue un percorso, e i droni lo possono puntare.

  Se l'obiettivo riesce: +30 crediti e +300 punti. Se il convoglio viene distrutto: −300 punti, ma il sito non è perso.
- **Replay.** Durante l'ondata `recFrame()` registra ogni 0,25 s le posizioni reali di tutti i droni, anche quelli mai visti, e `recEvent()` i momenti chiave. Dal debriefing "Rivedi l'ondata" apre la barra con play, velocità ×2/×4/×8, cursore del tempo e i momenti chiave cliccabili. I droni mai rilevati sono segnati come "non visto".
- **Tensione.**
  - Musica WebAudio (`MUSIC`) che cresce con il numero di droni vicini agli obiettivi.
  - Rallentatore di 0,8 s quando un drone identificato arriva a 200 m da un obiettivo, con al massimo una volta ogni 4 s.
  - Un suono di rilevamento diverso per ogni tipo di drone.
- **Sfide** (`SITES[i].chal`, definite in `CHAL` e `chalDef`): 3 per sito. Si valutano a fine sito e si salvano in `SAVE.chal[sito]`; il menu le mostra.
- **Tempo di conferma.** Il sistema ingaggia una traccia solo 0,6 s dopo l'ultimo cambio di classificazione.

## Bilanciamento verificato (`node test-strategie.js`)

Il test gioca con un bot che si comporta da giocatore attento: ripara, usa le abilità, spegne gli emettitori minacciati, autorizza le tracce veloci vicine a qualunque obiettivo, risparmia il drone senza Remote ID e i droni civili.

- **Per ogni sito, difesa ingenua:** perde. Anche aggiungendo le decisioni del bot, ottiene al massimo 1★.
- **Per ogni sito, difesa ragionata:** 3★. Le difese sono in `SMART`, dentro `test-strategie.js`, con le dottrine `fondi`, `guida`, `manut`, `rete`, `riserva` prese in quest'ordine e 20 crediti portati dal sito precedente.
- **Campagna completa di fila:** 18 stelle su 18.
- **Ripartenza:** si riparte correttamente dall'ondata 3 della Centrale.
- **Pattuglia:** si gioca senza errori, e il replay si apre.
- **Adattamento del nemico:** le difese ragionate in `plans.js` sono state ritarate tenendone conto.
- **Errori JavaScript:** nessuno.

## File

- `src.html`: CSS, HTML e i segnaposto `/*FONTS*/` e `/*JS*/`.
- `js/*.js`, uniti in ordine alfabetico dentro un'unica IIFE:
  - `10-core`: utilità e audio;
  - `20-data`: `CAT`, `TYPES`, `WEATHER`, `ABIL`, `PERKS`;
  - `25-sites`: `SITES` con tutte le ondate;
  - `30-world`: stato, geometria (boschi, acqua, creste, corridoio, folla), terreno, disegno dei siti;
  - `40-sim`: simulazione, sensori, regole di ingaggio, effettori;
  - `45-waves`: adattamento, intelligence, pattuglia, obiettivi, sfide, registrazione del replay;
  - `50-flow`: costruzione, siti, ondate, lezioni del debriefing, dottrine, menu, scelta dell'ondata, salvataggio;
  - `55-codex`: schede e disegni;
  - `60-ui`: pannelli, mappa, input, ciclo. L'ultima riga è `window.__g = {...}`, l'aggancio per i test.
- `build.py` (`python3 build.py`): scrive `test.html`, che tiene l'aggancio per i test, e i file da distribuire `difesa-c-uas.html` e `index.html`, uguali e senza l'aggancio. `index.html` serve per GitHub Pages.
- `plans.js`: le difese usate dai test (`SMART`, `NAIVE`, `START`).
- `bot.js` e `test-strategie.js`: i test con Playwright (`npm i playwright`, poi `node test-strategie.js`). Gli screenshot finiscono in `shots/`.
- `fonts/`: i sottoinsiemi di Poppins.

