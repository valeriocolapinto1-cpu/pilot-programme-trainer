import { useI18n, type Bilingual } from '@/i18n'
import { Card, PageHeader, SectionHeader, Tag } from '@/components/ui'

type Step = { phase: Bilingual; body: Bilingual; official: boolean }

const STEPS: Step[] = [
  {
    phase: { it: 'Fase 0 — Requisiti e candidatura', en: 'Phase 0 — Requirements and application' },
    body: {
      it: '18 anni minimo, diploma di scuola superiore, inglese fluente, diritto illimitato a vivere e lavorare in UE, saper nuotare 50 m senza aiuti, idoneità medica EASA Classe 1 (obbligatoria prima dell’iscrizione al corso, non il giorno dell’assessment).',
      en: 'Minimum age 18, secondary school diploma, fluent English, unrestricted right to live and work in the EU, able to swim 50 m unaided, EASA Class 1 medical (required before enrolling on the course, not on assessment day).',
    },
    official: true,
  },
  {
    phase: { it: 'Fase 1 — TestAir360 (test online 1)', en: 'Phase 1 — TestAir360 (online test 1)' },
    body: {
      it: 'Piattaforma attitudinale usata da Wizz Air e dalle scuole partner. Quattro test di pratica gratuiti, poi l’esame “Pro” da circa 3-4 ore con 13 moduli, da casa, con proctoring automatico (Proctorio) ed entro una deadline non posticipabile. Fee ~110-130 €, non rimborsabile. I risultati sono comunicati in percentuali per modulo.',
      en: 'The aptitude platform used by Wizz Air and its partner schools. Four free practice tests, then the “Pro” exam of about 3-4 hours with 13 modules, taken at home with automated proctoring (Proctorio) and a deadline that cannot be moved. Fee ~€110-130, non-refundable. Results are reported as per-module percentages.',
    },
    official: true,
  },
  {
    phase: { it: 'Fase 2 — Questionario psicologico (test online 2)', en: 'Phase 2 — Psychological questionnaire (online test 2)' },
    body: {
      it: 'Questionario di personalità con alcune centinaia di domande più esercizi di concentrazione. Costruito per resistere alla desiderabilità sociale: incrocia le risposte e rileva le incoerenze. Nessuna soglia per singola domanda: genera un profilo complessivo.',
      en: 'A personality questionnaire of several hundred items plus concentration exercises. Built to resist social desirability: it cross-references answers and detects contradictions. No per-question threshold: it produces a holistic profile.',
    },
    official: true,
  },
  {
    phase: { it: 'Fase 3 — Group exercise (giornata in presenza)', en: 'Phase 3 — Group exercise (assessment day)' },
    body: {
      it: 'Gruppi tipicamente di 6-12 persone con un problema collaborativo volutamente vincolato: non c’è abbastanza tempo né abbastanza informazione per una soluzione perfetta. Si valuta come interagisci, non se risolvi.',
      en: 'Groups of typically 6-12 people with a deliberately constrained collaborative problem: there is not enough time nor enough information for a perfect solution. What is assessed is how you interact, not whether you solve it.',
    },
    official: false,
  },
  {
    phase: { it: 'Fase 4 — Colloquio tecnico + HR', en: 'Phase 4 — Technical + HR interview' },
    body: {
      it: 'Condotto da assessor Wizz Air, tipicamente due piloti, in un’unica sessione che mescola conoscenze tecniche e domande HR/scenario. Per i cadetti le domande sono ancorate alle materie ATPL di base: gli assessor valutano come ragioni nell’incertezza, non la memoria di numeri regolamentari.',
      en: 'Run by Wizz Air assessors, typically two pilots, in a single session mixing technical knowledge with HR and scenario questions. For cadets the questions are anchored to basic ATPL subjects: assessors judge how you reason under uncertainty, not your recall of regulatory numbers.',
    },
    official: false,
  },
  {
    phase: { it: 'Fase 5 (eventuale) — Simulatore', en: 'Phase 5 (possible) — Simulator' },
    body: {
      it: 'Per i cadetti ab-initio non è confermata universalmente: è documentata soprattutto per candidati con esperienza. Se prevista, si valutano CRM e addestrabilità, non la perfezione tecnica. Verifica alla convocazione.',
      en: 'For ab-initio cadets this is not universally confirmed: it is mainly documented for experienced candidates. Where it applies, CRM and trainability are assessed, not technical perfection. Check your invitation.',
    },
    official: false,
  },
  {
    phase: { it: 'Fase 6 — Esito e offerta', en: 'Phase 6 — Outcome and offer' },
    body: {
      it: 'Esito entro circa 7-14 giorni. Chi supera riceve una Conditional Job Offer e accede al corso ATPL Integrato di ~18 mesi presso Urbe Aero. Non viene fornito feedback individuale; in caso di esito negativo si applica un periodo di attesa prima di riprovare.',
      en: 'Outcome within about 7-14 days. Those who pass receive a Conditional Job Offer and join the ~18-month Integrated ATPL course at Urbe Aero. No individual feedback is given; an unsuccessful outcome carries a lockout period before reapplying.',
    },
    official: true,
  },
]

