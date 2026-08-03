import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useI18n } from '@/i18n'
import { getModule } from '@/modules/registry'
import { randomSeed } from '@/lib/rng'
import { useProgress } from '@/store/progressStore'
import { ModuleFrame, ModuleIntro, ModuleResult } from '@/components/ModuleShell'
import { AIQuizRunner } from '@/components/AIQuizRunner'
import type { ModuleScore } from '@/modules/types'

type Stage =
  | { name: 'intro' }
  | { name: 'running'; seed: number; startedAt: number }
  | { name: 'result'; score: ModuleScore; durationMs: number }

export function ModulePage() {
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const { t, b } = useI18n()
  const addAttempt = useProgress((s) => s.addAttempt)
  const [stage, setStage] = useState<Stage>({ name: 'intro' })

  const module = moduleId ? getModule(moduleId) : undefined

  const start = useCallback(() => {
    setStage({ name: 'running', seed: randomSeed(), startedAt: Date.now() })
  }, [])

  const handleFinish = useCallback(
    (score: ModuleScore) => {
      if (stage.name !== 'running' || !module) return
      const durationMs = Date.now() - stage.startedAt
      addAttempt({
        moduleId: module.id,
        at: Date.now(),
        durationMs,
        mode: 'practice',
        score,
      })
      setStage({ name: 'result', score, durationMs })
    },
    [addAttempt, module, stage],
  )

  if (!module) {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="dim">404</p>
        <button type="button" className="btn btn-primary mt-4" onClick={() => navigate('/modules')}>
          {t('runner.backToModules')}
        </button>
      </div>
    )
  }

  if (stage.name === 'intro') {
    return <ModuleIntro module={module} mode="practice" onStart={start} />
  }

  if (stage.name === 'result') {
    return (
      <ModuleResult
        module={module}
        score={stage.score}
        durationMs={stage.durationMs}
        onAgain={start}
        onDone={() => navigate('/modules')}
        doneLabel={t('runner.backToModules')}
      />
    )
  }

  // Text-quiz modules generate fresh questions with the AI (grounded in the
  // program); everything else uses its procedural component.
  const cfg = module.defaultConfig as { count?: number; perItemMs?: number }
  return (
    <ModuleFrame title={b(module.title)} onQuit={() => navigate('/modules')}>
      {module.aiSubject ? (
        <AIQuizRunner
          key={stage.seed}
          subject={module.aiSubject}
          difficulty={module.aiDifficulty ?? 'medium'}
          count={cfg.count ?? 12}
          perItemMs={cfg.perItemMs ?? 45000}
          mode="practice"
          onFinish={handleFinish}
        />
      ) : (
        <module.Component
          key={stage.seed}
          config={module.defaultConfig}
          seed={stage.seed}
          mode="practice"
          onFinish={handleFinish}
        />
      )}
    </ModuleFrame>
  )
}
