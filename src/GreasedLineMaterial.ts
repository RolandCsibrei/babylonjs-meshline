/**
 * @author roland@babylonjs.xyz
 */

import { ShaderMaterial, Scene, Color3, Vector2, Texture, RawTexture, Engine, Buffer, UniformBuffer } from '@babylonjs/core'

export interface Rgb {
  r: number
  g: number
  b: number
}

export interface GreasedLineMaterialParameters {
  color?: Color3
  opacity?: number
  lineWidth?: number

  useColors?: boolean
  colors?: Texture | number[]
  colorsSamplingMode?: ColorSamplingMode
  colorDistribution?: ColorDistribution

  sizeAttenuation?: boolean
  visibility?: number

  useMap?: boolean
  map?: Texture

  alphaMap?: Texture
  useAlphaMap?: boolean

  resolution?: Vector2
  dashArray?: number
  dashOffset?: number
  dashRatio?: number
  useDash?: boolean
  alphaTest?: number
  repeat?: Vector2

  uvOffset?: Vector2
  uvRotation?: number
  uvScale?: Vector2
}

export enum ColorDistribution {
  Repeat,
  Even,
  Start,
  End,
  StartEnd,
  None,
}

export enum ColorSamplingMode {
  Exact,
  Smooth,
}

export class GreasedLineMaterial extends ShaderMaterial {
  private _parameters: GreasedLineMaterialParameters
  private _engine: Engine

  private _colorsTexture?: RawTexture

  private static _bton(bool?: boolean) {
    return bool ? 1 : 0
  }
  constructor(name: string, scene: Scene, parameters: GreasedLineMaterialParameters) {
    super(
      name,
      scene,
      {
        vertex: './shaders/greasedLine',
        fragment: './shaders/greasedLine',
      },
      {
        attributes: [
          'uv', 
          'position', 
          'normal', 
          'offset', 
          'previous', 
          'next', 
          'side', 
          'width', 
          'counters'
        ],
        uniforms: [
          // 'world',
          // 'worldView',
          'worldViewProjection',
          // 'view',
          'projection',
          'count',
          'colors',
          'useColors',
          'lineWidth',
          'map',
          'useMap',
          'alphaMap',
          'useAlphaMap',
          'color',
          'opacity',
          'resolution',
          'sizeAttenuation',
          'dashArray',
          'dashOffset',
          'dashRatio',
          'useDash',
          'visibility',
          'alphaTest',
          'repeat',
          'uvOffset',
          'uvRotation',
          'uvScale',
        ],
      },
    )

    this._engine = scene.getEngine()

    this._parameters = {}
    this.setParameters(parameters)
  }

  public getParameters() {
    return Object.freeze(this._parameters)
  }

  public setParameters(parameters: GreasedLineMaterialParameters) {
    this._parameters = { ...this._parameters, ...parameters }

    this.setFloat('lineWidth', this._parameters.lineWidth ?? 1)

    if (this._parameters.colors) {
      if (this._parameters.colors instanceof Texture) {
        this.setTexture('colors', this._parameters.colors)
        this.setFloat('count', this._parameters.colors.getSize().width)
      } else {
        if (this._colorsTexture) {
          this._colorsTexture.update(new Uint8Array(this._parameters.colors))
        } else {
          this._colorsTexture = new RawTexture(
            new Uint8Array(this._parameters.colors),
            this._parameters.colors.length / 3,
            1,
            Engine.TEXTUREFORMAT_RGB,
            this.getScene(),
            false,
            true,
            parameters.colorsSamplingMode === ColorSamplingMode.Smooth ? RawTexture.LINEAR_LINEAR : RawTexture.NEAREST_NEAREST,
          )
          this._colorsTexture.name = 'greased-line-colors'
        }
        this.setFloat('count', this._parameters.colors.length / 3)
        this.setTexture('colors', this._colorsTexture)
      }
    }

    if (this._parameters.alphaMap) {
      this.setTexture('alphaMap', this._parameters.alphaMap)
    }

    if (this._parameters.map) {
      this.setTexture('map', this._parameters.map)
    }

    this.setFloat('useColors', GreasedLineMaterial._bton(this._parameters.useColors))
    this.setFloat('useMap', GreasedLineMaterial._bton(this._parameters.useMap))
    this.setFloat('useAlphaMap', GreasedLineMaterial._bton(this._parameters.useAlphaMap))
    this.setColor3('color', this._parameters.color ?? Color3.White())
    this.setFloat('opacity', this._parameters.opacity ?? 1)
    this.setVector2('resolution', this._parameters.resolution ?? new Vector2(this._engine.getRenderWidth(), this._engine.getRenderHeight()))
    this.setFloat('sizeAttenuation', GreasedLineMaterial._bton(this._parameters.sizeAttenuation))
    this.setFloat('dashArray', this._parameters.dashArray ?? 0)
    this.setFloat('dashOffset', this._parameters.dashOffset ?? 0)
    this.setFloat('dashRatio', this._parameters.dashRatio ?? 0.5)
    this.setFloat('useDash', GreasedLineMaterial._bton(this._parameters.useDash))
    this.setFloat('visibility', this._parameters.visibility ?? 1)
    this.setFloat('alphaTest', this._parameters.alphaTest ?? 1)
    this.setVector2('repeat', this._parameters.repeat ?? new Vector2(1, 1))
    this.setVector2('uvOffset', this._parameters.uvOffset ?? new Vector2(0, 0))
    this.setFloat('uvRotation', this._parameters.uvRotation ?? 0)
    this.setVector2('uvScale', this._parameters.uvScale ?? new Vector2(1, 1))
  }
}
