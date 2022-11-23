import { PBRCustomMaterial } from '@babylonjs/materials'
import { GreasedLine, GreasedLinePoints } from './../GreasedLine'
import { ArcRotateCamera, Color3, Color4, GlowLayer, Scene, Vector2, Vector3 } from '@babylonjs/core'
import { Xyz } from '../GreasedLine'
import { GreasedLinePBRMaterial } from '../GreasedLinePBRMaterial'

export function pbrDemo(scene: Scene, camera: ArcRotateCamera) {
  const engine = scene.getEngine()

  camera.target = new Vector3(0, 0, 0)
  camera.alpha = 0
  camera.beta = 0
  camera.radius = 40
  camera.upperRadiusLimit = 300
  camera.minZ = 0.01

  scene.clearColor = new Color4(0, 0, 0, 1)
  scene.autoClear = true

  const points = getPoints()
  const mesh = drawLine(points)

  const gl = new GlowLayer('glow', scene, {
    camera,
    blurKernelSize: 128
  })
  gl.intensity = 1

  gl.referenceMeshToUseItsOwnMaterial(mesh)
  gl.onBeforeRenderMeshToEffect.add((mesh) => {
    if (mesh.name === 'box-line') {
      const mat = mesh.material as PBRCustomMaterial
      mat!.disableLighting = true
    }
  })
  gl.onAfterRenderMeshToEffect.add((mesh) => {
    if (mesh.name === 'box-line') {
      const mat = mesh.material as PBRCustomMaterial
      mat!.disableLighting = false
    }
  })

  function drawLine(points: GreasedLinePoints) {
    const colors = [1, 0, 0, 1, 1, 0, 0, 1, 0]
    const gl = new GreasedLine('box-line', scene, {
      points,
      //   widthCallback: (pw) => pw * 2,
    })

    const material = new GreasedLinePBRMaterial('line', scene, {
      //   colors,
      //   useColors: true,
      color: new Color3(0.2, 0.4, 1),
      opacity: 1,
      resolution: new Vector2(engine.getRenderWidth(), engine.getRenderHeight()),
      sizeAttenuation: false,
      lineWidth: 4,
      visibility: 1,
    })

    material.backFaceCulling = false

    material.emissiveColor = new Color3(1, 0, 0)
    gl.material = material

    return gl
  }

  function getPoints() {
    const points = [
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 10, z: 0 },
    ]
    return points
  }
}
