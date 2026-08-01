import { NavLink, Outlet } from 'react-router-dom'
import { useI18n, type TranslationKey } from '@/i18n'
import { Icon, type IconName } from '@/components/Icon'
import { useSettings } from '@/store/settingsStore'

const NAV: { to: string; key: TranslationKey; icon: IconName }[] = [
  { to: '/', key: 'nav.home', icon: 'home' },
  { to: '/modules', key: 'nav.modules', icon: 'modules' },
  { to: '/exam', key: 'nav.exam', icon: 'exam' },
  { to: '/progress', key: 'nav.progress', icon: 'progress' },
  { to: '/plan', key: 'nav.plan', icon: 'plan' },
]

export function Layout() {
  const { t } = useI18n()
  const locale = useSettings((s) => s.locale)
  const setLocale = useSettings((s) => s.setLocale)
  const theme = useSettings((s) => s.theme)
  const setTheme = useSettings((s) => s.setTheme)

  return (
    <div className="flex min-h-full flex-col">
      <header
        className="sticky top-0 z-20 border-b backdrop-blur-md"
        style={{
          borderColor: 'var(--line)',
          background: 'color-mix(in srgb, var(--bg) 82%, transparent)',
        }}
      >
        <div className="mx-auto flex w-full max-w-5xl items-center gap-6 px-5 py-3">
          <NavLink to="/" className="flex items-center gap-2.5" style={{ color: 'var(--text)' }}>
            <Icon name="mark" size={22} style={{ color: 'var(--accent)' }} />
            <span className="text-[0.9375rem] font-semibold tracking-tight">
              {t('app.title')}
            </span>
          </NavLink>

          <nav className="hidden items-center gap-0.5 md:flex">
            {NAV.map((entry) => (
              <NavLink
                key={entry.to}
                to={entry.to}
                end={entry.to === '/'}
                className="rounded-md px-2.5 py-1.5 text-[0.875rem] transition-colors"
                style={({ isActive }) => ({
                  color: isActive ? 'var(--text)' : 'var(--text-2)',
                  background: isActive ? 'var(--surface-2)' : 'transparent',
                  fontWeight: isActive ? 600 : 400,
                })}
              >
                {t(entry.key)}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              className="btn btn-quiet mono px-2 py-1 text-xs"
              onClick={() => setLocale(locale === 'it' ? 'en' : 'it')}
              aria-label={t('settings.language')}
              title={t('settings.language')}
            >
              {locale.toUpperCase()}
            </button>
            <button
              type="button"
              className="btn btn-quiet px-2 py-1.5"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={t('settings.theme')}
              title={t('settings.theme')}
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={17} />
            </button>
            <NavLink
              to="/settings"
              className="btn btn-quiet px-2 py-1.5"
              aria-label={t('nav.settings')}
              title={t('nav.settings')}
            >
              <Icon name="settings" size={17} />
            </NavLink>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 pb-24 md:pb-10">
        <Outlet />
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t md:hidden"
        style={{
          borderColor: 'var(--line)',
          background: 'color-mix(in srgb, var(--bg) 95%, transparent)',
          backdropFilter: 'blur(12px)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {NAV.map((entry) => (
          <NavLink
            key={entry.to}
            to={entry.to}
            end={entry.to === '/'}
            className="flex flex-col items-center gap-1 py-2.5 text-[0.625rem]"
            style={({ isActive }) => ({
              color: isActive ? 'var(--accent)' : 'var(--text-3)',
            })}
          >
            <Icon name={entry.icon} size={19} />
            {t(entry.key)}
          </NavLink>
        ))}
      </nav>

      <footer
        className="mt-auto hidden border-t md:block"
        style={{ borderColor: 'var(--line)' }}
      >
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <p className="muted-more text-xs">{t('app.subtitle')}</p>
          <NavLink
            to="/about"
            className="muted-more text-xs hover:underline"
            style={{ textUnderlineOffset: '3px' }}
          >
            {t('nav.about')}
          </NavLink>
        </div>
      </footer>
    </div>
  )
}
