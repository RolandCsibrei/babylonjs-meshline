 // THREE.ShaderChunk.logdepthbuf_pars_vertex,
      // THREE.ShaderChunk.fog_pars_vertex,

attribute vec3 offset;
attribute vec3 previous;
attribute vec3 next;
attribute float side;
attribute float width;
attribute float counters;
attribute vec2 uv;
attribute vec3 position;

uniform vec2 resolution;
uniform float lineWidth;
uniform vec3 color;
uniform float opacity;
uniform float sizeAttenuation;
uniform mat4 projection;
uniform mat4 view;
uniform mat4 worldViewProjection;

varying vec2 vUV;
varying vec4 vColor;
varying float vCounters;
flat out int vColorPointers;

vec2 fix( vec4 i, float aspect ) {

    vec2 res = i.xy / i.w;
    res.x *= aspect;
    return res;

}

void main() {
    vCounters = counters;
    vColorPointers = gl_VertexID;
    
    float aspect = resolution.x / resolution.y;

    vColor = vec4( color, opacity );
    vUV = uv;

    // mat4 m = projection * view;
    mat4 m = worldViewProjection;
    vec3 positionOffset = offset;
    vec4 finalPosition = m * vec4( position + positionOffset, 1.0 );
    vec4 prevPos = m * vec4( previous + positionOffset, 1.0 );
    vec4 nextPos = m * vec4( next + positionOffset, 1.0 );

    vec2 currentP = fix( finalPosition, aspect );
    vec2 prevP = fix( prevPos, aspect );
    vec2 nextP = fix( nextPos, aspect );

    float w = lineWidth * width;

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
    normal *= projection;
    if( sizeAttenuation == 0. ) {
        normal.xy *= finalPosition.w;
        normal.xy /= ( vec4( resolution, 0., 1. ) * projection ).xy;
    }

    finalPosition.xy += normal.xy * side;

    gl_Position = finalPosition;

      //   THREE.ShaderChunk.logdepthbuf_vertex,
      //   THREE.ShaderChunk.fog_vertex &    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
      //   THREE.ShaderChunk.fog_vertex,
}