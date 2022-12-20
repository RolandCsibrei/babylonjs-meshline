import { GreasedLinePBRMaterial } from './../GreasedLinePBRMaterial';
import { scene, camera } from './babylon'
import { GreasedLineBuilder } from './../GraesedLineBuilder'
import { ArcRotateCamera, Color3, Engine, RawTexture, Scene, Vector2, Vector3, VertexBuffer } from '@babylonjs/core'
import { ColorDistribution, ColorSamplingMode, GreasedLineMaterial } from './../GreasedLineMaterial'
import { GreasedLine, WidthsDistribution } from './../GreasedLine'
import { segmentize } from '../lineUtils'

function makeLine(scene: Scene, points: Float32Array | Vector3[] | Vector3[][], color: Color3) {
  const engine = scene.getEngine()
  const mat = new GreasedLineMaterial('meshline', scene, {
    useMap: false,
    color,
    opacity: 1,
    resolution: new Vector2(engine.getRenderWidth(), engine.getRenderHeight()),
    sizeAttenuation: false,
    width: 10,
  })
  const ml = new GreasedLine('meshline', scene, {
    points,
    // widthCallback: (pw) => pw * 6,
  })
  ml.material = mat
  return ml
}

export function test(scene: Scene) {
  let line = new Float32Array(600)
  for (var j = 0; j < 200 * 3; j += 3) {
    line[j] = -30 + 0.1 * j
    line[j + 1] = 5 * Math.sin(0.01 * j)
    line[j + 2] = -20
  }
  makeLine(scene, line, new Color3(1, 0, 0))

  line = new Float32Array(600)
  for (var j = 0; j < 200 * 3; j += 3) {
    line[j] = -30 + 0.1 * j
    line[j + 1] = 5 * Math.cos(0.02 * j)
    line[j + 2] = -10
  }
  makeLine(scene, line, new Color3(0, 1, 0))

  line = new Float32Array(600)
  for (var j = 0; j < 200 * 3; j += 3) {
    line[j] = -30 + 0.1 * j
    line[j + 1] = 5 * Math.sin(0.01 * j) * Math.cos(0.005 * j)
    line[j + 2] = 0
  }
  makeLine(scene, line, new Color3(0, 0, 1))

  line = new Float32Array(600)
  for (var j = 0; j < 200 * 3; j += 3) {
    line[j] = -30 + 0.1 * j
    line[j + 1] = 0.02 * j + 5 * Math.sin(0.01 * j) * Math.cos(0.005 * j)
    line[j + 2] = 10
  }
  makeLine(scene, line, new Color3(1, 0, 1))

  line = new Float32Array(600)
  for (var j = 0; j < 200 * 3; j += 3) {
    line[j] = -30 + 0.1 * j
    line[j + 1] = Math.exp(0.005 * j)
    line[j + 2] = 20
  }
  const meshLine = makeLine(scene, line, new Color3(1, 1, 0))

  camera.zoomOn([meshLine])
}

export function testLineBuilderColorDistribution(scene: Scene, camera: ArcRotateCamera) {
  // const line1 = segmentize([new Vector3(-5,0,0), new Vector3(5,0,0)], 1)
  const line1 =
    // segmentize(
    // [
    [new Vector3(0, 0, 0), new Vector3(100, 0, 0), new Vector3(100, 100, 0), new Vector3(200, 100, 0), new Vector3(200, 200, 0)]
  // [new Vector3(0,0,0), new Vector3(10,10,100)]
  // ]
  // ,10
  // )
  const colors1 = [new Color3(1, 0, 0), new Color3(1, 0, 1), new Color3(0, 1, 1), new Color3(1, 1, 0)]
  const widths1 = [0, 0, 4, 4] //.reverse()

  const mesh = GreasedLineBuilder.CreateGreasedLineSystem(
    'lines',
    {
      points: line1,
      widths: widths1,
      widthsDistribution: WidthsDistribution.Repeat,
    },
    {
      colors: colors1,
      useColors: true,
      colorsSamplingMode: ColorSamplingMode.Smooth,
      colorDistribution: ColorDistribution.Start,
    },
    scene,
  )

  const line2 = [new Vector3(0, 0, 40), new Vector3(20, 0, 40), new Vector3(20, 0, 40)]
  const segm = segmentize([new Vector3(20, 0, 40), new Vector3(200, 0, 40)], 4.1)
  const colors2 = [new Color3(0, 0, 1), new Color3(0, 1, 0)]
  const widths2 = [0, 0, 20, 20, 4, 4]

  GreasedLineBuilder.CreateGreasedLineSystem(
    'lines',
    {
      points: line2.concat(segm),
      widths: widths2,
      instance: mesh,
      widthsDistribution: WidthsDistribution.Start,
    },
    { colors: colors2, color: Color3.Black(), colorDistribution: ColorDistribution.Repeat },
    scene,
  )

  //

  const line3 = []
  const colors3 = []
  const widths3 = []
  for (let i = 0; i < 200; i++) {
    line3.push(new Vector3(Math.sin(i / 20) * 20, i, 0))
    colors3.push(new Color3(Math.sin(i), Math.cos(i), Math.cos(i) * Math.sin(i)))
    widths3.push(Math.sin(i / 10) + 1)
  }
  const gl = GreasedLineBuilder.CreateGreasedLineSystem(
    'lines3',
    {
      points: line3,
      widths: widths3,
      // widthsDistribution: WidthsDistribution.Even,
      pbr: true
    },
    { color: Color3.Black(), width: 100,
      colors: colors3, 
      alphaTest: 1,
      visibility: 1,
      useColors: true
    
    },
    scene,
  )

  const mat = gl.material as GreasedLinePBRMaterial
  mat.emissiveColor = new Color3(1,0,0)
  mat.disableLighting = true
  mat

  camera.zoomOn([mesh])
  camera.radius += 10
  camera.maxZ = 1000
  camera.minZ = 0.1
}
