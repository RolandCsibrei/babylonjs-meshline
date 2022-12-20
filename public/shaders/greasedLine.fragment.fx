//   THREE.ShaderChunk.fog_pars_fragment,
//   THREE.ShaderChunk.logdepthbuf_pars_fragment,

uniform sampler2D colors;
uniform sampler2D map;
uniform sampler2D alphaMap;
uniform float useColors;
uniform float useMap;
uniform float useAlphaMap;
uniform float useDash;
uniform float dashArray;
uniform float dashOffset;
uniform float dashRatio;
uniform float visibility;
uniform float alphaTest;
uniform vec2 repeat;
uniform vec2 uvOffset;
uniform float uvRotation;
uniform vec2 uvScale;
uniform float count;

varying vec2 vUV;
varying vec4 vColor;
varying float vCounters;
flat in int vColorPointers;

vec2 rotateUV(vec2 uv, /*vec2 pivot,*/ float rotation) {
    float sine = sin(rotation);
    float cosine = cos(rotation);

    // uv -= pivot;
    uv.x = uv.x * cosine - uv.y * sine;
    uv.y = uv.x * sine + uv.y * cosine;
    // uv += pivot;

    return uv;
}

void main() {

    vec4 c = vColor;
    vec2 uv = rotateUV(vUV * uvScale, uvRotation) + uvOffset;
  
    if( useMap == 1. ) c *= texture2D( map, uv * repeat );
    if( useAlphaMap == 1. ) {
        c.a *= texture2D( alphaMap, uv * repeat ).a;
    }
    if( useDash == 1. ){
        c.a *= ceil(mod(vCounters + dashOffset, dashArray) - (dashArray * dashRatio));
    }
    if (useColors == 1.) {
        c = texture2D(colors, vec2(float(vColorPointers)/count, 0.));
        // c = texture2D(colors, vUV);
    } 

    gl_FragColor = c;
    gl_FragColor.a *= step(vCounters, visibility);

    if( gl_FragColor.a < alphaTest ) discard;

      //   THREE.ShaderChunk.fog_fragment,
}