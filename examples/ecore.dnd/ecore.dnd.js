(function(Ds, Ecore) {

    resourceSet = Ecore.ResourceSet.create();

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
                resourceSet.trigger('change', res);
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

    var EReference = Ds.Connection.extend({
        figure: {
            stroke: 'black',
            'stroke-width': 2
        },
        end: {
            type: 'basic'
        },
        labels: [
            { text: 'property', position: 'end' }
        ],
        initialize: function(attributes) {
            if (attributes.model) {
                this.model = attributes.model;
                this.labels[0].set('text', this.model.get('name'));
            }
        }
    });

    var ESuperTypes = Ds.Connection.extend({
        figure: {
            stroke: 'black',
            'stroke-width': 2
        },
        end: {
            fill: 'white',
            type: 'basic'
        }
    });

    var EAttribute = Ds.Label.extend({
        resizable: false,
        draggable: false,
        figure: {
            type: 'text',
            text: 'name: EString',
            height: 20,
            stroke: 'blue',
            position: 'center-left'
        },
        initialize: function(attributes) {
            if (attributes.model) {
                this.model = attributes.model;
            } else {
                this.model = Ecore.EAttribute.create({ name: 'name', eType: Ecore.EString });
            }

            var text = this.model.get('name'); // + ' : ' + this.model.get('eType').get('name');
            this.setText(text);
        }
    });

    var EAttributeCompartment = {
        compartment: true,
        figure: {
            type: 'rect',
            height: 20,
            fill: 'none',
            stroke: '#D8D8D1',
            'stroke-width': 2
        },
        layout: {
            type: 'flex',
            columns: 1,
            stretch: false
        },
        accepts: [ EAttribute ]
    };

    var EOperation = Ds.Label.extend({
        resizable: false,
        draggable: false,
        figure: {
            type: 'text',
            text: 'op(): EString',
            height: 20,
            stroke: 'blue',
            position: 'center-left'
        }
    });

    var EOperationCompartment = {
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
        accepts: [ EOperation ]
    };

    var EClassLabel = {
        figure: {
            type: 'text',
            text: 'EClass',
            height: 30,
            'font-size': 14
        }
    };

    var EClass = Ds.Shape.extend({
        figure: {
            type: 'rect',
            width: 160,
            height: 100,
            fill: '235-#F9F9D8-#FFFFFF',
            opacity: 1,
            stroke: '#D8D8D1',
            'stroke-width': 2,
            'stroke-opacity': 1
        },
        layout: {
            type: 'flex',
            columns: 1,
            stretch: true
        },
        children: [
            EClassLabel,
            EAttributeCompartment,
            EOperationCompartment
        ],
        initialize: function(attributes) {
            if (attributes.model) {
                this.model = attributes.model;
                this.model.shape = this;
                this.createContent();
            } else {
                this.model = Ecore.EClass.create({ name: 'MyClass' });
                this.model.shape = this;
                this.diagram.model.get('eClassifiers').add(this.model);
            }

            this.children[0].setText(this.model.get('name'));
        },
        createContent: function() {
            var compartment = this.children[1];
            _.each(this.model.get('eAttributes'), function(a) {
                var shape = this.diagram.createShape(EAttribute, { model: a });
                compartment.add(shape);
            }, this);
        }
    });

    var ObjectsGroup = {
        title: 'Objects',
        tools: [
            { title: 'EClass', shape: EClass },
            { title: 'EAttribute', shape: EAttribute },
            { title: 'EOperation', shape: EOperation }
        ]
    };

    var ConnectionsGroup = {
        title: 'Connections',
        tools: [
            { title: 'EReference', edge: EReference },
            { title: 'Inheritance', edge: ESuperTypes }
        ]
    };

    var Palette = Ds.Palette.extend({
        groups: [
            ObjectsGroup,
            ConnectionsGroup
        ]
    });

    var current = { x: 0, y: 100 };
    function layout() {
        var ws = 200, we = 1200,
            pad = 250;

        if (we > (current.x + pad)) {
            current.x = current.x + pad;
            current.y = current.y;
        } else {
            current.x = ws;
            current.y = current.y + pad;
        }
        return current;
    }

    var EcoreDiagram = Ds.Diagram.extend({
        el: 'diagram',
        children: [
            EClass
        ],
        initialize: function(attributes) {
            if (attributes.model) {
                this.model = attributes.model;
                this.createContent();
                this.createConnections();
            } else {
                this.model = Ecore.EPackage.create({
                    name: 'sample',
                    nsURI: 'http://www.example.org/sample',
                    nsPrefix: 'sample'
                });
                var res = resourceSet.create({ uri: 'sample.ecore' });
                res.get('contents').add(this.model);
            }
        },
        createContent: function() {
            this.model.get('eClassifiers').each(function(c) {
                if (c.isTypeOf('EClass')) {
                    var position = layout();
                    this.createShape(EClass, { model: c, x: position.x, y: position.y });
                }
            }, this);
        },
        createConnections: function() {
            var connect;
            this.model.get('eClassifiers').each(function(c) {
                if (c.isTypeOf('EClass')) {
                    c.get('eSuperTypes').each(function(e) {
                        connect = this.createConnection(ESuperTypes, {
                            source: c.shape,
                            target: e.shape
                        });
                    }, this);
                    _.each(c.get('eReferences'), function(e) {
                        connect = this.createConnection(EReference, {
                            source: c.shape,
                            target: e.get('eType').shape,
                            model: e
                        });
                    }, this);
                }
            }, this);
        }
    });


    var diagram = new EcoreDiagram();
    diagram.render();

    var palette = new Palette( diagram );
    palette.render().asDraggable();

    resourceSet.on('change', function(change) {
        diagram.initialize({ model: change.get('contents').first() });
        diagram.render();
    });

})(window.Ds, window.Ecore);
