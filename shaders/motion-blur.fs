precision mediump float;

uniform sampler2D uTexture;
uniform sampler2D uVelocityMap;

varying vec2 vTexCoord;

void main() {
    const int nSamples = 8;
    vec2 velocity = texture2D(uVelocityMap, vTexCoord).xy;
    vec4 result = texture2D(uTexture, vTexCoord);
    for (int i = 1; i < nSamples; i++) {
        vec2 offset = velocity * (float(i) / float(nSamples - 1) - 0.5);
        result += texture2D(uTexture, vTexCoord + offset);
    }
    result /= float(nSamples);
    gl_FragColor = result;
    // gl_FragColor = texture2D(uVelocityMap, vTexCoord);
}