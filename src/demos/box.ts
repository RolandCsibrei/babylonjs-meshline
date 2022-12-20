import { GreasedLine, GreasedLinePoints } from './../GreasedLine'
import { ArcRotateCamera, AxesViewer, Axis, Color3, Color4, DebugLayer, GlowLayer, Scene, Vector2, Vector3 } from '@babylonjs/core'
import { Xyz } from '../GreasedLine'
import { GreasedLineMaterial } from '../GreasedLineMaterial'
import { segmentize, xyzToVector3 } from '../lineUtils'

export function boxDemo(scene: Scene, camera: ArcRotateCamera) {
  const engine = scene.getEngine()

  camera.target = new Vector3(0, 0, 0)
  camera.alpha = -Math.PI / 2
  camera.beta = Math.PI / 2
  camera.radius = 38.85
  camera.upperRadiusLimit = 300
  camera.minZ = 0.01

  scene.clearColor = new Color4(0, 0, 0, 1)
  scene.autoClear = true

  const { lines, cnt } = getPoints(40)
  drawLine(lines)

  function drawLine(points: GreasedLinePoints) {
    const colorPointer = []

    const colors = [255, 0, 0, 255, 255, 0, 0, 255, 0, 0, 0, 255]

    for (let i = 0; i < cnt / 4; i++) {
      const c = (i / cnt) * 6
      colorPointer.push(c)
      colorPointer.push(c)
      colorPointer.push(c)
      colorPointer.push(c)

      colorPointer.push(c)
      colorPointer.push(c)
      colorPointer.push(c)
      colorPointer.push(c)
    }

    const gl = new GreasedLine('box-line', scene, {
      points,
      colorPointers: colorPointer,
    })

    const material = new GreasedLineMaterial('line', scene, {
      colors,
      useColors: true,
      color: new Color3(0.2, 0.4, 1),
      opacity: 1,
      resolution: new Vector2(engine.getRenderWidth(), engine.getRenderHeight()),
      sizeAttenuation: false,
      width: 3,
      visibility: 1,
    })

    gl.material = material

    let time = 0
    let lineWidth = 3
    scene.onBeforeRenderObservable.add(() => {
      if (time % 200===0) {
        let c = Color3.Random()
        colors[0] = c.r * 255
        colors[1] = c.g * 255
        colors[2] = c.b * 255
        
        c = Color3.Random()
        colors[3] = c.r * 255
        colors[4] = c.g * 255
        colors[5] = c.b * 255
        
        c = Color3.Random()
        colors[6] = c.r * 255
        colors[7] = c.g * 255
        colors[8] = c.b * 255

        lineWidth = Math.random() * 40

      }
      gl.rotate(Axis.X, 0.001 * scene.getAnimationRatio())
      gl.rotate(Axis.Y, 0.002 * scene.getAnimationRatio())
      gl.rotate(Axis.Z, 0.002 * scene.getAnimationRatio())

      material.setParameters({
        colors,
        width: lineWidth
      })

      time += 1
    })
  }

  function getPoints(cubeSize: number) {
    let x = 0
    let y = 0
    let z = 0

    let cnt = 0

    const lines: Xyz[][] = []

    const segmentLength = 0.5

    for (let i = 0; i < cubeSize; i++) {
      const line1 = [
        { x, y, z },
        { x, y, z: z + cubeSize },
      ]
      const line2 = [
        { x, y, z: z + cubeSize },
        { x, y: y - cubeSize, z: z + cubeSize },
      ]

      const line3 = [
        { x, y: y - cubeSize, z: z + cubeSize },
        { x, y: y - cubeSize, z: z },
      ]

      const line4 = [
        { x, y: y - cubeSize, z: z },
        { x, y, z },
      ]

      add(line1)
      add(line2)
      add(line3)
      add(line4)

      x++
    }

    function add(line1: Xyz[]) {
      const vectors = xyzToVector3(line1) as Vector3[]
      const segments = segmentize(vectors, segmentLength)
      cnt += segments.length
      lines.push(segments)
    }

    x = 0
    y = 0
    z = 0
    for (let i = 0; i <= cubeSize; i++) {
      const line1 = [
        { x, y, z },
        { x: x + cubeSize, y, z },
      ]
      const line2 = [
        { x: x + cubeSize, y, z },
        { x: x + cubeSize, y: y - cubeSize, z },
      ]

      const line3 = [
        { x: x + cubeSize, y: y - cubeSize, z },
        { x, y: y - cubeSize, z },
      ]

      const line4 = [
        { x, y: y - cubeSize, z },
        { x, y, z },
      ]

      add(line1)
      add(line2)
      add(line3)
      add(line4)

      z++
    }

    x = 0
    y = 0
    z = 0
    for (let i = 0; i <= cubeSize; i++) {
      const line1 = [
        { x, y, z },
        { x: x + cubeSize, y, z },
      ]
      const line2 = [
        { x: x + cubeSize, y, z },
        { x: x + cubeSize, y, z: z + cubeSize },
      ]

      const line3 = [
        { x: x + cubeSize, y, z: z + cubeSize },
        { x, y, z: z + cubeSize },
      ]

      const line4 = [
        { x, y, z: z + cubeSize },
        { x, y, z },
      ]

      add(line1)
      add(line2)
      add(line3)
      add(line4)

      y--
    }

    for (let l of lines) {
      for (let s of l) {
        s.x -= cubeSize / 2
        s.y += cubeSize / 2
        s.z -= cubeSize / 2
      }
    }

    return { lines, cnt }
  }
}
