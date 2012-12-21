
// Anchor
//

var Anchor = Ds.Anchor = Ds.DiagramElement.extend({
    cursor: 'none',

    constructor: function(attributes) {
        Ds.DiagramElement.apply(this, [attributes]);

        this.box = attributes.box;
        this.diagram = this.box.diagram;

        this.initialize.apply(this, arguments);
    },

    initialize: function(attributes) {},

    render: function() {
        var paper = this.paper();
        this.wrapper = paper.rect(this.x, this.y, 6, 6, 0).attr({
            fill: 'black',
            stroke: 'none',
            'fill-opacity': 1
        });

        if (this.box.resizable) {
            this.wrapper.attr({ cursor: this.cursor });
        }

        this.wrapper.box = this.box.wrapper;
        this.wrapper.anchor = this;

        return this;
    },

    remove: function() {
        if (this.wrapper) {
            this.wrapper.remove();
        }
        if (this.box) {
            var box = this.box;
            this.box = null;
            if (box.anchor) {
                delete box.anchor;
            }
        }
    }

});

Anchor.start = function() {
    this.o();
    this.box.o();

    var current = this.anchor;
    var control = this.box.controller;

    control.startresize();

    if (control.shadow) {
        control.shadowWrapper.remove();
    }

    _.each(control.selectionAnchors, function( anchor ) {
        if (anchor !== current) {
            anchor.remove();
        }
    });
};

Anchor.move = function( dx, dy, mx, my, ev ) {
    this.attr( { x: this.ox + dx, y: this.oy + dy } );

    var control = this.box.controller,
        min, r;

    if (control) {
        min = control.minimumSize();
        r = control.wrapper.rdxy(dx, dy, this.anchor.direction);

        if (r.width < min.width) r.width = min.width;
        if (r.height < min.height) r.height = min.height;

        control.set(r);
        control._renderEdges();
    }
};

Anchor.end = function() {
    var control = this.box.controller;

    control.endresize();

    if (control.shadow) {
        control.createShadow();
    }

    if (this.anchor) {
        this.anchor.box.select();
    }
};

var NorthWestAnchor = Anchor.extend({

    initialize: function( properties ) {
        var bbox = properties.box.wrapper.getABox();
        this.x = bbox.x - 3;
        this.y = bbox.y - 3;
        this.cursor = 'nw-resize';
        this.direction = 'nw';
    },

    resizable: function() {
        this.wrapper.drag(Anchor.move, Anchor.start, Anchor.end);
        return this;
    }

});

var SouthWestAnchor = Anchor.extend({

    initialize: function( properties ) {
        var bbox = properties.box.wrapper.getABox();
        this.x = bbox.xLeft - 3;
        this.y = bbox.yBottom - 3;
        this.cursor = 'sw-resize';
        this.direction = 'sw';
    },

    resizable: function() {
        this.wrapper.drag(Anchor.move, Anchor.start, Anchor.end);
        return this;
    }

});

var NorthEastAnchor = Anchor.extend({

    initialize: function( properties ) {
        var bbox = properties.box.wrapper.getABox();
        this.x = bbox.xRight - 3;
        this.y = bbox.y - 3;
        this.cursor = 'ne-resize';
        this.direction = 'ne';
    },

    resizable: function() {
        this.wrapper.drag(Anchor.move, Anchor.start, Anchor.end);
        return this;
    }

});

var SouthEastAnchor = Anchor.extend({

    initialize: function( properties ) {
        var bbox = properties.box.wrapper.getABox();
        this.x = bbox.xRight - 3;
        this.y = bbox.yBottom - 3;
        this.cursor = 'se-resize';
        this.direction = 'se';
    },

    resizable: function() {
        this.wrapper.drag(Anchor.move, Anchor.start, Anchor.end);
        return this;
    }

});

