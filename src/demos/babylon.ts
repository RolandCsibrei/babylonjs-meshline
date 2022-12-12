import { Engine, Scene, ArcRotateCamera, Vector3, CubeTexture, Color4, ImageProcessingConfiguration, AxesViewer } from '@babylonjs/core'

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

  // scene.clearColor = new Color4(1, 1, 1, 1)
  // scene.autoClear = true
  // scene.autoClearDepthAndStencil = true

  // optimize scene for opaque background

  // setup ACES tone mapping for more natural colors
  // scene.imageProcessingConfiguration.toneMappingEnabled = true
  // scene.imageProcessingConfiguration.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES

  // show the inspector when pressing shift + alt + I
  // install @babylonjs/inspector and import here
  let axesViewer:AxesViewer
  scene.onKeyboardObservable.add(({ event }) => {
    if (event.ctrlKey && event.shiftKey && event.code === 'KeyI') {
      if (scene.debugLayer.isVisible()) {
        scene.debugLayer.hide()
        axesViewer?.dispose()
      } else {
        scene.debugLayer.show()
        axesViewer = new AxesViewer(scene, 2)
      }
    }
  })

  return scene
}

export const createArcRotateCamera = () => {
  const startAlpha = -Math.PI / 2
  const startBeta = -Math.PI / 2
  const startRadius = 1200
  const startPosition = new Vector3(0, 0, 0)
  // const startPosition = new Vector3(620,390, 0)
  const camera = new ArcRotateCamera('camera', startAlpha, startBeta, startRadius, startPosition, scene, true)
  camera.attachControl(canvas, false)

  camera.lowerBetaLimit = -2*Math.PI
  camera.upperBetaLimit = 2*Math.PI

  camera.lowerRadiusLimit = 2 // how close can you zoom
  camera.upperRadiusLimit = 1500 // how far out can you zoom
  camera.minZ = 0.01
  camera.maxZ = 12000

  camera.panningSensibility = 10


  return camera
}

export const createPBRSkybox = () => {
  const environmentTexture = CubeTexture.CreateFromPrefilteredData('/environments/environment-specular.env', scene)

  const skyboxMesh = scene.createDefaultSkybox(environmentTexture, true, 2000, 0.5, true)

  return skyboxMesh
}
