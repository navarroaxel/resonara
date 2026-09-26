import { calcThreePhase } from "../three-phase-engine";
import type { ThreePhaseParams } from "../types";

// rst.txt: motores en triángulo 56 kW / cos φ1 0.7, iluminación en estrella
// 60x150W / cos φ2 0.6, VL=380V, targetFp=0.85. Valores de referencia
// calculados a mano.
const base: ThreePhaseParams = {
  VL: 380,
  f: 50,
  P1_kW: 56,
  cosPhi1: 0.7,
  numLamps: 60,
  wattPerLamp: 150,
  cosPhi2: 0.6,
  targetFp: 0.85,
};

describe("calcThreePhase — rst.txt part a)", () => {
  it("motor load: P1 = 56000 W, Q1 ≈ 57131 VAr", () => {
    const r = calcThreePhase(base, false);
    expect(r.P1).toBeCloseTo(56000, 0);
    expect(r.Q1).toBeCloseTo(57131, -1);
  });

  it("lighting load: P2 = 9000 W, Q2 = 12000 VAr", () => {
    const r = calcThreePhase(base, false);
    expect(r.P2).toBeCloseTo(9000, 0);
    expect(r.Q2).toBeCloseTo(12000, 0);
  });

  it("totals: P_total = 65000 W, Q_total ≈ 69131 VAr, S_total ≈ 94890 VA", () => {
    const r = calcThreePhase(base, false);
    expect(r.P_total).toBeCloseTo(65000, 0);
    expect(r.Q_total).toBeCloseTo(69131, -1);
    expect(r.S_total).toBeCloseTo(94890, -1);
  });

  it("fp_total ≈ 0.685, phi_total ≈ 46.79°", () => {
    const r = calcThreePhase(base, false);
    expect(r.fp_total).toBeCloseTo(0.685, 2);
    expect(r.phi_total).toBeCloseTo(46.79, 1);
  });

  it("I_L ≈ 144.16 A", () => {
    const r = calcThreePhase(base, false);
    expect(r.I_L).toBeCloseTo(144.16, 1);
  });

  it("Aron wattmeters: W_RS ≈ 52.43 kW, W_ST ≈ 12.53 kW", () => {
    const r = calcThreePhase(base, false);
    expect(r.W_RS).toBeCloseTo(52430, -2);
    expect(r.W_ST).toBeCloseTo(12530, -2);
  });

  it("W_RS + W_ST = P_total (Aron consistency check)", () => {
    const r = calcThreePhase(base, false);
    expect(r.W_RS + r.W_ST).toBeCloseTo(r.P_total, 0);
  });

  it("√3·(W_RS − W_ST) = Q_total (Aron consistency check)", () => {
    const r = calcThreePhase(base, false);
    expect(Math.sqrt(3) * (r.W_RS - r.W_ST)).toBeCloseTo(r.Q_total, 0);
  });
});

describe("calcThreePhase — rst.txt part b) capacitor bank", () => {
  it("Qc ≈ 28848 VAr needed to bring cos φ from 0.685 to 0.85", () => {
    const r = calcThreePhase(base, false);
    expect(r.Qc).toBeCloseTo(28848, -2);
  });

  it("C ≈ 212 µF per phase (delta-connected bank, sees VL not V_ph)", () => {
    const r = calcThreePhase(base, false);
    expect(r.C_uF).toBeCloseTo(212, 0);
  });

  it("Qc and C_uF don't depend on whether the bank is currently connected", () => {
    const off = calcThreePhase(base, false);
    const on = calcThreePhase(base, true);
    expect(on.Qc).toBeCloseTo(off.Qc, 6);
    expect(on.C_uF).toBeCloseTo(off.C_uF, 6);
  });

  it("connecting the bank raises cos φ to targetFp (0.85)", () => {
    const r = calcThreePhase(base, true);
    expect(r.fp_total).toBeCloseTo(0.85, 2);
  });

  it("connecting the bank leaves P_total unchanged (capacitors draw no active power)", () => {
    const off = calcThreePhase(base, false);
    const on = calcThreePhase(base, true);
    expect(on.P_total).toBeCloseTo(off.P_total, 0);
  });
});

describe("calcThreePhase — branch currents", () => {
  it("I_RM ≈ 121.56 A (motor bank line current, S1/(√3·VL))", () => {
    const r = calcThreePhase(base, false);
    expect(r.I_RM).toBeCloseTo(121.56, 1);
  });

  it("I_RL ≈ 22.79 A (lighting bank line current, S2/(√3·VL))", () => {
    const r = calcThreePhase(base, false);
    expect(r.I_RL).toBeCloseTo(22.79, 1);
  });

  it("I_RS is 0 when the capacitor bank is disconnected", () => {
    const r = calcThreePhase(base, false);
    expect(r.I_RS).toBe(0);
  });

  it("I_RS ≈ 25.31 A (V_L·ω·C) once the bank is connected", () => {
    const r = calcThreePhase(base, true);
    expect(r.I_RS).toBeCloseTo(25.31, 1);
  });

  it("I_RC = √3 · I_RS (delta line current from branch current)", () => {
    const r = calcThreePhase(base, true);
    expect(r.I_RC).toBeCloseTo(Math.sqrt(3) * r.I_RS, 6);
  });
});

describe("calcThreePhase — equivalent impedances", () => {
  it("Z_motor ≈ 5.42 Ω (3·VL²/S1, delta winding sees full VL)", () => {
    const r = calcThreePhase(base, false);
    expect(r.Z_motor).toBeCloseTo(5.42, 2);
  });

  it("Z_lamp ≈ 192.5 Ω (V_ph²·cosφ2/wattPerLamp, star lamp sees V_ph)", () => {
    const r = calcThreePhase(base, false);
    expect(r.Z_lamp).toBeCloseTo(192.5, 1);
  });

  it("Z_cap ≈ 15.0 Ω (1/(ω·C)), defined even when the bank is off", () => {
    const off = calcThreePhase(base, false);
    const on = calcThreePhase(base, true);
    expect(off.Z_cap).toBeCloseTo(15.0, 1);
    expect(on.Z_cap).toBeCloseTo(off.Z_cap, 6);
  });
});
