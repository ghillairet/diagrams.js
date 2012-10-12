// diagram.js
// version 0.0.1
(function() {
//    "use strict";

    var root = this;

    root.Diagram = Diagram = {
        version: '0.0.1'
    };

/**
 *
 * @param x
 * @param y
 * @returns {Point}
 */
var Point = function Point( x, y ) {
    var xy;
    if (y === undefined){
        // from string
        xy = x.split(x.indexOf("@") === -1 ? " " : "@");
        this.x = parseInt(xy[0], 10);
        this.y = parseInt(xy[1], 10);
    } else {
        this.x = x;
        this.y = y;
    }
};

Point.getMousePosition = function( paper, evt ) {
    // IE:
    if (window.event && window.event.contentOverflow !== undefined) {
        return new Point(window.event.x, window.event.y);
    }

    // Webkit:
    if (evt.offsetX !== undefined && evt.offsetY !== undefined) {
        return new Point(evt.offsetX, evt.offsetY);
    }

    // Firefox:
    // get position relative to the whole document
    // note that it also counts on scrolling (as opposed to clientX/Y).
    var pageX = evt.pageX;
    var pageY = evt.pageY;

    // SVG's element parent node is world
    var el = paper.canvas.parentNode;

    // get position of the paper element relative to its offsetParent
    var offsetLeft = el ? el.offsetLeft : 0;
    var offsetTop = el ? el.offsetTop : 0;
    var offsetParent = el ? el.offsetParent : 0;

    var offsetX = pageX - offsetLeft;
    var offsetY = pageY - offsetTop;

    // climb up positioned elements to sum up their offsets
    while (offsetParent) {
        offsetX += offsetParent.offsetLeft;
        offsetY += offsetParent.offsetTop;
        offsetParent = offsetParent.offsetParent;
    }

    return new Point(offsetX, offsetY);
};
// Line
//
//
var Line = function(paper, p1, p2) {
    this.paper = paper;
    this.start = p1;
    this.end = p2;
    this.wrapper = paper.path('M'+this.start.x+','+this.start.y+'L'+this.end.x+','+this.end.y);
    return this;
};

Line.prototype.attr = function() {
    return Raphael.el.attr.apply(this.wrapper, arguments);
};

Line.prototype.remove = function() {
    this.wrapper.remove();
};

// Find point of intersection between two lines
Line.prototype.intersection = function(line) {
    var pt1Dir = { x: this.end.x - this.start.x, y: this.end.y - this.start.y },
        pt2Dir = { x: line.end.x - line.start.x, y: line.end.y - line.start.y },
        det = (pt1Dir.x * pt2Dir.y) - (pt1Dir.y * pt2Dir.x),
        deltaPt = { x: line.start.x - this.start.x, y: line.start.y - this.start.y },
        alpha = (deltaPt.x * pt2Dir.y) - (deltaPt.y * pt2Dir.x),
        beta = (deltaPt.x * pt1Dir.y) - (deltaPt.y * pt1Dir.x);

    if (det === 0 || alpha * det < 0 || beta * det < 0) {
        return null;    // no intersection
    }

    if (det > 0) {
        if (alpha > det || beta > det) {
            return null;
        }
    } else {
        if (alpha < det || beta < det) {
            return null;
        }
    }

    return {
        x: this.start.x + (alpha * pt1Dir.x / det),
        y: this.start.y + (alpha * pt1Dir.y / det)
    }
};

// Find intersection point with a box.
Line.prototype.findIntersection = function( box ) {
    var points = [
        { p1: box.topLeft, p2: box.topRight },
        { p1: box.topLeft, p2: box.bottomLeft },
        { p1: box.bottomLeft, p2: box.bottomRight },
        { p1: box.bottomRight, p2: box.topRight }
    ];

    for (var i = 0; i < points.length; i++) {
        var boxLine = new Line(this.paper, points[i].p1, points[i].p2);
        var intersection = this.intersection( boxLine );
        boxLine.remove();

        if (intersection) {
            return intersection;
        }
    };

    return null;
};

var isNatural = function(number) {
    if (_.isNumber(number) && _.isFinite(number)) {
        return number > 0;
    } else {
        return false;
    }
};

//  Override Raphael

Raphael.el.is = function (type) {
    return this.type === type;
};

Raphael.el.x = function () {
    switch (this.type) {
    case 'ellipse':
    case 'circle':
        return this.attr('cx');
    default:
        return this.attr('x');
    }
};

Raphael.el.y = function () {
    switch (this.type) {
    case 'ellipse':
    case 'circle':
        return this.attr('cy');
    default:
        return this.attr('y');
    }
};

Raphael.el.rdxy = function(dx, dy, direction) {
    switch (this.type) {
    case 'ellipse':
        if (direction === 'ne' || direction === 'nw') {
            dy = -dy;
        }
        if (direction === 'nw' || direction === 'sw') {
            dx = -dx;
        }
        var sumx = this.orx + dx;
        var sumy = this.orx + dy;
        return {
            rx: isNatural(sumx) ? sumx : this.orx,
            ry: isNatural(sumy) ? sumy : this.ory
        };
    case 'circle':
        if (direction === 'ne' || direction === 'nw') {
            dy = -dy;
        }
        var sumr = this.or + (dy < 0 ? -1 : 1) * Math.sqrt(2*dy*dy);
        return {
            r: isNatural(sumr) ? sumr : this.or
        };
    case 'rect':
        var w = this.ow + dx;
        if (direction === 'nw' || direction === 'sw') {
            w = this.ow - dx;
        }
        var h = this.oh + dy;
        if (direction === 'ne' || direction === 'nw') {
            h = this.oh - dy;
        }
        var y = this.oy;
        var x = this.ox;
        if (direction === 'sw' || direction === 'nw') {
            x = this.ox + dx;
        }
        if (direction === 'ne' || direction === 'nw') {
            y = this.oy + dy;
        }
        return {
            width: isNatural(w) ? w : this.ow,
            height: isNatural(h) ? h : this.oh,
            y: y,
            x: x
        };
    default:
        return {};
    }
};

Raphael.el.o = function () {
    var attr = this.attr();
    this.ox = this.x();
    this.oy = this.y();
    this.ow = attr.width;
    this.oh = attr.height;
    this.or = attr.r;
    this.orx = attr.rx;
    this.ory = attr.ry;
    return this;
};

Raphael.el.getABox = function() {
    var b = this.getBBox();
    var o = {
        x: b.x,
        y: b.y,
        width: b.width,
        height: b.height,

        xLeft: b.x,
        xCenter: b.x + b.width / 2,
        xRight: b.x + b.width,

        yTop: b.y,
        yMiddle: b.y + b.height / 2,
        yBottom: b.y + b.height
    };

    // center
    o.center      = { x: o.xCenter,   y: o.yMiddle };

    // edges
    o.topLeft     = { x: o.xLeft,     y: o.yTop };
    o.topRight    = { x: o.xRight,    y: o.yTop };
    o.bottomLeft  = { x: o.xLeft,     y: o.yBottom };
    o.bottomRight = { x: o.xRight,    y: o.yBottom };

    // corners
    o.top     = { x: o.xCenter,   y: o.yTop };
    o.bottom      = { x: o.xCenter,   y: o.yBottom };
    o.left        = { x: o.xLeft,     y: o.yMiddle };
    o.right       = { x: o.xRight,    y: o.yMiddle };

    // shortcuts to get the offset of paper's canvas
    // o.offset      = $(this.paper.canvas).parent().offset();

    return o;
};

// Polyline support.
Raphael.fn.polyline = function (x,y) {
    var poly = ['M',x,y,'L'];
    for (var i=2;i<arguments.length;i++) {
        poly.push(arguments[i]);
    }
    return this.path(poly.join(' '));
};

// Events

// Regular expression used to split event strings
var eventSplitter = /\s+/;

// A module that can be mixed in to *any object* in order to provide it with
// custom events. You may bind with `on` or remove with `off` callback functions
// to an event; `trigger`-ing an event fires all callbacks in succession.
//
//     var object = {};
//     _.extend(object, Backbone.Events);
//     object.on('expand', function(){ alert('expanded'); });
//     object.trigger('expand');
//
var Events = Diagram.Events = {

    // Bind one or more space separated events, `events`, to a `callback`
    // function. Passing `"all"` will bind the callback to all events fired.
    on: function(events, callback, context) {
        var calls, event, list;
        if (!callback) return this;

        events = events.split(eventSplitter);
        calls = this._callbacks || (this._callbacks = {});

        while (event = events.shift()) {
            list = calls[event] || (calls[event] = []);
            list.push(callback, context);
        }

        return this;
    },

    // Remove one or many callbacks. If `context` is null, removes all callbacks
    // with that function. If `callback` is null, removes all callbacks for the
    // event. If `events` is null, removes all bound callbacks for all events.
    off: function(events, callback, context) {
      var event, calls, list, i;

      // No events, or removing *all* events.
      if (!(calls = this._callbacks)) return this;
      if (!(events || callback || context)) {
        delete this._callbacks;
        return this;
      }

      events = events ? events.split(eventSplitter) : _.keys(calls);

      // Loop through the callback list, splicing where appropriate.
      while (event = events.shift()) {
        if (!(list = calls[event]) || !(callback || context)) {
          delete calls[event];
          continue;
        }

        for (i = list.length - 2; i >= 0; i -= 2) {
          if (!(callback && list[i] !== callback || context && list[i + 1] !== context)) {
            list.splice(i, 2);
          }
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(events) {
      var event, calls, list, i, length, args, all, rest;
      if (!(calls = this._callbacks)) return this;

      rest = [];
      events = events.split(eventSplitter);

      // Fill up `rest` with the callback arguments.  Since we're only copying
      // the tail of `arguments`, a loop is much faster than Array#slice.
      for (i = 1, length = arguments.length; i < length; i++) {
        rest[i - 1] = arguments[i];
      }

      // For each event, walk through the list of callbacks twice, first to
      // trigger the event, then to trigger any `"all"` callbacks.
      while (event = events.shift()) {
        // Copy callback lists to prevent modification.
        if (all = calls.all) all = all.slice();
        if (list = calls[event]) list = list.slice();

        // Execute event callbacks.
        if (list) {
          for (i = 0, length = list.length; i < length; i += 2) {
            list[i].apply(list[i + 1] || this, rest);
          }
        }

        // Execute "all" callbacks.
        if (all) {
          args = [event].concat(rest);
          for (i = 0, length = all.length; i < length; i += 2) {
            all[i].apply(all[i + 1] || this, args);
          }
        }
      }

        return this;
    }

};

var Backbone = this.Backbone;

if (Backbone) {
    Events = Backbone.Events;
}

Diagram.arrows = {

    none: function( size ) {
        if (!size) {
            size = 2;
        }
        return {
            path: 'M'+size+',0L'+(-size)+',0',
            dx: size,
            dy: size,
            attr: {
                opacity: 0
            }
        }
    },

    basic: function( p, size ) {
        if (!size) {
            size = 4;
        }
        return {
            path: [
                'M',size.toString(),'0',
                'L',(-size).toString(),(-size).toString(),
                'L',(-size).toString(),size.toString(),'z'
            ],
            dx: size,
            dy: size,
            attr: {
                stroke: 'black',
                fill: 'black'
            }
        }
    }
};

// Element
//

/**
 * Element
 *
 * @class Element
 * @constructor
 *
**/

var Element = Diagram.Element = function ( properties ) {
    this.initialize.apply(this, arguments);
};

// extend
var extend = function(protoProps, classProps) {
    return inherits(this, protoProps, classProps);
};

var ctor = function() {};
var inherits = function(parent, protoProps, staticProps) {
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
        child = protoProps.constructor;
    } else {
        child = function(){ parent.apply(this, arguments); };
    }

    // Inherit class (static) properties from parent.
    _.extend(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) {
        _.extend(child.prototype, protoProps);
    }

    // Add static properties to the constructor function, if supplied.
    if (staticProps) {
        _.extend(child, staticProps);
    }

    // Correctly set child's `prototype.constructor`.
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed later.
    child.__super__ = parent.prototype;

    return child;
};

/**
 * To be extended by subclasses.
 *
 * @method initialize
 *
**/

Element.prototype.initialize = function( properties ) {};

/**
 * Determine if the Element has the given property.
 *
 * @method has
 * @return {Boolean}
 * @api public
**/

Element.prototype.has = function( attr ) {
    return this.attributes[attr] != null;
};

/**
 * Getter method for Element attributes.
 *
 * @method get
 * @param {String} attr - attribute name
 * @return {Object}
 * @api public
**/

Element.prototype.get = function( attr ) {
    return this.attributes[attr];
};

/**
 * Setter method for Element attributes.
 *
 * @method set
 * @param {String} attr - attribute name
 * @param {String} val - attribute value
 * @api public
**/

Element.prototype.set = function( attr, val ) {
    this.attributes[attr] = val;
};

/**
 * Return JSON representation of the Element.
 *
 * @method toJSON
 * @return {Object}
 * @api public
**/

Element.prototype.toJSON = function() {
    var attributes = this.attributes;
    var clone = _.clone(attributes);

    return this._deepClone(clone);
};

/**
 * Clone internal representation of the Element.
 *
 * @method _deepClone
 * @private
 * @param {Object} clone
 * @api private
**/

Element.prototype._deepClone = function( clone ) {
    for (var key in clone) {
        var value = clone[key];

        if (_.isArray(value)) {
            var copy = [];
            for (var i = 0; i < value.length; i++) {
                var v = value[i];
                if (v.attributes) {
                    copy[i] = v.toJSON();
                }
            }
            clone[key] = copy;
        } else if (_.isObject(value)) {
            if (value.attributes) {
                clone[key] = value.toJSON();
            }
        }

    }

    return clone;
};

Element.extend = extend;

// SVGElement
//
/**
 * SVGElement
 *
 * @class SVGElement
 * @constructor
 *
**/

Diagram.SVGElement = function() {};

_.extend(
    Diagram.SVGElement.prototype,
    Diagram.Element.prototype, {

    /**
     * Return the current Raphael Paper.
     *
     * @method paper
     * @return {Object}
     * @api public
    **/

    paper: function() {
        if (!this.diagram) {
            throw new Error('SVGElement must be associated to a diagram');
        }
        return this.diagram.paper();
    },

    /**
     * Return the current X coordinate.
     *
     * @method getX
     * @return {Number}
     * @api public
    **/

    getX: function() {
        if (this.wrapper) {
            return this.wrapper.attr('x');
        } else {
           return this.get('attr').x;
        }
    },

    /**
     * Return the current Y coordinate.
     *
     * @method getY
     * @return {Number}
     * @api public
    **/

    getY: function() {
        if (this.wrapper) {
            return this.wrapper.attr('y');
        } else {
           return this.get('attr').y;
        }
    },

    /**
     * Remove the SVGElement from Raphael Paper..
     *
     * @method remove
     * @return {Object}
     * @api public
    **/

    remove: function() {
        if (this.wrapper) {
            this.wrapper.remove();
        }
        return this;
    },

    /**
     * Shows the SVGElement if previously hidden.
     *
     * @method show
     * @return {Object}
     * @api public
    **/

    show: function() {
        return this.wrapper.show();
    },

    /**
     * Hides the SVGElement.
     *
     * @method hide
     * @return {Object}
     * @api public
    **/

    hide: function() {
        return this.wrapper.hide();
    },

    /**
     * Moves the SVGElement to front.
     *
     * @method toFront
     * @return {Object}
     * @api public
    **/

    toFront: function() {
        return this.wrapper.toFront();
    },

    /**
     * Wrapper for Raphael attr method.
     *
     * @method attr
     * @return {Object}
     * @api public
    **/

    attr: function() {
        return Raphael.el.attr.apply(this.wrapper, arguments);
    },

    /**
     * @method
     * @private
    **/

    _get: function ( key ) {
        var value;
        if (this.attributes.attr) {
            value = this.attributes.attr[key] ? this.attributes.attr[key] : this.figure[key];
        } else {
            value = this.figure[key];
        }

        return isNaN(value) ? 0 : value;
    },

    /**
     * @method
     * @private
    **/

    _attr: function( attributes ) {
        var attrs = Raphael._availableAttrs;
        var attr = attributes.attr || {};

        for (var k in attributes) {
            if (_.has(attrs, k))  {
                attr[k] = attributes[k];
            }
        }
        return attr;
    },

    /**
     * @method
     * @private
    **/

    _rect: function() {
        var x = this._get('x'),
            y = this._get('y'),
            width = this._get('width'),
            height = this._get('height'),
            r = this._get('r'),
            attr = this.get('attr');

        return this.paper().rect(x, y, width, height, r).attr(attr);
    },

    /**
     * @method
     * @private
    **/

    _circle: function() {
        var x = this._get('x'),
            y = this._get('y'),
            r = this._get('r'),
            attr = this.get('attr');

        if (x === 0) {
            x = this._get('cx');
        }

        if (y === 0) {
            y = this._get('cy');
        }

        // delete x, y to use cx, cy instead.
        delete attr.x;
        delete attr.y;

        return this.paper().circle(x, y, r).attr(attr);
    },

    /**
     * @method
     * @private
    **/

    _ellipse: function() {
        var x = this._get('x'),
            y = this._get('y'),
            rx = this._get('rx'),
            ry = this._get('ry'),
            attr = this.get('attr');

        return this.paper().ellipse(x, y, rx, ry).attr(attr);
    },

    /**
     * @method
     * @private
    **/

    _path: function() {
        var path = this._get('path'),
            attr = this.get('attr');

        return this.paper().path(path).attr(attr);
    },

    /**
     * @method _createFigure
     * @private
    **/

    _createFigure: function() {
        var wrapper = null;

        // Creates the Raphael Element according to the type of figure.
        // The Element is attach to the FigureShape via the property wrapper.
        switch (this.get('attr').type) {
            case 'rect':
                wrapper = this._rect();
                break;
            case 'circle':
                wrapper = this._circle();
                break;
            case 'ellipse':
                wrapper = this._ellipse();
                break;
            case 'path':
                wrapper = this._path();
                break;
            default:
                wrapper = null;
        }

        if (!wrapper) {
            throw new Error('Cannot create figure');
        }

        return wrapper;
    }

});

/**
 * Diagram
 *
 * @namespace Diagram
 * @constructor
 *
**/
Diagram.Diagram = function( el, width, height, attributes ) {
    attributes || (attributes = {});

    this._el = el;
    this.width = width || document.getElementById(el).style.width;
    this.height = height || document.getElementById(el).style.height;

    this.attributes = {
        name: '',
        type: '',
        children: [],
        edges: []
    }

    if (_.isObject(attributes)) {
        _.each(_.keys(attributes), function(key) {
            this.attributes[key] = attributes[key];
        }, this);
    }

    if (this.type) {
        this.set('type', type);
    }

    if (attributes.id) {
        this.set('id', attributes.id);
    } else {
        this.set('id', _.uniqueId());
    }

    this.currentSource = null;
    this.currentEdge = null;

    return this;
};

Diagram.Diagram.extend = extend;

// Diagram extends the following prototypes:
//  - Diagram.Element
//  - Diagram.Events
//
_.extend(
    Diagram.Diagram.prototype,
    Diagram.Element.prototype,
    Events
);

/**
 * Returns the Raphael instance associated to this diagram.
 *
 * If parameter is a Raphael instance, sets it as current paper
 * for this diagram.
 *
 * @param {Raphael}
 * @return {Raphael}
 * @api public
**/

Diagram.Diagram.prototype.paper = function( paper ) {
    if (paper) {
        this._paper = paper;
    }

    this._init();

    return this._paper;
};

Diagram.Diagram.prototype._init = function() {
    if (!this._paper) {
        this._paper = Raphael(this._el, this.width, this.height);
    }
    this.canvas().addEventListener('click', this);
};

/**
 * Renders the diagram.
 *
 * Initialize the Raphael object and calls renders on its child.
 *
 * @return {Diagram} this
 * @api public
**/

Diagram.Diagram.prototype.render = function() {
    this._init();

    _.each(this.get('children'), function(child) {
        child.render();
    });

    _.each(this.get('edges'), function(edge) {
        edge.render();
    });

    return this;
};

/**
 * Performs a zoom
 *
 * @param {Number}
 * @param {String}
 * @api public
**/

Diagram.Diagram.prototype.zoom = function( level, direction ) {
    // TODO
};

/**
 * Returns the html container element for this diagram.
 *
 * @return {HTMLElement}
 * @api public
**/

Diagram.Diagram.prototype.el = function() {
    return this._el ? document.getElementById(this._el) : null;
};

/**
 * Returns the SVG Element containing this diagram.
 *
 * This is a wrapper method for Raphael.canvas.
 *
 * @return {SVGElement}
 * @api public
**/

Diagram.Diagram.prototype.canvas = function() {
    return this._paper ? this._paper.canvas : null;
};

/**
 * Removes the diagram and it's content from the canvas.
 *
 * This is a wrapper method for Raphael.remove().
 *
 * @api public
**/

Diagram.Diagram.prototype.remove = function() {
    if (this._paper) {
        _.each(this.get('children'), function(child) {child.remove();});
        _.each(this.get('edges'), function(child) {child.remove();});
        this._paper.remove();
        this._paper = null;
    }
};

/**
 * Creates a shape from a given function of type Diagram.Shape.
 *
 * @param {Function} func - Shape constructor
 * @param {Object} attributes - Shape init attributes
 * @return {Shape} Returns the Shape object.
 * @api public
**/

Diagram.Diagram.prototype.createShape = function( func, attributes ) {
    var shape = null;

    if (!func) {
        throw new Error('Cannot create Shape if Shape constructor is missing');
    }

    attributes.diagram = this;
    shape = new func( attributes );

    shape.on('remove', this.removeShape, this);

    return shape;
};

/**
 * Removes a Shape.
 *
 * @param {Shape} shape - Shape to be removed
 * @api public
**/

Diagram.Diagram.prototype.removeShape = function( shape ) {
    if (shape) {
        shape.remove();

        var children = this.get('children');

        this.set('children', _.reject(children, function(child) {
            return child === shape;
        }));

        this.trigger('remove:children', shape);
    }
};

/**
 * Returns a Shape specified by it's id.
 *
 * @param {Integer} id - Shape id
 * @return {Shape} Returns the Shape or null.
 * @api public
**/

Diagram.Diagram.prototype.getShape = function(id) {
    var shape = _.find(this.get('children'), function(child) {
        var childID = child.get('id');
        if (childID) {
            return childID === id;
        }
    });

    return shape;
};

/**
 * Creates a Connection from a Diagram.Connection constructor.
 *
 * @param {Function} func - Connection constructor
 * @param {Object} attributes - Connection init attributes
 * @return {Connection} Returns the Connection object.
 * @api public
 *
**/

Diagram.Diagram.prototype.createConnection = function( func, attributes ) {
    var connection = null;

    if (typeof func === 'function') {
        connection = new func( { diagram: this } );

        if (attributes) {
            var source = attributes.source;
            var target = attributes.target;

            if (source && target) {
                connection.connect(source, target);
            }
        }

        connection.on('remove:source remove:target', function(connection) {
            this.removeConnection( connection );
        }, this);
    }

    return connection;
};

/**
 * Removes the Connection from the diagram. This method will call disconnect and
 * remove on the connection and triggers a remove:edges event.
 *
 * @param {Connection} connection - Connection to be removed
 * @api public
**/

Diagram.Diagram.prototype.removeConnection = function( connection ) {
    if (connection) {
        // removes connection from paper.
        connection.remove();

        var edges = this.get('edges');

        this.set('edges', _.reject(edges, function( edge ) {
            return edge === connection;
        }));

        this.trigger('remove:edges', connection);
    }
};

/**
 * Returns a Connection specified by it's id.
 *
 * @param {Integer} id - Connection id
 * @return {Connection} Returns the Connection or null.
 * @api public
**/

Diagram.Diagram.prototype.getConnection = function(id) {
    var connection = _.find(this.get('edges'), function(child) {
        var childID = child.get('id');
        if (childID) {
            return childID === id;
        }
    });

    return connection;
};

/**
 * Returns true if a connection can be made.
 * @private
 *
**/

// TODO: separate change of state in another method.
// Calling this method will change the state of this.currentSource.
Diagram.Diagram.prototype.canConnect = function( node ) {
    if (this.currentEdge) {
        if (this.currentSource) {
            return true;
        } else {
            this.currentSource = node;
            return false;
        }
    } else {
        return false;
    }
};

/**
 * Connects the node to the previously selected node.
 * @private
**/

Diagram.Diagram.prototype.connect = function( node ) {
    var connection = null;

    if (this.currentEdge) {
        if (this.currentSource) {
            connection = this.createConnection( this.currentEdge, {
                source: this.currentSource,
                target: node
            });
            this.currentEdge = null;
            this.currentSource = null;
        }
    }

    return connection;
};

/**
 * handleTextInput
 *
 * @private
 *
**/
// TODO: remove jQuery
// @private
Diagram.Diagram.prototype.handleTextInput = function() {
    var text = $(this.inputText).val();
    if (text) {
        this.modifiedLabel.setText(text);
        $(this.modifiedLabel.textForm).remove();
        this.modifiedLabel.textForm = null;
        this.modifiedLabel = null;
        this.inputText = null;
    }
    if (this.repeatInputClick) {
        if (this.modifiedLabel) {
            $(this.modifiedLabel.textForm).remove();
            this.modifiedLabel.textForm = null;
            this.modifiedLabel = null;
            this.inputText = null;
            this.repeatInputClick = false;
        }
    } else {
        this.repeatInputClick = true;
    }
};

/**
 * handleEvent
 *
 * @private
 *
**/

Diagram.Diagram.prototype.handleEvent = function( evt ) {
    var position = Point.getMousePosition( this._paper, evt );
    var el = this._paper.getElementsByPoint(position.x, position.y);

    if (el.length === 0 && this.selected) {
        this.selected.deselect();
    }

    if (this.inputText) {
        this.handleTextInput();
    }

    if (el.length === 0 && this.currentEdge) {
        this.currentEdge = null;
    }

    var tool = this.currentTool;
    if (tool) {
        if (this._canCreate(tool)) {
            var node = this.createShape(tool, position);
            node.render();
        }
        if (el.length === 0) {
            this.currentTool = null;
        }
    }
};

/**
 * Returns true if the constructor parameter corresponds to
 * a root Shape, i.e. a Shape that can be added directly to the
 * diagram, as opposed to a contained shape.
 *
 * @private
**/

Diagram.Diagram.prototype._canCreate = function( func ) {
    var child = _.find(this.child, function(c) {
        return c === func;
    });
    return child !== undefined;
};

/**
 * Load and initialize the diagram from a JSON object.
 *
 * @param {Object} data - JSON object
 * @api public
 *
**/

Diagram.Diagram.prototype.load = function( data ) {
    if (data.name) {
        this.set('name', data.name);
    }

    if (data.type) {
        this.set('type', data.type);
    }

    var children = this.get('children');
    _.each(data.children, function(child) {
        var loaded = this.loadShape( child );
        if (loaded) {
            children.push( loaded );
        }
    }, this);

    var edges = this.get('edges');
    _.each(data.edges, function( edge ) {
        var loaded = this.loadEdge( edge );
        if (loaded) {
            edges.push( loaded );
        }
    }, this);
};

/**
 * Returns the constructor for a JSON object.
 *
 * @param {String} type - element type
 * @private
 *
**/

Diagram.Diagram.prototype._getConstructor = function( type ) {
    var names = type.split('.');
    var _object = window;
    for (var i = 0; i < names.length; i++) {
        _object = _object[names[i]];
    }
    return _object;
};

/**
 * Load a Shape from its JSON description.
 *
 * @param {Object} data - JSON object
 * @api private
 *
**/

Diagram.Diagram.prototype.loadShape = function( data ) {
    if (!data.type) {
        throw new Error('Cannot create Shape, type is undefined');
    }

    var _object = this._getConstructor( data.type );

    if (typeof _object === 'function') {
        return this.createShape(_object, data);
    } else {
        return null;
    }
};

/**
 * Load a Connection from its JSON description.
 *
 * @param {Object} data - JSON object
 * @param {Array} nodes - Shapes already loaded
 * @api private
 *
**/

Diagram.Diagram.prototype.loadEdge = function( data, nodes ) {
    if (!data.type) {
        throw new Error('Cannot create Edge, type is undefined');
    }

    var _object = this._getConstructor( data.type );
    if (typeof _object === 'function') {
        var children = nodes ? nodes : this.get('children');
        // TODO could be done in one pass.
        var source = _.find(nodes, function(s) { return s.get('id') == data.source; });
        var target = _.find(nodes, function(s) { return s.get('id') == data.target; });

        if (source && target) {
            var edge = new _object({ diagram: this });
            if (edge) {
                edge.connect(source, target);
                return edge;
            }
        }
    }
    return null;
};

var ToolBox = Diagram.ToolBox = function( attributes ) {
     this.element = attributes.element;
     this.diagram = this.element.diagram;
     this.width = 40;
     this.height = 20;
     this.children = [];
     return this;
};

_.extend(ToolBox.prototype, Diagram.SVGElement.prototype);

ToolBox.prototype.render = function() {
    if (!this.element && !this.element.wrapper) {
        return;
    }

    if (this.wrapper) {
        this.wrapper.remove();
    }

    var paper = this.paper(),
        box = this.element.wrapper.getABox(),
        x = box.xRight - this.width + 8,
        y = box.y - this.height - 8;

    this.wrapper = paper.rect(x, y, this.width, this.height, 4).attr({
        fill: 'whitesmoke',
        stroke: 'whitesmoke',
        'stroke-width': 1
    });

    this.wrapper.controller = this;

    this.wrapper.mouseover(this.handleMouseOver);
    this.wrapper.mouseout(this.handleMouseOut);

    box = this.wrapper.getABox();

    var control = this;
    this.addItem(box.x + 12, box.yMiddle, 'X', function(evt) {
        control.element.remove();
    });

    var propertyBox = this.propertyBox = new ToolBox.propertyBox({ diagram: control.diagram });
    if (ToolBox.propertyBox) {
        this.addItem(box.xRight - 12, box.yMiddle, 'P', function(evt) {
            var elBox = control.element.wrapper.getABox();
            propertyBox.x = elBox.xRight + 20;
            propertyBox.y = elBox.y;
            propertyBox.render();
        });
    }

    return this;
};

ToolBox.prototype.addItem = function(x, y, text, action) {
    var control = this;
    var paper = this.paper();

    var wrapper = paper.text(x, y, text);
    this.children.push(wrapper);

    wrapper.mouseover(function(evt) {
        control.isOverChild = true;
    });

    wrapper.mouseout(function(evt) {
        control.isOverChild = false;
    });

    wrapper.click(action);

    return this;
};

ToolBox.prototype.remove = function() {
    if (this.wrapper) {
        this.wrapper.remove();
        _.each(this.children, function(child) { child.remove() });
        this.children.length = 0;
    };
};

ToolBox.prototype.handleMouseOver = function() {
    this.controller.isOver = true;
    this.controller.isOverChild = false;
};

ToolBox.prototype.handleMouseOut = function() {
    var control = this.controller;
    window.setTimeout(function() {
        if (control && !control.isOverChild) {
            control.isOver = false;
            control.remove();
        }
    }, 200);
};
/**
 * Draggable
 *
 * Makes a Shape draggable.
 *
**/

Diagram.Draggable = function () {
};

/**
 * Adds necessary methods to make non draggable shape into
 * a draggable one.
 *
**/

Diagram.Draggable.prototype.asDraggable = function( options ) {
    if (this.wrapper) {
        this.wrapper.attr( {cursor: 'move'} );
    }

    var start = function() {
        this.o();
        if (this.controller) {
            var control = this.controller;
            if (typeof control.deselect === 'function') {
                control.deselect();
            }
            if (control.shadow) {
                control.shadowWrapper.remove();
            }
            if (control._tool) {
                control._tool.remove();
            }

            this.unmouseover(control.handleMouseOver);
            this.unmouseout(control.handleMouseOut);

            var children = control.get('children');
            if (children && children.length) {
                for (var i = 0; i < children.length; i++) {
                    start.apply( children[i].wrapper );
                }
            }
        }
    };

    var move = function( dx, dy, mx, my, ev ) {
        var b = this.getBBox();
        var x = this.ox + dx;
        var y = this.oy + dy;
        var r = this.is('circle') || this.is('ellipse') ? b.width / 2 : 0;
        var paper = this.paper;

        x = Math.min(
            Math.max(r, x),
            paper.width - (this.is('circle') || this.is('ellipse') ? r : b.width));
          y = Math.min(
              Math.max(r, y),
              paper.height - (this.is('circle') || this.is('ellipse') ? r : b.height));

        var position = { x: x, y: y, cx: x, cy: y };
        this.attr(position);

        if (this.controller) {
            var control = this.controller;

            if (control.isConnectable) {
                var inEdges = control.inEdges;
                var outEdges = control.outEdges;

                if (inEdges && inEdges.length) {
                    for (var i = 0; i < inEdges.length; i++) {
                        inEdges[i].render();
                    }
                }
                if (outEdges && outEdges.length) {
                    for (var i = 0; i < outEdges.length; i++) {
                        outEdges[i].render();
                    }
                }
            }
            var children = control.get('children');
            if (children && children.length) {
                for (var i = 0; i < children.length; i++) {
                    move.apply(children[i].wrapper, [dx, dy, mx, my, ev]);
                }
            }
        }
    };

    var end = function() {
        var control = this.controller;
        this.mouseover(control.handleMouseOver);
        this.mouseout(control.handleMouseOut);
        if (control && control.shadow) {
            control.createShadow();
        }
    };

    this.wrapper.drag(move, start, end);

    return this;
};
Diagram.Selectable = {

    /**
     * select
     */
     select: function() {
        if (this.diagram.selected) {
            this.diagram.selected.deselect();
        }

        this.diagram.selected = this;

        if (this.wrapper) {
            bbox = this.wrapper.getABox();
            this.selectionAnchors = [];

            var anchorRT = new NorthEastAnchor({ box: this }).render();
            var anchorLT = new NorthWestAnchor({ box: this }).render();
            var anchorLB = new SouthWestAnchor({ box: this }).render();
            var anchorRB = new SouthEastAnchor({ box: this }).render();

            if (this.resizable) {
                anchorRT.resizable();
                anchorLT.resizable();
                anchorRB.resizable();
                anchorLB.resizable();
            }

            this.selectionAnchors.push(anchorLT);
            this.selectionAnchors.push(anchorRT);
            this.selectionAnchors.push(anchorLB);
            this.selectionAnchors.push(anchorRB);
        }
     },

     /**
      * deselect
      */
      deselect: function() {
        if (this.selectionAnchors) {
            _.each(this.selectionAnchors, function( anchor ) { anchor.remove(); });
        }
      }
};
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

// LabelImage
//
//
var LabelImage = Diagram.Image = function( attributes ) {
    this.parent = attributes.parent;
    this.diagram = this.parent.diagram;

    this.attributes = {};
    this.set('type', 'Diagram.Image');
    this.set('width', attributes.width);
    this.set('height', attributes.height);
    this.set('src', attributes.src);
    return this;
};

_.extend(LabelImage.prototype, Diagram.SVGElement.prototype);

LabelImage.prototype.render = function() {
    var paper = this.paper();

    var bBox = this.parent.wrapper.getBBox(),
        src = this.get('src'),
        width = this.get('width'),
        height = this.get('height');

    this.wrapper = paper.image(src, bBox.x, bBox.y, width, height);
    this.wrapper.toFront();
    this.wrapper.controller = this;

    return this;
};

LabelImage.prototype.center = function() {
    var ntbb = this.parent.wrapper.getABox();
    this.wrapper.attr({ x: ntbb.x - this.get('width') });
    this.wrapper.attr({ y: ntbb.yMiddle - (this.get('height') / 2) });
};
// Label
//
//
var Label = Diagram.Label = function( attributes ) {
    attributes || (attributes = {});

    this.attributes = {};
    this.attributes.children = [];
    this.attributes.type = 'Diagram.Label';

    this._positions = [
        'top-left', 'top-right', 'top-center',
        'bottom-left', 'bottom-right', 'bottom-center',
        'center-left', 'center-right', 'center'
    ];

    this.parent = attributes.parent || undefined;
    this.diagram = this.parent ? this.parent.diagram : attributes.diagram;

    this.position = this._getPosition( attributes );
    this.resizable = attributes.resizable || false;
    this.draggable = attributes.draggable || false;
    this.editable = attributes.editable || true;

    if (attributes.id != null) {
        this.set('id', attributes.id);
    } else {
        this.set('id', _.uniqueId());
    }

    this.xOffset = 5;
    this.yOffset = 5;

    this.set('attr', this._attr(attributes));
    this.set('position', this.position);

    this.initChildren( attributes );

    if (attributes.width) {
        this.width = attributes.width;
    }

    if (attributes.height) {
        this.height = attributes.height;
    }

    if (attributes.text) {
        this.set('text', attributes.text);
    } else {
        this.set('text', 'Label');
    }
};

_.extend(Label.prototype, Diagram.SVGElement.prototype, Diagram.Draggable, Events);

Label.prototype._getPosition = function( properties ) {
    if (properties.position) {
        var position = properties.position;
        if (position.x && position.y) {
            return position;
        } else if (_.include(this._positions, position)) {
            return position;
        }
    }
    return 'center'; // default
};

Label.prototype.initChildren = function( attributes ) {
    var children = attributes.children;

    if (children && children.length > 0) {
        _.each(children, function( child ) {
            if (child.type === 'Diagram.Image') {
                var image = this.createImage( child );
                this.get('children').push( image );
            }
        }, this);
    } else {
        if (attributes.image) {
            var image = this.createImage( attributes.image );
            this.get('children').push( image );
        }
    }
};

// Should be only one image.
Label.prototype.createImage = function( attributes ) {
    attributes.parent = this;
    var image = new Diagram.Image( attributes );
    this.image = image;
    return image;
};

Label.prototype.render = function() {
    var paper = this.paper();

    var x, y, bBox = this.parent.wrapper.getABox();

    if (this.position.x && this.position.y) {
        x = bBox.x + this.position.x;
        y = bBox.y + this.position.y;
    } else {
        x = bBox.xCenter;
        y = bBox.yMiddle;
    }

    this.wrapper = paper.text(x, y, this.get('text')).attr({
        fill: 'black',
        'font-size': 12
    }).attr(this.get('attr'));

    this.wrapper.toFront();
    this.wrapper.controller = this;

    _.each(this.get('children'), function(c) { c.render(); });

    this.center();

    if (this.editable) {
        this.asEditable();
    }

    return this;
};

Label.prototype.resize = function( dx, dy, direction ) {
    var bBox = this.parent.wrapper.getABox();
    var tbb = this.wrapper.getABox();
    this.center();

    if (direction === 'nw' || direction === 'ne') {
        this.attr('y', this.wrapper.oy + dy);
    }
};

Label.prototype.center = function() {
    var box = this.parent.wrapper.getABox();
    var tbb = this.wrapper.getABox();

    switch (this.position) {
        case 'center':
            this.attr('x', box.xCenter);
            this.attr('y', box.yMiddle);
            break;
        case 'center-left':
            this.attr('x', box.x + this.xOffset + (tbb.width / 2))
            this.attr('y', box.yMiddle)
            if (this.image) {
                var x = this.attr('x');
                this.attr({x: x + this.image.attr('width')});
            }
            break;
        case 'center-right':
            this.attr('x', box.xRight - this.xOffset - (tbb.width / 2))
            this.attr('y', box.yMiddle)
            break;
        case 'top-center':
            this.attr('x', box.xCenter);
            this.attr('y', box.y + (tbb.height / 2) + this.yOffset);
            break;
        case 'top-left':
            this.attr('x', box.x + (tbb.width / 2) + this.xOffset);
            this.attr('y', box.y + (tbb.height / 2) + this.yOffset);
            break;
        case 'top-right':
            this.attr('x', box.xRight - this.xOffset - (tbb.width / 2));
            this.attr('y', box.y + (tbb.height / 2) + this.yOffset)
            break;
        case 'bottom-center':
            this.attr('x', box.xCenter);
            this.attr('y', box.yBottom - (tbb.height / 2) - this.yOffset);
            break;
        case 'bottom-left':
            this.attr('x', box.x + this.xOffset + (tbb.width / 2));
            this.attr('y', box.yBottom - (tbb.height / 2) - this.yOffset);
            break;
        case 'bottom-right':
            this.attr('x', box.x - this.xOffset - (tbb.width / 2));
            this.attr('y', box.yBottom - (tbb.height / 2) - this.yOffset);
            break;
        default:
            break;
        }

        if (this.image) {
            tbb = this.wrapper.getABox();
            this.image.attr({ x: tbb.x - this.image.attr('width')});
            this.image.attr({ y: tbb.y });
        }
};

Label.prototype.setText = function( text ) {
    this.set('text', text);

    if (this.wrapper) {
        this.wrapper.attr('text', text);
        this.center();
    }

    this.trigger('change:text', this);
};

Label.prototype.getText = function() {
    return this.get('text');
};

Label.prototype.remove = function() {
    if (this.image) {
        this.image.remove();
    }
    if (this.wrapper) {
        this.wrapper.remove();
    }
};

Label.prototype.asEditable = function() {
    var node = this;

    if (!node.wrapper) {
        return;
    }

    var createInputTextForm = function( node ) {
        var aBox = node.wrapper.getABox();
        var pBox = node.parent.wrapper.getABox();

        var px = node.diagram.el().offsetLeft;
        var py = node.diagram.el().offsetTop;

        var x = pBox.x + (isNaN(px) ? 0 : px);
        var y = pBox.y + (isNaN(py) ? 0 : py);

        var w = node.parent.attr('width');
        var h = 20;

        var txt = this.textForm = document.createElement('form');
        txt.setAttribute('style', 'position: absolute; left: ' + x + 'px; top: ' + y + 'px;');

        var inputForm = document.createElement('input');
        inputForm.setAttribute('type', 'text');
        inputForm.setAttribute('placeholder', node.get('text'));
        inputForm.setAttribute('style', 'padding: 0; width:' + w + 'px; height: ' + h + 'px; z-index: 1;');
        txt.appendChild(inputForm);

        return {
            form: txt,
            input: inputForm
        }
    };

    var remove = function( node ) {
        if (node && node.parentNode) {
            node.parentNode.removeChild( node );
        }
    };

    node.wrapper.dblclick(function(event) {
        var ml = node.diagram.modifiedLabel;
        if (ml && ml !== node) {
            remove(node.diagram.inputText);
            remove(node.diagram.modifiedLabel.textForm);
        }

        if (node.textForm) {
            remove(node.textForm);
        }

        var el = createInputTextForm( node );

        node.textForm = el.form;
        node.diagram.inputText = el.input;
        node.diagram.modifiedLabel = node;

        node.diagram.el().parentNode.appendChild(el.form);
    });
};
/**
 * Shape
 *
 * example:
 *
 *      var Circle = Diagram.Shape.extend({
 *          type: 'showcase.Circle',
 *          figure: {
 *              type: 'circle',
 *              r: 30,
 *              fill: 'red',
 *              stroke: 'rgb(120, 120, 200)',
 *              'stroke-width': 2
 *          }
 *      });
 *
 *      var c = new Circle( { diagram: diagram, id: 0, x: 10, y: 10, fill: 'red' } );
 *      or
 *      var c = diagram.createShape(Circle, { id: 0, x: 10, y: 10, fill: 'red' });
 *
 *
 * @constructor
 *
**/

var Shape = Diagram.Shape = function( attributes ) {
    if (!this.figure) {
        throw new Error('Figure is not specified.');
    }

    attributes || (attributes = {});

    // Initialize attributes object that stores object values
    this.attributes = {};
    this.attributes.children = [];

    this.parent = attributes.parent || undefined;
    this.diagram = this.parent ? this.parent.diagram : attributes.diagram;

    this.isConnectable = true;

    this.shadow = this.shadow || false;

    this.resizable != null || (this.resizable = true);
    this.draggable != null || (this.draggable = true);
    this.toolbox != null || (this.toolbox = true);

    this.inEdges = [];
    this.outEdges = [];

    this.set('type', this.type);

    if (attributes.id) {
        this.set('id', attributes.id);
    } else {
        this.set('id', _.uniqueId());
    }

    // Must be clone
    this.set('attr', _.clone(this.figure));

    _.extend(this.get('attr'), this._attr(attributes));

    this.initChildren( attributes.children );

    if (this.diagram) {
        // diagram can be null for dummy shape, see Compartment._canCreate.
        this.diagram.get('children').push(this);
        this.diagram.trigger('add:children', this);
    }

    this.initialize.apply(this, arguments);
};

Shape.extend = extend;

_.extend(
    Shape.prototype,
    Diagram.SVGElement.prototype,
    Diagram.Draggable.prototype,
    Diagram.Selectable,
    Events, {

    /**
     * Initialize method. To be extended by subclasses.
     *
     * @api public
    **/

    initialize: function( properties ) {

    },

    /**
     * Returns JSON representation of the shape.
     *
     * @api public
    **/

    toJSON: function() {
        var clone = _.clone(this.attributes);
        if (this.wrapper) {
            clone.attr = this.wrapper.attr();
        }

        return clone;
    },

    /**
     * Disconnect the Shape from the Connection.
     *
     * @param {Connection} connection
     *
    **/

    disconnect: function( connection ) {
        this.inEdges = _.without(this.inEdges, connection);
        this.outEdges = _.without(this.outEdges, connection);
    },

    /**
     * Initialize internal shapes.
     *
     * @private
    **/

    initChildren: function( children ) {
        if (children && children.length > 0) {
            // This is a load situation
            _.each(children, function( child ) {
                var shape = null;
                // if child already initialized, recreate it from its attributes.
                var data = child.attributes ? child.toJSON() : child;
                if (data.type === 'Diagram.Label') {
                    shape = this.createLabel( data );
                } else if (data.type === 'Diagram.Compartment') {
                    shape = this.createCompartment( data );
                }
                if (shape) {
                    this.get('children').push( shape );
                }
            }, this);
        } else {
            // This is a new shape situation.
            // Creates Label if text element is present.
            if (this.label) {
                var shape = this.createLabel( this.label );
                this.get('children').push( shape );
            }
            // Initializes compartments.
            if (this.compartments) {
                _.each(this.compartments, function( cpt ) {
                    var shape = this.createCompartment( cpt );
                    this.get('children').push( shape );
                }, this);
            }
        }
    },

    /**
     * Creates a Label.
     *
     * @param {Object} label - Label attributes
     * @return {Label} - Returns the Label object.
     * @api public
    **/

    createLabel: function( label ) {
        label.parent = this;
        return new Label( label );
    },

    /**
     * Creates a Compartment.
     *
     * @param {Object} compartment - Compartment attributes
     * @return {Compartment} - Returns the Compartment object.
     * @api public
    **/

    createCompartment: function( compartment ) {
        compartment.parent = this;
        return new Compartment( compartment );
    },

    /**
     * Renders the Shape on the canvas.
     *
     * @public
     * @returns {Shape}
    **/

    // The render() function will create the Raphael element, initialize the inner
    // elements and call their render() method. This function also make the Raphael element
    // draggable if option set to true and handle click event on the element.
    render: function() {
        if (this.wrapper) return;
        if (!this.diagram) throw new Error('Shape does not belong to a diagram');

        var paper = this.paper();

        this.wrapper = this._createFigure();

        // FigureShape is accessible from the wrapper via the property controller.
        this.wrapper.controller = this;

        // Creates shadow if shadow element is set to true.
        if (this.shadow) this.createShadow();

        // Make the element draggable if draggable is set to true.
        // Figure is draggable by default.
        if (this.draggable) this.asDraggable();

        if (this.toolbox) {
            this._tool = new Diagram.ToolBox({element: this});
        }

        _.each(this.get('children'), function(child) { child.render(); });

        // Handle click event.
        this.wrapper.click(this.handleClickEvent);
        this.wrapper.mouseover(this.handleMouseOver);
        this.wrapper.mouseout(this.handleMouseOut);

        return this;
    },

    /**
     * Creates a shadow under the shape.
     *
     * @api public
    **/

    createShadow: function() {
        var box = this.wrapper.getABox();
        var paper = this.paper();
        this.shadowWrapper = paper.rect(box.x, box.y, box.width, box.height, 0).attr({
            fill: 'grey', opacity: 0.2
        }).translate(4, 4);
        this.shadowWrapper.toBack();

        return this;
    },

    /**
     * handleClickEvent
     *
     * @private
    **/

    handleClickEvent: function( evt ) {
        var diagram = this.controller.diagram;
        var controller = this.controller;
        // Display selection box and resize anchors.
        controller.select();
        // Handle the connection to other nodes.
        if (diagram.canConnect(controller)) {
            var connection = diagram.connect(controller);
            console.log(connection);
            if (connection) {
                connection.render();
            }
        }
    },

    /**
     * handleMouseOver
     *
     * @private
    **/

    handleMouseOver: function(evt) {
        if (this.controller._tool) {
            this.controller._tool.render();
        }
    },

    /**
     * handleMouseOut
     *
     * @private
    **/

    handleMouseOut: function(evt) {
        var control = this.controller;
        window.setTimeout(function(){
            if (control._tool) {
                if (!control._tool.isOver) {
                    control._tool.remove();
                }
            }
        }, 500);
    },

    /**
     * Resize the Shape.
     *
     * @param {Number} dx
     * @param {Number} dy
     * @param {String} direction
     * @api public
    **/

    resize: function( dx, dy, direction ) {
        if (this.parent && this.parent instanceof Diagram.Compartment) {
            if (this.parent.layout === 'stack') {
                var height = this.attr('height');
                this.attr( this.wrapper.rdxy( dx, dy < 0 ? dy : dy, direction ) );
                this.attr({height: height});
            } else {
                // do nothing.
            }
        } else if (this.resizable) {
            this.attr( this.wrapper.rdxy( dx, dy, direction ) );
        }

        if (this.has('children')) {
            var children = this.get('children');
            if (children && children.length) {
                for (var i = 0; i < children.length; i++) {
                    var child = children[i];
                    if (typeof child.resize === 'function') {
                        child.resize(dx, dy, direction);
                    }
                }
            }
        }
    },

    /**
     * Returns the array of inner compartments.
     *
     * @return {Array} Returns array of compartments.
     * @api public
    **/

    getCompartments: function() {
        return _.filter(this.get('children'), function( child ) {
            return child instanceof Diagram.Compartment;
        });
    },

    /**
     * @private
    **/

    //
    // Resize child compartments. This function is called when a new
    // element is added to a compartment via the function addInner().
    //

    resizeCompartments: function() {
        var compartments = this.getCompartments();

        // Computes current height of compartments.
        var height = _.reduce(compartments, function( memo, cpt ) {
            return memo + cpt.attr('height');
        }, 0);

        // For each compartments, call resize(), and
        // computes the new y position of the next compartment.
        _.each(compartments, function( cpt ) {
            cpt._resize();
            var idx = _.indexOf(compartments, cpt);

            // Reposition next compartment
            if ((idx + 1) < compartments.length) {
                var next = compartments[idx + 1];
                var nextY = next.attr('y');
                var currentY = cpt.attr('y') + cpt.height(); //attr('height');
                var diff = currentY - nextY;
                if (diff > 0) {
                    next.move(0, currentY);
                }
            }
        });

        // Computes new height of compartments.
        var newHeight = _.reduce(compartments, function( memo, cpt ) {
            return memo + cpt.attr('height');
        }, 0);

        // If compartments height has increased, increase Shape height
        // accordingly.
        var diff = newHeight - height;
        if (diff > 0) {
            var previousHeight = this.attr('height');
            this.attr({ height: previousHeight + diff });
        }
    },

    /**
     * Scale Shape
    **/

    scale: function(x, y) {
        this.wrapper.scale(x, y);
    },

    /**
     * Show Shape if previously hidden.
    **/

    show: function() {
        if (this.wrapper) {
            this.wrapper.show();
        }
        if (this.hidder) {
            this.hidder.show();
        }
        if (this.resizer) {
            this.resizer.show();
        }
        _.each(this.get('children'), function( child ) {
            children.show();
        });
    },

    /**
     * Hide Shape if previously rendered.
    **/

    hide: function() {
        if (this.wrapper) {
            this.wrapper.hide();
        }

        if (this.hidder) {
            this.hidder.hide();
        }

        _.each(this.get('children'), function( child ) { child.hide(); });
    },

    /**
     * Moves the Shape to the given coordinates.
     *
     * @param {Number} x
     * @param {Number} x
     * @api public
    **/

    move: function( x, y ) {
        if (!this.wrapper) return;

        var previousX = this.attr('x');
        var previousY = this.attr('y');

        if (this.wrapper) {
            if (x > 0) {
                this.attr({x: x});
            }
            if (y > 0) {
                this.attr({y: y});
            }
        }

        _.each(this.get('children'), function( child ) {
            // computes the new child positions
            // according to previous parent positions.
            var ix = child.attr('x');
            var iy = child.attr('y');
            var dx = x > 0 ? ix - previousX : 0;
            var dy = y > 0 ? iy - previousY : 0;
            child.move( x + dx, y + dy);
        });

    },

    /**
     * Removes the Shape from the canvas.
     * Triggers a remove event.
     *
     * @api public
    **/

    remove: function() {

        if (!this.wrapper) return;

        // remove each child shape.
        _.each(this.get('children'), function( child ) {
            child.remove()
        });

        // remove selection anchors.
        _.each(this.selectionAnchors, function( anchor ) {
            anchor.remove()
        });

        // triggers remove:source for each inbound connections.
        _.each(this.inEdges, function( edge ) {
            edge.trigger('remove:source', edge);
        });

        // triggers remove:source for each outbound connections.
        _.each(this.outEdges, function( edge ) {
            edge.trigger('remove:target', edge);
        });

        // removes the wrapper, i.e. deletes Raphael Element
        // from paper.
        this.wrapper.remove();
        this.wrapper = null;

        // remove shadow if present.
        if (this.shadow) {
            this.shadowWrapper.remove();
        }

        // remove toolbox if present.
        if (this._tool) {
            this._tool.remove();
        }

        // trigger remove for listener to provide
        // adequate callback.
        // TODO
//        this.trigger('remove', this);
    }

});

/**
 * Compartment
 *
 * {
 *  layout: 'stack',
 *      figure: {
 *          top: 30,
 *          height: 20
 *      }
 * }
 *
 * @constructor
 *
**/

var Compartment = Diagram.Compartment = function( attributes ) {
    attributes || (attributes = {});

    this.attributes = {};
    this.attributes.type = 'Diagram.Compartment';
    this.attributes.children = [];

    this.parent = attributes.parent || undefined;
    this.diagram = this.parent ? this.parent.diagram : attributes.diagram;

    this.resizable = attributes.resizable || true;
    this.draggable = attributes.draggable || false;

    this.layout = attributes.layout || 'none';
    this.set('layout', this.layout);
    this.top = attributes.top || 0;
    this.set('top', this.top);

    if (attributes.accepts && _.isArray(attributes.accepts)) {
        this.accepts = attributes.accepts;
    }
    this.set('accepts', this.accepts);

    this.set('attr', {});
    this._cloneParentAttributes();

    _.extend(this.get('attr'), this._attr(attributes));

    this.initChildren( attributes.children );
    this.initialize.apply(this, arguments);
};

// Compartment extends the following prototypes:
//  - SVGElement
//  - Events
//
_.extend(
    Compartment.prototype,
    Diagram.SVGElement.prototype,
    Events
);

Compartment.extend = extend;

/**
 * Initialize method to be extended by subclasses.
 *
 * @api public
**/

Compartment.prototype.initialize = function() {};

/**
 * Initialize inner children.
 *
 * @private
**/

Compartment.prototype.initChildren = function( children ) {
    if (children && children.length > 0) {
        _.each(children, function( child ) {
            var shape = null;
            if (child.type) {
                var _object = this.diagram._getConstructor( child.type );
                if (typeof _object === 'function') {
                    child.parent = this;
                    shape = this.diagram.createShape(_object, child);
                    if (shape) {
                        this.addInner( shape );
                    }
                }
            }
        }, this);
    }
};

/**
 * Initialize attributes.
 *
 * @private
**/

Compartment.prototype._cloneParentAttributes = function() {
    if (this.parent) {
        var attr = this.parent.get('attr');
        for (var key in attr) {
            if (!_.isObject(attr[key]) || !_.isArray(attr[key])) {
                this.get('attr')[key] = attr[key];
            }
        }
    }
};

/**
 * Render the Compartment.
 *
 * @api public
**/

Compartment.prototype.render = function() {
    var paper = this.paper();

    this.get('attr').width = this.parent.wrapper.attr('width');
    this.get('attr').height || (this.get('attr').height = 10);

    var x = this.get('attr').x = this.parent.attr('x'),
        y = this.get('attr').y = this.parent.attr('y') + this.top,
        width = this.get('attr').width,
        height = this.get('attr').height;

    if (this.wrapper) {
        this.wrapper.remove();
    }

    if (this.parent.wrapper.type === "rect") {
        this.wrapper = paper.rect(x, y, width, height, 0).attr( this.get('attr') );
    }

    this.wrapper.controller = this;
    this.wrapper.toFront();

    _.each(this.get('children'), function(c) { c.render(); });
    this.wrapper.click(this.handleClickEvent);

    return this;
};

/**
 * handleClickEvent.
 *
 * @private
**/

Compartment.prototype.handleClickEvent = function( evt ) {
    var controller = this.controller;

    if (controller.parent) {
        controller.parent.select();
    }

    var tool = controller.diagram.currentTool;
    if (tool) {
        if (controller.canCreate( tool )) {
            // reset tool.
            controller.diagram.currentTool = null;
            var attributes = Point.getMousePosition( controller.paper(), evt );
            var shape = controller.createShape(tool, attributes);
            if (shape) {
                shape.render();
            }
        }
    }
};

Compartment.prototype.createShape = function(func, attributes) {
    var shape = null;
    if (typeof func === 'function') {
        attributes.parent = this;
        shape = new func( attributes );
        if (shape) {
            // position and add shape as child.
            this.addInner( shape );
        }
    }
    return shape;
};

/**
 * Adds inner shape.
 * called before render().
 *
 * @param node
 * @returns
**/

Compartment.prototype.addInner = function( shape ) {
    if (this.hidder) {
        this.hidder.toFront();
    }

    var attr = this.wrapper ? this.wrapper.attr() : this.get('attr');
    var children = this.get('children');

    if (this.wrapper && this.layout === 'stack') {
        shape.get('attr').width = attr.width;
        var last = _.last(children);

        if (last) {
            var last_attr = last.wrapper ? last.wrapper.attr() : last.get('attr');
            var y = last_attr.y;
            y = y + last_attr.height;
            shape.get('attr').x = attr.x;
            shape.get('attr').y = y;
        } else {
            shape.get('attr').x  = attr.x;
            shape.get('attr').y = attr.y;
        }

        children.push(shape);
        this.parent.resizeCompartments();
    } else {
        children.push(shape);
    }

    // trigger add:children event for listeners.
    this.trigger('add:children', shape);
};

/**
 * Resize the Compartment and its children.
 *
 * @param {Number} dx
 * @param {Number} dy
 * @param {Number} direction
 *
**/

Compartment.prototype.resize = function( dx, dy, direction ) {
    this.attr( this.wrapper.rdxy( dx, dy, direction ) );

    _.each(this.get('children'), function( child ) {
        child.resize(dx, dy, direction);
    });
};

/**
 * @private
**/

Compartment.prototype._resize = function() {
    var height = this.height();
    if (height > 0) {
        this.wrapper.attr({ height: height });
    }
};

/**
 * Computes the height of inner elements.
 *
**/

Compartment.prototype.height = function() {
    if (this.get('children').length > 0) {
        var computed = _.reduce(this.get('children'), function( memo, child ) {
            return memo + child.get('attr').height;
        }, 0);

        if (this.wrapper) {
            var height = this.attr('height');
            if (height >= computed) {
                return height;
            }
        }

        return computed;
    } else {
        return this.wrapper ? this.attr('height') : this.get('attr').height;
    }
};

/**
 * @private
 *
**/

Compartment.prototype._addHidder = function() {
    var startX, startY, paper;
    startX = this.position.x + 2;
    startY = this.position.y + 2;
    paper = this.paper();
    return paper.rect(startX, startY, 8, 8, 0).attr({ fill: 'whitesmoke', stroke: 'none' });
};

/**
 * @private
 *
**/

Compartment.prototype._hide = function() {
    currentY = this.wrapper.attr('y');
    currentHeight = this.wrapper.attr('height');

    // Reset the height to its original state.
    this.wrapper.attr({ height: this.get('attr').height });

    // Hides its content.
    _.each(this.get('children'), function( child ) { child.hide(); });

    this.positionNextCompartments();

    this.hidder.hidden = true;
};

/**
 * Show the compartment content when hidder is clicked.
 *
 * @api public
 *
**/

Compartment.prototype._show = function() {
    this.position = {
        x: this.parent.wrapper.attr('x'),
        y: this.parent.wrapper.attr('y') + this.top
    };

    // compartment height is determined by its content height.
    //this.figure.height = this.parent.wrapper.attr('height') - this.figure.top;
    //this.wrapper.attr({ y: this.position.y });
    //this.wrapper.attr({ height: this.figure.height });
    this.resize();
    // this.hidder.attr({ y: this.position.y + 2 });

    this.positionNextCompartments();

    // Shows its content.
    _.each(this.get('children'), function( child ) { child.show(); });

    this.hidder.hidden = false;
};

/**
 * @private
 *
**/

Compartment.prototype.positionNextCompartments = function() {
    // For each next compartments, reset their y position according
    // to the previous compartment y position and height.
    var compartments = this.parent.compartments();
    var idx = _.indexOf(compartments, this);
    for ( var i = idx + 1; i < compartments.length; i++) {
        var next = compartments[i];
        var previous = compartments[i - 1];
        var newY = previous.attr('y') + previous.attr('height');
        next.attr({y: newY});
    }
};

/**
 * Returns true if child shape can be created an added.
 *
 * @private
 *
**/

Compartment.prototype.canCreate = function( func ) {
    if (this.accepts && typeof func === 'function') {
        var fn = arguments[0];
        // create dummy instance
        try {
            var instance = new func();
        } catch(e) {
            // cannot create
            return false;
        }

        if (instance && instance.attributes) {
            var c = _.find(this.accepts, function( f ) {
                return f === instance.attributes.type;
            });
            return c !== undefined;
        }
    }
    return false;
};

/**
 * Removes the Compartment from the canvas.
 *
 * @api public
**/

Compartment.prototype.remove = function() {
    _.each(this.get('children'), function(child) { child.remove() } );

    if (this.wrapper) {
        this.wrapper.remove();
    }
};

/**
 * Returns JSON representation of the Compartment.
 *
 * @api public
**/

Compartment.prototype.toJSON = function() {
    var clone = _.clone(this.attributes);
    if (this.wrapper) {
        clone.attr = this.wrapper.attr();
    }

    return clone;
};

// Connection Anchor
//
//
var ConnectionAnchor = function( attributes ) {
    this.connection = attributes.connection;
    this.diagram = this.connection.diagram;
    this.attributes = {};
    return this;
};

_.extend(ConnectionAnchor.prototype, Diagram.SVGElement.prototype);

ConnectionAnchor.prototype.move = function( point ) {
    this.x = point.x;
    this.y = point.y;
    if (this.wrapper) {
        this.wrapper.attr({ x: this.x - 2, y: this.y - 2 });
    }
    return this;
};

ConnectionAnchor.prototype.render = function() {
    if (this.wrapper) {
        return this;
    }

    var paper = this.paper();
    this.wrapper = paper.rect( this.x - 3, this.y - 3, 6, 6 );
    this.wrapper.attr( { fill: 'blue', stroke: 'white' } );
    this.wrapper.anchor = this;
    this.asDraggable();

    return this;
};

ConnectionAnchor.prototype.remove = function() {
    if (this.wrapper) {
        this.wrapper.remove();
    }
};

ConnectionAnchor.prototype.asDraggable = function() {

    var move = function( dx, dy ) {
        this.attr( { x: this.ox + dx, y: this.oy + dy } );
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
        });

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
};

ConnectionAnchor.prototype.attach = function( shape ) {
    this.shape = shape;
    return this;
};

ConnectionAnchor.prototype.toJSON = function() {
    this.set('x', this.wrapper.x());
    this.set('y', this.wrapper.y());

    return this._deepClone(this.attributes);
}

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
// ConnectionLabel
//
//  label: {
//      text: '[]'
//  }
var ConnectionLabel = Diagram.ConnectionLabel = function( attributes ) {
    attributes || (attributes = {});

    if (!attributes.connection) {
        throw new Error('ConnectionLabel must have a parent Connection');
    }

    this.connection = attributes.connection;
    this.diagram = this.connection.diagram;
    this.position = attributes.position;

    this.attributes = {};
    this.attributes.text = attributes.text;
    this.attributes.attr = {};

    return this;
};

_.extend(ConnectionLabel.prototype, Diagram.SVGElement.prototype, Events);

ConnectionLabel.prototype.remove = function() {
    if (this.wrapper) {
        this.wrapper.remove();
    }
};

ConnectionLabel.prototype.render = function() {
    if (this.wrapper) {
        this.wrapper.remove();
    }

    var paper = this.paper(),
        connection = this.connection,
        wrapper = this.wrapper = paper.text(0, 0, this.get('text'));

    var positionRelativeToShape = function( wrapper, sbox, x, y ) {
        // Determine position of shape relative to the anchor.
        var isLeft = sbox.xCenter < x;
        var isTop = sbox.yMiddle > y;

        var box = wrapper.getBBox();
        var xOffset = isLeft ? (10 + (box.width / 2)) : (10 - box.width);
        var yOffset = isTop ? -10 : 10;

        return { x: x + xOffset, y: y + yOffset };
    };

    var placeLabelEnd = function() {
        var anchor = connection.get('targetAnchor'),
            sbox = anchor.shape.wrapper.getABox(),
            abox = anchor.wrapper.getABox(),
            x = abox.xCenter,
            y = abox.yMiddle;

        var r = Math.sqrt((x * x) + (y * y));
        var theta = Math.atan(y / x);

        return positionRelativeToShape( wrapper, sbox, x, y);
    };

    var placeLabelStart = function() {
        var anchor = connection.get('sourceAnchor'),
            sbox = anchor.shape.wrapper.getABox(),
            abox = anchor.wrapper.getABox(),
            x = abox.xCenter,
            y = abox.yMiddle;

        return positionRelativeToShape( wrapper, sbox, x, y);
    };

    var placeLabelMiddle = function() {
        var sa = connection.get('sourceAnchor'),
            ta = connection.get('targetAnchor'),
            sabox = sa.wrapper.getABox(),
            tabox = ta.wrapper.getABox(),
            x1 = sabox.xCenter,
            y1 = sabox.yMiddle,
            x2 = tabox.xCenter,
            y2 = tabox.yMiddle;

        var x = (x1 + x2) / 2;
        var y = (y1 + y2) / 2;

        y = y - 10;

        return { x: x, y: y };
    };

    var position;
    switch(this.position) {
        case 'start':
            position = placeLabelStart();
            break;
        case 'end':
            position = placeLabelEnd();
            break;
        default:
            position = placeLabelMiddle();
            break;
    };

    this.wrapper.transform(['t', position.x, ',', position.y].join('') );

    this.asEditable().asDraggable();

    return this;
};

ConnectionLabel.prototype.setText = function(text) {
    this.set('text', text);
    if (this.wrapper) {
        this.wrapper.attr('text', text);
    }
};

ConnectionLabel.prototype.asDraggable = function() {
    var start = function() {
         this.o();
    };
    var end = function() {

    };
    var move = function( dx, dy, mx, my, ev ) {
        var x = this.ox + dx;
        var y = this.oy + dy;

        this.attr({ x: x, y: y });
    };

    if (this.wrapper) {
        this.wrapper.attr( {cursor: 'move'} );
        this.wrapper.drag( move, start, end );
    }

    return this;
};

ConnectionLabel.prototype.asEditable = function() {
    var node = this;
    var diagram = this.connection.diagram;

    if (!node.wrapper) {
        return;
    }

    var createInputTextForm = function( label ) {
        var aBox = label.wrapper.getABox();

        var diagram = label.connection.diagram;
        var px = diagram.el().offsetLeft;
        var py = diagram.el().offsetTop;

        var x = aBox.x + (isNaN(px) ? 0 : px);
        var y = aBox.y + (isNaN(py) ? 0 : py);

        var w = aBox.width + 20;
        var h = 20;

        var txt = document.createElement('form');
        txt.setAttribute('style', 'position: absolute; left: ' + x + 'px; top: ' + y + 'px;');

        var inputForm = document.createElement('input');
        inputForm.setAttribute('type', 'text');
        inputForm.setAttribute('placeholder', label.wrapper.attr('text'));
        inputForm.setAttribute('style', 'padding: 0; width:' + w + 'px; height: ' + h + 'px; z-index: 1;');
        txt.appendChild(inputForm);

        return {
            form: txt,
            input: inputForm
        }
    };

    var remove = function( node ) {
        if (node && node.parentNode) {
            node.parentNode.removeChild( node );
        }
    };

    node.wrapper.dblclick(function(event) {
        var ml = diagram.modifiedLabel;
        if (ml && ml !== node) {
            remove(diagram.inputText);
            remove(diagram.modifiedLabel.textForm);
        }

        if (node.textForm) {
            remove(node.textForm);
        }

        var el = createInputTextForm( node );

        node.textForm = el.form;
        diagram.inputText = el.input;
        diagram.modifiedLabel = node;

        diagram.el().parentNode.appendChild(el.form);
    });

    return this;
};

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

    this.initChildren( attributes.children );

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

Connection.prototype.initChildren = function( children ) {
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

// Palette
//
//  var myPalette = Diagram.Palette.extend({
//      groups: [ {
//            title: 'Objects',
//            tools: [ {
//              title: 'Class',
//              description: 'Blah Blah.',
//              icon: {
//                  small: '/small.png',
//                  large: 'large.png'
//              }
//            ]
//        } ]
//  });
//
var Palette = Diagram.Palette = function( diagram ) {
    this.diagram = diagram;
    this.paletteX = 0;
    this.paletteY = 0;
};

Palette.extend = extend;

var groupTemplate = [
        '<% _.each(groups, function(group) { %>',
        '<div class="accordion-group">',
            '<div class="accordion-heading"><a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="#collapse<%= group.title %>"><%= group.title %></a></div>',
            '<div id="collapse<%= group.title %>" class="accordion-body in collapse" style="height: auto;">',
                '<div class="accordion-inner">',
                    '<div class="btn-group-vertical">',
                        '<% _.each(group.tools, function(tool) { %>',
                            '<button id="create<%= tool.title %>" class="btn palette-tool"><i class="icon-tool-<%= tool.title %>"></i> <%= tool.title %></button>',
                        '<% }) %>',
                    '</div>',
                '</div>',
            '</div>',
        '</div>',
        '<% }) %>'
     ];

var group = _.template( groupTemplate.join(' ') );

Palette.prototype.render = function() {
    if (this.paletteRoot) {
        return this;
    }

    this.paletteRoot = document.createElement('div');
    this.paletteRoot.setAttribute('class', 'palette');
    this.paletteHeader = document.createElement('div');
    this.paletteHeader.setAttribute('class', 'palette-header');
    this.paletteGroups = document.createElement('div');
    this.paletteGroups.setAttribute('class', 'palette-groups');

    this.paletteGroups.innerHTML = group( this );

    this.paletteRoot.appendChild( this.paletteHeader );
    this.paletteRoot.appendChild( this.paletteGroups );
    this.diagram.el().parentNode.appendChild( this.paletteRoot );

    this.addEvents();

    return this;
};

Palette.prototype.el = function() {
    return this.paletteRoot;
};

Palette.prototype.addEvents = function () {
    var palette = this;

    _.each(this.groups, function(group) {
        _.each(group.tools, function(tool) {
            var action = document.getElementById('create' + tool.title);

            if (action && typeof tool.shape === 'function') {
                action.addEventListener('click', function( event ) {
                    palette.diagram.currentTool = tool.shape;
                });
            }

            if (action && typeof tool.edge === 'function') {
                action.addEventListener('click', function( event ) {
                    palette.diagram.currentEdge = tool.edge;
                });
            }
        });
    });
};

Palette.prototype.asDraggable = function() {
    if (this.paletteRoot) {
        this.paletteHeader.style.cursor = 'move';

        var palette = this;
        palette._moving = false;

        this.paletteHeader.addEventListener('mousedown', function(evt) {
            palette._moving = true;
            palette.offsetX = evt.pageX - palette.paletteX;
            palette.offsetY = evt.pageY - palette.paletteY;
        });

        this.diagram.el().parentNode.addEventListener('mouseup', function(evt) {
            palette._moving = false;
        });

        this.diagram.el().parentNode.addEventListener('mousemove', function(evt) {
            if (palette._moving) {
                palette.paletteX = evt.pageX - palette.offsetX;
                palette.paletteY = evt.pageY - palette.offsetY;
                palette.paletteRoot.style.left = palette.paletteX + 'px';
                palette.paletteRoot.style.top = palette.paletteY + 'px';
            }
        });
    }
};

Palette.prototype.remove = function() {
    if (this.paletteRoot) {
        this.paletteRoot.parentNode.removeChild( this.paletteRoot );
        this.paletteRoot = null;
    }
};
// PropertyBox
//

var PropertyBox = Diagram.PropertyBox = function( attributes ) {
    attributes || (attributes = {});
    this.diagram = attributes.diagram;
    this.x = attributes.x;
    this.y = attributes.y;
    this.width = attributes.width ? attributes.width : 340;
    this.height = attributes.height ? attributes.height : 200;

    return this;
};

PropertyBox.prototype.render = function() {
    if (this.root) {
        return this;
    }

    this.root = document.createElement('div');
    this.root.setAttribute('class', 'property-box');
    this.header = document.createElement('div');
    this.header.setAttribute('class', 'property-box-header');
    this.body = document.createElement('div');
    this.body.setAttribute('class', 'property-box-body');

    this.root.appendChild( this.header );
    this.root.appendChild( this.body );

    // add exit button
    var exitButton = document.createElement('a');

    exitButton.setAttribute('style', 'position: relative; font-size: 12px; color: black;');
    exitButton.style.left = (this.width - 16) + 'px';
    exitButton.style.cursor = 'default';
    exitButton.innerHTML = 'X';
    this.header.appendChild( exitButton );

    var propertyBox = this;
    exitButton.addEventListener('click', function(evt) {
        propertyBox.remove();
    });

    if (typeof PropertyBox.bodyTemplate === 'function') {
        this.body.innerHTML = PropertyBox.bodyTemplate();
    }

    this.root.style.left = this.x + 'px';
    this.root.style.top = this.y + 'px';

    this.diagram.el().appendChild(this.root);

    this.asDraggable();

    return this;
};

PropertyBox.prototype.asDraggable = function() {
    if (this.root) {
        this.header.style.cursor = 'move';

        var box = this;
        box._moving = false;

        this.header.addEventListener('mousedown', function(evt) {
            box._moving = true;
            box.offsetX = evt.pageX - box.x;
            box.offsetY = evt.pageY - box.y;
        });

        this.diagram.el().addEventListener('mouseup', function(evt) {
            box._moving = false;
        });

        this.diagram.el().addEventListener('mousemove', function(evt) {
            if (box._moving) {
                box.x = evt.pageX - box.offsetX;
                box.y = evt.pageY - box.offsetY;
                box.root.style.left = box.x + 'px';
                box.root.style.top = box.y + 'px';
            }
        });
    }
};

PropertyBox.prototype.remove = function() {
    if (this.root) {
        this.diagram.el().removeChild(this.root);
        this.root = null;
    }
};

Diagram.ToolBox.propertyBox = PropertyBox;



})();
