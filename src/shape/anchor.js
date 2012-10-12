// Anchor
//
//
var Anchor = function( properties ) {
    this.box = properties.box;
    this.diagram = this.box.diagram;
            
    this.initialize.apply(this, arguments);
};

Anchor.cursor = '';

_.extend(Anchor.prototype, Diagram.SVGElement.prototype);

Anchor.extend = extend;

Anchor.prototype.initialize = function( properties ) {};

Anchor.prototype.render = function() {
    var paper = this.paper();
    this.wrapper = paper.rect(this.x, this.y, 8, 8, 0).attr({
//        fill: 'rgb(255,132,0)',
//        stroke: 'rgb(255,132,0)',
        fill: 'grey',
        stroke: 'whitesmoke',
        'stroke-width': 1,
        'stroke-opacity': 1,
        opacity: 1
    });

    if (this.box.resizable) {
        this.wrapper.attr({ cursor: this.cursor });
    }

    this.wrapper.box = this.box.wrapper;
    this.wrapper.anchor = this;

    return this;
};

Anchor.prototype.remove = function() {
    if (this.wrapper) {
        this.wrapper.remove();
    }
    if (this.box) {
        var box = this.box;
        this.box = null;
        if (box.anchor) {
            box.anchor = null;
        }
    }
};

Anchor.start = function() {
    this.o();
    this.box.o();

    var current = this.anchor;
    var controller = this.box.controller;

    if (controller.shadow) {
        controller.shadowWrapper.remove();
    }

    _.each(controller.selectionAnchors, function( anchor ) {
        if (anchor !== current) {
            anchor.remove();
        }
    });

    if (controller.has('children')) {
        var children = controller.get('children');
        if (children && children.length) {
            for (var i = 0; i < children.length; i++) {
                Anchor.startInner.apply( children[i] );
            }
        }
    }
};

Anchor.startInner = function() {
    this.wrapper.o();

    if (this.has('children')) {
        var children = this.get('children');
        if (children && children.length) {
            for (var i = 0; i < children.length; i++) {
                Anchor.startInner.apply( children[i] );
            }
        }
    }
};

Anchor.move = function( dx, dy, mx, my, ev ) {
    this.attr( { x: this.ox + dx, y: this.oy + dy } );

    if (this.box.controller) {
        var control = this.box.controller;
        control.resize(dx, dy, this.anchor.direction);

        if (control.isConnectable) {
            _.each(control.inEdges, function( edge ) { edge.render(); });
            _.each(control.outEdges, function( edge ) { edge.render(); });
        }
    }
};

Anchor.end = function() {
    var controller = this.box.controller;
    if (controller && controller.shadow) {
        controller.createShadow();
    }
    if (this.anchor) {
        this.anchor.box.select();
    }
};

var NorthWestAnchor = Anchor.extend({

    initialize: function( properties ) {
        var bbox = properties.box.wrapper.getABox();
        this.x = bbox.x - 4;
        this.y = bbox.y - 4;
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
        this.x = bbox.xLeft - 4;
        this.y = bbox.yBottom - 4;
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
        this.x = bbox.xRight - 4;
        this.y = bbox.y - 4;
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
        this.x = bbox.xRight - 4;
        this.y = bbox.yBottom - 4;
        this.cursor = 'se-resize';
        this.direction = 'se';
    },

    resizable: function() {
        this.wrapper.drag(Anchor.move, Anchor.start, Anchor.end);
        return this;
    }

});
