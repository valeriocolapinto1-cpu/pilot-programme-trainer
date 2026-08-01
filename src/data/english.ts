/**
 * English bank. The real module is taken in English, so the questions and
 * options stay in English; only the surrounding instructions are translated.
 * Coverage: intermediate grammar, vocabulary and synonyms, reading
 * comprehension, plus the aviation English a cadet is expected to recognise.
 */

export type EnglishTopic = 'grammar' | 'vocabulary' | 'comprehension' | 'aviation'

export type EnglishQuestion = {
  id: string
  topic: EnglishTopic
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
}

export const ENGLISH_BANK: EnglishQuestion[] = [
  // ------------------------------------------------------------------ grammar
  {
    id: 'gra-1',
    topic: 'grammar',
    stem: 'By the time we reached the holding point, the tower ______ our departure clearance.',
    options: ['had already issued', 'has already issued', 'already issued', 'was already issuing'],
    correctIndex: 0,
    explanation:
      'Past perfect: an action completed before another past action ("by the time we reached").',
  },
  {
    id: 'gra-2',
    topic: 'grammar',
    stem: 'If the weather ______ below minima, we would have diverted.',
    options: ['had gone', 'would go', 'goes', 'has gone'],
    correctIndex: 0,
    explanation:
      'Third conditional: if + past perfect, would have + past participle. It describes an unreal past.',
  },
  {
    id: 'gra-3',
    topic: 'grammar',
    stem: 'The captain insisted ______ the checklist again before departure.',
    options: ['on running', 'to run', 'running to', 'that run'],
    correctIndex: 0,
    explanation: '"Insist on" is followed by the -ing form.',
  },
  {
    id: 'gra-4',
    topic: 'grammar',
    stem: 'Neither the first officer nor the cabin crew ______ aware of the change.',
    options: ['was', 'were', 'have been', 'are'],
    correctIndex: 0,
    explanation:
      'With "neither… nor" the verb agrees with the nearer subject: "cabin crew" is treated as singular here.',
  },
  {
    id: 'gra-5',
    topic: 'grammar',
    stem: 'We are used ______ early starts in this job.',
    options: ['to working', 'to work', 'work', 'for working'],
    correctIndex: 0,
    explanation: '"Be used to" + -ing means "be accustomed to". "Used to + infinitive" is a past habit.',
  },
  {
    id: 'gra-6',
    topic: 'grammar',
    stem: 'The aircraft ______ for three hours when the fault finally cleared.',
    options: ['had been flying', 'has flown', 'was flown', 'is flying'],
    correctIndex: 0,
    explanation: 'Past perfect continuous: a duration up to a point in the past.',
  },
  {
    id: 'gra-7',
    topic: 'grammar',
    stem: 'Hardly ______ the gear when the warning sounded.',
    options: ['had we retracted', 'we had retracted', 'did we retracted', 'we retracted'],
    correctIndex: 0,
    explanation: 'After a negative adverbial like "hardly" at the start, the subject and auxiliary invert.',
  },
  {
    id: 'gra-8',
    topic: 'grammar',
    stem: 'The briefing was ______ short that nobody had time to ask questions.',
    options: ['so', 'such', 'too', 'very'],
    correctIndex: 0,
    explanation: '"So + adjective + that". "Such" would need a noun: "such a short briefing that…".',
  },
  {
    id: 'gra-9',
    topic: 'grammar',
    stem: 'You ______ have told me earlier — I would have rearranged the schedule.',
    options: ['should', 'must', 'can', 'would'],
    correctIndex: 0,
    explanation: '"Should have + past participle" expresses criticism of a past action.',
  },
  {
    id: 'gra-10',
    topic: 'grammar',
    stem: 'This is the airport ______ we diverted last winter.',
    options: ['to which', 'which', 'what', 'whose'],
    correctIndex: 0,
    explanation: '"Divert to" needs the preposition: "to which we diverted" (or "which we diverted to").',
  },

  // --------------------------------------------------------------- vocabulary
  {
    id: 'voc-1',
    topic: 'vocabulary',
    stem: 'Choose the closest synonym for "mitigate".',
    options: ['reduce', 'increase', 'ignore', 'postpone'],
    correctIndex: 0,
    explanation: 'To mitigate is to make something less severe — the core word in any risk discussion.',
  },
  {
    id: 'voc-2',
    topic: 'vocabulary',
    stem: 'Choose the closest synonym for "adverse" (as in adverse weather).',
    options: ['unfavourable', 'sudden', 'expected', 'mild'],
    correctIndex: 0,
    explanation: 'Adverse = unfavourable, working against you.',
  },
  {
    id: 'voc-3',
    topic: 'vocabulary',
    stem: 'Choose the closest synonym for "comply with".',
    options: ['follow', 'question', 'delay', 'record'],
    correctIndex: 0,
    explanation: 'To comply with a procedure is to follow it.',
  },
  {
    id: 'voc-4',
    topic: 'vocabulary',
    stem: '"The crew was reluctant to accept the shortcut." Reluctant means:',
    options: ['unwilling', 'eager', 'unable', 'required'],
    correctIndex: 0,
    explanation: 'Reluctant = hesitant, unwilling.',
  },
  {
    id: 'voc-5',
    topic: 'vocabulary',
    stem: 'Choose the correct phrasal verb: "We had to ______ the approach because of windshear."',
    options: ['break off', 'break down', 'break into', 'break out'],
    correctIndex: 0,
    explanation: 'Break off = discontinue. Break down = stop functioning.',
  },
  {
    id: 'voc-6',
    topic: 'vocabulary',
    stem: 'Choose the closest synonym for "thorough".',
    options: ['detailed', 'quick', 'optional', 'approximate'],
    correctIndex: 0,
    explanation: 'A thorough briefing is a complete and detailed one.',
  },
  {
    id: 'voc-7',
    topic: 'vocabulary',
    stem: '"Fuel consumption was significantly higher than anticipated." Anticipated means:',
    options: ['expected', 'measured', 'permitted', 'recorded'],
    correctIndex: 0,
    explanation: 'Anticipated = expected in advance.',
  },
  {
    id: 'voc-8',
    topic: 'vocabulary',
    stem: 'Which word does NOT belong with the others?',
    options: ['negligent', 'diligent', 'meticulous', 'conscientious'],
    correctIndex: 0,
    explanation:
      'Diligent, meticulous and conscientious all describe care and attention. Negligent is the opposite.',
  },

  // ------------------------------------------------------------ comprehension
  {
    id: 'com-1',
    topic: 'comprehension',
    stem: `Read the text and answer.

"Low-cost carriers built their model on a single aircraft type. Operating one family reduces training costs, simplifies maintenance and lets crews be rostered interchangeably across the network. The trade-off is exposure: a fleet-wide technical issue affects every route at once, and a manufacturer's delivery delay cannot be absorbed by switching to a different type."

According to the text, what is the main disadvantage of a single-type fleet?`,
    options: [
      'A single problem affects the whole network at once',
      'Training costs rise over time',
      'Crews cannot be rostered flexibly',
      'Maintenance becomes more complex',
    ],
    correctIndex: 0,
    explanation:
      'The text names exposure as the trade-off: a fleet-wide issue or a delivery delay hits everything simultaneously.',
  },
  {
    id: 'com-2',
    topic: 'comprehension',
    stem: `Read the text and answer.

"Low-cost carriers built their model on a single aircraft type. Operating one family reduces training costs, simplifies maintenance and lets crews be rostered interchangeably across the network. The trade-off is exposure: a fleet-wide technical issue affects every route at once, and a manufacturer's delivery delay cannot be absorbed by switching to a different type."

Which of the following is NOT stated as a benefit?`,
    options: [
      'Lower fuel burn per seat',
      'Reduced training costs',
      'Simpler maintenance',
      'Interchangeable crew rostering',
    ],
    correctIndex: 0,
    explanation: 'Fuel burn is never mentioned; the other three are listed explicitly.',
  },
  {
    id: 'com-3',
    topic: 'comprehension',
    stem: `Read the text and answer.

"A stabilised approach is not a target to aim for but a gate to pass. If the aircraft is not configured, on speed and on path by the defined altitude, the correct action is a go-around — regardless of how close the runway looks. Crews who continue an unstable approach rarely do so because they misjudge the aircraft; they do so because they have already decided to land."

What does the author suggest is the real cause of continuing an unstable approach?`,
    options: [
      'A decision made before the gate is reached',
      'Incorrect airspeed indications',
      'Insufficient training on go-arounds',
      'Pressure from air traffic control',
    ],
    correctIndex: 0,
    explanation:
      'The final sentence attributes it to a decision already taken, not to misjudging the aircraft.',
  },
  {
    id: 'com-4',
    topic: 'comprehension',
    stem: `Read the text and answer.

"A stabilised approach is not a target to aim for but a gate to pass. If the aircraft is not configured, on speed and on path by the defined altitude, the correct action is a go-around — regardless of how close the runway looks."

The phrase "a gate to pass" implies that the criteria are:`,
    options: ['mandatory', 'advisory', 'optional in good weather', 'set by the crew'],
    correctIndex: 0,
    explanation: 'A gate must be passed: the wording marks the criteria as a hard requirement.',
  },

  // -------------------------------------------------------------- aviation EN
  {
    id: 'avi-1',
    topic: 'aviation',
    stem: 'In standard phraseology, which word means "permission granted to proceed under specified conditions"?',
    options: ['Cleared', 'Roger', 'Wilco', 'Affirm'],
    correctIndex: 0,
    explanation:
      '"Cleared" grants permission. "Roger" only means received; "Wilco" means understood and will comply.',
  },
  {
    id: 'avi-2',
    topic: 'aviation',
    stem: 'What does "Say again" request?',
    options: [
      'Repeat the last transmission',
      'Confirm you have landed',
      'Change to another frequency',
      'Stand by for further instructions',
    ],
    correctIndex: 0,
    explanation: '"Say again" is the standard request for a repetition.',
  },
  {
    id: 'avi-3',
    topic: 'aviation',
    stem: 'Which reply means "Yes, that is correct"?',
    options: ['Affirm', 'Roger', 'Standby', 'Correction'],
    correctIndex: 0,
    explanation: '"Affirm" is the standard affirmative. "Roger" only acknowledges receipt.',
  },
  {
    id: 'avi-4',
    topic: 'aviation',
    stem: 'The minimum ICAO English language proficiency level required for international operations is:',
    options: ['Level 4 (Operational)', 'Level 3 (Pre-operational)', 'Level 5 (Extended)', 'Level 6 (Expert)'],
    correctIndex: 0,
    explanation:
      'Level 4 is the operational minimum and must be re-tested periodically; Level 6 is expert and does not expire.',
  },
  {
    id: 'avi-5',
    topic: 'aviation',
    stem: '"Line up and wait" instructs the crew to:',
    options: [
      'Enter the runway and hold in position',
      'Hold short of the runway',
      'Take off immediately',
      'Backtrack the runway',
    ],
    correctIndex: 0,
    explanation:
      'The aircraft enters the runway and holds; take-off clearance is a separate instruction.',
  },
]

