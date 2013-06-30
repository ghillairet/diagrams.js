/**
 * @name Shape
 * @class
 *
 */
var Shape = DG.Shape = function(attributes) {
    var attrs = attributes || {};

    this.attributes         = attrs;
    this.inEdges            = [];
    this.outEdges           = [];
    this.children           = [];
    this.parent             = null;
    this.isRoot             = false;
    this.isSelected         = false;
    this.hasConnectAnchors  = false;

    this.initialize.apply(this, arguments);
};

//
// drag functions
//


Shape.dragstart = function(shape) {
    return function() {
        shape.hideChildren();
        shape.deselect();
    };
};

Shape.dragmove = function(shape) {
    return function() {
        shape.refreshEdges();
    };
};

Shape.dragend = function(shape) {
    return function() {
        shape.showChildren();
    };
};


//
// Shape prototype
//


_.extend(Shape.prototype, Events, {

    config: {
        resizable: true,
        selectable: true,
        draggable: true
    },

    anchors: [
        { position: 'n' },
        { position: 's' },
        { position: 'w' },
        { position: 'e' }
    ],

    render: function() {
        if (this.figure || (this.figure = this.createFigure())) {
            this.renderChildren();

            if (this.config.draggable) {
                this.figure.dragstart   = Shape.dragstart(this);
                this.figure.dragmove    = Shape.dragmove(this);
                this.figure.dragend     = Shape.dragend(this);
                this.figure.draggable();
            }

            var me = this;
            if (this.config.selectable) {
                this.figure.on('click', function() { me.select(); });
            }
            this.figure.on('click', function(e) { me.trigger('click', e); });
        }
        return this;
    },

    renderChildren: function() {
        _.each(this.children, render);
        this.doLayout();
    },

    showChildren: function() {
        _.each(this.children, function(c) {
            c.figure.show();
            if (c.children) c.showChildren();
        });
        if (this.isRoot && this.layout) {
            this.doLayout();
        }
    },

    hideChildren: function() {
        _.each(this.children, function(c) {
            c.figure.hide();
            if (c.children) c.hideChildren();
        });
    },

    doLayout: function() {
        if (this.layout) {
            this.figure.attr(this.layout.size());
            this.layout.layout();
        }
    },

    diagram: function() {
        var parent = this;
        while(parent.parent) parent = parent.parent;
        return parent;
    },

    add: function(shape) {
        shape.parent = this;
        this.children.push(shape);
    },

    remove: function() {
        if (this.figure) {
            this.figure.off();
            this.figure.remove();
            _.each(this.children, function(c) {
                c.remove();
            });
            _.each(this.inEdges, function(e) {
                e.remove();
            });
            _.each(this.outEdges, function(e) {
                e.remove();
            });
            this.diagram().remove(this);
        }
        return this;
    },

    select: function() {
        this.isSelected = true;
        this.figure.select();
        this.figure.showConnectAnchors();
        this.trigger('select');
    },

    deselect: function() {
        this.isSelected = false;
        this.figure.deselect();
        this.figure.hideConnectAnchors();
        this.trigger('select');
    },

    move: function(x, y) {
        if (this.figure) this.figure.move(x, y);
        this.doLayout();
        return this;
    },

    refreshEdges: function() {
        _.each(this.inEdges, render);
        _.each(this.outEdges, render);
    },

    isInside: function(box) {
        var bbox = this.figure.bbox();
        return bbox.x >= box.x &&
            (bbox.x + bbox.width) <= (box.x + box.width) &&
            bbox.y >= box.y &&
            (bbox.y + bbox.height) <= (box.y + box.height);
    },

    initialize: function() {},
    createFigure: function() {}

});

function render(e) {
    return typeof e.render === 'function' ? e.render() : e;
}

Shape.extend = extend;

