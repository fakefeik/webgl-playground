function Shader(gl, vs, fs) {
    this.handles = { };
    
    var id = 0;

    id = gl.createProgram();
    gl.attachShader(id, getShader(gl, vs, true));
    gl.attachShader(id, getShader(gl, fs, false));
    gl.linkProgram(id);
    
    if (!gl.getProgramParameter(id, gl.LINK_STATUS))
        alert("Shit's Fucked");

    function getShader(gl, src, isVertex) {
        var request = new XMLHttpRequest();
        request.open('GET', 'shaders/' + src, false);
        request.send();
        if (request.status == 200) {
            var shader;
            if (isVertex) shader = gl.createShader(gl.VERTEX_SHADER);
            else shader = gl.createShader(gl.FRAGMENT_SHADER);

            gl.shaderSource(shader, request.responseText);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                alert("Couldn't compile '" + src + "':\n" + gl.getShaderInfoLog(shader));
                return null;
            }

            return shader;
        } else alert(request.status);
        return null;
    }
    
    this.getId = function() {
        return id;
    };
    
    this.bind = function() {
        gl.useProgram(id);
    };
    
    this.unbind = function() {
        gl.useProgram(0);
    };

    this.saveAttribLocations = function(attribNames) {
        for (var i = 0; i < attribNames.length; i++)
            this.handles[attribNames[i]] = gl.getAttribLocation(id, attribNames[i]);
    };

    this.saveUniformLocations = function(uniformNames) {
        for (var i = 0; i < uniformNames.length; i++)
            this.handles[uniformNames[i]] = gl.getUniformLocation(id, uniformNames[i]);
    };
}
