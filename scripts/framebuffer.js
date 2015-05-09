function Framebuffer(gl, width, height, colorAttachments, useMipmaps, ext) {
    var id = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, id);
    
    var colorTextures = { };
    for (var i = 0; i < colorAttachments.length; i++) {
        var texId = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texId);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        if (useMipmaps) gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        colorTextures[colorAttachments[i]] = texId;
    }

    var depthTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, depthTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);

    if (colorAttachments.length == 1)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTextures[colorAttachments[0]], 0);
    else if (colorAttachments.length > 1 && ext != null) {
        var attachments = [];
        for (var i = 0; i < colorAttachments.length; i++) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, ext.COLOR_ATTACHMENT0_WEBGL + i, gl.TEXTURE_2D, colorTextures[colorAttachments[i]], 0);
            attachments.push(ext.COLOR_ATTACHMENT0_WEBGL + i);
        }
        ext.drawBuffersWEBGL(attachments);
    }

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this.resize = function(w, h) {
        width = w;
        height = h;

        for (var i = 0; i < colorAttachments.length; i++) {
            gl.bindTexture(gl.TEXTURE_2D, colorTextures[colorAttachments[i]]);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            
            if (useMipmaps) gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        }

        gl.bindTexture(gl.TEXTURE_2D, depthTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);

        gl.bindTexture(gl.TEXTURE_2D, null);
    };

    this.getId = function() {
        return id;
    };

    this.renderWithFunc = function(renderFunc) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, id);
        gl.viewport(0, 0, width, height);

        renderFunc();
        if (useMipmaps)
            for (var i = 0; i < colorAttachments.length; i++) {
               gl.bindTexture(gl.TEXTURE_2D, colorTextures[colorAttachments[i]]);
               gl.generateMipmap(gl.TEXTURE_2D);
            }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    this.getColorTexture = function(name) {
        return colorTextures[name];
    };

    this.getDepthTexture = function() {
        return depthTexture;
    };

    this.getWidth = function() {
        return width;
    };

    this.getHeight = function() {
        return height;
    };
}
