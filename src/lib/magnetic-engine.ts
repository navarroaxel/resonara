import type { MagneticParams, MagneticResult } from './types'

const TWO_PI = 2 * Math.PI

function toH(mH: number) { return mH / 1000 }

export function calcMagnetic(params: MagneticParams): MagneticResult {
  const { Vs, f, R1, R2, k } = params
  const L1_H = toH(params.L1)
  const L2_H = toH(params.L2)
  const w    = TWO_PI * f

  const M_H = k * Math.sqrt(L1_H * L2_H)
  const M   = M_H * 1000  // display as mH

  const XL1 = w * L1_H
  const XL2 = w * L2_H
  const XM  = w * M_H

  // Secondary self-impedance Z2 = R2 + j*XL2
  const Z2_re  = R2
  const Z2_im  = XL2
  const Z2_sq  = Z2_re ** 2 + Z2_im ** 2
  const Z2_mag = Math.sqrt(Z2_sq)

  // Reflected impedance: Zrefl = XM² * conj(Z2) / |Z2|²
  // Zrefl_re = XM²·R2 / |Z2|²    (always ≥ 0 — adds effective resistance)
  // Zrefl_im = −XM²·XL2 / |Z2|²  (negative = capacitive effect from secondary)
  let Zrefl_re = 0
  let Zrefl_im = 0
  if (Z2_sq > 1e-24) {
    Zrefl_re =  (XM ** 2 * Z2_re) / Z2_sq
    Zrefl_im = -(XM ** 2 * Z2_im) / Z2_sq
  }

  const Zin_re = R1 + Zrefl_re
  const Zin_im = XL1 + Zrefl_im
  const Zin    = Math.sqrt(Zin_re ** 2 + Zin_im ** 2)

  // phi1: phase angle of Zin — positive means I1 lags Vs
  const phi1 = (Math.atan2(Zin_im, Zin_re) * 180) / Math.PI
  const I1   = Zin > 1e-12 ? Vs / Zin : 0

  // I2 = XM·I1 / |Z2|  (magnitude only)
  const I2 = Z2_mag > 1e-12 ? XM * I1 / Z2_mag : 0

  // Phase of I2 relative to Vs:
  // I2 = jωM·I1 / Z2 → arg(I2) = 90° + arg(I1) − arg(Z2)
  //                              = 90° − phi1 − atan2(XL2, R2)
  const phi2 = 90 - phi1 - (Math.atan2(Z2_im, Z2_re) * 180) / Math.PI

  const P1  = I1 ** 2 * Zin_re
  const P2  = I2 ** 2 * R2
  const Q1  = I1 ** 2 * Zin_im
  const S1  = Vs * I1
  const eta = P1 > 1e-12 ? P2 / P1 : (P2 === 0 ? 0 : NaN)

  return { M, XL1, XL2, XM, Zin_re, Zin_im, Zin, Z2: Z2_mag, phi1, I1, I2, phi2, P1, P2, Q1, S1, eta }
}

export interface MagneticFreqPoint {
  f:   number
  I1:  number
  I2:  number
  P1:  number
  P2:  number
  eta: number
}

export function calcMagneticSweep(
  params: MagneticParams,
  fMin = Math.max(1, params.f / 50),
  fMax = Math.min(100000, params.f * 50),
  points = 200,
): MagneticFreqPoint[] {
  return Array.from({ length: points }, (_, i) => {
    const freq = fMin * Math.pow(fMax / fMin, i / (points - 1))
    const r = calcMagnetic({ ...params, f: freq })
    return { f: freq, I1: r.I1, I2: r.I2, P1: r.P1, P2: r.P2, eta: r.eta }
  })
}
