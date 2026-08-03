import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n'
import { useSettings } from '@/store/settingsStore'
import { loadVoices, pickVoice, speak } from '@/lib/speech'
import { Card, PageHeader, SectionHeader } from '@/components/ui'
import { Icon } from '@/components/Icon'

export function SettingsPage() {
  const { t, b, locale } = useI18n()
  const settings = useSettings()
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    let alive = true
    loadVoices().then((list) => {
      if (alive) setVoices(list)
    })
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={t('nav.settings')} />

      <Card>
        <SectionHeader>{t('settings.language')}</SectionHeader>
        <div className="flex gap-2">
          {(['it', 'en'] as const).map((value) => (
            <button
              key={value}
              type="button"
              className="btn flex-1"
              style={
                settings.locale === value
                  ? { borderColor: 'var(--accent-line)', background: 'var(--accent-weak)' }
                  : undefined
              }
              onClick={() => settings.setLocale(value)}
            >
              {value === 'it' ? 'Italiano' : 'English'}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHeader>{t('settings.theme')}</SectionHeader>
        <div className="flex gap-2">
          {(['dark', 'light'] as const).map((value) => (
            <button
              key={value}
              type="button"
              className="btn flex-1"
              style={
                settings.theme === value
                  ? { borderColor: 'var(--accent-line)', background: 'var(--accent-weak)' }
                  : undefined
              }
              onClick={() => settings.setTheme(value)}
            >
              <Icon name={value === 'dark' ? 'moon' : 'sun'} size={16} />
              {value === 'dark' ? t('settings.themeDark') : t('settings.themeLight')}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHeader>{t('settings.voice')}</SectionHeader>
        {voices.length === 0 ? (
          <p className="muted text-sm">{t('settings.voiceNone')}</p>
        ) : (
          <>
            <select
              className="w-full"
              value={settings.voiceURI ?? ''}
              onChange={(e) => settings.setVoiceURI(e.target.value || null)}
            >
              <option value="">{b({ it: 'Automatica', en: 'Automatic' })}</option>
              {voices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>

            <label className="mt-4 block">
              <span className="muted text-sm">
                {t('settings.speechRate')}:{' '}
                <span className="mono">{settings.speechRate.toFixed(1)}×</span>
              </span>
              <input
                type="range"
                min="0.6"
                max="1.6"
                step="0.1"
                className="mt-1 w-full"
                value={settings.speechRate}
                onChange={(e) => settings.setSpeechRate(Number(e.target.value))}
              />
            </label>

            <button
              type="button"
              className="btn mt-3"
              onClick={() =>
                speak(locale === 'it' ? '27 per 29' : '27 times 29', {
                  locale,
                  rate: settings.speechRate,
                  voice: pickVoice(voices, locale, settings.voiceURI),
                })
              }
            >
              <Icon name="audio" size={16} />
              {t('settings.testVoice')}
            </button>
          </>
        )}
      </Card>

      <Card>
        <SectionHeader>{t('settings.data')}</SectionHeader>
        <p className="muted mb-3 text-sm">{t('progress.subtitle')}</p>
        <Link to="/progress" className="btn">
          {t('nav.progress')}
        </Link>
      </Card>

      <Card>
        <SectionHeader>{t('nav.about')}</SectionHeader>
        <p className="muted mb-3 text-sm leading-relaxed">{t('about.disclaimer.body')}</p>
        <Link to="/about" className="btn">
          {t('about.title')}
        </Link>
      </Card>
    </div>
  )
}
