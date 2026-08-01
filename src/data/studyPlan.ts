import type { Bilingual } from '@/i18n'
import type { ModuleId } from '@/modules/types'

/**
 * The 4-6 week plan the guide recommends, in its priority order: mental
 * arithmetic first, then physics, then spatial orientation — with the company
 * knowledge and STAR answers prepared before the assessment day.
 */

export type PlanWeek = {
  week: number
  focus: Bilingual
  detail: Bilingual
  modules: ModuleId[]
}

export const STUDY_PLAN: PlanWeek[] = [
  {
    week: 1,
    focus: { it: 'Aritmetica mentale, ogni giorno', en: 'Mental arithmetic, every day' },
    detail: {
      it: 'Priorità massima secondo la guida. 20 minuti al giorno in modalità audio, senza carta né calcolatrice. Obiettivo: rispondere entro 10 secondi su moltiplicazioni a due cifre, percentuali e potenze.',
      en: 'The guide’s top priority. 20 minutes a day in audio mode, no paper and no calculator. Target: answering within 10 seconds on two-digit multiplication, percentages and powers.',
    },
    modules: ['maths-audio', 'equate'],
  },
  {
    week: 2,
    focus: { it: 'Fisica sul syllabus ufficiale', en: 'Physics on the official syllabus' },
    detail: {
      it: 'Due argomenti al giorno dal syllabus Wizz, con un quiz da 20 domande a chiusura. Non fermarti alla risposta: rifai il calcolo a mano finché la formula non è automatica.',
      en: 'Two topics a day from the Wizz syllabus, closing with a 20-question quiz. Do not stop at the answer: redo the calculation by hand until the formula is automatic.',
    },
    modules: ['physics', 'maths-advanced'],
  },
  {
    week: 3,
    focus: { it: 'Orientamento spaziale e memoria', en: 'Spatial orientation and memory' },
    detail: {
      it: 'Azimuth e cubi rotanti tutti i giorni: sono le abilità che migliorano più lentamente. Aggiungi Numbers e Recall a giorni alterni.',
      en: 'Azimuth and rotating cubes daily: these are the skills that improve most slowly. Add Numbers and Recall on alternate days.',
    },
    modules: ['azimuth', 'cubes', 'numbers', 'recall'],
  },
  {
    week: 4,
    focus: { it: 'Velocità percettiva e coordinazione', en: 'Perceptual speed and coordination' },
    detail: {
      it: 'Clocks, Decoder e Visual Perception a tempo pieno, più il seesaw con round a controlli invertiti. Chiudi la settimana con una pratica completa.',
      en: 'Clocks, Decoder and Visual Perception at full speed, plus the seesaw with the inverted-control round. Close the week with a full practice run.',
    },
    modules: ['clocks', 'decoder', 'visual-perception', 'balance', 'vigilance'],
  },
  {
    week: 5,
    focus: { it: 'Inglese, personalità, esame simulato', en: 'English, personality, simulated exam' },
    detail: {
      it: 'Inglese ogni giorno (grammatica + memorizzazione di testi). Fai il questionario di personalità una volta sola, per prendere familiarità. Poi un esame Pro completo, in condizioni realistiche: tre ore, senza interruzioni.',
      en: 'English every day (grammar + text memorisation). Do the personality questionnaire once, just for familiarity. Then one full Pro exam under realistic conditions: three hours, no interruptions.',
    },
    modules: ['english', 'personality'],
  },
  {
    week: 6,
    focus: { it: 'Giornata in presenza', en: 'Assessment day' },
    detail: {
      it: 'Conoscenza Wizz Air con le flashcard tutti i giorni, risposte STAR scritte e provate a voce alta, scenari CRM e colloquio tecnico. Rileggi i numeri aziendali il giorno prima: cambiano.',
      en: 'Wizz Air flashcards daily, STAR answers written out and rehearsed aloud, CRM scenarios and the technical interview. Re-check the company figures the day before: they change.',
    },
    modules: ['wizz-knowledge', 'interview-hr', 'group-exercise', 'atpl-technical'],
  },
]

export type ChecklistItem = {
  id: string
  label: Bilingual
  detail: Bilingual
}

