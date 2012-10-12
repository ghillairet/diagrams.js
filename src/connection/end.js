// ConnectionEnd
//
//  end: {
//      type: 'basic',
//      label: {
//          text: '[]'
//      }
//  }
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

_.extend(ConnectionEnd.prototype, Diagram.Element.prototype, Diagram.SVGElement);

ConnectionEnd.prototype.remove = function() {
    if (this.wrapper) {
        this.wrapper.remove();
    }
};

ConnectionEnd.prototype.render = function() {
    var type = this.get('type');
    if (!type || type === 'none') {
        return this;
    }

    var arrow;
    if (typeof Diagram.arrows[type] === 'function') {
        arrow = Diagram.arrows[type]( this.point );
    } else {
        arrow = Diagram.arrows.basic( this.point );
    }

    // Don't ask.
    var x = this.point.x + (-2 * (arrow.dx - 1) * Math.cos(this.radians));
    var y = this.point.y + (2 * (arrow.dy - 1) * Math.sin(this.radians));

    this.wrapper = this.paper.path( arrow.path.join(' ') );

    this.wrapper.attr( arrow.attr );
    this.wrapper.attr( this.get('attr') );
    this.wrapper.translate( x, y );
    this.wrapper.rotate( this.angle );

    return this;
};