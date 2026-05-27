import type { ThreePhaseParams, ThreePhaseResult, ConnectionType, ComponentFlags } from './types'

const TWO_PI = 2 * Math.PI
const SQRT3  = Math.sqrt(3)
const DEFAULT_FLAGS: ComponentFlags = { hasL: true, hasC: true }

function toH(mH: number) { return mH / 1000 }
function toF(uF: number) { return uF / 1e6  }

function resonantFreq(L_H: number, C_F: number): number {
  return 1 / (TWO_PI * Math.sqrt(L_H * C_F))
}

export function calcThreePhase(
  connection: ConnectionType,
  params: ThreePhaseParams,
  flags: ComponentFlags = DEFAULT_FLAGS,
): ThreePhaseResult {
  const { VL, R, f } = params
  const L_H = toH(params.L)
  const C_F = toF(params.C)
  const w   = TWO_PI * f

  const XL = flags.hasL ? w * L_H : 0
  const XC = flags.hasC ? 1 / (w * C_F) : 0
  const X  = XL - XC
  const Z  = Math.sqrt(R ** 2 + X ** 2)
  const phi = (Math.atan2(X, R) * 180) / Math.PI

  const V_ph = connection === 'star' ? VL / SQRT3 : VL
  const I_ph = V_ph / Z
  const I_L  = connection === 'star' ? I_ph : SQRT3 * I_ph

  const fr = (flags.hasL && flags.hasC) ? resonantFreq(L_H, C_F) : NaN
  const Q  = (flags.hasL && flags.hasC) ? (1 / R) * Math.sqrt(L_H / C_F) : NaN

  const phiRad = (phi * Math.PI) / 180
  const P  = 3 * V_ph * I_ph * Math.cos(phiRad)
  const Qr = 3 * V_ph * I_ph * Math.abs(Math.sin(phiRad))
  const S  = 3 * V_ph * I_ph
  const fp = Math.cos(phiRad)

  return { V_ph, V_L: VL, I_ph, I_L, Z, phi, XL, XC, fr, Q, P, Qr, S, fp }
}
