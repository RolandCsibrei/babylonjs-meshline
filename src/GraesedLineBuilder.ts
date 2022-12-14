import { Xyz } from './GreasedLine'
/**
 * @author roland@babylonjs.xyz
 */

import { Color3, Engine, Scene, Vector2 } from '@babylonjs/core'

import { GreasedLine, GreasedLineParameters } from './GreasedLine'
import { ColorDistribution, GreasedLineMaterial, GreasedLineMaterialParameters } from './GreasedLineMaterial'
import { GreasedLinePBRMaterial } from './GreasedLinePBRMaterial'

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
    updatable = false,
  ) {
    materialParameters = materialParameters || {}
    const gl = new GreasedLine(name, scene, lineParameters, updatable)
    const glm = new GreasedLineMaterial(name, scene, materialParameters)
    gl.material = glm
  }

  public static AddLine2(instance: GreasedLine, points: Xyz[], colors?: Color3[], materialParameters?: GreasedLineMaterialParameters) {
    instance.addPoints(points)
    if (colors) {
      this._AddColors2(instance, points.length, colors, materialParameters)
    }
  }

  public addLine(points: Xyz[], colors?: Color3[], materialParameters?: GreasedLineMaterialParameters) {
    this._points.push(points)
    if (colors) {
      this._addColors(points.length, colors, materialParameters)
    }
  }

  private static _AddColors2(
    instance: GreasedLine,
    pointCount: number,
    colors: Color3[],
    materialParameters?: GreasedLineMaterialParameters,
  ) {
    const colorsData = []

    colorsData.push(0, 0, 0)
    colorsData.push(0, 0, 0)

    // is the color table is shorter the the point table?
    const missingCount = pointCount - colors.length - 1
    if (missingCount > 0) {
      // it is, fill in the missing elements
      const colorDistribution = materialParameters?.colorDistribution ?? ColorDistribution.StartEnd
      if (colorDistribution === ColorDistribution.StartEnd) {
        const halfCount = Math.floor(colors.length / 2)

        // start sector
        for (let i = 0; i < halfCount; i++) {
          colorsData.push(colors[i].r * 255)
          colorsData.push(colors[i].g * 255)
          colorsData.push(colors[i].b * 255)

          colorsData.push(colors[i].r * 255)
          colorsData.push(colors[i].g * 255)
          colorsData.push(colors[i].b * 255)
        }

        // middle sector
        const color = materialParameters?.color ?? colors[halfCount - 1]
        for (let i = 0; i < missingCount; i++) {
          colorsData.push(color.r * 255)
          colorsData.push(color.g * 255)
          colorsData.push(color.b * 255)

          colorsData.push(color.r * 255)
          colorsData.push(color.g * 255)
          colorsData.push(color.b * 255)
        }

        // end sector
        for (let i = halfCount; i < colors.length; i++) {
          colorsData.push(colors[i].r * 255)
          colorsData.push(colors[i].g * 255)
          colorsData.push(colors[i].b * 255)

          colorsData.push(colors[i].r * 255)
          colorsData.push(colors[i].g * 255)
          colorsData.push(colors[i].b * 255)
        }
      } else if (colorDistribution === ColorDistribution.Start) {
        // start sector
        for (let i = 0; i < colors.length; i++) {
          colorsData.push(colors[i].r * 255)
          colorsData.push(colors[i].g * 255)
          colorsData.push(colors[i].b * 255)

          colorsData.push(colors[i].r * 255)
          colorsData.push(colors[i].g * 255)
          colorsData.push(colors[i].b * 255)
        }

        // end sector
        const color = materialParameters?.color ?? colors[colors.length - 1]
        for (let i = 0; i < missingCount; i++) {
          colorsData.push(color.r * 255)
          colorsData.push(color.g * 255)
          colorsData.push(color.b * 255)

          colorsData.push(color.r * 255)
          colorsData.push(color.g * 255)
          colorsData.push(color.b * 255)
        }
      } else if (colorDistribution === ColorDistribution.End) {
        // start sector
        const color = materialParameters?.color ?? colors[colors.length - 1]
        for (let i = 0; i < missingCount; i++) {
          colorsData.push(color.r * 255)
          colorsData.push(color.g * 255)
          colorsData.push(color.b * 255)

          colorsData.push(color.r * 255)
          colorsData.push(color.g * 255)
          colorsData.push(color.b * 255)
        }

        // end sector
        for (let i = 0; i < colors.length; i++) {
          colorsData.push(colors[i].r * 255)
          colorsData.push(colors[i].g * 255)
          colorsData.push(colors[i].b * 255)

          colorsData.push(colors[i].r * 255)
          colorsData.push(colors[i].g * 255)
          colorsData.push(colors[i].b * 255)
        }
      } else if (colorDistribution === ColorDistribution.Repeat) {
        let i = 0
        for (let x = 0; x < pointCount - 1; x++) {
          colorsData.push(colors[i].r * 255)
          colorsData.push(colors[i].g * 255)
          colorsData.push(colors[i].b * 255)

          colorsData.push(colors[i].r * 255)
          colorsData.push(colors[i].g * 255)
          colorsData.push(colors[i].b * 255)

          i++

          if (i === colors.length) {
            i = 0
          }
        }
      } else if (colorDistribution === ColorDistribution.Even) {
        let j = 0
        const colorSectorLength = colors.length / (pointCount - 1)
        for (let x = 0; x < pointCount - 1; x++) {
          const i = Math.floor(j)

          colorsData.push(colors[i].r * 255)
          colorsData.push(colors[i].g * 255)
          colorsData.push(colors[i].b * 255)

          colorsData.push(colors[i].r * 255)
          colorsData.push(colors[i].g * 255)
          colorsData.push(colors[i].b * 255)

          j += colorSectorLength
        }
      } else if (colorDistribution === ColorDistribution.None) {
        for (let i = 0; i < colors.length; i++) {
          colorsData.push(colors[i].r * 255)
          colorsData.push(colors[i].g * 255)
          colorsData.push(colors[i].b * 255)

          colorsData.push(colors[i].r * 255)
          colorsData.push(colors[i].g * 255)
          colorsData.push(colors[i].b * 255)
        }
      }
    } else {
      for (let i = 0; i < pointCount - 1; i++) {
        colorsData.push(colors[i].r * 255)
        colorsData.push(colors[i].g * 255)
        colorsData.push(colors[i].b * 255)

        colorsData.push(colors[i].r * 255)
        colorsData.push(colors[i].g * 255)
        colorsData.push(colors[i].b * 255)
      }
    }
    if (instance.material instanceof GreasedLineMaterial) {
      const colorsData = instance.material.getParameters().colors
      // instance.material.addColors(colorsData)
    }
  }

  private _addColors(pointCount: number, colors: Color3[], materialParameters?: GreasedLineMaterialParameters) {
    this._colors.push(0, 0, 0)
    this._colors.push(0, 0, 0)

    // is the color table is shorter the the point table?
    const missingCount = pointCount - colors.length - 1
    if (missingCount > 0) {
      // it is, fill in the missing elements
      const colorDistribution = materialParameters?.colorDistribution ?? ColorDistribution.StartEnd
      if (colorDistribution === ColorDistribution.StartEnd) {
        const halfCount = Math.floor(colors.length / 2)

        // start sector
        for (let i = 0; i < halfCount; i++) {
          this._colors.push(colors[i].r * 255)
          this._colors.push(colors[i].g * 255)
          this._colors.push(colors[i].b * 255)

          this._colors.push(colors[i].r * 255)
          this._colors.push(colors[i].g * 255)
          this._colors.push(colors[i].b * 255)
        }

        // middle sector
        const color = materialParameters?.color ?? colors[halfCount - 1]
        for (let i = 0; i < missingCount; i++) {
          this._colors.push(color.r * 255)
          this._colors.push(color.g * 255)
          this._colors.push(color.b * 255)

          this._colors.push(color.r * 255)
          this._colors.push(color.g * 255)
          this._colors.push(color.b * 255)
        }

        // end sector
        for (let i = halfCount; i < colors.length; i++) {
          this._colors.push(colors[i].r * 255)
          this._colors.push(colors[i].g * 255)
          this._colors.push(colors[i].b * 255)

          this._colors.push(colors[i].r * 255)
          this._colors.push(colors[i].g * 255)
          this._colors.push(colors[i].b * 255)
        }
      } else if (colorDistribution === ColorDistribution.Start) {
        // start sector
        for (let i = 0; i < colors.length; i++) {
          this._colors.push(colors[i].r * 255)
          this._colors.push(colors[i].g * 255)
          this._colors.push(colors[i].b * 255)

          this._colors.push(colors[i].r * 255)
          this._colors.push(colors[i].g * 255)
          this._colors.push(colors[i].b * 255)
        }

        // end sector
        const color = materialParameters?.color ?? colors[colors.length - 1]
        for (let i = 0; i < missingCount; i++) {
          this._colors.push(color.r * 255)
          this._colors.push(color.g * 255)
          this._colors.push(color.b * 255)

          this._colors.push(color.r * 255)
          this._colors.push(color.g * 255)
          this._colors.push(color.b * 255)
        }
      } else if (colorDistribution === ColorDistribution.End) {
        // start sector
        const color = materialParameters?.color ?? colors[colors.length - 1]
        for (let i = 0; i < missingCount; i++) {
          this._colors.push(color.r * 255)
          this._colors.push(color.g * 255)
          this._colors.push(color.b * 255)

          this._colors.push(color.r * 255)
          this._colors.push(color.g * 255)
          this._colors.push(color.b * 255)
        }

        // end sector
        for (let i = 0; i < colors.length; i++) {
          this._colors.push(colors[i].r * 255)
          this._colors.push(colors[i].g * 255)
          this._colors.push(colors[i].b * 255)

          this._colors.push(colors[i].r * 255)
          this._colors.push(colors[i].g * 255)
          this._colors.push(colors[i].b * 255)
        }
      } else if (colorDistribution === ColorDistribution.Repeat) {
        let i = 0
        for (let x = 0; x < pointCount - 1; x++) {
          this._colors.push(colors[i].r * 255)
          this._colors.push(colors[i].g * 255)
          this._colors.push(colors[i].b * 255)

          this._colors.push(colors[i].r * 255)
          this._colors.push(colors[i].g * 255)
          this._colors.push(colors[i].b * 255)

          i++

          if (i === colors.length) {
            i = 0
          }
        }
      } else if (colorDistribution === ColorDistribution.Even) {
        let j = 0
        const colorSectorLength = colors.length / (pointCount - 1)
        for (let x = 0; x < pointCount - 1; x++) {
          const i = Math.floor(j)

          this._colors.push(colors[i].r * 255)
          this._colors.push(colors[i].g * 255)
          this._colors.push(colors[i].b * 255)

          this._colors.push(colors[i].r * 255)
          this._colors.push(colors[i].g * 255)
          this._colors.push(colors[i].b * 255)

          j += colorSectorLength
        }
      } else if (colorDistribution === ColorDistribution.None) {
        for (let i = 0; i < colors.length; i++) {
          this._colors.push(colors[i].r * 255)
          this._colors.push(colors[i].g * 255)
          this._colors.push(colors[i].b * 255)

          this._colors.push(colors[i].r * 255)
          this._colors.push(colors[i].g * 255)
          this._colors.push(colors[i].b * 255)
        }
      }
    } else {
      for (let i = 0; i < pointCount - 1; i++) {
        this._colors.push(colors[i].r * 255)
        this._colors.push(colors[i].g * 255)
        this._colors.push(colors[i].b * 255)

        this._colors.push(colors[i].r * 255)
        this._colors.push(colors[i].g * 255)
        this._colors.push(colors[i].b * 255)
      }
    }
  }

  public build(lineParamaters: GreasedLineParameters, materialParameters: GreasedLineMaterialParameters, updatable = false) {
    if (this._colors.length > 0) {
      materialParameters.colors = this._colors
    }
    const mat = new GreasedLineMaterial('meshline', this._scene, materialParameters)

    lineParamaters.points = this._points

    const ml = new GreasedLine('meshline', this._scene, lineParamaters, updatable)
    ml.material = mat

    return ml
  }

  public buildPBR(lineParamaters: GreasedLineParameters, materialParameters: GreasedLineMaterialParameters, updatable = false) {
    if (this._colors.length > 0) {
      materialParameters.colors = this._colors
    }
    const mat = new GreasedLinePBRMaterial('meshline', this._scene, materialParameters)

    lineParamaters.points = this._points

    const ml = new GreasedLine('meshline', this._scene, lineParamaters, updatable, false)
    ml.material = mat

    return ml
  }
}
