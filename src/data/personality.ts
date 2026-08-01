import type { Bilingual } from '@/i18n'

/**
 * Personality questionnaire simulator.
 *
 * The real questionnaire is several hundred items and is built to resist social
 * desirability: it cross-checks answers and flags contradictions. This module
 * does NOT try to guess a "correct" profile — there isn't one. It measures
 * whether YOUR answers stay consistent when the same trait is asked in
 * different words, which is the one thing you can actually get wrong by
 * over-thinking.
 */

export type PersonalityItem = {
  id: string
  text: Bilingual
  /** Items sharing a pair key probe the same underlying trait. */
  pair: string
  /** 'same': agreement should match. 'opposite': answers should mirror. */
  polarity: 'same' | 'opposite'
}

export const LIKERT_LABELS: Bilingual[] = [
  { it: 'Per niente', en: 'Not at all' },
  { it: 'Poco', en: 'Slightly' },
  { it: 'Abbastanza', en: 'Moderately' },
  { it: 'Molto', en: 'Very much' },
  { it: 'Completamente', en: 'Completely' },
]

export const PERSONALITY_ITEMS: PersonalityItem[] = [
  // Rule adherence
  {
    id: 'p-rule-a',
    pair: 'rules',
    polarity: 'same',
    text: {
      it: 'Seguo le procedure anche quando sono convinto che una scorciatoia funzionerebbe.',
      en: 'I follow procedures even when I am sure a shortcut would work.',
    },
  },
  {
    id: 'p-rule-b',
    pair: 'rules',
    polarity: 'opposite',
    text: {
      it: 'Se una regola mi rallenta e nessuno se ne accorgerebbe, la salto.',
      en: 'If a rule slows me down and nobody would notice, I skip it.',
    },
  },

  // Stress tolerance
  {
    id: 'p-stress-a',
    pair: 'stress',
    polarity: 'same',
    text: {
      it: 'Sotto pressione riesco a mantenere un ritmo di lavoro ordinato.',
      en: 'Under pressure I can keep working in an orderly way.',
    },
  },
  {
    id: 'p-stress-b',
    pair: 'stress',
    polarity: 'opposite',
    text: {
      it: 'Quando le cose si complicano tendo a perdere il filo.',
      en: 'When things get complicated I tend to lose track.',
    },
  },

  // Teamwork
  {
    id: 'p-team-a',
    pair: 'team',
    polarity: 'same',
    text: {
      it: 'Mi accorgo quando qualcuno nel gruppo resta in silenzio e lo coinvolgo.',
      en: 'I notice when someone in a group stays quiet and I bring them in.',
    },
  },
  {
    id: 'p-team-b',
    pair: 'team',
    polarity: 'opposite',
    text: {
      it: 'In gruppo preferisco andare avanti per conto mio piuttosto che aspettare gli altri.',
      en: 'In a group I would rather push ahead on my own than wait for others.',
    },
  },

  // Assertiveness
  {
    id: 'p-assert-a',
    pair: 'assert',
    polarity: 'same',
    text: {
      it: 'Se noto un errore in chi ha più esperienza di me, lo dico comunque.',
      en: 'If I spot a mistake made by someone more experienced, I still speak up.',
    },
  },
  {
    id: 'p-assert-b',
    pair: 'assert',
    polarity: 'opposite',
    text: {
      it: 'Preferisco tacere piuttosto che contraddire chi è più anziano di grado.',
      en: 'I would rather stay silent than contradict someone senior to me.',
    },
  },

  // Attention to detail
  {
    id: 'p-detail-a',
    pair: 'detail',
    polarity: 'same',
    text: {
      it: 'Ricontrollo il mio lavoro anche quando sono sicuro che sia corretto.',
      en: 'I double-check my work even when I am confident it is right.',
    },
  },
  {
    id: 'p-detail-b',
    pair: 'detail',
    polarity: 'opposite',
    text: {
      it: 'I dettagli minori mi annoiano e tendo a sorvolarli.',
      en: 'Small details bore me and I tend to skim past them.',
    },
  },

  // Self-criticism / learning
  {
    id: 'p-learn-a',
    pair: 'learn',
    polarity: 'same',
    text: {
      it: 'Quando ricevo una critica cerco prima di capire cosa c’è di vero.',
      en: 'When I get criticism I first try to work out what is true in it.',
    },
  },
  {
    id: 'p-learn-b',
    pair: 'learn',
    polarity: 'opposite',
    text: {
      it: 'Le critiche mi mettono sulla difensiva.',
      en: 'Criticism puts me on the defensive.',
    },
  },

  // Monotony tolerance
  {
    id: 'p-mono-a',
    pair: 'mono',
    polarity: 'same',
    text: {
      it: 'Riesco a restare concentrato su un compito ripetitivo per lunghi periodi.',
      en: 'I can stay focused on a repetitive task for long stretches.',
    },
  },
  {
    id: 'p-mono-b',
    pair: 'mono',
    polarity: 'opposite',
    text: {
      it: 'Ho bisogno di stimoli continui, altrimenti la mia attenzione cala in fretta.',
      en: 'I need constant stimulation or my attention drops quickly.',
    },
  },

  // Planning
  {
    id: 'p-plan-a',
    pair: 'plan',
    polarity: 'same',
    text: {
      it: 'Preparo in anticipo cosa farò se il piano principale non funziona.',
      en: 'I plan in advance what I will do if the main plan fails.',
    },
  },
  {
    id: 'p-plan-b',
    pair: 'plan',
    polarity: 'opposite',
    text: {
      it: 'Affronto i problemi quando si presentano, senza pensarci prima.',
      en: 'I deal with problems as they come up, without thinking ahead.',
    },
  },

  // Risk
  {
    id: 'p-risk-a',
    pair: 'risk',
    polarity: 'same',
    text: {
      it: 'Preferisco una soluzione sicura a una brillante ma incerta.',
      en: 'I prefer a safe solution to a brilliant but uncertain one.',
    },
  },
  {
    id: 'p-risk-b',
    pair: 'risk',
    polarity: 'opposite',
    text: {
      it: 'Mi piace correre qualche rischio per ottenere un risultato migliore.',
      en: 'I enjoy taking some risk to get a better outcome.',
    },
  },

  // Communication
  {
    id: 'p-comm-a',
    pair: 'comm',
    polarity: 'same',
    text: {
      it: 'Verifico di essere stato capito invece di dare per scontato che sia così.',
      en: 'I check that I have been understood instead of assuming it.',
    },
  },
  {
    id: 'p-comm-b',
    pair: 'comm',
    polarity: 'opposite',
    text: {
      it: 'Se ho spiegato una cosa una volta, considero chiuso il discorso.',
      en: 'Once I have explained something, I consider the matter closed.',
    },
  },

  // Workload management
  {
    id: 'p-load-a',
    pair: 'load',
    polarity: 'same',
    text: {
      it: 'So dire di no o chiedere aiuto quando il carico di lavoro è eccessivo.',
      en: 'I can say no or ask for help when the workload is too much.',
    },
  },
  {
    id: 'p-load-b',
    pair: 'load',
    polarity: 'opposite',
    text: {
      it: 'Accetto sempre altri compiti, anche quando sono già sovraccarico.',
      en: 'I always take on more tasks, even when I am already overloaded.',
    },
  },

  // Punctuality / discipline
  {
    id: 'p-disc-a',
    pair: 'disc',
    polarity: 'same',
    text: {
      it: 'Arrivo in anticipo agli impegni importanti.',
      en: 'I arrive early for important commitments.',
    },
  },
  {
    id: 'p-disc-b',
    pair: 'disc',
    polarity: 'opposite',
    text: {
      it: 'Capita spesso che io sia in ritardo.',
      en: 'I am often running late.',
    },
  },

  // Emotional stability
  {
    id: 'p-emo-a',
    pair: 'emo',
    polarity: 'same',
    text: {
      it: 'Dopo un errore riesco a rimettermi al lavoro senza rimuginare.',
      en: 'After a mistake I can get back to work without dwelling on it.',
    },
  },
  {
    id: 'p-emo-b',
    pair: 'emo',
    polarity: 'opposite',
    text: {
      it: 'Un errore può rovinarmi il resto della giornata.',
      en: 'One mistake can ruin the rest of my day.',
    },
  },

  // Honesty / reporting culture
  {
    id: 'p-hon-a',
    pair: 'hon',
    polarity: 'same',
    text: {
      it: 'Segnalerei un mio errore anche se nessuno se ne fosse accorto.',
      en: 'I would report a mistake of mine even if nobody had noticed it.',
    },
  },
  {
    id: 'p-hon-b',
    pair: 'hon',
    polarity: 'opposite',
    text: {
      it: 'Se un errore non ha avuto conseguenze, non vale la pena parlarne.',
      en: 'If a mistake had no consequences, it is not worth mentioning.',
    },
  },

  // Adaptability
  {
    id: 'p-adapt-a',
    pair: 'adapt',
    polarity: 'same',
    text: {
      it: 'Mi adatto in fretta quando i piani cambiano all’ultimo momento.',
      en: 'I adapt quickly when plans change at the last minute.',
    },
  },
  {
    id: 'p-adapt-b',
    pair: 'adapt',
    polarity: 'opposite',
    text: {
      it: 'I cambi di programma improvvisi mi mettono a disagio.',
      en: 'Sudden changes of plan make me uncomfortable.',
    },
  },

  // Leadership balance
  {
    id: 'p-lead-a',
    pair: 'lead',
    polarity: 'same',
    text: {
      it: 'So guidare un gruppo quando serve e seguire quando è il caso.',
      en: 'I can lead a group when needed and follow when appropriate.',
    },
  },
  {
    id: 'p-lead-b',
    pair: 'lead',
    polarity: 'opposite',
    text: {
      it: 'In gruppo devo essere io a decidere, altrimenti non mi sento a mio agio.',
      en: 'In a group I need to be the one deciding, otherwise I am uncomfortable.',
    },
  },
]

