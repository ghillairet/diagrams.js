/*
 * @name ConnectionEnd
 * @class Represents a connection end
 *
 */

var ConnectionEnd = function( paper, point, angle, radians, attributes ) {
    this.paper = paper;
    this.point = point;
    this.angle = angle;
    this.radians = radians;
    this.attributes = {};
    this.attributes.attr = {};

    if (attributes) {
        this.attributes.type = attributes.type;
        var attrs = Raphael._availableAttrs;
        for (var key in attributes) {
            if (_.has(attrs, key)) {
                this.get('attr')[key] = attributes[key];
            }
        }
    }

    return this;
};

_.extend(ConnectionEnd.prototype, Ds.Element.prototype);

/**
 * Removes the ConnectionEnd from the canvas
 */

ConnectionEnd.prototype.remove = function() {
    if (this.wrapper) {
        this.wrapper.remove();
    }
};

/**
 * Renders the ConnectionEnd on the canvas
 */

ConnectionEnd.prototype.render = function() {
    var type = this.get('type');
    if (!type || type === 'none') {
        return this;
    }

    var arrow;
    if (typeof Ds.arrows[type] === 'function') {
        arrow = Ds.arrows[type]( this.point );
    } else {
        arrow = Ds.arrows.basic( this.point );
    }

    // Don't ask.
    var x = this.point.x + (-1.5 * (arrow.dx - 1) * Math.cos(this.radians));
    var y = this.point.y + (1.5 * (arrow.dy - 1) * Math.sin(this.radians));

    this.wrapper = this.paper.path( arrow.path.join(' ') );

    this.wrapper.attr( arrow.attr );
    this.wrapper.attr( this.get('attr') );
    this.wrapper.translate( x, y );
    this.wrapper.rotate( this.angle );

    return this;
};
