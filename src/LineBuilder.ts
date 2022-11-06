/**
 * @author roland@babylonjs.xyz
 */

 import {
  Matrix,
  Ray,
  Vector3,
  Buffer,
  Geometry,
  VertexBuffer,
  Mesh,
  VertexData,
  Effect,
  ShaderMaterial,
  Scene,
  Color3,
  Vector2,
  Texture,
  Nullable
} from '@babylonjs/core'

export interface GreasedLineParameters {
  points?: Vector3[] | Float32Array
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
  private _points: Float32Array | Vector3[]
  // private _geometry: Nullable<Geometry> = null

  // public mesh: Mesh
  private _material: Nullable<GreasedLineMaterial> = null

  private _matrixWorld: Matrix

  constructor(public name: string,  _scene: Scene,  private _parameters: GreasedLineParameters) {
   super(name, _scene, null, null, false, false)
   
    // this.mesh = new Mesh(this.name, this._scene)

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
    this._matrixWorld = new Matrix()

    this.setGeometry(this._parameters.points)

    // var material = new GreasedLineMaterial('greasedLine', _scene, this._parameters)
    // this.mesh.material = material
  }

  // public get geometry() {
  //   return this
  // }

  public get points() {
    return this._points
  }

  public set points(points: Float32Array | Vector3[]) {
    this.setPoints(points)
  }

  public setMatrixWorld(matrixWorld: Matrix) {
    this._matrixWorld = matrixWorld
  }

  public setGeometry(geometry: Geometry | Vector3[] | Float32Array | undefined) {
    if (geometry instanceof Geometry) {
      const floatArray = new Float32Array(geometry.getVerticesData(VertexBuffer.PositionKind) ?? [])
      this.setPoints(floatArray)
    } else if (Array.isArray(geometry)) {
      this.setPoints(geometry)
    } else if (geometry instanceof Float32Array) {
      this.setPoints(geometry)
    }
  }

  public setPoints(points: Float32Array | Vector3[]) {
    this._points = points
    this.positions = []
    this.counters = []
    if (points.length && points[0] instanceof Vector3) {
      for (var j = 0; j < points.length; j++) {
        var p = points[j] as Vector3
        var c = j / points.length
        this.positions.push(p.x, p.y, p.z)
        this.positions.push(p.x, p.y, p.z)
        this.counters.push(c)
        this.counters.push(c)
      }
    } else {
      const pointsArray = points as Float32Array
      for (var j = 0; j < points.length; j += 3) {
        var c = j / points.length
        this.positions.push(pointsArray[j], pointsArray[j + 1], pointsArray[j + 2])
        this.positions.push(pointsArray[j], pointsArray[j + 1], pointsArray[j + 2])
        this.counters.push(c)
        this.counters.push(c)
      }
    }
    this.process()
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

  public compareV3(a: number, b: number) {
    var aa = a * 6
    var ab = b * 6
    return (
      this.positions[aa] === this.positions[ab] &&
      this.positions[aa + 1] === this.positions[ab + 1] &&
      this.positions[aa + 2] === this.positions[ab + 2]
    )
  }

  public copyV3(a: number) {
    var aa = a * 6
    return [this.positions[aa], this.positions[aa + 1], this.positions[aa + 2]]
  }

  public process() {
    var l = this.positions.length / 6

    this.previous = []
    this.next = []
    this.side = []
    this.width = []
    this.indices = []
    this.uvs = []

    var w

    var v
    // initial previous points
    if (this.compareV3(0, l - 1)) {
      v = this.copyV3(l - 2)
    } else {
      v = this.copyV3(0)
    }
    this.previous.push(v[0], v[1], v[2])
    this.previous.push(v[0], v[1], v[2])

    for (var j = 0; j < l; j++) {
      // sides
      this.side.push(1)
      this.side.push(-1)

      // widths
      // if (this._parameters.widthCallback) w = this._parameters.widthCallback(j / (l - 1))
      if (this._parameters.widthCallback) w = this._parameters.widthCallback(j)
      else w = 1
      this.width.push(w)
      this.width.push(w)

      // uvs
      this.uvs.push(j / (l - 1), 0)
      this.uvs.push(j / (l - 1), 1)

      if (j < l - 1) {
        // points previous to poisitions
        v = this.copyV3(j)
        this.previous.push(v[0], v[1], v[2])
        this.previous.push(v[0], v[1], v[2])

        // indices
        var n = j * 2
        this.indices.push(n, n + 1, n + 2)
        this.indices.push(n + 2, n + 1, n + 3)
      }
      if (j > 0) {
        // points after poisitions
        v = this.copyV3(j)
        this.next.push(v[0], v[1], v[2])
        this.next.push(v[0], v[1], v[2])
      }
    }

    // last next point
    if (this.compareV3(l - 1, 0)) {
      v = this.copyV3(1)
    } else {
      v = this.copyV3(l - 1)
    }
    this.next.push(v[0], v[1], v[2])
    this.next.push(v[0], v[1], v[2])

    // if (!this.attributes || this.attributes.position.length !== this.positions.length) {
    //   this.attributes = {
    //     position: new Float32Array(this.positions), //3),
    //     uv: new Float32Array(this.uvs), //2),
    //     index: new Uint16Array(this.indices), //1),

    //     previous: new Float32Array(this.previous), //3),
    //     next: new Float32Array(this.next), //3),
    //     side: new Float32Array(this.side), //1),
    //     width: new Float32Array(this.width), //1),
    //     counters: new Float32Array(this.counters), //1),
    //   }
    // } else {
    // this._attributes.position.copyArray(new Float32Array(this.positions))
    // //   this._attributes.position.needsUpdate = true
    // this._attributes.previous.copyArray(new Float32Array(this.previous))
    // //   this._attributes.previous.needsUpdate = true
    // this._attributes.next.copyArray(new Float32Array(this.next))
    // //   this._attributes.next.needsUpdate = true
    // this._attributes.side.copyArray(new Float32Array(this.side))
    // //   this._attributes.side.needsUpdate = true
    // this._attributes.width.copyArray(new Float32Array(this.width))
    // //   this._attributes.width.needsUpdate = true
    // this._attributes.uv.copyArray(new Float32Array(this.uvs))
    // //   this._attributes.uv.needsUpdate = true
    // this._attributes.index.copyArray(new Uint16Array(this.indices_array))
    //   this._attributes.index.needsUpdate = true
    // }

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
   
    // if (this.material) {
    //   this.material.dispose()
    // }
    // var material = new GreasedLineMaterial('greasedLine', this._scene, this._parameters)
    // this.material = material

    console.log('Line updated', this.name)

    // TODO
    // this.computeBoundingSphere()
    // this.computeBoundingBox()
    // this.useBoundingInfoFromGeometry = true
  }

  // public setParameters(parameters: GreasedLineParameters) {
  //   ;(this.material as GreasedLineMaterialParameters).setParameters(parameters)
  // }

  public memcpy(src: Float32Array, srcOffset: number, dst: Float32Array, dstOffset: number, length: number) {
    src = srcOffset
      ? src.subarray
        ? src.subarray(srcOffset, length && srcOffset + length)
        : src.slice(srcOffset, length && srcOffset + length)
      : src

    if (dst.set) {
      dst.set(src, dstOffset)
    } else {
      for (let i = 0; i < src.length; i++) {
        dst[i + dstOffset] = src[i]
      }
    }

    return dst
  }
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
        fragment: './shaders/greasedLine'
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
          'uvOffset'
        ]
      }
    )

    this._parameters = {}
    this.setParameters(parameters)
    // this.onBindObservable.add(() => {

    // })
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
