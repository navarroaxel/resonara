export type CircuitType = 'serie' | 'paralelo'

export type ActiveTab = 'bode' | 'phasor' | 'time' | 'power'

export interface ComponentFlags {
  hasL: boolean
  hasC: boolean
}

export type Lang = 'es' | 'en'

export interface RLCParams {
  Vs: number   // Source voltage (V), range 1–120
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
