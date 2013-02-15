(function(Ds, Ecore) {

    var resourceSet = Ecore.ResourceSet.create();

    // dnd

    function handleFileSelect(e) {
        e.stopPropagation();
        e.preventDefault();

        var startByte = e.target.getAttribute('data-startbyte');
        var endByte = e.target.getAttribute('data-endbyte');

        var files = e.dataTransfer.files;
        var file = files[0];
        var reader = new FileReader();

        reader.onloadend = function(e) {
            if (e.target.readyState == FileReader.DONE) {
                var data = e.target.result;
                var res = resourceSet.create({ uri: file.name  });
                res.parse(data, Ecore.XMI);
                resourceSet.trigger('change');
                console.log(resourceSet);
            }
        };

        var blob = file.slice(0, file.size);
        reader.readAsBinaryString(blob);
    }

    function handleDragOver(e) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }

    var dropzone = document.getElementById('diagram');
    dropzone.addEventListener('dragover', handleDragOver, false);
    dropzone.addEventListener('drop', handleFileSelect, false);

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
            stroke: 'blue',
            position: 'center-left'
        }
    });

    var PropertyCompartment = {
        compartment: true,
        figure: {
            type: 'rect',
            height: 20,
            fill: 'none',
            stroke: '#615E62',
            'stroke-width': 2
        },
        layout: {
            type: 'flex',
            columns: 1,
            stretch: false
        },
        accepts: [ UMLProperty ]
    };

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

    var OperationCompartment = {
        compartment: true,
        figure: {
            type: 'rect',
            height: 20,
            fill: 'none',
            stroke: 'none',
            'stroke-width': 2
        },
        layout: {
            type: 'flex',
            columns: 1,
            stretch: false
        },
        accepts: [ UMLOperation ]
    };

    var UMLClassLabel = {
        figure: {
            type: 'text',
            text: 'Class',
            height: 30,
            'font-size': 16
        }
    };

    var UMLClass = Ds.Shape.extend({
        figure: {
            type: 'rect',
            width: 100,
            height: 60,
            r: 8,
            fill: '235-#FDFDFF-#F2F2FF',
            opacity: 1,
            stroke: '#615E62',
            'stroke-width': 2,
            'stroke-opacity': 1
        },
        layout: {
            type: 'flex',
            columns: 1,
            stretch: true
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
