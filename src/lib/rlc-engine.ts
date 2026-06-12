import type {
  RLCParams,
  RLCResult,
  CircuitType,
  ComponentFlags,
} from "./types";

export interface LocusPoint {
  param: number; // swept parameter value: R (Ω) or C (µF)
  I_re: number; // Re(I), with Vs as angle reference
  I_im: number; // Im(I)
}

const TWO_PI = 2 * Math.PI;
const DEFAULT_FLAGS: ComponentFlags = { hasL: true, hasC: true };

function toH(mH: number) {
  return mH / 1000;
}
function toF(uF: number) {
  return uF / 1e6;
}

function resonantFreq(L_H: number, C_F: number): number {
  return 1 / (TWO_PI * Math.sqrt(L_H * C_F));
}

/** Series RLC: Z = R + j(XL - XC) */
export function calcSeries(
  params: RLCParams,
  flags: ComponentFlags = DEFAULT_FLAGS,
): RLCResult {
  const { Vs, R, f } = params;
  const L = toH(params.L);
  const C = toF(params.C);
  const w = TWO_PI * f;

  const XL = flags.hasL ? w * L : 0;
  const XC = flags.hasC ? 1 / (w * C) : 0;
  const X = XL - XC;
  const Z = Math.sqrt(R ** 2 + X ** 2);
  const phi = (Math.atan2(X, R) * 180) / Math.PI;
  const I = Vs / Z;
  const fr = flags.hasL && flags.hasC ? resonantFreq(L, C) : NaN;
  const Q = flags.hasL && flags.hasC ? (1 / R) * Math.sqrt(L / C) : NaN;

  const phiRad = (phi * Math.PI) / 180;
  const P = Vs * I * Math.cos(phiRad);
  const Qp = Vs * I * Math.abs(Math.sin(phiRad));
  const S = Vs * I;
  const fp = Math.cos(phiRad);

  return { Z, phi, I, XL, XC, fr, Q, P, Qp, S, fp };
}

/** Parallel RLC: Y = G + j(BC − BL),  G = 1/R, BL = 1/XL, BC = ωC */
export function calcParallel(
  params: RLCParams,
  flags: ComponentFlags = DEFAULT_FLAGS,
): RLCResult {
  const { Vs, R, f } = params;
  const L = toH(params.L);
  const C = toF(params.C);
  const w = TWO_PI * f;

  const XL = flags.hasL ? w * L : 0;
  const XC = flags.hasC ? 1 / (w * C) : 0;
  const G = 1 / R;
  const BL = flags.hasL ? 1 / XL : 0;
  const BC = flags.hasC ? 1 / XC : 0;
  const B = BC - BL;
  const Y = Math.sqrt(G ** 2 + B ** 2);
  const Z = 1 / Y;
  const phi = -(Math.atan2(B, G) * 180) / Math.PI;
  const I = Vs * Y;
  const fr = flags.hasL && flags.hasC ? resonantFreq(L, C) : NaN;
  const Q = flags.hasL && flags.hasC ? R * Math.sqrt(C / L) : NaN;

  const phiRad = (phi * Math.PI) / 180;
  const P = Vs * I * Math.cos(phiRad);
  const Qp = Vs * I * Math.abs(Math.sin(phiRad));
  const S = Vs * I;
  const fp = Math.cos(phiRad);

  return { Z, phi, I, XL, XC, fr, Q, P, Qp, S, fp };
}

export function calc(
  type: CircuitType,
  params: RLCParams,
  flags: ComponentFlags = DEFAULT_FLAGS,
): RLCResult {
  return type === "series"
    ? calcSeries(params, flags)
    : calcParallel(params, flags);
}

/** Sweep R logarithmically; returns complex current I at each R value. */
export function calcRLocus(
  params: RLCParams,
  circuitType: CircuitType,
  flags: ComponentFlags = DEFAULT_FLAGS,
  nPoints = 200,
): LocusPoint[] {
  const { Vs, f } = params;
  const w = TWO_PI * f;
  const L = toH(params.L);
  const C = toF(params.C);
  const XL = flags.hasL ? w * L : 0;
  const XC = flags.hasC ? 1 / (w * C) : 0;

  const R_min = 0.01;
  const R_max = Math.max(1000, params.R * 20);
  const logMin = Math.log10(R_min);
  const logMax = Math.log10(R_max);

  const points: LocusPoint[] = [];
  for (let i = 0; i < nPoints; i++) {
    const R = 10 ** (logMin + ((logMax - logMin) * i) / (nPoints - 1));
    let I_re: number, I_im: number;
    if (circuitType === "series") {
      const X = XL - XC;
      const denom = R * R + X * X;
      I_re = (Vs * R) / denom;
      I_im = (-Vs * X) / denom;
    } else {
      const G = 1 / R;
      const BL = flags.hasL && XL > 0 ? 1 / XL : 0;
      const BC = flags.hasC && XC > 0 ? 1 / XC : 0;
      const B = BC - BL;
      I_re = Vs * G;
      I_im = Vs * B;
    }
    points.push({ param: R, I_re, I_im });
  }
  return points;
}

/** Sweep C linearly; returns complex current I at each C value (µF). */
export function calcCLocus(
  params: RLCParams,
  circuitType: CircuitType,
  flags: ComponentFlags = DEFAULT_FLAGS,
  nPoints = 200,
): LocusPoint[] {
  if (!flags.hasC) return [];

  const { Vs, R, f } = params;
  const w = TWO_PI * f;
  const L = toH(params.L);
  const XL = flags.hasL ? w * L : 0;

  const C_min = 0.01;
  const C_max = Math.max(5000, params.C * 20);

  const points: LocusPoint[] = [];
  for (let i = 0; i < nPoints; i++) {
    const C_uF = C_min + ((C_max - C_min) * i) / (nPoints - 1);
    const C_F = toF(C_uF);
    const XC = 1 / (w * C_F);
    let I_re: number, I_im: number;
    if (circuitType === "series") {
      const X = XL - XC;
      const denom = R * R + X * X;
      I_re = (Vs * R) / denom;
      I_im = (-Vs * X) / denom;
    } else {
      const G = 1 / R;
      const BL = flags.hasL && XL > 0 ? 1 / XL : 0;
      const BC = 1 / XC;
      const B = BC - BL;
      I_re = Vs * G;
      I_im = Vs * B;
    }
    points.push({ param: C_uF, I_re, I_im });
  }
  return points;
}
