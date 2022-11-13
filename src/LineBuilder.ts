/**
 * @author roland@babylonjs.xyz
 */

import {
  Vector3,
  Buffer,
  Geometry,
  VertexBuffer,
  Mesh,
  VertexData,
  ShaderMaterial,
  Scene,
  Color3,
  Vector2,
  Texture,
  Nullable,
} from '@babylonjs/core'

export type GreasedLinePoints = Vector3[] | Float32Array | Float32Array[] | Vector3[][]
export interface GreasedLineParameters {
  points: GreasedLinePoints
  widthCallback?: WidthCallback
}

export interface GreasedLineMaterialParameters {
  lineWidth?: number
  map?: Texture
  alphaMap?: Texture
  useMap?: boolean
  useAlphaMap?: boolean
  color?: Color3
  opacity?: number
  resolution?: Vector2
  sizeAttenuation?: boolean
  dashArray?: number
  dashOffset?: number
  dashRatio?: number
  useDash?: boolean
  visibility?: number
  alphaTest?: number
  repeat?: Vector2
  uvOffset?: Vector2
}

type WidthCallback = (pointIndex: number) => number

// export class LineBuilder {
//   public static CreateGreasedLine(name: string, scene: Scene, parameters?: GreasedLineParameters) {
//     parameters = parameters || {}

//     const engine = scene.getEngine()

//     parameters.useMap = parameters.useMap ?? false
//     parameters.useAlphaMap = parameters.useAlphaMap ?? false
//     parameters.color = parameters.color ?? Color3.Black()
//     parameters.opacity = parameters.opacity ?? 1
//     parameters.resolution = parameters.resolution ?? new Vector2(engine.getRenderWidth(), engine.getRenderHeight())
//     parameters.sizeAttenuation = parameters.sizeAttenuation ?? false
//     parameters.useDash = parameters.useDash ?? false
//     parameters.dashArray = parameters.dashArray ?? 0
//     parameters.dashOffset = parameters.dashOffset ?? 0
//     parameters.dashRatio = parameters.dashRatio ?? 0
//     parameters.visibility = parameters.visibility ?? 1
//     parameters.alphaTest = parameters.alphaTest ?? 1
//     parameters.repeat = parameters.repeat ?? new Vector2(1, 1)
//     parameters.uvOffset = parameters.uvOffset ?? new Vector2(0, 0)

//     return new GreasedLine(name, scene, parameters.points)
//   }
// }

export class GreasedLine extends Mesh {
  private positions: number[]
  private previous: number[]
  private next: number[]
  private side: number[]
  private width: number[]

  private indices: number[]
  private uvs: number[]
  private counters: number[]
  private _points: GreasedLinePoints
  private _material: Nullable<GreasedLineMaterial> = null

  // private _matrixWorld: Matrix

  constructor(public name: string, _scene: Scene, private _parameters: GreasedLineParameters) {
    super(name, _scene, null, null, false, false)

    this.positions = []
    this.indices = []
    this.uvs = []

    this.previous = []
    this.next = []
    this.side = []
    this.width = []
    this.counters = []

    this._points = new Float32Array()
    // this._geometry = null

    // Used to raycast
    // this._matrixWorld = new Matrix()

    this.setPoints(this._parameters.points)
  }

  public get points() {
    return this._points
  }

  public set points(points: GreasedLinePoints) {
    this.setPoints(points)
  }

  public setPoints(points: GreasedLinePoints) {
    this._points = points
    
    this.initProcess()

    let indiceOffset = 0

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
      }

      indiceOffset += (vectors.length / 3) * 2

      const { previous, next, uvs, width, side } = this.preprocess(positions)

