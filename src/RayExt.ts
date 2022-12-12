import { Ray, Vector3 } from "@babylonjs/core"
import { Vector3Ext } from "./Vector3Ext"

export class RayExt extends Ray {
    private _vector = new Vector3()
    private _segCenter = new Vector3()
    private _segDir = new Vector3()
    private _diff = new Vector3()
  
    // private _edge1 = new Vector3()
    // private _edge2 = new Vector3()
    // private _normal = new Vector3()
  
    // constructor(origin: Vector3, direction: Vector3, length?: number) {
    //   super(origin, direction, length)
    // }
  
    at(t: number, target: Vector3) {
      return target.copyFrom(this.direction).multiplyByFloats(t, t, t).add(this.origin)
    }
  
    lookAt(v: Vector3) {
      this.direction.copyFrom(v).subtract(this.origin).normalize()
  
      return this
    }
  
    recast(t: number) {
      this.origin.copyFrom(this.at(t, this._vector))
  
      return this
    }
  
    closestPointToPoint(point: Vector3, target: Vector3) {
      target = Vector3Ext.SubVectors(point, this.origin)
  
      const directionDistance = Vector3.Dot(target, this.direction)
  
      if (directionDistance < 0) {
        return target.copyFrom(this.origin)
      }
  
      return target.copyFrom(this.direction).multiplyByFloats(directionDistance, directionDistance, directionDistance).add(this.origin)
    }
  
    distanceToPoint(point: Vector3) {
      return Math.sqrt(this.distanceSqToPoint(point))
    }
  
    distanceSqToPoint(point: Vector3) {
      this._vector = Vector3Ext.SubVectors(point, this.origin)
      const directionDistance = Vector3.Dot(this._vector, this.direction)
  
      // point behind the ray
  
      if (directionDistance < 0) {
        return Vector3.DistanceSquared(this.origin, point)
      }
  
      this._vector.copyFrom(this.direction).multiplyByFloats(directionDistance, directionDistance, directionDistance).add(this.origin)
  
      return Vector3.DistanceSquared(this._vector, point)
    }
    public distanceSqToSegment(v0: Vector3, v1: Vector3, optionalPointOnRay?: Vector3, optionalPointOnSegment?: Vector3) {
      // from https://github.com/pmjoniak/GeometricTools/blob/master/GTEngine/Include/Mathematics/GteDistRaySegment.h
      // It returns the min distance between the ray and the segment
      // defined by v0 and v1
      // It can also set two optional targets :
      // - The closest point on the ray
      // - The closest point on the segment
  
      this._segCenter.copyFrom(v0).add(v1).multiplyByFloats(0.5, 0.5, 0.5)
      this._segDir.copyFrom(v1).subtract(v0).normalize()
      this._diff.copyFrom(this.origin).subtract(this._segCenter)
  
      const segExtent = Vector3.Distance(v0, v1) * 0.5
      const a01 = -Vector3.Dot(this.direction, this._segDir)
      const b0 = Vector3.Dot(this._diff, this.direction)
      const b1 = -Vector3.Dot(this._diff, this._segDir)
      const c = this._diff.lengthSquared()
      const det = Math.abs(1 - a01 * a01)
      let s0, s1, sqrDist, extDet
  
      if (det > 0) {
        // The ray and segment are not parallel.
  
        s0 = a01 * b1 - b0
        s1 = a01 * b0 - b1
        extDet = segExtent * det
  
        if (s0 >= 0) {
          if (s1 >= -extDet) {
            if (s1 <= extDet) {
              // region 0
              // Minimum at interior points of ray and segment.
  
              const invDet = 1 / det
              s0 *= invDet
              s1 *= invDet
              sqrDist = s0 * (s0 + a01 * s1 + 2 * b0) + s1 * (a01 * s0 + s1 + 2 * b1) + c
            } else {
              // region 1
  
              s1 = segExtent
              s0 = Math.max(0, -(a01 * s1 + b0))
              sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c
            }
          } else {
            // region 5
  
            s1 = -segExtent
            s0 = Math.max(0, -(a01 * s1 + b0))
            sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c
          }
        } else {
          if (s1 <= -extDet) {
            // region 4
  
            s0 = Math.max(0, -(-a01 * segExtent + b0))
            s1 = s0 > 0 ? -segExtent : Math.min(Math.max(-segExtent, -b1), segExtent)
            sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c
          } else if (s1 <= extDet) {
            // region 3
  
            s0 = 0
            s1 = Math.min(Math.max(-segExtent, -b1), segExtent)
            sqrDist = s1 * (s1 + 2 * b1) + c
          } else {
            // region 2
  
            s0 = Math.max(0, -(a01 * segExtent + b0))
            s1 = s0 > 0 ? segExtent : Math.min(Math.max(-segExtent, -b1), segExtent)
            sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c
          }
        }
      } else {
        // Ray and segment are parallel.
  
        s1 = a01 > 0 ? -segExtent : segExtent
        s0 = Math.max(0, -(a01 * s1 + b0))
        sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c
      }
  
      if (optionalPointOnRay) {
        optionalPointOnRay.copyFrom(this.direction).multiplyByFloats(s0, s0, s0).add(this.origin)
      }
  
      if (optionalPointOnSegment) {
        optionalPointOnSegment.copyFrom(this._segDir).multiplyByFloats(s1, s1, s1).add(this._segCenter)
      }
  
      return sqrDist
    }
  }
  