precision mediump float;

uniform sampler2D uTexture;
uniform sampler2D uDepthTexture;
uniform float uSliderValue;

varying vec2 vTexCoord;

float width = 2048.0;
float height = 2048.0;


float znear = 1.0;
float zfar = 100.0; 

const int samples = 16;
float blurstart = 100.0 * uSliderValue;
float range = 4.0;
float maxblur = 10.0;
bool noise = true;
float namount = 0.0002;

vec2 rand(in vec2 coord) {
	float noiseX = ((fract(1.0 - coord.s * (width / 2.0)) * 0.25) + (fract(coord.t * (height / 2.0)) * 0.75)) * 2.0 - 1.0;
	float noiseY = ((fract(1.0 - coord.s * (width / 2.0)) * 0.75) + (fract(coord.t * (height / 2.0)) * 0.25)) * 2.0 - 1.0;

	if (noise) {
		noiseX = clamp(fract(sin(dot(coord, vec2(12.9898, 78.233))) * 43758.5453), 0.0, 1.0) * 2.0 - 1.0;
		noiseY = clamp(fract(sin(dot(coord, vec2(12.9898, 78.233) * 2.0)) * 43758.5453), 0.0, 1.0) * 2.0 - 1.0;
	}

	return vec2(noiseX, noiseY);
}

void main() {
	vec3 col = vec3(0.0);

	float zdepth = texture2D(uDepthTexture, vTexCoord).x;
	float depth = -zfar * znear / (zdepth * (zfar - znear) - zfar);
	float blur = (depth - blurstart) / range * 0.5;
	blur = clamp(blur * maxblur, 0.0, maxblur);

	vec2 noise = rand(vTexCoord) * namount * blur;

	float w = (1.0 / width) * blur + noise.x;
	float h = (1.0 / height) * blur + noise.y;

	float ss = 3.6 / sqrt(float(samples));
	float dz = 2.0 / float(samples);
	float l = 0.0;
	float z = 1.0 - dz / 2.0;
	float s = 1.0;

	for (int k = 0; k <= samples; k += 1) {
		float r = sqrt(1.0 - z);
		vec2 wh = vec2(cos(l) * r, sin(l) * r);
		col += texture2D(uTexture, vTexCoord + vec2(wh.x * w, wh.y * h)).rgb;
		z -= dz;
		l += ss / r;
	}

    gl_FragColor = vec4(col / float(samples), 1.0);
}
