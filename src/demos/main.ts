import { HemisphericLight, Vector3, Color3, Vector2, Buffer, Mesh, RawTexture, Engine } from '@babylonjs/core'
import { createEngine, createScene, createPBRSkybox, createArcRotateCamera } from './babylon'
import '@babylonjs/loaders/glTF/2.0'

import '@babylonjs/core/Debug/debugLayer'
import '@babylonjs/inspector'

import './style.css'
import { svgDemo } from './svg'
import { GreasedLine } from '../GreasedLine'
import { GreasedLineMaterial } from '../GreasedLineMaterial'
import { test, test2, test3, testLineBuilder } from './test'
import { boxDemo } from './box'
import { pbrDemo } from './pbr'
import { boxDemo2 } from './box2'
import { spectrumAnalyzer } from './spectrumAnalyzer'
import { raycast } from './raycast'

const canvas: HTMLCanvasElement = document.getElementById('app') as HTMLCanvasElement
const engine = createEngine(canvas)
const scene = createScene()

// createPBRSkybox()
const camera = createArcRotateCamera()

function createLights() {
  const light = new HemisphericLight('light', Vector3.Zero(), scene)
  light.intensity = 0.3
}



/**
 * Main function that is run on startup
 */
async function main() {
  createLights()
  
  spectrumAnalyzer(scene, camera)
  // testLineBuilder(scene)
  // test(scene)
  // svgDemo(scene)
  // boxDemo(scene, camera)
  // boxDemo2(scene, camera)
  // pbrDemo(scene, camera)
  // raycast(scene, camera)

  engine.runRenderLoop(() => {
    scene.render()
  })
}

main().catch((error) => console.error(error))