/** Forced-choice pairs: both options are socially acceptable, on purpose. */
export type ForcedChoiceItem = {
  id: string
  a: Bilingual
  b: Bilingual
}

export const FORCED_CHOICE_ITEMS: ForcedChoiceItem[] = [
  {
    id: 'fc-1',
    a: { it: 'Preferisco un piano dettagliato', en: 'I prefer a detailed plan' },
    b: { it: 'Preferisco margine per improvvisare', en: 'I prefer room to improvise' },
  },
  {
    id: 'fc-2',
    a: { it: 'Mi motiva la responsabilità', en: 'Responsibility motivates me' },
    b: { it: 'Mi motiva imparare cose nuove', en: 'Learning new things motivates me' },
  },
  {
    id: 'fc-3',
    a: { it: 'Do più valore alla precisione', en: 'I value precision more' },
    b: { it: 'Do più valore alla rapidità', en: 'I value speed more' },
  },
  {
    id: 'fc-4',
    a: { it: 'Preferisco lavorare in squadra', en: 'I prefer working in a team' },
    b: { it: 'Preferisco lavorare in autonomia', en: 'I prefer working independently' },
  },
  {
    id: 'fc-5',
    a: { it: 'Prima analizzo, poi agisco', en: 'I analyse first, then act' },
    b: { it: 'Provo e correggo strada facendo', en: 'I try things and correct as I go' },
  },
  {
    id: 'fc-6',
    a: { it: 'Mi trovo bene con la routine', en: 'I am comfortable with routine' },
    b: { it: 'Mi trovo bene con l’imprevisto', en: 'I am comfortable with the unexpected' },
  },
]
