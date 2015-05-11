precision mediump float;

uniform sampler2D uTexture;
uniform sampler2D uDepthTexture;
uniform float uKernel[9];
uniform float uSliderValue;

varying vec2 vTexCoord;

void main(void) {
    float offset = texture2D(uDepthTexture, vTexCoord).r / 30.0 * uSliderValue;
    vec2 offsets[9];
    offsets[0] = vec2(-offset, offset);
    offsets[1] = vec2(0.0, offset);
    offsets[2] = vec2(offset, offset);
    offsets[3] = vec2(-offset, 0.0);
    offsets[4] = vec2(0.0, 0.0);
    offsets[5] = vec2(offset, 0.0);
    offsets[6] = vec2(-offset, -offset);
    offsets[7] = vec2(0.0, -offset);
    offsets[8] = vec2(offset, -offset);

    vec3 sample[9];
    for (int i = 0; i < 9; i++)
        sample[i] = texture2D(uTexture, vTexCoord.xy + offsets[i]).rgb;
    vec3 col;
    for (int i = 0; i < 9; i++)
        col += sample[i] * uKernel[i];

    gl_FragColor = vec4(col * texture2D(uDepthTexture, vTexCoord).r, 1.0);
}
