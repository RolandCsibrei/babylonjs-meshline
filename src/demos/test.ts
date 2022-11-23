import { Color3, Engine, RawTexture, Scene, Vector2, Vector3 } from '@babylonjs/core'
import { GreasedLineMaterial } from './../GreasedLineMaterial'
import { GreasedLine } from './../GreasedLine'

function makeLine(scene: Scene, points: Float32Array | Vector3[] | Vector3[][], color: Color3) {
  const engine = scene.getEngine()
  const mat = new GreasedLineMaterial('meshline', scene, {
    useMap: false,
    color,
    opacity: 1,
    resolution: new Vector2(engine.getRenderWidth(), engine.getRenderHeight()),
    sizeAttenuation: false,
    lineWidth: 10,
  })
  const ml = new GreasedLine('meshline', scene, {
    points,
    // widthCallback: (pw) => pw * 6,
  })
  ml.material = mat
}

function test(scene: Scene) {
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
  makeLine(scene, line, new Color3(1, 1, 0))
}

function test2(scene: Scene) {
  const engine = scene.getEngine()

  const colorList = [Color3.Red(), Color3.Yellow(), Color3.Green(), Color3.Blue()]

  const line2 = [new Vector3(0, 0, 0), new Vector3(100, 0, 0), new Vector3(200, 100, 0), new Vector3(300, 150, 0)]

  const colorPointer = Math.floor(line2.length - 1)
  const colorArray = new Uint8Array(colorPointer * 3)
  for (let i = 0; i < colorPointer; i++) {
    colorArray[i * 3] = colorList[i].r * 255
    colorArray[i * 3 + 1] = colorList[i].g * 255
    colorArray[i * 3 + 2] = colorList[i].b * 255
  }
  const colors = new RawTexture(colorArray, colorPointer, 1, Engine.TEXTUREFORMAT_RGB, scene)

  const mat = new GreasedLineMaterial('meshline', scene, {
    useMap: false,
    color: Color3.Black(),
    opacity: 1,
    resolution: new Vector2(engine.getRenderWidth(), engine.getRenderHeight()),
    sizeAttenuation: false,
    lineWidth: 140,
    colors,
  })

  const points = line2
  const ml = new GreasedLine('meshline', scene, {
    points,
    // widthCallback: (pw) => pw * 6,
  })
  ml.material = mat
}
function test3(scene: Scene) {
  const line = [
    [
      new Vector3(0, 0, 0),
      new Vector3(100, 0, 0),
      new Vector3(200, 100, 0),
      new Vector3(300, 150, 0),
      new Vector3(320, 180, 0),
      new Vector3(320, 220, 0),
      new Vector3(360, 280, 0),
      new Vector3(360, 310, 0),
    ],
    [new Vector3(0, 30, 0), new Vector3(100, 30, 0)],
    [new Vector3(0, 100, 0), new Vector3(100, 100, 0)],
    [
      new Vector3(0, 10, 20),
      new Vector3(100, 20, 40),
      new Vector3(200, 120, 20),
      new Vector3(300, 160, 10),
      // new Vector3(30, 60, 40),
      new Vector3(300, 10, 10),
      new Vector3(200, 60, 100),
    ],
    [new Vector3(0, 300, 0), new Vector3(100, 300, 0)],
  ]
  const line2 = [new Vector3(0, 0, 0), new Vector3(100, 0, 0), new Vector3(200, 100, 0), new Vector3(300, 150, 0)]
  makeLine(scene, line, Color3.Red())
}
