import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Locale } from '@/i18n'

export type Theme = 'dark' | 'light'

type SettingsState = {
  locale: Locale
  theme: Theme
  sound: boolean
  /** voiceURI of the SpeechSynthesis voice used by the audio maths module. */
  voiceURI: string | null
  speechRate: number
  setLocale: (locale: Locale) => void
  setTheme: (theme: Theme) => void
  setSound: (sound: boolean) => void
  setVoiceURI: (voiceURI: string | null) => void
  setSpeechRate: (rate: number) => void
}

function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return 'it'
  return navigator.language.toLowerCase().startsWith('it') ? 'it' : 'en'
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      locale: detectLocale(),
      theme: 'dark',
      sound: true,
      voiceURI: null,
      speechRate: 1,
      setLocale: (locale) => set({ locale }),
      setTheme: (theme) => set({ theme }),
      setSound: (sound) => set({ sound }),
      setVoiceURI: (voiceURI) => set({ voiceURI }),
      setSpeechRate: (speechRate) => set({ speechRate }),
    }),
    { name: 'pathway.settings' },
  ),
)
