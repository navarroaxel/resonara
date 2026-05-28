import { calcRCDC, rcDCPoints } from '../rc-dc-engine'

const PARAMS = { Vs: 10, R: 1000, C: 100 }  // τ = 0.1 s

describe('calcRCDC', () => {
  test('time constant τ = R·C', () => {
    const { tau } = calcRCDC(PARAMS)
    expect(tau).toBeCloseTo(1000 * 100e-6, 10)
  })

  test('initial current I0 = Vs/R', () => {
    const { I0 } = calcRCDC(PARAMS)
    expect(I0).toBeCloseTo(10 / 1000, 6)
  })

  test('V_C at τ ≈ 63.21% of Vs', () => {
    const { Vc_tau } = calcRCDC(PARAMS)
    expect(Vc_tau / PARAMS.Vs).toBeCloseTo(1 - Math.exp(-1), 6)
  })

  test('5τ equals five time constants', () => {
    const { tau, t5tau } = calcRCDC(PARAMS)
    expect(t5tau).toBeCloseTo(5 * tau, 10)
  })

  test('energy stored = ½·C·Vs²', () => {
    const { E_final } = calcRCDC(PARAMS)
    const C = PARAMS.C * 1e-6
    expect(E_final).toBeCloseTo(0.5 * C * PARAMS.Vs ** 2, 10)
  })
})

describe('rcDCPoints', () => {
  test('first point: vc=0, vr=Vs, i=I0', () => {
    const pts = rcDCPoints(PARAMS)
    expect(pts[0].vc).toBeCloseTo(0, 6)
    expect(pts[0].vr).toBeCloseTo(PARAMS.Vs, 6)
    expect(pts[0].i).toBeCloseTo(PARAMS.Vs / PARAMS.R, 6)
  })

  test('last point: vc ≈ 0.9933·Vs, i ≈ 0', () => {
    const pts = rcDCPoints(PARAMS)
    const last = pts[pts.length - 1]
    expect(last.vc / PARAMS.Vs).toBeCloseTo(1 - Math.exp(-5), 4)
  })

  test('KVL holds at every point: vc + vr = Vs', () => {
    const pts = rcDCPoints(PARAMS, 50)
    for (const { vc, vr } of pts) {
      expect(vc + vr).toBeCloseTo(PARAMS.Vs, 6)
    }
  })

  test('current equals vr/R at every point', () => {
    const pts = rcDCPoints(PARAMS, 50)
    for (const { vr, i } of pts) {
      expect(i).toBeCloseTo(vr / PARAMS.R, 6)
    }
  })
})
