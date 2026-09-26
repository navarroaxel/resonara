export type CircuitType = "series" | "parallel";

export type ActiveTab = "bode" | "phasor" | "time" | "power" | "spectrum";

export type PolyPreset = "square" | "triangle" | "sawtooth" | "custom";

export interface HarmonicInput {
  n: number; // harmonic number (1 = fundamental)
  An: number; // relative amplitude (0–2, where 1 = same as Vs)
  phin: number; // source phase of this harmonic (degrees)
}

export interface HarmonicResult {
  n: number;
  fn: number; // = n * params.f
  Vn: number; // peak voltage = An * Vs * √2
  Zn: number; // |Z| at fn
  phin_source: number; // source phase (from HarmonicInput)
  phin_circuit: number; // circuit phase angle at fn (degrees)
  In: number; // peak current = Vn / Zn
}

export interface PolyResult {
  harmonics: HarmonicResult[];
  I_rms: number; // √(Σ In_peak²/2)
  V_rms: number; // √(Σ Vn_peak²/2)
  THD_I: number; // √(Σ_{n>1} (In_peak/√2)²) / (I1_peak/√2) × 100 (%) — In_peak from HarmonicResult.In
  P_total: number; // Σ Vn_peak·In_peak/2·cos(φn_circuit)  (W)
  Qp_total: number; // VAR
  S_total: number; // V_rms · I_rms  (VA)
}

export interface ComponentFlags {
  hasL: boolean;
  hasC: boolean;
}

export type Lang = "es" | "en";

export type ResistorSymbol = "eu" | "usa";
export type UnitNotation = "raw" | "si";

export interface RLCParams {
  Vs: number; // Source voltage (V), range 1–500
  R: number; // Resistance (Ω), range 1–1000
  L: number; // Inductance (mH), range 1–500
  C: number; // Capacitance (µF), range 1–1000
  f: number; // Frequency (Hz), range 1–2000
}

export interface RLCResult {
  Z: number; // Total impedance magnitude (Ω)
  phi: number; // Phase angle (degrees)
  I: number; // Current magnitude (A)
  XL: number; // Inductive reactance (Ω)
  XC: number; // Capacitive reactance (Ω)
  fr: number; // Resonant frequency (Hz)
  Q: number; // Quality factor
  P: number; // Active power (W)
  Qp: number; // Reactive power (VAR)
  S: number; // Apparent power (VA)
  fp: number; // Power factor (cosφ)
}

export interface DCFlags {
  mesh3: boolean; // when false: circuit reduces to 2-mesh (Mesh 1 + Mesh 2), V3/R5 disconnected
  V1: boolean;
  V2: boolean;
  V3: boolean;
  polarityV1: boolean; // true = normal (+ at top/left), false = inverted
  polarityV2: boolean;
  polarityV3: boolean;
  R1: boolean;
  R2: boolean;
  R3: boolean;
  R4: boolean;
  R5: boolean;
}

export interface DCParams {
  V1: number; // Source 1 voltage (V), range 0.1–100 — Mesh 1 (left)
  V2: number; // Source 2 voltage (V), range 0–100   — Mesh 2 top rail
  V3: number; // Source 3 voltage (V), range 0.1–100 — Mesh 3 (right)
  R1: number; // Mesh 1 exclusive top rail (Ω), range 1–1000
  R2: number; // Shared branch Mesh 1–2 (Ω), range 1–1000
  R3: number; // Mesh 2 exclusive top rail (Ω), range 1–1000
  R4: number; // Shared branch Mesh 2–3 (Ω), range 1–1000
  R5: number; // Mesh 3 exclusive top rail (Ω), range 1–1000
}

export interface DCResult {
  I1: number; // Mesh 1 current (A)
  I2: number; // Mesh 2 current (A)
  I3: number; // Mesh 3 current (A)
  IR1: number; // Branch current through R1 = I1
  IR2: number; // Branch current through R2 = I1 - I2 (shared Mesh 1–2)
  IR3: number; // Branch current through R3 = I2
  IR4: number; // Branch current through R4 = I2 - I3 (shared Mesh 2–3)
  IR5: number; // Branch current through R5 = I3
  VR1: number; // Voltage across R1
  VR2: number; // Voltage across R2
  VR3: number; // Voltage across R3
  VR4: number; // Voltage across R4
  VR5: number; // Voltage across R5
  VA: number; // Node A voltage (V), junction R1/R2/R3
  VB: number; // Node B voltage (V), junction R3/R4/R5
  kvl1: number; // KVL residual loop 1 ≈ 0
  kvl2: number; // KVL residual loop 2 ≈ 0
  kvl3: number; // KVL residual loop 3 ≈ 0
  kclA: number; // KCL residual node A ≈ 0
  kclB: number; // KCL residual node B ≈ 0
  D: number; // Determinant (0 = degenerate circuit)
}

