import {
  Analyser,
  ArcRotateCamera,
  Color3,
  Color4,
  Engine,
  RawTexture,
  Scene,
  Sound,
  Vector2,
  Vector3,
} from '@babylonjs/core'
import { GreasedLineMaterial } from './../GreasedLineMaterial'
import { GreasedLine } from './../GreasedLine'

export function spectrumAnalyzer(scene: Scene, camera: ArcRotateCamera) {
  const engine = scene.getEngine()

  scene.clearColor = new Color4(0, 0, 0, 1)

  const numOfBars = 256
  const barWidth = 3

  const analyzerPoints = []
  const offsets = []
  for (let i = 0; i < numOfBars; i++) {
    analyzerPoints.push(new Vector3(i * barWidth, 0, 0))
    offsets.push(0, 0, 0, 0, 0, 0)
  }
  const wavePoints = [...analyzerPoints]

  const analyzerLine = new GreasedLine(
    'analyzer-line',
    scene,
    {
      points: analyzerPoints,
    },
    true,
  )

  const waveLine = new GreasedLine(
    'wave-line',
    scene,
    {
      points: wavePoints,
      offsets,
    },
    true,
  )
  waveLine.position = new Vector3(0, 30, 0)

  const textureColors = new Uint8Array([255, 0, 0, 255, 255, 0, 0, 255, 0])
  const texture = new RawTexture(
    textureColors,
    textureColors.length / 3,
    1,
    Engine.TEXTUREFORMAT_RGB,
    scene,
    false,
    true,
    Engine.TEXTURE_LINEAR_NEAREST
  )
  texture.wrapU = RawTexture.WRAP_ADDRESSMODE
  texture.name = "analyzer-texture"

  const analyzerMaterial = new GreasedLineMaterial('analyzerMaterial', scene, {
    useMap: true,
    map: texture,
    opacity: 1,
    sizeAttenuation: false,
    width: 14,
  })

  const waveMaterial = new GreasedLineMaterial('waveMaterial', scene, {
    color: Color3.Red(),
    sizeAttenuation: true,
    width: 24,
    dashArray: 1 / numOfBars,
    dashOffset: 0,
    dashRatio: 0.4,
    useDash: true,
    alphaTest: 1,
  })

  analyzerLine.material = analyzerMaterial
  waveLine.material = waveMaterial

  camera.zoomOn([analyzerLine])
  camera.radius = 530
  camera.detachControl()

  _drawGrid()
  _startAudio()
  _createAnalyzer()

  function _startAudio() {
    const music = new Sound('Music', 'mp3/glitch-flight-track.mp3', scene, null, {
      loop: true,
      autoplay: true,
    })
  }

  function _drawGrid() {
    const points:Vector3[][] = []
    for(let i=0;i<numOfBars;i+=4) {
      points.push([new Vector3(i*barWidth,-200,0), new Vector3(i*barWidth,200,0)])
    }
    for(let i=0;i<numOfBars;i+=2) {
      points.push([new Vector3(0,i*barWidth-200,0), new Vector3(barWidth * numOfBars,i*barWidth-200,0)])
    }

    const grid = new GreasedLine("grid", scene, {
      points
    })

    const gridMaterial = new GreasedLineMaterial("gridMaterail", scene, {
      color: new Color3(0, 0, 0.6),
    })

    grid.material = gridMaterial

  }

  function _createAnalyzer() {
    if (Engine.audioEngine) {
      const analyser = new Analyser(scene)
      Engine.audioEngine.connectToAnalyser(analyser)
      analyser.BARGRAPHAMPLITUDE = 256
      analyser.FFT_SIZE = 512
      analyser.SMOOTHING = 0.7

      const uvOffset = new Vector2(0, 0)

      scene.onBeforeRenderObservable.add(() => {
        const frequencies = analyser.getByteFrequencyData()
        const widths = []
        const offsets = []
        for (let i = 0; i < numOfBars; i++) {
          const normalizedFrequency = frequencies[i]
          widths.push(normalizedFrequency, normalizedFrequency / 2)
          offsets.push(0, normalizedFrequency, 0, 0, normalizedFrequency, 0)
        }
        analyzerLine.setWidth(widths)
        waveLine.setOffsets(offsets)

        analyzerMaterial.setParameters({
          uvOffset,
        })
        uvOffset.x += 0.01 * scene.getAnimationRatio()
      })
    } else {
      console.error('No audio engine.')
    }
  }
}
