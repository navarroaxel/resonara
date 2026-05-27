import { calcThreePhase } from '../three-phase-engine'
import type { ThreePhaseParams } from '../types'

const SQRT3 = Math.sqrt(3)
const base: ThreePhaseParams = { VL: 380, R: 100, L: 50, C: 100, f: 50 }

describe('calcThreePhase — star', () => {
  it('V_ph = VL / √3', () => {
    const r = calcThreePhase('star', base)
    expect(r.V_ph).toBeCloseTo(base.VL / SQRT3, 6)
  })

  it('I_L = I_ph (line current equals phase current in star)', () => {
    const r = calcThreePhase('star', base)
    expect(r.I_L).toBeCloseTo(r.I_ph, 6)
  })

  it('P = 3 * V_ph * I_ph * cos(phi)', () => {
    const r = calcThreePhase('star', base)
    const expected = 3 * r.V_ph * r.I_ph * Math.cos(r.phi * Math.PI / 180)
    expect(r.P).toBeCloseTo(expected, 6)
  })
})

describe('calcThreePhase — delta', () => {
  it('V_ph = VL (phase voltage equals line voltage in delta)', () => {
    const r = calcThreePhase('delta', base)
    expect(r.V_ph).toBeCloseTo(base.VL, 6)
  })

  it('I_L = √3 * I_ph (line current is √3 times phase current in delta)', () => {
    const r = calcThreePhase('delta', base)
    expect(r.I_L).toBeCloseTo(SQRT3 * r.I_ph, 6)
  })
})

describe('calcThreePhase — reactive power sign', () => {
  it('capacitive (XC > XL with defaults): Qr < 0', () => {
    // base: XL=15.71Ω, XC=31.83Ω → capacitive → phi < 0 → sin(phi) < 0
    const r = calcThreePhase('star', base)
    expect(r.Qr).toBeLessThan(0)
  })

  it('inductive (XL > XC): Qr > 0', () => {
    const r = calcThreePhase('star', { ...base, L: 300 })
    expect(r.Qr).toBeGreaterThan(0)
  })

  it('Qr = 3 * V_ph * I_ph * sin(phi)', () => {
    const r = calcThreePhase('star', base)
    const expected = 3 * r.V_ph * r.I_ph * Math.sin(r.phi * Math.PI / 180)
    expect(r.Qr).toBeCloseTo(expected, 6)
  })
})

describe('calcThreePhase — component flags', () => {
  it('pure resistive (no L, no C): Z = R, phi = 0, fp = 1', () => {
    const r = calcThreePhase('star', base, { hasL: false, hasC: false })
    expect(r.Z).toBeCloseTo(base.R, 6)
    expect(r.phi).toBeCloseTo(0, 6)
    expect(r.fp).toBeCloseTo(1, 6)
  })

  it('hasL = false: XL = 0', () => {
    const r = calcThreePhase('star', base, { hasL: false, hasC: true })
    expect(r.XL).toBe(0)
  })

  it('hasC = false: XC = 0', () => {
    const r = calcThreePhase('star', base, { hasL: true, hasC: false })
    expect(r.XC).toBe(0)
  })
})
