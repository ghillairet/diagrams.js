(function(Ds) {


    var Container = Ds.Shape.extend({
        figure: {
            type: 'rect',
            fill: 'whitesmoke',
            width: 150,
            height: 200
        },

        layout: {
            type: 'flex',
            columns: 1,
            rows: 3,
            vertical: true,
            stretch: true
        }
    });

    var Rectangle = Ds.Shape.extend({
        figure: {
            type: 'rect'
        }
    });


    var diagram = new Ds.Diagram({ el: 'diagram' });
    var c = new Container({ diagram: diagram, x: 100, y: 100 });

    c.add(new Rectangle({ fill: 'yellow', width: 150, height: 20 }));
    c.add(new Rectangle({ fill: 'red', width: 150, height: 40 }));
    c.add(new Rectangle({ fill: 'blue', width: 150, height: 50 }));

    diagram.render();

})(window.Ds);
