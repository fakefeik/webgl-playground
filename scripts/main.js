var gl;
var shaders = { };
var extensions = { };
var framebuffers = { };
var scene = { };
var quads = { };
var projectionMatrix;
var viewMatrix;
var cameras = { };
var interface;
var pressedKeys = { };
var light = true;
var drawDepth = false;
var drawNormal = false;
var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;
var windowWidth;
var windowHeight;
var scale = 1.0;
var defaultWindowSize = 1024.0;
var lastUpdate;

var sharpenKernel = [
    -1, -1, -1,
    -1, 9, -1,
    -1, -1, -1
];

var blurKernel = [
    1.0 / 16, 2.0 / 16, 1.0 / 16,
    2.0 / 16, 4.0 / 16, 2.0 / 16,
    1.0 / 16, 2.0 / 16, 1.0 / 16
];

var edgeKernel = [
    1, 1, 1,
    1, -8, 1,
    1, 1, 1
];

function start() {
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);

    if (gl) {
        extensions.depthExtension = gl.getExtension("WEBGL_depth_texture");
        extensions.bufferExtension = gl.getExtension("WEBGL_draw_buffers");

        framebuffers.framebuffer = new Framebuffer(gl, defaultWindowSize, defaultWindowSize, ["colorTexture", "albedoTexture", "normalTexture", "shadowTexture"], false, extensions.bufferExtension);
        framebuffers.shadowFramebuffer = new Framebuffer(gl, defaultWindowSize, defaultWindowSize, []);
        framebuffers.deferredFramebuffer = new Framebuffer(gl, defaultWindowSize, defaultWindowSize, ["renderedTexture"]);

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
            projectionMatrix = mat4.perspective(45, canvas.width / canvas.height, 0.1, 100);
            windowHeight = canvas.height;
            windowWidth = canvas.width;

            framebuffers.framebuffer.resize(windowWidth * scale, windowHeight * scale);
            framebuffers.deferredFramebuffer.resize(windowWidth * scale, windowHeight * scale);
        }

        resize();
        window.onresize = resize;

        cameras.camera = new Camera([0, 0, 1.5], [0, 0, -5], [0, 1, 0]);
        cameras.shadowCamera = new Camera([2, 20.900000000000027, -5.966682030726198], [1.536713802441966, 19.970923089981106, -6.079460187721971], [0, 1, 0]);

        var biasMatrix = mat4.createFrom(
            0.5, 0.0, 0.0, 0.0,
            0.0, 0.5, 0.0, 0.0,
            0.0, 0.0, 0.5, 0.0,
            0.5, 0.5, 0.5, 1.0
        );

        var depthProjection = mat4.ortho(-10, 10, -10, 10, -10, 40);
        var depthView = mat4.lookAt(cameras.shadowCamera.position, cameras.shadowCamera.target, cameras.shadowCamera.up);
        var out = mat4.create();
        var depthBiasMVP = mat4.multiply(biasMatrix, mat4.multiply(depthProjection, depthView, out));


        shaders.shadowpassShader = new Shader(gl, "shadow-pass.vs", "shadow-pass.fs");
        shaders.shadowpassShader.saveAttribLocations(["aVertexPosition", "aVertexTexCoord", "aVertexNormal"]);
        shaders.shadowpassShader.saveUniformLocations(["uMMatrix", "uPMatrix", "uVMatrix"]);

        shaders.shadowpassShader.bind();
        gl.uniformMatrix4fv(shaders.shadowpassShader.handles["uPMatrix"], false, depthProjection);
        

        shaders.defaultShader = new Shader(gl, "shader.vs", "shader.fs");
        shaders.defaultShader.saveAttribLocations(["aVertexPosition", "aVertexColor", "aVertexTexCoord", "aVertexNormal"]);
        shaders.defaultShader.saveUniformLocations([
            "uTexture", 
            "uNormalTexture", 
            "uShadowmap", 
            "uMMatrix", 
            "uPMatrix", 
            "uVMatrix", 
            "uBMatrix"
        ]);
        shaders.defaultShader.bind();
        gl.uniformMatrix4fv(shaders.defaultShader.handles["uPMatrix"], false, projectionMatrix);
        gl.uniformMatrix4fv(shaders.defaultShader.handles["uBMatrix"], false, depthBiasMVP);


        shaders.deferredShader = new Shader(gl, "screenspace.vs", "deferred.fs");
        shaders.deferredShader.saveAttribLocations(["aVertexPosition", "aVertexTexCoord"]);
        shaders.deferredShader.saveUniformLocations([
            "uAlbedoMap", 
            "uPositionMap", 
            "uNormalMap",
            "uShadowMap",
            "uLightingDirection",
            "uDirectionalColor",
            "uAmbientColor"
        ]);


        shaders.blurShader = new Shader(gl, "screenspace.vs", "screenspace-blur.fs");
        shaders.blurShader.saveAttribLocations(["aVertexPosition", "aVertexTexCoord"]);
        shaders.blurShader.saveUniformLocations([
            "uTexture",
            "uDepthTexture",
            "uKernel",
            "uDepthRender",
            "uSliderValue"
        ]);
        shaders.blurShader.bind();
        gl.uniform1fv(shaders.blurShader.handles["uKernel"], blurKernel);


        shaders.depthBlurShader = new Shader(gl, "screenspace.vs", "some-blur.fs");
        shaders.depthBlurShader.saveAttribLocations(["aVertexPosition", "aVertexTexCoord"]);
        shaders.depthBlurShader.saveUniformLocations([
            "uTexture",
            "uDepthTexture",
            "uDepthRender",
            "uSliderValue"
        ]);
        shaders.depthBlurShader.bind();


        shaders.screenspaceShader = new Shader(gl, "screenspace.vs", "screenspace.fs");
        shaders.screenspaceShader.saveAttribLocations(["aVertexPosition", "aVertexTexCoord"]);
        shaders.screenspaceShader.saveUniformLocations([
            "uTexture",
            "uDepthTexture",
            "uDepthRender"
        ]);
        

        scene.mesh = Load("models/sponza.jm");
        scene.mesh.initTexture("textures/yoba.png");
        
        scene.sphere = Load("models/sphere.jm");
        scene.sphere.initTexture("textures/yoba.png");
        scene.sphere.position[1] = 2;

        scene.cube = Load("models/cube.jm");
        scene.cube.initTexture("textures/yoba.png");
        scene.cube.position = [2, 2, -8.0];
        scene.cube.rotation = [-0.25, -0.25, -1];

        quads.square = getQuad(gl, -1, -1, 1, 1, 0);
        quads.depthSquare = getQuad(gl, -1, -1, -0.5, -0.5, -0.1);
        quads.normalSquare = getQuad(gl, -0.5, -1, 0, -0.5, -0.1);
        quads.albedoSquare = getQuad(gl, 0, -1, 0.5, -0.5, -0.1);
        quads.shadowSquare = getQuad(gl, 0.5, -1, 1, -0.5, -0.1);

        gl.clearColor(0, 0, 0, 1);
        gl.clearDepth(1);

        interface = new Interface("interface/interface.json");
        initInterfaceElements();
        initInputHandling();

        shaders.currentShader = shaders.depthBlurShader;
        lastUpdate = Date.now();
        tick();
    }
}

