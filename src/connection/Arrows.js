Ds.arrows = {

    none: function( size ) {
        if (!size) {
            size = 2;
        }
        return {
            path: 'M'+size+',0L'+(-size)+',0',
            dx: size,
            dy: size,
            attr: {
                opacity: 0
            }
        };
    },

    basic: function( p, size ) {
        if (!size) {
            size = 4;
        }
        return {
            path: [
                'M',size.toString(),'0',
                'L',(-size).toString(),(-size).toString(),
                'L',(-size).toString(),size.toString(),'z'
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

