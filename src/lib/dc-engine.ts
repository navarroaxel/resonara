import type { DCParams, DCResult } from './types'

export function calcDC(params: DCParams): DCResult {
  const { V1, V2, R1, R2, R3 } = params

  // Mesh equations (KVL on each clockwise loop):
  //   Loop 1: (R1+R2)·I1  −  R2·I2 = V1
  //   Loop 2:  −R2·I1 + (R2+R3)·I2 = V2
  //
  // Matrix A = [[R1+R2, -R2], [-R2, R2+R3]]
  const a11 = R1 + R2
  const a12 = -R2
  const a21 = -R2
  const a22 = R2 + R3

  const D = a11 * a22 - a12 * a21   // = (R1+R2)(R2+R3) - R2²

  // Cramer's rule: a12 = -R2 so det numerators pick up +R2 cross terms
  const I1 = (V1 * a22 - a12 * V2) / D  // = (V1(R2+R3) + R2·V2) / D
  const I2 = (a11 * V2 - a21 * V1) / D  // = ((R1+R2)V2 + R2·V1) / D

  const IR1 = I1
  const IR2 = I1 - I2
  const IR3 = I2

  const VR1 = IR1 * R1
  const VR2 = IR2 * R2
  const VR3 = IR3 * R3

  const VA = V1 - VR1

  // Residuals from direct substitution into mesh equations — always ≈ 0
  const kvl1 = V1 - a11 * I1 - a12 * I2   // V1 − (R1+R2)I1 + R2·I2
  const kvl2 = V2 - a21 * I1 - a22 * I2   // V2 + R2·I1 − (R2+R3)I2

  const kclA = IR1 - IR2 - IR3             // always algebraically 0

  return { I1, I2, IR1, IR2, IR3, VR1, VR2, VR3, VA, kvl1, kvl2, kclA, D }
}
