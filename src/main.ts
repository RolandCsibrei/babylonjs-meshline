import { HemisphericLight, Vector3, Color3, Vector2, Buffer, Mesh } from '@babylonjs/core'
import { createEngine, createScene, createPBRSkybox, createArcRotateCamera } from './babylon'
import '@babylonjs/loaders/glTF/2.0'

import '@babylonjs/core/Debug/debugLayer'
import '@babylonjs/inspector'

import './style.css'
import { MeshLineBuilder } from './MeshLine'
import { LineBuilder } from './LineBuilder'
import { svgDemo } from './svg'

const canvas: HTMLCanvasElement = document.getElementById('app') as HTMLCanvasElement
const engine = createEngine(canvas)
const scene = createScene()

// createPBRSkybox()
createArcRotateCamera()

function createLights() {
  const light = new HemisphericLight('light', Vector3.Zero(), scene)
  light.intensity = 0.3
}

function makeLine(points: Float32Array, color: Color3) {
  const ml = LineBuilder.CreateGreasedLine('meshline', scene, {
    points,
    useMap: false,
    color,
    opacity: 1,
    resolution: new Vector2(engine.getRenderWidth(), engine.getRenderHeight()),
    sizeAttenuation: false,
    lineWidth: 10,
    widthCallback: (pw) => pw * 6,
  })
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

/**
 * Main function that is run on startup
 */
async function main() {
  createLights()
  // createLine()
  svgDemo(scene)

  await scene.debugLayer.show()

  // Start the scene
  engine.runRenderLoop(() => {
    scene.render()
  })
}

main().catch((error) => console.error(error))
