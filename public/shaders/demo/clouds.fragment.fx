precision highp float;

varying vec3 vPositionW;
varying vec3 vNormalW;

varying vec2 vUV;

uniform sampler2D cloudsTexture;
uniform vec3 cameraPosition;
uniform vec3 lightPosition;


float computeFresnelTerm(vec3 viewDirection, vec3 normalW, float bias, float power)
{
    float fresnelTerm = pow(bias + dot(viewDirection, normalW), power);
    return clamp(fresnelTerm, 0., 1.);
}


void main(void) {
    vec3 viewDirectionW = normalize(cameraPosition - vPositionW); 

    // Light
    vec3 direction = lightPosition - vPositionW; 
    vec3 lightVectorW = normalize(direction); 

    // lighting
    float lightCos = dot(vNormalW, lightVectorW); 
    float lightDiffuse = max(0., lightCos); 

    vec3 color = texture2D(cloudsTexture, vUV).rgb; 
    float globalAlpha = clamp(color.r, 0.0, 1.0); 

    // Fresnel
    float fresnelTerm = computeFresnelTerm(viewDirectionW, vNormalW, 0.72, 5.0);

    float resultAlpha; 

    if (fresnelTerm < 0.95) {
        float envDiffuse = clamp(pow(fresnelTerm - 0.92, 1.0/2.0) * 2.0, 0.0, 1.0); 
        resultAlpha = fresnelTerm * envDiffuse * lightCos; 
        color = color / 2.0 + vec3(0.0,0.5,0.7) ; 
    } else {
        resultAlpha = fresnelTerm * globalAlpha * lightDiffuse;
    }

    float backLightCos = dot(viewDirectionW, lightVectorW); 
    float cosConst = 0.9; 

    if (backLightCos < -cosConst) {
        float sunHighlight = pow(backLightCos+cosConst, 2.0); 
        if (fresnelTerm < 0.9) {
            sunHighlight *= 65.0;
            float envDiffuse = clamp(pow(fresnelTerm - 0.92, 1.0/2.0) * 2.0, 0.0, 1.0);
            resultAlpha = sunHighlight; 
            color *= lightDiffuse; 
            color.r += sunHighlight; 
            color.g += sunHighlight / 2.0; 
            gl_FragColor = vec4(color, resultAlpha);
            return;
        } else {
            sunHighlight *= 95.0; 
            sunHighlight *= 1.0 + lightCos; 
            color = vec3(sunHighlight,sunHighlight / 2.0,0.0);
            resultAlpha = sunHighlight; 
            gl_FragColor = vec4(color, resultAlpha);
            return;
        }
    }

    gl_FragColor = vec4(color * lightDiffuse, resultAlpha);
}