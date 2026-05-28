import { calcDC } from '../dc-engine'

const base = { V1: 12, V2: 6, V3: 0, R1: 100, R2: 200, R3: 150, R4: 180, R5: 120 }

describe('calcDC', () => {
  it('returns correct mesh currents for a known 3-mesh circuit', () => {
    // All R=1, V1=10, V2=0:
    //   A = [[2,-1,0],[-1,3,-1],[0,-1,2]], b=[10,0,0]
    //   D=8, I1=50/8=25/4, I2=20/8=5/2, I3=10/8=5/4
    const r = calcDC({ V1: 10, V2: 0, V3: 0, R1: 1, R2: 1, R3: 1, R4: 1, R5: 1 })
    expect(r.I1).toBeCloseTo(25 / 4, 6)
    expect(r.I2).toBeCloseTo(5  / 2, 6)
    expect(r.I3).toBeCloseTo(5  / 4, 6)
  })

  it('KVL loop 1 residual is zero', () => {
    expect(calcDC(base).kvl1).toBeCloseTo(0, 10)
  })

  it('KVL loop 2 residual is zero', () => {
    expect(calcDC(base).kvl2).toBeCloseTo(0, 10)
  })

  it('KVL loop 3 residual is zero', () => {
    expect(calcDC(base).kvl3).toBeCloseTo(0, 10)
  })

  it('KCL at node A is zero', () => {
    expect(calcDC(base).kclA).toBeCloseTo(0, 10)
  })

  it('KCL at node B is zero', () => {
    expect(calcDC(base).kclB).toBeCloseTo(0, 10)
  })

  it('branch currents satisfy IR1=IR2+IR3 and IR3=IR4+IR5', () => {
    const r = calcDC(base)
    expect(r.IR1 - r.IR2 - r.IR3).toBeCloseTo(0, 10)
    expect(r.IR3 - r.IR4 - r.IR5).toBeCloseTo(0, 10)
  })

  it('symmetric circuit gives I1=I3 and IR2=IR4', () => {
    // V1=V2, R1=R5, R2=R4, R3 arbitrary → symmetric by construction
    const r = calcDC({ V1: 10, V2: 10, V3: 0, R1: 100, R2: 200, R3: 150, R4: 200, R5: 100 })
    expect(r.I1).toBeCloseTo(r.I3, 6)
    expect(Math.abs(r.IR2)).toBeCloseTo(Math.abs(r.IR4), 6)
  })

  it('degenerate circuit (D=0) returns NaN for all currents', () => {
    const r = calcDC({ V1: 10, V2: 5, V3: 0, R1: 0, R2: 0, R3: 0, R4: 0, R5: 0 })
    expect(Number.isNaN(r.I1)).toBe(true)
    expect(Number.isNaN(r.I2)).toBe(true)
    expect(Number.isNaN(r.I3)).toBe(true)
  })

  it('single source (V2=0) satisfies KVL for all three loops', () => {
    const r = calcDC({ V1: 10, V2: 0, V3: 0, R1: 100, R2: 200, R3: 150, R4: 180, R5: 120 })
    expect(r.kvl1).toBeCloseTo(0, 9)
    expect(r.kvl2).toBeCloseTo(0, 9)
    expect(r.kvl3).toBeCloseTo(0, 9)
  })

  it('V3 source in Mesh 2 top rail satisfies all KVL residuals', () => {
    const r = calcDC({ V1: 10, V2: 5, V3: 8, R1: 100, R2: 200, R3: 150, R4: 180, R5: 120 })
    expect(r.kvl1).toBeCloseTo(0, 9)
    expect(r.kvl2).toBeCloseTo(0, 9)
    expect(r.kvl3).toBeCloseTo(0, 9)
    expect(r.kclA).toBeCloseTo(0, 9)
    expect(r.kclB).toBeCloseTo(0, 9)
  })
})
