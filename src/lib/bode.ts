import type {
  RLCParams,
  BodePoint,
  CircuitType,
  ComponentFlags,
} from "./types";
import { calcSeries, calcParallel } from "./rlc-engine";

const F_MIN = 1;
const F_MAX = 5000;
const POINTS = 250;

export function calcBodeCurve(
  type: CircuitType,
  params: RLCParams,
  flags: ComponentFlags = { hasL: true, hasC: true },
): BodePoint[] {
  return Array.from({ length: POINTS }, (_, i) => {
    const f = F_MIN * Math.pow(F_MAX / F_MIN, i / (POINTS - 1));
    const res =
      type === "series"
        ? calcSeries({ ...params, f }, flags)
        : calcParallel({ ...params, f }, flags);
    return { f, Z: res.Z, phi: res.phi };
  });
}
