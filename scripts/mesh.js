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
        
        if (vertexBuffer.count != 0) {
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer.id);
            gl.enableVertexAttribArray(handles["aVertexPosition"]);
            gl.vertexAttribPointer(handles["aVertexPosition"], 3, gl.FLOAT, false, 0, 0);
        }

        if (normalBuffer.count != 0) {
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer.id);
            gl.enableVertexAttribArray(handles["aVertexNormal"]);
            gl.vertexAttribPointer(handles["aVertexNormal"], 3, gl.FLOAT, false, 0, 0);
        }

        if (texBuffer.count != 0) {
            gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer.id);
            gl.enableVertexAttribArray(handles["aVertexTexCoord"]);
            gl.vertexAttribPointer(handles["aVertexTexCoord"], 2, gl.FLOAT, false, 0, 0);
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
    }
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