/** Short passages used for the timed memorisation phase. */
export type EnglishPassage = {
  id: string
  text: string
  questions: { stem: string; options: string[]; correctIndex: number }[]
}

export const ENGLISH_PASSAGES: EnglishPassage[] = [
  {
    id: 'pas-1',
    text: `Flight 4732 departs Budapest at 06:15 local time and is scheduled to land in Catania at 08:40. The captain is Maria Lang, based in Vienna, with 8,400 flight hours. The aircraft is an A321neo carrying 214 passengers and 9,600 kg of fuel at the gate. The alternate is Palermo, 25 minutes away, and the expected landing runway is 08.`,
    questions: [
      {
        stem: 'What is the scheduled landing time?',
        options: ['08:40', '06:15', '08:04', '06:45'],
        correctIndex: 0,
      },
      {
        stem: 'How many passengers are on board?',
        options: ['214', '241', '204', '224'],
        correctIndex: 0,
      },
      {
        stem: 'Which airport is the alternate?',
        options: ['Palermo', 'Catania', 'Vienna', 'Budapest'],
        correctIndex: 0,
      },
      {
        stem: 'How much fuel is on board at the gate?',
        options: ['9,600 kg', '6,900 kg', '9,060 kg', '8,400 kg'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'pas-2',
    text: `The maintenance report lists three open items. Item A: a cabin light in row 22 is inoperative, deferred for 10 days. Item B: the left brake temperature sensor reads 15 degrees high, to be replaced at the next A-check on 14 March. Item C: a cargo door seal was renewed yesterday and requires an inspection after 50 flight cycles. The aircraft registration is HA-LVK and it is based in Warsaw.`,
    questions: [
      {
        stem: 'Which item must be inspected after 50 flight cycles?',
        options: ['Item C', 'Item A', 'Item B', 'None of them'],
        correctIndex: 0,
      },
      {
        stem: 'What is the aircraft registration?',
        options: ['HA-LVK', 'HA-LKV', 'HB-LVK', 'HA-VLK'],
        correctIndex: 0,
      },
      {
        stem: 'For how many days is the cabin light deferred?',
        options: ['10 days', '14 days', '50 days', '15 days'],
        correctIndex: 0,
      },
      {
        stem: 'Where is the aircraft based?',
        options: ['Warsaw', 'Budapest', 'Vienna', 'Katowice'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'pas-3',
    text: `A crew reports the following to dispatch: they are holding at FL240 over waypoint LUMAV with 4,200 kg of fuel remaining. Holding burn is 1,500 kg per hour. Their destination has a ceiling of 300 feet and visibility of 1,200 metres, both improving. The alternate requires 1,800 kg including final reserve. Expected further clearance time is in 20 minutes.`,
    questions: [
      {
        stem: 'What fuel remains on board?',
        options: ['4,200 kg', '2,400 kg', '1,800 kg', '1,500 kg'],
        correctIndex: 0,
      },
      {
        stem: 'What is the holding fuel burn per hour?',
        options: ['1,500 kg', '1,200 kg', '1,800 kg', '4,200 kg'],
        correctIndex: 0,
      },
      {
        stem: 'What is the reported visibility at destination?',
        options: ['1,200 m', '300 m', '2,100 m', '1,020 m'],
        correctIndex: 0,
      },
      {
        stem: 'At which flight level is the aircraft holding?',
        options: ['FL240', 'FL200', 'FL420', 'FL340'],
        correctIndex: 0,
      },
    ],
  },
]
