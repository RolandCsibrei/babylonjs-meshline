/**
 * @author roland@babylonjs.xyz
*/

import { BoundingSphere, Ray, VertexBuffer } from '@babylonjs/core'
import { Vector3, Buffer, Mesh, VertexData, Scene, Matrix, MeshBuilder } from '@babylonjs/core'
import { GreasedLineMaterial } from './GreasedLineMaterial'

export interface Xyz {
  x: number
  y: number
  z: number
}

export type GreasedLinePoints = Xyz[] | Float32Array | Float32Array[] | Xyz[][]

export interface GreasedLineParameters {
  points?: GreasedLinePoints
  widthCallback?: WidthCallback
  colorPointers?: number[]
  offsets?: number[]
}

type WidthCallback = (pointIndex: number) => number[]

export class GreasedLine extends Mesh {
  private _vertexPositions: number[]
  private _offset?: number[]
  private _previous: number[]
  private _next: number[]
  private _side: number[]
  private _width: number[]

  private _indices: number[]
  private _uvs: number[]
  private _counters: number[]
  private _colorPointers: number[]
  private _points: GreasedLinePoints

  private _offsetBuffer?: Buffer
  private _widthBuffer?: Buffer

  private _matrixWorld: Matrix

  private _boundingSphere?:BoundingSphere
  private _boundingSphereMesh:Mesh

  constructor(public name: string, _scene: Scene, private _parameters: GreasedLineParameters, private _updatable: boolean = false) {
    super(name, _scene, null, null, false, false)

    this._vertexPositions = []
    this._indices = []
    this._uvs = []

    if (_parameters.offsets) {
      this._offset = [..._parameters.offsets]
    }
    this._previous = []
    this._next = []
    this._side = []
    this._width = []
    this._counters = []
    this._colorPointers = []

    this._points = new Float32Array()
    // this._geometry = null
    // Used to raycast
    
    this._boundingSphereMesh = MeshBuilder.CreateSphere(`${this.name}-bounding-sphere`, {}, null)
    this._boundingSphereMesh.setEnabled(false)
    this._matrixWorld = this.getWorldMatrix()
    if (this._parameters.points) {
      this.setPoints(this._parameters.points)
    }
  }

  public get positions() {
    return this._vertexPositions
  }

  public get points() {
    return this._points
  }

  public set points(points: GreasedLinePoints) {
    this.setPoints(points)
  }

  public get lineCount() {
    return this._colorPointers.length
  }

  public addPoints(points: GreasedLinePoints) {
    let indiceOffset = 0
    let pointCount = 0

    const numberPoints = GreasedLine._Convert(points)
    numberPoints.forEach((vectors) => {
      const positions: number[] = []
      const counters: number[] = []
      const indices: number[] = []

      for (let j = 0, jj = 0; jj < vectors.length; j++, jj += 3) {
        let c = jj / vectors.length

        positions.push(vectors[jj], vectors[jj + 1], vectors[jj + 2])
        positions.push(vectors[jj], vectors[jj + 1], vectors[jj + 2])
        counters.push(c)
        counters.push(c)

        if (jj < vectors.length - 3) {
          var n = j * 2 + indiceOffset
          indices.push(n, n + 1, n + 2)
          indices.push(n + 2, n + 1, n + 3)
        }

        pointCount++
      }

      indiceOffset += (vectors.length / 3) * 2

      const { previous, next, uvs, width, side } = this._preprocess(positions)

      this._vertexPositions.push(...positions)
      this._indices.push(...indices)
      this._counters.push(...counters)
      this._previous.push(...previous)
      this._next.push(...next)
      this._uvs.push(...uvs)
      this._width.push(...width)
      this._side.push(...side)
      // this._colorPointers = this._parameters.colorPointers ?? [...Array(pointCount * 2)].map((_, i) => i / (pointCount * 4))
    })
  }

