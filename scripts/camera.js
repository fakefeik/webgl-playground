function Camera(position, target, up) {
    this.position = position;
    this.target = target;
    this.up = up;

    var irl = Math.PI; // !
    var iud = 0;

    /**
     * Moves camera in relative direction
     *
     * @param {Number} fb Forward/backward direction (positive for forward, negative for backward movement)
     * @param {Number} rl Right/left direction
     * @param {Number} ud Up/down direction
     */
    this.move = function(fb, rl, ud) {
        var v = [
            this.target[0] - this.position[0],
            this.target[2] - this.position[2]
        ];
        //vec2.normalize(v);
        this.position[0] += v[0] * fb;
        this.position[2] += v[1] * fb;
        this.target[0] += v[0] * fb;
        this.target[2] += v[1] * fb;

        this.position[0] -= v[1] * rl;
        this.position[2] += v[0] * rl;
        this.target[0] -= v[1] * rl;
        this.target[2] += v[0] * rl;

        this.position[1] += ud;
        this.target[1] += ud;
    };

    /**
     * Rotates camera relative to current rotation
     *
     * @param {Number} ud Look up/down
     * @param {Number} rl Look right/left
     */
    this.rotate = function(ud, rl) {
        //if (iud + ud > -Math.PI / 2 && iud + ud < Math.PI / 2)
            iud += ud;
        irl += rl;
        var mat = mat4.create();
        mat4.identity(mat);
        mat4.rotateX(mat, iud);
        mat4.rotateY(mat, irl);
        var vec = vec4.createFrom(0, 0, 1, 1);
        var vec2 = mat4.multiplyVec4(mat, vec);
        target[0] = vec2[0] + position[0];
        target[1] = vec2[1] + position[1];
        target[2] = vec2[2] + position[2];
    };
}