function initInputHandling() {
    document.onkeydown = function (event) {
        pressedKeys[event.keyCode] = true;
    };

    document.onkeyup = function (event) {
        pressedKeys[event.keyCode] = false;
    };

    document.onmouseup = function (event) {
        mouseDown = false;
    };

    document.onmousedown = interface.onMouseDown;
    interface.setOnMouseDownDefaultCallback(function (event) {
        mouseDown = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    });

    document.onmousemove = interface.onMouseMove;
    interface.setOnMouseMoveDefaultCallback(function (event) {
        if (!mouseDown) {
            return;
        }
        var newX = event.clientX;
        var newY = event.clientY;

        var deltaX = newX - lastMouseX;
        var deltaY = newY - lastMouseY;
        cameras.camera.rotate(-deltaY / 100, -deltaX / 100);
        lastMouseX = newX;
        lastMouseY = newY;
    });
}

function initInterfaceElements() {
    interface.getElementByName("light").callback = function() {
        light = !light;
    };

    interface.getElementByName("depth").callback = function() {
        drawDepth = !drawDepth;
    };

    interface.getElementByName("normal").callback = function() {
        drawNormal = !drawNormal;
    };

    interface.getElementByName("blur").callback = function() {
        shaders.currentShader = shaders.blurShader;
    };

    interface.getElementByName("depth-blur").callback = function() {
        shaders.currentShader = shaders.depthBlurShader;
    };

    interface.getElementByName("default-shader").callback = function() {
        shaders.currentShader = shaders.screenspaceShader;
    };

    interface.getElementByName("sharpen-kernel").callback = function() {
        shaders.blurShader.bind();
        gl.uniform1fv(shaders.blurShader.handles["uKernel"], sharpenKernel);
    };

    interface.getElementByName("blur-kernel").callback = function() {
        shaders.blurShader.bind();
        gl.uniform1fv(shaders.blurShader.handles["uKernel"], blurKernel);
    };

    interface.getElementByName("edge-kernel").callback = function() {
        shaders.blurShader.bind();
        gl.uniform1fv(shaders.blurShader.handles["uKernel"], edgeKernel);
    };

    interface.getElementByName("test-slider").callback = function(d) {
        if (d) {
            shaders.blurShader.bind();
            gl.uniform1f(shaders.blurShader.handles["uSliderValue"], d);
            shaders.depthBlurShader.bind();
            gl.uniform1f(shaders.depthBlurShader.handles["uSliderValue"], d);
        }
    };

    interface.getElementByName("resolution-slider").callback = function(d) {
        if (d) {
            scale = d * 2;
            framebuffers.framebuffer.resize(windowWidth * scale, windowHeight * scale);
            framebuffers.deferredFramebuffer.resize(windowWidth * scale, windowHeight * scale);
            framebuffers.shadowFramebuffer.resize(defaultWindowSize * scale, defaultWindowSize * scale);
        }
    };
}

