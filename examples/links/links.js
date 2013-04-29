(function(Ds) {

   var ShapeDiagram = Ds.Diagram.extend({
        el: 'diagram'
    });

    var Circle = Ds.Shape.extend({
        figure: {
            type: 'circle',
            r: 30,
            fill: 'red',
            stroke: 'black',
            'stroke-width': 2
        }
    });

    var Arrow = Ds.Connection.extend({
        figure: {
            stroke: 'black',
            'stroke-width': 1
        },
        end: {
            type: 'basic'
        }
    });


    var d = new ShapeDiagram();

    var current = { x: 0, y: 10 };
    function layout() {
        var ws = 30, we = 1800,
            pad = 200;

        if (we > (current.x + pad)) {
            current.x = current.x + pad;
            current.y = current.y;
        } else {
            current.x = ws;
            current.y = current.y + pad;
        }
        return current;
    }

    var i, position, shape;
    for (i = 0; i < 100; i++) {
        position = layout();
        d.add(new Circle({ x: position.x, y: position.y, id: i }));
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    for (i = 0; i < 100; i++) {
        var r = getRandomInt(0, 100);
        var target = d.getShape(r);
        var source = d.getShape(i);
        if (target && source) {
            d.add(new Arrow({ source: source, target: target }));
        }
    }

    d.render();


})(window.Ds);
