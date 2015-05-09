attribute vec3 aVertexPosition;

uniform mat4 uVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uMMatrix;

void main() {
    gl_Position = uPMatrix * uVMatrix * uMMatrix * vec4(aVertexPosition, 1.0);
}