export type ThreePhaseActiveTab = "phasor" | "time" | "power" | "equations";

export interface ThreePhaseParams {
  VL: number; // Line-to-line voltage (V), 100–1000
  f: number; // Frequency (Hz), 1–500
  P1_kW: number; // Motor bank active power (kW), delta connection, 1–500
  cosPhi1: number; // Motor bank power factor, inductive, 0.5–1
  numLamps: number; // Lamps per phase, star connection (total lamps = 3x this), 1–100
  wattPerLamp: number; // Active power per lamp (W), 1–1000
  cosPhi2: number; // Lighting bank power factor, inductive, 0.5–1
  targetFp: number; // Target power factor after capacitor compensation, inductive, 0.5–1
}

export interface ThreePhaseFlags {
  capacitorsOn: boolean; // Delta capacitor bank connected (part b/c/d), correcting cos φ toward targetFp
}

export interface ThreePhaseResult {
  P1: number; // Motor bank active power (W)
  Q1: number; // Motor bank reactive power (VAr)
  S1: number; // Motor bank apparent power (VA)
  P2: number; // Lighting bank active power (W)
  Q2: number; // Lighting bank reactive power (VAr)
  S2: number; // Lighting bank apparent power (VA)
  P_total: number; // Total active power (W)
  Q_total: number; // Total reactive power (VAr), net of the capacitor bank when connected
  S_total: number; // Total apparent power (VA)
  fp_total: number; // Total power factor cos(φ)
  phi_total: number; // Total phase angle (degrees)
  I_L: number; // Balanced line current (A)
  W_RS: number; // Aron wattmeter reading, current coil in R, voltage coil R–S (W)
  W_ST: number; // Aron wattmeter reading, current coil in T, voltage coil T–S (W)
  Qc: number; // Capacitor bank reactive power needed to reach targetFp (VAr)
  C_uF: number; // Capacitance per phase for the delta-connected bank (µF)
  I_RM: number; // Line current feeding the motor bank (A)
  I_RL: number; // Line current feeding the lighting bank (A)
  I_RS: number; // Delta capacitor branch current, R–S side (A); 0 when disconnected
  I_RC: number; // Delta line current feeding the capacitor bank (A); 0 when disconnected
  Z_motor: number; // Equivalent impedance per motor (delta) winding (Ω)
  Z_lamp: number; // Equivalent impedance of a single lamp (Ω)
  Z_cap: number; // Capacitive reactance per delta branch (Ω); defined regardless of toggle
}

export interface BodePoint {
  f: number; // Frequency (Hz)
  Z: number; // Impedance magnitude (Ω)
  phi: number; // Phase angle (degrees)
}

export interface TimePoint {
  t: number; // Time (ms)
  v: number; // Voltage v(t) (V)
  i: number; // Current i(t) (A)
}

export interface RCDCParams {
  Vs: number; // Source voltage (V), 1–100
  R: number; // Resistance (Ω), 1–1000
  C: number; // Capacitance (µF), 1–10000
}

export interface RCDCResult {
  tau: number; // Time constant RC (s)
  I0: number; // Initial current Vs/R (A)
  Vc_tau: number; // Capacitor voltage at t=τ (V) ≈ 0.6321·Vs
  t5tau: number; // Time to 99.3% charge = 5τ (s)
  E_final: number; // Energy stored at full charge ½·C·Vs² (J)
}

export interface RCDCPoint {
  t: number; // Time (s)
  vc: number; // Capacitor voltage (V)
  vr: number; // Resistor voltage (V)
  i: number; // Current (A)
}

export type MagneticActiveTab = "phasor" | "time" | "freqResponse" | "power";

export interface MagneticParams {
  Vs: number; // Source RMS voltage (V), 1–500
  f: number; // Frequency (Hz), 1–1000
  R1: number; // Primary resistance (Ω), 0.1–1000
  L1: number; // Primary inductance (mH), 1–2000
  R2: number; // Secondary resistance / load (Ω), 0.1–1000
  L2: number; // Secondary inductance (mH), 1–2000
  k: number; // Coupling coefficient, 0–1
}

