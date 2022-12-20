import { GreasedLineMaterial } from './../GreasedLineMaterial'
import { GreasedLineBuilder } from './../GraesedLineBuilder'
import { ArcRotateCamera, Color3, Scene, Vector2, Vector3 } from '@babylonjs/core'

export function hello(scene: Scene, camera: ArcRotateCamera) {
  const points = []
  const data = getData()

  for (let i = 0; i < data.length; i += 2) {
    points.push(new Vector2(data[i], data[i + 1]))
  }

  let array = []

  for (let i = 0; i < 2500; i++) {
    const p = getPoint(points, i / 2500)
    array.push(new Vector3(p.x / 100 - 8, 0, p.y / 100))
  }
  bLine(array, scene, 0.7)

  array = []
  for (let i = 0; i < 2500; i++) {
    const p = getPoint(points, i / 2500)
    array.push(new Vector3(p.x / 100 - 8, 0, p.y / 100 + 10))
  }
  bLine(array, scene, 0.9)

  array = []
  for (let i = 0; i < 2500; i++) {
    const p = getPoint(points, i / 2500)
    array.push(new Vector3(p.x / 100 - 8, 0, p.y / 100 - 10))
  }
  const bl =  bLine(array, scene, 0.5)

  //


  camera.target = new Vector3(0, 0, 0)
  camera.alpha = -1.57
  camera.beta = 0.6
  camera.radius = 50
  camera.minZ = 0.01
  camera.maxZ = 10000
}

function bLine(points: Vector3[], scene: Scene, i: number) {
  const line = GreasedLineBuilder.CreateGreasedLineSystem(
    'test',
    {
      points,
    },
    {
      color: Color3.FromHSV(360 * Math.random(), 0.25 + 1 * Math.random(), 0.9 + 0.1 * Math.random()),
      width: 100,
      alphaTest: 1,
      visibility: 1,
      dashArray: 2, // always has to be the double of the line
      dashOffset: 0, // start the dash at zero
      dashRatio: i, // visible length range min: 0.99, max: 0.5 // aka snake size
      useDash: true,
    },
    scene,
  )

  let dashOffset = 0
  const mat = line.material as GreasedLineMaterial
  scene.onBeforeRenderObservable.add(() => {
    dashOffset -= 0.007
    mat.setDashOffset(dashOffset)
  })

  return line
}

function getPoint(points: Vector2[], t: number, optionalTarget = new Vector2()) {
  const point = optionalTarget

  const p = (points.length - 1) * t

  const intPoint = Math.floor(p)
  const weight = p - intPoint

  const p0 = points[intPoint === 0 ? intPoint : intPoint - 1]
  const p1 = points[intPoint]
  const p2 = points[intPoint > points.length - 2 ? points.length - 1 : intPoint + 1]
  const p3 = points[intPoint > points.length - 3 ? points.length - 1 : intPoint + 2]

  point.set(CatmullRom(weight, p0.x, p1.x, p2.x, p3.x), CatmullRom(weight, p0.y, p1.y, p2.y, p3.y))

  return point
}

function CatmullRom(t: number, p0: number, p1: number, p2: number, p3: number) {
  const v0 = (p2 - p0) * 0.5
  const v1 = (p3 - p1) * 0.5
  const t2 = t * t
  const t3 = t * t2
  return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1
}

function getData() {
  return [
    60, 303, 87, 374, 153, 426, 244, 457, 313, 468, 395, 493, 476, 551, 515, 635, 524, 720, 516, 784, 464, 817, 380, 791, 352, 709, 333,
    582, 336, 505, 339, 371, 366, 213, 387, 212, 435, 366, 486, 470, 533, 508, 569, 487, 578, 428, 564, 350, 546, 264, 542, 194, 541, 124,
    566, 42, 600, 19, 640, 82, 697, 326, 717, 387, 733, 414, 789, 469, 808, 533, 792, 584, 752, 573, 712, 503, 715, 415, 722, 317, 742, 249,
    779, 226, 826, 239, 871, 302, 906, 364, 957, 432, 1009, 540, 1033, 619, 1064, 723, 1070, 804, 1060, 828, 1030, 831, 988, 786, 954, 686,
    934, 607, 918, 511, 918, 419, 918, 336, 948, 206, 977, 148, 1014, 139, 1073, 175, 1176, 322, 1249, 492, 1289, 628, 1295, 727, 1280, 760,
    1238, 748, 1201, 691, 1156, 582, 1135, 487, 1113, 389, 1107, 287, 1119, 154, 1139, 78, 1179, 36, 1198, 34, 1242, 88, 1318, 260, 1356,
    336, 1380, 394, 1388, 325, 1398, 257, 1427, 219, 1458, 208, 1493, 214, 1528, 254, 1555, 312, 1570, 355, 1581, 433, 1577, 582, 1534, 635,
    1484, 635, 1436, 585, 1428, 514, 1449, 452, 1490, 406, 1536, 387, 1600, 394, 1691, 431, 1729, 450, 1795, 479, 1854, 498, 1927, 489,
  ]
}
