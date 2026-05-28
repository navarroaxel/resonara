export type CircuitType = 'series' | 'parallel'

export type ActiveTab = 'bode' | 'phasor' | 'time' | 'power' | 'spectrum'

export type PolyPreset = 'square' | 'triangle' | 'sawtooth' | 'custom'

export interface HarmonicInput {
  n:    number  // harmonic number (1 = fundamental)
  An:   number  // relative amplitude (0–2, where 1 = same as Vs)
  phin: number  // source phase of this harmonic (degrees)
}

export interface HarmonicResult {
  n:            number
  fn:           number   // = n * params.f
  Vn:           number   // peak voltage = An * Vs * √2
  Zn:           number   // |Z| at fn
  phin_source:  number   // source phase (from HarmonicInput)
  phin_circuit: number   // circuit phase angle at fn (degrees)
  In:           number   // peak current = Vn / Zn
}

export interface PolyResult {
  harmonics: HarmonicResult[]
  I_rms:     number   // √(Σ In_peak²/2)
  V_rms:     number   // √(Σ Vn_peak²/2)
  THD_I:     number   // √(Σ_{n>1} (In_peak/√2)²) / (I1_peak/√2) × 100 (%) — In_peak from HarmonicResult.In
  P_total:   number   // Σ Vn_peak·In_peak/2·cos(φn_circuit)  (W)
  Qp_total:  number   // VAR
  S_total:   number   // V_rms · I_rms  (VA)
}

export interface ComponentFlags {
  hasL: boolean
  hasC: boolean
}

export type Lang = 'es' | 'en'

export interface RLCParams {
  Vs: number   // Source voltage (V), range 1–500
  R:  number   // Resistance (Ω), range 1–1000
  L:  number   // Inductance (mH), range 1–500
  C:  number   // Capacitance (µF), range 1–1000
  f:  number   // Frequency (Hz), range 1–2000
}

export interface RLCResult {
  Z:    number  // Total impedance magnitude (Ω)
  phi:  number  // Phase angle (degrees)
  I:    number  // Current magnitude (A)
  XL:   number  // Inductive reactance (Ω)
  XC:   number  // Capacitive reactance (Ω)
  fr:   number  // Resonant frequency (Hz)
  Q:    number  // Quality factor
  P:    number  // Active power (W)
  Qp:   number  // Reactive power (VAR)
  S:    number  // Apparent power (VA)
  fp:   number  // Power factor (cosφ)
}

export interface DCFlags {
  mesh3:      boolean  // when false: circuit reduces to 2-mesh (Mesh 1 + Mesh 2), V3/R5 disconnected
  V1:         boolean
  V2:         boolean
  V3:         boolean
  polarityV1: boolean  // true = normal (+ at top/left), false = inverted
  polarityV2: boolean
  polarityV3: boolean
  R1: boolean
  R2: boolean
  R3: boolean
  R4: boolean
  R5: boolean
}

export interface DCParams {
  V1: number  // Source 1 voltage (V), range 0.1–100 — Mesh 1 (left)
  V2: number  // Source 2 voltage (V), range 0–100   — Mesh 2 top rail
  V3: number  // Source 3 voltage (V), range 0.1–100 — Mesh 3 (right)
  R1: number  // Mesh 1 exclusive top rail (Ω), range 1–1000
  R2: number  // Shared branch Mesh 1–2 (Ω), range 1–1000
  R3: number  // Mesh 2 exclusive top rail (Ω), range 1–1000
  R4: number  // Shared branch Mesh 2–3 (Ω), range 1–1000
  R5: number  // Mesh 3 exclusive top rail (Ω), range 1–1000
}

export interface DCResult {
  I1:   number  // Mesh 1 current (A)
  I2:   number  // Mesh 2 current (A)
  I3:   number  // Mesh 3 current (A)
  IR1:  number  // Branch current through R1 = I1
  IR2:  number  // Branch current through R2 = I1 - I2 (shared Mesh 1–2)
  IR3:  number  // Branch current through R3 = I2
  IR4:  number  // Branch current through R4 = I2 - I3 (shared Mesh 2–3)
  IR5:  number  // Branch current through R5 = I3
  VR1:  number  // Voltage across R1
  VR2:  number  // Voltage across R2
  VR3:  number  // Voltage across R3
  VR4:  number  // Voltage across R4
  VR5:  number  // Voltage across R5
  VA:   number  // Node A voltage (V), junction R1/R2/R3
  VB:   number  // Node B voltage (V), junction R3/R4/R5
  kvl1: number  // KVL residual loop 1 ≈ 0
  kvl2: number  // KVL residual loop 2 ≈ 0
  kvl3: number  // KVL residual loop 3 ≈ 0
  kclA: number  // KCL residual node A ≈ 0
  kclB: number  // KCL residual node B ≈ 0
  D:    number  // Determinant (0 = degenerate circuit)
}

export type ConnectionType = 'star' | 'delta'

export type ThreePhaseActiveTab = 'phasor' | 'time' | 'power'

export interface ThreePhaseParams {
  VL: number  // Line-to-line voltage (V), 100–1000
  R:  number  // Resistance (Ω), 1–1000
  L:  number  // Inductance (mH), 1–500
  C:  number  // Capacitance (µF), 1–1000
  f:  number  // Frequency (Hz), 1–500
}

export interface ThreePhaseResult {
  V_ph: number  // Phase voltage (V)
  V_L:  number  // Line voltage (V)
  I_ph: number  // Phase current (A)
  I_L:  number  // Line current (A)
  Z:    number  // Impedance magnitude (Ω)
  phi:  number  // Phase angle (degrees)
  XL:   number  // Inductive reactance (Ω)
  XC:   number  // Capacitive reactance (Ω)
  fr:   number  // Resonant frequency (Hz), NaN if flag disabled
  Q:    number  // Quality factor, NaN if flag disabled
  P:    number  // Total 3-phase active power (W)
  Qr:   number  // Total 3-phase reactive power (VAR)
  S:    number  // Total 3-phase apparent power (VA)
  fp:   number  // Power factor cos(φ)
}

export interface BodePoint {
  f:   number  // Frequency (Hz)
  Z:   number  // Impedance magnitude (Ω)
  phi: number  // Phase angle (degrees)
}

export interface TimePoint {
  t:  number  // Time (ms)
  v:  number  // Voltage v(t) (V)
  i:  number  // Current i(t) (A)
}

export interface RCDCParams {
  Vs: number  // Source voltage (V), 1–100
  R:  number  // Resistance (Ω), 100–100000
  C:  number  // Capacitance (µF), 1–10000
}

export interface RCDCResult {
  tau:     number  // Time constant RC (s)
  I0:      number  // Initial current Vs/R (A)
  Vc_tau:  number  // Capacitor voltage at t=τ (V) ≈ 0.6321·Vs
  t5tau:   number  // Time to 99.3% charge = 5τ (s)
  E_final: number  // Energy stored at full charge ½·C·Vs² (J)
}

export interface RCDCPoint {
  t:   number  // Time (s)
  vc:  number  // Capacitor voltage (V)
  vr:  number  // Resistor voltage (V)
  i:   number  // Current (A)
}
