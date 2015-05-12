Array.prototype.shuffle = function(seed) {
    var currentIndex = this.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = this[currentIndex];
        this[currentIndex] = this[randomIndex];
        this[randomIndex] = temporaryValue;
    }

    return this;
};

Array.prototype.extend = function(array) {
    this.push.apply(this, array);
}

function Perlin(seed) {
    var p = [];
    for (var i = 0; i < 256; i++)
        p.push(i);
    p.shuffle();
    p.extend(p);
    
    function fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    function grad(hash, x, y, z) {
        var h = hash & 15
        var u = h < 8 ? x : y
        var v = h < 4 ? y : h == 12 || h == 14 ? x : z; // y if h < 4 else x if h == 12 or h == 14 else z
        return (h & 1 ? u : -u) + (h & 2 ? v : -v);
    }

    function lerp(t, a, b) {
        return a + t * (b - a);
    }

    this.perlin = function(x, y, z) {
        var X = Math.floor(x) & 255;
        var Y = Math.floor(y) & 255;
        var Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        var u = fade(x);
        var v = fade(y);
        var w = fade(z);

        var A = p[X] + Y
        var AA = p[A] + Z
        var AB = p[A + 1] + Z
        var B = p[X + 1] + Y
        var BA = p[B] + Z
        var BB = p[B + 1] + Z

        var res = lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z)),
                       lerp(u, grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z))),
               lerp(v, lerp(u, grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1)),
                    lerp(u, grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1))))
        console.log(res);
        return (res + 1.0) / 2.0
    };
}


function getPerlinPlane(gl, perlin, w, h, seg) {
    return getPlane(w, h, seg, seg, function(x, y) {
        return perlin.perlin(x / 10, y / 10, 0.8) * 10;
    });
}