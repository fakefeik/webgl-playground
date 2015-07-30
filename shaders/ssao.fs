precision mediump float;

uniform sampler2D uPositionMap;
uniform sampler2D uNormalMap;
uniform sampler2D uDepthMap;
uniform sampler2D uNoiseMap;

uniform float uWidth;
uniform float uHeight;

const int KERNEL_SIZE = 16;

uniform vec3 uKernelOffsets[KERNEL_SIZE];
uniform float uKernelRadius;
uniform float uSsaoPower;
uniform float uNoiseSize;

uniform mat4 uIPMatrix; // Inverse projection
uniform mat4 uPMatrix; // projection

varying vec2 vTexCoord;

void main() {
    float depth = texture2D(uDepthMap, vTexCoord).x;
    vec3 normal = texture2D(uNormalMap, vTexCoord).xyz * 2.0 - 1.0;
    normal = normalize(normal);

    vec4 projectedPos = vec4(    
        vTexCoord * 2.0 - 1.0, 
        depth * 2.0 - 1.0,
        1.0
    );

    vec4 pos = uIPMatrix * projectedPos;
    pos /= pos.w;

    vec2 vRandTexCoord = vec2(vTexCoord) / vec2(uWidth, uHeight) * uNoiseSize;
    vec3 rvec = texture2D(uNoiseMap, vRandTexCoord).xyz * 2.0 - 1.0;

    // gram-schmidt
    vec3 tangent = normalize(rvec - normal * dot(rvec, normal));
    vec3 bitangent = cross(normal, tangent);
    mat3 tbn = mat3(tangent, bitangent, normal);

    float occlusion = 0.0;
    for (int i = 0; i < KERNEL_SIZE; i++) {
        vec3 sample = (tbn * uKernelOffsets[i]) * uKernelRadius;
        sample = sample + pos.xyz;
        
        vec4 offset = vec4(sample, 1.0);
        offset = uPMatrix * offset;
        offset /= offset.w;
        offset.xyz = offset.xyz * 0.5 + 0.5;
        
        float sampleDepth = texture2D(uDepthMap, offset.xy).x;
        
        vec4 throwaway = vec4(offset.xy, sampleDepth, 1.0);
        throwaway.xyz = throwaway.xyz * 2.0 - 1.0;
        throwaway = uIPMatrix * throwaway;
        throwaway /= throwaway.w;
        
        if (throwaway.z >= sample.z) {
            float rangeCheck = abs(pos.z - throwaway.z) < uKernelRadius ? 1.0 : 0.0;
            occlusion += 1.0 * rangeCheck; 
        }
    }
  
    occlusion = 1.0 - (occlusion / float(KERNEL_SIZE));
    occlusion = pow(occlusion, uSsaoPower);

    gl_FragColor = vec4(occlusion, occlusion, occlusion, 1.0);
}