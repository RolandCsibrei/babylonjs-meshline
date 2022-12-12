import { PBRCustomMaterial } from '@babylonjs/materials'
import { GreasedLine, GreasedLinePoints } from './../GreasedLine'
import { ArcRotateCamera, Axis, BezierCurve, Color3, Color4, GlowLayer, Scene, Vector2, Vector3 } from '@babylonjs/core'
import { Xyz } from '../GreasedLine'
import { ColorDistribution, ColorSamplingMode, GreasedLinePBRMaterial } from '../GreasedLinePBRMaterial'
import { bezier, circle, segmentize } from '../lineUtils'
import { GreasedLineBuilder } from '../LineBuilder'

export function pbrDemo(scene: Scene, camera: ArcRotateCamera) {
  const engine = scene.getEngine()

  camera.target = new Vector3(0, 0, 0)
  camera.alpha = -Math.PI / 2
  camera.beta = Math.PI / 2
  camera.radius = 58.85
  camera.upperRadiusLimit = 300
  camera.minZ = 0.01

  scene.clearColor = new Color4(0, 0, 0, 1)
  scene.autoClear = true

  const points = getPoints()
  const mesh = drawLineDashed(points)

  const gl = new GlowLayer('glow', scene, {
    camera,
    blurKernelSize: 128,
  })
  gl.intensity = 1

  gl.referenceMeshToUseItsOwnMaterial(mesh)
  // gl.onBeforeRenderMeshToEffect.add((mesh) => {
  //   if (mesh.name === 'line') {
  //     const mat = mesh.material as PBRCustomMaterial
  //     mat!.disableLighting = true
  //   }
  // })
  // gl.onAfterRenderMeshToEffect.add((mesh) => {
  //   if (mesh.name === 'line') {
  //     const mat = mesh.material as PBRCustomMaterial
  //     mat!.disableLighting = false
  //   }
  // })

  function drawLineDashed(points: GreasedLinePoints) {
    const gl = new GreasedLine('line', scene, {
      points,
        widthCallback: (pw) => [Math.sin(pw/50) * 4,Math.sin(pw/50)*4],
    })

    const material = new GreasedLinePBRMaterial('line', scene, {
      //   colors,
      //   useColors: true,
      color: new Color3(0.2, 0.4, 1),
      opacity: 1,
      resolution: new Vector2(engine.getRenderWidth(), engine.getRenderHeight()),
      sizeAttenuation: false,
      lineWidth: 40,
      visibility: 1,
      useDash: true,
      dashArray: 0.1,
      dashOffset: 0.2
    })

    material.backFaceCulling = false

    material.emissiveColor = new Color3(1, 1, 0)
    gl.material = material

    return gl
  }

  function drawLine(points: GreasedLinePoints) {
    const gl = new GreasedLine('line', scene, {
      points,
        widthCallback: (pw) => [Math.sin(pw/50) * 4,Math.sin(pw/50)*4],
    })

    const material = new GreasedLinePBRMaterial('line', scene, {
      //   colors,
      //   useColors: true,
      color: new Color3(0.2, 0.4, 1),
      opacity: 1,
      resolution: new Vector2(engine.getRenderWidth(), engine.getRenderHeight()),
      sizeAttenuation: false,
      lineWidth: 40,
      visibility: 1,
    })

    material.backFaceCulling = false

    material.emissiveColor = new Color3(1, 1, 0)
    gl.material = material

    return gl
  }

  function getPoints() {
    const linePoints = [
      { x: 0, y: 0, z: 10 },
      { x: 10, y: 10, z: 0 },
    ]
    const circlePoints = circle(20, 50)

    const bezierPoints = bezier(
      {
        x: -20,
        y: -20,
        z: 0,
      },
      {
        x: 0,
        y: 0,
        z: 0,
      },
      {
        x: 20,
        y: -20,
        z: 0,
      },
      20,
    )

    const points: Xyz[][] = []
    points.push(linePoints)
    points.push(circlePoints)
    points.push(bezierPoints)
    return points
  }

  
}

export function testLineBuilderPBRColorDistribution(scene: Scene, camera: ArcRotateCamera) {
  scene.clearColor = new Color4(0, 0, 0, 1)
  scene.autoClear = true

  // const line1 = segmentize([new Vector3(-5,0,0), new Vector3(5,0,0)], 1)
  const line1 = 
  segmentize(
    [new Vector3(0, 0, 0), new Vector3(100, 0, 0), new Vector3(100, 100, 0), new Vector3(200, 100, 0), new Vector3(200, 200, 0)]
    ,1.1
    )
  const colors1 = [new Color3(1, 0, 0), new Color3(1,0,1),  new Color3(0,1,1), new Color3(1, 1, 0)]

  const builder = new GreasedLineBuilder(scene)
  builder.addLine(line1, colors1, { colorDistribution: ColorDistribution.Repeat, 
    colorsSamplingMode: ColorSamplingMode.Exact,  color: Color3.Blue() })
    
  const mesh = builder.buildPBR({}, {
    color: Color3.Blue(),
    lineWidth: 60,
    useColors: true,
  }, true)

  const mat = mesh.material as GreasedLinePBRMaterial
  mat.emissiveColor = new Color3(1,0,0)

  camera.zoomOn([mesh])
  camera.radius += 10
  camera.maxZ = 1000
  camera.minZ = 0.1


  const gl = new GlowLayer('glow', scene, {
    camera,
    blurKernelSize: 128,
  })
  gl.intensity = 1

}