function handleKeys() {
    if (pressedKeys[83])
        cameras.camera.move(-0.1, 0, 0);
    if (pressedKeys[87])
        cameras.camera.move(0.1, 0, 0);
    if (pressedKeys[68])
        cameras.camera.move(0, 0.1, 0);
    if (pressedKeys[65])
        cameras.camera.move(0, -0.1, 0);
    if (pressedKeys[82])
        cameras.camera.move(0, 0, 0.1);
    if (pressedKeys[70])
        cameras.camera.move(0, 0, -0.1);

    if (pressedKeys[104])
        cameras.camera.rotate(0.1, 0);
    if (pressedKeys[98])
        cameras.camera.rotate(-0.1, 0);
    if (pressedKeys[100])
        cameras.camera.rotate(0, 0.1);
    if (pressedKeys[102])
        cameras.camera.rotate(0, -0.1);
}

function drawScene(shader, camera) {
    shader.bind();
    viewMatrix = mat4.lookAt(camera.position, camera.target, camera.up);
    gl.uniformMatrix4fv(shader.handles["uVMatrix"], false, viewMatrix);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, framebuffers.shadowFramebuffer.getDepthTexture());
    gl.uniform1i(shader.handles["uShadowmap"], 3);

    scene.sphere.draw(shader.handles);
    scene.mesh.draw(shader.handles);
    scene.cube.draw(shader.handles);
}

function animate(delta) {
    scene.sphere.rotation[1] += 0.05 * delta;
    scene.sphere.rotation[2] += 0.1 * delta;

    scene.cube.rotation[1] += 0.07 * delta;
    scene.cube.rotation[2] += 0.1 * delta;
}

