import { calcDC } from '../dc-engine'

const base = { V1: 12, V2: 6, R1: 100, R2: 200, R3: 150 }

describe('calcDC', () => {
  it('returns correct mesh currents for a known circuit', () => {
    // V1=10, V2=0, R1=R2=R3=1 → D=3, I1=20/3, I2=10/3
    const r = calcDC({ V1: 10, V2: 0, R1: 1, R2: 1, R3: 1 })
    expect(r.I1).toBeCloseTo(20 / 3, 6)
    expect(r.I2).toBeCloseTo(10 / 3, 6)
  })

  it('KVL loop 1 residual is zero', () => {
    expect(calcDC(base).kvl1).toBeCloseTo(0, 10)
  })

  it('KVL loop 2 residual is zero', () => {
    expect(calcDC(base).kvl2).toBeCloseTo(0, 10)
  })

  it('KCL at node A is zero', () => {
    const r = calcDC(base)
    expect(r.kclA).toBeCloseTo(0, 10)
  })

  it('branch currents satisfy IR1 = IR2 + IR3', () => {
    const r = calcDC(base)
    expect(r.IR1 - r.IR2 - r.IR3).toBeCloseTo(0, 10)
  })

  it('symmetric sources give equal mesh currents and zero shared-branch current', () => {
    const r = calcDC({ V1: 10, V2: 10, R1: 100, R2: 200, R3: 100 })
    expect(r.I1).toBeCloseTo(r.I2, 6)
    expect(r.IR2).toBeCloseTo(0, 6)
  })

  it('degenerate circuit (D=0) returns NaN for all currents', () => {
    // All resistances 0 → D = 0
    const r = calcDC({ V1: 10, V2: 5, R1: 0, R2: 0, R3: 0 })
    expect(Number.isNaN(r.I1)).toBe(true)
    expect(Number.isNaN(r.I2)).toBe(true)
  })

  it('shared branch (IR2) reverses when V2 dominates V1', () => {
    // Large V2, small V1 → I2 > I1 → IR2 = I1-I2 < 0 (current flows B→A through R2)
    const r = calcDC({ V1: 1, V2: 100, R1: 100, R2: 50, R3: 100 })
    expect(r.IR2).toBeLessThan(0)
    expect(r.kvl1).toBeCloseTo(0, 9)
    expect(r.kvl2).toBeCloseTo(0, 9)
    expect(r.kclA).toBeCloseTo(0, 9)
  })

  it('single source (V2=0) reduces to series-parallel equivalent', () => {
    // V2=0 → V1 drives R1 in series with (R2 ∥ R3)
    const V1 = 10, R1 = 100, R2 = 200, R3 = 200
    const Req = R1 + (R2 * R3) / (R2 + R3)  // series + parallel
    const I_total = V1 / Req
    const r = calcDC({ V1, V2: 0, R1, R2, R3 })
    expect(r.IR1).toBeCloseTo(I_total, 6)
  })
})
