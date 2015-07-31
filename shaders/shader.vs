precision mediump float;

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aVertexTexCoord;

uniform mat4 uPVMatrix;
uniform mat4 uPMMatrix;
uniform mat4 uVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uMMatrix;
uniform mat4 uBMatrix;
uniform vec3 uLightInvDir;

varying vec3 vNormal;
varying vec3 vNorm;
varying vec3 vLightDir;
varying vec2 vTexCoord;
varying vec4 vShadowCoord;
varying vec4 vPosition;
varying vec4 vPrevPosition;

void main(void) {
    vPosition = uPMatrix * uVMatrix * uMMatrix * vec4(aVertexPosition, 1.0);
    vPrevPosition = uPMatrix * uPVMatrix * uPMMatrix * vec4(aVertexPosition, 1.0);
    vNormal = (uMMatrix * vec4(aVertexNormal, 0.0)).xyz;
    vTexCoord = aVertexTexCoord;
    //vNormal = normalize((uMMatrix * vec4(vNormal, 0.0)).xyz) / 2.0 + 0.5;
    vNorm = (uVMatrix * uMMatrix * vec4(aVertexNormal, 0.0)).xyz;
    vLightDir = (uVMatrix * vec4(uLightInvDir, 0.0)).xyz;
    vShadowCoord = uBMatrix * uMMatrix * vec4(aVertexPosition, 1.0);
    gl_Position = vPosition;
}
