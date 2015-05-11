#extension GL_EXT_draw_buffers : require

precision mediump float;

uniform sampler2D uTexture;
uniform sampler2D uNormalTexture;
uniform sampler2D uShadowmap;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vNorm;
varying vec3 vLightDir;
varying vec2 vTexCoord;
varying vec4 vShadowCoord;

void main(void) {
    gl_FragData[0] = texture2D(uTexture, vTexCoord);
    gl_FragData[1] = vec4(vNormal, 1.0);
    gl_FragData[2] = vec4(vPosition, 1.0);
    
    //float bias = 0.005;
    vec3 n = normalize(vNorm);
    vec3 l = normalize(vLightDir);
    float cosTheta = clamp(dot(n, l), 0.0, 1.0);
    float bias = 0.005 * tan(acos(cosTheta));
    bias = clamp(bias, 0.0, 0.01);
    if (texture2D(uShadowmap, vShadowCoord.xy).r > vShadowCoord.z - bias) {
        gl_FragData[3] = vec4(1.0, 1.0, 1.0, 1.0);
    } else {
        gl_FragData[3] = vec4(0.1, 0.1, 0.1, 1.0);
    }
}
