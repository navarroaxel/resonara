import type { ThreePhaseParams, ThreePhaseResult } from "./types";

const SQRT3 = Math.sqrt(3);
const RAD_TO_DEG = 180 / Math.PI;
const PI_OVER_6 = Math.PI / 6;

function loadFromCosPhi(P: number, cosPhi: number) {
  const phi = Math.acos(cosPhi);
  const Q = P * Math.tan(phi);
  const S = Math.sqrt(P ** 2 + Q ** 2);
  return { P, Q, S };
}

export function calcThreePhase(
  params: ThreePhaseParams,
  capacitorsOn: boolean,
): ThreePhaseResult {
  const { VL, f, cosPhi1, cosPhi2, numLamps, wattPerLamp, targetFp } = params;

  const motor = loadFromCosPhi(params.P1_kW * 1000, cosPhi1);
  const lighting = loadFromCosPhi(numLamps * wattPerLamp, cosPhi2);

  const P_total = motor.P + lighting.P;
  const Q_uncompensated = motor.Q + lighting.Q;

  // Part b): capacitor bank (delta) needed to bring cos φ up to targetFp.
  // Delta-connected capacitors see the full line voltage VL (not V_ph), so
  // C is a third of what a star bank would need for the same Qc.
  const phi_uncompensated = Math.atan2(Q_uncompensated, P_total);
  const phi_target = Math.acos(targetFp);
  const Qc = P_total * (Math.tan(phi_uncompensated) - Math.tan(phi_target));
  const w = 2 * Math.PI * f;
  const C_uF = (Qc / (3 * w * VL ** 2)) * 1e6;

  const Q_total = capacitorsOn ? Q_uncompensated - Qc : Q_uncompensated;
  const S_total = Math.sqrt(P_total ** 2 + Q_total ** 2);
  const fp_total = S_total > 0 ? P_total / S_total : 1;
  const phi_total = Math.atan2(Q_total, P_total) * RAD_TO_DEG;

  const I_L = S_total / (SQRT3 * VL);

  const phiRad = (phi_total * Math.PI) / 180;
  const W_RS = VL * I_L * Math.cos(phiRad - PI_OVER_6);
  const W_ST = VL * I_L * Math.cos(phiRad + PI_OVER_6);

  // Branch currents: each load is balanced on its own, so its line current
  // is just its own apparent power over √3·VL (motor, lighting), or the
  // standard capacitor current V·ω·C for the delta bank (0 when off).
  const I_RM = motor.S / (SQRT3 * VL);
  const I_RL = lighting.S / (SQRT3 * VL);
  const I_RS = capacitorsOn ? VL * w * (C_uF / 1e6) : 0;
  // Delta line current feeding the bank = √3 · branch current
  const I_RC = SQRT3 * I_RS;

  // Equivalent per-branch impedances: the motor (delta) winding sees the
  // full line voltage; a single lamp (star) sees the phase voltage.
  const V_ph = VL / SQRT3;
  const Z_motor = (3 * VL ** 2) / motor.S;
  const Z_lamp = V_ph ** 2 / (wattPerLamp / cosPhi2);
  // Pure capacitive reactance per delta branch, independent of the toggle
  const Z_cap = 1 / (w * (C_uF / 1e6));

  return {
    P1: motor.P,
    Q1: motor.Q,
    S1: motor.S,
    P2: lighting.P,
    Q2: lighting.Q,
    S2: lighting.S,
    P_total,
    Q_total,
    S_total,
    fp_total,
    phi_total,
    I_L,
    W_RS,
    W_ST,
    Qc,
    C_uF,
    I_RM,
    I_RL,
    I_RS,
    I_RC,
    Z_motor,
    Z_lamp,
    Z_cap,
  };
}
