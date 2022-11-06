//   THREE.ShaderChunk.fog_pars_fragment,
//   THREE.ShaderChunk.logdepthbuf_pars_fragment,

uniform sampler2D map;
uniform sampler2D alphaMap;
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

varying vec2 vUV;
varying vec4 vColor;
varying float vCounters;

void main() {

      //   THREE.ShaderChunk.logdepthbuf_fragment,

    vec4 c = vColor;
    vec2 uv = vUV + uvOffset;
    if( useMap == 1. ) c *= texture2D( map, uv * repeat );
    if( useAlphaMap == 1. ) c.a *= texture2D( alphaMap, uv * repeat ).a;
    if( c.a < alphaTest ) discard;
    if( useDash == 1. ){
        c.a *= ceil(mod(vCounters + dashOffset, dashArray) - (dashArray * dashRatio));
    }
    gl_FragColor = c;
    gl_FragColor.a *= step(vCounters, visibility);

      //   THREE.ShaderChunk.fog_fragment,
}