  public setPoints(points: GreasedLinePoints) {
    this._points = points

    this._initGreasedLine()

    this.addPoints(points)

    this._drawLine()
    this._updateRaycastBoundingInfo()
  }

  private _initGreasedLine() {
    this._vertexPositions = []
    this._counters = []
    this._previous = []
    this._next = []
    this._side = []
    this._width = []
    this._indices = []
    this._uvs = []
    this._colorPointers = []
  }


  public setOffsets(offsets: number[]) {
    this._offsetBuffer && this._offsetBuffer.update(offsets)
  }
  public setWidth(widths: number[]) {
    this._widthBuffer && this._widthBuffer.update(widths)
  }

  public raycast(raycaster: Ray, threshold = 0.2) {
    
    if (this._boundingSphere && raycaster.intersectsSphere(this._boundingSphere, threshold) === false) {
      return
    }
    
    const vStart = new Vector3()
    const vEnd = new Vector3()
    const vOffsetStart = new Vector3()
    const vOffsetEnd = new Vector3()
    
    const indices = this.getIndices()
    const positions = this.getVerticesData(VertexBuffer.PositionKind)
    const widths = this._width
    
    const lineWidth = (this.material as GreasedLineMaterial).getParameters().lineWidth ?? 1
    
    const intersects = []
    if (indices !== null && positions !== null) {
      let i = 0, l = 0
      for (i = 0, l = indices.length - 1; i < l; i += 3) {
        const a = indices[i]
        const b = indices[i + 1]

        vStart.fromArray(positions, a * 3)
        vEnd.fromArray(positions, b * 3)

        if (this._offset) {
           vOffsetStart.fromArray(this._offset, a *3) 
           vOffsetEnd.fromArray(this._offset, b *3) 
           vStart.addInPlace(vOffsetStart)
           vStart.addInPlace(vOffsetEnd)
        }

        const iFloored = Math.floor(i / 3)
        const width = widths[iFloored] !== undefined ? widths[iFloored] : 1
        const precision = threshold + (lineWidth * width) / 2

        const distance = raycaster.intersectionSegment(vStart, vEnd, precision/1000)
        console.log('distance', distance, threshold)
        if (distance !== -1) {
          console.log(vStart, vEnd)

          intersects.push({
            distance: distance,
            point: raycaster.direction.normalize().multiplyByFloats(distance, distance, distance).add(raycaster.origin),
            index: i,
            object: this,
          })
        }
      }
      i = l
    }

    return intersects
  }

  private _updateRaycastBoundingInfo() {

    if (!this.geometry) {
      return 
    }

    this._boundingSphereMesh.setBoundingInfo(this.getBoundingInfo())
    this._boundingSphereMesh.bakeTransformIntoVertices(this._matrixWorld)
  }

  private static _Convert(points: GreasedLinePoints): number[][] {
    if (points.length && !Array.isArray(points[0]) && (points[0] as any).x !== undefined) {
      const positions: number[] = []
      for (let j = 0; j < points.length; j++) {
        let p = points[j] as Xyz
        let c = j / points.length
        positions.push(p.x, p.y, p.z)
      }
      return [positions]
    } else if (points.length > 0 && Array.isArray(points[0]) && points[0].length > 0) {
      const positions: number[][] = []
      const vectorPoints = points as Xyz[][]
      vectorPoints.forEach((p) => {
        positions.push(p.flatMap((p2) => [p2.x, p2.y, p2.z]))
      })
      return positions
    } else if (points instanceof Float32Array) {
      return [Array.from(points)]
    } else if (points.length && points[0] instanceof Float32Array) {
      const positions: number[][] = []
      points.forEach((p) => {
        positions.push(Array.from(p as Float32Array))
      })
      return positions
    }

    return []
  }

