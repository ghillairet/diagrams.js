/**
 * @name Diagram
 * @class
 *
 */
var Diagram = DG.Diagram = function(element, options) {
    this.doc        = new SVG.Doc(element);
    this.shapes     = [];
    this.edges      = [];
    this.selected   = [];
    this.wrapper    = this.doc.rect().attr(Diagram.figure);

    this.wrapper.click(Diagram.delSelection(this));
    this.wrapper.on('mousedown', SelectionBox.mousedown(this));
    SVG.on(window, 'mouseup', SelectionBox.mouseup(this));
    SVG.on(window, 'mousemove', SelectionBox.mousemove(this));
    this.on('click', this.deselect);

   this.initialize.apply(this, [options]);
};

Diagram.extend = extend;

Diagram.figure = {
    fill: '#fff',
    'fill-opacity': 0,
    stroke: 'none',
    width: '100%',
    height: '100%'
};

Diagram.addElement = function(diagram) {
    return function(element) {
        if (element instanceof Shape || element instanceof Label) {
            element.parent = diagram;
            element.isRoot = true;
            diagram.shapes.push(element);
            element.on('select', Diagram.addSelection(diagram, element));
        } else if (arg instanceof Connection) {
            element.parent = diagram;
            diagram.edges.push(element);
            element.on('select', Diagram.addSelection(diagram, element));
        }
    };
};

Diagram.addSelection = function(diagram, element) {
    return function() {
        diagram.select(element);
    };
};

Diagram.delSelection = function(diagram) {
    return function() {
        diagram.deselect();
    };
};

_.extend(DG.Diagram.prototype, Events, {

    initialize: function() {},

    eachShape: function(fn, ctx) {
        _.each(this.shapes, fn, ctx || this);
        return this;
    },

    eachEdge: function(fn, ctx) {
        _.each(this.edges, fn, ctx || this);
        return this;
    },

    findShape: function(fn, ctx) {
        return _.find(this.shapes, fn, ctx);
    },

    add: function() {
        _.each(arguments, Diagram.addElement(this));
        return this;
    },

    render: function() {
        return this.eachShape(function(s) {
            s.render();
        }).eachEdge(function(e) {
            e.render();
        });
    },

    remove: function(element) {
        if (element instanceof Connection) {
            this.edges = _.without(this.edges, element);
        } else {
            this.shapes = _.without(this.shapes, element);
        }
    },

    select: function(element) {
        var isSelected = _.find(this.selected, function(e) {
            return e === element;
        });
        if (!isSelected) {
            this.selected.push(element);
        }
    },

    deselect: function(element) {
        if (element) {
            element.deselect();
            this.selected = _.without(this.selected, element);
        } else {
            _.each(this.selected, function(e) {
                e.deselect();
            });
            this.selected.length = 0;
        }
        return this;
    },

    selectNodes: function(box) {
        this.eachShape(function(shape) {
            if (shape.isInside(box)) {
                shape.select();
            }
        }, this);
    }

});

