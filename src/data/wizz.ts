import type { Bilingual } from '@/i18n'

/**
 * Wizz Air company knowledge for the motivational interview.
 *
 * These figures move fast — fleet size, bases and route counts change every
 * season. `VERIFIED_ON` is shown in the UI so the numbers are never taken as
 * current without checking wizzair.com and the corporate releases first.
 */
export const VERIFIED_ON = '2026-08-01'

export const SOURCE_NOTE: Bilingual = {
  it: 'Dati tratti dalla guida di selezione (aggiornata a metà 2026). Verifica sempre i numeri più recenti su wizzair.com prima del colloquio: flotta, basi e rotte cambiano ogni stagione.',
  en: 'Figures taken from the selection guide (current to mid-2026). Always check the latest numbers on wizzair.com before the interview: fleet, bases and routes change every season.',
}

export type WizzCard = {
  id: string
  category: 'identity' | 'fleet' | 'network' | 'strategy' | 'italy'
  front: Bilingual
  back: Bilingual
  /** Set when the fact is a figure that goes stale quickly. */
  volatile?: boolean
}

export const WIZZ_CARDS: WizzCard[] = [
  // ------------------------------------------------------------------ identity
  {
    id: 'wz-founded',
    category: 'identity',
    front: { it: 'Quando è stata fondata Wizz Air e da chi?', en: 'When was Wizz Air founded, and by whom?' },
    back: {
      it: 'Fondata nel 2003 da József Váradi, tuttora CEO. Sede a Budapest.',
      en: 'Founded in 2003 by József Váradi, still the CEO. Headquartered in Budapest.',
    },
  },
  {
    id: 'wz-first-flight',
    category: 'identity',
    front: { it: 'Qual è stato il primo volo Wizz Air?', en: "What was Wizz Air's first flight?" },
    back: {
      it: '19 maggio 2004, Katowice → London Luton.',
      en: '19 May 2004, Katowice → London Luton.',
    },
  },
  {
    id: 'wz-aocs',
    category: 'identity',
    front: { it: 'Quali AOC compongono il gruppo Wizz Air?', en: 'Which AOCs make up the Wizz Air group?' },
    back: {
      it: 'Wizz Air Hungary (2003), Wizz Air UK (2017) e Wizz Air Malta (2022).',
      en: 'Wizz Air Hungary (2003), Wizz Air UK (2017) and Wizz Air Malta (2022).',
    },
  },
  {
    id: 'wz-model',
    category: 'identity',
    front: { it: 'Che modello di business adotta Wizz Air?', en: "What is Wizz Air's business model?" },
    back: {
      it: 'Ultra-low-cost carrier (ULCC): costo unitario minimo, flotta a tipo unico, alta densità di posti, ricavi ancillari, elevata utilizzazione dei velivoli.',
      en: 'Ultra-low-cost carrier (ULCC): lowest unit cost, single-type fleet, high seat density, ancillary revenue, high aircraft utilisation.',
    },
  },

  // --------------------------------------------------------------------- fleet
  {
    id: 'wz-fleet-size',
    category: 'fleet',
    front: { it: 'Quanti velivoli conta la flotta Wizz Air?', en: 'How large is the Wizz Air fleet?' },
    back: {
      it: '262 velivoli in servizio all’estate 2026, con 39 A321neo consegnati nell’ultimo anno fiscale.',
      en: '262 aircraft in service as of summer 2026, with 39 A321neo delivered in the last financial year.',
    },
    volatile: true,
  },
  {
    id: 'wz-fleet-type',
    category: 'fleet',
    front: { it: 'Che tipo di velivoli opera Wizz Air?', en: 'What aircraft types does Wizz Air operate?' },
    back: {
      it: 'Flotta interamente Airbus A320/A321. Wizz Air è il più grande operatore mondiale dell’A321neo.',
      en: 'An all-Airbus A320/A321 fleet. Wizz Air is the world’s largest operator of the A321neo.',
    },
  },
  {
    id: 'wz-fleet-plan',
    category: 'fleet',
    front: { it: 'Qual è il piano di flotta a lungo termine?', en: 'What is the long-term fleet plan?' },
    back: {
      it: 'Flotta interamente A321neo dal 2033, fino a circa 380 velivoli (368 A321neo + 11 A321XLR).',
      en: 'An all-A321neo fleet from 2033, up to about 380 aircraft (368 A321neo + 11 A321XLR).',
    },
    volatile: true,
  },
  {
    id: 'wz-single-type',
    category: 'fleet',
    front: {
      it: 'Perché una flotta a tipo unico conviene a una ULCC?',
      en: 'Why does a single-type fleet suit a ULCC?',
    },
    back: {
      it: 'Riduce i costi di addestramento, semplifica la manutenzione e le scorte, e permette di impiegare gli equipaggi in modo intercambiabile su tutta la rete.',
      en: 'It cuts training costs, simplifies maintenance and spares, and lets crews be used interchangeably across the whole network.',
    },
  },

  // ------------------------------------------------------------------- network
  {
    id: 'wz-bases',
    category: 'network',
    front: { it: 'Quante basi ha Wizz Air e in quanti paesi?', en: 'How many bases does Wizz Air have, in how many countries?' },
    back: {
      it: '40 basi in 18 paesi, con oltre 100 rotte verso quasi 200 destinazioni.',
      en: '40 bases in 18 countries, with over 100 routes to nearly 200 destinations.',
    },
    volatile: true,
  },
  {
    id: 'wz-abu-dhabi',
    category: 'network',
    front: { it: 'Che cosa è successo alla joint venture di Abu Dhabi?', en: 'What happened to the Abu Dhabi joint venture?' },
    back: {
      it: 'Uscita effettiva dal 1° settembre 2025, con sospensione di tutte le operazioni locali e rifocalizzazione su Europa Centrale/Orientale e su alcuni mercati dell’Europa occidentale.',
      en: 'Exit effective 1 September 2025, suspending all local operations and refocusing on Central/Eastern Europe and selected Western European markets.',
    },
  },

  // ------------------------------------------------------------------ strategy
  {
    id: 'wz-focus',
    category: 'strategy',
    front: { it: 'Su quali mercati si concentra oggi la strategia?', en: 'Which markets does the strategy focus on today?' },
    back: {
      it: 'Europa Centrale e Orientale, più “select Western European countries such as Austria, Italy and the UK” (Váradi, 14 luglio 2025).',
      en: 'Central and Eastern Europe, plus “select Western European countries such as Austria, Italy and the UK” (Váradi, 14 July 2025).',
    },
  },
  {
    id: 'wz-why',
    category: 'strategy',
    front: {
      it: 'Come si struttura una buona risposta a “Perché Wizz Air?”',
      en: 'How do you structure a good answer to “Why Wizz Air?”',
    },
    back: {
      it: 'Tre elementi concreti e verificabili: (1) flotta e tipo — A321neo, il più moderno ed efficiente; (2) crescita — piano flotta e nuove basi, quindi progressione di carriera reale; (3) modello e valori — ULCC disciplinata, standard operativi. Poi lega ciascuno alla tua situazione. Evita “perché assumete”.',
      en: 'Three concrete, checkable elements: (1) fleet and type — A321neo, the most modern and efficient; (2) growth — fleet plan and new bases, so real career progression; (3) model and values — a disciplined ULCC with operating standards. Then tie each to your own situation. Avoid “because you are hiring”.',
    },
  },
  {
    id: 'wz-pathway',
    category: 'strategy',
    front: {
      it: 'Che cosa distingue il Pathway Programme italiano dal WAPA “core”?',
      en: 'What sets the Italian Pathway Programme apart from the “core” WAPA?',
    },
    back: {
      it: 'È gestito con Urbe Aero Flight Academy a Roma-Urbe (partner ufficiale dal 2023): ATPL Integrato di ~18 mesi, con Conditional Job Offer prima ancora di iniziare il corso.',
      en: 'It is run with Urbe Aero Flight Academy at Rome-Urbe (official partner since 2023): an ~18-month Integrated ATPL, with a Conditional Job Offer before the course even starts.',
    },
  },
  {
    id: 'wz-costs',
    category: 'strategy',
    front: {
      it: 'Come si divide il costo del percorso?',
      en: 'How are the costs of the programme split?',
    },
    back: {
      it: 'A carico dell’allievo: selezione (fee TestAir360 ~110-130 €) e corso ATPL Integrato. Anticipati dalla compagnia: APS-MCC e Type Rating A320neo, con stipendio di addestramento durante il TR.',
      en: 'Paid by the cadet: the selection (TestAir360 fee ~€110-130) and the Integrated ATPL course. Advanced by the airline: APS-MCC and the A320neo Type Rating, with a training salary during the TR.',
    },
  },

  // --------------------------------------------------------------------- italy
  {
    id: 'wz-italy',
    category: 'italy',
    front: { it: 'Come si sta espandendo Wizz Air in Italia?', en: 'How is Wizz Air expanding in Italy?' },
    back: {
      it: 'Espansione delle basi, fra cui Milano Malpensa, Napoli, Catania e Torino da settembre 2026.',
      en: 'Base expansion including Milan Malpensa, Naples, Catania and Turin from September 2026.',
    },
    volatile: true,
  },
  {
    id: 'wz-course',
    category: 'italy',
    front: { it: 'Come si articola il percorso formativo dopo la selezione?', en: 'What does the training path look like after selection?' },
    back: {
      it: '1) ATPL Integrato ~18 mesi a Urbe Aero (CPL+IR+ME+ATPL teorico+MCC); 2) Airline Transition Program e A320 Type Transition; 3) Company Introduction e Line Flying Under Supervision; 4) rilascio come First Officer su A320/A321neo.',
      en: '1) ~18-month Integrated ATPL at Urbe Aero (CPL+IR+ME+ATPL theory+MCC); 2) Airline Transition Program and A320 Type Transition; 3) Company Introduction and Line Flying Under Supervision; 4) release as First Officer on the A320/A321neo.',
    },
  },
  {
    id: 'wz-medical',
    category: 'italy',
    front: { it: 'Dove si ottiene il medical EASA Classe 1 in Italia?', en: 'Where do you get the EASA Class 1 medical in Italy?' },
    back: {
      it: 'La prima visita deve avvenire in un AeMC certificato — in Italia tipicamente l’Istituto di Medicina Legale dell’Aeronautica Militare; l’elenco AeMC/AME è pubblicato da ENAC. Validità 12 mesi sotto i 40 anni.',
      en: 'The initial examination must be at a certified AeMC — in Italy typically the Air Force Institute of Legal Medicine; ENAC publishes the AeMC/AME list. Valid 12 months under age 40.',
    },
  },
  {
    id: 'wz-requirements',
    category: 'italy',
    front: { it: 'Quali sono i requisiti di ammissione?', en: 'What are the entry requirements?' },
    back: {
      it: '18 anni minimo, diploma di scuola superiore, inglese fluente, diritto illimitato a vivere e lavorare in UE, saper nuotare 50 m senza aiuti, idoneità medica EASA Classe 1 (obbligatoria prima dell’iscrizione al corso, non il giorno dell’assessment).',
      en: 'Minimum age 18, completed secondary education, fluent English, unrestricted right to live and work in the EU, able to swim 50 m unaided, EASA Class 1 medical (required before enrolling on the course, not on assessment day).',
    },
  },
]

export const WIZZ_CATEGORY_LABELS: Record<WizzCard['category'], Bilingual> = {
  identity: { it: 'Identità', en: 'Identity' },
  fleet: { it: 'Flotta', en: 'Fleet' },
  network: { it: 'Rete', en: 'Network' },
  strategy: { it: 'Strategia', en: 'Strategy' },
  italy: { it: 'Italia e percorso', en: 'Italy and the programme' },
}
