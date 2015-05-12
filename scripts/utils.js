function Random(seed) {
    var m = 0x80000000;
    var a = 1103515245;
    var c = 12345;

    var state = typeof(seed) !== "undefined" ? seed : Math.floor(Math.random() * (m - 1));

    this.nextInt = function() {
        state = (a * state + c) % m;
        return state;
    };

    this.nextFloat = function() {
        return this.nextInt() / (m - 1);
    };

    this.nextRange = function(start, end) {
        if (!end) {
            end = start;
            start = 0;
        }

        var rangeSize = end - start;
        var randomUnder1 = this.nextInt() / m;
        return start + Math.floor(randomUnder1 * rangeSize);
    };

    this.choice = function(array) {
        return array[this.nextRange(array.length)];
    };
}

Array.range = function(start, end) {
    if (!end) {
        end = start;
        start = 0;
    }

    arr = [];
    for (var i = start; i < end; i++)
        arr.push(i);
    return arr;
};

Array.prototype.shuffle = function(seed) {
    var random = new Random(seed);
    var currentIndex = this.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(random.nextFloat() * currentIndex);
        currentIndex -= 1;

        temporaryValue = this[currentIndex];
        this[currentIndex] = this[randomIndex];
        this[randomIndex] = temporaryValue;
    }

    return this;
};

Array.prototype.extend = function(array) {
    this.push.apply(this, array);
}
