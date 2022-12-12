precision highp float;

// Varying
varying vec2 vUV;
varying vec3 vPositionW;
varying vec3 vNormalW;

// Refs
uniform vec3 lightPosition;
uniform sampler2D diffuseTexture;
uniform sampler2D nightTexture;


void main(void) {
    vec3 direction = lightPosition - vPositionW;
    vec3 lightVectorW = normalize(direction);


    // diffuse
    float lightDiffuse = max(0.05, dot(vNormalW, lightVectorW));

    vec3 color;
    vec4 nightColor = texture2D(nightTexture, vUV).rgba;
    vec3 diffuseColor = texture2D(diffuseTexture, vUV).rgb;

    color = diffuseColor * lightDiffuse + (nightColor.rgb * nightColor.a * pow((1.0 - lightDiffuse), 6.0));
    gl_FragColor = vec4(color, 1.0);
}