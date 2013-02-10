(function(Ds) {

    function move(array, from, to) {
        array.splice(to, 0, array.splice(from, 1)[0]);
    }

    var Rectangle = Ds.Shape.extend({
        draggable: false,
        resizable: false,
        figure: {
            type: 'rect'
        },
        initialize: function() {
            var fill;
            this.on('click', function() {
                var list = this.parent.children;
                var from = _.indexOf(list, this);
                var to = from === 0 ? list.length : from -1;
                move(list, from, to);
                this.parent.render();
            }, this);
        }
    });

    var Container = Ds.Shape.extend({
        figure: {
            type: 'rect',
            width: 300,
            height: 200,
            r: 1,
            fill: 'white',
            stroke: 'black',
            'stroke-width': 2
        },
        layout: {
            type: 'grid',
            columns: 2,
            rows: 3,
            vertical: true,
            hgap: 15,
            vgap: 15
        }
    });

    var Diagram = Ds.Diagram.extend({
        el: 'diagram'
    });

    var dia = new Diagram();

    var cont = new Container({ diagram: dia, x: 10, y: 10 });
    var c1 = new Rectangle({ diagram: dia, width: 15, height: 10, fill: 'red' });
    var c2 = new Rectangle({ diagram: dia, width: 15, height: 10, fill: 'blue' });
    var c3 = new Rectangle({ diagram: dia, width: 15, height: 10, fill: 'yellow' });
    var c4 = new Rectangle({ diagram: dia, width: 15, height: 10, fill: 'green' });
    cont.add(c1);
    cont.add(c2);
    cont.add(c3);
    cont.add(c4);

    dia.render();

})(window.Ds);
