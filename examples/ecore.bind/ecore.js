(function(Ds, Ecore) {

    // Model

    var SamplePackage = Ecore.EPackage.create({
        nsURI: 'http://example.org/shapes', name: 'shapes', nsPrefix: 'shapes'
    });

    var SquareShape = Ecore.EClass.create({
        name: 'SquareShape',
        eStructuralFeatures: [
            { eClass: Ecore.EAttribute, name: 'label', eType: Ecore.EString }
        ]
    });

    var SquareShapeLinks = Ecore.EReference.create({ name: 'links', upperBound: -1, eType: SquareShape });
    SquareShape.get('eStructuralFeatures').add(SquareShapeLinks);

    var ShapeFigure = Ecore.EClass.create({
        name: 'ShapeFigure',
        eStructuralFeatures: [
            { eClass: Ecore.EAttribute, name: 'name', eType: Ecore.EString },
            { eClass: Ecore.EReference, name: 'shapes', upperBound: -1, containment: true, eType: SquareShape }
        ]
    });

    SamplePackage.get('eClassifiers')
        .add(ShapeFigure)
        .add(SquareShape);

    var resourceSet = Ecore.ResourceSet.create();
    var resource = resourceSet.create({ uri: '/shapes.ecore' });
    resource.get('contents').add(SamplePackage);

    // Shapes

    var Label = {
        figure: {
            type: 'text',
            text: 'Square',
            'font-size': 20
        }
    };

    var Square = Ds.Shape.extend({
        figure: {
            type: 'rect',
            width: 100,
            height: 100,
            fill: '#AAAADD',
            opacity: 0.6,
            stroke: 'white',
            'stroke-width': 2
        },
        layout: { type: 'grid' },
        children: [ Label ],

        initialize: function(attributes) {
            if (attributes.model) {
                this.model = attributes.model;
            } else {
                this.model = SquareShape.create({ label: 'Square' });
                this.diagram.model.get('shapes').add(this.model);
            }

            this.children[0].on('change:text', function(changed) {
                this.model.set('label', changed.get('text'));
            }, this);

            this.model.on('change:label', function(changed) {
                this.children[0].setText(this.model.get(changed), true);
            }, this);
        }
    });

    var LinksConnection = Ds.Connection.extend({
        figure: {
            stroke: 'black',
            'stroke-width': 2
        },
        end: {
            type: 'basic'
        },
        initialize: function(attributes) {
            this.on('connect', function() {
                var src = this.get('source');
                var tgt = this.get('target');
                src.model.get('links').add(tgt.model);
            }, this);
        }
    });

    var ShapeDiagram = Ds.Diagram.extend({
        el: 'diagram',
        initialize: function(attributes) {
            //if (attributes.model) {
            //    this.model = attributes.model;
            //} else {
                this.model = ShapeFigure.create({ name: 'diagram' });
                var res = resourceSet.create({ uri: '/sample.shapes' });
                res.get('contents').add(this.model);
            //}
        }
    });

    var diagram = new ShapeDiagram();
    var sq1 = new Square({ x: 100, y: 100, diagram: diagram });
    var sq2 = new Square({ x: 300, y: 150, diagram: diagram });
    var c = new LinksConnection({ diagram: diagram });
    c.connect(sq1, sq2);

    diagram.render();

    // setup the select element with the resources

    var select = document.getElementById('resources');

    resourceSet.get('resources').each(function(res) {
        var el = document.createElement('option');
        el.innerHTML = res.get('uri');
        select.options[select.options.length] = el;
    });

    document.getElementById('create-square').addEventListener('click', function() {
        diagram.createShape(Square, { x: 200, y: 200 });
        diagram.render();
    });

    document.getElementById('create-link').addEventListener('click', function() {
        diagram.currentEdge = LinksConnection;
        console.log(diagram.currentEdge, diagram.currentSource);
    });

    var textArea = document.getElementById('text');
    document.getElementById('show-json').addEventListener('click', function() {
        var resourceURI = select.options[select.selectedIndex].value;
        var resource = resourceSet.get('resources').find(function(res) { return res.get('uri') === resourceURI; });
        textArea.innerHTML = JSON.stringify(resource.to(Ecore.JSON), null, 4);
    });

    document.getElementById('show-xmi').addEventListener('click', function() {
        var resourceURI = select.options[select.selectedIndex].value;
        var resource = resourceSet.get('resources').find(function(res) { return res.get('uri') === resourceURI; });
        textArea.innerHTML = resource.to(Ecore.XMI, true);
    });

})(window.Ds, window.Ecore);
