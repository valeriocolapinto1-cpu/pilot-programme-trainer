import type { Bilingual } from '@/i18n'

/**
 * Physics bank built on the syllabus Wizz Air publishes for the selection:
 * kinematics; forces and uniform circular motion; work, energy and momentum;
 * statics; torque and rotational motion; temperature; heat; waves and sound;
 * electric forces and fields; electric circuits.
 */

export type PhysicsTopic =
  | 'kinematics'
  | 'forces'
  | 'energy'
  | 'statics'
  | 'rotation'
  | 'temperature'
  | 'heat'
  | 'waves'
  | 'electric-fields'
  | 'circuits'

export const PHYSICS_TOPIC_LABELS: Record<PhysicsTopic, Bilingual> = {
  kinematics: { it: 'Cinematica', en: 'Kinematics' },
  forces: { it: 'Forze e moto circolare', en: 'Forces and circular motion' },
  energy: { it: 'Lavoro, energia, quantità di moto', en: 'Work, energy, momentum' },
  statics: { it: 'Statica', en: 'Statics' },
  rotation: { it: 'Momento torcente e rotazione', en: 'Torque and rotation' },
  temperature: { it: 'Temperatura', en: 'Temperature' },
  heat: { it: 'Calore', en: 'Heat' },
  waves: { it: 'Onde e suono', en: 'Waves and sound' },
  'electric-fields': { it: 'Forze e campi elettrici', en: 'Electric forces and fields' },
  circuits: { it: 'Circuiti elettrici', en: 'Electric circuits' },
}

export const ALL_PHYSICS_TOPICS = Object.keys(PHYSICS_TOPIC_LABELS) as PhysicsTopic[]

export type PhysicsQuestion = {
  id: string
  topic: PhysicsTopic
  stem: Bilingual
  options: Bilingual[]
  correctIndex: number
  explanation: Bilingual
}

