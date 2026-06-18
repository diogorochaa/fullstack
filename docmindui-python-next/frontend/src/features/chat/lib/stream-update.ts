/** Agrupa atualizações de streaming em um frame para evitar re-renders excessivos. */
export function createStreamUpdateScheduler<T>(flush: (value: T) => void) {
  let pending: T | undefined
  let rafId: number | null = null

  const schedule = (value: T) => {
    pending = value
    if (rafId !== null) return
    rafId = requestAnimationFrame(() => {
      rafId = null
      if (pending === undefined) return
      const next = pending
      pending = undefined
      flush(next)
    })
  }

  const flushNow = (value: T) => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    pending = undefined
    flush(value)
  }

  return { schedule, flushNow }
}
