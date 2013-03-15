(function() {

    var Label = Ds.Label.extend({
        draggable: true,

        figure: {
            type: 'text',
            text: 'I am \n a Label'
       /* ,
            stroke: '#222299',
            fill: 'blue',
            'fill-opacity': 0.5,
            'stroke-opacity': 0.5,
            'stroke-width': 2,
            'font-size': 50,
            'font-weight': 'bold'
            */
        },
        gridData: {
            horizontalAlignment: 'end',
            verticalAlignment: 'center',
            grabExcessHorizontalSpace: true,
            grabExcessVerticalSpace: true
        }
    });

    var Rectangle = Ds.Shape.extend({
        figure: {
            type: 'rect',
            width: 140,
            height: 50,
            fill: 'red'
        },

        children: [ Label ],

        layout: {
            type: 'grid',
            columns: 1,
            marginHeight: 5,
            marginWidth: 5
        }
    });

    var RectangleManyLabels = Ds.Shape.extend({
        figure: {
            type: 'rect',
            width: 140,
            height: 50,
            fill: 'orange'
        },

        layout: {
            type: 'grid',
            columns: 1,
            marginHeight: 5,
            marginWidth: 5
        }
    });

    var diagram = new Ds.Diagram({ el: 'diagram' });
/*
    var r = new Rectangle({ diagram: diagram, x: 200, y: 100 });

    var r2 = new RectangleManyLabels({ diagram: diagram, x: 400, y: 120 });
    r2.add(new Label({ text: 'short label' }));
    r2.add(new Label({ text: 'quit longer label' }));
    r2.add(new Label({ text: 'this is a very very long label' }));
*/
    var l = new Label({ diagram: diagram, x: 100, y: 100 });
    diagram.get('children').push(l);
    diagram.render();

})();
