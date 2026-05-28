import type { DCParams, DCResult } from './types'

export function calcDC(params: DCParams, hasMesh3 = true): DCResult {
  if (!hasMesh3) return calcDC2Mesh(params)

  const { V1, V2, V3, R1, R2, R3, R4, R5 } = params

  // 3-mesh ladder — KVL on each clockwise loop:
  //   Loop 1:  (R1+R2)·I1  −  R2·I2               = V1
  //   Loop 2:  −R2·I1 + (R2+R3+R4)·I2  −  R4·I3  = V3  (V3 in top rail, + rightward)
  //   Loop 3:              −R4·I2 + (R4+R5)·I3    = V2
  //
  // Matrix A (symmetric, tridiagonal):
  //   [ R1+R2      −R2          0   ]
  //   [  −R2    R2+R3+R4      −R4   ]
  //   [   0       −R4        R4+R5  ]
  const a11 = R1 + R2
  const a12 = -R2
  const a21 = -R2
  const a22 = R2 + R3 + R4
  const a23 = -R4
  const a32 = -R4
  const a33 = R4 + R5

  const M11 = a22 * a33 - a23 * a32
  const M12 = a21 * a33
  const D   = a11 * M11 - a12 * M12

  const N1 = V1 * M11 - a12 * (V3 * a33 - a23 * V2)
  const N2 = a11 * (V3 * a33 - a23 * V2) - V1 * a21 * a33
  const N3 = V1 * (a21 * a32) + V3 * (-a11 * a32) + V2 * (a11 * a22 - a12 * a21)

  const I1 = N1 / D
  const I2 = N2 / D
  const I3 = N3 / D

  const IR1 = I1
  const IR2 = I1 - I2
  const IR3 = I2
  const IR4 = I2 - I3
  const IR5 = I3

  const VR1 = IR1 * R1
  const VR2 = IR2 * R2
  const VR3 = IR3 * R3
  const VR4 = IR4 * R4
  const VR5 = IR5 * R5

  const VA = V1 - VR1
  const VB = VA - VR3

  const kvl1 = V1 - a11 * I1 - a12 * I2
  const kvl2 = V3 - a21 * I1 - a22 * I2 - a23 * I3
  const kvl3 = V2 - a32 * I2 - a33 * I3

  const kclA = IR1 - IR2 - IR3
  const kclB = IR3 - IR4 - IR5

  return { I1, I2, I3, IR1, IR2, IR3, IR4, IR5, VR1, VR2, VR3, VR4, VR5, VA, VB, kvl1, kvl2, kvl3, kclA, kclB, D }
}

// 2-mesh reduction: Mesh 3 absent, R4 terminates Mesh 2 to GND
// Loop 1: (R1+R2)·I1 − R2·I2 = V1
// Loop 2: −R2·I1 + (R2+R3+R4)·I2 = V3
function calcDC2Mesh(params: DCParams): DCResult {
  const { V1, V3, R1, R2, R3, R4 } = params

  const a11 = R1 + R2
  const a12 = -R2
  const a21 = -R2
  const a22 = R2 + R3 + R4

  const D  = a11 * a22 - a12 * a21
  const I1 = (V1 * a22 - a12 * V3) / D
  const I2 = (a11 * V3 - a21 * V1) / D
  const I3 = 0

  const IR1 = I1
  const IR2 = I1 - I2
  const IR3 = I2
  const IR4 = I2   // R4 is terminal branch of Mesh 2 (no I3)
  const IR5 = 0

  const VR1 = IR1 * R1
  const VR2 = IR2 * R2
  const VR3 = IR3 * R3
  const VR4 = IR4 * R4
  const VR5 = 0

  const VA = V1 - VR1
  const VB = VA - VR3

  const kvl1 = V1 - a11 * I1 - a12 * I2
  const kvl2 = V3 - a21 * I1 - a22 * I2
  const kvl3 = 0

  const kclA = IR1 - IR2 - IR3
  const kclB = IR3 - IR4 - IR5

  return { I1, I2, I3, IR1, IR2, IR3, IR4, IR5, VR1, VR2, VR3, VR4, VR5, VA, VB, kvl1, kvl2, kvl3, kclA, kclB, D }
}
