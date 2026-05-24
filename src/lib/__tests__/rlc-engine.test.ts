import { calcSeries, calcParallel } from '../rlc-engine'

const base = { Vs: 10, R: 100, L: 50, C: 100, f: 50 }
const FR    = 1 / (2 * Math.PI * Math.sqrt(0.05 * 100e-6)) // ≈ 71.18 Hz

describe('calcSeries', () => {
  it('returns correct resonant frequency', () => {
    expect(calcSeries(base).fr).toBeCloseTo(71.18, 1)
  })

  it('Z equals R at resonance', () => {
    expect(calcSeries({ ...base, f: FR }).Z).toBeCloseTo(base.R, 1)
  })

  it('phase angle is 0 at resonance', () => {
    expect(Math.abs(calcSeries({ ...base, f: FR }).phi)).toBeLessThan(0.01)
  })

  it('power factor is between 0 and 1', () => {
    const { fp } = calcSeries(base)
    expect(fp).toBeGreaterThanOrEqual(0)
    expect(fp).toBeLessThanOrEqual(1)
  })
})

describe('calcParallel', () => {
  it('returns the same fr as series', () => {
    expect(calcParallel(base).fr).toBeCloseTo(calcSeries(base).fr, 3)
  })

  it('Z is maximum at resonance', () => {
    const below = calcParallel({ ...base, f: FR * 0.5 })
    const atRes = calcParallel({ ...base, f: FR })
    const above = calcParallel({ ...base, f: FR * 2 })
    expect(atRes.Z).toBeGreaterThan(below.Z)
    expect(atRes.Z).toBeGreaterThan(above.Z)
  })
})
