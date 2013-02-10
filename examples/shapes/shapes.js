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

    var TriangleFigure = {
        figure: {
            type: 'path',
            fill: 'white',
            path: 'M20,0L0,60L40,60Z',
            'stroke-width': 2
        },
        resizable: false,
        draggable: false
    };

    var Triangle = Ds.Shape.extend({
        resizable: false,
        figure: {
            type: 'rect',
            width: 40,
            height: 60,
            fill: 'white',
            'fill-opacity': 0,
            stroke: 'none'
        },
        layout: { type: 'xy' },
        children: [ TriangleFigure ]
    });

    var DiamondFigure = {
        figure: {
            type: 'path',
            path: 'M25,0L50,25L25,50L0,25Z',
            fill: 'orange',
            'stroke-width': 2
        }
    };

    var Diamond = Ds.Shape.extend({
        resizable: false,
        figure: {
            type: 'rect',
            width: 50,
            height: 50,
            fill: 'white',
            'fill-opacity': 0,
            'stroke-width': 0
        },
        layout: { type: 'xy' },
        children: [ DiamondFigure ]
    });

    var StarFigure = {
        figure: {
            type: 'path',
            path: 'M25,0L20,20L0,20L16,30L5,50L25,40L45,50L34,30L50,20L30,20Z',
            fill: 'yellow',
            'stroke-width': 2
        }
    };

    var Star = Ds.Shape.extend({
        resizable: false,
        figure: {
            type: 'rect',
            width: 50,
            height: 50,
            stroke: 'none',
            fill: 'white',
            'fill-opacity': 0
        },
        layout: { type: 'xy' },
        children: [ StarFigure ]
    });

    var dia = new ShapeDiagram();
    var c1 = new Circle({ x: 100, y: 100, diagram: dia });
    var c2 = new Circle({ x: 300, y: 120, diagram: dia });
    var s1 = new Square({ x: 400, y: 150, diagram: dia, resizable: false });
    var s2 = new Square({ x: 500, y: 150, diagram: dia, draggable: false });
    var t = new Triangle({ x: 100, y: 200, diagram: dia });
    var d = new Diamond({ x: 300, y: 220, diagram: dia });
    var s = new Star({ x: 400, y: 260, diagram: dia });

    d.on('click', function() { alert('Clicked!!'); });

    dia.render();

})(window.Ds);
