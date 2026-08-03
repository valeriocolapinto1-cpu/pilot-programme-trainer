import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '@/shell/Layout'
import { HomePage } from '@/screens/HomePage'
import { ModulesPage } from '@/screens/ModulesPage'
import { ModulePage } from '@/screens/ModulePage'
import { ExamPage } from '@/screens/ExamPage'
import { ExamRunPage } from '@/screens/ExamRunPage'
import { ProgressPage } from '@/screens/ProgressPage'
import { PlanPage } from '@/screens/PlanPage'
import { AboutPage } from '@/screens/AboutPage'
import { SettingsPage } from '@/screens/SettingsPage'
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
