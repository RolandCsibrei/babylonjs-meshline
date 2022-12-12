import { GreasedLine, GreasedLinePoints, Xyz } from './../GreasedLine'
import {
  ArcRotateCamera,
  Axis,
  Color3,
  Color4,
  CubeTexture,
  GlowLayer,
  Material,
  MeshBuilder,
  PointLight,
  Scalar,
  Scene,
  ShaderMaterial,
  StandardMaterial,
  Texture,
  Vector3,
} from '@babylonjs/core'
import { circle } from '../lineUtils'
import { GreasedLinePBRMaterial } from '../GreasedLinePBRMaterial'

interface FlyingLine {
  lineMesh: GreasedLine
  material: GreasedLinePBRMaterial
  origin: Vector3
  direction: Vector3
  length: number
  points: Xyz[]
  visibility: number
  visibilityDirection: number
  speed: number
  visibilitySpeed: number
  opacity: number
}

const NUM_OF_LINES = 30
const EARTH_DIAMETER = 20

export function flyingLines(scene: Scene, camera: ArcRotateCamera) {
  const engine = scene.getEngine()

  const skybox = createSkyBox()

  const gl = new GlowLayer('glow', scene, {
    camera,
    blurKernelSize: 128,
  })
  gl.intensity = 2

  const lines = new Map<string, FlyingLine>()
  for (let i = 0; i < NUM_OF_LINES; i++) {
    const length = Scalar.RandomRange(10, 60)
    const { points, cnt } = getPoints(length)
    const lineMesh = drawLine(points)
    const material = new GreasedLinePBRMaterial('line', scene, {
      lineWidth: 2,
      visibility: 0,
      alphaTest: 0.001,
    })

    const rotation = new Vector3(Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI)
    lineMesh.rotation = rotation

    material.backFaceCulling = false

    material.emissiveColor = new Color3(1, 1, 0)
    lineMesh.material = material

    const speed = Scalar.RandomRange(0.005, 0.01)
    const visibilitySpeed = speed / 2

    const flyingLine: FlyingLine = {
      lineMesh,
      material,
      origin: new Vector3(0, 0, 0),
      direction: new Vector3(0, 0, -1),
      length,
      points,
      visibility: 0,
      visibilitySpeed,
      visibilityDirection: 1,
      speed,
      opacity: 1,
    }

    gl.referenceMeshToUseItsOwnMaterial(lineMesh)

    lines.set(`line-${i}`, flyingLine)
  }

  const earthMesh = drawEarth()

  camera.target = new Vector3(0, 0, 0)
  camera.alpha = -1.98
  camera.beta = 0.75
  camera.radius = 32.85
  camera.lowerRadiusLimit = 30
  camera.upperRadiusLimit = 60
  camera.minZ = 0.01

  setTimeout(() => {
    animate()
  }, 2000)

  function animate() {
    let time = 0
    scene.onBeforeRenderObservable.add(() => {
      lines.forEach((l) => {
        l.lineMesh.rotate(Axis.Z, l.direction.z * l.speed * scene.getAnimationRatio())
        l.lineMesh.rotate(Axis.Y, l.direction.y * l.speed * scene.getAnimationRatio())
        l.lineMesh.rotate(Axis.X, l.direction.x * l.speed * scene.getAnimationRatio())
        l.material.setParameters({
          visibility: l.visibility,
        })

        l.material.alpha = l.opacity
        l.material.alphaMode = Material.MATERIAL_ALPHABLEND

        l.visibility += l.visibilityDirection * l.visibilitySpeed * scene.getAnimationRatio()

        if (l.visibility > 1) {
          l.opacity -= 0.01 * scene.getAnimationRatio()
          if (l.opacity < 0) {
            l.opacity = 1
            l.visibility = 0
          } else {
            l.visibilityDirection = -1
          }
        }

        if (l.visibility < -0.2) {
          l.visibility = 0
          l.visibilityDirection = 1
        }

        console.log(l.visibility, l.opacity, l.visibilityDirection)
      })
      time += 1
      earthMesh.rotate(Axis.Y, 0.001 * scene.getAnimationRatio())
    })
  }

  function createSkyBox() {
    const skybox = MeshBuilder.CreateBox('universe', { size: 200.0 }, scene) //создаем гигантский куб

    const skyboxMaterial = new StandardMaterial('universe', scene) //создаем материал
    skyboxMaterial.backFaceCulling = false //Включаем видимость меша изнутри
    skyboxMaterial.reflectionTexture = new CubeTexture('textures/universe/universe', scene) //задаем текстуру скайбокса как текстуру отражения
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE //настраиваем скайбокс текстуру так, чтобы грани были повернуты правильно друг к другу
    skyboxMaterial.disableLighting = true //отключаем влияние света
    skybox.material = skyboxMaterial //задаем матерал мешу
    return skybox
  }

  function drawEarth() {
    var lightSourceMesh = new PointLight('Omni', new Vector3(0, 0, 0), scene)
    lightSourceMesh.diffuse = new Color3(0.5, 0.5, 0.5)

    const earth = MeshBuilder.CreateSphere('earth', { diameter: EARTH_DIAMETER })

    earth.rotation.z = Math.PI
    earth.applyDisplacementMap('/textures/earth-height.png', 0, 1)

    var planetMat = new ShaderMaterial(
      'planetMat',
      scene,
      {
        vertex: './shaders/demo/earth',
        fragment: './shaders/demo/earth',
      },
      {
        attributes: ['position', 'normal', 'uv'],
        uniforms: ['world', 'worldView', 'worldViewProjection', 'diffuseTexture', 'nightTexture'],
      },
    )

    var diffuseTexture = new Texture('textures/earth-diffuse.jpg', scene)
    var nightTexture = new Texture('textures/earth-night-o2.png', scene)

    planetMat.setVector3('vLightPosition', lightSourceMesh.position)
    planetMat.setTexture('diffuseTexture', diffuseTexture)
    planetMat.setTexture('nightTexture', nightTexture)

    planetMat.backFaceCulling = false
    earth.material = planetMat
    return earth
  }

  function drawLine(points: GreasedLinePoints) {
    const line = new GreasedLine('flying-line', scene, {
      points,
      widthCallback: (pw) => {
        if (pw < points.length * 0.02) return [10, 10]
        if (pw < points.length * 0.05) return [8, 8]
        if (pw < points.length * 0.1) return [7, 7]
        if (pw < points.length * 0.15) return [5, 5]
        if (pw < points.length * 0.2) return [3, 3]
        if (pw < points.length * 0.3) return [2, 2]
        return [1, 1]
      },
    })

    return line
  }

  function getPoints(length: number = 40) {
    const circlePoints = circle(EARTH_DIAMETER / 1.9, length, 0.05)
    // for (let i = 0; i < circlePoints.length; i++) {
    //   circlePoints[i].z += i / 10
    // }
    return { points: circlePoints, cnt: circlePoints.length }
  }
}
