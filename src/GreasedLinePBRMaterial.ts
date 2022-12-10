/**
 * @author roland@babylonjs.xyz
 */

import { Matrix, Scene, Vector2 } from '@babylonjs/core'
import { PBRCustomMaterial } from '@babylonjs/materials'
import { GreasedLineMaterialParameters } from './GreasedLineMaterial'

export interface Rgb {
  r: number
  g: number
  b: number
}

export class GreasedLinePBRMaterial extends PBRCustomMaterial {
  private _parameters: GreasedLineMaterialParameters

  private static _bton(bool?: boolean) {
    return bool ? 1 : 0
  }
  constructor(name: string, scene: Scene, parameters: GreasedLineMaterialParameters) {
    super(name, scene)
    this.AddAttribute('previous');
    this.AddAttribute('next');
    this.AddAttribute('side');
    this.AddAttribute('offset');
    this.AddAttribute('width');

    const engine = scene.getEngine()

    const vecc2 = new Vector2(engine.getRenderWidth(), engine.getRenderHeight())
    this.AddUniform('lineWidth', 'float' ,0);
    this.AddUniform('resolution', 'vec2', vecc2 );

    const m = Matrix.Identity().multiply(scene.getTransformMatrix())

    this.AddUniform('worldViewProjection', 'mat4', m);



    this.Vertex_Definitions(`
    attribute vec3 previous;
    attribute vec3 next;
    attribute float side;
    varying vec3 vNormal;
`)

    this.Vertex_Begin(`
    vec2 fix( vec4 i, float aspect ) {
        vec2 res = i.xy / i.w;
        res.x *= aspect;
        return res;
    }
`)
    this.Vertex_MainEnd(`


    float aspect = resolution.x / resolution.y;

    // mat4 m = projection * view;
    mat4 m = worldViewProjection;
    vec4 finalPosition = m * vec4( position, 1.0 );
    vec4 prevPos = m * vec4( previous, 1.0 );
    vec4 nextPos = m * vec4( next, 1.0 );

    vec2 currentP = fix( finalPosition, aspect );
    vec2 prevP = fix( prevPos, aspect );
    vec2 nextP = fix( nextPos, aspect );

    float w = lineWidth; //* width;

    vec2 dir;
    if( nextP == currentP ) dir = normalize( currentP - prevP );
    else if( prevP == currentP ) dir = normalize( nextP - currentP );
    else {
        vec2 dir1 = normalize( currentP - prevP );
        vec2 dir2 = normalize( nextP - currentP );
        dir = normalize( dir1 + dir2 );

        vec2 perp = vec2( -dir1.y, dir1.x );
        vec2 miter = vec2( -dir.y, dir.x );
        //w = clamp( w / dot( miter, perp ), 0., 4. * lineWidth * width );

    }

    vec4 normal = vec4( -dir.y, dir.x, 0., 1. );
    normal.xy *= .5 * w;
    normal *= worldViewProjection;
    // if( sizeAttenuation == 0. ) {
    //     normal.xy *= finalPosition.w;
    //     normal.xy /= ( vec4( resolution, 0., 1. ) * worldViewProjection ).xy;
    // }

    finalPosition.xy += normal.xy * side;

    gl_Position = finalPosition;
`)

    this.Fragment_Definitions(`
    varying vec3 vNormal;
`)

    this.Fragment_Custom_Albedo(`
    normalW = vNormal;
`)

    const lineWidth = 1
    this.onBindObservable.add(() => {
      this.getEffect().setFloat('lineWidth', lineWidth)
      // this.getEffect().setVector2('resolution', vecc2)
      this.getEffect().setMatrix('worldViewProjection', Matrix.Identity().multiply(scene.getTransformMatrix()))
    })

    this._parameters = {}
    // this.setParameters(parameters)
  }

  // public setParameters(parameters: GreasedLineMaterialParameters) {
  //   this._parameters = { ...this._parameters, ...parameters }

  //   this.setFloat('lineWidth', this._parameters.lineWidth ?? 1)

  //   if (this._parameters.colors) {
  //     if (this._parameters.colors instanceof Texture) {
  //       this.setTexture('colors', this._parameters.colors)
  //     } else {
  //       const colors = new RawTexture(
  //         new Uint8Array(this._parameters.colors),
  //         this._parameters.colors.length / 3,
  //         1,
  //         Engine.TEXTUREFORMAT_RGB,
  //         this.getScene(),
  //       )
  //     }
  //   }

  //   if (this._parameters.alphaMap) {
  //     this.setTexture('alphaMap', this._parameters.alphaMap)
  //   }

  //   if (this._parameters.map) {
  //     this.setTexture('map', this._parameters.map)
  //   }

  //   this.setFloat('useColors', GreasedLineMaterial._bton(this._parameters.useColors))
  //   this.setFloat('useMap', GreasedLineMaterial._bton(this._parameters.useMap))
  //   this.setFloat('useAlphaMap', GreasedLineMaterial._bton(this._parameters.useAlphaMap))
  //   this.setColor3('color', this._parameters.color ?? Color3.White())
  //   this.setFloat('opacity', this._parameters.opacity ?? 1)
  //   this.setVector2('resolution', this._parameters.resolution ?? new Vector2(1, 1))
  //   this.setFloat('sizeAttenuation', GreasedLineMaterial._bton(this._parameters.sizeAttenuation))
  //   this.setFloat('dashArray', this._parameters.dashArray ?? 0)
  //   this.setFloat('dashOffset', this._parameters.dashOffset ?? 0)
  //   this.setFloat('dashRatio', this._parameters.dashRatio ?? 0.5)
  //   this.setFloat('useDash', GreasedLineMaterial._bton(this._parameters.useDash))
  //   this.setFloat('visibility', this._parameters.visibility ?? 1)
  //   this.setFloat('alphaTest', this._parameters.alphaTest ?? 0)
  //   this.setVector2('repeat', this._parameters.repeat ?? new Vector2(1, 1))
  //   this.setVector2('uvOffset', this._parameters.uvOffset ?? new Vector2(0, 0))
  // }

  public getParameters() {
    return { ...this._parameters }
  }
}
