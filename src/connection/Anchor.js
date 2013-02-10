
/**
 * @name ConnectionAnchor
 * @class Represents a connection anchor
 * @augments DiagramElement
 */

var ConnectionAnchor = Ds.ConnectionAnchor = Ds.DiagramElement.extend(/** @lends ConnectionAnchor.prototype */ {

    constructor: function(attributes) {
        Ds.DiagramElement.apply(this, [attributes]);

        this.connection = attributes.connection;
        this.diagram = this.connection.diagram;
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
        if (this.wrapper) {
            return this;
        }

        var paper = this.paper();
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
        if (this.wrapper) {
            this.wrapper.remove();
        }
    },

    asDraggable: function() {

        var move = function( dx, dy ) {
            this.attr({ x: this.ox + dx, y: this.oy + dy });
            // TODO change that.
            this.anchor.connection.state = 'dragging';
            this.anchor.connection.dragger = this.anchor;
            this.anchor.connection.render();
        };

        var start = function() {
            this.o();
            this.anchor.shape.disconnect( this.anchor.connection );
        };

        var end = function() {
            var paper = this.paper;
            var unders = paper.getElementsByPoint( this.attr('x'), this.attr('y') );
            var el = _.find(unders, function(under) {
                return (under !== this.anchor && under.controller);
            }, this);

            if (el) {
                this.anchor.shape = el.controller;
            }

            this.anchor.connection.state = null;
            var isTarget = this.anchor.connection.get('targetAnchor') === this.anchor;

            if (isTarget) {
                this.anchor.connection.connect( this.anchor.connection.get('sourceAnchor').shape, this.anchor.shape );
            } else {
                this.anchor.connection.connect( this.anchor.shape, this.anchor.connection.get('targetAnchor').shape );
            }
            this.anchor.connection  .render();
        };

        this.wrapper.drag(move, start, end);

        return this;
    },

    attach: function( shape ) {
        this.shape = shape;
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

