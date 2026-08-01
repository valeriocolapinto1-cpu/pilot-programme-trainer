import type { Bilingual, BilingualList } from '@/i18n'

/**
 * Assessment-day content: group exercise scenarios, the CRM rubric assessors
 * are reported to use, and the interview question bank (behavioural, CRM
 * situational and motivational).
 */

// ---------------------------------------------------------------- group work

export type GroupScenario = {
  id: string
  title: Bilingual
  brief: Bilingual
  /** Deliberately insufficient — that is the design of the real exercise. */
  constraints: BilingualList
  /** What a strong group produces, revealed after the timer. */
  debrief: BilingualList
}

export const GROUP_SCENARIOS: GroupScenario[] = [
  {
    id: 'grp-diversion',
    title: { it: 'Dirottamento con risorse limitate', en: 'Diversion with limited resources' },
    brief: {
      it: 'Il vostro gruppo gestisce le operazioni di uno scalo. Tre voli in arrivo devono essere dirottati per la chiusura improvvisa della pista principale. Ci sono solo due piazzole disponibili, un solo autobus per i passeggeri e un equipaggio di terra. Il volo A ha 180 passeggeri e 40 minuti di autonomia residua; il volo B ha 90 passeggeri, un passeggero con un problema medico e 25 minuti; il volo C ha 210 passeggeri e 55 minuti. Decidete l’ordine e l’assegnazione delle risorse.',
      en: 'Your group runs operations at an airport. Three inbound flights must divert because the main runway has closed without warning. There are only two stands available, one passenger bus and one ground crew. Flight A has 180 passengers and 40 minutes of fuel remaining; Flight B has 90 passengers, one passenger with a medical issue and 25 minutes; Flight C has 210 passengers and 55 minutes. Decide the order and how to allocate resources.',
    },
    constraints: {
      it: [
        'Avete 8 minuti: non basteranno per una soluzione perfetta.',
        'Mancano informazioni (meteo, tipo di emergenza medica, orari equipaggi): è voluto.',
        'Il gruppo deve arrivare a una proposta unica e saperla motivare.',
      ],
      en: [
        'You have 8 minutes: not enough for a perfect solution.',
        'Information is missing (weather, nature of the medical issue, crew hours): that is deliberate.',
        'The group must reach a single proposal and be able to justify it.',
      ],
    },
    debrief: {
      it: [
        'La soluzione “giusta” non esiste: si valuta come il gruppo decide, non cosa decide.',
        'Un gruppo forte esplicita le assunzioni mancanti invece di ignorarle.',
        'Il carburante residuo è il vincolo dominante: chi lo riconosce per primo dà un contributo di sostanza.',
        'Chi propone di chiedere le informazioni mancanti mostra il riflesso giusto.',
        'Nell’ultimo minuto qualcuno deve riassumere e verificare che tutti siano d’accordo.',
      ],
      en: [
        'There is no “right” answer: what is assessed is how the group decides, not what it decides.',
        'A strong group states its missing assumptions instead of ignoring them.',
        'Remaining fuel is the dominant constraint: whoever spots it first adds real substance.',
        'Proposing to ask for the missing information shows the right reflex.',
        'In the final minute someone must summarise and check everyone agrees.',
      ],
    },
  },
  {
    id: 'grp-survival',
    title: { it: 'Priorità dopo un atterraggio di emergenza', en: 'Priorities after an emergency landing' },
    brief: {
      it: 'Dopo un atterraggio di emergenza in una zona remota, il gruppo deve ordinare per priorità otto oggetti recuperati: un kit di pronto soccorso, 4 litri d’acqua, una radio a batteria scarica, uno specchio da segnalazione, un accendino, una coperta termica, una mappa della zona, una torcia. Ordinateli e motivate le prime tre scelte.',
      en: 'After an emergency landing in a remote area, the group must rank eight recovered items: a first-aid kit, 4 litres of water, a radio with a low battery, a signalling mirror, a lighter, a thermal blanket, a map of the area, a torch. Rank them and justify the top three.',
    },
    constraints: {
      it: [
        '7 minuti in totale.',
        'Non è indicato il clima né la stagione: dovete decidere come trattarlo.',
        'Ogni membro deve poter spiegare la classifica finale.',
      ],
      en: [
        '7 minutes in total.',
        'Neither the climate nor the season is given: you must decide how to handle that.',
        'Every member must be able to explain the final ranking.',
      ],
    },
    debrief: {
      it: [
        'I gruppi deboli discutono all’infinito il singolo oggetto; quelli forti fissano prima un criterio (essere trovati vs. sopravvivere).',
        'Definire il criterio in apertura fa risparmiare metà del tempo.',
        'Chi cambia idea di fronte a un argomento migliore ottiene un punteggio migliore, non peggiore.',
        'La segnalazione (specchio, torcia) batte quasi sempre il comfort: si viene soccorsi, non si sopravvive da soli.',
      ],
      en: [
        'Weak groups argue endlessly about single items; strong ones agree a criterion first (be found vs. survive).',
        'Setting the criterion up front saves half the time.',
        'Changing your mind when given a better argument scores higher, not lower.',
        'Signalling (mirror, torch) almost always beats comfort: you get rescued, you do not survive alone.',
      ],
    },
  },
  {
    id: 'grp-roster',
    title: { it: 'Turni e vincoli di equipaggio', en: 'Rostering under crew constraints' },
    brief: {
      it: 'Dovete coprire 5 voli in una giornata con 3 equipaggi. Un equipaggio ha 2 ore residue di tempo di servizio, uno ha appena finito il riposo minimo, uno è in stand-by ma a 90 minuti dall’aeroporto. Due voli sono in ritardo di 40 minuti. Decidete l’assegnazione e cosa cancellare se necessario.',
      en: 'You must cover 5 flights in one day with 3 crews. One crew has 2 hours of duty time left, one has just completed minimum rest, one is on standby but 90 minutes from the airport. Two flights are 40 minutes late. Decide the allocation and what to cancel if needed.',
    },
    constraints: {
      it: [
        '8 minuti.',
        'Non potete coprire tutto: una cancellazione è quasi certa.',
        'Il gruppo deve dichiarare esplicitamente il criterio di scelta.',
      ],
      en: [
        '8 minutes.',
        'You cannot cover everything: a cancellation is close to certain.',
        'The group must state its decision criterion explicitly.',
      ],
    },
    debrief: {
      it: [
        'I limiti di tempo di servizio non sono negoziabili: chi propone di “sforare un po’” perde punti in modo netto.',
        'Dichiarare presto che una cancellazione è inevitabile è un segno di maturità operativa, non di resa.',
        'Il gruppo deve decidere in base a un criterio (passeggeri coinvolti? connessioni? equipaggio bloccato fuori base?), non a preferenze.',
      ],
      en: [
        'Duty-time limits are not negotiable: proposing to “stretch them a bit” loses marks sharply.',
        'Saying early that a cancellation is unavoidable shows operational maturity, not defeat.',
        'The group must decide on a criterion (passengers affected? connections? crew stranded away from base?), not on preferences.',
      ],
    },
  },
]

