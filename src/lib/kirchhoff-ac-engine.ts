import type { KirchhoffACParams, KirchhoffACFlags, KirchhoffACResult, ComplexDisplay } from './types'

// ── Inline complex arithmetic ─────────────────────────────────────────────────

type C = { re: number; im: number }

const c    = (re: number, im: number): C => ({ re, im })
const cadd = (a: C, b: C): C => c(a.re + b.re, a.im + b.im)
const csub = (a: C, b: C): C => c(a.re - b.re, a.im - b.im)
const cmul = (a: C, b: C): C => c(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re)
const cconj = (a: C): C => c(a.re, -a.im)
const cabs  = (a: C): number => Math.hypot(a.re, a.im)
const carg  = (a: C): number => Math.atan2(a.im, a.re) * 180 / Math.PI
const cdiv  = (a: C, b: C): C => {
  const d = b.re * b.re + b.im * b.im
  return c((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d)
}
const cscale = (k: number, a: C): C => c(k * a.re, k * a.im)

function cd(z: C): ComplexDisplay {
  return { mag: cabs(z), ang: carg(z), re: z.re, im: z.im }
}

const ZERO = c(0, 0)
const ZERO_D: ComplexDisplay = { mag: 0, ang: 0, re: 0, im: 0 }
const NAN_D: ComplexDisplay  = { mag: NaN, ang: NaN, re: NaN, im: NaN }

function nanResult(): KirchhoffACResult {
  return {
    I1: NAN_D, I2: NAN_D, I3: NAN_D,
    IR: NAN_D, IZm: NAN_D, IZc: NAN_D,
    VR1: NAN_D, VR: NAN_D, VZm: NAN_D, VZc: NAN_D,
    Zm_re: NaN, Zm_im: NaN, Zm_mag: NaN,
    Zc_im: NaN, Zc_mag: NaN,
    P: NaN, Q: NaN, S: NaN, fp: NaN,
    C_req: NaN, fp_0: NaN, P_m: NaN, Q_m: NaN, S_m: NaN, eta_m: NaN, P_R: NaN, P_R1: NaN,
    kvl1_re: NaN, kvl1_im: NaN,
    kvl2_re: NaN, kvl2_im: NaN,
    kvl3_re: NaN, kvl3_im: NaN,
    D_mag: 0,
  }
}

// ── Circuit topology ──────────────────────────────────────────────────────────
//
//   +---Vs---R1---A-----------B-----------C---+
//   |              |           |           |  |
//   |              R          Zm           Zc |
//   |           (load)     (Rm+jXLm)   (PFC) |
//   |              |           |           |  |
//   +--------------+-----------+-----------+--+
//                          GND
//
// Mesh 1 (left window):   Vs, R1, R  (shared with M2)
// Mesh 2 (centre window): R (shared), Zm  (shared with M3)
// Mesh 3 (right window):  Zm (shared), Zc
//
// KVL matrix (complex):
//   [ Z11   Z12    0  ] [I1]   [Vs]
//   [ Z12   Z22   Z23 ] [I2] = [0 ]
//   [  0    Z23   Z33 ] [I3]   [0 ]
//
//   Z11 = R1 + R          Z12 = −R
//   Z22 = R + Zm          Z23 = −Zm
//   Z33 = Zm + Zc

export function calcKirchhoffAC(
  params: KirchhoffACParams,
  flags: KirchhoffACFlags = { mesh3: false },
): KirchhoffACResult {
  const { Vs, f, R1, R, Rm, Lm, C } = params
  const omega = 2 * Math.PI * f

  const Zm: C = c(Rm, omega * Lm * 1e-3)              // Rm + jωLm (mH→H)
  const Zc: C = omega > 1e-12 ? c(0, -1 / (omega * C * 1e-6)) : c(0, -Infinity)  // −j/(ωC)

  const Zm_re  = Zm.re
  const Zm_im  = Zm.im
  const Zm_mag = cabs(Zm)
  const Zc_im  = Zc.im
  const Zc_mag = cabs(Zc)

  // ── Always solve 2-mesh for reference currents; C_req via 3-mesh bisection ──
  const { I1: I1_2m, I2: I2_2m } = solve2Mesh(Vs, R1, R, Zm)
  const C_req = findCReq(Vs, omega, R1, R, Zm)
  const S0_2m  = cmul(c(Vs, 0), cconj(I1_2m))
  const S0_mag = Math.hypot(S0_2m.re, S0_2m.im)
  const fp_0   = S0_mag > 1e-12 ? S0_2m.re / S0_mag : 0

  // ── Solve 2 or 3-mesh system ───────────────────────────────────────────────
  if (!flags.mesh3) {
    if (!Number.isFinite(I1_2m.re)) return nanResult()

    const I1 = I1_2m
    const I2 = I2_2m
    const I3 = ZERO

    const IR  = csub(I1, I2)
    const IZm = csub(I2, I3)
    const IZc = I3

    const VR1 = cscale(R1, I1)
    const VR  = cscale(R, IR)
    const VZm = cmul(IZm, Zm)
    const VZc = ZERO

    // Power from source
    const S_c = cmul(c(Vs, 0), cconj(I1))
    const P   = S_c.re
    const Q   = S_c.im
    const S   = Math.hypot(P, Q)
    const fp  = S > 1e-12 ? P / S : 0

    // Motor power and efficiency
    const IZm_mag2 = IZm.re * IZm.re + IZm.im * IZm.im
    const P_m  = IZm_mag2 * Zm_re
    const Q_m  = IZm_mag2 * Zm_im
    const S_m  = IZm_mag2 * Zm_mag
    const eta_m = S_m > 1e-12 ? P_m / S_m : 0
    const P_R  = (IR.re * IR.re + IR.im * IR.im) * R
    const P_R1 = (I1.re * I1.re + I1.im * I1.im) * R1

    // kvl1: Vs − Z11·I1 − Z12·I2 = Vs − (R1+R)·I1 + R·I2
    const kvl1 = csub(c(Vs, 0), cadd(cscale(R1 + R, I1), cscale(-R, I2)))
    // kvl2: R·I1 − (R+Zm)·I2
    const kvl2 = csub(cscale(R, I1), cmul(cadd(c(R, 0), Zm), I2))

    return {
      I1: cd(I1), I2: cd(I2), I3: ZERO_D,
      IR: cd(IR), IZm: cd(IZm), IZc: cd(IZc),
      VR1: cd(VR1), VR: cd(VR), VZm: cd(VZm), VZc: cd(VZc),
      Zm_re, Zm_im, Zm_mag, Zc_im, Zc_mag,
      P, Q, S, fp, C_req, fp_0, P_m, Q_m, S_m, eta_m, P_R, P_R1,
      kvl1_re: kvl1.re, kvl1_im: kvl1.im,
      kvl2_re: kvl2.re, kvl2_im: kvl2.im,
      kvl3_re: 0,        kvl3_im: 0,
      D_mag: NaN,
    }
  }

  // ── 3-mesh Cramer's rule ───────────────────────────────────────────────────
  const Z11 = c(R1 + R, 0)
  const Z12 = c(-R, 0)
  const Z22 = cadd(c(R, 0), Zm)
  const Z23 = cscale(-1, Zm)
  const Z33 = cadd(Zm, Zc)

  // det = Z11·(Z22·Z33 − Z23²) − Z12²·Z33
  const Z22Z33 = cmul(Z22, Z33)
  const Z23sq  = cmul(Z23, Z23)
  const M22    = csub(Z22Z33, Z23sq)
  const D      = csub(cmul(Z11, M22), cmul(cmul(Z12, Z12), Z33))

  if (cabs(D) < 1e-12) return { ...nanResult(), D_mag: cabs(D) }

  // D1 = Vs·(Z22·Z33 − Z23²)
  const D1 = cscale(Vs, M22)
  // D2 = −Vs·Z12·Z33
  const D2 = cscale(-Vs, cmul(Z12, Z33))
  // D3 = Vs·Z12·Z23
  const D3 = cscale(Vs, cmul(Z12, Z23))

  const I1 = cdiv(D1, D)
  const I2 = cdiv(D2, D)
  const I3 = cdiv(D3, D)

  const IR  = csub(I1, I2)
  const IZm = csub(I2, I3)
  const IZc = I3

  const VR1 = cscale(R1, I1)
  const VR  = cscale(R, IR)
  const VZm = cmul(IZm, Zm)
  const VZc = cmul(IZc, Zc)

  // Power from source
  const S_c = cmul(c(Vs, 0), cconj(I1))
  const P   = S_c.re
  const Q   = S_c.im
  const S   = Math.hypot(P, Q)
  const fp  = S > 1e-12 ? P / S : 0

  // Motor power and efficiency
  const IZm_mag2 = IZm.re * IZm.re + IZm.im * IZm.im
  const P_m  = IZm_mag2 * Zm_re
  const Q_m  = IZm_mag2 * Zm_im
  const S_m  = IZm_mag2 * Zm_mag
  const eta_m = S_m > 1e-12 ? P_m / S_m : 0
  const P_R  = (IR.re * IR.re + IR.im * IR.im) * R
  const P_R1 = (I1.re * I1.re + I1.im * I1.im) * R1

  // KVL residuals
  // Loop 1: Vs − Z11·I1 − Z12·I2 = 0
  const kvl1 = csub(c(Vs, 0), cadd(cmul(Z11, I1), cmul(Z12, I2)))
  // Loop 2: −Z12·I1 − Z22·I2 − Z23·I3 = 0
  const kvl2 = csub(ZERO, cadd(cmul(Z12, I1), cadd(cmul(Z22, I2), cmul(Z23, I3))))
  // Loop 3: −Z23·I2 − Z33·I3 = 0
  const kvl3 = csub(ZERO, cadd(cmul(Z23, I2), cmul(Z33, I3)))

  return {
    I1: cd(I1), I2: cd(I2), I3: cd(I3),
    IR: cd(IR), IZm: cd(IZm), IZc: cd(IZc),
    VR1: cd(VR1), VR: cd(VR), VZm: cd(VZm), VZc: cd(VZc),
    Zm_re, Zm_im, Zm_mag, Zc_im, Zc_mag,
    P, Q, S, fp, C_req, fp_0, P_m, Q_m, S_m, eta_m, P_R, P_R1,
    kvl1_re: kvl1.re, kvl1_im: kvl1.im,
    kvl2_re: kvl2.re, kvl2_im: kvl2.im,
    kvl3_re: kvl3.re, kvl3_im: kvl3.im,
    D_mag: cabs(D),
  }
}

// ── 2-mesh helper ────────────────────────────────────────────────────────────
function solve2Mesh(Vs: number, R1: number, R: number, Zm: C) {
  const Z11 = c(R1 + R, 0)
  const Z12 = c(-R, 0)
  const Z22 = cadd(c(R, 0), Zm)

  const D2 = csub(cmul(Z11, Z22), cmul(Z12, Z12))
  if (cabs(D2) < 1e-12) return { I1: c(NaN, NaN), I2: c(NaN, NaN) }

  const I1 = cdiv(cscale(Vs, Z22), D2)
  const I2 = cdiv(c(Vs * R, 0), D2)
  return { I1, I2 }
}

// ── Numerical C_req: bisect on full 3-mesh fp = 0.95 ─────────────────────────
// The fp(C) curve rises from fp_2mesh → 1.0 at C_unity, then falls back.
// The target crossing (fp = 0.95, lagging) is always in (0, C_unity), so we
// use C_unity as the exact upper bound to avoid hitting the recovery crossing.
function findCReq(Vs: number, omega: number, R1: number, R: number, Zm: C): number {
  if (omega < 1e-12) return NaN

  function fp3At(C_uF: number): number {
    const Zc  = c(0, -1 / (omega * C_uF * 1e-6))
    const Z11 = c(R1 + R, 0), Z12 = c(-R, 0)
    const Z22 = cadd(c(R, 0), Zm)
    const Z23 = cscale(-1, Zm)
    const Z33 = cadd(Zm, Zc)
    const M22 = csub(cmul(Z22, Z33), cmul(Z23, Z23))
    const D   = csub(cmul(Z11, M22), cmul(cmul(Z12, Z12), Z33))
    if (cabs(D) < 1e-12) return 0
    const I1  = cdiv(cscale(Vs, M22), D)
    const S_c = cmul(c(Vs, 0), cconj(I1))
    const P = S_c.re, S = Math.hypot(P, S_c.im)
    return S > 1e-12 ? P / S : 0
  }

  // If 2-mesh already meets target, no cap needed
  const { I1: I1_2m } = solve2Mesh(Vs, R1, R, Zm)
  if (!Number.isFinite(I1_2m.re)) return NaN
  const S0 = cmul(c(Vs, 0), cconj(I1_2m))
  const fp0_mag = Math.hypot(S0.re, S0.im)
  if (fp0_mag > 1e-12 && S0.re / fp0_mag >= 0.95) return 0

  // C_unity = Im(Y_Zm)/ω = XLm/(|Zm|²·ω) — exact unity-pf capacitance.
  // fp is monotone increasing in [0, C_unity], so the first fp=0.95 crossing
  // is always in that interval. Searching beyond it risks the recovery branch.
  const Zm_mag2 = Zm.re * Zm.re + Zm.im * Zm.im
  if (Zm_mag2 < 1e-12 || Zm.im < 1e-9) return NaN
  const C_unity_uF = (Zm.im / Zm_mag2 / omega) * 1e6
  if (fp3At(C_unity_uF) < 0.95) return NaN  // unreachable with this topology

  // Bisect in [lo, C_unity_uF]
  let lo = 1e-3, hi = C_unity_uF
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (fp3At(mid) < 0.95) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}
