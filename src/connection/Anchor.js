
/**
 * @name ConnectionAnchor
 * @class Represents a connection anchor
 * @augments DiagramElement
 */

var ConnectionAnchor = Ds.ConnectionAnchor = Ds.DiagramElement.extend(/** @lends ConnectionAnchor.prototype */ {

    constructor: function(attributes) {
        Ds.DiagramElement.apply(this, [attributes]);

        this.connection = attributes.connection;
    },

    bounds: function() {
        if (this.wrapper)
            return this.wrapper.getABox();
        else return null;
    },

    position: function() {
        if (this.connection.get('sourceAnchor') === this)
            return 'source';
        else return 'end';
    },

    /**
     * Moves the connection anchor to the given point
     *
     * @param {Point} point
     */

    move: function(point) {
        this.x = point.x;
        this.y = point.y;
        if (this.wrapper) {
            this.wrapper.attr({ x: this.x - 2, y: this.y - 2 });
        }
        return this;
    },

    /**
     * Renders the connection anchor on the canvas
     */

    render: function() {
        if (this.wrapper) return this;

        var paper = this.connection.renderer();
        this.wrapper = paper.rect( this.x - 3, this.y - 3, 6, 6 );
        this.wrapper.attr({ fill: 'black', stroke: 'none' });
        this.wrapper.anchor = this;
        this.asDraggable();

        return this;
    },

    /**
     * Removes the connection anchor from the canvas
     */

    remove: function() {
        if (this.wrapper) this.wrapper.remove();
    },

    getConnectableElement: function() {
        var anchor = this;
        var wrapper = this.wrapper;
        var connection = this.connection;
        var diagram = connection.diagram;
        var foundShapes = diagram.getShapesByPoint(this.x, this.y);

        var connectable = function(memo, shape) {
            if (connection.canConnect(shape, anchor.position()))
                memo.push(shape);
            return memo;
        };
        var connectables = _.reduceRight(foundShapes, connectable, []);

        return connectables.length ? connectables[0] : null;
    },

    establishConnection: function(shape) {
        var anchor = this;
        var wrapper = this.wrapper;
        var isTarget;

        if (shape) anchor.shape = shape;
        anchor.connection.state = null;

        if (this.position() === 'end') {
            anchor.connection.connect( anchor.connection.get('sourceAnchor').shape, anchor.shape );
        } else {
            anchor.connection.connect( anchor.shape, anchor.connection.get('targetAnchor').shape );
        }
        anchor.connection.render();
    },

    asDraggable: function() {

        var move = function( dx, dy ) {
            this.attr({ x: this.ox + dx, y: this.oy + dy });
            this.anchor.connection.state = 'dragging';
            this.anchor.connection.dragger = this.anchor;
            this.anchor.connection.render();
        };

        var start = function() {
            this.o();
            this.anchor.shape.disconnect( this.anchor.connection );
        };

        var end = function() {
            var shape = this.anchor.getConnectableElement();
            if (shape) this.anchor.establishConnection(shape);
        };

        this.wrapper.drag(move, start, end);

        return this;
    },

    attach: function( shape ) {
        var bounds = shape.bounds();
        if (bounds.xCenter && bounds.yMiddle) {
            this.x = bounds.xCenter;
            this.y = bounds.yMiddle;
        }
        this.shape = shape;
        return this;
    },

    hide: function() {
        if (this.wrapper) this.wrapper.hide();
        return this;
    },

    show: function() {
        if (this.wrapper) this.wrapper.show();
        return this;
    },

    toFront: function() {
        if (this.wrapper) this.wrapper.toFront();
        return this;
    },

    toBack: function() {
        if (this.wrapper) this.wrapper.toBack();
        return this;
    },

    /**
     * Returns the JSON representation
     */

    toJSON: function() {
        this.set('x', this.wrapper.x());
        this.set('y', this.wrapper.y());

        return this._deepClone(this.attributes);
    }

});

