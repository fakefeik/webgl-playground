function Mesh(gl, vertices, indices, tex, normals) {
    var modelMatrix = mat4.create();
    mat4.identity(modelMatrix);

    this.position = [-1.5, 0.0, -7.0];
    this.rotation = [0.0, 0.0, 0.0];
    this.scale = [1.0, 1.0, 1.0];

    var vertexBuffer = { };
    vertexBuffer.count = 0;
    if (vertices) {
        vertexBuffer.count = vertices.length / 3;
        vertexBuffer.id = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer.id);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    }

    var normalBuffer = { };
    normalBuffer.count = 0;
    if (normals) {
        normalBuffer.count = normals.length / 3;
        normalBuffer.id = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer.id);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    }

    var texBuffer = { };
    texBuffer.count = 0;
    if (tex) {
        texBuffer.count = tex.length / 2;
        texBuffer.id = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer.id);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tex), gl.STATIC_DRAW);
    }

    var indexBuffer = { };
    indexBuffer.count = 0;
    if (indices) {
        indexBuffer.count = indices.length;
        indexBuffer.id = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer.id);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    }

    var texture;
    this.initTexture = function(src) {
        texture = gl.createTexture();
        texture.image = new Image();
        texture.image.onload = function() {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);
        };
        texture.image.src = src;
    };

    var normalTexture = null;
    this.initNormalTexture = function(src) {
        normalTexture = gl.createTexture();
        normalTexture.image = new Image();
        normalTexture.image.onload = function() {
            gl.bindTexture(gl.TEXTURE_2D, normalTexture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, normalTexture.image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);
        };
        normalTexture.image.src = src;
    };
    
    this.setTexture = function(id) {
        texture = id;
    };

    this.draw = function(handles) {
        mat4.identity(modelMatrix);
        mat4.translate(modelMatrix, this.position);
        mat4.rotateX(modelMatrix, this.rotation[0]);
        mat4.rotateY(modelMatrix, this.rotation[1]);
        mat4.rotateZ(modelMatrix, this.rotation[2]);
        mat4.scale(modelMatrix, this.scale);

        gl.uniformMatrix4fv(handles["uMMatrix"], false, modelMatrix);
        
        if (handles["aVertexPosition"] != -1) {
            if (vertexBuffer.count != 0) {
                gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer.id);
                gl.enableVertexAttribArray(handles["aVertexPosition"]);
                gl.vertexAttribPointer(handles["aVertexPosition"], 3, gl.FLOAT, false, 0, 0);
            } //else gl.disableVertexAttribArray(handles["aVertexPosition"]);
        }

        if (handles["aVertexNormal"] != -1) {
            if (normalBuffer.count != 0) {
                gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer.id);
                gl.enableVertexAttribArray(handles["aVertexNormal"]);
                gl.vertexAttribPointer(handles["aVertexNormal"], 3, gl.FLOAT, false, 0, 0);
            } //else gl.disableVertexAttribArray(handles["aVertexNormal"]);
        }

        if (handles["aVertexTexCoord"] != -1) {
            if (texBuffer.count != 0) {
                gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer.id);
                gl.enableVertexAttribArray(handles["aVertexTexCoord"]);
                gl.vertexAttribPointer(handles["aVertexTexCoord"], 2, gl.FLOAT, false, 0, 0);
            } //else gl.disableVertexAttribArray(handles["aVertexTexCoord"]);
        }

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(handles["uTexture"], 0);

        if (indexBuffer.count == 0)
            gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.count);
        else {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer.id);
            gl.drawElements(gl.TRIANGLES, indexBuffer.count, gl.UNSIGNED_SHORT, 0);
        }
        
        gl.disableVertexAttribArray(handles["aVertexPosition"]);
        gl.disableVertexAttribArray(handles["aVertexNormal"]);
        gl.disableVertexAttribArray(handles["aVertexTexCoord"]);
    }
}

function getPlane(width, height, width_segments, height_segments, f) {
    function tryGetPerlin(x, y) {
        try {
            return f(x, y);
        } catch (error) {
            return 0;
        }
    };

    var vertices = [];
    var indices = [];
    var normals = [];
    var textures = [];
    var x_offset = width / -2;
    var y_offset = height / -2;
    var x_width = width / width_segments;
    var y_height = height / height_segments;
    var w = width_segments + 1;
    for (var y = 0; y < height_segments + 1; y++)
        for (var x = 0; x < width_segments + 1; x++) {
            textures.push(x / width_segments);
            textures.push(1 - y / height_segments);

            var vX = x_offset + x * x_width;
            var vY = y_offset + y * y_height;

            vertices.push(vX);
            vertices.push(vY);
            vertices.push(tryGetPerlin(vX, vY));

            var off = [1.0, 1.0, 0.0];
            var hL = tryGetPerlin(vX - off[0], vY - off[2]);
            var hR = tryGetPerlin(vX + off[0], vY + off[2]);
            var hD = tryGetPerlin(vX - off[2], vY - off[1]);
            var hU = tryGetPerlin(vX + off[2], vY + off[1]);

            var N = [0, 0, 2];
            N[0] = hL - hR;
            N[1] = hD - hU;
            N[2] = -2.0;
            N = vec3.normalize(N);

            normals.push(N[0]);
            normals.push(N[1]);
            normals.push(N[2]);

            var n = y * (width_segments + 1) + x;
            if (y < height_segments && x < width_segments) {
                indices.push(n);
                indices.push(n + 1);
                indices.push(n + w);

                indices.push(n + 1);
                indices.push(n + 1 + w);
                indices.push(n + 1 + w - 1);
            }
        }
    return new Mesh(gl, vertices, indices, textures, normals);
}

function getQuad(gl, x1, y1, x2, y2, z) {
    var vertices = [
        x2, y2, z,
        x1, y2, z,
        x2, y1, z,
        x1, y1, z
    ];
    var tex = [1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0];
    var indices = [0, 1, 2, 1, 3, 2];
    return new Mesh(gl, vertices, indices, tex);
}
