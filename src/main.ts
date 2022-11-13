import { HemisphericLight, Vector3, Color3, Vector2, Buffer, Mesh } from '@babylonjs/core'
import { createEngine, createScene, createPBRSkybox, createArcRotateCamera } from './babylon'
import '@babylonjs/loaders/glTF/2.0'

import '@babylonjs/core/Debug/debugLayer'
import '@babylonjs/inspector'

import './style.css'
import { MeshLineBuilder } from './MeshLine'
import { svgDemo } from './svg'
import { GreasedLine, GreasedLineMaterial } from './LineBuilder'

const canvas: HTMLCanvasElement = document.getElementById('app') as HTMLCanvasElement
const engine = createEngine(canvas)
const scene = createScene()

// createPBRSkybox()
createArcRotateCamera()

function createLights() {
  const light = new HemisphericLight('light', Vector3.Zero(), scene)
  light.intensity = 0.3
}

function makeLine(points: Float32Array | Vector3[] | Vector3[][], color: Color3) {
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

function createLine() {
  let line = new Float32Array(600)
  for (var j = 0; j < 200 * 3; j += 3) {
    line[j] = -30 + 0.1 * j
    line[j + 1] = 5 * Math.sin(0.01 * j)
    line[j + 2] = -20
  }
  makeLine(line, new Color3(1, 0, 0))

  line = new Float32Array(600)
  for (var j = 0; j < 200 * 3; j += 3) {
    line[j] = -30 + 0.1 * j
    line[j + 1] = 5 * Math.cos(0.02 * j)
    line[j + 2] = -10
  }
  makeLine(line, new Color3(0, 1, 0))

  line = new Float32Array(600)
  for (var j = 0; j < 200 * 3; j += 3) {
    line[j] = -30 + 0.1 * j
    line[j + 1] = 5 * Math.sin(0.01 * j) * Math.cos(0.005 * j)
    line[j + 2] = 0
  }
  makeLine(line, new Color3(0, 0, 1))

  line = new Float32Array(600)
  for (var j = 0; j < 200 * 3; j += 3) {
    line[j] = -30 + 0.1 * j
    line[j + 1] = 0.02 * j + 5 * Math.sin(0.01 * j) * Math.cos(0.005 * j)
    line[j + 2] = 10
  }
  makeLine(line, new Color3(1, 0, 1))

  line = new Float32Array(600)
  for (var j = 0; j < 200 * 3; j += 3) {
    line[j] = -30 + 0.1 * j
    line[j + 1] = Math.exp(0.005 * j)
    line[j + 2] = 20
  }
  makeLine(line, new Color3(1, 1, 0))
}

function test() {
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
  const line2 = [
    new Vector3(0, 0, 0),
    new Vector3(100, 0, 0),
    new Vector3(200, 100, 0),
    new Vector3(300, 150, 0),
  ]
  makeLine(line, Color3.Red())
}

/**
 * Main function that is run on startup
 */
async function main() {
  createLights()
  createLine()
  svgDemo(scene)
  // test()

  await scene.debugLayer.show()

  // Start the scene
  engine.runRenderLoop(() => {
    scene.render()
  })
}

main().catch((error) => console.error(error))
