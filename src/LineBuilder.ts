import { Xyz } from './GreasedLine'
/**
 * @author roland@babylonjs.xyz
 */

import { Color3, Engine, Scene, Vector2 } from '@babylonjs/core'

import { GreasedLine, GreasedLineParameters } from './GreasedLine'
import { GreasedLineMaterial, GreasedLineMaterialParameters } from './GreasedLineMaterial'

export interface AddGreasedLineParameters {
  sizeStart: number
  sizeEnd?: number
  colorStart: Color3
  colorEnd?: Color3
}

export class GreasedLineBuilder {
  private _colors: number[]
  private _sizes: number[]
  private _points: Xyz[][]

  private _engine: Engine

  constructor(private _scene: Scene) {
    this._engine = _scene.getEngine()

    this._colors = []
    this._sizes = []
    this._points = []
  }

  public static CreateGreasedLine(
    name: string,
    scene: Scene,
    lineParameters: GreasedLineParameters,
    materialParameters: GreasedLineMaterialParameters,
  ) {
    materialParameters = materialParameters || {}
    const engine = scene.getEngine()
    const gl = new GreasedLine(name, scene, lineParameters)
    const glm = new GreasedLineMaterial(name, scene, materialParameters)
    gl.material = glm
  }

  public addLine(points: Xyz[], colors: Color3[]) {
    this._points.push(points)
    this._addColors(points.length, colors)
  }

  private _addColors(pointCount: number, colors: Color3[]) {
    this._colors.push(0, 0, 0)
    this._colors.push(0, 0, 0)

    for (let i = 0; i < pointCount - 1; i++) {
      this._colors.push(colors[i].r * 255)
      this._colors.push(colors[i].g * 255)
      this._colors.push(colors[i].b * 255)

      this._colors.push(colors[i].r * 255)
      this._colors.push(colors[i].g * 255)
      this._colors.push(colors[i].b * 255)
    }
  }

  public build(lineParamaters: GreasedLineParameters) {
    const mat = new GreasedLineMaterial('meshline', this._scene, {
      useMap: false,
      color: Color3.Blue(),
      opacity: 1,
      resolution: new Vector2(this._engine.getRenderWidth(), this._engine.getRenderHeight()),
      sizeAttenuation: false,
      lineWidth: 60,
      colors: this._colors,
      useColors: true,
    })

    lineParamaters.points = this._points

    const ml = new GreasedLine('meshline', this._scene, lineParamaters)
    ml.material = mat

    return ml
  }
}
