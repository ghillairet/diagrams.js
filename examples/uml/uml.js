(function(Ds, Ecore) {

    var resourceSet = Ecore.ResourceSet.create();

    var UMLAssociation = Ds.Connection.extend({
        figure: {
            stroke: 'black',
            'stroke-width': 2
        },
        end: {
            type: 'none'
        },
        labels: [
            { text: 'property', position: 'start' },
            { text: 'property', position: 'end' },
            { text: 'property', position: 'middle' }
        ]
    });

    var UMLExtend = Ds.Connection.extend({
        figure: {
            stroke: 'black',
            'stroke-width': 2
        },
        end: {
            fill: 'white',
            type: 'basic'
        }
    });

    var UMLProperty = Ds.Label.extend({
        resizable: false,
        draggable: false,
        figure: {
            type: 'text',
            text: ' + name: String',
            height: 20,
            width: 100,
            stroke: 'blue',
            position: 'center-left'
        },
        gridData: {
            horizontalAlignment: 'beginning'
        }
    });

    var PropertyCompartment = Ds.Shape.extend({
        figure: {
            type: 'rect',
            height: 20,
            width: 100,
            fill: 'none',
            stroke: '#615E62',
            'stroke-width': 2
        },
        layout: {
            type: 'grid',
            columns: 1
        },
        gridData: {
            horizontalAlignment: 'fill',
            verticalAlignment: 'fill',
            grabExcessHorizontalSpace: true,
            grabExcessVerticalSpace: false
        },
        accepts: [ UMLProperty ]

    });

    var UMLOperation = Ds.Label.extend({
        resizable: false,
        draggable: false,
        figure: {
            type: 'text',
            text: '+ name(): String',
            height: 20,
            stroke: 'blue',
            position: 'center-left'
        }
    });

    var OperationCompartment = Ds.Shape.extend({
        selectable: false,
        draggable: false,
        resizable: false,

        figure: {
            type: 'rect',
            height: 20,
            width: 100,
            fill: 'white',
            'fill-opacity': 0,
            stroke: 'none',
            'stroke-width': 2
        },

        layout: {
            type: 'grid',
            columns: 1
        },

        gridData: {
            horizontalAlignment: 'fill',
            verticalAlignment: 'fill',
            grabExcessHorizontalSpace: true,
            grabExcessVerticalSpace: false
        },

        accepts: [ UMLOperation ],

        initialize: function(attributes) {
            console.log('here');
            this.on('click', this.addElement);
        },

        addElement: function() {
            if (this.diagram.currentItem) {
                var element = new this.diagram.currentItem({});
                console.log(element);
                if (element instanceof UMLOperation) {
                    this.add(element);
                    this.render();
                }
            }
            console.log(this.diagram);
        }
    });

    var UMLClassLabel = {
        figure: {
            type: 'text',
            text: 'Class',
            height: 20,
            width: 100,
            'font-size': 16
        },
        gridData: {
            grabExcessHorizontalSpace: true,
            horizontalAlignment: 'center'
        }
    };

    var UMLClass = Ds.Shape.extend({
        figure: {
            type: 'rect',
            width: 100,
            height: 60,
            r: 4,
            fill: '235-#FDFDFF-#F2F2FF',
            opacity: 1,
            stroke: '#615E62',
            'stroke-width': 2,
            'stroke-opacity': 1
        },
        layout: {
            type: 'grid',
            columns: 1,
            hgap: 0,
            vgap: 0,
            marginWidth: 0,
            marginHeight: 0,
            columnsEqualWidth: false
        },
        children: [
            UMLClassLabel,
            PropertyCompartment,
            OperationCompartment
        ],
        initialize: function() {}
    });

    var UMLGroup = {
        title: 'UML',
        tools: [
            { title: 'Class', shape: UMLClass },
            { title: 'Property', shape: UMLProperty },
            { title: 'Operation', shape: UMLOperation },
            { title: 'Association', edge: UMLAssociation },
            { title: 'Extend', edge: UMLExtend }
        ]
    };

    var Palette = Ds.Palette.extend({
        groups: [
            UMLGroup
        ]
    });

    var UMLDiagram = Ds.Diagram.extend({
        el: 'diagram',
        children: [
            UMLClass
        ]
    });

    var diagram = new UMLDiagram();

    var palette = new Palette( diagram );
    palette.render().asDraggable();

    var foo = new UMLClass({ diagram: diagram, x: 300, y: 100 });
    var bar = new UMLClass({ diagram: diagram, x: 500, y: 160 });

    diagram.render();

    foo.children[0].setText('Foo');
    bar.children[0].setText('Bar');

})(window.Ds, window.Ecore);
