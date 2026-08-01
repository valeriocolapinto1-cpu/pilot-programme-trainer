import { useCallback, useEffect, useRef, useState } from 'react'

type Options = {
  running: boolean
  onExpire?: () => void
  /** UI refresh interval; 100 ms is smooth enough for a progress bar. */
  tickMs?: number
}

/**
 * Countdown that pauses and resumes without losing time, and restarts whenever
 * `durationMs` or `resetKey` changes. Used for per-item limits and for the
 * whole-module time slots inside the simulated exam.
 */
export function useCountdown(durationMs: number, resetKey: unknown, options: Options) {
  const { running, onExpire, tickMs = 100 } = options
  const [remaining, setRemaining] = useState(durationMs)

  /** Time left the next time the clock starts; survives pauses. */
  const bankedRef = useRef(durationMs)
  const expiredRef = useRef(false)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    bankedRef.current = durationMs
    expiredRef.current = false
    setRemaining(durationMs)
  }, [durationMs, resetKey])

  useEffect(() => {
    if (!running || durationMs <= 0 || expiredRef.current) return

    const startedAt = performance.now()
    const from = bankedRef.current

    const update = () => {
      const left = from - (performance.now() - startedAt)
      if (left <= 0) {
        bankedRef.current = 0
        setRemaining(0)
        if (!expiredRef.current) {
          expiredRef.current = true
          onExpireRef.current?.()
        }
        return false
      }
      setRemaining(left)
      return true
    }

    const id = window.setInterval(() => {
      if (!update()) window.clearInterval(id)
    }, tickMs)

    return () => {
      window.clearInterval(id)
      // Bank whatever is left so a resume continues from here.
      bankedRef.current = Math.max(0, from - (performance.now() - startedAt))
    }
  }, [running, durationMs, resetKey, tickMs])

  return {
    remaining,
    fraction: durationMs > 0 ? Math.max(0, Math.min(1, remaining / durationMs)) : 1,
    expired: durationMs > 0 && remaining <= 0,
  }
}

/** Elapsed-time stopwatch used to record how long an attempt actually took. */
export function useStopwatch(running: boolean) {
  const startRef = useRef<number | null>(null)
  const accumulatedRef = useRef(0)

  useEffect(() => {
    if (!running) return undefined
    startRef.current = performance.now()
    return () => {
      if (startRef.current != null) {
        accumulatedRef.current += performance.now() - startRef.current
        startRef.current = null
      }
    }
  }, [running])

  return useCallback(
    () =>
      accumulatedRef.current +
      (startRef.current != null ? performance.now() - startRef.current : 0),
    [],
  )
}
