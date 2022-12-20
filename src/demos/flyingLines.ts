import { scene } from './babylon'
import { GreasedLine, GreasedLinePoints, Xyz } from './../GreasedLine'
import {
  ArcRotateCamera,
  Axis,
  Color3,
  Color4,
  CubeTexture,
  GlowLayer,
  Material,
  Mesh,
  MeshBuilder,
  PointLight,
  Scalar,
  Scene,
  ShaderMaterial,
  Sprite,
  SpriteManager,
  StandardMaterial,
  Texture,
  Vector2,
  Vector3,
  VolumetricLightScatteringPostProcess,
} from '@babylonjs/core'
import { circle } from '../lineUtils'
import { GreasedLinePBRMaterial } from '../GreasedLinePBRMaterial'
import { FireProceduralTexture } from '@babylonjs/procedural-textures/fire'

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

const config = {
  EARTH_DIAMETER: 50,
  EARTH_V: 300, // number of vertices
  MOON_DIAMETER: 25,
  ENV_H: 2, // atmosphere height
  SUN_DIAMETER: 20,
  MOON_ROTATION: 0.005,
  DUST: 1000,
}

export function flyingLines(scene: Scene, camera: ArcRotateCamera) {
  const engine = scene.getEngine()

  const skybox = createSkyBox()
  const { earth, moon, sun, godrays } = setupCosmos(camera)

  const gl = new GlowLayer('glow', scene, {
    camera,
    blurKernelSize: 128,
  })
  gl.intensity = 2

  const lines = new Map<string, FlyingLine>()
  for (let i = 0; i < NUM_OF_LINES; i++) {
    const length = Scalar.RandomRange(10, 60)
    const { points, cnt } = getPoints(config.EARTH_DIAMETER, length)
    const lineMesh = drawLine(points)
    const material = new GreasedLinePBRMaterial('line', scene, {
      width: 2,
      visibility: 0,
      alphaTest: 0.001,
    })
    lineMesh.position = earth.position

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

        l.material.setVisibility(l.visibility)

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
      })
      time += 1
    })
  }

  function createSkyBox() {
    const skybox = MeshBuilder.CreateBox('universe', { size: 10000.0 }, scene)

    const skyboxMaterial = new StandardMaterial('universe', scene)
    skyboxMaterial.backFaceCulling = false
    skyboxMaterial.reflectionTexture = new CubeTexture('textures/universe/universe', scene)
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE
    skyboxMaterial.disableLighting = true
    skybox.material = skyboxMaterial
    return skybox
  }

  function setupCosmos(camera: ArcRotateCamera) {
    // lights
    const lightSourceMesh = new PointLight('Omni', new Vector3(0, 0, 0), scene)
    lightSourceMesh.diffuse = new Color3(0.5, 0.5, 0.5)

    // Earth
    const earth = MeshBuilder.CreateSphere('earth', { segments: config.EARTH_V, diameter: config.EARTH_DIAMETER }, scene)
    earth.position = new Vector3(-250.0, -10, 0)

    earth.rotation.z = Math.PI
    earth.applyDisplacementMap('/textures/earth-height.png', 0, 1)

    const earthMat = new ShaderMaterial(
      'earth-mat',
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

    const diffuseTexture = new Texture('textures/earth-diffuse.jpg', scene)
    const nightTexture = new Texture('textures/earth-night-o2.png', scene)

    earthMat.setVector3('vLightPosition', lightSourceMesh.position)
    earthMat.setTexture('diffuseTexture', diffuseTexture)
    earthMat.setTexture('nightTexture', nightTexture)

    earthMat.backFaceCulling = false
    earth.material = earthMat

    // Moon

    const moon = MeshBuilder.CreateSphere('moon', { segments: 25, diameter: config.MOON_DIAMETER }, scene)
    moon.position = new Vector3(-102, 0, 0)

    const moonMat = new StandardMaterial('moonMat', scene)
    moonMat.diffuseTexture = new Texture('textures/moon.jpg', scene)
    moonMat.bumpTexture = new Texture('textures/moon_bump.jpg', scene)
    moonMat.specularTexture = new Texture('textures/moon_spec.jpg', scene)

    moon.material = moonMat

    // camera
    camera.alpha = -Math.PI / 2
    camera.beta = (3 * Math.PI) / 7
    camera.fov = 1.5
    camera.lowerBetaLimit = 0.5
    camera.upperBetaLimit = 2.5
    camera.lowerRadiusLimit = 1
    camera.position = new Vector3(55, 5, 55)
    camera.target = earth.position
    camera.radius = 50
    camera.minZ = 0.01

    // Atmosphere
    const cloudsMaterial = new ShaderMaterial(
      'cloudsMaterial',
      scene,
      {
        vertex: './shaders/demo/clouds',
        fragment: './shaders/demo/clouds',
      },
      {
        attributes: ['position', 'normal', 'uv'],
        uniforms: ['world', 'worldView', 'worldViewProjection', 'cloudsTexture', 'lightPosition', 'cameraPosition'],
        needAlphaBlending: true,
      },
    )

    const cloudsTexture = new Texture('textures/earth-c.jpg', scene)

    cloudsMaterial.setTexture('cloudsTexture', cloudsTexture)
    cloudsMaterial.setVector3('cameraPosition', Vector3.Zero())

    const cloudsMesh = MeshBuilder.CreateSphere(
      'clouds',
      { segments: config.EARTH_V, diameter: config.EARTH_DIAMETER + config.ENV_H, updatable: true },
      scene,
    )
    cloudsMesh.material = cloudsMaterial
    cloudsMesh.rotation.z = Math.PI
    cloudsMesh.parent = earth

    // Sun
    const sun = MeshBuilder.CreateSphere('sun', { segments: 15, diameter: config.SUN_DIAMETER, updatable: true }, scene)
    const sunMaterial = new StandardMaterial('sunMaterial', scene)
    const fireTexture = new FireProceduralTexture('fire', 128, scene)
    fireTexture.fireColors = [
      new Color3(1.0, 0.7, 0.3),
      new Color3(1.0, 0.7, 0.3),
      new Color3(1.0, 0.5, 0.0),
      new Color3(1.0, 0.5, 0.0),
      new Color3(1.0, 1.0, 1.0),
      new Color3(1.0, 0.5, 0.0),
    ]

    sunMaterial.emissiveTexture = fireTexture

    sun.material = sunMaterial
    sun.parent = lightSourceMesh

    // Godrays
    const godrays = new VolumetricLightScatteringPostProcess('godrays', 1.0, camera, sun, 100, Texture.BILINEAR_SAMPLINGMODE, engine, false)

    godrays.exposure = 0.95
    godrays.decay = 0.96815
    godrays.weight = 0.78767
    godrays.density = 1.0

    // Space dust
    var spriteManagerDust = new SpriteManager('dustManager', 'textures/particle32.png', config.DUST, 32, scene)

    for (var i = 0; i < config.DUST; i++) {
      var dust = new Sprite('dust', spriteManagerDust)
      dust.position.x = Math.random() * 500 - 250
      dust.position.z = Math.random() * 500 - 250
      dust.position.y = Math.random() * 150 - 75
      dust.size = 0.4
    }

    var moonEllipticParams = new MoonElipticalParams(
      config.MOON_ROTATION,
      1.5,
      0,
      earth.position.x,
      earth.position.y,
      earth.position.z,
      Vector2.Distance(new Vector2(moon.position.x, moon.position.z), new Vector2(earth.position.x, earth.position.z)),
    )

    function getNewEllipticPosition(moonEllipticParams: MoonElipticalParams) {
      moonEllipticParams.angle += moonEllipticParams.delta
      return new Vector3(
        moonEllipticParams.x + moonEllipticParams.r * Math.sin(moonEllipticParams.angle),
        moonEllipticParams.y,
        moonEllipticParams.z + moonEllipticParams.focus * moonEllipticParams.r * Math.cos(moonEllipticParams.angle),
      )
    }

    scene.onBeforeRenderObservable.add(() => {
      camera.alpha += 0.005 * scene.getAnimationRatio()

      earth.rotation.y += 0.001 * scene.getAnimationRatio()

      const shaderMaterial = scene.getMaterialByName('cloudsMaterial') as ShaderMaterial
      if (shaderMaterial) {
        shaderMaterial.setVector3('cameraPosition', scene.activeCamera!.position)
        shaderMaterial.setVector3('lightPosition', lightSourceMesh.position)
      }

      moon.position = getNewEllipticPosition(moonEllipticParams)
      moon.rotation.y += 0.006 * scene.getAnimationRatio()
    })

    return { earth, moon, sun, godrays }
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

  function getPoints(diameter: number, length: number = 40) {
    const circlePoints = circle(diameter / 1.9, length, 0.05)
    // for (let i = 0; i < circlePoints.length; i++) {
    //   circlePoints[i].z += i / 10
    // }
    return { points: circlePoints, cnt: circlePoints.length }
  }
}

class MoonElipticalParams {
  constructor(
    public delta: number,
    public focus: number,
    public angle: number,
    public x: number,
    public y: number,
    public z: number,
    public r: number,
  ) {}
}