/** The CRM behaviours reported as the assessment criteria for group work. */
export type CrmDimension = {
  id: string
  label: Bilingual
  good: Bilingual
  bad: Bilingual
}

export const CRM_RUBRIC: CrmDimension[] = [
  {
    id: 'communication',
    label: { it: 'Qualità della comunicazione', en: 'Quality of communication' },
    good: {
      it: 'Hai parlato in modo chiaro e conciso, riassumendo quando il gruppo si perdeva.',
      en: 'You spoke clearly and concisely, summarising when the group drifted.',
    },
    bad: {
      it: 'Hai parlato molto senza aggiungere informazione, o troppo poco per essere utile.',
      en: 'You talked a lot without adding information, or too little to be useful.',
    },
  },
  {
    id: 'listening',
    label: { it: 'Ascolto attivo', en: 'Active listening' },
    good: {
      it: 'Hai ripreso le idee degli altri citandole, e hai fatto domande invece di ripetere le tue.',
      en: 'You built on others’ ideas by name, and asked questions instead of repeating your own.',
    },
    bad: {
      it: 'Hai aspettato il tuo turno per parlare invece di ascoltare davvero.',
      en: 'You waited for your turn to speak instead of actually listening.',
    },
  },
  {
    id: 'leadership',
    label: { it: 'Equilibrio leadership / followership', en: 'Leadership / followership balance' },
    good: {
      it: 'Hai guidato quando il gruppo era bloccato e hai seguito quando qualcun altro aveva l’idea migliore.',
      en: 'You led when the group was stuck and followed when someone else had the better idea.',
    },
    bad: {
      it: 'Hai dominato la discussione, oppure sei rimasto passivo per tutta la durata.',
      en: 'You dominated the discussion, or stayed passive throughout.',
    },
  },
  {
    id: 'inclusion',
    label: { it: 'Inclusione', en: 'Inclusion' },
    good: {
      it: 'Hai coinvolto chi era rimasto in silenzio, chiedendogli esplicitamente un parere.',
      en: 'You brought in whoever had gone quiet by explicitly asking for their view.',
    },
    bad: {
      it: 'Hai lasciato che due o tre persone monopolizzassero la discussione.',
      en: 'You let two or three people monopolise the discussion.',
    },
  },
  {
    id: 'composure',
    label: { it: 'Compostezza sotto pressione', en: 'Composure under time pressure' },
    good: {
      it: 'Hai tenuto d’occhio il tempo e sei rimasto calmo quando è diventato stretto.',
      en: 'You kept an eye on the clock and stayed calm when it got tight.',
    },
    bad: {
      it: 'Ti sei irrigidito sulla tua soluzione o sei diventato visibilmente competitivo.',
      en: 'You dug in on your own solution or became visibly competitive.',
    },
  },
]

