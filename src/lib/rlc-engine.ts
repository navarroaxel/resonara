import type {
  RLCParams,
  RLCResult,
  CircuitType,
  ComponentFlags,
} from "./types";

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
