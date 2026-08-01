import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '@/app/Layout'
import { HomePage } from '@/pages/HomePage'
import { ModulesPage } from '@/pages/ModulesPage'
import { ModulePage } from '@/pages/ModulePage'
import { ExamPage } from '@/pages/ExamPage'
import { ExamRunPage } from '@/pages/ExamRunPage'
import { ProgressPage } from '@/pages/ProgressPage'
import { PlanPage } from '@/pages/PlanPage'
import { AboutPage } from '@/pages/AboutPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { useSettings } from '@/store/settingsStore'

export function App() {
  const theme = useSettings((s) => s.theme)
  const locale = useSettings((s) => s.locale)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.lang = locale
  }, [theme, locale])

  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/modules" element={<ModulesPage />} />
          <Route path="/modules/:moduleId" element={<ModulePage />} />
          <Route path="/exam" element={<ExamPage />} />
          <Route path="/exam/run" element={<ExamRunPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
