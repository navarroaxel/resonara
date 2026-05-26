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

export interface DCParams {
  V1: number  // Source 1 voltage (V), range 0.1–100
  V2: number  // Source 2 voltage (V), range 0.1–100
  R1: number  // Resistance 1 (Ω), range 1–1000
  R2: number  // Resistance 2 (Ω), range 1–1000
  R3: number  // Resistance 3 (Ω), range 1–1000
}

export interface DCResult {
  I1:   number  // Mesh 1 current (A), may be negative
  I2:   number  // Mesh 2 current (A), may be negative
  IR1:  number  // Branch current through R1 = I1
  IR2:  number  // Branch current through R2 = I1 - I2
  IR3:  number  // Branch current through R3 = I2
  VR1:  number  // Voltage across R1
  VR2:  number  // Voltage across R2
  VR3:  number  // Voltage across R3
  VA:   number  // Node A voltage (V), relative to GND
  kvl1: number  // KVL residual loop 1 ≈ 0
  kvl2: number  // KVL residual loop 2 ≈ 0
  kclA: number  // KCL residual node A ≈ 0
  D:    number  // Determinant (0 = degenerate circuit)
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
