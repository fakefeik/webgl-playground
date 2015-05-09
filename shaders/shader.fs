#extension GL_EXT_draw_buffers : require

precision mediump float;

uniform sampler2D uTexture;
uniform sampler2D uNormalTexture;
uniform sampler2D uShadowmap;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vTexCoord;
varying vec4 vShadowCoord;

void main(void) {
    gl_FragData[1] = texture2D(uTexture, vTexCoord);
    gl_FragData[2] = vec4(vNormal, 1.0);

    float bias = 0.005;
    if (texture2D(uShadowmap, vShadowCoord.xy).r > vShadowCoord.z - bias) {
        gl_FragData[3] = vec4(1.0, 1.0, 1.0, 1.0);
    } else {
        gl_FragData[3] = vec4(0.1, 0.1, 0.1, 1.0);
    }
}