function tick() {
    requestAnimFrame(tick);
    var now = Date.now();
    var delta = now - lastUpdate;
    lastUpdate = now;
    handleKeys();
    animate(delta / ((1/60) * 1000));
    renderToTextures();
    renderDeferred();
    renderToScreen();

}

function renderToTextures() {
    framebuffers.shadowFramebuffer.renderWithFunc(function() {
        return drawScene(shaders.shadowpassShader, cameras.shadowCamera);
    });
    framebuffers.framebuffer.renderWithFunc(function() {
        return drawScene(shaders.defaultShader, cameras.camera);
    });
}

function renderDeferred() {
    framebuffers.deferredFramebuffer.renderWithFunc(function() {
        gl.viewport(0, 0, windowWidth * scale, windowHeight * scale);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        shaders.deferredShader.bind();

        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D, framebuffers.framebuffer.getColorTexture("albedoTexture"));
        gl.uniform1i(shaders.deferredShader.handles["uAlbedoMap"], 4);

        gl.activeTexture(gl.TEXTURE5);
        gl.bindTexture(gl.TEXTURE_2D, framebuffers.framebuffer.getColorTexture("positionTexture"));
        gl.uniform1i(shaders.deferredShader.handles["uPositionMap"], 5);

        gl.activeTexture(gl.TEXTURE6);
        gl.bindTexture(gl.TEXTURE_2D, framebuffers.framebuffer.getColorTexture("normalTexture"));
        gl.uniform1i(shaders.deferredShader.handles["uNormalMap"], 6);

        gl.activeTexture(gl.TEXTURE7);
        gl.bindTexture(gl.TEXTURE_2D, framebuffers.framebuffer.getColorTexture("shadowTexture"));
        gl.uniform1i(shaders.deferredShader.handles["uShadowMap"], 7);

        gl.uniform3f(shaders.deferredShader.handles["uAmbientColor"], 0.1, 0.1, 0.1);
        var dir = [-0.25, -0.25, -1];
        var adjustedDir = vec3.create();
        vec3.normalize(dir, adjustedDir);
        vec3.scale(adjustedDir, -1);
        gl.uniform3fv(shaders.deferredShader.handles["uLightingDirection"], adjustedDir);
        gl.uniform3f(shaders.deferredShader.handles["uDirectionalColor"], 0.8, 0.8, 0.8);

        quads.square.draw(shaders.deferredShader.handles);        
    });
}

function renderToScreen() {
    gl.viewport(0, 0, windowWidth, windowHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    shaders.currentShader.bind();

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, framebuffers.framebuffer.getDepthTexture());
    gl.uniform1i(shaders.currentShader.handles["uDepthTexture"], 1);
    
    quads.square.setTexture(framebuffers.deferredFramebuffer.getColorTexture("renderedTexture"));
    quads.square.draw(shaders.currentShader.handles);

    shaders.screenspaceShader.bind();
    gl.uniform1i(shaders.screenspaceShader.handles["uDepthTexture"], 1);

    interface.draw(shaders.screenspaceShader.handles);
    if (drawDepth) {
        gl.uniform1i(shaders.screenspaceShader.handles["uDepthRender"], 1);
        quads.depthSquare.setTexture(framebuffers.framebuffer.getColorTexture("colorTexture"));
        quads.depthSquare.draw(shaders.screenspaceShader.handles);
        gl.uniform1i(shaders.screenspaceShader.handles["uDepthRender"], 0);
    }

    quads.normalSquare.setTexture(framebuffers.framebuffer.getColorTexture("normalTexture"));
    quads.normalSquare.draw(shaders.screenspaceShader.handles);

    quads.albedoSquare.setTexture(framebuffers.framebuffer.getColorTexture("albedoTexture"));
    quads.albedoSquare.draw(shaders.screenspaceShader.handles);

    quads.shadowSquare.setTexture(framebuffers.framebuffer.getColorTexture("shadowTexture"));
    quads.shadowSquare.draw(shaders.screenspaceShader.handles);
}