export interface MagneticResult {
  M: number; // Mutual inductance (mH)
  XL1: number; // Primary inductive reactance (Ω)
  XL2: number; // Secondary inductive reactance (Ω)
  XM: number; // Mutual reactance ωM (Ω)
  Zin_re: number; // Re(Zin)
  Zin_im: number; // Im(Zin)
  Zin: number; // |Zin| (Ω)
  Z2: number; // |Z2| secondary self-impedance (Ω)
  phi1: number; // Phase of I1 wrt Vs (degrees, positive = lagging)
  I1: number; // Primary RMS current (A)
  I2: number; // Secondary RMS current (A)
  phi2: number; // Phase of I2 wrt Vs (degrees)
  P1: number; // Primary active power (W)
  P2: number; // Secondary active power (W)
  Q1: number; // Primary reactive power (VAR)
  S1: number; // Primary apparent power (VA)
  eta: number; // Efficiency P2/P1 (0–1); 0 when k=0; NaN when P1=0
}

// ── AC Kirchhoff mesh simulator ──────────────────────────────────────────────

export type KirchhoffACActiveTab =
  "phasor" | "time" | "power" | "kvl" | "pfcCurve";

export interface KirchhoffACParams {
  Vs: number; // Source RMS voltage (V), 1–500
  f: number; // Frequency (Hz), 1–500
  R1: number; // Line resistance (Ω), 0–200
  R: number; // Resistive load (Ω), 1–1000
  Rm: number; // Motor winding resistance (Ω), 1–500
  Lm: number; // Motor inductance (mH), 1–2000
  C: number; // PFC capacitor (µF), 0.1–5000
}

export interface KirchhoffACFlags {
  mesh3: boolean; // when false: capacitor branch is open; reduces to 2-mesh
}

export interface ComplexDisplay {
  mag: number; // magnitude |z|
  ang: number; // angle in degrees (arg)
  re: number;
  im: number;
}

export interface KirchhoffACResult {
  I1: ComplexDisplay; // Mesh 1 current
  I2: ComplexDisplay; // Mesh 2 current
  I3: ComplexDisplay; // Mesh 3 current (zero when mesh3=false)
  IR: ComplexDisplay; // Branch current through R (shared M1–M2) = I1 − I2
  IZm: ComplexDisplay; // Branch current through Zm (shared M2–M3) = I2 − I3
  IZc: ComplexDisplay; // Branch current through Zc (M3 only) = I3
  VR1: ComplexDisplay; // Voltage across R1 = I1·R1
  VR: ComplexDisplay; // Voltage across R = IR·R
  VZm: ComplexDisplay; // Voltage across Zm = IZm·Zm
  VZc: ComplexDisplay; // Voltage across Zc = IZc·Zc
  Zm_re: number; // Re(Zm) = Rm
  Zm_im: number; // Im(Zm) = ω·Lm
  Zm_mag: number; // |Zm|
  Zc_im: number; // Im(Zc) = −1/(ω·C)
  Zc_mag: number; // |Zc| (Infinity when mesh3=false)
  P: number; // Active power at source (W)
  Q: number; // Reactive power at source (VAR, positive = inductive)
  S: number; // Apparent power at source (VA)
  fp: number; // Power factor cos φ = P/S
  C_req: number; // Required C (µF) for cos φ = 0.95, via 3-mesh numerical bisection
  fp_0: number; // System power factor without PFC (2-mesh)
  P_m: number; // Motor active power |IZm|²·Rm (W)
  Q_m: number; // Motor reactive power |IZm|²·XLm (VAR)
  S_m: number; // Motor apparent power |IZm|·|VZm| (VA)
  eta_m: number; // Motor efficiency Pm/Sm = Rm/|Zm| (0–1)
  P_R: number; // Load resistance active power |IR|²·R (W)
  P_R1: number; // Line resistance active power |I1|²·R1 (W)
  // KVL complex residuals (both components ≈ 0)
  kvl1_re: number;
  kvl1_im: number;
  kvl2_re: number;
  kvl2_im: number;
  kvl3_re: number;
  kvl3_im: number;
  D_mag: number; // |det| of impedance matrix (0 = degenerate)
}
