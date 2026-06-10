import { calcKirchhoffAC } from "../kirchhoff-ac-engine";

const base = { Vs: 220, f: 50, R1: 2, R: 100, Rm: 30, Lm: 200, C: 50 };

describe("calcKirchhoffAC", () => {
  test("purely resistive circuit has zero phase angle (2-mesh)", () => {
    const r = calcKirchhoffAC({ ...base, Lm: 0 }, { mesh3: false });
    expect(Math.abs(r.I1.ang)).toBeLessThan(1e-6);
    expect(Math.abs(r.I2.ang)).toBeLessThan(1e-6);
  });

  test("KVL residuals ≈ 0 for base params (2-mesh)", () => {
    const r = calcKirchhoffAC(base, { mesh3: false });
    expect(Math.hypot(r.kvl1_re, r.kvl1_im)).toBeLessThan(1e-6);
    expect(Math.hypot(r.kvl2_re, r.kvl2_im)).toBeLessThan(1e-6);
  });

  test("KVL residuals ≈ 0 for base params (3-mesh)", () => {
    const r = calcKirchhoffAC(base, { mesh3: true });
    expect(Math.hypot(r.kvl1_re, r.kvl1_im)).toBeLessThan(1e-6);
    expect(Math.hypot(r.kvl2_re, r.kvl2_im)).toBeLessThan(1e-6);
    expect(Math.hypot(r.kvl3_re, r.kvl3_im)).toBeLessThan(1e-6);
  });

  test("degenerate circuit (R1=0, R=0, Rm=0, Lm=0) returns NaN", () => {
    calcKirchhoffAC(
      { ...base, R1: 0, R: 0.001, Rm: 0, Lm: 0 },
      { mesh3: false },
    );
    // Near-degenerate: R effectively 0 when R1 and Rm both 0 and R very small
    // Force true degeneracy: R=0, R1=0, Rm=0
    const r2 = calcKirchhoffAC(
      { ...base, R1: 0, R: 0, Rm: 0, Lm: 0 },
      { mesh3: false },
    );
    expect(Number.isNaN(r2.I1.mag)).toBe(true);
  });

  test("inductive circuit has positive Q and fp < 1 (2-mesh)", () => {
    const r = calcKirchhoffAC({ ...base, Lm: 300 }, { mesh3: false });
    expect(r.Q).toBeGreaterThan(0);
    expect(r.fp).toBeGreaterThan(0);
    expect(r.fp).toBeLessThan(1);
  });

  test("C_req = 0 when circuit already has fp ≥ 0.95", () => {
    // Purely resistive circuit has fp = 1 ≥ 0.95
    const r = calcKirchhoffAC({ ...base, Lm: 0 }, { mesh3: false });
    expect(r.C_req).toBe(0);
  });

  test("plugging C_req into 3-mesh gives fp ≈ 0.95", () => {
    const r2 = calcKirchhoffAC(base, { mesh3: false });
    const C_req = r2.C_req;
    expect(C_req).toBeGreaterThan(0);

    const r3 = calcKirchhoffAC({ ...base, C: C_req }, { mesh3: true });
    expect(Math.abs(r3.fp - 0.95)).toBeLessThan(0.02);
  });

  test("I3 = 0 when mesh3 is disabled", () => {
    const r = calcKirchhoffAC(base, { mesh3: false });
    expect(r.I3.mag).toBe(0);
    expect(r.IZc.mag).toBe(0);
  });

  test("D_mag > 0 for 3-mesh with non-degenerate params", () => {
    const r = calcKirchhoffAC(base, { mesh3: true });
    expect(r.D_mag).toBeGreaterThan(0);
    expect(Number.isFinite(r.D_mag)).toBe(true);
  });
});
