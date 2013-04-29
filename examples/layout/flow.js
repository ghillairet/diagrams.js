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
            width: 100,
            height: 200
        },

        layout: {
            type: 'flow'
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
            'stroke-width': 1,
            width: 50,
            height: 50
        },
        layout: { type: 'grid' }
    });

    var Text = Ds.Label.extend({
        figure: {
            type: 'text',
            'font-size': 20
        }
    });

    var diagram = new Ds.Diagram({ el: 'diagram' });

    var container = new Container({ x: 100, y: 100 });

    var r1 = new Rectangle({ width: 50, height: 50, fill: 'blue' });
    var r2 = new Rectangle({ width: 50, height: 50, fill: 'yellow' });
    var c = new Circle({ r: 20, fill: 'gold' });
    var c2 = new Circle({ r: 20, fill: 'purple' });
    var l1 = new Text({ text: 'Hello World' });

    container.add(r1);
    container.add(r2);
    container.add(c);
    container.add(c2);
    container.add(l1);

    diagram.add(container);
    diagram.render();

})(window.Ds);