export const PHYSICS_BANK: PhysicsQuestion[] = [
  // ---------------------------------------------------------------- kinematics
  {
    id: 'kin-1',
    topic: 'kinematics',
    stem: {
      it: 'Un corpo parte da fermo con accelerazione costante di 2 m/s². Che distanza percorre in 6 s?',
      en: 'A body starts from rest with a constant acceleration of 2 m/s². How far does it travel in 6 s?',
    },
    options: [
      { it: '36 m', en: '36 m' },
      { it: '12 m', en: '12 m' },
      { it: '24 m', en: '24 m' },
      { it: '72 m', en: '72 m' },
    ],
    correctIndex: 0,
    explanation: {
      it: 's = ½at² = ½ × 2 × 36 = 36 m. Con partenza da fermo la distanza cresce col quadrato del tempo.',
      en: 's = ½at² = ½ × 2 × 36 = 36 m. From rest, distance grows with the square of time.',
    },
  },
  {
    id: 'kin-2',
    topic: 'kinematics',
    stem: {
      it: 'Un oggetto viene lasciato cadere (attrito trascurabile). Dopo 3 s la sua velocità è circa:',
      en: 'An object is dropped (friction negligible). After 3 s its speed is about:',
    },
    options: [
      { it: '30 m/s', en: '30 m/s' },
      { it: '10 m/s', en: '10 m/s' },
      { it: '45 m/s', en: '45 m/s' },
      { it: '90 m/s', en: '90 m/s' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'v = gt ≈ 9,81 × 3 ≈ 29,4 m/s, cioè circa 30 m/s.',
      en: 'v = gt ≈ 9.81 × 3 ≈ 29.4 m/s, so about 30 m/s.',
    },
  },
  {
    id: 'kin-3',
    topic: 'kinematics',
    stem: {
      it: 'Nel moto di un proiettile senza resistenza dell’aria, quale componente della velocità resta costante?',
      en: 'In projectile motion without air resistance, which velocity component stays constant?',
    },
    options: [
      { it: 'Solo quella orizzontale', en: 'The horizontal one only' },
      { it: 'Solo quella verticale', en: 'The vertical one only' },
      { it: 'Entrambe', en: 'Both' },
      { it: 'Nessuna delle due', en: 'Neither' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'La gravità agisce solo in verticale: la componente orizzontale non cambia, quella verticale sì.',
      en: 'Gravity acts vertically only: the horizontal component is unchanged, the vertical one is not.',
    },
  },
  {
    id: 'kin-4',
    topic: 'kinematics',
    stem: {
      it: 'Un aereo decolla con accelerazione costante e raggiunge 70 m/s in 35 s. Qual è l’accelerazione?',
      en: 'An aircraft accelerates uniformly and reaches 70 m/s in 35 s. What is the acceleration?',
    },
    options: [
      { it: '2 m/s²', en: '2 m/s²' },
      { it: '0,5 m/s²', en: '0.5 m/s²' },
      { it: '35 m/s²', en: '35 m/s²' },
      { it: '4 m/s²', en: '4 m/s²' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'a = Δv/Δt = 70/35 = 2 m/s².',
      en: 'a = Δv/Δt = 70/35 = 2 m/s².',
    },
  },
  {
    id: 'kin-5',
    topic: 'kinematics',
    stem: {
      it: 'In un grafico velocità-tempo, cosa rappresenta l’area sotto la curva?',
      en: 'On a velocity-time graph, what does the area under the curve represent?',
    },
    options: [
      { it: 'La distanza percorsa', en: 'The distance travelled' },
      { it: "L'accelerazione", en: 'The acceleration' },
      { it: 'La forza applicata', en: 'The applied force' },
      { it: 'La quantità di moto', en: 'The momentum' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'La pendenza dà l’accelerazione, l’area dà lo spostamento.',
      en: 'The slope gives acceleration, the area gives displacement.',
    },
  },

  // -------------------------------------------------------------------- forces
  {
    id: 'for-1',
    topic: 'forces',
    stem: {
      it: 'Un corpo percorre una traiettoria circolare a velocità costante in modulo. Cosa si può dire?',
      en: 'A body moves along a circular path at constant speed. What can be said?',
    },
    options: [
      { it: 'Accelera, perché cambia la direzione della velocità', en: 'It is accelerating, because the direction of velocity changes' },
      { it: 'Non accelera, perché la velocità è costante', en: 'It is not accelerating, because speed is constant' },
      { it: 'La forza risultante è nulla', en: 'The net force is zero' },
      { it: 'La forza centrifuga è la forza reale che agisce', en: 'Centrifugal force is the real force acting' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'La velocità è un vettore: cambiare direzione è accelerare. L’accelerazione centripeta punta verso il centro.',
      en: 'Velocity is a vector: changing direction is acceleration. Centripetal acceleration points to the centre.',
    },
  },
  {
    id: 'for-2',
    topic: 'forces',
    stem: {
      it: 'In una virata corretta a 60° di inclinazione, il fattore di carico sostenuto dall’aereo è:',
      en: 'In a level turn at 60° of bank, the load factor on the aircraft is:',
    },
    options: [
      { it: '2 g', en: '2 g' },
      { it: '1,5 g', en: '1.5 g' },
      { it: '1 g', en: '1 g' },
      { it: '3 g', en: '3 g' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'n = 1/cos(φ) = 1/cos 60° = 1/0,5 = 2. È la ragione per cui la velocità di stallo aumenta di √2 ≈ 41%.',
      en: 'n = 1/cos(φ) = 1/cos 60° = 1/0.5 = 2. This is why stall speed rises by √2 ≈ 41%.',
    },
  },
  {
    id: 'for-3',
    topic: 'forces',
    stem: {
      it: 'Terza legge di Newton: quando l’ala spinge l’aria verso il basso…',
      en: "Newton's third law: when the wing pushes air downwards…",
    },
    options: [
      { it: 'l’aria spinge l’ala verso l’alto con forza uguale e contraria', en: 'the air pushes the wing upwards with an equal and opposite force' },
      { it: 'la portanza nasce solo dalla differenza di pressione', en: 'lift comes only from the pressure difference' },
      { it: 'l’aria non esercita alcuna forza sull’ala', en: 'the air exerts no force on the wing' },
      { it: 'la forza risultante sull’aereo è nulla', en: 'the net force on the aircraft is zero' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Azione e reazione: deviare massa d’aria verso il basso produce una forza verso l’alto sull’ala.',
      en: 'Action and reaction: deflecting air mass downwards produces an upward force on the wing.',
    },
  },
  {
    id: 'for-4',
    topic: 'forces',
    stem: {
      it: 'La forza di attrito radente dipende principalmente da:',
      en: 'Sliding friction depends mainly on:',
    },
    options: [
      { it: 'Forza normale e coefficiente di attrito', en: 'Normal force and friction coefficient' },
      { it: 'Area di contatto', en: 'Contact area' },
      { it: 'Velocità del corpo', en: 'Speed of the body' },
      { it: 'Volume del corpo', en: 'Volume of the body' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'F = μN. In prima approssimazione l’area di contatto non compare.',
      en: 'F = μN. To a first approximation the contact area does not appear.',
    },
  },
  {
    id: 'for-5',
    topic: 'forces',
    stem: {
      it: 'Un’auto di 1000 kg curva a 20 m/s su un raggio di 50 m. Quale forza centripeta serve?',
      en: 'A 1000 kg car corners at 20 m/s on a 50 m radius. What centripetal force is needed?',
    },
    options: [
      { it: '8000 N', en: '8000 N' },
      { it: '400 N', en: '400 N' },
      { it: '20 000 N', en: '20,000 N' },
      { it: '1000 N', en: '1000 N' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'F = mv²/r = 1000 × 400 / 50 = 8000 N.',
      en: 'F = mv²/r = 1000 × 400 / 50 = 8000 N.',
    },
  },

  // -------------------------------------------------------------------- energy
  {
    id: 'ene-1',
    topic: 'energy',
    stem: {
      it: 'Se raddoppi la velocità di un corpo, la sua energia cinetica:',
      en: 'If you double the speed of a body, its kinetic energy:',
    },
    options: [
      { it: 'Quadruplica', en: 'Quadruples' },
      { it: 'Raddoppia', en: 'Doubles' },
      { it: 'Resta uguale', en: 'Stays the same' },
      { it: 'Aumenta di 8 volte', en: 'Increases eightfold' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Ek = ½mv²: dipende dal quadrato della velocità. È anche il motivo per cui la distanza di frenata quadruplica.',
      en: 'Ek = ½mv²: it depends on the square of speed. It is also why braking distance quadruples.',
    },
  },
  {
    id: 'ene-2',
    topic: 'energy',
    stem: {
      it: 'Una massa di 2 kg è sollevata di 5 m. Quale energia potenziale gravitazionale acquista (g ≈ 10)?',
      en: 'A 2 kg mass is lifted 5 m. What gravitational potential energy does it gain (g ≈ 10)?',
    },
    options: [
      { it: '100 J', en: '100 J' },
      { it: '10 J', en: '10 J' },
      { it: '25 J', en: '25 J' },
      { it: '1000 J', en: '1000 J' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Ep = mgh = 2 × 10 × 5 = 100 J.',
      en: 'Ep = mgh = 2 × 10 × 5 = 100 J.',
    },
  },
  {
    id: 'ene-3',
    topic: 'energy',
    stem: {
      it: 'In un urto perfettamente anelastico si conserva:',
      en: 'In a perfectly inelastic collision, what is conserved?',
    },
    options: [
      { it: 'La quantità di moto, ma non l’energia cinetica', en: 'Momentum, but not kinetic energy' },
      { it: 'L’energia cinetica, ma non la quantità di moto', en: 'Kinetic energy, but not momentum' },
      { it: 'Entrambe', en: 'Both' },
      { it: 'Nessuna delle due', en: 'Neither' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'La quantità di moto si conserva sempre in assenza di forze esterne; l’energia cinetica si conserva solo negli urti elastici.',
      en: 'Momentum is always conserved without external forces; kinetic energy is conserved only in elastic collisions.',
    },
  },
  {
    id: 'ene-4',
    topic: 'energy',
    stem: {
      it: 'Un motore compie 6000 J di lavoro in 30 s. Qual è la potenza media?',
      en: 'An engine does 6000 J of work in 30 s. What is the average power?',
    },
    options: [
      { it: '200 W', en: '200 W' },
      { it: '180 000 W', en: '180,000 W' },
      { it: '20 W', en: '20 W' },
      { it: '2000 W', en: '2000 W' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'P = W/t = 6000/30 = 200 W.',
      en: 'P = W/t = 6000/30 = 200 W.',
    },
  },
  {
    id: 'ene-5',
    topic: 'energy',
    stem: {
      it: 'Una forza di 50 N sposta un corpo di 4 m in direzione perpendicolare alla forza. Il lavoro compiuto è:',
      en: 'A 50 N force moves a body 4 m in a direction perpendicular to the force. The work done is:',
    },
    options: [
      { it: '0 J', en: '0 J' },
      { it: '200 J', en: '200 J' },
      { it: '12,5 J', en: '12.5 J' },
      { it: '50 J', en: '50 J' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'W = F·s·cos θ. Con θ = 90°, cos θ = 0 e il lavoro è nullo.',
      en: 'W = F·s·cos θ. With θ = 90°, cos θ = 0 and the work is zero.',
    },
  },

  // ------------------------------------------------------------------- statics
  {
    id: 'sta-1',
    topic: 'statics',
    stem: {
      it: 'Un corpo è in equilibrio statico quando:',
      en: 'A body is in static equilibrium when:',
    },
    options: [
      { it: 'La somma delle forze e la somma dei momenti sono entrambe nulle', en: 'The sum of forces and the sum of moments are both zero' },
      { it: 'La somma delle forze è nulla, indipendentemente dai momenti', en: 'The sum of forces is zero, regardless of moments' },
      { it: 'Il corpo è fermo, anche con forze non equilibrate', en: 'The body is at rest, even with unbalanced forces' },
      { it: 'La massa è distribuita uniformemente', en: 'Mass is uniformly distributed' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Servono entrambe le condizioni: traslazionale (ΣF = 0) e rotazionale (ΣM = 0).',
      en: 'Both conditions are required: translational (ΣF = 0) and rotational (ΣM = 0).',
    },
  },
  {
    id: 'sta-2',
    topic: 'statics',
    stem: {
      it: 'Perché il centro di gravità di un aereo è così importante per il caricamento?',
      en: "Why does an aircraft's centre of gravity matter so much for loading?",
    },
    options: [
      { it: 'Determina stabilità e controllabilità in beccheggio', en: 'It determines pitch stability and controllability' },
      { it: 'Determina solo il peso massimo al decollo', en: 'It only determines maximum take-off weight' },
      { it: 'Influisce solo sul consumo di carburante', en: 'It only affects fuel consumption' },
      { it: 'Non ha effetti se il peso è sotto il massimo', en: 'It has no effect if weight is below maximum' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Un CG troppo avanzato o arretrato cambia il braccio del piano di coda: stabilità, controllo e velocità di stallo ne risentono.',
      en: 'A CG too far forward or aft changes the tailplane moment arm: stability, control and stall speed all change.',
    },
  },
  {
    id: 'sta-3',
    topic: 'statics',
    stem: {
      it: 'Una trave di 4 m è appoggiata su due sostegni alle estremità e porta un carico di 200 N al centro. Quale reazione su ogni sostegno?',
      en: 'A 4 m beam rests on two end supports with a 200 N load at the centre. What is the reaction at each support?',
    },
    options: [
      { it: '100 N ciascuno', en: '100 N each' },
      { it: '200 N ciascuno', en: '200 N each' },
      { it: '50 N ciascuno', en: '50 N each' },
      { it: '400 N ciascuno', en: '400 N each' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Carico centrato e simmetria: ogni sostegno regge metà del carico.',
      en: 'Centred load and symmetry: each support carries half the load.',
    },
  },

  // ------------------------------------------------------------------ rotation
  {
    id: 'rot-1',
    topic: 'rotation',
    stem: {
      it: 'Una forza di 20 N è applicata a 0,5 m dal fulcro, perpendicolarmente al braccio. Qual è il momento?',
      en: 'A 20 N force is applied 0.5 m from the pivot, perpendicular to the arm. What is the moment?',
    },
    options: [
      { it: '10 N·m', en: '10 N·m' },
      { it: '40 N·m', en: '40 N·m' },
      { it: '20,5 N·m', en: '20.5 N·m' },
      { it: '0,025 N·m', en: '0.025 N·m' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'M = F × d = 20 × 0,5 = 10 N·m.',
      en: 'M = F × d = 20 × 0.5 = 10 N·m.',
    },
  },
  {
    id: 'rot-2',
    topic: 'rotation',
    stem: {
      it: 'Una pattinatrice che ruota chiude le braccia. Cosa succede?',
      en: 'A spinning skater pulls their arms in. What happens?',
    },
    options: [
      { it: 'Il momento d’inerzia cala e la velocità angolare cresce', en: 'Moment of inertia falls and angular speed rises' },
      { it: 'Il momento angolare aumenta', en: 'Angular momentum increases' },
      { it: 'La velocità angolare cala', en: 'Angular speed falls' },
      { it: 'Non cambia nulla', en: 'Nothing changes' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Il momento angolare L = Iω si conserva: se I diminuisce, ω aumenta.',
      en: 'Angular momentum L = Iω is conserved: if I decreases, ω increases.',
    },
  },
  {
    id: 'rot-3',
    topic: 'rotation',
    stem: {
      it: 'Su un’altalena a bilico, un bambino di 30 kg siede a 2 m dal fulcro. A che distanza deve sedere uno di 40 kg per equilibrarla?',
      en: 'On a seesaw, a 30 kg child sits 2 m from the pivot. How far from the pivot must a 40 kg child sit to balance it?',
    },
    options: [
      { it: '1,5 m', en: '1.5 m' },
      { it: '2 m', en: '2 m' },
      { it: '2,67 m', en: '2.67 m' },
      { it: '3 m', en: '3 m' },
    ],
    correctIndex: 0,
    explanation: {
      it: '30 × 2 = 40 × d → d = 60/40 = 1,5 m. È la stessa logica del bilanciamento peso-braccio in aeronautica.',
      en: '30 × 2 = 40 × d → d = 60/40 = 1.5 m. Same logic as weight-and-balance arms in aviation.',
    },
  },

  // --------------------------------------------------------------- temperature
  {
    id: 'tem-1',
    topic: 'temperature',
    stem: {
      it: 'Nell’atmosfera standard ISA, qual è il gradiente termico verticale medio in troposfera?',
      en: 'In the ISA standard atmosphere, what is the average temperature lapse rate in the troposphere?',
    },
    options: [
      { it: '−2 °C ogni 1000 ft', en: '−2 °C per 1000 ft' },
      { it: '−1 °C ogni 1000 ft', en: '−1 °C per 1000 ft' },
      { it: '−3 °C ogni 1000 ft', en: '−3 °C per 1000 ft' },
      { it: '−6 °C ogni 1000 ft', en: '−6 °C per 1000 ft' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'ISA: 15 °C al livello del mare, circa −1,98 °C ogni 1000 ft (≈ 6,5 °C/km) fino alla tropopausa.',
      en: 'ISA: 15 °C at sea level, about −1.98 °C per 1000 ft (≈ 6.5 °C/km) up to the tropopause.',
    },
  },
  {
    id: 'tem-2',
    topic: 'temperature',
    stem: {
      it: 'Lo zero assoluto corrisponde a:',
      en: 'Absolute zero corresponds to:',
    },
    options: [
      { it: '−273,15 °C', en: '−273.15 °C' },
      { it: '0 °C', en: '0 °C' },
      { it: '−100 °C', en: '−100 °C' },
      { it: '−459 °C', en: '−459 °C' },
    ],
    correctIndex: 0,
    explanation: {
      it: '0 K = −273,15 °C. (−459,67 è il valore in gradi Fahrenheit.)',
      en: '0 K = −273.15 °C. (−459.67 is the value in degrees Fahrenheit.)',
    },
  },
  {
    id: 'tem-3',
    topic: 'temperature',
    stem: {
      it: 'A volume costante, se la temperatura assoluta di un gas raddoppia, la pressione:',
      en: 'At constant volume, if the absolute temperature of a gas doubles, the pressure:',
    },
    options: [
      { it: 'Raddoppia', en: 'Doubles' },
      { it: 'Si dimezza', en: 'Halves' },
      { it: 'Resta costante', en: 'Stays constant' },
      { it: 'Quadruplica', en: 'Quadruples' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Legge di Gay-Lussac: p/T costante a volume costante (T in kelvin).',
      en: "Gay-Lussac's law: p/T is constant at constant volume (T in kelvin).",
    },
  },

  // -------------------------------------------------------------------- heat
  {
    id: 'hea-1',
    topic: 'heat',
    stem: {
      it: 'Servono 4200 J per scaldare 1 kg d’acqua di 1 °C. Quanto calore serve per scaldare 2 kg di 5 °C?',
      en: 'It takes 4200 J to heat 1 kg of water by 1 °C. How much heat to raise 2 kg by 5 °C?',
    },
    options: [
      { it: '42 000 J', en: '42,000 J' },
      { it: '8400 J', en: '8400 J' },
      { it: '21 000 J', en: '21,000 J' },
      { it: '4200 J', en: '4200 J' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Q = mcΔT = 2 × 4200 × 5 = 42 000 J.',
      en: 'Q = mcΔT = 2 × 4200 × 5 = 42,000 J.',
    },
  },
  {
    id: 'hea-2',
    topic: 'heat',
    stem: {
      it: 'Durante un passaggio di stato a pressione costante, la temperatura della sostanza:',
      en: 'During a change of state at constant pressure, the temperature of the substance:',
    },
    options: [
      { it: 'Resta costante finché la transizione non è completa', en: 'Stays constant until the transition is complete' },
      { it: 'Aumenta linearmente', en: 'Rises linearly' },
      { it: 'Diminuisce sempre', en: 'Always falls' },
      { it: 'Oscilla', en: 'Oscillates' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Il calore latente rompe i legami invece di aumentare l’energia cinetica media: la temperatura non sale.',
      en: 'Latent heat breaks bonds instead of raising average kinetic energy: the temperature does not rise.',
    },
  },
  {
    id: 'hea-3',
    topic: 'heat',
    stem: {
      it: 'Come si trasmette principalmente il calore attraverso il vuoto?',
      en: 'How is heat mainly transferred through a vacuum?',
    },
    options: [
      { it: 'Irraggiamento', en: 'Radiation' },
      { it: 'Conduzione', en: 'Conduction' },
      { it: 'Convezione', en: 'Convection' },
      { it: 'Evaporazione', en: 'Evaporation' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Conduzione e convezione richiedono un mezzo materiale; l’irraggiamento no.',
      en: 'Conduction and convection need a material medium; radiation does not.',
    },
  },
  {
    id: 'hea-4',
    topic: 'heat',
    stem: {
      it: 'Perché una sostanza con calore specifico alto scalda più lentamente?',
      en: 'Why does a substance with a high specific heat warm up more slowly?',
    },
    options: [
      { it: 'Serve più energia per aumentare di 1 °C la stessa massa', en: 'It takes more energy to raise the same mass by 1 °C' },
      { it: 'Conduce peggio il calore', en: 'It conducts heat worse' },
      { it: 'Ha densità maggiore', en: 'It is denser' },
      { it: 'Irraggia di più', en: 'It radiates more' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Q = mcΔT: a parità di Q e m, un c grande dà un ΔT piccolo. È il motivo per cui il mare modera il clima costiero.',
      en: 'Q = mcΔT: for the same Q and m, a large c gives a small ΔT. It is why the sea moderates coastal climates.',
    },
  },

  // ------------------------------------------------------------------- waves
  {
    id: 'wav-1',
    topic: 'waves',
    stem: {
      it: 'Relazione fondamentale delle onde: v = ?',
      en: 'Fundamental wave relationship: v = ?',
    },
    options: [
      { it: 'frequenza × lunghezza d’onda', en: 'frequency × wavelength' },
      { it: 'frequenza ÷ lunghezza d’onda', en: 'frequency ÷ wavelength' },
      { it: 'ampiezza × frequenza', en: 'amplitude × frequency' },
      { it: 'periodo × lunghezza d’onda', en: 'period × wavelength' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'v = fλ. Il periodo è l’inverso della frequenza: T = 1/f.',
      en: 'v = fλ. The period is the inverse of frequency: T = 1/f.',
    },
  },
  {
    id: 'wav-2',
    topic: 'waves',
    stem: {
      it: 'Il suono è un’onda:',
      en: 'Sound is a wave that is:',
    },
    options: [
      { it: 'Longitudinale, che richiede un mezzo materiale', en: 'Longitudinal, and needs a material medium' },
      { it: 'Trasversale, che si propaga anche nel vuoto', en: 'Transverse, and travels through a vacuum' },
      { it: 'Elettromagnetica', en: 'Electromagnetic' },
      { it: 'Stazionaria per definizione', en: 'Standing by definition' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Le compressioni e rarefazioni avvengono lungo la direzione di propagazione, e servono particelle da comprimere.',
      en: 'Compressions and rarefactions occur along the direction of travel, and particles are needed to compress.',
    },
  },
  {
    id: 'wav-3',
    topic: 'waves',
    stem: {
      it: 'Un aereo si avvicina a un osservatore. Per effetto Doppler l’osservatore percepisce:',
      en: 'An aircraft approaches an observer. Because of the Doppler effect the observer hears:',
    },
    options: [
      { it: 'Una frequenza più alta di quella emessa', en: 'A higher frequency than emitted' },
      { it: 'Una frequenza più bassa', en: 'A lower frequency' },
      { it: 'La stessa frequenza', en: 'The same frequency' },
      { it: 'Nessun suono', en: 'No sound' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'I fronti d’onda si comprimono in avvicinamento: la frequenza sale. In allontanamento scende.',
      en: 'Wavefronts bunch up on approach: frequency rises. It falls as it recedes.',
    },
  },
  {
    id: 'wav-4',
    topic: 'waves',
    stem: {
      it: 'Come varia la velocità del suono in aria all’aumentare della temperatura?',
      en: 'How does the speed of sound in air change as temperature increases?',
    },
    options: [
      { it: 'Aumenta', en: 'It increases' },
      { it: 'Diminuisce', en: 'It decreases' },
      { it: 'Resta costante', en: 'It stays constant' },
      { it: 'Dipende solo dalla pressione', en: 'It depends on pressure only' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'a = 38,94 × √T(K): con l’aumento della temperatura le molecole trasmettono le perturbazioni più rapidamente. È la ragione per cui il numero di Mach dipende dalla temperatura, non dalla quota in sé.',
      en: 'a = 38.94 × √T(K): warmer molecules pass the disturbance on faster. It is why Mach number depends on temperature, not altitude as such.',
    },
  },

  // --------------------------------------------------------- electric fields
  {
    id: 'ele-1',
    topic: 'electric-fields',
    stem: {
      it: 'Due cariche puntiformi si allontanano fino a raddoppiare la distanza. La forza tra loro:',
      en: 'Two point charges are moved apart until the distance doubles. The force between them:',
    },
    options: [
      { it: 'Si riduce a un quarto', en: 'Falls to a quarter' },
      { it: 'Si dimezza', en: 'Halves' },
      { it: 'Raddoppia', en: 'Doubles' },
      { it: 'Non cambia', en: 'Is unchanged' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Legge di Coulomb: F ∝ 1/r². Raddoppiando r la forza si riduce a 1/4.',
      en: "Coulomb's law: F ∝ 1/r². Doubling r reduces the force to 1/4.",
    },
  },
  {
    id: 'ele-2',
    topic: 'electric-fields',
    stem: {
      it: 'Le linee di campo elettrico escono da…',
      en: 'Electric field lines point away from…',
    },
    options: [
      { it: 'cariche positive ed entrano nelle negative', en: 'positive charges and into negative ones' },
      { it: 'cariche negative ed entrano nelle positive', en: 'negative charges and into positive ones' },
      { it: 'entrambe le cariche', en: 'both kinds of charge' },
      { it: 'nessuna carica: sono chiuse', en: 'no charge: they are closed loops' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Per convenzione il campo indica la forza su una carica di prova positiva.',
      en: 'By convention the field shows the force on a positive test charge.',
    },
  },
  {
    id: 'ele-3',
    topic: 'electric-fields',
    stem: {
      it: 'Perché l’interno di una fusoliera metallica protegge dai fulmini?',
      en: 'Why does the inside of a metal fuselage protect from lightning?',
    },
    options: [
      { it: 'Gabbia di Faraday: il campo all’interno di un conduttore chiuso è nullo', en: 'Faraday cage: the field inside a closed conductor is zero' },
      { it: 'Il metallo assorbe la carica e la annulla', en: 'The metal absorbs the charge and cancels it' },
      { it: 'L’aria interna è isolante', en: 'The air inside is an insulator' },
      { it: 'La corrente non può fluire nel metallo', en: 'Current cannot flow in metal' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Le cariche si ridistribuiscono sulla superficie esterna e il campo interno si annulla: la corrente scorre sul guscio.',
      en: 'Charges redistribute on the outer surface and the internal field cancels: current flows over the shell.',
    },
  },

  // ----------------------------------------------------------------- circuits
  {
    id: 'cir-1',
    topic: 'circuits',
    stem: {
      it: 'Un resistore da 12 Ω è alimentato a 24 V. Quale corrente circola?',
      en: 'A 12 Ω resistor is supplied with 24 V. What current flows?',
    },
    options: [
      { it: '2 A', en: '2 A' },
      { it: '0,5 A', en: '0.5 A' },
      { it: '288 A', en: '288 A' },
      { it: '12 A', en: '12 A' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Legge di Ohm: I = V/R = 24/12 = 2 A.',
      en: "Ohm's law: I = V/R = 24/12 = 2 A.",
    },
  },
  {
    id: 'cir-2',
    topic: 'circuits',
    stem: {
      it: 'Due resistori da 10 Ω in parallelo danno una resistenza equivalente di:',
      en: 'Two 10 Ω resistors in parallel give an equivalent resistance of:',
    },
    options: [
      { it: '5 Ω', en: '5 Ω' },
      { it: '20 Ω', en: '20 Ω' },
      { it: '10 Ω', en: '10 Ω' },
      { it: '0,1 Ω', en: '0.1 Ω' },
    ],
    correctIndex: 0,
    explanation: {
      it: '1/Req = 1/10 + 1/10 = 1/5. In parallelo la resistenza equivalente è sempre minore della più piccola.',
      en: '1/Req = 1/10 + 1/10 = 1/5. In parallel the equivalent resistance is always lower than the smallest one.',
    },
  },
  {
    id: 'cir-3',
    topic: 'circuits',
    stem: {
      it: 'In un circuito in serie, cosa è uguale in tutti i componenti?',
      en: 'In a series circuit, what is the same through every component?',
    },
    options: [
      { it: 'La corrente', en: 'The current' },
      { it: 'La tensione', en: 'The voltage' },
      { it: 'La potenza', en: 'The power' },
      { it: 'La resistenza', en: 'The resistance' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'In serie la corrente è comune e le tensioni si sommano; in parallelo è il contrario.',
      en: 'In series the current is common and voltages add; in parallel it is the other way round.',
    },
  },
  {
    id: 'cir-4',
    topic: 'circuits',
    stem: {
      it: 'Un carico assorbe 5 A a 28 V. Quale potenza dissipa?',
      en: 'A load draws 5 A at 28 V. What power does it dissipate?',
    },
    options: [
      { it: '140 W', en: '140 W' },
      { it: '5,6 W', en: '5.6 W' },
      { it: '33 W', en: '33 W' },
      { it: '700 W', en: '700 W' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'P = VI = 28 × 5 = 140 W. (28 V è la tensione tipica dell’impianto DC di bordo.)',
      en: 'P = VI = 28 × 5 = 140 W. (28 V is the typical aircraft DC bus voltage.)',
    },
  },
  {
    id: 'cir-5',
    topic: 'circuits',
    stem: {
      it: 'A cosa serve un fusibile in un circuito?',
      en: 'What is a fuse for in a circuit?',
    },
    options: [
      { it: 'Interrompere il circuito se la corrente supera un valore di sicurezza', en: 'To break the circuit if current exceeds a safe value' },
      { it: 'Aumentare la tensione disponibile', en: 'To raise the available voltage' },
      { it: 'Ridurre la resistenza totale', en: 'To reduce total resistance' },
      { it: 'Stabilizzare la frequenza', en: 'To stabilise frequency' },
    ],
    correctIndex: 0,
    explanation: {
      it: 'Protegge cablaggi e utenze da sovracorrenti: si apre prima che il conduttore si danneggi.',
      en: 'It protects wiring and loads from overcurrent: it opens before the conductor is damaged.',
    },
  },
]
