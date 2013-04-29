
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
        var paper = this.renderer();
        this.wrapper = paper.rect(this.x, this.y, 6, 6, 0)
            .attr(this.box.anchorStyle);

        if (this.box.resizable) {
            this.wrapper.attr({ cursor: this.cursor });
        }

        this.wrapper.box = this.box;
        this.wrapper.anchor = this;

        if (this.box.resizable) {
            this.wrapper.drag(Anchor.move, Anchor.start, Anchor.end);
        }

        return this;
    },

    hide: function() {
        if (this.wrapper) this.wrapper.hide();
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
    var current = this.anchor;
    var control = this.box;

    current.active = true;
    this.o();
    this.box.figure.wrapper.o();
    control.startResize();
};

Anchor.move = function( dx, dy, mx, my, eve ) {
    var control = this.box,
        direction = this.anchor.direction;

    this.attr( { x: this.ox + dx, y: this.oy + dy } );
    control.resize(dx, dy, direction);
};

Anchor.end = function() {
    var current = this.anchor;
    var control = this.box;

    current.active = false;
    control.endResize();
    current.box.select();
};

/**
 * @name NorthWestAnchor
 * @class
 * @augments Anchor
 *
 */

Ds.NorthWestAnchor = Anchor.extend({

    initialize: function( properties ) {
        var bbox = properties.box.figure.bounds();
        this.x = bbox.x - 3;
        this.y = bbox.y - 3;
        this.cursor = 'nw-resize';
        this.direction = 'nw';
    }

});

/**
 * @name SouthWestAnchor
 * @class
 * @augments Anchor
 *
 */

Ds.SouthWestAnchor = Anchor.extend({

    initialize: function( properties ) {
        var bbox = properties.box.figure.bounds();
        this.x = bbox.xLeft - 3;
        this.y = bbox.yBottom - 3;
        this.cursor = 'sw-resize';
        this.direction = 'sw';
    }

});

/**
 * @name NorthEastAnchor
 * @class
 * @augments Anchor
 *
 */

Ds.NorthEastAnchor = Anchor.extend({

    initialize: function( properties ) {
        var bbox = properties.box.figure.bounds();
        this.x = bbox.xRight - 3;
        this.y = bbox.y - 3;
        this.cursor = 'ne-resize';
        this.direction = 'ne';
    }

});

/**
 * @name SouthEastAnchor
 * @class
 * @augments Anchor
 *
 */

Ds.SouthEastAnchor = Anchor.extend({

    initialize: function( properties ) {
        var bbox = properties.box.figure.bounds();
        this.x = bbox.xRight - 3;
        this.y = bbox.yBottom - 3;
        this.cursor = 'se-resize';
        this.direction = 'se';
    }

});

/**
 * @name NorthAnchor
 * @class
 * @augments Anchor
 *
 */

Ds.NorthAnchor = Anchor.extend({

    initialize: function( properties ) {
        var bbox = properties.box.figure.bounds();
        this.x = bbox.xCenter - 3;
        this.y = bbox.y - 3;
        this.cursor = 'n-resize';
        this.direction = 'n';
    }

});

/**
 * @name SouthAnchor
 * @class
 * @augments Anchor
 *
 */

Ds.SouthAnchor = Anchor.extend({

    initialize: function( properties ) {
        var bbox = properties.box.figure.bounds();
        this.x = bbox.xCenter - 3;
        this.y = bbox.yBottom - 3;
        this.cursor = 's-resize';
        this.direction = 's';
    }

});

/**
 * @name WestAnchor
 * @class
 * @augments Anchor
 *
 */

Ds.WestAnchor = Anchor.extend({

    initialize: function( properties ) {
        var bbox = properties.box.figure.bounds();
        this.x = bbox.x - 3;
        this.y = bbox.yMiddle - 3;
        this.cursor = 'w-resize';
        this.direction = 'w';
    }

});

/**
 * @name EastAnchor
 * @class
 * @augments Anchor
 *
 */

Ds.EastAnchor = Anchor.extend({

    initialize: function( properties ) {
        var bbox = properties.box.figure.bounds();
        this.x = bbox.xRight - 3;
        this.y = bbox.yMiddle - 3;
        this.cursor = 'e-resize';
        this.direction = 'e';
    }

});



