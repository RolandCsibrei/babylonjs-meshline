import {
  Analyser,
  ArcRotateCamera,
  Color3,
  Color4,
  Engine,
  MeshBuilder,
  RawTexture,
  Scene,
  Sound,
  StandardMaterial,
  Vector2,
  Vector3,
} from '@babylonjs/core'
import { GreasedLineMaterial } from './../GreasedLineMaterial'
import { GreasedLine } from './../GreasedLine'

export function spectrumAnalyzerWaves(scene: Scene, camera: ArcRotateCamera) {
  const engine = scene.getEngine()

  scene.clearColor = new Color4(0, 0, 0, 1)

  const numOfBars = 256
  const barWidth = 3

  const offsets: number[] = []

  const textureColors = new Uint8Array([255, 0, 0, 255, 255, 0, 0, 255, 0])
  const texture = new RawTexture(
    textureColors,
    textureColors.length / 3,
    1,
    Engine.TEXTUREFORMAT_RGB,
    scene,
    false,
    true,
    Engine.TEXTURE_LINEAR_NEAREST,
  )
  texture.wrapU = RawTexture.WRAP_ADDRESSMODE
  texture.name = 'analyzer-texture'

  camera.radius = 530
  // camera.detachControl()
  //
  const gridLines = _drawGrid(50, 10, 10, true, true)
  _startAudio()
  _createAnalyzer()

  function _startAudio() {
    const music = new Sound('Music', 'mp3/glitch-flight-track.mp3', scene, null, {
      loop: true,
      autoplay: true,
    })
  }

  function _drawGrid(count: number, dx: number, dy: number, centerX = true, centerY = true) {
    const points: Vector3[][] = []
    for (let i = 0; i <= count; i++) {
      points.push([new Vector3(i * dx, 0, 0), new Vector3(i * dx, dy * count, 0)])
      offsets.push(0, 0, 0, 0, 0, 0)
      offsets.push(0, 0, 0, 0, 0, 0)

    }
    for (let i = 0; i <= count; i++) {
      points.push([new Vector3(0, i * dy, 0), new Vector3(dx * count, i * dy, 0)])
      offsets.push(0, 0, 0, 0, 0, 0)
      offsets.push(0, 0, 0, 0, 0, 0)
    }

    if (centerX) {
      for (let i = 0; i <= count * 2 + 1; i++) {
        points[i][0].x -= (count * dx) / 2
        points[i][1].x -= (count * dx) / 2
      }
    }

    if (centerY) {
      for (let i = 0; i <= count * 2 + 1; i++) {
        points[i][0].y -= (count * dy) / 2
        points[i][1].y -= (count * dy) / 2
      }
    }

    const m = MeshBuilder.CreateBox('box', { size: count * dx })
    const mat = new StandardMaterial('mat')
    m.material = mat
    m.visibility = 0.5
    const grid = new GreasedLine('grid', scene, {
      points,
      offsets,

    }, true)

    const gridMaterial = new GreasedLineMaterial('gridMaterail', scene, {
      color: new Color3(0, 0, 1),
      width: 10,
    })

    grid.material = gridMaterial

    return grid
  }

  function _createAnalyzer() {
    if (Engine.audioEngine) {
      const analyser = new Analyser(scene)
      Engine.audioEngine.connectToAnalyser(analyser)
      analyser.BARGRAPHAMPLITUDE = 256
      analyser.FFT_SIZE = 512
      analyser.SMOOTHING = 0.7

      scene.onBeforeRenderObservable.add(() => {
        const frequencies = analyser.getByteFrequencyData()
        const widths = []
        // for (let i = 0; i < numOfBars; i++) {
        //   const normalizedFrequency = frequencies[i]
        //   widths.push(normalizedFrequency, normalizedFrequency / 2)
        //   offsets.push(0, normalizedFrequency*10, 0, 0, normalizedFrequency*10, 0)
        // }
        for (let i=0;i<offsets.length;i++) {
          offsets[i]+=0.1
        }
        gridLines.setOffsets(offsets)
      })
    } else {
      console.error('No audio engine.')
    }
  }
}
