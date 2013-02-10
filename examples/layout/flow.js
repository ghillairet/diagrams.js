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
            type: 'flex',
            stretch: false
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
        labelFigure: {
            text: 'hello'
        },
        initialize: function(attributes) {
            this.add(new Ds.Label({ figure: this.labelFigure }));
        },
        layout: { type: 'grid' }
    });

    var container = new Container({ diagram: diagram, x: 100, y: 100 });
    var r1 = new Rectangle({ width: 50, height: 50, fill: 'blue' });
    var r2 = new Rectangle({ width: 50, height: 50, fill: 'yellow' });
    container.add(r1);
    container.add(r2);

    var c = new Circle({ x: 200, y: 20, r: 20, fill: 'gold', diagram: diagram });
    c.moveStyle.fill = 'blue';
    var c2 = new Circle({ x: 200, y: 20, r: 20, fill: 'purple' });
    container.add(c2);
    var r3 = new Rectangle({ x: 100, y : 40, width: 50, height: 50, fill: 'yellow', diagram: diagram });

    r1.children[0].set('font-size', 30);

    diagram.render();
})(window.Ds);
