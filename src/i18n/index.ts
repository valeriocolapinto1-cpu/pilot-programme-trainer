import { useCallback } from 'react'
import { dictionaries, type TranslationKey } from './dictionary'
import { useSettings } from '@/store/settingsStore'

export type Locale = 'it' | 'en'

/** A piece of content that exists in both languages. */
export type Bilingual = { it: string; en: string }

export type BilingualList = { it: string[]; en: string[] }

export function useLocale(): Locale {
  return useSettings((s) => s.locale)
}

/**
 * Translation helpers. `t` looks up UI strings, `b` picks the right side of a
 * bilingual content object — question banks store both languages inline.
 */
export function useI18n() {
  const locale = useLocale()

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      const raw = dictionaries[locale][key] ?? dictionaries.it[key] ?? key
      if (!vars) return raw
      return raw.replace(/\{(\w+)\}/g, (_, name: string) =>
        name in vars ? String(vars[name]) : `{${name}}`,
      )
    },
    [locale],
  )

  const b = useCallback(
    <T extends { it: unknown; en: unknown }>(value: T): T['it'] =>
      (value[locale] ?? value.it) as T['it'],
    [locale],
  )

  return { t, b, locale }
}

export type { TranslationKey }
