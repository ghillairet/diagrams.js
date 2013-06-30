
var TextLabel = {
    type: 'text',
    text: '< .. >',
    stroke: 'none'
};

var ClassFigure = {
    type: 'rect',
    width: 100,
    height: 60,
    fill: '#D3DAEE',
    cursor: 'move',
    stroke: '#86A4D0',
    'stroke-width': 1
};

var CompartmentFigure = {
    type: 'rect',
    width: 100,
    height: 20,
    fill: '#fff',
    stroke: '#86A4D0',
    'stroke-width': 1
};

var PropertyFigure = {
    type: 'text',
    text: 'name: String',
    stroke: 'none',
    fill: '#535353'
};

var OperationFigure = {
    type: 'text',
    text: 'name(): String',
    stroke: 'none',
    fill: '#535353'
};

window.onload = function() {

    var ClassLabel = DG.Label.extend({
        config: {
            draggable: false,
            resizable: false,
            selectable: false,
            editable: true
        },
        createFigure: function() {
            return DG.Figure.create(this, TextLabel);
        }
    });

    var LabelCompartmentShape = DG.Shape.extend({
        config: {},
        initialize: function() {
            this.layout = new DG.GridLayout(this, {
                columns: 1,
                vgap: 5,
                hgap: 5,
                marginHeight: 5,
                marginWidth: 5
            });
        },
        createFigure: function() {
            return DG.Figure.create(this, _.extend({}, CompartmentFigure, { fill: 'none' }));
        }
    });

    var ClassShape = DG.Shape.extend({
        initialize: function() {
            this.layout = new DG.GridLayout(this, {
                columns: 1
            });
            this.add(new LabelCompartmentShape());
            this.add(new PropertyCompartmentShape());
            this.add(new OperationCompartmentShape());
            this.children[0].gridData = new DG.GridData({
                horizontalAlignment: 'fill',
                grabExcessHorizontalSpace: true
            });
            this.children[0].add(new ClassLabel({ text: 'Hello' }));
//            this.children[0].children[0].gridData = new DG.GridData({
//                horizontalAlignment: 'center' // buggy
//            });
            this.children[1].gridData = new DG.GridData({
                horizontalAlignment: 'fill',
                grabExcessHorizontalSpace: true
            });
            this.children[2].gridData = new DG.GridData({
                horizontalAlignment: 'fill',
                grabExcessHorizontalSpace: true,
                grabExcessVerticalSpace: true
            });
        },
        createFigure: function() {
            return DG.Figure.create(this, ClassFigure);
        }
    });

    var PropertyCompartmentShape = DG.Shape.extend({
        config: {},
        initialize: function() {
            this.layout = new DG.GridLayout(this, {
                columns: 1,
                vgap: 5,
                hgap: 5,
                marginHeight: 5,
                marginWidth: 5
            });
            this.on('click', this.addProperty);
        },
        addProperty: function() {
            this.add(new PropertyShape());
            this.renderChildren();
            this.parent.doLayout();
        },
        createFigure: function() {
            return DG.Figure.create(this, CompartmentFigure);
        }
    });

    var PropertyShape = DG.Label.extend({
        createFigure: function() {
            return DG.Figure.create(this, PropertyFigure);
        }
    });

    var OperationCompartmentShape = DG.Shape.extend({
        config: {},
        initialize: function() {
            this.layout = new DG.GridLayout(this, {
                columns: 1,
                vgap: 5,
                hgap: 5,
                marginHeight: 5,
                marginWidth: 5
            });
            this.on('click', this.addOperation);
        },
        addOperation: function() {
            this.add(new OperationShape());
            this.renderChildren();
            this.parent.doLayout();
        },
        createFigure: function() {
            return DG.Figure.create(this, CompartmentFigure);
        }
    });

    var OperationShape = DG.Label.extend({
        createFigure: function() {
            return DG.Figure.create(this, OperationFigure);
        }
    });

    var diagram = new DG.Diagram('canvas');

    var c = new ClassShape({ x: 100, y: 100 });
    var p1 = new PropertyShape();
    var p2 = new PropertyShape();
    var o = new OperationShape();
    c.children[1].add(p1);
    c.children[1].add(p2);
    c.children[2].add(o);
    diagram.add(c);

    diagram.render();

    var click = function(e) {
        var point = DG.Point.get(e);
        if (create && type === 'Class') {
            diagram.add(new ClassShape({ x: point.x, y: point.y }));
            diagram.render();
            create = false;
            type = null;
        }
    };

    var create = false;
    var type;

    SVG.on(document.getElementById('canvas'), 'click', click);

    document.getElementById('createClass').addEventListener('click', function() {
        create  = true;
        type    = 'Class';
    });

};

