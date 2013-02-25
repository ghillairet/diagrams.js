(function() {

    var Label = Ds.Label.extend({
        draggable: true,

        figure: {
            type: 'text',
            text: 'I am a Label',
            width: 100,
            height: 40,
            fill: 'blue',
            'text-fill': 'red'
        },
        gridData: {
            horizontalAlignment: 'fill',
            verticalAlignment: 'fill',
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

    var diagram = new Ds.Diagram({ el: 'diagram' });
    var r = new Rectangle({ diagram: diagram, x: 200, y: 100 });
    var l = new Label({ diagram: diagram, x: 100, y: 100 });
    diagram.get('children').push(l);
    diagram.render();

//    console.log(l);

})();
