precision mediump float;

uniform sampler2D uAlbedoMap;
uniform sampler2D uPositionMap;
uniform sampler2D uNormalMap;
uniform sampler2D uSpecularMap;
uniform sampler2D uShadowMap;

uniform vec3 uLightingDirection;
uniform vec3 uDirectionalColor;
uniform vec3 uAmbientColor;

uniform bool uUseShadow;

varying vec2 vTexCoord;

void main(void) {
    vec3 normal = normalize(texture2D(uNormalMap, vTexCoord).rgb * 2.0 - 1.0);
    float directionalLightWeighting = max(dot(normal, uLightingDirection), 0.0);
    vec3 lightWeighting = uAmbientColor + uDirectionalColor * directionalLightWeighting;
    vec3 shadowColor;
    if (uUseShadow) shadowColor = texture2D(uShadowMap, vTexCoord).rgb;
    else shadowColor = vec3(1.0);
    gl_FragColor = vec4(texture2D(uAlbedoMap, vTexCoord).rgb * lightWeighting * shadowColor, 1.0);
}
