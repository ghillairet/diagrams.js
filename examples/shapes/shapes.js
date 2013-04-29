(function(Ds) {

    var Circle = Ds.Shape.extend({
        figure: {
            type: 'circle',
            r: 30,
            fill: 'red',
            stroke: 'black',
            'stroke-width': 2
        }
    });

    var Square = Ds.Shape.extend({
        figure: {
            type: 'rect',
            width: 80,
            height: 80,
            fill: 'blue',
            stroke: 'black',
            'stroke-width': 2
        }
    });

    var Triangle = Ds.Shape.extend({
        resizable: false,
        figure: {
            type: 'path',
            fill: 'white',
            path: 'M20,0L0,60L40,60Z',
            'stroke-width': 2
        }
    });

    var Diamond = Ds.Shape.extend({
        resizable: false,
        figure: {
            type: 'path',
            path: 'M25,0L50,25L25,50L0,25Z',
            fill: 'orange',
            'stroke-width': 2
        }
    });

    var Star = Ds.Shape.extend({
        resizable: false,
        figure: {
            type: 'path',
            path: 'M25,0L20,20L0,20L16,30L5,50L25,40L45,50L34,30L50,20L30,20Z',
            fill: 'yellow',
            'stroke-width': 2
        }
    });

    var Ellipse = Ds.Shape.extend({
        figure: {
            type: 'ellipse',
            rx: 20,
            ry: 30,
            fill: 'yellow'
        }
    });

    var dia = new Ds.Diagram({ el: 'diagram' });

    var c1 = new Circle({ x: 100, y: 100 });
    var c2 = new Circle({ x: 300, y: 120 });
    var s1 = new Square({ x: 400, y: 150, resizable: true });
    var s2 = new Square({ x: 500, y: 150, draggable: false });
    var t = new Triangle({ x: 100, y: 200 });
    var d = new Diamond({ x: 300, y: 220 });
    var s = new Star({ x: 400, y: 260 });
    var e = new Ellipse({ x: 140, y: 300 });

    dia.add(c1, c2, s1, s2, t, d, s, e);
    dia.render();

})(window.Ds);
