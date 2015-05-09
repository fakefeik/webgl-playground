precision mediump float;
uniform sampler2D uTexture;
uniform sampler2D uDepthTexture;
uniform bool uDepthRender;
uniform float uSliderValue;
varying vec2 vTexCoord;
float width = 2048.0; //texture width
float height = 2048.0; //texture height

//------------------------------------------
//general stuff

/*
make sure that these two values are the same for your camera, otherwise distances will be wrong.
*/

float znear = 1.0; //camera clipping start
float zfar = 100.0; //camera clipping end

//user variables

const int samples = 16; //blur sample count
float blurstart = 100.0 * uSliderValue; //blur starting distance in Blender units
float range = 4.0; //blur fading distance in Blender units
float maxblur = 10.0; //maximum radius of blur
bool noise = true; //use noise instead of pattern dithering?
float namount = 0.0002; //sample dithering amount

//------------------------------------------

vec2 rand(in vec2 coord) //generating noise/pattern texture for dithering
{
	float noiseX = ((fract(1.0-coord.s*(width/2.0))*0.25)+(fract(coord.t*(height/2.0))*0.75))*2.0-1.0;
	float noiseY = ((fract(1.0-coord.s*(width/2.0))*0.75)+(fract(coord.t*(height/2.0))*0.25))*2.0-1.0;

	if (noise)
	{
		noiseX = clamp(fract(sin(dot(coord ,vec2(12.9898,78.233))) * 43758.5453),0.0,1.0)*2.0-1.0;
		noiseY = clamp(fract(sin(dot(coord ,vec2(12.9898,78.233)*2.0)) * 43758.5453),0.0,1.0)*2.0-1.0;
	}
	return vec2(noiseX,noiseY);
}

void main()
{
	vec3 col = vec3(0.0);

	float zdepth = texture2D(uDepthTexture,vTexCoord).x;
	float depth = -zfar * znear / (zdepth * (zfar - znear) - zfar);
	float blur = (depth-blurstart)/range*0.5;
	blur = clamp(blur*maxblur,0.0,maxblur);


	vec2 noise = rand(vTexCoord)*namount*blur;

	float w = (1.0/width)*blur+noise.x;
	float h = (1.0/height)*blur+noise.y;

	float ss = 3.6/sqrt(float(samples));
	float dz = 2.0/float(samples);
	float l = 0.0;
	float z = 1.0 - dz/2.0;
	float s = 1.0;

	for (int k = 0; k <= samples; k += 1)
	{
	float r = sqrt(1.0-z);
	vec2 wh = vec2(cos(l)*r, sin(l)*r);
	col += texture2D(uTexture,vTexCoord+vec2(wh.x*w, wh.y*h)).rgb;
	z -= dz;
	l += ss/r;
	}
    if (uDepthRender) {
        float c = texture2D(uDepthTexture, vTexCoord).r * 10.0 - 9.5;
        gl_FragColor = vec4(c, c, c, 1.0);
    } else {
        gl_FragColor.rgb = col/float(samples);
        gl_FragColor.a = texture2D(uTexture, vTexCoord).a; //1.0;
    }
}
