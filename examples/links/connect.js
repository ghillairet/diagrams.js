(function() {

    var Rectangle = Ds.Shape.extend({

        figure: {
            type: 'rect',
            width: 100,
            height: 80,
            fill: 'blue'
        },

        layout: {
            type: 'grid',
            columns: 2,
            marginWidth: 5,
            marginHeight: 5,
            vgap: 5,
            hgap: 5
        },

        initialize: function(attributes) {
            this.on('click', this.connect);
        },

        connect: function(e) {
            var diagram = this.diagram;
            var connection = diagram.currentEdge;

            if (connection) {
                this.dragConnection(e, connection);
                this.on('connect:source', function() {
                    diagram.currentEdge = null;
                });
            }
        }

    });

    var diagram = new Ds.Diagram({ el: 'diagram' });
    diagram.on('add:children', diagram.render);

    var createRectangle = function(e) {
        var point = Ds.Point.get(diagram, e);
        var r = new Rectangle({ diagram: diagram, x: point.x, y: point.y });
    };

    var connect = function() {
        diagram.currentEdge = Ds.Connection;
    };

    var addShape = function() {
        var selection = diagram.getSelection();
        if (selection) {
            selection.add(new Rectangle({ fill: 'red', width: 20, height: 20 }));
            selection.render();
        }
    };

    document.getElementById('bt1').addEventListener('click', createRectangle);
    document.getElementById('bt2').addEventListener('click', connect);
    document.getElementById('bt3').addEventListener('click', addShape);

})();
