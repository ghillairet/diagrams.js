DG.Arrows = Arrows = {

    get: function(type) {
        if (typeof DG.Arrows[type] === 'function')
            return DG.Arrows[type];
        else return DG.Arrows.basic;
    },

    none: function(size) {
        if (!size) size = 2;
        return {
            path: [
                'M', size, '0',
                'L', ''+(-size),
                '0'
            ],
            dx: size,
            dy: size,
            attr: {
                opacity: 0
            }
        };
    },

    basic: function(size) {
        if (!size) size = 4;
        return {
            path: [
                'M', ''+size, '0',
                'L', ''+(-size), ''+(-size),
                'L', ''+(-size), ''+size, 'Z'
            ],
            dx: size,
            dy: size,
            attr: {
                stroke: 'black',
                fill: 'black'
            }
        };
    }

};

