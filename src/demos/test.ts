import { scene, camera } from './babylon';
import { GreasedLineBuilder } from './../LineBuilder'
import { ArcRotateCamera, Color3, Engine, RawTexture, Scene, Vector2, Vector3, VertexBuffer } from '@babylonjs/core'
import { ColorDistribution, ColorSamplingMode, GreasedLineMaterial } from './../GreasedLineMaterial'
import { GreasedLine } from './../GreasedLine'
import { segmentize } from '../lineUtils';

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
  makeLine(scene, line, new Color3(1, 1, 0))
}

export function test2(scene: Scene) {
  const engine = scene.getEngine()

  const colorList = [
    Color3.Red(),
    Color3.Yellow(),
    Color3.Green(),
    Color3.Blue(),

    Color3.Black(),
    Color3.Red(),
    Color3.Black(),
    Color3.Red(),
  ]

  const line2 = [
    new Vector3(0, 0, 0),
    new Vector3(100, 0, 0),
    new Vector3(200, 100, 0),
    // new Vector3(300, 150, 0),
    // new Vector3(300,200, 0)
  ]
  const line3 = [
    new Vector3(0, 100, 0),
    new Vector3(100, 100, 0),
    new Vector3(100, 140, 0),
    new Vector3(150, 140, 0),
    // new Vector3(200, 100, 0),
    // new Vector3(300, 150, 0),
    // new Vector3(300,200, 0)
  ]
  const line4 = [
    new Vector3(0, 0, 0),
    new Vector3(0, 100, 0),
    // new Vector3(200, 100, 0),
    // new Vector3(300, 150, 0),
    // new Vector3(300,200, 0)
  ]
  // const line2 = [new Vector3(0, 0, 0), new Vector3(100, 0, 0), new Vector3(200, 100, 0), new Vector3(300, 150, 0), new Vector3(300,200, 0)]
  // const line3 = [new Vector3(50, 50, 100), new Vector3(150, 50, 100), new Vector3(250, 150, 100), new Vector3(350, 200, 100), new Vector3(350,250, 100)]

  // const colorPointerCount = colorList.length; //s Math.floor(line2.length - 1 + line3.length - 1)
  // const colorArray = new Uint8Array(colorPointerCount * 3)
  // for (let i = 0; i < colorPointerCount; i++) {
  //   colorArray[i * 3] = colorList[i].r * 255
  //   colorArray[i * 3 + 1] = colorList[i].g * 255
  //   colorArray[i * 3 + 2] = colorList[i].b * 255
  // }

  const cs = [
    0,
    0,
    0,
    0,
    0,
    0,

    255,
    0,
    0, // 2
    255,
    0,
    0, // 3
    255,
    255,
    0, // 5
    255,
    255,
    0, // 6

    0,
    0,
    0,
    0,
    0,
    0,

    255,
    0,
    0, // 3
    255,
    0,
    0, // 3
    255,
    255,
    0, // 5
    255,
    255,
    0, // 6
    0,
    0,
    255,
    0,
    0,
    255,

    0,
    0,
    0,
    0,
    0,
    0,

    0,
    255,
    0,
    0,
    255,
    0,
  ]

  const mat = new GreasedLineMaterial('meshline', scene, {
    useMap: false,
    color: Color3.Blue(),
    opacity: 1,
    resolution: new Vector2(engine.getRenderWidth(), engine.getRenderHeight()),
    sizeAttenuation: false,
    lineWidth: 14,
    colors: cs,
    useColors: true,
  })

  const points = [line2, line3, line4]
  const ml = new GreasedLine('meshline', scene, {
    points,
    // widthCallback: (pw) => pw * 6,
  })
  ml.material = mat
}

export function test3(scene: Scene) {
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

export function testLineBuilder(scene: Scene) {
  const line1 = [new Vector3(0, 0, 0), new Vector3(100, 0, 0), new Vector3(100, 100, 0), new Vector3(200, 100, 0), new Vector3(200, 200, 0)]
  const line2 = [new Vector3(0, 0, 100), new Vector3(100, 0, 100), new Vector3(100, 100, 100), new Vector3(200, 100, 100), new Vector3(200, 200, 100)]

  const colors1 = [new Color3(0, 0, 0), new Color3(1, 0, 0), new Color3(0, 0, 0), new Color3(1, 0, 0)]
  const colors2 = [new Color3(0, 1, 0), new Color3(0, 0, 1), new Color3(1, 1, 0), new Color3(0, 0, 1)]

  const builder = new GreasedLineBuilder(scene)
  builder.addLine(line1, colors1)
  builder.addLine(line2, colors2)
  
  const offsets = []
  for(let i=0;i<line1.length+line2.length;i++) {
    offsets.push(200,0,1)
    offsets.push(200,0,1)
  }
  
  const mesh = builder.build({
    offsets
  }, {}, true)

  let x = 0
  scene.onBeforeRenderObservable.add(() => {
    const offsets:number[] = []
    for(let i=0;i<line1.length+line2.length;i++) {
      offsets.push(x,0,0)
      offsets.push(x,0,0)
    }
    // x+=1
    mesh.setOffsets(offsets)
    // const verticesArray = mesh.getVerticesData(VertexBuffer.PositionKind)
    // mesh.updateMeshPositions(verticesArray => {
    //   console.log("Update", verticesArray.length)
    //   verticesArray?.forEach((v,idx) => {
    //     if (idx%3 ===0) {

    //       verticesArray[idx] = v + 0.1
    //     }
    //   })
    // })
  })
}

export function testLineBuilderColorDistribution(scene: Scene, camera: ArcRotateCamera) {
  // const line1 = segmentize([new Vector3(-5,0,0), new Vector3(5,0,0)], 1)
  const line1 = 
  // segmentize(
    [new Vector3(0, 0, 0), new Vector3(100, 0, 0), new Vector3(100, 100, 0), new Vector3(200, 100, 0), new Vector3(200, 200, 0)]
    // ,1.1
    // )
  const colors1 = [new Color3(1, 0, 0), new Color3(1,0,1),  new Color3(0,1,1), new Color3(1, 1, 0)]

  const builder = new GreasedLineBuilder(scene)
  builder.addLine(line1, colors1, { colorDistribution: ColorDistribution.Repeat, 
    colorsSamplingMode: ColorSamplingMode.Smooth,  color: Color3.Blue() })
    
  const mesh = builder.build({}, {
    color: Color3.Blue(),
    lineWidth: 60,
    useColors: true,
  }, true)


  camera.zoomOn([mesh])
  camera.radius += 10
  camera.maxZ = 1000
  camera.minZ = 0.1

}
