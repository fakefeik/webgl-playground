precision mediump float;

const int MAX_KERNEL_SIZE = 16;

uniform sampler2D uDepthMap;
uniform sampler2D uNormalMap;
uniform sampler2D uPositionMap;
uniform sampler2D uNoiseMap;

uniform int uKernelSize;
uniform vec3 uKernelOffsets[MAX_KERNEL_SIZE];
uniform mat4 uPMatrix;

uniform float uWidth;
uniform float uHeight;
uniform float uNoiseSize;

varying vec2 vTexCoord;

float linearizeDepth(float depth, mat4 projMatrix) {
	return projMatrix[3][2] / (depth - projMatrix[2][2]);
}

void main() {
    float radius = 1.5;
	vec2 noiseScale = vec2(uWidth, uHeight) / uNoiseSize;
	// float thfow = tan(45.0 / 2.0);
	// vec3 viewray = vec3(
	// 	(vTexCoord.x * 2.0 - 1.0) * thfow * uWidth / uHeight, 
	// 	(vTexCoord.y * 2.0 - 1.0) * thfow,
	// 	1.0
	// );

	// float depth = linearizeDepth(texture2D(uDepthMap, vTexCoord).r, uPMatrix);
	//float depth = texture2D(uDepthMap, vTexCoord).r;

	//vec3 origin = viewray * depth;
	vec3 origin = texture2D(uPositionMap, vTexCoord).rgb;// * 2.0 - 1.0;
	vec3 normal = texture2D(uNormalMap, vTexCoord).rgb * 2.0 - 1.0;
	normal = normalize(normal);

	vec3 rvec = texture2D(uNoiseMap, vTexCoord / noiseScale).xyz * 2.0 - 1.0;
	vec3 tangent = normalize(rvec - normal * dot(rvec, normal));
	vec3 bitangent = cross(normal, tangent);
	mat3 tbn = mat3(tangent, bitangent, normal);

	float occlusion = 0.0;
	for (int i = 0; i < MAX_KERNEL_SIZE; i++) {
		vec3 sample = tbn * uKernelOffsets[i];
		sample = sample * radius + origin;
		// gl_FragColor = vec4((uPMatrix * vec4(sample, 1.0)).rgb, 1.0);
		vec4 offset = vec4(sample, 1.0);
		offset = uPMatrix * offset;

		offset.xy /= offset.w;
		offset.xy = offset.xy * 0.5 + 0.5;
		// gl_FragColor = offset;
		// float sampleDepth = linearizeDepth(texture2D(uDepthMap, offset.xy).r, uPMatrix);
		//gl_FragColor = vec4(sampleDepth, 0.0, 0.0, 1.0);
		float sampleDepth = texture2D(uDepthMap, offset.xy).r;
		// gl_FragColor = vec4(sampleDepth, 0.0, 0.0, 1.0);
		//float rangeCheck = 1.0;
		float rangeCheck = abs(origin.z - sampleDepth) < radius ? 1.0 : 0.0;
		occlusion += (sampleDepth <= sample.z ? 1.0 : 0.0) * rangeCheck;
	}
	occlusion = 1.0 - (occlusion / float(uKernelSize));
	// gl_FragColor = vec4(occlusion, occlusion, occlusion, 1.0);
	// gl_FragColor = vec4(origin, 1.0);
	// gl_FragColor = texture2D(uNoiseMap, vTexCoord);
	gl_FragColor = uPMatrix * texture2D(uPositionMap, vTexCoord);
}