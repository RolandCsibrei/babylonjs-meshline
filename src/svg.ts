'use strict'
import { ArcRotateCamera, Axis, Color3, Engine, Material, Mesh, RawTexture, Scene, Texture, Vector2, Vector3 } from '@babylonjs/core'
import { GreasedLine } from './GreasedLine'
import { GreasedLineMaterial } from './GreasedLineMaterial'
import SvgParser from 'svg-path-parser'

const colors = [
  0xed6a5a, 0xf4f1bb, 0x9bc1bc, 0x5ca4a9, 0xe6ebe0, 0xf0b67f, 0xfe5f55, 0xd6d1b1, 0xc7efcf, 0xeef5db, 0x50514f, 0xf25f5c, 0xffe066,
  0x247ba0, 0x70c1b3,
]

interface Country {
  name: string
  positions: number[]
}

export function svgDemo(scene: Scene) {
  const engine = scene.getEngine()
  const map = new Texture('assets/stroke.png')

  const materials: GreasedLineMaterial[] = []

  readSVG().then((s) => {
    drawSVG(s)

    const camera = scene.activeCamera as ArcRotateCamera

    let v = 0
    const uvOffset = new Vector2(0, 0)
    scene.onBeforeRenderObservable.add(() => {
      materials.forEach((m) => {
        m.setParameters({
          visibility: v,
          // uvOffset

        })
      })
      v += scene.getAnimationRatio() * 0.001
      uvOffset.x += scene.getAnimationRatio() * 0.001
    })

    camera.position = new Vector3(200, 0, 0)
    camera.target = new Vector3(200, 0, 0)
    camera.radius = 1400
    camera.beta = Math.PI * 1.5
  })

  function makeLine(name: string, points: Float32Array | Float32Array[] | Vector3[][], colors: Texture) {
    const gl = new GreasedLine(name, scene, {
      points,
    widthCallback: (pw) => pw * 0.2,

    })

    const material = new GreasedLineMaterial('line', scene, {
      map,
      useMap: false,
      color: Color3.Black(), // new Color3(colors[]),
      colors,
      opacity: 1,
      resolution: new Vector2(engine.getRenderWidth(), engine.getRenderHeight()),
      sizeAttenuation: true,
      lineWidth: 1,
      repeat: new Vector2(10, 1),
      
      visibility: 1,
    })

    gl.material = material
    materials.push(material)

    return gl
  }

  function readSVG(): Promise<string> {
    return new Promise(function (resolve) {
      const ajax = new XMLHttpRequest()
      ajax.open('GET', 'assets/worldLow.svg', true)
      ajax.send()
      ajax.addEventListener('load', function (_) {
        resolve(ajax.responseText)
      })
    })
  }

  function drawSVG(source: string) {
    const countries: Country[] = []
    const parser = new DOMParser()
    const doc = parser.parseFromString(source, 'image/svg+xml')

    let x: number, y: number, ox: number, oy: number, px: number, py: number

    const pathNodes = doc.querySelectorAll('path')
    pathNodes.forEach((pathNode) => {
      const path = pathNode.getAttribute('d')!
      const parsed = SvgParser.parseSVG(path)
      let pos: Country

      function addPos(x: number, y: number) {
        pos.positions.push(x, y, 0)
      }

      parsed.forEach((segment) => {
        if (segment.code === 'M') {
          x = segment.x
          y = segment.y
          ox = x
          oy = y
          if (pos) {
            countries.push(pos)
          }

          pos = {
            name: pathNode.id,
            positions: [],
          }

          addPos(x, y)
        } else if (segment.code === 'l') {
          x = px + segment.x
          y = py + segment.y
          addPos(x, y)
        } else if (segment.code === 'L') {
          x = segment.x
          y = segment.y
          addPos(x, y)
        } else if (segment.code === 'v') {
          x = px
          y = py + segment.y
          addPos(x, y)
        } else if (segment.code === 'h') {
          x = px + segment.x
          y = py
          addPos(x, y)
        } else if (segment.code === 'H') {
          x = segment.x
          y = py
          addPos(x, y)
        } else if (segment.code === 'V') {
          x = px
          y = segment.y
          addPos(x, y)
        } else if (segment.command === 'closepath') {
          x = ox
          y = oy
          addPos(x, y)
          countries.push(pos)
        }
        px = x
        py = y
      })
    })

    // const greasedLines: GreasedLine[] = []
    // const float32Arrays: Float32Array[] = []
    // countries.forEach(function (c) {
    //     float32Arrays.push(new Float32Array(c.positions))
    // })
    // const greasedLine = makeLine("lajna", float32Arrays);
    // greasedLines.push(greasedLine)

    const lineposAll: Vector3[][] = []
    let ids = [...new Set(countries.map((p) => p.name))]
    // const ids = ['RU']

    // const lineCount = gl.lineCount
    let lineCounter = 0
    ids.forEach((id) => {
      const countryEntriesForCountry = countries.filter((c) => c.name === id)
      countryEntriesForCountry.forEach((ce) => {
        lineCounter += ce.positions.length
      })
    })

    const colorArray = new Uint8Array(lineCounter - 1 * 3)

    // ids = ['RU']

    const colorList = [Color3.Blue(), Color3.Green(), Color3.Gray(), Color3.Red(), Color3.Black(), Color3.Yellow(), Color3.Random()]
    lineCounter = 0
    ids.forEach((id, idx) => {
      const countryEntriesForCountry = countries.filter((c) => c.name === id)
      const linepos: Vector3[][] = []
      const color = Color3.Random() // colorList[idx % colorList.length]
      console.log('Country', id, 'entries:', countryEntriesForCountry.length, 'color', color)
      countryEntriesForCountry.forEach((ce, countryIdx) => {
        const v: Vector3[] = []
        console.log('Positions:', ce.positions.length)
        for (let i = 0; i < ce.positions.length; i += 3) {
          v.push(new Vector3(ce.positions[i], ce.positions[i + 1], ce.positions[i + 2] + idx))

          colorArray[lineCounter] = color.r * 255
          colorArray[lineCounter + 1] = color.g * 255
          colorArray[lineCounter + 2] = color.b * 255
          // const c = countryIdx / countryEntriesForCountry.length
          // colorArray[lineCounter] = countryIdx * 255
          // colorArray[lineCounter + 1] = countryIdx * 255
          // colorArray[lineCounter + 2] = countryIdx * 255

          lineCounter += 3
        }
        linepos.push(v)
      })
      lineposAll.push(...linepos)
    })

    console.log(colorArray)

    const colors = new RawTexture(colorArray, colorArray.length / 3, 1, Engine.TEXTUREFORMAT_RGB, scene)

    const gl = makeLine('world', lineposAll, colors)

    scene.onBeforeRenderObservable.add(() => {
      // gl.position.x += 1
      // gl.scaling.x -= 0.0001
      gl.rotate(Axis.Y, 0.001)
    })
    // const ids = [...new Set(positions.map(p => p.name))]
    // ids.forEach(id => {
    //     const greasedLinesFiltered = greasedLines.filter(b => b.name === id)
    //     const merged = Mesh.MergeMeshes(greasedLinesFiltered)
    //     if (merged) {

    //         const material = new GreasedLineMaterial("line", scene, {
    //             map,
    //             useMap: true,
    //             color: Color3.Random(),  // new Color3(colors[]),
    //             opacity: 1,
    //             resolution: new Vector2(engine.getRenderWidth(), engine.getRenderHeight()),
    //             // sizeAttenuation: true,
    //             lineWidth: 12,
    //             repeat: new Vector2(10, 1),
    //             visibility: 1
    //         })

    //         merged.material = material
    //     }
    // })

    // Mesh.MergeMeshes(greasedLines)
  }

  // onWindowResize();

  // function onWindowResize() {

  //     const w = container.clientWidth;
  //     const h = container.clientHeight;

  //     camera.aspect = w / h;
  //     camera.updateProjectionMatrix();

  //     renderer.setSize(w, h);

  //     resolution.set(w, h);

  // }

  // window.addEventListener('resize', onWindowResize);
}
