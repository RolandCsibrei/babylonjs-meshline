import { GreasedLineBuilder } from './../GraesedLineBuilder'
import { ArcRotateCamera, Color3, Engine, RawTexture, Scene, Vector2, Vector3, VertexBuffer } from '@babylonjs/core'
import { GreasedLineMaterial } from '../GreasedLineMaterial'

export function dash(scene: Scene, camera: ArcRotateCamera) {
  let line = new Float32Array(600)
  for (var j = 0; j < 200 * 3; j += 3) {
    line[j] = -30 + 0.1 * j
    line[j + 1] = 5 * Math.sin(0.01 * j)
    line[j + 2] = -20
  }

  const ls1 = GreasedLineBuilder.CreateGreasedLineSystem(
    'dashed-1',
    {
      points: line,
    },
    {
      dashArray: 1 / 10, // 1 / number of segments
      dashOffset: 0, // offset of the segment
      dashRatio: 0.1, // non-visible length of the segment
      useDash: true,
      color: Color3.Yellow(),
    },
    scene,
  )

  //

  const ls2 = GreasedLineBuilder.CreateGreasedLineSystem(
    'dashed-2',
    {
      points: line,
    },
    {
      dashArray: 1 / 10, // 1 / number of segments
      dashOffset: 0, // offset of the segment
      dashRatio: 0.5, // non-visible length of the segment
      useDash: true,
      color: Color3.Green(),
    },
    scene,
  )
  ls2.position.y = 2

  //

  const ls3 = GreasedLineBuilder.CreateGreasedLineSystem(
    'dashed-3',
    {
      points: line,
    },
    {
      dashArray: 1 / 20, // 1 / number of segments
      dashOffset: 0, // offset of the segment
      dashRatio: 0.5, // non-visible length of the segment
      useDash: true,
      color: Color3.Yellow(),
    },
    scene,
  )
  ls3.position.y = 6

  //

  const ls4 = GreasedLineBuilder.CreateGreasedLineSystem(
    'dashed-3',
    {
      points: line,
    },
    {
      dashArray: 1 / 20, // 1 / number of segments
      dashOffset: 0, // offset of the segment
      dashRatio: 0.1, // non-visible length of the segment
      useDash: true,
      color: Color3.Green(),
    },
    scene,
  )
  ls4.position.y = 8

  //

  const ls5 = GreasedLineBuilder.CreateGreasedLineSystem(
    'dashed-animated-1',
    {
      points: line,
    },
    {
      dashArray: 1 / 20, // 1 / number of segments
      dashOffset: 0, // offset of the segment
      dashRatio: 0.3, // non-visible length of the segment
      useDash: true,
      width: 40,
      color: Color3.Purple(),
    },
    scene,
  )
  ls5.position.y = 12 

  //

  const ls5mat = ls5.material as GreasedLineMaterial
  let dashOffset = 0

  scene.onBeforeRenderObservable.add(() => {
    ls5mat.setDashOffset(dashOffset)

    dashOffset += 0.001 * scene.getAnimationRatio()
  })

  camera.radius = 86
}
