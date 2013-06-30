
var rect = {
    type: 'rect',
    width: 100,
    height: 100,
    fill: '#fff',
    cursor: 'move',
    stroke: '#666',
    'stroke-width': 1
};

var smallRect = _.extend({}, rect, { width: 30, height: 20, fill: '#444' });

var circle = {
    type: 'circle',
    r: 30,
    fill: 'red'
};

var text = {
    type: 'text',
    text: 'Hello World!'
};

var poly = {
    type: 'polygon',
    coordinates: '0,0 100,50 50,100',
    fill: 'red',
    stroke: 'black',
    'stroke-width': 1
};

window.onload = function() {

    var RectShape = DG.Shape.extend({
        createFigure: function() {
            return DG.Figure.create(this, rect);
        }
    });
    var SmallRectShape = DG.Shape.extend({
        createFigure: function() {
            return DG.Figure.create(this, smallRect);
        }
    });
    var CircleShape = DG.Shape.extend({
        createFigure: function() {
            return DG.Figure.create(this, circle);
        }
    });
    var TextShape = DG.Label.extend({
        createFigure: function() {
            return DG.Figure.create(this, text);
        }
    });
    var PolyShape = DG.Shape.extend({
        createFigure: function() {
            return DG.Figure.create(this, poly);
        }
    });
    var GridShape = DG.Shape.extend({
        initialize: function() {
            this.layout = new DG.GridLayout(this, {
                columns: 2,
                vgap: 10,
                hgap: 5,
                marginWidth: 10,
                marginHeight: 4
            });
            this.add(new CircleShape());
            this.add(new SmallRectShape());
            this.add(new CircleShape());
            this.children[1].gridData = new DG.GridData({
                grabExcessHorizontalSpace: true
            });
        },
        createFigure: function() {
            return DG.Figure.create(this, rect);
        }
    });

    var diagram = new DG.Diagram('canvas');
    diagram.render();

    var click = function(e) {
        var point = DG.Point.get(e);
        if (createShape) {
            diagram.add(new RectShape({ x: point.x, y: point.y }));
            diagram.render();
            createShape = false;
        }
        if (createCircle) {
            diagram.add(new CircleShape({ x: point.x, y: point.y }));
            diagram.render();
            createCircle = false;
        }
        if (createText) {
           diagram.add(new TextShape({ x: point.x, y: point.y }));
           diagram.render();
           createText = false;
        }
        if (createPoly) {
            diagram.add(new PolyShape({ x: point.x, y: point.y }));
            diagram.render();
            createPoly = false;
        }
        if (createGrid) {
            console.log('create grid');
            diagram.add(new GridShape({ x: point.x, y: point.y }));
            diagram.render();
            createGrid = false;
        }
    };

    var createShape = false;
    var createCircle = false;
    var createText = false;
    var createPoly = false;
    var createGrid = false;

    SVG.on(document.getElementById('canvas'), 'click', click);

    document.getElementById('createShape').addEventListener('click', function() {
        createShape = true;
    });
    document.getElementById('createCircle').addEventListener('click', function() {
        createCircle = true;
    });
    document.getElementById('createText').addEventListener('click', function() {
        createText = true;
    });
    document.getElementById('createPoly').addEventListener('click', function() {
        createPoly = true;
    });
    document.getElementById('createGrid').addEventListener('click', function() {
        createGrid = true;
    });
};

