precision mediump float;

uniform sampler2D uTexture;
uniform sampler2D uDepthTexture;
uniform bool uDepthRender;

varying vec2 vTexCoord;

void main(void) {
       if (uDepthRender) {
           float c = texture2D(uDepthTexture, vTexCoord).r * 10.0 - 9.5;
           gl_FragColor = vec4(c, c, c, 1.0);
       } else gl_FragColor = texture2D(uTexture, vTexCoord);
}