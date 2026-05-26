import type { CircuitType, RLCParams, ComponentFlags, HarmonicInput, HarmonicResult, PolyResult, PolyPreset, TimePoint } from './types'
import { calc } from './rlc-engine'

const DEFAULT_FLAGS: ComponentFlags = { hasL: true, hasC: true }

/**
 * Phasor-combine any rows that share the same harmonic order n.
 * Two rows at the same frequency are not orthogonal; treating them as
 * independent would produce wrong RMS/THD/power totals.
 */
function combineByN(harmonics: HarmonicInput[]): HarmonicInput[] {
  const groups = new Map<number, { x: number; y: number }>()
  for (const { n, An, phin } of harmonics) {
    const rad  = phin * Math.PI / 180
    const prev = groups.get(n) ?? { x: 0, y: 0 }
    groups.set(n, { x: prev.x + An * Math.cos(rad), y: prev.y + An * Math.sin(rad) })
  }
  return Array.from(groups.entries()).map(([n, { x, y }]) => ({
    n,
    An:   Math.sqrt(x * x + y * y),
    phin: Math.atan2(y, x) * 180 / Math.PI,
  }))
}

export const PRESETS: Record<Exclude<PolyPreset, 'custom'>, HarmonicInput[]> = {
  square:   [1, 3, 5, 7, 9].map(n => ({ n, An: 1 / n, phin: 0 })),
  triangle: [1, 3, 5, 7].map((n, i) => ({ n, An: 1 / (n * n), phin: i % 2 === 0 ? 0 : 180 })),
  sawtooth: [1, 2, 3, 4, 5, 6].map(n => ({ n, An: 1 / n, phin: n % 2 === 0 ? 180 : 0 })),
}

export function calcPolyResult(
  type: CircuitType,
  params: RLCParams,
  harmonics: HarmonicInput[],
  flags: ComponentFlags = DEFAULT_FLAGS,
): PolyResult {
  const harmonicResults: HarmonicResult[] = combineByN(harmonics).map(({ n, An, phin }) => {
    const fn = n * params.f
    const paramsN: RLCParams = { ...params, f: fn, Vs: An * params.Vs }
    const res = calc(type, paramsN, flags)
    return {
      n,
      fn,
      Vn: An * params.Vs * Math.SQRT2,
      Zn: res.Z,
      phin_source: phin,
      phin_circuit: res.phi,
      In: res.I * Math.SQRT2,
    }
  })

  const fundamental = harmonicResults.find(h => h.n === 1)
  const I1_rms = fundamental ? fundamental.In / Math.SQRT2 : 0
  const higherSumSq = harmonicResults
    .filter(h => h.n !== 1)
    .reduce((acc, h) => acc + (h.In / Math.SQRT2) ** 2, 0)

  const I_rms = Math.sqrt(harmonicResults.reduce((acc, h) => acc + h.In ** 2 / 2, 0))
  const V_rms = Math.sqrt(harmonicResults.reduce((acc, h) => acc + h.Vn ** 2 / 2, 0))
  const THD_I = I1_rms > 0 ? (Math.sqrt(higherSumSq) / I1_rms) * 100 : 0
  const P_total = harmonicResults.reduce(
    (acc, h) => acc + (h.Vn * h.In / 2) * Math.cos(h.phin_circuit * Math.PI / 180),
    0,
  )
  const S_total  = V_rms * I_rms
  // Qp_total derived from S and P so it reflects net reactive power, not the
  // abs-sum of per-harmonic Q (which would ignore inductive/capacitive cancellation).
  const Qp_total = Math.sqrt(Math.max(0, S_total ** 2 - P_total ** 2))

  return { harmonics: harmonicResults, I_rms, V_rms, THD_I, P_total, Qp_total, S_total }
}

export function calcPolyTimeDomain(
  type: CircuitType,
  params: RLCParams,
  harmonics: HarmonicInput[],
  flags: ComponentFlags = DEFAULT_FLAGS,
): TimePoint[] {
  const SAMPLES = 200
  const CYCLES  = 2
  const T     = 1 / params.f
  const omega = 2 * Math.PI * params.f

  const terms = combineByN(harmonics).map(({ n, An, phin }) => {
    const paramsN: RLCParams = { ...params, f: n * params.f, Vs: An * params.Vs }
    const res = calc(type, paramsN, flags)
    return {
      n,
      Vpeak:        An * params.Vs * Math.SQRT2,
      Ipeak:        res.I * Math.SQRT2,
      phiSourceRad: phin * Math.PI / 180,
      phiCircRad:   res.phi * Math.PI / 180,
    }
  })

  return Array.from({ length: SAMPLES }, (_, idx) => {
    const t = (CYCLES * T * idx) / SAMPLES
    let v = 0, i = 0
    for (const r of terms) {
      const nwt = r.n * omega * t
      v += r.Vpeak * Math.sin(nwt + r.phiSourceRad)
      i += r.Ipeak * Math.sin(nwt + r.phiSourceRad - r.phiCircRad)
    }
    return { t: t * 1000, v, i }
  })
}
