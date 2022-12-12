import { GreasedLine, GreasedLinePoints } from './../GreasedLine'
import { ArcRotateCamera, Axis, Color3, Color4, GlowLayer, MeshBuilder, Scene, Vector3 } from '@babylonjs/core'
import { circle } from '../lineUtils'
import { GreasedLinePBRMaterial } from '../GreasedLinePBRMaterial'
import { GridMaterial } from '@babylonjs/materials'

export function flyingLines(scene: Scene, camera: ArcRotateCamera) {
  const engine = scene.getEngine()

  const diameter = 20

  camera.target = new Vector3(0, 0, 0)
  camera.alpha = -1.98
  camera.beta = 0.75
  camera.radius = 38.85
  camera.upperRadiusLimit = 300
  camera.minZ = 0.01

  scene.clearColor = new Color4(0, 0, 0, 1)
  scene.autoClear = true

  const { points, cnt } = getPoints()

  const mesh = drawLine(points)
  drawEarth()

  const gl = new GlowLayer('glow', scene, {
    camera,
    blurKernelSize: 128,
  })
  gl.intensity = 2
  gl.referenceMeshToUseItsOwnMaterial(mesh)

  function drawEarth() {
    const earth = MeshBuilder.CreateSphere('earth', { diameter })
    const earthMaterial = new GridMaterial('earth-material')
    earthMaterial.gridRatio = 0.1
    earth.material = earthMaterial
    camera.zoomOn([earth])
    earth.visibility = 0.6
    camera.radius += 10
    return earth
  }

  function drawLine(points: GreasedLinePoints) {
    const line = new GreasedLine('flying-line', scene, {
      points,
      widthCallback: (pw) => {
        return pw < points.length * 0.5 ? [2, 2] : [Math.sin(pw / 70) * 20, Math.sin(pw / 70) * 20]
      },
    })

    const material = new GreasedLinePBRMaterial('line', scene, {
      lineWidth: 1,
      visibility: 1,
    })

    material.backFaceCulling = false

    material.emissiveColor = new Color3(1, 1, 0)
    line.material = material

    let time = 0
    let lineWidth = 3
    let visibility = 0
    scene.onBeforeRenderObservable.add(() => {
      material.setParameters({
        visibility,
      })

      visibility += 0.001 * scene.getAnimationRatio()
      time += 1
    })

    return line
  }

  function getPoints() {
    const circlePoints = circle(diameter / 1.7, 40, 0.05)
    for (let i = 0; i < circlePoints.length; i++) {
      circlePoints[i].z += i / 10
    }
    return { points: circlePoints, cnt: circlePoints.length }
  }
}

