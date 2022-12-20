/**
 * @author roland@babylonjs.xyz
 */

import { Color3, Engine, EngineStore, Nullable, Scene, Vector2 } from '@babylonjs/core'

import { GreasedLine, GreasedLineParameters, WidthsDistribution } from './GreasedLine'
import { ColorDistribution, GreasedLineMaterial, GreasedLineMaterialParameters } from './GreasedLineMaterial'
import { GreasedLinePBRMaterial } from './GreasedLinePBRMaterial'

export interface AddGreasedLineParameters {
  sizeStart: number
  sizeEnd?: number
  colorStart: Color3
  colorEnd?: Color3
}

export class GreasedLineBuilder {
  public static CreateGreasedLine(
    name: string,
    scene: Scene,
    lineParameters: GreasedLineParameters,
    materialParameters: GreasedLineMaterialParameters,
  ) {
    materialParameters = materialParameters || {}
    const gl = new GreasedLine(name, scene, lineParameters, lineParameters.updatable)
    const glm = new GreasedLineMaterial(name, scene, materialParameters)
    gl.material = glm
  }

  public static CreateGreasedLineSystem(
    name: string,
    greasedLineParameters: GreasedLineParameters,
    materialParameters: GreasedLineMaterialParameters,
    scene: Nullable<Scene>,
  ) {
    scene = <Scene>(scene ?? EngineStore.LastCreatedScene)
    let instance
    const norm = GreasedLineBuilder._NormalizeWidthTable(
      greasedLineParameters.points.length,
      greasedLineParameters.widths ?? [],
      greasedLineParameters,
      materialParameters,
    )
    const widths = greasedLineParameters.widths
      ? GreasedLineBuilder._NormalizeWidthTable(
          greasedLineParameters.points.length,
          greasedLineParameters.widths,
          greasedLineParameters,
          materialParameters,
        )
      : undefined
    if (!greasedLineParameters.instance) {
      const initialGreasedLineParameters = { ...greasedLineParameters }
      initialGreasedLineParameters.widths = widths
      instance = new GreasedLine(name, scene, initialGreasedLineParameters, greasedLineParameters.updatable)
    } else {
      instance = greasedLineParameters.instance
      if (greasedLineParameters.widthCallback) {
        instance.setSegmentWidthCallback(greasedLineParameters.widthCallback)
      }

      if (widths) {
        this._SetSegmentWidths(instance, widths)
      }
      instance.addPoints(greasedLineParameters.points)
    }

    const colors = materialParameters.colors
      ? GreasedLineBuilder._NormalizeColorTable(greasedLineParameters.points.length, materialParameters.colors, materialParameters)
      : undefined
    if (!instance.material) {
      const initialMaterialParameters = { ...materialParameters }
      initialMaterialParameters.colors = colors
      instance.material = greasedLineParameters.pbr
        ? new GreasedLinePBRMaterial(name, scene, initialMaterialParameters)
        : new GreasedLineMaterial(name, scene, initialMaterialParameters)
    } else {
      if (colors) {
        this._SetColors(instance, colors)
      }
    }

    return instance
  }

  private static _SetColors(instance: GreasedLine, colors: Color3[]) {
    if (instance.material instanceof GreasedLineMaterial) {
      const currentColors = instance.material.getParameters().colors

      if (currentColors) {
        const newColors = [...currentColors]
        newColors.push(...colors)
        instance.material.setColors(newColors)
      } else {
        instance.material.setColors(colors)
      }
    }
  }

  private static _SetSegmentWidths(instance: GreasedLine, segmentWidths: number[]) {
    const currentWidths = instance.getSegmentWidths()

    if (currentWidths) {
      const newWidths = [...currentWidths]
      newWidths.push(...segmentWidths)
      instance.setSegmentWidths(newWidths)
    } else {
      instance.setSegmentWidths(segmentWidths)
    }
  }