// ----------------------------------------------------------------- interview

export type InterviewCategory = 'star' | 'crm' | 'motivational'

export type InterviewQuestion = {
  id: string
  category: InterviewCategory
  question: Bilingual
  /** What the assessors are actually listening for. */
  looksFor: BilingualList
  /** Traps that sink otherwise good answers. */
  avoid: Bilingual
}

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  // ---------------------------------------------------------------- STAR
  {
    id: 'iv-star-1',
    category: 'star',
    question: {
      it: 'Parlami di te. (60-90 secondi)',
      en: 'Tell me about yourself. (60-90 seconds)',
    },
    looksFor: {
      it: [
        'Una struttura: chi sei ora, come ci sei arrivato, perché sei qui oggi.',
        'Due o tre fatti verificabili, non aggettivi su di te.',
        'Un finale che porta naturalmente alla candidatura.',
      ],
      en: [
        'A structure: who you are now, how you got here, why you are here today.',
        'Two or three checkable facts, not adjectives about yourself.',
        'An ending that leads naturally into the application.',
      ],
    },
    avoid: {
      it: 'Ripetere il CV in ordine cronologico, o superare i 90 secondi: è la prima prova di gestione del tempo.',
      en: 'Reciting your CV in chronological order, or running past 90 seconds: it is the first test of time management.',
    },
  },
  {
    id: 'iv-star-2',
    category: 'star',
    question: {
      it: 'Raccontami una volta in cui hai commesso un errore significativo. Cosa è successo?',
      en: 'Tell me about a time you made a significant mistake. What happened?',
    },
    looksFor: {
      it: [
        'Un errore vero, con conseguenze reali: la scelta dell’episodio è già una risposta.',
        'Cosa hai fatto subito dopo, e se lo hai segnalato.',
        'Cosa hai cambiato in modo permanente nel tuo modo di lavorare.',
      ],
      en: [
        'A real mistake with real consequences: which episode you pick is already an answer.',
        'What you did immediately afterwards, and whether you reported it.',
        'What you permanently changed in how you work.',
      ],
    },
    avoid: {
      it: 'L’errore finto (“sono troppo perfezionista”) e la colpa scaricata su altri. In una compagnia con just culture, chi non segnala è il vero problema.',
      en: 'The fake mistake (“I am too much of a perfectionist”) and blame shifted onto others. In a just-culture airline, not reporting is the real problem.',
    },
  },
  {
    id: 'iv-star-3',
    category: 'star',
    question: {
      it: 'Descrivi una situazione in cui hai dovuto lavorare con qualcuno con cui non andavi d’accordo.',
      en: 'Describe a situation where you had to work with someone you did not get on with.',
    },
    looksFor: {
      it: [
        'Separazione fra la persona e il problema operativo.',
        'Un’azione concreta che hai preso tu, non che ha preso qualcun altro.',
        'Un risultato misurabile e una lezione applicabile a un cockpit.',
      ],
      en: [
        'Separating the person from the operational problem.',
        'A concrete action that you took, not that somebody else took.',
        'A measurable outcome and a lesson that transfers to a cockpit.',
      ],
    },
    avoid: {
      it: 'Parlare male dell’altra persona: in equipaggio non puoi scegliere con chi voli.',
      en: 'Speaking badly of the other person: in a crew you do not choose who you fly with.',
    },
  },
  {
    id: 'iv-star-4',
    category: 'star',
    question: {
      it: 'Raccontami di quando hai dovuto prendere una decisione con informazioni incomplete.',
      en: 'Tell me about a time you had to decide with incomplete information.',
    },
    looksFor: {
      it: [
        'Come hai stabilito cosa mancava e quanto tempo avevi.',
        'La decisione e il piano B che avevi tenuto pronto.',
        'La revisione: cosa hai fatto quando sono arrivate nuove informazioni.',
      ],
      en: [
        'How you established what was missing and how much time you had.',
        'The decision and the fallback you kept ready.',
        'The review: what you did when new information arrived.',
      ],
    },
    avoid: {
      it: 'Presentare la decisione come un colpo di fortuna, o non spiegare come l’hai rivista.',
      en: 'Presenting the decision as a lucky guess, or not explaining how you revisited it.',
    },
  },
  {
    id: 'iv-star-5',
    category: 'star',
    question: {
      it: 'Parlami di un momento in cui hai dovuto imparare qualcosa di difficile in poco tempo.',
      en: 'Tell me about a time you had to learn something difficult quickly.',
    },
    looksFor: {
      it: [
        'Il metodo di studio, non solo il risultato: l’addestrabilità è il criterio numero uno per un cadetto.',
        'Come hai capito di essere indietro e cosa hai cambiato.',
        'Come hai chiesto aiuto.',
      ],
      en: [
        'Your study method, not just the outcome: trainability is the number-one criterion for a cadet.',
        'How you realised you were behind and what you changed.',
        'How you asked for help.',
      ],
    },
    avoid: {
      it: '“Ho solo studiato tanto”: non dice nulla sul come.',
      en: '“I just studied a lot”: it says nothing about how.',
    },
  },
  {
    id: 'iv-star-6',
    category: 'star',
    question: {
      it: 'Descrivi una volta in cui hai ricevuto una critica dura. Come hai reagito?',
      en: 'Describe a time you received harsh criticism. How did you react?',
    },
    looksFor: {
      it: [
        'La reazione immediata, onestamente descritta.',
        'Cosa hai fatto dopo aver metabolizzato.',
        'Se sei tornato dalla persona per chiedere un riscontro.',
      ],
      en: [
        'Your immediate reaction, honestly described.',
        'What you did once you had processed it.',
        'Whether you went back to the person for follow-up feedback.',
      ],
    },
    avoid: {
      it: 'Sostenere di non essere mai stato criticato, o che la critica era ingiusta e basta.',
      en: 'Claiming you have never been criticised, or that the criticism was simply unfair.',
    },
  },

  // ----------------------------------------------------------------- CRM
  {
    id: 'iv-crm-1',
    category: 'crm',
    question: {
      it: 'Prima di un volo sospetti che il comandante abbia bevuto. Cosa fai?',
      en: 'Before a flight you suspect the captain has been drinking. What do you do?',
    },
    looksFor: {
      it: [
        'Parli prima con lui, in privato, in modo non accusatorio: “ho notato X, aiutami a capire”.',
        'Se il dubbio resta, il volo non parte: non si tratta di una scelta personale ma di una procedura.',
        'Coinvolgi chi di dovere (crew control / duty manager) e documenti.',
        'Nessun accenno a “coprire” il collega o a decidere da solo di sorvolare.',
      ],
      en: [
        'You speak to them first, privately and non-accusingly: “I noticed X, help me understand”.',
        'If the doubt remains, the flight does not go: this is a procedure, not a personal judgement.',
        'You involve the right people (crew control / duty manager) and document it.',
        'No hint of covering for a colleague or deciding alone to let it slide.',
      ],
    },
    avoid: {
      it: 'Sia l’accusa pubblica immediata sia il silenzio: la risposta corretta è escalation strutturata.',
      en: 'Both immediate public accusation and silence: the correct answer is structured escalation.',
    },
  },
  {
    id: 'iv-crm-2',
    category: 'crm',
    question: {
      it: 'In crociera sospetti una perdita di carburante. L’alternato è sotto minima. Come procedi?',
      en: 'In the cruise you suspect a fuel leak. The alternate is below minima. How do you proceed?',
    },
    looksFor: {
      it: [
        'Prima di tutto: pilotare, navigare, comunicare. Poi la checklist appropriata.',
        'Confermi la perdita incrociando le indicazioni (totalizzatore vs. quantità, bilanciamento, FF).',
        'Rivedi le opzioni: aeroporto più vicino adeguato, non necessariamente quello pianificato.',
        'Comunichi presto ad ATC e dichiari quando serve: MINIMUM FUEL è un avviso, MAYDAY FUEL un’emergenza.',
      ],
      en: [
        'First: aviate, navigate, communicate. Then the appropriate checklist.',
        'You confirm the leak by cross-checking indications (totaliser vs. quantity, balance, fuel flow).',
        'You reassess the options: the nearest suitable airport, not necessarily the planned one.',
        'You talk to ATC early and declare when needed: MINIMUM FUEL is advisory, MAYDAY FUEL is an emergency.',
      ],
    },
    avoid: {
      it: 'Proseguire verso la destinazione pianificata “perché è nel piano di volo”.',
      en: 'Pressing on to the planned destination “because it is in the flight plan”.',
    },
  },
  {
    id: 'iv-crm-3',
    category: 'crm',
    question: {
      it: 'Il comandante vuole continuare un approccio che tu ritieni instabile. Cosa dici?',
      en: 'The captain wants to continue an approach you consider unstable. What do you say?',
    },
    looksFor: {
      it: [
        'Assertività strutturata: nomina il problema con dati (“velocità +20, non configurati a 1000 ft”).',
        'Escalation a due passi: enunciare la preoccupazione, poi proporre l’azione (“go-around”).',
        'Se non c’è risposta e i criteri restano violati, chiami tu la riattaccata.',
        'Debriefing a terra, senza farne una questione personale.',
      ],
      en: [
        'Structured assertiveness: name the problem with data (“speed +20, not configured at 1000 ft”).',
        'Two-step escalation: state the concern, then propose the action (“go-around”).',
        'If there is no response and the criteria stay breached, you call the go-around yourself.',
        'Debrief on the ground, without making it personal.',
      ],
    },
    avoid: {
      it: 'Il silenzio per deferenza e lo scontro frontale: entrambi sono errori CRM classici.',
      en: 'Silence out of deference and head-on confrontation: both are classic CRM failures.',
    },
  },
  {
    id: 'iv-crm-4',
    category: 'crm',
    question: {
      it: 'Un collega di equipaggio ti dice che è esausto e non se la sente di volare. Sei in ritardo di 40 minuti.',
      en: 'A crew member tells you they are exhausted and do not feel fit to fly. You are already 40 minutes late.',
    },
    looksFor: {
      it: [
        'La fatica è un pericolo dichiarabile, non una debolezza: prendi la dichiarazione sul serio.',
        'Non provi a convincerlo: chiedi informazioni e coinvolgi crew control.',
        'Riconosci esplicitamente la pressione del ritardo e la metti da parte come fattore non rilevante per la sicurezza.',
      ],
      en: [
        'Fatigue is a reportable hazard, not a weakness: you take the declaration seriously.',
        'You do not try to talk them round: you gather information and involve crew control.',
        'You explicitly name the delay pressure and set it aside as irrelevant to the safety decision.',
      ],
    },
    avoid: {
      it: '“Facciamo solo questa tratta”: è esattamente la pressione commerciale che il CRM esiste per contrastare.',
      en: '“Let’s just do this one sector”: exactly the commercial pressure CRM exists to counter.',
    },
  },

  // -------------------------------------------------------- motivational
  {
    id: 'iv-mot-1',
    category: 'motivational',
    question: { it: 'Perché Wizz Air?', en: 'Why Wizz Air?' },
    looksFor: {
      it: [
        'Elementi specifici: tipo di flotta (A321neo), basi, strategia di crescita, struttura AOC.',
        'Un collegamento fra quei fatti e la tua situazione concreta.',
        'Consapevolezza del modello ULCC e di cosa comporta nella vita quotidiana.',
      ],
      en: [
        'Specific elements: fleet type (A321neo), bases, growth strategy, AOC structure.',
        'A link between those facts and your actual situation.',
        'Awareness of the ULCC model and what it means day to day.',
      ],
    },
    avoid: {
      it: 'Risposte che varrebbero per qualsiasi compagnia: “perché volete crescere e amo volare”.',
      en: 'Answers that would fit any airline: “because you are growing and I love flying”.',
    },
  },
  {
    id: 'iv-mot-2',
    category: 'motivational',
    question: {
      it: 'Sei disponibile ad autofinanziare il corso e a rimborsare il type rating dallo stipendio?',
      en: 'Are you prepared to self-fund the course and repay the type rating from your salary?',
    },
    looksFor: {
      it: [
        'Una risposta informata: sai quanto costa e come pensi di finanziarlo.',
        'Consapevolezza del possibile intervallo fra diploma e assegnazione del type rating.',
        'Nessuna sorpresa: chi non conosce i numeri sembra non aver fatto i conti.',
      ],
      en: [
        'An informed answer: you know the cost and how you plan to fund it.',
        'Awareness of the possible gap between graduation and type rating allocation.',
        'No surprises: not knowing the figures looks like you have not done the maths.',
      ],
    },
    avoid: {
      it: 'Rispondere solo “sì” senza dati: la domanda serve a verificare che tu abbia capito l’impegno.',
      en: 'Answering just “yes” with no figures: the question checks that you understand the commitment.',
    },
  },
  {
    id: 'iv-mot-3',
    category: 'motivational',
    question: {
      it: 'Hai una preferenza di base? Come reagiresti se ti assegnassero una base diversa?',
      en: 'Do you have a base preference? How would you react to being assigned a different one?',
    },
    looksFor: {
      it: [
        'Una preferenza onesta, con la motivazione.',
        'Flessibilità reale, non dichiarata: cosa faresti in pratica per trasferirti.',
        'Conoscenza delle basi effettivamente esistenti.',
      ],
      en: [
        'An honest preference, with the reason for it.',
        'Real flexibility, not just stated: what you would practically do to relocate.',
        'Knowledge of the bases that actually exist.',
      ],
    },
    avoid: {
      it: '“Vado ovunque” detto senza convinzione: se poi rifiuti, il problema è più grande.',
      en: '“I will go anywhere” said without conviction: refusing later is a bigger problem.',
    },
  },
  {
    id: 'iv-mot-4',
    category: 'motivational',
    question: {
      it: 'Quali domande hai per noi?',
      en: 'What questions do you have for us?',
    },
    looksFor: {
      it: [
        'Almeno due domande preparate, su addestramento, progressione o operazioni.',
        'Domande a cui non si risponde con una ricerca di trenta secondi.',
        'Curiosità sul mestiere, non solo su stipendio e turni.',
      ],
      en: [
        'At least two prepared questions, on training, progression or operations.',
        'Questions that a thirty-second search would not answer.',
        'Curiosity about the job, not only about pay and rosters.',
      ],
    },
    avoid: {
      it: '“Nessuna domanda, avete spiegato tutto”: è l’ultima impressione che lasci.',
      en: '“No questions, you covered everything”: it is the last impression you leave.',
    },
  },
  {
    id: 'iv-mot-5',
    category: 'motivational',
    question: {
      it: 'Perché vuoi fare il pilota, e perché adesso?',
      en: 'Why do you want to be a pilot, and why now?',
    },
    looksFor: {
      it: [
        'Una motivazione concreta, ancorata a esperienze verificabili.',
        'Consapevolezza del rovescio del mestiere: turni, notti fuori casa, controlli continui.',
        'Perché adesso: cosa ti ha portato a candidarti in questo momento.',
      ],
      en: [
        'A concrete motivation, anchored in verifiable experience.',
        'Awareness of the downside of the job: rosters, nights away, constant checking.',
        'Why now: what brought you to apply at this point.',
      ],
    },
    avoid: {
      it: 'Il racconto d’infanzia da solo: va bene come apertura, non come risposta intera.',
      en: 'The childhood story alone: fine as an opening, not as the whole answer.',
    },
  },
]

export const STAR_STEPS: { key: string; label: Bilingual; hint: Bilingual }[] = [
  {
    key: 'situation',
    label: { it: 'Situazione', en: 'Situation' },
    hint: {
      it: 'Dove, quando, chi c’era. Due frasi al massimo.',
      en: 'Where, when, who was there. Two sentences at most.',
    },
  },
  {
    key: 'task',
    label: { it: 'Compito', en: 'Task' },
    hint: {
      it: 'Qual era la tua responsabilità precisa, non quella del gruppo.',
      en: 'What exactly you were responsible for, not what the group was.',
    },
  },
  {
    key: 'action',
    label: { it: 'Azione', en: 'Action' },
    hint: {
      it: 'Cosa hai fatto tu, passo per passo. È la parte più lunga: usa “io”, non “noi”.',
      en: 'What you did, step by step. This is the longest part: use “I”, not “we”.',
    },
  },
  {
    key: 'result',
    label: { it: 'Risultato', en: 'Result' },
    hint: {
      it: 'Come è finita, possibilmente con un numero, e cosa hai imparato.',
      en: 'How it ended, ideally with a number, and what you learned.',
    },
  },
]