      this.positions.push(...positions)
      this.indices.push(...indices)
      this.counters.push(...counters)
      this.previous.push(...previous)
      this.next.push(...next)
      this.uvs.push(...uvs)
      this.width.push(...width)
      this.side.push(...side)
    })

    this._drawLine()

  }

  private static _Convert(points: GreasedLinePoints): number[][] {
    if (points.length && points[0] instanceof Vector3) {
      const positions: number[] = []
      for (let j = 0; j < points.length; j++) {
        let p = points[j] as Vector3
        let c = j / points.length
        positions.push(p.x, p.y, p.z)
      }
      return [positions]
    } else if (points.length > 0 && Array.isArray(points[0]) && points[0].length > 0 && points[0][0] instanceof Vector3) {
      const positions: number[][] = []
      const vectorPoints = points as Vector3[][]
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

  public compareV3(a: number, b: number, positions: number[]) {
    const aa = a * 6
    const ab = b * 6
    return positions[aa] === positions[ab] && positions[aa + 1] === positions[ab + 1] && positions[aa + 2] === positions[ab + 2]
  }

  public copyV3(a: number, positions: number[]) {
    positions = positions ?? this.positions

    const aa = a * 6
    return [positions[aa], positions[aa + 1], positions[aa + 2]]
  }

  public initProcess() {
    this.positions = []
    this.counters = []
    this.previous = []
    this.next = []
    this.side = []
    this.width = []
    this.indices = []
    this.uvs = []
  }

  public preprocess(positions: number[]) {
    const l = positions.length / 6

    let w: number
    let v: number[] = []

    const previous = []
    const next = []
    const side = []
    const uvs = []
    const width = []

    // initial previous points
    if (this.compareV3(0, l - 1, positions)) {
      v = this.copyV3(l - 2, positions)
    } else {
      v = this.copyV3(0, positions)
    }
    previous.push(v[0], v[1], v[2])
    previous.push(v[0], v[1], v[2])

    for (let j = 0; j < l; j++) {
      // sides
      side.push(1)
      side.push(-1)

      // widths
      // if (this._parameters.widthCallback) w = this._parameters.widthCallback(j / (l - 1))
      if (this._parameters.widthCallback) {
        w = this._parameters.widthCallback(j)
      } else {
        w = 1
      }

      width.push(w)
      width.push(w)

      // uvs
      uvs.push(j / (l - 1), 0)
      uvs.push(j / (l - 1), 1)

      if (j < l - 1) {
        // points previous to poisitions
        v = this.copyV3(j, positions)
        previous.push(v[0], v[1], v[2])
        previous.push(v[0], v[1], v[2])
      }
      if (j > 0) {
        // points after poisitions
        v = this.copyV3(j, positions)
        next.push(v[0], v[1], v[2])
        next.push(v[0], v[1], v[2])
      }
    }

    // last next point
    if (this.compareV3(l - 1, 0, positions)) {
      v = this.copyV3(1, positions)
    } else {
      v = this.copyV3(l - 1, positions)
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

    vertexData.positions = this.positions
    vertexData.indices = this.indices
    vertexData.uvs = this.uvs

    vertexData.applyToMesh(this)

    const engine = this._scene.getEngine()

    const previousBuffer = new Buffer(engine, this.previous, false, 3)
    this.setVerticesBuffer(previousBuffer.createVertexBuffer('previous', 0, 3))

    const nextBuffer = new Buffer(engine, this.next, false, 3)
    this.setVerticesBuffer(nextBuffer.createVertexBuffer('next', 0, 3))

    const sideBuffer = new Buffer(engine, this.side, false, 1)
    this.setVerticesBuffer(sideBuffer.createVertexBuffer('side', 0, 1))

    const widthBuffer = new Buffer(engine, this.width, false, 1)
    this.setVerticesBuffer(widthBuffer.createVertexBuffer('width', 0, 1))

    const countersBuffer = new Buffer(engine, this.counters, false, 1)
    this.setVerticesBuffer(countersBuffer.createVertexBuffer('counters', 0, 1))
  }

  
  /*
  private _greasedLineRaycast(raycaster, intersects) {
    var inverseMatrix = new Matrix()
    var ray = new Ray()
    // var sphere = new THREE.Sphere();
    var sphere = MeshBuilder.CreateSphere('sphere')
    var interRay = new THREE.Vector3()
    var geometry = this.geometry
    // Checking boundingSphere distance to ray

    if (!geometry.boundingSphere) geometry.computeBoundingSphere()
    sphere.copy(geometry.boundingSphere)
    sphere.applyMatrix4(this.matrixWorld)

    if (raycaster.ray.intersectSphere(sphere, interRay) === false) {
      return
    }

    inverseMatrix.copy(this.matrixWorld).invert()
    ray.copy(raycaster.ray).applyMatrix4(inverseMatrix)

    var vStart = new Vector3()
    var vEnd = new Vector3()
    var interSegment = new Vector3()
    // var step = this instanceof THREE.LineSegments ? 2 : 1;
    var step = 1
    var index = geometry.index
    var attributes = geometry.attributes

    if (index !== null) {
      var indices = index.array
      var positions = attributes.position.array
      var widths = attributes.width.array

      for (var i = 0, l = indices.length - 1; i < l; i += step) {
        var a = indices[i]
        var b = indices[i + 1]

        vStart.fromArray(positions, a * 3)
        vEnd.fromArray(positions, b * 3)
        var width = widths[Math.floor(i / 3)] !== undefined ? widths[Math.floor(i / 3)] : 1
        var precision = raycaster.params.Line.threshold + (this.material.lineWidth * width) / 2
        var precisionSq = precision * precision

        var distSq = ray.distanceSqToSegment(vStart, vEnd, interRay, interSegment)

        if (distSq > precisionSq) continue

        interRay.applyMatrix4(this.matrixWorld) //Move back to world space for distance calculation

        var distance = raycaster.ray.origin.distanceTo(interRay)

        if (distance < raycaster.near || distance > raycaster.far) continue

        intersects.push({
          distance: distance,
          // What do we want? intersection point on the ray or on the segment??
          // point: raycaster.ray.at( distance ),
          point: interSegment.clone().applyMatrix4(this.matrixWorld),
          index: i,
          face: null,
          faceIndex: null,
          object: this,
        })
        // make event only fire once
        i = l
      }
    }
}
*/
}

export class GreasedLineMaterial extends ShaderMaterial {
  private _parameters: GreasedLineMaterialParameters

  private static _bton(bool?: boolean) {
    return bool ? 1 : 0
  }
  constructor(name: string, scene: Scene, parameters: GreasedLineMaterialParameters) {
    super(
      name,
      scene,
      {
        vertex: './shaders/greasedLine',
        fragment: './shaders/greasedLine',
      },
      {
        attributes: ['uv', 'position', 'normal', 'previous', 'next', 'side', 'width', 'counters'],
        uniforms: [
          'world',
          'worldView',
          'worldViewProjection',
          'view',
          'projection',
          'lineWidth',
          'map',
          'useMap',
          'alphaMap',
          'useAlphaMap',
          'color',
          'opacity',
          'resolution',
          'sizeAttenuation',
          'dashArray',
          'dashOffset',
          'dashRatio',
          'useDash',
          'visibility',
          'alphaTest',
          'repeat',
          'uvOffset',
        ],
      },
    )

    this._parameters = {}
    this.setParameters(parameters)
  }

  public setParameters(parameters: GreasedLineMaterialParameters) {
    this._parameters = { ...this._parameters, ...parameters }

    this.setFloat('lineWidth', this._parameters.lineWidth ?? 1)

    if (this._parameters.alphaMap) {
      this.setTexture('alphaMap', this._parameters.alphaMap)
    }

    if (this._parameters.map) {
      this.setTexture('map', this._parameters.map)
    }

    this.setFloat('useMap', GreasedLineMaterial._bton(this._parameters.useMap))
    this.setFloat('useAlphaMap', GreasedLineMaterial._bton(this._parameters.useAlphaMap))
    this.setColor3('color', this._parameters.color ?? Color3.White())
    this.setFloat('opacity', this._parameters.opacity ?? 1)
    this.setVector2('resolution', this._parameters.resolution ?? new Vector2(1, 1))
    this.setFloat('sizeAttenuation', GreasedLineMaterial._bton(this._parameters.sizeAttenuation))
    this.setFloat('dashArray', this._parameters.dashArray ?? 0)
    this.setFloat('dashOffset', this._parameters.dashOffset ?? 0)
    this.setFloat('dashRatio', this._parameters.dashRatio ?? 0.5)
    this.setFloat('useDash', GreasedLineMaterial._bton(this._parameters.useDash))
    this.setFloat('visibility', this._parameters.visibility ?? 1)
    this.setFloat('alphaTest', this._parameters.alphaTest ?? 0)
    this.setVector2('repeat', this._parameters.repeat ?? new Vector2(1, 1))
    this.setVector2('uvOffset', this._parameters.uvOffset ?? new Vector2(0, 0))
  }

  public getParameters() {
    return { ...this._parameters }
  }
}
