import { Xyz } from './GreasedLine'
import { Vector3 } from '@babylonjs/core'

interface SubLine {
  point1: Vector3
  point2: Vector3
  length: number
}

interface SubLinesMinMax {
  min: number
  max: number
}

export function getLineLength(points: Vector3[]): number {
  let length = 0
  for (let index = 0; index < points.length - 1; index++) {
    const point1 = points[index]
    const point2 = points[index + 1]
    length += point2.subtract(point1).length()
  }
  return length
}

export function divideLine(point1: Vector3, point2: Vector3, segmentCount: number): Vector3[] {
  const dividedLinePoints: Vector3[] = []
  const diff = point2.subtract(point1)
  const segmentVector = diff.divide(new Vector3(segmentCount, segmentCount, segmentCount))

  let nextPoint = point1.clone()
  dividedLinePoints.push(nextPoint)
  for (let index = 0; index < segmentCount; index++) {
    nextPoint = nextPoint.clone()
    dividedLinePoints.push(nextPoint.addInPlace(segmentVector))
  }

  return dividedLinePoints
}

export function getSubLines(points: Vector3[]): SubLine[] {
  const subLines: SubLine[] = []
  for (let index = 0; index < points.length - 1; index++) {
    const point1 = points[index]
    const point2 = points[index + 1]
    const length = point2.subtract(point1).length()
    subLines.push({ point1, point2, length })
  }

  return subLines
}

export function getMinMaxSubLineLength(points: Vector3[]): SubLinesMinMax {
  const subLines = getSubLines(points)
  const sorted = subLines.sort((s) => s.length)
  return {
    min: sorted[0].length,
    max: sorted[sorted.length - 1].length,
  }
}

export function segmentize(what: Vector3[] | SubLine[], segmentLength: number): Vector3[] {
  const subLines = what[0] instanceof Vector3 ? getSubLines(what as Vector3[]) : (what as SubLine[])
  const points: Vector3[] = []
  subLines.forEach((s) => {
    if (s.length > segmentLength) {
      const segments = divideLine(s.point1, s.point2, Math.ceil(s.length / segmentLength))
      segments.forEach((seg) => {
        points.push(seg)
      })
    } else {
      points.push(s.point1)
      points.push(s.point2)
    }
  })
  return points
}

export function xyzToVector3(xyz: Xyz | Xyz[]) {
  if (Array.isArray(xyz)) {
    const vectors = xyz.map((pos) => new Vector3(pos.x, pos.y, pos.z))
    return vectors
  }

  return new Vector3(xyz.x, xyz.y, xyz.z)
}

export function circle(radius: number, segments: number, segmentAngle?: number, z = 0) {
  const points: Xyz[] = []
  const add = segmentAngle ?? (Math.PI * 2) / segments
  for (let i = 0; i <= segments; i++) {
    points.push({
      x: Math.cos(i * add) * radius,
      y: Math.sin(i * add) * radius,
      z,
    })
  }
  return points
}

export function bezier(p0: Xyz, p1: Xyz, p2: Xyz, segments: number) {
  const points: Xyz[] = []

  for (let i = 0; i < segments; i++) {
    const point = getBezierPoint(i / segments, p0, p1, p2)
    points.push(point)
  }

  return points
}

function getBezierPoint(percent: number, p0: Xyz, p1: Xyz, p2: Xyz) {
  const a0 = (1 - percent) ** 2,
    a1 = 2 * percent * (1 - percent),
    a2 = percent ** 2
  return {
    x: a0 * p0.x + a1 * p1.x + a2 * p2.x,
    y: a0 * p0.y + a1 * p1.y + a2 * p2.y,
    z: a0 * p0.z + a1 * p1.z + a2 * p2.z,
  }
}
