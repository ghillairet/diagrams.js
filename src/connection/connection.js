// Connection
//
//    showcase.Line = Diagram.Connection.extend({
//        type: 'showcase.Line',
//        stroke: 'red',
//        'stroke-width': 2,
//        end: {
//            type: "none"
//        },
//        start: {
//            type: "none"
//        }
//    });
var Connection = Diagram.Connection = function( attributes ) {
    attributes || (attributes = {});

    if (!attributes.diagram) {
        throw new Error('Connection cannot be initialized, diagram property missing.');
    }

    this.diagram = attributes.diagram;

    this.attributes = {};
    this.attributes.children = [];
    this.attributes.attr = {};

    this.set('type', this.type);
    if ( attributes.id ) {
        this.set('id', attributes.id);
    } else {
        this.set('id', _.uniqueId());
    }

    var attrs = Raphael._availableAttrs;
    for (var key in this) {
        if (_.has(attrs, key)) {
            this.get('attr')[key] = this[key];
        }
    }
    _.extend(this.get('attr'), this._attr(attributes));

    this.set('sourceAnchor', new ConnectionAnchor({ connection: this }));
    this.set('targetAnchor', new ConnectionAnchor({ connection: this }));

    this._initChildren( attributes.children );

    this.diagram.get('edges').push(this);
    this.diagram.trigger('add:edges', this);

    this.initialize.apply(this, arguments);
};

Connection.extend = extend;

_.extend(
    Diagram.Connection.prototype,
    Diagram.SVGElement.prototype,
    Events
);

// Helper functions

function connectionPathCommands(start, end, vertices, smooth) {
    var commands = ["M", start.x, start.y],
        i = 0,
        l = vertices.length;
    for (; i < l; i++) {
        commands.push("L", vertices[i].x, vertices[i].y);
    }
    commands.push("L", end.x, end.y);
    return commands;
};

// Calculates angle for arrows.
function theta( p1, p2 ) {
    var y = -(p2.y - p1.y), // invert the y-axis
        x = p2.x - p1.x,
        rad = Math.atan2(y, x);

    if (rad < 0) { // correction for III. and IV. quadrant
        rad = 2 * Math.PI + rad;
    }

    return {
        degrees: 180 * rad / Math.PI,
        radians: rad
    };
};

Connection.prototype.initialize = function() {};

Connection.prototype._initChildren = function( children ) {
    // load from json
    if (children && children.length) {

    } else {
        if (this.label) {
            var labels = _.isArray(this.label) ? this.label : [this.label];
            _.each( labels, function( label ) {
                var l = this.createLabel( label );
                this.get( 'children' ).push( l );
            }, this);
        }
    }
};

Connection.prototype.createLabel = function( label ) {
    label.connection = this;
    return new ConnectionLabel( label );
};

// @private
Connection.prototype.createConnection = function() {
    var paths = [],
        paper = this.paper();
        con = paper.path( this.paths.join(" ") );

        if (this.has('attr')) {
            con.attr(this.get('attr'));
        }

        return con;
};

Connection.prototype.remove = function() {
    this.disconnect();
    this._clear();
};

/**
 * @private
**/
Connection.prototype._clear = function() {
    if (this.wrapper) {
        this.wrapper.remove();
        this.wrapper = null;
    }
    if (this.startArrow) {
        this.startArrow.remove();
    }
    if (this.endArrow) {
        this.endArrow.remove();
    }
    if (this.dummy) {
        this.dummy.remove();
    }
    _.each(this.get('children'), function( child ) {
        child.remove();
    });
};

Connection.prototype.render = function() {
    var sbox, tbox, paper = this.paper();

    if (this.state && this.state === 'dragging') {
        if (this.dragger === this.get('sourceAnchor')) {
            sbox = this.get('sourceAnchor').wrapper.getABox();
            tbox = this.get('target').wrapper.getABox();
        } else {
            sbox = this.get('source').wrapper.getABox();
            tbox = this.get('targetAnchor').wrapper.getABox();
        }
    } else {
        sbox = this.get('source').wrapper.getABox();
        tbox = this.get('target').wrapper.getABox();
    }

    var centerLine = new Line(paper, sbox.center, tbox.center);
    var srcPoint = centerLine.findIntersection( sbox );
    var tgtPoint = centerLine.findIntersection( tbox );
    centerLine.remove();

    if (!srcPoint || !tgtPoint) return;

    this._clear();

    var th = theta( sbox.center, tbox.center );
    var c1r = 360 - th.degrees + 180;
    var c2r = 360 - th.degrees;

    this.paths = connectionPathCommands( srcPoint, tgtPoint, [], false );

    this.wrapper = this.createConnection();
    this.wrapper.toFront();

    this.startArrow = new ConnectionEnd( paper, srcPoint, c1r, th.radians, this.start );
    this.startArrow.render();
    this.endArrow = new ConnectionEnd( paper, tgtPoint, c2r, th.radians, this.end );
    this.endArrow.render();

    this.get('sourceAnchor').move(srcPoint).render().hide();
    this.get('targetAnchor').move(tgtPoint).render().hide();

    // Dummy is a larger line receiving clicks from users
    this.dummy = new Line(paper, srcPoint, tgtPoint);
    this.dummy.attr({ opacity: 0, 'stroke-width': 12 });

    _.each(this.get('children'), function(child) {
        child.render();
    });

    var connection = this;
    this.dummy.wrapper.click(function( event ) {
        connection.get('sourceAnchor').toFront().show();
        connection.get('targetAnchor').toFront().show();

        if (connection.diagram.selected) {
            connection.diagram.selected.deselect();
        }
    });

    return this;
};

Connection.prototype.connect = function( src, tgt ) {
    this.set('source', src);
    this.set('target', tgt);

    this.get('sourceAnchor').attach( src );
    this.get('targetAnchor').attach( tgt );

    src.trigger('connect:source', this);
    tgt.trigger('connect:target', this);

    src.outEdges.push(this);
    tgt.inEdges.push(this);

    return this;
};

Connection.prototype.disconnect = function() {
    var source = this.get('source');
    var target = this.get('target');

    if (source) {
        source.outEdges = _.reject(source.outEdges, function( edge ) {
            return edge === this;
        }, this);
    }

    if (target) {
        target.inEdges = _.reject(target.inEdges, function( edge ) {
            return edge === this;
        }, this);
    }

    this.set('source', null);
    this.set('target', null);

    return this;
};

Connection.prototype.toJSON = function() {
    var clone = {};
    clone.source = this.get('source').get('id');
    clone.target = this.get('target').get('id');
    clone.type = this.get('type');
    clone.id = this.get('id');
    clone.sourceAnchor = this.get('sourceAnchor');
    clone.targetAnchor = this.get('targetAnchor');
    clone.x = this.get('x');
    clone.y = this.get('y');

    if (this.wrapper) {
        clone.attr = this.wrapper.attr();
    }

    return clone;
};
