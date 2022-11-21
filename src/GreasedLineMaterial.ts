/**
 * @author roland@babylonjs.xyz
 */

import {
  ShaderMaterial,
  Scene,
  Color3,
  Vector2,
  Texture
} from '@babylonjs/core';

export interface GreasedLineMaterialParameters {
  lineWidth?: number
  colors?: Texture
  map?: Texture
  alphaMap?: Texture
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
  private _parameters: GreasedLineMaterialParameters;

  private static _bton(bool?: boolean) {
    return bool ? 1 : 0;
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
        attributes: ['uv', 'position', 'normal', 'previous', 'next', 'side', 'width', 'counters','lineCounters'],
        uniforms: [
          'coordinates',
          'world',
          'worldView',
          'worldViewProjection',
          'view',
          'projection',
          'colors',
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
      }
    );

    this._parameters = {};
    this.setParameters(parameters);
  }

  public setParameters(parameters: GreasedLineMaterialParameters) {
    this._parameters = { ...this._parameters, ...parameters };

    this.setFloat('lineWidth', this._parameters.lineWidth ?? 1);

    if (this._parameters.colors) {
      this.setTexture('colors', this._parameters.colors);
    }

    if (this._parameters.alphaMap) {
      this.setTexture('alphaMap', this._parameters.alphaMap);
    }

    if (this._parameters.map) {
      this.setTexture('map', this._parameters.map);
    }

    this.setFloat('useMap', GreasedLineMaterial._bton(this._parameters.useMap));
    this.setFloat('useAlphaMap', GreasedLineMaterial._bton(this._parameters.useAlphaMap));
    this.setColor3('color', this._parameters.color ?? Color3.White());
    this.setFloat('opacity', this._parameters.opacity ?? 1);
    this.setVector2('resolution', this._parameters.resolution ?? new Vector2(1, 1));
    this.setFloat('sizeAttenuation', GreasedLineMaterial._bton(this._parameters.sizeAttenuation));
    this.setFloat('dashArray', this._parameters.dashArray ?? 0);
    this.setFloat('dashOffset', this._parameters.dashOffset ?? 0);
    this.setFloat('dashRatio', this._parameters.dashRatio ?? 0.5);
    this.setFloat('useDash', GreasedLineMaterial._bton(this._parameters.useDash));
    this.setFloat('visibility', this._parameters.visibility ?? 1);
    this.setFloat('alphaTest', this._parameters.alphaTest ?? 0);
    this.setVector2('repeat', this._parameters.repeat ?? new Vector2(1, 1));
    this.setVector2('uvOffset', this._parameters.uvOffset ?? new Vector2(0, 0));
  }

  public getParameters() {
    return { ...this._parameters };
  }
}