export const CHECKLIST: ChecklistItem[] = [
  {
    id: 'medical',
    label: { it: 'Ottenere il medical EASA Classe 1', en: 'Get the EASA Class 1 medical' },
    detail: {
      it: 'Prima di investire nel resto: serve a sapere se sei idoneo. La prima visita va fatta in un AeMC certificato (elenco su enac.gov.it). Non è richiesto il giorno dell’assessment, ma è obbligatorio prima di iscriverti al corso.',
      en: 'Before investing in anything else: it tells you whether you are eligible. The initial exam must be at a certified AeMC (list on enac.gov.it). It is not needed on assessment day, but it is mandatory before enrolling on the course.',
    },
  },
  {
    id: 'swim',
    label: { it: 'Verificare di saper nuotare 50 m senza aiuti', en: 'Confirm you can swim 50 m unaided' },
    detail: {
      it: 'È un requisito formale di ammissione. Se non sei sicuro, vai in piscina e provaci prima di candidarti.',
      en: 'It is a formal entry requirement. If you are not sure, go to a pool and try before applying.',
    },
  },
  {
    id: 'application',
    label: { it: 'Inviare la candidatura', en: 'Submit the application' },
    detail: {
      it: 'Usa Google Chrome (raccomandato ufficialmente). Il modulo di scoring richiede tutti i campi compilati prima di poter inviare.',
      en: 'Use Google Chrome (officially recommended). The scoring form requires every field completed before it will submit.',
    },
  },
  {
    id: 'practices',
    label: {
      it: 'Completare le pratiche gratuite TestAir360 PRIMA di pagare',
      en: 'Complete the free TestAir360 practices BEFORE paying',
    },
    detail: {
      it: 'Le pratiche sono gratuite dopo la registrazione su testair360.com. Se i risultati in matematica o spaziale sono bassi, estendi la preparazione: la fee non è rimborsabile e la deadline non è posticipabile.',
      en: 'The practices are free after registering on testair360.com. If your maths or spatial results are low, extend your preparation: the fee is non-refundable and the deadline cannot be moved.',
    },
  },
  {
    id: 'fee',
    label: { it: 'Pagare la fee solo quando sei pronto', en: 'Pay the fee only when you are ready' },
    detail: {
      it: 'Il pagamento (~110-130 €) sblocca l’esame Pro e fa partire un contatore di circa 28 giorni / 2 mesi. Non pagare per “iniziare a muoverti”.',
      en: 'Payment (~€110-130) unlocks the Pro exam and starts a clock of about 28 days / 2 months. Do not pay just to “get moving”.',
    },
  },
  {
    id: 'exam-setup',
    label: { it: 'Preparare l’ambiente per l’esame Pro', en: 'Set up your environment for the Pro exam' },
    detail: {
      it: 'Tre-quattro ore libere, stanza silenziosa, connessione stabile, browser compatibile con il proctoring (Proctorio). Carta e calcolatrice a portata di mano solo per la sezione dove sono ammesse.',
      en: 'Three to four free hours, a quiet room, a stable connection, a browser compatible with the proctoring (Proctorio). Paper and calculator at hand only for the section where they are allowed.',
    },
  },
  {
    id: 'company',
    label: { it: 'Aggiornare la conoscenza dell’azienda', en: 'Refresh your company knowledge' },
    detail: {
      it: 'Flotta, basi, rotte e strategia cambiano ogni stagione: verifica i numeri su wizzair.com nei giorni prima del colloquio, non un mese prima.',
      en: 'Fleet, bases, routes and strategy change every season: check the numbers on wizzair.com in the days before the interview, not a month before.',
    },
  },
  {
    id: 'star',
    label: { it: 'Scrivere 6-8 storie STAR', en: 'Write 6-8 STAR stories' },
    detail: {
      it: 'Copri: errore, conflitto, decisione con informazioni incomplete, apprendimento rapido, critica ricevuta, leadership e followership. Una storia può servire per più domande.',
      en: 'Cover: a mistake, a conflict, a decision with incomplete information, fast learning, criticism received, leadership and followership. One story can serve several questions.',
    },
  },
  {
    id: 'questions',
    label: { it: 'Preparare due domande per gli esaminatori', en: 'Prepare two questions for the assessors' },
    detail: {
      it: '“Nessuna domanda” è l’ultima impressione che lasci. Scegli domande a cui non risponde il sito.',
      en: '“No questions” is the last impression you leave. Pick questions the website does not answer.',
    },
  },
  {
    id: 'sim',
    label: {
      it: 'Verificare se la convocazione include il simulatore',
      en: 'Check whether your invitation includes the simulator',
    },
    detail: {
      it: 'Per i cadetti ab-initio non è sempre previsto: è documentato soprattutto per candidati con esperienza. Se è previsto, valuta 2-3 ore in un simulatore A320 prima.',
      en: 'For ab-initio cadets it is not always included: it is mainly documented for experienced candidates. If it is included, consider 2-3 hours in an A320 simulator beforehand.',
    },
  },
]
