import type {
  RLCParams,
  TimePoint,
  CircuitType,
  ComponentFlags,
} from "./types";
import { calc } from "./rlc-engine";

const CYCLES = 2;
const SAMPLES = 200;

export function calcTimeDomain(
  type: CircuitType,
  params: RLCParams,
  flags: ComponentFlags = { hasL: true, hasC: true },
): TimePoint[] {
  const { Vs, f } = params;
  const res = calc(type, params, flags);
  const T = 1 / f;
  const phi = (res.phi * Math.PI) / 180;

  return Array.from({ length: SAMPLES }, (_, idx) => {
    const t = (CYCLES * T * idx) / SAMPLES;
    const v = Vs * Math.SQRT2 * Math.sin(2 * Math.PI * f * t);
    const ii = res.I * Math.SQRT2 * Math.sin(2 * Math.PI * f * t - phi);
    return { t: t * 1000, v, i: ii };
  });
}
