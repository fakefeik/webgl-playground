function Camera(position, target, up) {
    this.position = vec3.create(position);
    this.target = vec3.create(target);
    this.up = vec3.create(up);

    var horizontalAngle = Math.PI;
    var verticalAngle = 0;

    /**
     * Moves camera in relative direction
     *
     * @param {Number} forward Forward/backward direction (positive for forward, negative for backward movement)
     * @param {Number} right Right/left direction
     * @param {Number} up Up/down direction
     */
    this.move = function(forward, right, up) {
        var direction = vec3.subtract(this.target, this.position, vec3.create());
        var rightVec = vec3.cross(direction, this.up, vec3.create());

        vec3.add(this.position, vec3.scale(direction, forward, vec3.create()));
        vec3.add(this.position, vec3.scale(rightVec, right, vec3.create()));

        vec3.add(this.position, direction, this.target);
    };

    /**
     * Rotates camera relative to current rotation
     *
     * @param {Number} rotationY Look up/down
     * @param {Number} rotationX Look right/left
     */
    this.rotate = function(rotationY, rotationX) {
        horizontalAngle += rotationX;
        verticalAngle += rotationY;

        var sinH = Math.sin(horizontalAngle);
        var cosH = Math.cos(horizontalAngle);
        var sinV = Math.sin(verticalAngle);
        var cosV = Math.cos(verticalAngle);
        var direction = vec3.createFrom(cosV * sinH, sinV, cosV * cosH);
        var right = vec3.createFrom(Math.sin(horizontalAngle - Math.PI / 2), 0, Math.cos(horizontalAngle - Math.PI / 2));

        vec3.cross(right, direction, this.up);
        vec3.add(this.position, direction, this.target);
    };
}
