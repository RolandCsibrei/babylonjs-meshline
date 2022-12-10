import { Matrix, Vector3 } from "@babylonjs/core"

export class Vector3Ext extends Vector3 {
    public static SubVectors(a: Vector3, b: Vector3) {
      return new Vector3(a.x - b.x, a.y - b.y, a.z - b.z)
    }
  
    applyMatrix4(m: Matrix) {
      const x = this.x,
        y = this.y,
        z = this.z
      const e = m.toArray()
  
      const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15])
  
      this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w
      this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w
      this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w
  
      return this
    }
  }
  