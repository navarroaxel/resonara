import { calcSeries, calcParallel } from "../rlc-engine";
import { calcPolyResult, calcPolyTimeDomain } from "../poly-engine";

const base = { Vs: 10, R: 100, L: 50, C: 100, f: 50 };
const FR = 1 / (2 * Math.PI * Math.sqrt(0.05 * 100e-6)); // ≈ 71.18 Hz

describe("calcSeries", () => {
  it("returns correct resonant frequency", () => {
    expect(calcSeries(base).fr).toBeCloseTo(71.18, 1);
  });

  it("Z equals R at resonance", () => {
    expect(calcSeries({ ...base, f: FR }).Z).toBeCloseTo(base.R, 1);
  });

  it("phase angle is 0 at resonance", () => {
    expect(Math.abs(calcSeries({ ...base, f: FR }).phi)).toBeLessThan(0.01);
  });

  it("power factor is between 0 and 1", () => {
    const { fp } = calcSeries(base);
    expect(fp).toBeGreaterThanOrEqual(0);
    expect(fp).toBeLessThanOrEqual(1);
  });
});

describe("calcParallel", () => {
  it("returns the same fr as series", () => {
    expect(calcParallel(base).fr).toBeCloseTo(calcSeries(base).fr, 3);
  });

  it("Z is maximum at resonance", () => {
    const below = calcParallel({ ...base, f: FR * 0.5 });
    const atRes = calcParallel({ ...base, f: FR });
    const above = calcParallel({ ...base, f: FR * 2 });
    expect(atRes.Z).toBeGreaterThan(below.Z);
    expect(atRes.Z).toBeGreaterThan(above.Z);
  });
});

describe("calcPolyResult", () => {
  it("single fundamental harmonic I_rms matches single-freq result", () => {
    const single = calcSeries(base);
    const poly = calcPolyResult("series", base, [{ n: 1, An: 1, phin: 0 }]);
    expect(poly.I_rms).toBeCloseTo(single.I, 5);
  });

  it("duplicate n rows are phasor-combined, not summed independently", () => {
    // Two rows at n=1, same phase — equivalent to one row with An=2
    const combined = calcPolyResult("series", base, [
      { n: 1, An: 1, phin: 0 },
      { n: 1, An: 1, phin: 0 },
    ]);
    const single = calcPolyResult("series", base, [{ n: 1, An: 2, phin: 0 }]);
    expect(combined.I_rms).toBeCloseTo(single.I_rms, 5);
    expect(combined.THD_I).toBeCloseTo(0, 5);
  });

  it("duplicate n rows with opposite phase cancel out", () => {
    const result = calcPolyResult("series", base, [
      { n: 1, An: 1, phin: 0 },
      { n: 1, An: 1, phin: 180 },
    ]);
    expect(result.I_rms).toBeCloseTo(0, 5);
  });

  it("THD_I is 0 when only the fundamental is present", () => {
    const poly = calcPolyResult("series", base, [{ n: 1, An: 1, phin: 0 }]);
    expect(poly.THD_I).toBeCloseTo(0, 10);
  });

  it("calcPolyTimeDomain superposition matches manual sum at t=0", () => {
    const harmonics = [
      { n: 1, An: 1, phin: 0 },
      { n: 3, An: 1 / 3, phin: 0 },
    ];
    const data = calcPolyTimeDomain("series", base, harmonics);
    const r1 = calcSeries({ ...base, f: base.f * 1, Vs: 1 * base.Vs });
    const r3 = calcSeries({ ...base, f: base.f * 3, Vs: (1 / 3) * base.Vs });
    const V1 = 1 * base.Vs * Math.SQRT2;
    const V3 = (1 / 3) * base.Vs * Math.SQRT2;
    const expected_v = V1 * Math.sin(0) + V3 * Math.sin(0); // = 0 at t=0 with phin=0
    const I1 = r1.I * Math.SQRT2;
    const I3 = r3.I * Math.SQRT2;
    const phi1 = (r1.phi * Math.PI) / 180;
    const phi3 = (r3.phi * Math.PI) / 180;
    const expected_i = I1 * Math.sin(-phi1) + I3 * Math.sin(-phi3);
    expect(data[0].v).toBeCloseTo(expected_v, 5);
    expect(data[0].i).toBeCloseTo(expected_i, 5);
  });
});