export function AboutPage() {
  const { t, b } = useI18n()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('about.title')} />

      <Card className="border-[var(--accent-line)]">
        <SectionHeader>{t('about.disclaimer.title')}</SectionHeader>
        <p className="text-sm leading-relaxed">{t('about.disclaimer.body')}</p>
      </Card>

      <ol className="flex flex-col gap-3">
        {STEPS.map((step, i) => (
          <li key={i}>
            <Card>
              <div className="mb-2 flex flex-wrap items-baseline gap-2.5">
                <h2 className="font-medium">{b(step.phase)}</h2>
                <Tag
                  title={step.official ? t('source.officialHint') : t('source.communityHint')}
                >
                  {step.official ? t('source.official') : t('source.community')}
                </Tag>
              </div>
              <p className="muted text-[0.875rem] leading-relaxed">{b(step.body)}</p>
            </Card>
          </li>
        ))}
      </ol>

      <Card>
        <SectionHeader>
          {b({ it: 'Attenzione a due confusioni comuni', en: 'Two common mix-ups' })}
        </SectionHeader>
        <ul className="flex flex-col gap-2 text-sm leading-relaxed">
          <li className="flex gap-2.5">
            <span className="mono muted-more flex-none">01</span>
            <span>
              {b({
                it: 'COMPASS non è la piattaforma usata: alcune fonti datate lo citano ancora, ma per il percorso attuale la piattaforma confermata è TestAir360.',
                en: 'COMPASS is not the platform in use: some dated sources still mention it, but the confirmed platform for the current programme is TestAir360.',
              })}
            </span>
          </li>
          <li className="flex gap-2.5">
            <span className="mono muted-more flex-none">02</span>
            <span>
              {b({
                it: 'Symbiotics ADAPT è la suite usata da Urbe Aero per il programma Aeroitalia, non per il Pathway Wizz Air.',
                en: 'Symbiotics ADAPT is the suite Urbe Aero uses for the Aeroitalia programme, not for the Wizz Air Pathway.',
              })}
            </span>
          </li>
        </ul>
      </Card>

      <Card>
        <SectionHeader>{b({ it: 'Fonti', en: 'Sources' })}</SectionHeader>
        <p className="muted text-[0.8125rem] leading-relaxed">
          {b({
            it: 'Ufficiali: urbe.aero, careers.wizzair.com (requisiti e syllabus di fisica), trenerkft.hu, testair360.com, wizzair.com, enac.gov.it, easa.europa.eu. Testimonianze e materiale di preparazione (da verificare): PPRuNe, pilotaptitudetest.com, clearatpl.com, airmappr.com, aviationinterviews.com.',
            en: 'Official: urbe.aero, careers.wizzair.com (requirements and physics syllabus), trenerkft.hu, testair360.com, wizzair.com, enac.gov.it, easa.europa.eu. Candidate reports and preparation material (to be verified): PPRuNe, pilotaptitudetest.com, clearatpl.com, airmappr.com, aviationinterviews.com.',
          })}
        </p>
      </Card>
    </div>
  )
}
