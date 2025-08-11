export type PerfTier = 'low' | 'mid' | 'high'

export function detectPerfTier(): PerfTier {
  // Heuristics: device memory, cores, network, reduced motion
  // Defaults to 'mid'
  try {
    const nav = navigator as any
    const mem = typeof nav.deviceMemory === 'number' ? nav.deviceMemory : 4
    const cores = typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : 4
    const prefReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const connType = nav.connection?.effectiveType as string | undefined

    if (prefReduced) return 'low'
    if (mem <= 4 || cores <= 6) return 'low'
    if (connType && (connType.includes('2g') || connType.includes('slow-2g'))) return 'low'
    if (mem >= 8 && cores >= 8) return 'high'
    return 'mid'
  } catch {
    return 'mid'
  }
}

export function fxDisabled(): boolean {
  try {
    if (typeof window !== 'undefined') {
      const ls = localStorage.getItem('vnvnc_fx')
      if (ls && ls.toLowerCase() === 'off') return true
      const q = new URLSearchParams(window.location.search)
      if (q.get('fx') === 'off') return true
      const prefReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefReduced) return true
    }
  } catch {}
  return false
}

export function shouldUseHeavyFX(): boolean {
  const tier = detectPerfTier()
  return tier === 'high' && !fxDisabled()
}

export function shouldUseVideoBG(): boolean {
  const tier = detectPerfTier()
  return tier === 'high' && !fxDisabled()
}


