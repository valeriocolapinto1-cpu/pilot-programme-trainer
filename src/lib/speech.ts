import type { Locale } from '@/i18n'

/**
 * Thin wrapper around the Web Speech API used by the audio mental-arithmetic
 * module: in the real TestAir360 exam the questions are read out loud and there
 * is no calculator and no paper.
 */

export function speechAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function listVoices(): SpeechSynthesisVoice[] {
  if (!speechAvailable()) return []
  return window.speechSynthesis.getVoices()
}

/**
 * Voices load asynchronously in most browsers; resolve once they are there
 * (or after a short timeout, so callers never hang).
 */
export function loadVoices(timeoutMs = 2000): Promise<SpeechSynthesisVoice[]> {
  if (!speechAvailable()) return Promise.resolve([])
  const existing = listVoices()
  if (existing.length > 0) return Promise.resolve(existing)

  return new Promise((resolve) => {
    let settled = false
    const done = () => {
      if (settled) return
      settled = true
      window.speechSynthesis.removeEventListener('voiceschanged', done)
      resolve(listVoices())
    }
    window.speechSynthesis.addEventListener('voiceschanged', done)
    window.setTimeout(done, timeoutMs)
  })
}

export function pickVoice(
  voices: SpeechSynthesisVoice[],
  locale: Locale,
  preferredURI: string | null,
): SpeechSynthesisVoice | undefined {
  if (preferredURI) {
    const chosen = voices.find((v) => v.voiceURI === preferredURI)
    if (chosen) return chosen
  }
  const prefix = locale === 'it' ? 'it' : 'en'
  return voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ?? voices[0]
}

export type SpeakOptions = {
  locale: Locale
  rate?: number
  voice?: SpeechSynthesisVoice | undefined
  onEnd?: () => void
}

export function speak(text: string, options: SpeakOptions): () => void {
  if (!speechAvailable()) {
    options.onEnd?.()
    return () => {}
  }
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = options.locale === 'it' ? 'it-IT' : 'en-GB'
  utterance.rate = options.rate ?? 1
  if (options.voice) utterance.voice = options.voice
  if (options.onEnd) utterance.addEventListener('end', options.onEnd)
  window.speechSynthesis.speak(utterance)
  return () => window.speechSynthesis.cancel()
}

export function cancelSpeech(): void {
  if (speechAvailable()) window.speechSynthesis.cancel()
}

/**
 * Turns "27 × 29" into something a speech engine reads naturally in the target
 * language. Digits are spelled out with spaces so "129" is not read as a year.
 */
export function spellNumber(value: number, locale: Locale): string {
  if (!Number.isInteger(value)) return value.toString().replace('.', locale === 'it' ? ',' : '.')
  return value.toString()
}
