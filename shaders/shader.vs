precision mediump float;

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aVertexTexCoord;

uniform mat4 uVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uMMatrix;
uniform mat4 uBMatrix;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vTexCoord;
varying vec4 vShadowCoord;

void main(void) {
    vPosition = (uVMatrix * uMMatrix * vec4(aVertexPosition, 1.0)).xyz;
    vNormal = aVertexNormal;
    vTexCoord = aVertexTexCoord;
    vNormal = normalize((uMMatrix * vec4(vNormal, 0.0)).xyz) / 2.0 + 0.5;
    vShadowCoord = uBMatrix * uMMatrix * vec4(aVertexPosition, 1.0);
    gl_Position = uPMatrix * uVMatrix * uMMatrix * vec4(aVertexPosition, 1.0);
}
