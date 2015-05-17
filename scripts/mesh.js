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

    var lineIndexBuffer = { };
    lineIndexBuffer.count = 0;
    if (indices) {
        var lineIndices = [];
        var i = 0
        while (i < indices.length) {
            var a = indices[i];
            var b = indices[i + 1];
            var c = indices[i + 2];
            i += 3
            lineIndices.push(a);
            lineIndices.push(b);
            lineIndices.push(b);
            lineIndices.push(c);
            lineIndices.push(c);
            lineIndices.push(a);
        }
        
        lineIndexBuffer.count = lineIndices.length;
        lineIndexBuffer.id = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lineIndexBuffer.id);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(lineIndices), gl.STATIC_DRAW);
    }

    var texture = null;
    this.initTexture = function(src) {
        texture = getTexture(src);
    };

    var normalTexture = null;
    this.initNormalTexture = function(src) {
        normalTexture = getTexture(src);
    };

    var detailTexture = null;
    this.initDetailTexture = function(src) {
        detailTexture = getTexture(src);
    };

    var specularTexture = null;
    this.initSpecularTexture = function(src) {
        specularTexture = getTexture(src);
    };
    
    this.setTexture = function(id) {
        texture = id;
    };

    this.setNormalTexture = function(id) {
        normalTexture = id;
    };

    this.setDetailTexture = function(id) {
        detailTexture = id;
    };

    this.setSpecularTexture = function(id) {
        specularTexture = id;
    };

    this.drawInner = function(handles, wireframe) {
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
            }
        }

        if (handles["aVertexNormal"] != -1) {
            if (normalBuffer.count != 0) {
                gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer.id);
                gl.enableVertexAttribArray(handles["aVertexNormal"]);
                gl.vertexAttribPointer(handles["aVertexNormal"], 3, gl.FLOAT, false, 0, 0);
            }
        }

        if (handles["aVertexTexCoord"] != -1) {
            if (texBuffer.count != 0) {
                gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer.id);
                gl.enableVertexAttribArray(handles["aVertexTexCoord"]);
                gl.vertexAttribPointer(handles["aVertexTexCoord"], 2, gl.FLOAT, false, 0, 0);
            }
        }

        if (texture) {
            gl.uniform1i(handles["uUseTexture"], 1);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(handles["uTexture"], 0);
        } else gl.uniform1i(handles["uUseTexture"], 0);

        if (normalTexture) {
            gl.uniform1i(handles["uUseNormal"], 1);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, normalTexture);
            gl.uniform1i(handles["uNormalTexture"], 1);
        } else gl.uniform1i(handles["uUseNormal"], 0);

        if (detailTexture) {
            gl.uniform1i(handles["uUseDetail"], 1);
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, detailTexture);
            gl.uniform1i(handles["uDetailTexture"], 2);
        } else gl.uniform1i(handles["uUseDetail"], 0);

        if (specularTexture) {
            gl.uniform1i(handles["uUseSpecular"], 1);
            gl.activeTexture(gl.TEXTURE3);
            gl.bindTexture(gl.TEXTURE_2D, specularTexture);
            gl.uniform1i(handles["uSpecularTexture"], 3);
        } else gl.uniform1i(handles["uUseSpecular"], 0);

        if (indexBuffer.count == 0)
            gl.drawArrays(wireframe ? gl.LINES : gl.TRIANGLES, 0, vertexBuffer.count);
        else {
            if (wireframe) {
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lineIndexBuffer.id);
                gl.drawElements(gl.LINES, lineIndexBuffer.count, gl.UNSIGNED_SHORT, 0);
            } else {
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer.id);
                gl.drawElements(gl.TRIANGLES, indexBuffer.count, gl.UNSIGNED_SHORT, 0);
            }
        }
        gl.disableVertexAttribArray(handles["aVertexPosition"]);
        gl.disableVertexAttribArray(handles["aVertexNormal"]);
        gl.disableVertexAttribArray(handles["aVertexTexCoord"]);
    }

    this.draw = function(handles) {
        this.drawInner(handles);
    }

    this.drawWireframe = function(handles) {
        this.drawInner(handles, true);
    };
}

function getPlane(width, height, width_segments, height_segments, tex, f) {
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
            textures.push(x / width_segments * tex);
            textures.push(1 - y / height_segments * tex);

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

function getTexture(src) {
    var texture = gl.createTexture();
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
    return texture;
}