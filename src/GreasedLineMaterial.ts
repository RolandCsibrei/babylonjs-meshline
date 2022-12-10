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
  colorPointers?: number[]
  lineWidth?: number
  colors?: Texture | number[]
  map?: Texture
  alphaMap?: Texture
  useColors?: boolean
  useMap?: boolean
  useAlphaMap?: boolean
  color?: Color3
  opacity?: number
  resolution?: Vector2
  sizeAttenuation?: boolean
  dashArray?: number
  dashOffset?: number
  dashRatio?: number
  useDash?: boolean
  visibility?: number
  alphaTest?: number
  repeat?: Vector2
  uvOffset?: Vector2
}

export class GreasedLineMaterial extends ShaderMaterial {
  private _parameters: GreasedLineMaterialParameters
  private _engine: Engine

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
        attributes: ['uv', 'position', 'normal', 'offset', 'previous', 'next', 'side', 'width', 'counters', 'colorPointers'],
        uniforms: [
          'count',
          'world',
          'worldView',
          'worldViewProjection',
          'view',
          'projection',
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
        this.setInt('count', this._parameters.colors.getSize().width)
      } else {
        const colors = new RawTexture(
          new Uint8Array(this._parameters.colors),
          this._parameters.colors.length / 3,
          1,
          Engine.TEXTUREFORMAT_RGB,
          this.getScene(),
          false,
          true,
          RawTexture.NEAREST_NEAREST
        )
        this.setInt('count', this._parameters.colors.length/3)
        colors.name = "greased-line-colors"
        this.setTexture('colors', colors)

      }
    
    }

    if (this._parameters.colorPointers) {
      const engine = this.getScene().getEngine()
      const colorPointersBuffer = new UniformBuffer(engine, this._parameters.colorPointers, true, 'colorPointers')
      this.setUniformBuffer('colorPointers', colorPointersBuffer) 
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
    this.setFloat('alphaTest', this._parameters.alphaTest ?? 0)
    this.setVector2('repeat', this._parameters.repeat ?? new Vector2(1, 1))
    this.setVector2('uvOffset', this._parameters.uvOffset ?? new Vector2(0, 0))
  }

}
