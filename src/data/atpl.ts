import type { Bilingual } from '@/i18n'

/**
 * Technical interview bank. The topics are the ones candidates report from the
 * 2024-2025 Wizz Air assessments: runway declared distances, V-speeds, the
 * stabilised approach, pressure and density altitude, turbofan basics, airport
 * lighting and alternate fuel — plus the ATPL fundamentals a cadet is expected
 * to reason about rather than recite.
 */

export type AtplTopic =
  | 'runway'
  | 'v-speeds'
  | 'approach'
  | 'altimetry'
  | 'systems'
  | 'meteorology'
  | 'principles'
  | 'fuel'

export const ATPL_TOPIC_LABELS: Record<AtplTopic, Bilingual> = {
  runway: { it: 'Pista e distanze', en: 'Runway and distances' },
  'v-speeds': { it: 'Velocità V', en: 'V-speeds' },
  approach: { it: 'Approccio stabilizzato', en: 'Stabilised approach' },
  altimetry: { it: 'Altimetria', en: 'Altimetry' },
  systems: { it: 'Sistemi e motori', en: 'Systems and engines' },
  meteorology: { it: 'Meteorologia', en: 'Meteorology' },
  principles: { it: 'Principi del volo', en: 'Principles of flight' },
  fuel: { it: 'Carburante', en: 'Fuel' },
}

export const ALL_ATPL_TOPICS = Object.keys(ATPL_TOPIC_LABELS) as AtplTopic[]

export type AtplQuestion = {
  id: string
  topic: AtplTopic
  stem: Bilingual
  options: Bilingual[]
  correctIndex: number
  explanation: Bilingual
}

