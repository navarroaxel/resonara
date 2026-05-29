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
    C_req: NaN, P_m: NaN, Q_m: NaN, S_m: NaN,
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

  // ── Always solve 2-mesh for C_req and reference power ──────────────────────
  const { I1: I1_2m, I2: I2_2m, C_req } = solve2Mesh(Vs, R1, R, Zm, omega)

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

    // Motor power
    const IZm_mag2 = IZm.re * IZm.re + IZm.im * IZm.im
    const P_m = IZm_mag2 * Zm_re
    const Q_m = IZm_mag2 * Zm_im
    const S_m = IZm_mag2 * Zm_mag

    // kvl1: Vs − Z11·I1 − Z12·I2 = Vs − (R1+R)·I1 + R·I2
    const kvl1 = csub(c(Vs, 0), cadd(cscale(R1 + R, I1), cscale(-R, I2)))
    // kvl2: R·I1 − (R+Zm)·I2
    const kvl2 = csub(cscale(R, I1), cmul(cadd(c(R, 0), Zm), I2))

    return {
      I1: cd(I1), I2: cd(I2), I3: ZERO_D,
      IR: cd(IR), IZm: cd(IZm), IZc: cd(IZc),
      VR1: cd(VR1), VR: cd(VR), VZm: cd(VZm), VZc: cd(VZc),
      Zm_re, Zm_im, Zm_mag, Zc_im, Zc_mag,
      P, Q, S, fp, C_req, P_m, Q_m, S_m,
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

  // Motor power
  const IZm_mag2 = IZm.re * IZm.re + IZm.im * IZm.im
  const P_m = IZm_mag2 * Zm_re
  const Q_m = IZm_mag2 * Zm_im
  const S_m = IZm_mag2 * Zm_mag

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
    P, Q, S, fp, C_req, P_m, Q_m, S_m,
    kvl1_re: kvl1.re, kvl1_im: kvl1.im,
    kvl2_re: kvl2.re, kvl2_im: kvl2.im,
    kvl3_re: kvl3.re, kvl3_im: kvl3.im,
    D_mag: cabs(D),
  }
}

// ── 2-mesh helper (also used for C_req) ──────────────────────────────────────
function solve2Mesh(Vs: number, R1: number, R: number, Zm: C, omega: number) {
  const Z11 = c(R1 + R, 0)
  const Z12 = c(-R, 0)
  const Z22 = cadd(c(R, 0), Zm)

  // D2 = Z11·Z22 − Z12²
  const D2 = csub(cmul(Z11, Z22), cmul(Z12, Z12))

  if (cabs(D2) < 1e-12) {
    return { I1: c(NaN, NaN), I2: c(NaN, NaN), C_req: NaN }
  }

  // b = [Vs, 0], so:
  // I1 = Vs·Z22 / D2
  // I2 = −Vs·Z12 / D2 = Vs·R / D2
  const I1 = cdiv(cscale(Vs, Z22), D2)
  const I2 = cdiv(c(Vs * R, 0), D2)

  // Power at source
  const S_c = cmul(c(Vs, 0), cconj(I1))
  const P   = S_c.re
  const Q   = S_c.im   // positive = inductive (lagging)

  // Required C for cos φ = 0.95
  const phi_target = Math.acos(0.95)
  const Q_target   = P * Math.tan(phi_target)
  const dQ         = Q - Q_target

  let C_req: number
  if (!Number.isFinite(P) || P <= 1e-12) {
    C_req = NaN
  } else if (dQ <= 0) {
    C_req = 0
  } else if (omega < 1e-12) {
    C_req = NaN
  } else {
    C_req = (dQ / (omega * Vs * Vs)) * 1e6  // convert F → µF
  }

  return { I1, I2, C_req }
}
