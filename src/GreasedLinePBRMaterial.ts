/**
 * @author roland@babylonjs.xyz
 */

import { Color3, Engine, Matrix, RawTexture, Scene, Texture, Vector2 } from '@babylonjs/core'
import { PBRCustomMaterial } from '@babylonjs/materials'
import { GreasedLineMaterialParameters } from './GreasedLineMaterial'

export interface Rgb {
  r: number
  g: number
  b: number
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

export class GreasedLinePBRMaterial extends PBRCustomMaterial {
  private _engine: Engine

  private _parameters: GreasedLineMaterialParameters
  private _colorsTexture?: RawTexture

  private _updateUniforms = false


  constructor(name: string, scene: Scene, parameters: GreasedLineMaterialParameters) {
    super(name, scene)

    this._engine = scene.getEngine()

    this.AddAttribute('offset')
    this.AddAttribute('previous')
    this.AddAttribute('next')
    this.AddAttribute('side')
    this.AddAttribute('width')
    this.AddAttribute('counters')
    this.AddAttribute('offset')

    const engine = scene.getEngine()

    const resolution = new Vector2(engine.getRenderWidth(), engine.getRenderHeight())
    this.AddUniform('lineWidth', 'float', parameters?.width ?? 1)
    this.AddUniform('resolution', 'vec2', parameters.resolution ?? new Vector2(engine.getRenderWidth(), engine.getRenderHeight()))
    this.AddUniform('sizeAttenuation', 'float', GreasedLinePBRMaterial._bton(parameters.sizeAttenuation))

    this.AddUniform('dashArray', 'float', parameters?.dashArray ?? 0)
    this.AddUniform('dashOffset', 'float', parameters?.dashOffset ?? 0)
    this.AddUniform('dashRatio', 'float', parameters.dashRatio ?? 0.5)
    this.AddUniform('useDash', 'float', GreasedLinePBRMaterial._bton(parameters.useDash))
    this.AddUniform('useColors', 'float', GreasedLinePBRMaterial._bton(parameters.useColors))
    this.AddUniform('alphaTest', 'float', parameters.alphaTest ?? 1)
    this.AddUniform('greasedLineVisibility', 'float', parameters.visibility ?? 1) // visibility uniform is already used

    if (parameters.colors) {
      if (parameters.colors instanceof Texture) {
        this.AddUniform('count', 'float', parameters.colors.getSize().width)
        this.AddUniform('colors', 'sampler2D', parameters.colors)
      } else {
        if (this._colorsTexture) {
          // this._colorsTexture.update(new Uint8Array(parameters.colors))
        } else {
          this._colorsTexture = new RawTexture(
            new Uint8Array([]), //parameters.colors),
            parameters.colors.length / 3,
            1,
            Engine.TEXTUREFORMAT_RGB,
            this.getScene(),
            false,
            true,
            parameters.colorsSamplingMode === ColorSamplingMode.Smooth ? RawTexture.LINEAR_LINEAR : RawTexture.NEAREST_NEAREST,
          )
          this._colorsTexture.name = 'greased-line-colors'
        }
        this.AddUniform('count', 'float', parameters.colors.length / 3)
        this.AddUniform('colors', 'sampler2D', this._colorsTexture)
      }
    } else {
      this.AddUniform('count', 'float', 1)
      this.AddUniform('colors', 'sampler2D', null)
    }

    const worldViewProjection = Matrix.Identity().multiply(scene.getTransformMatrix())
    const projection = this.getScene().activeCamera!.getProjectionMatrix()

    this.AddUniform('worldViewProjection', 'mat4', worldViewProjection)
    // greasedLineProjection - workaround https://forum.babylonjs.com/t/github-globe-like-scene-with-flying-lines/36503/2
    this.AddUniform('greasedLineProjection', 'mat4', projection)

    this.Vertex_Definitions(`
    attribute vec3 previous;
    attribute vec3 next;
    attribute float side;
    attribute float width;
    attribute float counters;
    attribute vec3 offset;
    attribute vec2 uv;

    varying vec3 vNormal;
    varying vec2 vUV;
    varying vec4 vColor;
    varying float vCounters;
    flat out int vColorPointers;

`)

    this.Vertex_Begin(`
    vec2 fix( vec4 i, float aspect ) {
        vec2 res = i.xy / i.w;
        res.x *= aspect;
        return res;
    }
`)
    this.Vertex_MainEnd(`
    vCounters = counters;
    vColorPointers = gl_VertexID;
    float aspect = resolution.x / resolution.y;

    vUV = uv;

    mat4 m = worldViewProjection;
    vec3 positionOffset = offset;
    vec4 finalPosition = m * vec4( vPositionW + positionOffset, 1.0 );
    vec4 prevPos = m * vec4( previous + positionOffset, 1.0 );
    vec4 nextPos = m * vec4( next + positionOffset, 1.0 );

    vec2 currentP = fix( finalPosition, aspect );
    vec2 prevP = fix( prevPos, aspect );
    vec2 nextP = fix( nextPos, aspect );

    float w =  lineWidth * width;

    vec2 dir;
    if( nextP == currentP ) dir = normalize( currentP - prevP );
    else if( prevP == currentP ) dir = normalize( nextP - currentP );
    else {
        vec2 dir1 = normalize( currentP - prevP );
        vec2 dir2 = normalize( nextP - currentP );
        dir = normalize( dir1 + dir2 );

        vec2 perp = vec2( -dir1.y, dir1.x );
        vec2 miter = vec2( -dir.y, dir.x );
    }
    vec4 normal = vec4( -dir.y, dir.x, 0., 1. );
    normal.xy *= .5 * w;
    normal *= greasedLineProjection;
    if( sizeAttenuation == 0. ) {
        normal.xy *= finalPosition.w;
        normal.xy /= ( vec4( resolution, 0., 1. ) * greasedLineProjection ).xy;
    }

    finalPosition.xy += normal.xy * side;

    gl_Position = finalPosition;

`)

    this.Fragment_Definitions(`
      varying vec3 vNormal;
      varying float vCounters;
      flat in int vColorPointers;
`)

    this.Fragment_MainEnd(`
      if( useDash == 1. ){
        gl_FragColor.a *= ceil(mod(vCounters + dashOffset, dashArray) - (dashArray * dashRatio));
      }
      gl_FragColor.a *= step(vCounters, greasedLineVisibility);

      if( gl_FragColor.a < alphaTest ) discard;

      if (useColors == 1.) {
        gl_FragColor += texture2D(colors, vec2(float(vColorPointers)/float(count), 0.));
      } 

`)

    this.Fragment_Custom_Albedo(`
    normalW = vNormal;
`)

    this.onBindObservable.add(() => {
      this.getEffect().setMatrix('worldViewProjection', Matrix.Identity().multiply(scene.getTransformMatrix()))
      this.getEffect().setMatrix('greasedLineProjection', this.getScene().activeCamera!.getProjectionMatrix())

      if (this._updateUniforms) {
        this.getEffect().setFloat('greasedLineVisibility', this._parameters.visibility ?? 1)
        this.getEffect().setFloat('useColors', GreasedLinePBRMaterial._bton(this._parameters.useColors))
        this.getEffect().setFloat('useMap', GreasedLinePBRMaterial._bton(this._parameters.useMap))
        this.getEffect().setFloat('useAlphaMap', GreasedLinePBRMaterial._bton(this._parameters.useAlphaMap))
        this.getEffect().setColor3('color', this._parameters.color ?? Color3.White())
        this.getEffect().setVector2('resolution', this._parameters.resolution ?? new Vector2(this._engine.getRenderWidth(), this._engine.getRenderHeight()))
        this.getEffect().setFloat('sizeAttenuation', GreasedLinePBRMaterial._bton(this._parameters.sizeAttenuation))
        this.getEffect().setFloat('dashArray', this._parameters.dashArray ?? 0)
        this.getEffect().setFloat('dashOffset', this._parameters.dashOffset ?? 0)
        this.getEffect().setFloat('dashRatio', this._parameters.dashRatio ?? 0.5)
        this.getEffect().setFloat('useDash', GreasedLinePBRMaterial._bton(this._parameters.useDash))

        // this.getEffect().setFloat('alphaTest', this._parameters.alphaTest ?? 1)
        // this.getEffect().setVector2('repeat', this._parameters.repeat ?? new Vector2(1, 1))
        // this.getEffect().setVector2('uvOffset', this._parameters.uvOffset ?? new Vector2(0, 0))
        // this.getEffect().setFloat('uvRotation', this._parameters.uvRotation ?? 0)
        // this.getEffect().setVector2('uvScale', this._parameters.uvScale ?? new Vector2(1, 1))
        this._updateUniforms = false
      }
    })

    this._parameters = {}
  }