export const ATPL_BANK: AtplQuestion[] = [
  // -------------------------------------------------------------------- runway
  {
    id: 'rwy-1',
    topic: 'runway',
    stem: { it: 'Che cosa indica la TORA?', en: 'What does TORA stand for?' },
    options: [
      { it: 'Take-Off Run Available: la lunghezza di pista utilizzabile per la corsa di decollo', en: 'Take-Off Run Available: the runway length usable for the take-off run' },
      { it: 'Total Runway Area', en: 'Total Runway Area' },
      { it: 'Take-Off Rejected Area', en: 'Take-Off Rejected Area' },
      { it: 'Touchdown Or Rollout Allowance', en: 'Touchdown Or Rollout Allowance' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'TORA = corsa di decollo disponibile. TODA = TORA + clearway. ASDA = TORA + stopway. LDA = distanza disponibile per l’atterraggio.',
      en: 'TORA = take-off run available. TODA = TORA + clearway. ASDA = TORA + stopway. LDA = landing distance available.',
    },
  },
  {
    id: 'rwy-2',
    topic: 'runway',
    stem: {
      it: 'La ASDA è composta da:',
      en: 'The ASDA is made up of:',
    },
    options: [
      { it: 'TORA + stopway', en: 'TORA + stopway' },
      { it: 'TORA + clearway', en: 'TORA + clearway' },
      { it: 'LDA + stopway', en: 'LDA + stopway' },
      { it: 'TODA + stopway', en: 'TODA + stopway' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Accelerate-Stop Distance Available: la distanza per accelerare fino a V1 e arrestarsi, quindi include la stopway (superficie idonea a sostenere l’aereo).',
      en: 'Accelerate-Stop Distance Available: the distance to accelerate to V1 and stop, so it includes the stopway (a surface able to bear the aircraft).',
    },
  },
  {
    id: 'rwy-3',
    topic: 'runway',
    stem: {
      it: 'La clearway è inclusa in quale distanza dichiarata?',
      en: 'The clearway is included in which declared distance?',
    },
    options: [
      { it: 'TODA', en: 'TODA' },
      { it: 'ASDA', en: 'ASDA' },
      { it: 'TORA', en: 'TORA' },
      { it: 'LDA', en: 'LDA' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'La clearway è uno spazio aereo libero da ostacoli oltre la pista: si può sorvolare in salita, non ci si può rullare sopra. Perciò entra solo nella TODA.',
      en: 'The clearway is obstacle-free airspace beyond the runway: you can climb over it but not roll on it. So it counts only towards TODA.',
    },
  },
  {
    id: 'rwy-4',
    topic: 'runway',
    stem: {
      it: 'Le cifre dipinte all’inizio di una pista indicano:',
      en: 'The numbers painted at the start of a runway indicate:',
    },
    options: [
      { it: 'La direzione magnetica arrotondata alla decina di gradi', en: 'The magnetic direction rounded to the nearest ten degrees' },
      { it: 'La lunghezza in centinaia di metri', en: 'The length in hundreds of metres' },
      { it: 'La direzione vera esatta', en: 'The exact true direction' },
      { it: 'La portanza massima ammessa', en: 'The maximum permitted weight' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Pista 24 ≈ 240° magnetici. Le due piste opposte differiscono sempre di 18 (180°).',
      en: 'Runway 24 ≈ 240° magnetic. Opposite runway designators always differ by 18 (180°).',
    },
  },

  // ------------------------------------------------------------------ v-speeds
  {
    id: 'vsp-1',
    topic: 'v-speeds',
    stem: { it: 'Che cos’è la V1?', en: 'What is V1?' },
    options: [
      { it: 'La velocità di decisione: oltre di essa il decollo va proseguito', en: 'The decision speed: beyond it the take-off must be continued' },
      { it: 'La velocità di rotazione', en: 'The rotation speed' },
      { it: 'La velocità di sicurezza al decollo', en: 'The take-off safety speed' },
      { it: 'La velocità minima di controllo a terra', en: 'The minimum ground control speed' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'V1 è l’ultima velocità alla quale si può iniziare l’arresto restando entro la ASDA. Superata la V1 si continua, anche con un motore avariato.',
      en: 'V1 is the last speed at which stopping can be initiated within the ASDA. Past V1 you continue, even with an engine failure.',
    },
  },
  {
    id: 'vsp-2',
    topic: 'v-speeds',
    stem: { it: 'Che cos’è la V2?', en: 'What is V2?' },
    options: [
      { it: 'La velocità di sicurezza al decollo, da mantenere in salita con un motore inoperativo', en: 'The take-off safety speed, held in the climb with one engine inoperative' },
      { it: 'La velocità massima con carrello esteso', en: 'The maximum speed with gear extended' },
      { it: 'La velocità di stallo in configurazione di atterraggio', en: 'The stall speed in landing configuration' },
      { it: 'La velocità di manovra', en: 'The manoeuvring speed' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'V2 garantisce il gradiente di salita minimo richiesto con un motore inoperativo, fino ad almeno 400 ft.',
      en: 'V2 guarantees the minimum required climb gradient with one engine inoperative, up to at least 400 ft.',
    },
  },
  {
    id: 'vsp-3',
    topic: 'v-speeds',
    stem: {
      it: 'Ordine corretto delle velocità di decollo:',
      en: 'Correct order of the take-off speeds:',
    },
    options: [
      { it: 'V1 ≤ VR ≤ V2', en: 'V1 ≤ VR ≤ V2' },
      { it: 'V2 ≤ V1 ≤ VR', en: 'V2 ≤ V1 ≤ VR' },
      { it: 'VR ≤ V1 ≤ V2', en: 'VR ≤ V1 ≤ V2' },
      { it: 'V1 ≤ V2 ≤ VR', en: 'V1 ≤ V2 ≤ VR' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Si decide (V1), si ruota (VR), si sale alla velocità di sicurezza (V2).',
      en: 'You decide (V1), you rotate (VR), you climb at the safety speed (V2).',
    },
  },
  {
    id: 'vsp-4',
    topic: 'v-speeds',
    stem: {
      it: 'Come varia la velocità di stallo all’aumentare del fattore di carico?',
      en: 'How does stall speed change as load factor increases?',
    },
    options: [
      { it: 'Aumenta con la radice quadrata del fattore di carico', en: 'It increases with the square root of the load factor' },
      { it: 'Aumenta in modo lineare', en: 'It increases linearly' },
      { it: 'Diminuisce', en: 'It decreases' },
      { it: 'Non cambia', en: 'It does not change' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Vs(n) = Vs × √n. A 60° di banco n = 2, quindi la velocità di stallo sale del 41%.',
      en: 'Vs(n) = Vs × √n. At 60° of bank n = 2, so stall speed rises by 41%.',
    },
  },

  // ------------------------------------------------------------------ approach
  {
    id: 'app-1',
    topic: 'approach',
    stem: {
      it: 'In condizioni IMC, entro quale altezza un approccio deve essere stabilizzato secondo i criteri tipici di compagnia?',
      en: 'In IMC, by what height must an approach be stabilised under typical company criteria?',
    },
    options: [
      { it: '1000 ft AAL', en: '1000 ft AAL' },
      { it: '500 ft AAL', en: '500 ft AAL' },
      { it: '1500 ft AAL', en: '1500 ft AAL' },
      { it: '200 ft AAL', en: '200 ft AAL' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Tipicamente 1000 ft in IMC e 500 ft in VMC. Se un solo criterio non è soddisfatto al gate: go-around.',
      en: 'Typically 1000 ft in IMC and 500 ft in VMC. If a single criterion is not met at the gate: go-around.',
    },
  },
  {
    id: 'app-2',
    topic: 'approach',
    stem: {
      it: 'Quale di questi NON è un criterio di approccio stabilizzato?',
      en: 'Which of these is NOT a stabilised approach criterion?',
    },
    options: [
      { it: 'Avere il carrello retratto', en: 'Having the landing gear retracted' },
      { it: 'Configurazione di atterraggio completata', en: 'Landing configuration complete' },
      { it: 'Velocità entro i limiti previsti', en: 'Speed within the prescribed limits' },
      { it: 'Rateo di discesa non superiore a 1000 ft/min', en: 'Rate of descent not exceeding 1000 ft/min' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Al gate il carrello deve essere esteso e bloccato: fa parte della configurazione di atterraggio.',
      en: 'At the gate the gear must be down and locked: it is part of the landing configuration.',
    },
  },
  {
    id: 'app-3',
    topic: 'approach',
    stem: {
      it: 'Durante il flare l’aereo scende oltre la zona di contatto prevista. La risposta corretta è:',
      en: 'During the flare the aircraft floats beyond the intended touchdown zone. The correct response is:',
    },
    options: [
      { it: 'Go-around: una lunga fluttuazione compromette la distanza di arresto', en: 'Go-around: a long float compromises the stopping distance' },
      { it: 'Spingere per forzare il contatto', en: 'Push to force the touchdown' },
      { it: 'Aumentare la frenata dopo il contatto', en: 'Increase braking after touchdown' },
      { it: 'Continuare: il contatto è comunque garantito', en: 'Continue: touchdown is guaranteed anyway' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'La distanza di atterraggio è certificata a partire da una specifica zona di contatto. La riattaccata è sempre disponibile e non va mai considerata un fallimento.',
      en: 'Landing distance is certified from a specific touchdown zone. The go-around is always available and is never a failure.',
    },
  },

  // ----------------------------------------------------------------- altimetry
  {
    id: 'alt-1',
    topic: 'altimetry',
    stem: {
      it: 'Che cos’è l’altitudine di pressione?',
      en: 'What is pressure altitude?',
    },
    options: [
      { it: 'L’altitudine indicata con l’altimetro regolato su 1013,25 hPa', en: 'The altitude shown with the altimeter set to 1013.25 hPa' },
      { it: 'L’altitudine vera sul livello del mare', en: 'The true altitude above sea level' },
      { it: 'L’altezza sul terreno', en: 'The height above the ground' },
      { it: 'L’altitudine corretta per la temperatura', en: 'The altitude corrected for temperature' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'È l’altitudine nell’atmosfera standard: si ottiene impostando la pressione standard 1013,25 hPa.',
      en: 'It is the altitude in the standard atmosphere: obtained by setting the standard pressure of 1013.25 hPa.',
    },
  },
  {
    id: 'alt-2',
    topic: 'altimetry',
    stem: {
      it: 'A parità di quota, un aumento di temperatura fa sì che l’altitudine di densità:',
      en: 'At the same altitude, a rise in temperature makes density altitude:',
    },
    options: [
      { it: 'Aumenti, peggiorando le prestazioni', en: 'Increase, degrading performance' },
      { it: 'Diminuisca, migliorando le prestazioni', en: 'Decrease, improving performance' },
      { it: 'Resti invariata', en: 'Stay the same' },
      { it: 'Dipenda solo dall’umidità', en: 'Depend on humidity only' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Aria calda = aria meno densa: meno portanza, meno spinta, corsa di decollo più lunga. "Hot, high and heavy" è la combinazione peggiore.',
      en: 'Warm air = less dense air: less lift, less thrust, longer take-off run. "Hot, high and heavy" is the worst combination.',
    },
  },
  {
    id: 'alt-3',
    topic: 'altimetry',
    stem: {
      it: 'Volando da una zona di alta pressione verso una di bassa pressione senza aggiornare il QNH, l’altimetro:',
      en: 'Flying from high pressure towards low pressure without updating the QNH, the altimeter:',
    },
    options: [
      { it: 'Sovrastima: sei più basso di quanto indicato', en: 'Over-reads: you are lower than indicated' },
      { it: 'Sottostima: sei più alto di quanto indicato', en: 'Under-reads: you are higher than indicated' },
      { it: 'Resta corretto', en: 'Stays correct' },
      { it: 'Si blocca', en: 'Freezes' },
    ],
    correctIndex: 0,
    explanation: {
      it: '"From high to low, look out below". Lo stesso vale con temperature più fredde del previsto.',
      en: '"From high to low, look out below". The same applies with colder-than-standard temperatures.',
    },
  },
  {
    id: 'alt-4',
    topic: 'altimetry',
    stem: {
      it: 'Quanto vale approssimativamente 1 hPa di variazione di pressione in piedi, a bassa quota?',
      en: 'Approximately how many feet does 1 hPa of pressure change correspond to at low level?',
    },
    options: [
      { it: '27 ft', en: '27 ft' },
      { it: '10 ft', en: '10 ft' },
      { it: '100 ft', en: '100 ft' },
      { it: '3 ft', en: '3 ft' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Circa 27 ft per hPa vicino al livello del mare (30 ft è l’approssimazione d’uso comune).',
      en: 'About 27 ft per hPa near sea level (30 ft is the common working approximation).',
    },
  },

  // ------------------------------------------------------------------- systems
  {
    id: 'sys-1',
    topic: 'systems',
    stem: {
      it: 'In un turbofan, qual è la sequenza corretta del flusso attraverso il motore?',
      en: 'In a turbofan, what is the correct sequence of flow through the engine?',
    },
    options: [
      { it: 'Fan → compressore → camera di combustione → turbina → ugello', en: 'Fan → compressor → combustion chamber → turbine → nozzle' },
      { it: 'Fan → turbina → camera di combustione → compressore → ugello', en: 'Fan → turbine → combustion chamber → compressor → nozzle' },
      { it: 'Compressore → fan → turbina → camera di combustione', en: 'Compressor → fan → turbine → combustion chamber' },
      { it: 'Camera di combustione → compressore → fan → turbina', en: 'Combustion chamber → compressor → fan → turbine' },
    ],
    correctIndex: 0,
    explanation: {
      it: '“Suck, squeeze, bang, blow”. La turbina estrae energia per muovere compressore e fan; il resto genera spinta.',
      en: '“Suck, squeeze, bang, blow”. The turbine extracts energy to drive the compressor and fan; the rest makes thrust.',
    },
  },
  {
    id: 'sys-2',
    topic: 'systems',
    stem: {
      it: 'In un turbofan ad alto rapporto di diluizione, la maggior parte della spinta è prodotta da:',
      en: 'In a high-bypass turbofan, most of the thrust is produced by:',
    },
    options: [
      { it: 'Il flusso freddo che passa attorno al nucleo (fan)', en: 'The cold flow bypassing the core (fan)' },
      { it: 'Il flusso caldo dei gas di scarico', en: 'The hot exhaust flow' },
      { it: 'La turbina di alta pressione', en: 'The high-pressure turbine' },
      { it: 'Il compressore assiale', en: 'The axial compressor' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Nei motori moderni il fan produce circa l’80% della spinta: accelerare molta aria di poco è più efficiente che accelerare poca aria di molto.',
      en: 'In modern engines the fan makes about 80% of the thrust: accelerating a lot of air a little is more efficient than a little air a lot.',
    },
  },
  {
    id: 'sys-3',
    topic: 'systems',
    stem: {
      it: 'Le luci di bordo pista (runway edge lights) sono di colore:',
      en: 'Runway edge lights are:',
    },
    options: [
      { it: 'Bianche, con ambra nell’ultima parte della pista', en: 'White, turning amber over the final portion of the runway' },
      { it: 'Blu', en: 'Blue' },
      { it: 'Verdi per tutta la lunghezza', en: 'Green for the full length' },
      { it: 'Rosse per tutta la lunghezza', en: 'Red for the full length' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Bordo pista: bianche, ambra negli ultimi 600 m. Soglia: verdi. Fine pista: rosse. Bordo via di rullaggio: blu; asse via di rullaggio: verdi.',
      en: 'Runway edge: white, amber over the last 600 m. Threshold: green. Runway end: red. Taxiway edge: blue; taxiway centreline: green.',
    },
  },

  // --------------------------------------------------------------- meteorology
  {
    id: 'met-1',
    topic: 'meteorology',
    stem: {
      it: 'Che cos’è il windshear e perché è pericoloso in finale?',
      en: 'What is windshear and why is it dangerous on final?',
    },
    options: [
      { it: 'Una variazione rapida di vento che altera la velocità all’aria e il sentiero', en: 'A rapid change of wind that alters airspeed and flight path' },
      { it: 'Una turbolenza in quota senza effetti sulla velocità', en: 'High-altitude turbulence with no effect on speed' },
      { it: 'Un aumento graduale della temperatura', en: 'A gradual rise in temperature' },
      { it: 'Una riduzione di visibilità dovuta alla foschia', en: 'A visibility reduction caused by mist' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'In finale un calo improvviso di vento frontale riduce la velocità all’aria e la portanza, proprio dove non c’è quota per recuperare.',
      en: 'On final a sudden loss of headwind cuts airspeed and lift, exactly where there is no altitude to recover.',
    },
  },
  {
    id: 'met-2',
    topic: 'meteorology',
    stem: {
      it: 'Quale nube è associata a temporali, grandine e forte turbolenza?',
      en: 'Which cloud is associated with thunderstorms, hail and severe turbulence?',
    },
    options: [
      { it: 'Cumulonembo (CB)', en: 'Cumulonimbus (CB)' },
      { it: 'Cirro (CI)', en: 'Cirrus (CI)' },
      { it: 'Strato (ST)', en: 'Stratus (ST)' },
      { it: 'Altostrato (AS)', en: 'Altostratus (AS)' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Il CB va evitato lateralmente: la regola pratica è almeno 20 NM sopravento, e mai sorvolarlo.',
      en: 'A CB must be avoided laterally: the rule of thumb is at least 20 NM upwind, and never overfly it.',
    },
  },
  {
    id: 'met-3',
    topic: 'meteorology',
    stem: {
      it: 'Un TAF si distingue da un METAR perché:',
      en: 'A TAF differs from a METAR because:',
    },
    options: [
      { it: 'È una previsione per un periodo futuro, il METAR è un’osservazione', en: 'It is a forecast for a future period, while a METAR is an observation' },
      { it: 'È più preciso del METAR', en: 'It is more accurate than a METAR' },
      { it: 'Riguarda solo il vento', en: 'It only covers wind' },
      { it: 'Si emette solo in caso di maltempo', en: 'It is issued only in bad weather' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'TAF = previsione (tipicamente 9, 24 o 30 ore). METAR = osservazione dell’istante, emessa di norma ogni 30 minuti.',
      en: 'TAF = forecast (typically 9, 24 or 30 hours). METAR = a point-in-time observation, usually issued every 30 minutes.',
    },
  },

  // ---------------------------------------------------------------- principles
  {
    id: 'pri-1',
    topic: 'principles',
    stem: {
      it: 'Che cosa provoca lo stallo di un’ala?',
      en: 'What causes a wing to stall?',
    },
    options: [
      { it: 'Il superamento dell’angolo di attacco critico', en: 'Exceeding the critical angle of attack' },
      { it: 'Una velocità troppo bassa, in qualunque condizione', en: 'Too low a speed, in any condition' },
      { it: 'Il peso eccessivo', en: 'Excessive weight' },
      { it: 'Una quota troppo elevata', en: 'Too high an altitude' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Un’ala stalla sempre allo stesso angolo di attacco critico, a qualsiasi velocità, assetto o peso. La velocità di stallo cambia, l’angolo no.',
      en: 'A wing always stalls at the same critical angle of attack, at any speed, attitude or weight. The stall speed changes, the angle does not.',
    },
  },
  {
    id: 'pri-2',
    topic: 'principles',
    stem: {
      it: 'Quali sono le quattro forze che agiscono su un aereo in volo livellato?',
      en: 'What are the four forces acting on an aircraft in level flight?',
    },
    options: [
      { it: 'Portanza, peso, spinta, resistenza', en: 'Lift, weight, thrust, drag' },
      { it: 'Portanza, peso, momento, spinta', en: 'Lift, weight, moment, thrust' },
      { it: 'Spinta, resistenza, coppia, portanza', en: 'Thrust, drag, torque, lift' },
      { it: 'Peso, coppia, spinta, resistenza', en: 'Weight, torque, thrust, drag' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'In volo livellato non accelerato: portanza = peso e spinta = resistenza.',
      en: 'In unaccelerated level flight: lift = weight and thrust = drag.',
    },
  },
  {
    id: 'pri-3',
    topic: 'principles',
    stem: {
      it: 'La resistenza indotta come varia al diminuire della velocità?',
      en: 'How does induced drag change as speed decreases?',
    },
    options: [
      { it: 'Aumenta', en: 'It increases' },
      { it: 'Diminuisce', en: 'It decreases' },
      { it: 'Resta costante', en: 'It stays constant' },
      { it: 'Si annulla', en: 'It disappears' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'La resistenza indotta è inversamente proporzionale al quadrato della velocità: a bassa velocità serve un angolo di attacco alto, e i vortici d’estremità crescono.',
      en: 'Induced drag is inversely proportional to the square of speed: at low speed a high angle of attack is needed and wingtip vortices grow.',
    },
  },

  // --------------------------------------------------------------------- fuel
  {
    id: 'fue-1',
    topic: 'fuel',
    stem: {
      it: 'Che cos’è la final reserve fuel?',
      en: 'What is final reserve fuel?',
    },
    options: [
      { it: 'Il carburante per 30 minuti di attesa a 1500 ft sull’aeroporto di alternato', en: 'Fuel for 30 minutes of holding at 1500 ft over the alternate' },
      { it: 'Il carburante per raggiungere l’alternato', en: 'The fuel to reach the alternate' },
      { it: 'Il carburante extra richiesto dal comandante', en: 'Extra fuel requested by the captain' },
      { it: 'Il carburante consumato durante il rullaggio', en: 'The fuel burned while taxiing' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Per i jet: 30 minuti di attesa a 1500 ft sopra l’alternato, in condizioni standard, al peso stimato di arrivo. È intoccabile: se prevedi di intaccarla, dichiari MAYDAY FUEL.',
      en: 'For jets: 30 minutes of holding at 1500 ft over the alternate, in standard conditions, at estimated arrival weight. It is untouchable: if you expect to eat into it, you declare MAYDAY FUEL.',
    },
  },
  {
    id: 'fue-2',
    topic: 'fuel',
    stem: {
      it: 'Quando va dichiarato "MINIMUM FUEL"?',
      en: 'When should "MINIMUM FUEL" be declared?',
    },
    options: [
      { it: 'Quando ci si impegna a un aeroporto specifico e ogni ulteriore ritardo intaccherebbe la final reserve', en: 'When committed to a specific aerodrome and any further delay would eat into final reserve' },
      { it: 'Appena il carburante scende sotto metà serbatoio', en: 'As soon as fuel drops below half tanks' },
      { it: 'Solo dopo aver dichiarato emergenza', en: 'Only after declaring an emergency' },
      { it: 'Quando si consuma più del previsto, in qualunque fase', en: 'Whenever burn is higher than planned, at any stage' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'MINIMUM FUEL è un avviso, non un’emergenza: informa l’ATC che non si può accettare altro ritardo. Se la final reserve verrà intaccata si dichiara MAYDAY FUEL.',
      en: 'MINIMUM FUEL is advisory, not an emergency: it tells ATC no further delay can be accepted. If final reserve will be used you declare MAYDAY FUEL.',
    },
  },
  {
    id: 'fue-3',
    topic: 'fuel',
    stem: {
      it: 'Quando è richiesto un aeroporto alternato di destinazione?',
      en: 'When is a destination alternate required?',
    },
    options: [
      { it: 'Quasi sempre, salvo condizioni meteo e requisiti di pista molto favorevoli entro finestre definite', en: 'Almost always, unless weather and runway requirements are very favourable within defined windows' },
      { it: 'Mai, per i voli commerciali', en: 'Never, for commercial flights' },
      { it: 'Solo di notte', en: 'Only at night' },
      { it: 'Solo per voli oltre le 3 ore', en: 'Only for flights over 3 hours' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'L’alternato si può omettere solo con meteo garantito ben sopra i minimi in una finestra attorno all’ETA e con due piste utilizzabili e indipendenti.',
      en: 'The alternate can be omitted only with weather comfortably above minima in a window around the ETA and two usable, independent runways.',
    },
  },
]
