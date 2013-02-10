
/**
 * @name Anchor
 * @class Abstract representation of a resize box
 * @augments DiagramElement
 *
 */

var Anchor = Ds.Anchor = Ds.DiagramElement.extend( /** @lends Anchor.prototype */ {
    cursor: 'none',

    constructor: function(attributes) {
        Ds.DiagramElement.apply(this, [attributes]);

        this.box = attributes.box;
        this.diagram = this.box.diagram;

        this.initialize.apply(this, arguments);
    },

    initialize: function(attributes) {},

    /**
     * Renders the anchor on the canvas
     */

    render: function() {
        var paper = this.paper();
        this.wrapper = paper.rect(this.x, this.y, 6, 6, 0)
            .attr(this.box.anchorStyle);

        if (this.box.resizable) {
            this.wrapper.attr({ cursor: this.cursor });
        }

        this.wrapper.box = this.box.wrapper;
        this.wrapper.anchor = this;

        return this;
    },

    /**
     * Removes the anchor from the canvas
     */

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

    control.startResize();

    if (control.boundBox)
        control.boundBox.render();

    if (control.shadow)
        control.shadowWrapper.remove();

    _.each(control.selectionAnchors, function( anchor ) {
        if (anchor !== current) {
            anchor.remove();
        } else {
            anchor.hide();
        }
    });
};

Anchor.move = function( dx, dy, mx, my, eve ) {
    var control = this.box.controller,
        direction = this.anchor.direction,
        min, limits, r;

    this.attr( { x: this.ox + dx, y: this.oy + dy } );

    min = control.minimumSize();
    limits = control.parent ? control.parent.bounds() : control.paper;
    r = control.wrapper.rdxy(dx, dy, direction, min, limits);
    control.set(r);

    if (control.boundBox)
        control.boundBox.render();

    control.renderEdges();
};

Anchor.end = function() {
    var control = this.box.controller;

    control.endResize();

    if (control.shadow)
        control.createShadow();

    if (control.boundBox)
        control.boundBox.remove();

    if (this.anchor)
        this.anchor.box.select();
};

/**
 * @name NorthWestAnchor
 * @class
 * @augments Anchor
 *
 */

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

/**
 * @name SouthWestAnchor
 * @class
 * @augments Anchor
 *
 */

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

/**
 * @name NorthEastAnchor
 * @class
 * @augments Anchor
 *
 */

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

/**
 * @name SouthEastAnchor
 * @class
 * @augments Anchor
 *
 */

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

/**
 * @name NorthAnchor
 * @class
 * @augments Anchor
 *
 */

var NorthAnchor = Anchor.extend({

    initialize: function( properties ) {
        var bbox = properties.box.wrapper.getABox();
        this.x = bbox.xCenter - 3;
        this.y = bbox.y - 3;
        this.cursor = 'n-resize';
        this.direction = 'n';
    },

    resizable: function() {
        this.wrapper.drag(Anchor.move, Anchor.start, Anchor.end);
        return this;
    }

});

/**
 * @name SouthAnchor
 * @class
 * @augments Anchor
 *
 */

var SouthAnchor = Anchor.extend({

    initialize: function( properties ) {
        var bbox = properties.box.wrapper.getABox();
        this.x = bbox.xCenter - 3;
        this.y = bbox.yBottom - 3;
        this.cursor = 's-resize';
        this.direction = 's';
    },

    resizable: function() {
        this.wrapper.drag(Anchor.move, Anchor.start, Anchor.end);
        return this;
    }

});

/**
 * @name WestAnchor
 * @class
 * @augments Anchor
 *
 */

var WestAnchor = Anchor.extend({

    initialize: function( properties ) {
        var bbox = properties.box.wrapper.getABox();
        this.x = bbox.x - 3;
        this.y = bbox.yMiddle - 3;
        this.cursor = 'w-resize';
        this.direction = 'w';
    },

    resizable: function() {
        this.wrapper.drag(Anchor.move, Anchor.start, Anchor.end);
        return this;
    }

});

/**
 * @name EastAnchor
 * @class
 * @augments Anchor
 *
 */

var EastAnchor = Anchor.extend({

    initialize: function( properties ) {
        var bbox = properties.box.wrapper.getABox();
        this.x = bbox.xRight - 3;
        this.y = bbox.yMiddle - 3;
        this.cursor = 'e-resize';
        this.direction = 'e';
    },

    resizable: function() {
        this.wrapper.drag(Anchor.move, Anchor.start, Anchor.end);
        return this;
    }

});



