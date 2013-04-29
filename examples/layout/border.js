(function(Ds) {

    var Container = Ds.Shape.extend({
        resizable: true,
        draggable: true,
        toolbox: false,
        figure: {
            type: 'rect',
            fill: 'whitesmoke',
            stroke: 'grey',
            'stroke-width': 1,
            width: 800,
            height: 400
        },
        layout: {
            type: 'border',
            vgap: 10,
            hgap: 20
        }
    });

    var Circle = Ds.Shape.extend({
        figure: {
            type: 'circle',
            stroke: 'black',
            'stroke-width': 1
        }
    });

    var Rectangle = Ds.Shape.extend({
        draggable: false,
        selectable: false,
        resizable: false,
        toolbox: false,
        figure: {
            type: 'rect',
            stroke: 'black',
            'stroke-width': 1
        }
    });

    var diagram = new Ds.Diagram({ el: 'diagram' });

    var container = new Container({ x: 100, y: 100 });
    var c1 = new Circle({ r: 20, fill: 'red' });
    var r1 = new Rectangle({ width: 50, height: 200, fill: 'blue' });
    var r2 = new Rectangle({ width: 50, height: 50, fill: 'yellow' });
    var r3 = new Rectangle({ width: 200, height: 50, fill: 'orange' });
    var r4 = new Rectangle({ width: 50, height: 50, fill: 'magenta' });
    var r5 = new Rectangle({ width: 50, height: 50, fill: 'red' });
    container.add(r1);
    container.add(r2);
    container.add(r3);
    container.add(r4);
    container.add(r5);
    container.layout.north = r1;
    container.layout.south = r2;
    container.layout.west = r3;
    container.layout.east = r4;
    container.layout.center = r5;

    diagram.add(container);
    diagram.render();

})(window.Ds);
