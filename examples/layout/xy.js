(function(Ds) {

    var diagram = new Ds.Diagram({
        el: 'diagram'
    });

    var Container = Ds.Shape.extend({
        resizable: false,
        draggable: false,
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
            type: 'xy'
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
        figure: {
            type: 'rect',
            stroke: 'black',
            'stroke-width': 1
        }
    });

    var container = new Container({ diagram: diagram, x: 100, y: 100 });
    var c1 = new Circle({ r: 20, fill: 'red' });
    var r1 = new Rectangle({ width: 50, height: 50, fill: 'blue', x: 100, y: 100 });
    var r2 = new Rectangle({ width: 50, height: 50, fill: 'yellow', x: 200, y: 200 });
    container.add(r1);
    container.add(r2);

    diagram.render();


})(window.Ds);
