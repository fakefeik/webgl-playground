function Interface(config) {
    var names = [
        "checkbox_unchecked.png", "checkbox_checked.png",
        "radiobutton_selected.png", "radiobutton_empty.png",
        "slider_background.png", "slider_slider.png"
    ];
    
    var textures = { };
    for (var i = 0; i < names.length; i++) {
        textures[names[i]] = getTexture("interface/" + names[i]);
    }

    var elements = [];
    var drawables = [];
    var configuration;

    var onMouseDownDefaultCallback;
    var onMouseMoveDefaultCallback;

    getConfig(config);

    function getElementIndicesByNamespace(namespace) {
        var arr = [];
        for (var i = 0; i < elements.length; i++)
            if (elements[i]["namespace"] == namespace)
                arr.push(i);
        return arr;
    }

    function getConfig(config) {
        var request = new XMLHttpRequest();
        request.open('GET', config, false);
        request.send();
        if (request.status == 200) {
            configuration = JSON.parse(request.responseText);
            addElements();
        }
    }

    function addElements() {
        elements = configuration["elements"];
        for (var i = 0; i < elements.length; i++) {
            var x1 = elements[i]["position"][0];
            var y1 = elements[i]["position"][1];
            var x2 = elements[i]["position"][2];
            var y2 = elements[i]["position"][3];
            drawables.push(getQuad(gl, x1, y1, x2, y2, -0.1));

            if (elements[i]["type"] == "checkbox")
                drawables[i].setTexture(elements[i]["checked"] ?
                    textures["checkbox_checked.png"] : 
                    textures["checkbox_unchecked.png"]
                );
            if (elements[i]["type"] == "radio")
                drawables[i].setTexture(elements[i]["checked"] ? 
                    textures["radiobutton_selected.png"] : 
                    textures["radiobutton_empty.png"]
                );
            if (elements[i]["type"] == "slider")
                drawables[i].setTexture(textures["slider_background.png"]);
        }
    }

    function isInBox(point, box) {
        return point[0] > box[0] && point[0] < box[2] && point[1] > box[1] && point[1] < box[3];
    }

    function normalize(d, c) {
        var h = c / 2;
        return (d - h) / h;
    }

    this.onMouseDown = function(event) {
        var wasHandled = false;
        var nx = normalize(event.clientX, window.innerWidth);
        var ny = -normalize(event.clientY, window.innerHeight);

        for (var i = 0; i < elements.length; i++)
            if (isInBox([nx, ny], elements[i]["position"])) {
                elements[i]["checked"] = !elements[i]["checked"];
                if (elements[i]["type"] == "checkbox")
                    drawables[i].setTexture(elements[i]["checked"] ?
                        textures["checkbox_checked.png"] : 
                        textures["checkbox_unchecked.png"]
                    );
                if (elements[i]["type"] == "radio") {
                    elements[i]["checked"] = true;
                    var indexes = getElementIndicesByNamespace(elements[i]["namespace"]);
                    for (var j = 0; j < indexes.length; j++)
                        drawables[indexes[j]].setTexture(textures["radiobutton_empty.png"]);
                    drawables[i].setTexture(elements[i]["checked"] ? 
                        textures["radiobutton_selected.png"] : 
                        textures["radiobutton_empty.png"]
                    );
                }
                if (elements[i]["type"] == "slider") {
                    wasHandled = true;
                    if (elements[i].callback)
                    elements[i].callback((nx - elements[i]["position"][0]) / (elements[i]["position"][2] - elements[i]["position"][0]));
                }
                if (elements[i].callback)
                    elements[i].callback();
            }
        if (onMouseDownDefaultCallback && !wasHandled)
            onMouseDownDefaultCallback(event);
    };

    this.setOnMouseDownDefaultCallback = function(func) {
        onMouseDownDefaultCallback = func;
    };

    this.onMouseMove = function(event) {
        if (onMouseMoveDefaultCallback)
            onMouseMoveDefaultCallback(event);
    };

    this.setOnMouseMoveDefaultCallback = function(func) {
        onMouseMoveDefaultCallback = func;
    };

    this.getElementByName = function(name) {
        for (var i = 0; i < elements.length; i++)
            if (elements[i]["name"] == name)
                return elements[i];
    };

    this.draw = function(handles) {
        for (var i = 0; i < drawables.length; i++)
            drawables[i].draw(handles);
    }
}