  private static _NormalizeWidthTable(
    pointCount: number,
    widths: number[],
    lineParameters?: GreasedLineParameters,
    materialParameters?: GreasedLineMaterialParameters,
  ) {
    const widthsData: number[] = []

    // is the color table is shorter the the point table?
    const missingCount = pointCount - widths.length / 2
    if (missingCount > 0) {
      // it is, fill in the missing elements
      const widthDistribution = lineParameters?.widthsDistribution ?? WidthsDistribution.Start
      if (widthDistribution === WidthsDistribution.StartEnd) {
        const halfCount = Math.floor(widths.length / 2)

        // start sector
        for (let i = 0; i < halfCount; i += 2) {
          widthsData.push(widths[i])
          widthsData.push(widths[i + 1])
        }

        // middle sector
        const widthL = widths[halfCount / 2]
        const widthU = widths[halfCount / 2 + 1]
        for (let i = 0; i < missingCount; i++) {
          widthsData.push(widthU)
          widthsData.push(widthL)
        }

        // end sector
        for (let i = halfCount; i < widths.length; i += 2) {
          widthsData.push(widths[i])
          widthsData.push(widths[i + 1])
        }
      } else if (widthDistribution === WidthsDistribution.Start) {
        // start sector
        for (let i = 0; i < widths.length; i += 2) {
          widthsData.push(widths[i])
          widthsData.push(widths[i + 1])
        }

        // end sector
        const widthL = widths[widths.length - 1]
        const widthU = widths[widths.length - 2]
        for (let i = 0; i < missingCount; i++) {
          widthsData.push(widthU)
          widthsData.push(widthL)
        }
      } else if (widthDistribution === WidthsDistribution.End) {
        // start sector
        const widthL = widths[0]
        const widthU = widths[1]
        for (let i = 0; i < missingCount; i++) {
          widthsData.push(widthU)
          widthsData.push(widthL)
        }

        // end sector
        for (let i = 0; i < widths.length; i += 2) {
          widthsData.push(widths[i])
          widthsData.push(widths[i + 1])
        }
      } else if (widthDistribution === WidthsDistribution.Repeat) {
        let i = 0
        for (let x = 0; x < pointCount - 1; x++) {
          widthsData.push(widths[i++])
          widthsData.push(widths[i++])

          // TODO: with %
          if (i === widths.length) {
            i = 0
          }
        }
      } else if (widthDistribution === WidthsDistribution.Even) {
        let j = 0
        const widthsectorLength = widths.length / (pointCount - 1)
        for (let x = 0; x < pointCount - 1; x++) {
          const i = Math.floor(j)

          widthsData.push(widths[i])
          widthsData.push(widths[i])

          j += widthsectorLength
        }
      } else if (widthDistribution === WidthsDistribution.None) {
        for (let i = 0; i < widths.length; i++) {
          widthsData.push(widths[i])
          widthsData.push(widths[i])
        }
      }
    } else {
      for (let i = 0; i < widths.length; i++) {
        widthsData.push(widths[i])
      }
    }

    return widthsData
  }

  private static _NormalizeColorTable(pointCount: number, colors: Color3[], materialParameters?: GreasedLineMaterialParameters) {
    const colorsData: Color3[] = []

    colorsData.push(Color3.BlackReadOnly)
    colorsData.push(Color3.BlackReadOnly)

    // is the color table is shorter the the point table?
    const missingCount = pointCount - colors.length - 1
    if (missingCount > 0) {
      // it is, fill in the missing elements
      const colorDistribution = materialParameters?.colorDistribution ?? ColorDistribution.StartEnd
      if (colorDistribution === ColorDistribution.StartEnd) {
        const halfCount = Math.floor(colors.length / 2)

        // start sector
        for (let i = 0; i < halfCount; i++) {
          colorsData.push(colors[i])
          colorsData.push(colors[i])
        }

        // middle sector
        const color = materialParameters?.color ?? colors[halfCount - 1]
        for (let i = 0; i < missingCount; i++) {
          colorsData.push(colors[i])
          colorsData.push(colors[i])
        }

        // end sector
        for (let i = halfCount; i < colors.length; i++) {
          colorsData.push(colors[i])
          colorsData.push(colors[i])
        }
      } else if (colorDistribution === ColorDistribution.Start) {
        // start sector
        for (let i = 0; i < colors.length; i++) {
          colorsData.push(colors[i])
          colorsData.push(colors[i])
        }

        // end sector
        const color = materialParameters?.color ?? colors[colors.length - 1]
        for (let i = 0; i < missingCount; i++) {
          colorsData.push(colors[i])
          colorsData.push(colors[i])
        }
      } else if (colorDistribution === ColorDistribution.End) {
        // start sector
        const color = materialParameters?.color ?? colors[colors.length - 1]
        for (let i = 0; i < missingCount; i++) {
          colorsData.push(colors[i])
          colorsData.push(colors[i])
        }

        // end sector
        for (let i = 0; i < colors.length; i++) {
          colorsData.push(colors[i])
          colorsData.push(colors[i])
        }
      } else if (colorDistribution === ColorDistribution.Repeat) {
        let i = 0
        for (let x = 0; x < pointCount - 1; x++) {
          colorsData.push(colors[i])
          colorsData.push(colors[i])

          // TODO: with %
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

          colorsData.push(colors[i])
          colorsData.push(colors[i])

          j += colorSectorLength
        }
      } else if (colorDistribution === ColorDistribution.None) {
        for (let i = 0; i < colors.length; i++) {
          colorsData.push(colors[i])
          colorsData.push(colors[i])
        }
      }
    } else {
      for (let i = 0; i < pointCount - 1; i++) {
        colorsData.push(colors[i])
        colorsData.push(colors[i])
      }
    }

    return colorsData
  }
}
