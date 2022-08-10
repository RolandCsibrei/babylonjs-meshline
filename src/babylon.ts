import { Engine, Scene, ArcRotateCamera, Vector3, CubeTexture, Color4, ImageProcessingConfiguration } from '@babylonjs/core'

export let canvas: HTMLCanvasElement
export let engine: Engine
export let scene: Scene
export let camera: ArcRotateCamera
let handleResize: any

export const createEngine = (hostCanvas: HTMLCanvasElement) => {
  canvas = hostCanvas
  engine = new Engine(canvas, true, {}, true)

  handleResize = () => engine.resize()
  window.addEventListener('resize', handleResize)

  return engine
}

export const createScene = () => {
  scene = new Scene(engine)

  scene.clearColor = new Color4(0.8, 0.8, 0.8, 1)

  // optimize scene for opaque background
  scene.autoClear = false
  scene.autoClearDepthAndStencil = false

  // setup ACES tone mapping for more natural colors
  scene.imageProcessingConfiguration.toneMappingEnabled = true
  scene.imageProcessingConfiguration.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES

  // show the inspector when pressing shift + alt + I
  // install @babylonjs/inspector and import here
  // scene.onKeyboardObservable.add(({ event }) => {
  //   if (event.ctrlKey && event.shiftKey && event.code === 'KeyI') {
  //     if (scene.debugLayer.isVisible()) {
  //       scene.debugLayer.hide()
  //     } else {
  //       scene.debugLayer.show()
  //     }
  //   }
  // })

  return scene
}

export const createArcRotateCamera = () => {
  const startAlpha = -1.5
  const startBeta = 1.4
  const startRadius = 100
  const startPosition = new Vector3(0, 10, 0)
  const camera = new ArcRotateCamera('camera', startAlpha, startBeta, startRadius, startPosition, scene, true)
  camera.attachControl(canvas, false)

  // Set some basic camera settings
  camera.minZ = 1 // clip at 1 meter

  camera.panningAxis = new Vector3(1, 0, 1) // pan along ground
  camera.panningSensibility = 1000 // how fast do you pan, set to 0 if you don't want to allow panning
  camera.panningOriginTarget = Vector3.Zero() // where does the panning distance limit originate from
  camera.panningDistanceLimit = 100 // how far can you pan from the origin

  camera.allowUpsideDown = false // don't allow zooming inverted
  camera.lowerRadiusLimit = 2 // how close can you zoom
  camera.upperRadiusLimit = 100 // how far out can you zoom
  camera.lowerBetaLimit = 0.5 // how high can you move the camera
  camera.upperBetaLimit = 1.4 // how low down can you move the camera

  camera.checkCollisions = true // make the camera collide with meshes
  camera.collisionRadius = new Vector3(2, 2, 2) // how close can the camera go to other meshes

  return camera
}

export const createPBRSkybox = () => {
  const environmentTexture = CubeTexture.CreateFromPrefilteredData('/environments/environment-specular.env', scene)

  const skyboxMesh = scene.createDefaultSkybox(environmentTexture, true, 1000, 0.5, true)

  return skyboxMesh
}