  private _compareV3(positionIdx1: number, positionIdx2: number, positions: number[]) {
    const arrayIdx1 = positionIdx1 * 6
    const arrayIdx2 = positionIdx2 * 6
    return (
      positions[arrayIdx1] === positions[arrayIdx2] &&
      positions[arrayIdx1 + 1] === positions[arrayIdx2 + 1] &&
      positions[arrayIdx1 + 2] === positions[arrayIdx2 + 2]
    )
  }

  private _copyV3(positionIdx: number, positions: number[]) {
    positions = positions ?? this._vertexPositions

    const arrayIdx = positionIdx * 6
    return [positions[arrayIdx], positions[arrayIdx + 1], positions[arrayIdx + 2]]
  }

  private _preprocess(positions: number[]) {
    const l = positions.length / 6

    let wUp: number, wDown: number
    let v: number[] = []

    const previous = []
    const next = []
    const side = []
    const uvs = []
    const width = []

    if (this._compareV3(0, l - 1, positions)) {
      v = this._copyV3(l - 2, positions)
    } else {
      v = this._copyV3(0, positions)
    }
    previous.push(v[0], v[1], v[2])
    previous.push(v[0], v[1], v[2])

    for (let j = 0; j < l; j++) {
      side.push(1)
      side.push(-1)

      if (this._parameters.widthCallback) {
        ;[wUp, wDown] = this._parameters.widthCallback(j)
      } else {
        wUp = 1
        wDown = 1
      }

      width.push(wUp)
      width.push(wDown)

      // uvs
      uvs.push(j / (l - 1), 0)
      uvs.push(j / (l - 1), 1)

      if (j < l - 1) {
        v = this._copyV3(j, positions)
        previous.push(v[0], v[1], v[2])
        previous.push(v[0], v[1], v[2])
      }
      if (j > 0) {
        v = this._copyV3(j, positions)
        next.push(v[0], v[1], v[2])
        next.push(v[0], v[1], v[2])
      }
    }

    if (this._compareV3(l - 1, 0, positions)) {
      v = this._copyV3(1, positions)
    } else {
      v = this._copyV3(l - 1, positions)
    }
    next.push(v[0], v[1], v[2])
    next.push(v[0], v[1], v[2])

    return {
      previous,
      next,
      uvs,
      width,
      side,
    }
  }

  private _drawLine() {
    const vertexData = new VertexData()
    vertexData.positions = this._vertexPositions
    vertexData.indices = this._indices
    vertexData.uvs = this._uvs
    vertexData.applyToMesh(this, false)

    const engine = this._scene.getEngine()

    const previousBuffer = new Buffer(engine, this._previous, false, 3)
    this.setVerticesBuffer(previousBuffer.createVertexBuffer('previous', 0, 3))

    const nextBuffer = new Buffer(engine, this._next, false, 3)
    this.setVerticesBuffer(nextBuffer.createVertexBuffer('next', 0, 3))

    const sideBuffer = new Buffer(engine, this._side, false, 1)
    this.setVerticesBuffer(sideBuffer.createVertexBuffer('side', 0, 1))

    const countersBuffer = new Buffer(engine, this._counters, false, 1)
    this.setVerticesBuffer(countersBuffer.createVertexBuffer('counters', 0, 1))

    const widthBuffer = new Buffer(engine, this._width, this._updatable, 1)
    this.setVerticesBuffer(widthBuffer.createVertexBuffer('width', 0, 1))
    this._widthBuffer = widthBuffer

    if (this._offset) {
      const offsetBuffer = new Buffer(engine, this._offset, this._updatable, 3)
      this.setVerticesBuffer(offsetBuffer.createVertexBuffer('offset', 0, 3))
      this._offsetBuffer = offsetBuffer
    }
    // const colorPointersBuffer = new Buffer(engine, this.colorPointers, true, 1)
    // this.setVerticesBuffer(colorPointersBuffer.createVertexBuffer('colorPointers', 0, 1))
    // this._colorPointersBuffer = colorPointersBuffer
  }

  // public setColorPointers(cp: number[]) {
  //   this._colorPointersBuffer!.update(cp)
  // }

}
