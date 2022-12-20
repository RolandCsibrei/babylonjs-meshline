import { camera } from './babylon'
import { GreasedLineBuilder } from './../LineBuilder'
import { ArcRotateCamera, Color3, MeshBuilder, Ray, RayHelper, Scene, StandardMaterial, Vector2, Vector3 } from '@babylonjs/core'
import { GreasedLineMaterial } from './../GreasedLineMaterial'
import { GreasedLine, GreasedLinePoints } from './../GreasedLine'
import { getSubLines, segmentize } from '../lineUtils'

function makeLine(scene: Scene, points: GreasedLinePoints, color: Color3) {
  const engine = scene.getEngine()
  const mat = new GreasedLineMaterial('meshline', scene, {
    useMap: false,
    color,
    opacity: 1,
    resolution: new Vector2(engine.getRenderWidth(), engine.getRenderHeight()),
    sizeAttenuation: false,
    width:100,
  })
  const line = new GreasedLine('meshline', scene, {
    points,
    widthCallback: (pw) => [Math.sin(pw) * 0.6+2, Math.sin(pw) * 0.6+2],
    // widthCallback: (pw) => [pw%3===0?1:4,pw%3===0?1:4],
  })
  line.material = mat

  return line
}

export function raycast(scene: Scene, camera: ArcRotateCamera) {
  // let points = new Float32Array(600)
  // for (var j = 0; j < 200 * 3; j += 3) {
  //   points[j] = -30 + 0.1 * j
  //   points[j + 1] = 5 * Math.sin(0.01 * j)
  //   points[j + 2] = -20
  // }

  camera.alpha = 1.4
  camera.beta = 1.4
  camera.minZ = 0.01
  camera.maxZ = 1000

  const line1 = [
    new Vector3(0, 0, 0),
    new Vector3(0, 10, 0),
    new Vector3(3, 10, 0),
    new Vector3(3, 0, 0),
    new Vector3(3.2, 0, 0),
    new Vector3(5, 9, -0.4),
  ]
  const subLines1 = segmentize(line1, 0.6)

  const points = [subLines1, [new Vector3(1, 1, 0), new Vector3(1, 9, 0)]]
  // let i = 0
  // for (let x = 0; x < 20; x += 0.5) {
  //   points.push(new Vector3(x , Math.sin(i) * 10, 0))
  //   i += 0.1
  // }
  const line = makeLine(scene, points, new Color3(1, 0, 0))

  camera.zoomOn([line])
  camera.radius += 3

  const origin = new Vector3(-3, 5, 1)
  const direction = new Vector3(1, 0.4, -0.16)

  // const origin = new Vector3(-3, 5, 1)
  // const direction = new Vector3(1, 0.4, -0.4)

  // const origin = new Vector3(-3, 5, 0)
  // const direction = new Vector3(1, 0.4, 0)

  const marker = MeshBuilder.CreateSphere('origin1', { diameter: 0.2, segments: 8 })
  marker.position = origin

  const mat2 = new StandardMaterial('mat', scene)
  mat2.emissiveColor = Color3.Blue()
  mat2.disableLighting = true

  const length = undefined
  const ray = new Ray(origin, direction, length)
  const rayhelper = RayHelper.CreateAndShow(ray, scene, Color3.Black())
  const result = line.raycast(ray, 0.2)

  console.log(result)
  result?.forEach((r) => {
    const marker = MeshBuilder.CreateSphere('marker', { diameter: 0.4, segments: 8 })
    marker.position = r.point
    marker.material = mat2
  })
}