  public setParameters(parameters: GreasedLineMaterialParameters) {
    this._parameters = { ...this._parameters, ...parameters }
    this._updateUniforms = true
  }

  public getParameters() {
    return { ...this._parameters }
  }

  public setVisibility(value: number) {
    this._parameters.visibility = value
    this._updateUniforms = true
  }

  public setLineWidth(value: number) {
    this._parameters.width = value
    this._updateUniforms = true
  }

  public setResolution(value: Vector2) {
    this._parameters.resolution = value
    this._updateUniforms = true
  }
  
  public setSizeAttenuation(value: boolean) {
    this._parameters.sizeAttenuation = value
    this._updateUniforms = true
  }

  public setDashArray(value: number) {
    this._parameters.dashArray = value
    this._updateUniforms = true
  }

  public setDashOffset(value: number) {
    this._parameters.dashOffset = value
    this._updateUniforms = true
  }

  public setDashRatio(value: number) {
    this._parameters.dashRatio = value
    this._updateUniforms = true
  }

  public setUseDash(value: boolean) {
    this._parameters.useDash = value
    this._updateUniforms = true
  }

  public setuUeColors(value: boolean) {
    this._parameters.useColors = value
    this._updateUniforms = true
  }

  public setAlphaTest(value: number) {
    this._parameters.alphaTest = value
    this._updateUniforms = true
  }


  private static _bton(bool?: boolean) {
    return bool ? 1 : 0
  }
}
