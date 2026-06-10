import { calcMagnetic, calcMagneticSweep } from "../magnetic-engine";
import type { MagneticParams } from "../types";

const DEFAULT: MagneticParams = {
  Vs: 220,
  f: 50,
  R1: 10,
  L1: 200,
  R2: 100,
  L2: 200,
  k: 0.8,
};

describe("calcMagnetic — default params", () => {
  const r = calcMagnetic(DEFAULT);

  it("derives M from k, L1, L2", () => {
    const L1_H = DEFAULT.L1 / 1000;
    const L2_H = DEFAULT.L2 / 1000;
    expect(r.M).toBeCloseTo(DEFAULT.k * Math.sqrt(L1_H * L2_H) * 1000, 6);
  });

  it("I1 equals Vs / |Zin|", () => {
    expect(r.I1).toBeCloseTo(DEFAULT.Vs / r.Zin, 10);
  });

  it("P1 equals I1² · Zin_re", () => {
    expect(r.P1).toBeCloseTo(r.I1 ** 2 * r.Zin_re, 10);
  });

  it("apparent power identity: S1² ≈ P1² + Q1²", () => {
    expect(r.S1 ** 2).toBeCloseTo(r.P1 ** 2 + r.Q1 ** 2, 6);
  });

  it("S1 equals Vs · I1", () => {
    expect(r.S1).toBeCloseTo(DEFAULT.Vs * r.I1, 10);
  });

  it("eta is between 0 and 1", () => {
    expect(r.eta).toBeGreaterThan(0);
    expect(r.eta).toBeLessThanOrEqual(1);
  });
});

describe("calcMagnetic — k = 0 (no coupling)", () => {
  const r = calcMagnetic({ ...DEFAULT, k: 0 });

  it("M and XM are zero", () => {
    expect(r.M).toBe(0);
    expect(r.XM).toBe(0);
  });

  it("I2 is zero", () => {
    expect(r.I2).toBe(0);
  });

  it("eta is zero (P2 = 0, P1 > 0)", () => {
    expect(r.eta).toBe(0);
  });

  it("Zin equals primary self-impedance", () => {
    const w = 2 * Math.PI * DEFAULT.f;
    const XL1 = w * (DEFAULT.L1 / 1000);
    expect(r.Zin_re).toBeCloseTo(DEFAULT.R1, 10);
    expect(r.Zin_im).toBeCloseTo(XL1, 10);
  });
});

describe("calcMagnetic — energy conservation", () => {
  const cases: MagneticParams[] = [
    DEFAULT,
    { ...DEFAULT, k: 0.5 },
    { ...DEFAULT, k: 1.0 },
    { ...DEFAULT, R2: 10, L2: 50 },
  ];

  it("P2 ≤ P1 for all valid params", () => {
    for (const p of cases) {
      const r = calcMagnetic(p);
      expect(r.P2).toBeLessThanOrEqual(r.P1 + 1e-9);
    }
  });

  it("eta ≤ 1 always", () => {
    for (const p of cases) {
      const r = calcMagnetic(p);
      if (Number.isFinite(r.eta)) expect(r.eta).toBeLessThanOrEqual(1 + 1e-9);
    }
  });
});

describe("calcMagnetic — phase angle bounds", () => {
  it("phi1 is in [-90, 90] since Re(Zin) > 0", () => {
    const r = calcMagnetic(DEFAULT);
    expect(r.phi1).toBeGreaterThan(-90);
    expect(r.phi1).toBeLessThan(90);
  });
});

describe("calcMagnetic — degenerate secondary", () => {
  it("L2 = 0 does not produce NaN", () => {
    const r = calcMagnetic({ ...DEFAULT, L2: 0 });
    expect(Number.isFinite(r.I1)).toBe(true);
    expect(Number.isFinite(r.I2)).toBe(true);
    expect(Number.isFinite(r.P1)).toBe(true);
  });

  it("R2 = 0, L2 = 0 → I2 = 0 (guarded)", () => {
    const r = calcMagnetic({ ...DEFAULT, R2: 0, L2: 0 });
    expect(r.I2).toBe(0);
  });
});

describe("calcMagneticSweep", () => {
  it("returns 200 points by default", () => {
    const pts = calcMagneticSweep(DEFAULT);
    expect(pts).toHaveLength(200);
  });

  it("all values are finite for valid params", () => {
    const pts = calcMagneticSweep(DEFAULT);
    for (const p of pts) {
      expect(Number.isFinite(p.I1)).toBe(true);
      expect(Number.isFinite(p.I2)).toBe(true);
      expect(Number.isFinite(p.P1)).toBe(true);
    }
  });
});
