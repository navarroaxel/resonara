import type { RCDCParams, RCDCResult, RCDCPoint } from './types'

export function calcRCDC(params: RCDCParams): RCDCResult {
  const C   = params.C * 1e-6          // µF → F
  const tau = params.R * C
  const I0  = params.Vs / params.R
  return {
    tau,
    I0,
    Vc_tau:  params.Vs * (1 - Math.exp(-1)),  // ≈ 0.6321·Vs
    t5tau:   5 * tau,
    E_final: 0.5 * C * params.Vs ** 2,
  }
}

export function rcDCPoints(params: RCDCParams, nPoints = 300): RCDCPoint[] {
  const C    = params.C * 1e-6
  const tau  = params.R * C
  const tMax = 5 * tau
  return Array.from({ length: nPoints }, (_, k) => {
    const t  = (k / (nPoints - 1)) * tMax
    const vc = params.Vs * (1 - Math.exp(-t / tau))
    const vr = params.Vs - vc
    return { t, vc, vr, i: vr / params.R }
  })
}
