/**
 * @author roland@babylonjs.xyz
 */

import {
  Color3,
  Scene,
  Vector2,
} from '@babylonjs/core'

import { GreasedLine, GreasedLineParameters } from './GreasedLine'
import { GreasedLineMaterialParameters } from './GreasedLineMaterial';

export class LineBuilder {
  public static CreateGreasedLine(name: string, scene: Scene, lineParameters: GreasedLineParameters, materialParameters: GreasedLineMaterialParameters) {
    materialParameters = materialParameters || {}
    const engine = scene.getEngine()
    materialParameters.useMap = materialParameters.useMap ?? false
    materialParameters.useAlphaMap = materialParameters.useAlphaMap ?? false
    materialParameters.color = materialParameters.color ?? Color3.Black()
    materialParameters.opacity = materialParameters.opacity ?? 1
    materialParameters.resolution = materialParameters.resolution ?? new Vector2(engine.getRenderWidth(), engine.getRenderHeight())
    materialParameters.sizeAttenuation = materialParameters.sizeAttenuation ?? false
    materialParameters.useDash = materialParameters.useDash ?? false
    materialParameters.dashArray = materialParameters.dashArray ?? 0
    materialParameters.dashOffset = materialParameters.dashOffset ?? 0
    materialParameters.dashRatio = materialParameters.dashRatio ?? 0
    materialParameters.visibility = materialParameters.visibility ?? 1
    materialParameters.alphaTest = materialParameters.alphaTest ?? 1
    materialParameters.repeat = materialParameters.repeat ?? new Vector2(1, 1)
    materialParameters.uvOffset = materialParameters.uvOffset ?? new Vector2(0, 0)
    return new GreasedLine(name, scene, lineParameters)
  }
}