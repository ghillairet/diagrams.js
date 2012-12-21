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
    };
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
    }

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
        };
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
        };
    }
};

// Element
//

var Element = Diagram.Element = function (attributes) {
    this.attributes = {};
    this.attributes.children = [];
    this.parent = attributes.parent || undefined;
    this.diagram = this.parent ? this.parent.diagram : attributes.diagram;
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

Element.extend = extend;

Element.prototype = {

    //
    // Determine if the Element has the given property.
    //
    // @method has
    // @return {Boolean}
    // @api public
    //

    has: function( attr ) {
        return this.attributes[attr] !== null;
    },

    //
    // Getter method for Element attributes.
    //
    // @method get
    // @param {String} attr - attribute name
    // @return {Object}
    // @api public
    //

    get: function( attr ) {
        return this.attributes[attr];
    },

    //
    // Setter method for Element attributes.
    //
    // @method set
    // @param {String} attr - attribute name
    // @param {String} val - attribute value
    // @api public
    //

    set: function( attr, val ) {
        this.attributes[attr] = val;
    },

    render: function() {},

    paper: function() {
        if (!this.diagram) {
            throw new Error('SVGElement must be associated to a diagram');
        }
        return this.diagram.paper();
    },

    attr: function() {
       return Raphael.el.attr.apply(this.wrapper, arguments);
    },

    //
    // Return JSON representation of the Element.
    //
    // @method toJSON
    // @return {Object}
    // @api public
    //

    toJSON: function() {
        var attributes = this.attributes,
        clone = _.clone(attributes);

        return this._deepClone(clone);
    },

    //
    // Clone internal representation of the Element.
    //
    // @method _deepClone
    // @private
    // @param {Object} clone
    // @api private
    //

    _deepClone: function( clone ) {
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
    },

    _attr: function(attributes) {
        var attrs = Raphael._availableAttrs,
            attr;

        if (attributes.attr) {
            attr = _.clone(attributes.attr);
        } else {
            attr = {};
        }

        for (var k in attributes) {
            if (_.has(attrs, k))  {
                attr[k] = attributes[k];
            }
        }
        return attr;
    }

};


var DiagramElement = Diagram.DiagramElement = Element.extend({

    constructor: function(attributes) {
        Diagram.Element.apply(this, [attributes]);

        this.parent = attributes.parent || undefined;
        this.diagram = this.parent ? this.parent.diagram : attributes.diagram;
    },

    attr: function() {
       return Raphael.el.attr.apply(this.wrapper, arguments);
    },

    // privates

    _attr: function(attributes) {
        var attrs = Raphael._availableAttrs,
            attr;

        if (attributes.attr) {
            attr = _.clone(attributes.attr);
        } else {
            attr = {};
        }

        for (var k in attributes) {
            if (_.has(attrs, k))  {
                attr[k] = attributes[k];
            }
        }
        return attr;
    }

});


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

    //
    // @method
    // @private
    //

    _path: function() {
        var path = this._get('path'),
            attr = this.get('attr');

        return this.paper().path(path).attr(attr);
    },

    draw: function(figure, parent) {
        if (!figure || !figure.type) return;

        var type = figure.type,
            x = this._get('x'),
            y = this._get('y'),
            wrapper;

        switch(type) {
            case 'rect':
                wrapper = this.paper().rect(x, y);
                break;
            case 'circle':
                wrapper = this.paper().circle(x, y);
                break;
            case 'ellipse':
                wrapper = this.paper().ellipse(x, y);
                break;
            case 'path':
                wrapper = this.paper().path(figure.path);
                break;
            default:
                wrapper = null;
        }

        if (wrapper) {
            wrapper.attr(figure);

            if (parent) {
                var box = parent.getABox();
                wrapper.translate(box.topLeft.x,  box.topLeft.y);
            }
            if (figure.figure) {
                wrapper._child = this.draw(figure.figure, wrapper);
                wrapper._child._parent = wrapper;
            }
        }

        return wrapper;
    },

    drawContent: function() {
        var figure = this.figure;
        if (this.wrapper) {
            if (figure.figure) {
               this.wrapper._child = this.draw(figure.figure, this.wrapper);
            }
        }
    },

    _remove: function() {
        var doRemove = function(wrapper) {
            if (wrapper) {
                if (wrapper._child) {
                    doRemove(wrapper._child);
                }
                wrapper.remove();
            }
        };

        if (this.wrapper) {
            doRemove(this.wrapper);
        }
    },

    //
    // @method _createFigure
    // @private
    //

    _createFigure: function() {
        var wrapper,
            figure = this.figure;

        // Creates the Raphael Element according to the type of figure.
        // The Element is attach to the FigureShape via the property wrapper.

        wrapper = this.draw(figure);
        if (!wrapper) {
            throw new Error('Cannot create figure for ' + this);
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
Diagram.Diagram = function( attributes ) {
    if (!attributes) attributes = {};

    if (this.container) {
        this.setElement(this.container);
    }

    this.attributes = {
        name: '',
        type: '',
        children: [],
        edges: []
    };

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

    this.initialize(attributes);

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

Diagram.Diagram.prototype.initialize = function() {};

// ....extend({
//      el: '#element'
// })
Diagram.Diagram.prototype.setElement = function(element) {
    if (!element) return this;

    if (_.isString(element)) {
        var id = element.indexOf('#') === 0 ? element.slice(1, element.length) : element;
        this._el = document.getElementById(id);
    } else if (element instanceof HTMLElement) {
        this._el = el;
    }

    return this;
};

Diagram.Diagram.prototype.el = function() {
    return this._el;
};

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

Diagram.Diagram.prototype.paper = function(paper) {
    if (paper) {
        this._paper = paper;
    }

    this._init();

    return this._paper;
};

Diagram.Diagram.prototype._init = function() {
    if (!this._paper) {
        this._paper = Raphael(this._el, this.width, this.height);
        console.log(this._paper.width, this._paper.height);
        this._paper.setViewBox(0, 0, this._paper.width, this._paper.height);
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

Diagram.Diagram.prototype.zoom = function(direction) {
    var paper = this._paper;

    console.log('zoom');
    paper.setViewBox(0, 0, paper.width / 2, paper.height / 2);
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

// @private
Diagram.Diagram.prototype.handleTextInput = function() {
    var text = this.inputText.value;
    if (text) {
        this.modifiedLabel.setText(text);
        this.modifiedLabel.textForm.parentNode.removeChild(this.modifiedLabel.textForm);
        this.modifiedLabel.textForm = null;
        this.modifiedLabel = null;
        this.inputText = null;
    }
    if (this.repeatInputClick) {
        if (this.modifiedLabel) {
            this.modifiedLabel.textForm.parentNode.removeChild(this.modifiedLabel.textForm);
            this.modifiedLabel.textForm = null;
            this.modifiedLabel = null;
            this.inputText = null;
            this.repeatInputClick = false;
        }
    } else {
        this.repeatInputClick = true;
    }
};

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

// ToolBox

var ToolBox = Diagram.ToolBox = function( attributes ) {
     this.element = attributes.element;
     this.diagram = this.element.diagram;
     this.width = 60;
     this.height = 80;
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
        x = box.xRight - 40,
        y = box.y - 30;

    this.wrapper = paper.rect(x, y, this.width, this.height, 6).attr({
        fill: 'white',
        'fill-opacity': 0,
        stroke: 'black',
        'stroke-opacity': 0,
        'stroke-width': 2
    });

    this.wrapper.controller = this;

    this.wrapper.mouseover(this.handleMouseOver);
    this.wrapper.mouseout(this.handleMouseOut);

    box = this.wrapper.getABox();

    var control = this;
    this.addItem(box.xLeft + 20, box.y, Trash, function(evt) {
        control.element.remove(true);
    });

    var propertyBox = this.propertyBox = new ToolBox.propertyBox({ diagram: control.diagram });
    if (ToolBox.propertyBox) {
        this.addItem(box.xLeft + 40, box.y + 20, Gear, function(evt) {
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
    console.log(x, y);
    var paper = this.paper(); //Raphael(x, y, 50, 50);

    var wrapper = paper.path(text);
    wrapper.attr({fill: "#000", stroke: "none"});
    wrapper.attr({cursor: 'pointer'});
    wrapper.translate(x, y);
    wrapper.scale(0.8, 0.8);

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
        _.each(this.children, function(child) { child.remove(); });
        this.children.length = 0;
    }
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
    }, 1000);
};


var Trash = 'M20.826,5.75l0.396,1.188c1.54,0.575,2.589,1.44,2.589,2.626c0,2.405-4.308,3.498-8.312,3.498c-4.003,0-8.311-1.093-8.311-3.498c0-1.272,1.21-2.174,2.938-2.746l0.388-1.165c-2.443,0.648-4.327,1.876-4.327,3.91v2.264c0,1.224,0.685,2.155,1.759,2.845l0.396,9.265c0,1.381,3.274,2.5,7.312,2.5c4.038,0,7.313-1.119,7.313-2.5l0.405-9.493c0.885-0.664,1.438-1.521,1.438-2.617V9.562C24.812,7.625,23.101,6.42,20.826,5.75zM11.093,24.127c-0.476-0.286-1.022-0.846-1.166-1.237c-1.007-2.76-0.73-4.921-0.529-7.509c0.747,0.28,1.58,0.491,2.45,0.642c-0.216,2.658-0.43,4.923,0.003,7.828C11.916,24.278,11.567,24.411,11.093,24.127zM17.219,24.329c-0.019,0.445-0.691,0.856-1.517,0.856c-0.828,0-1.498-0.413-1.517-0.858c-0.126-2.996-0.032-5.322,0.068-8.039c0.418,0.022,0.835,0.037,1.246,0.037c0.543,0,1.097-0.02,1.651-0.059C17.251,18.994,17.346,21.325,17.219,24.329zM21.476,22.892c-0.143,0.392-0.69,0.95-1.165,1.235c-0.474,0.284-0.817,0.151-0.754-0.276c0.437-2.93,0.214-5.209-0.005-7.897c0.881-0.174,1.708-0.417,2.44-0.731C22.194,17.883,22.503,20.076,21.476,22.892zM11.338,9.512c0.525,0.173,1.092-0.109,1.268-0.633h-0.002l0.771-2.316h4.56l0.771,2.316c0.14,0.419,0.53,0.685,0.949,0.685c0.104,0,0.211-0.017,0.316-0.052c0.524-0.175,0.808-0.742,0.633-1.265l-1.002-3.001c-0.136-0.407-0.518-0.683-0.945-0.683h-6.002c-0.428,0-0.812,0.275-0.948,0.683l-1,2.999C10.532,8.77,10.815,9.337,11.338,9.512z';

var Gear = 'M26.834,14.693c1.816-2.088,2.181-4.938,1.193-7.334l-3.646,4.252l-3.594-0.699L19.596,7.45l3.637-4.242c-2.502-0.63-5.258,0.13-7.066,2.21c-1.907,2.193-2.219,5.229-1.039,7.693L5.624,24.04c-1.011,1.162-0.888,2.924,0.274,3.935c1.162,1.01,2.924,0.888,3.935-0.274l9.493-10.918C21.939,17.625,24.918,16.896,26.834,14.693z';



//
// Draggable
//
// Makes a Shape draggable.
//

/**
Diagram.Shape.prototype.asDraggable = function( options ) {
    if (this.wrapper) {
        this.wrapper.attr({ cursor: 'move' });
    }

    var start = function() {
        var wrapper = this;
        wrapper.o();

        if (wrapper.controller) {
            var control = wrapper.controller;
            if (typeof control.deselect === 'function') {
                control.deselect();
            }
            if (control.shadow) {
                control.shadowWrapper.remove();
            }
            if (control._tool) {
                control._tool.remove();
            }

            wrapper.unmouseover(control.handleMouseOver);
            wrapper.unmouseout(control.handleMouseOut);

            drawDragger(this);
        }
    };

    var move = function( dx, dy, mx, my, ev ) {
        var wrapper = this;
        var b = wrapper.getBBox(),
            x = wrapper.ox + dx,
            y = wrapper.oy + dy,
            r = wrapper.is('circle') || wrapper.is('ellipse') ? b.width / 2 : 0,
            paper = wrapper.paper,
            position;

        x = Math.min(
                Math.max(r, x),
                paper.width - (wrapper.is('circle') || wrapper.is('ellipse') ? r : b.width));
        y = Math.min(
                Math.max(r, y),
                paper.height - (wrapper.is('circle') || wrapper.is('ellipse') ? r : b.height));

        position = { x: x, y: y, cx: x, cy: y };
        wrapper.attr(position);

        if (wrapper.controller) {
            var control = wrapper.controller;

            if (control.isConnectable) {
                var inEdges = control.inEdges,
                    outEdges = control.outEdges;

                if (inEdges && inEdges.length) {
                    for (var i = 0; i < inEdges.length; i++) {
                        inEdges[i].render();
                    }
                }
                if (outEdges && outEdges.length) {
                    for (var j = 0; j < outEdges.length; j++) {
                        outEdges[j].render();
                    }
                }
            }
        }
    };

    var end = function() {
        var wrapper = this;
        var control = wrapper.controller;
        wrapper.mouseover(control.handleMouseOver);
        wrapper.mouseout(control.handleMouseOut);

        var attrs = wrapper.oa;
        attrs.cx = wrapper.attrs.cx;
        attrs.cy = wrapper.attrs.cy;
        attrs.x = wrapper.attrs.x;
        attrs.y = wrapper.attrs.y;
        wrapper.attr(attrs);
        delete wrapper.oa;

        if (control) {
            control._renderContent();

            if (control.shadow) {
                control.createShadow();
            }
        }
    };

    var drawDragger = function(wrapper) {
        var attrs = _.clone(wrapper.attrs),
            type = wrapper.type;

        wrapper.oa = attrs;
        if (wrapper.oa['fill-opacity'] === undefined) {
            wrapper.oa['fill-opacity'] = 1;
        }

        var removeChild = function(wrapper) {
            if (wrapper._child) {
                removeChild(wrapper._child);
                wrapper._child.remove();
            }
        };
        removeChild(wrapper);

        wrapper.attr({ fill: 'grey', 'fill-opacity': 0.2, 'stroke-width': 0 });

        return wrapper;
    };

    var wrapper = this.wrapper;
    wrapper.drag(move, start, end);

    return this;
};
**/

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
};

Anchor.prototype.remove = function() {
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
};

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

    var control = this.box.controller;
    if (control) control.resize(dx, dy, this.anchor.direction);
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

    if (attributes.id !== null) {
        this.set('id', attributes.id);
    } else {
        this.set('id', _.uniqueId());
    }

    this.xOffset = 5;
    this.yOffset = 5;

    this.set('attr', this._attr(attributes));
    this.set('position', this.position);

    this._initChildren( attributes );

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

_.extend(
    Label.prototype,
    Diagram.SVGElement.prototype,
    Diagram.Draggable,
    Events
);

/**
 * @private
**/

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

/**
 * @private
**/

Label.prototype._initChildren = function( attributes ) {
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

/**
 * @api public
**/
// Should be only one image.
Label.prototype.createImage = function( attributes ) {
    attributes.parent = this;
    var image = new Diagram.Image( attributes );
    this.image = image;
    return image;
};

/**
 * @api public
**/

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
//    var bBox = this.parent.wrapper.getABox(),
//        tbb = this.wrapper.getABox();
//    this.center();

//    if (direction === 'nw' || direction === 'ne') {
//        this.attr('y', this.wrapper.oy + dy);
//    }
};

Label.prototype.center = function() {
    var box = this.parent.wrapper.getABox(),
        tbb = this.wrapper.getABox();

    switch (this.position) {
        case 'center':
            this.attr('x', box.xCenter);
            this.attr('y', box.yMiddle);
            break;
        case 'center-left':
            this.attr('x', box.x + this.xOffset + (tbb.width / 2));
            this.attr('y', box.yMiddle);
            if (this.image) {
                var x = this.attr('x');
                this.attr({x: x + this.image.attr('width')});
            }
            break;
        case 'center-right':
            this.attr('x', box.xRight - this.xOffset - (tbb.width / 2));
            this.attr('y', box.yMiddle);
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
            this.attr('y', box.y + (tbb.height / 2) + this.yOffset);
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

        var x = aBox.x + (isNaN(px) ? 0 : px);
        var y = aBox.y + (isNaN(py) ? 0 : py);

        var w = node.parent.attr('width');
        var h = 20;

        var txt = this.textForm = document.createElement('form');
        txt.setAttribute('style', 'position: absolute; left: ' + x + 'px; top: ' + y + 'px;');

        var inputForm = document.createElement('input');
        inputForm.setAttribute('type', 'text');
        inputForm.value = node.get('text');
        inputForm.setAttribute('style', 'padding: 0; width:' + w + 'px; height: ' + h + 'px; z-index: 1;');
        txt.appendChild(inputForm);

        return {
            form: txt,
            input: inputForm
        };
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


// SVGRenderer

var SVG = {

    createFigure: function(shape, x, y) {
        var paper = shape.paper(),
            figure = shape.figure,
            type = figure.type,
            wrapper;

        switch(type) {
            case 'rect':
            case 'circle':
            case 'ellipse':
                wrapper = paper[type](x, y);
                break;
            case 'path':
                wrapper = paper.path(figure.path);
                break;
            default:
                wrapper = null;
        }

        if (wrapper) {
            var parent = shape.parent,
                width, height;

            if (!figure.width && parent) {
                width = (parent.wrapper ? parent.wrapper.attr('width') : figure.width) - figure.x;
                wrapper.attr('width', width);

            }
            if (!figure.height && parent) {
                height = (parent.wrapper ? parent.wrapper.attr('height') : figure.height) - figure.y;
                wrapper.attr('height', height);
            }
            wrapper.attr(shape.get('attr'));
        }

        return wrapper;
    }

};

var FigureShape = Diagram.Element.extend({
    _renderer: SVG,

    constructor: function(attributes) {
        Diagram.Element.apply(this, [attributes]);
        this.parent = attributes.parent;
        delete attributes.parent;

        this.figure = _.clone(attributes);
        this.set('attr', _.clone(this.figure));
        _.extend(this.get('attr'), this._attr(attributes));

        this._initChildren();
    },

    render: function() {
        if (this.wrapper) this.remove(false);
        if (!this.diagram) throw new Error('Shape does not belong to a diagram');

        this.wrapper = this._renderer.createFigure(this, 0, 0);
        // Position this Shape according to its parent coordinates
        if (this.parent) {
            var parent = this.parent.wrapper,
                box = parent.getABox();
            this.wrapper.translate(box.topLeft.x,  box.topLeft.y);
        }
        _.each(this.get('children'), function(c) { c.render(); });

        return this;
    },

    remove: function() {
        _.each(this.get('children'), function(c) { c.remove(); });
        if (this.wrapper) this.wrapper.remove();
    },

    _initChildren: function() {
        var figure = this.figure;
        if (figure.figure) {
            var subFigure = figure.figure;
            subFigure.parent = this;
            this.get('children').push(new FigureShape(subFigure));
        }
    }
});

// Shape
//

var Shape = Diagram.Shape = Diagram.Element.extend({
    _renderer: SVG,

    // default settings.
    connectable: true,
    shadow: false,
    resizable: true,
    draggable: true,
    toolbox: true,

    constructor: function(attributes) {
        if (!attributes) attributes = {};

        Diagram.Element.apply(this, [attributes]);

        this.inEdges = [];
        this.outEdges = [];

        if (!this.figure && attributes.figure) {
            this.figure = _.clone(attributes.figure);
        }

        this.parent = attributes.parent;

        this.set('type', this.type);
        this.set('id', attributes.id || _.uniqueId());
        this.set('attr', _.clone(this.figure));
        _.extend(this.get('attr'), this._attr(attributes));

        if (this.diagram) {
            // diagram can be null for dummy shape, see Compartment._canCreate.
            this.diagram.get('children').push(this);
            this.diagram.trigger('add:children', this);
        }

        this._initChildren();
        this.initialize.apply(this, arguments);
    },

    initialize: function() {},

    _initChildren: function() {
        var figure = this.figure;

        if (figure.label) {
            var labelAttr = figure.label;
            labelAttr.parent = this;
            this.get('children').push(new Diagram.Label(labelAttr));
        }

        if (figure.compartment) {
            var cptAttr = figure.compartment;
            cptAttr.parent = this;
            this.get('children').push(new Diagram.Compartment(cptAttr));
        }

        if (figure.figure) {
            var subFigure = figure.figure;
            subFigure.parent = this;
            this.get('children').push(new FigureShape(subFigure));
        }
    },

    render: function() {
        if (this.wrapper) this.remove(false);
        if (!this.diagram) throw new Error('Shape does not belong to a diagram');

        this.wrapper = this._renderer.createFigure(this, this.get('attr').x, this.get('attr').y);
        if (this.parent) {
            var parent = this.parent.wrapper,
                box = parent.getABox();
            this.wrapper.translate(box.topLeft.x,  box.topLeft.y);
        }
        this.wrapper.controller = this;

        if (this.draggable) this.asDraggable();
        if (this.toolbox) this._tool = new Diagram.ToolBox({ element: this });

        _.each(this.get('children'), function(c) { c.render(); });

        this.wrapper.click(this.click);
        this.wrapper.mouseover(this.mouseover);
        this.wrapper.mouseout(this.mouseout);

        return this;
    },

    click: function(e) {
        if (!this.controller) return;

        var control = this.controller,
            diagram = control.diagram;

        // Show selectors
        control.select();

        // Show toolbox
        if (control._tool) {
            control._tool.render();
        }

        // Handle connections
        if (diagram.canConnect(control)) {
            var connection = diagram.connect(control);
            if (connection) connection.render();
        }
    },

    mouseover: function(e) {
    },

    mouseout: function(e) {
        if (!this.controller) return;

        var control = this.controller;
        if (control._tool) {
            window.setTimeout(function(){
                if (control._tool) {
                    if (!control._tool.isOver) {
                        control._tool.remove();
                    }
                }
            }, 500);
        }
    },

    // @param {Boolean} fromDiagram - also removes from diagram.
    remove: function(fromDiagram) {
        if (this.wrapper) {
            this.wrapper.remove();
            delete this.wrapper;
        }

        _.each(this.get('children'), function(c) { c.remove(); });
        _.each(this.inEdges, function(e) { e.remove(fromDiagram); });
        _.each(this.outEdges, function(e) { e.remove(fromDiagram); });

        // remove shadow if present.
        if (this.shadow) {
            this.shadowWrapper.remove();
            delete this.shadowWrapper;
        }

        // remove toolbox if present.
        if (this._tool) {
            this._tool.remove();
            delete this._tool;
        }
    },

    disconnect: function(connection) {
        this.inEdges = _.without(this.inEdges, connection);
        this.outEdges = _.without(this.outEdges, connection);
        return this;
    },

    startresize: function() {
        if (!this.wrapper) return;
        this.wrapper.oa = _.clone(this.wrapper.attrs);
        this._removeContent();
        this.wrapper.attr({ fill: 'grey', 'fill-opacity': 0.2, 'stroke-width': 0 });
    },

    resize: function(dx, dy, direction) {
        if (!this.wrapper) return;

        if (this.resizable) {
            this.wrapper.attr(this.wrapper.rdxy(dx, dy, direction));
            this._renderEdges();
        }
    },

    endresize: function() {
        reset(this.wrapper);
        this._renderEdges();
        // render inner elements
        this._renderContent();
    },

    toJSON: function() {
        var clone = _.clone(this.attributes);
        if (this.wrapper) {
            clone.attr = this.wrapper.attr();
        }
        return clone;
    },

    asDraggable: function( options ) {
        if (this.wrapper) {
            this.wrapper.attr({ cursor: 'move' });
        }

        this.wrapper.drag(move, start, end);

        return this;
    },

    toFront: function() {
        return this.wrapper.toFront();
    },

    startdragging: function() {
        if (!this.wrapper) return;

        var wrapper = this.wrapper,
            attrs = _.clone(wrapper.attrs),
            type = wrapper.type;

        wrapper.oa = attrs;
        wrapper.oa.fill = wrapper.attr('fill'); // for gradients.
        if (wrapper.oa['fill-opacity'] === undefined) {
            wrapper.oa['fill-opacity'] = 1;
        }
        this._removeContent();

        wrapper.attr({ fill: 'grey', 'fill-opacity': 0.2, 'stroke-width': 0 });
    },

    _removeContent: function() {
        _.each(this.get('children'), function(c) { c.remove(); });
    },

    _renderContent: function() {
        _.each(this.get('children'), function(c) { c.render(); });
    },

    _renderEdges: function() {
        var ins = this.inEdges,
            outs = this.outEdges;

        for (var i = 0; i < ins.length; i++) {
            ins[i].render();
        }
        for (var j = 0; j < outs.length; j++) {
            outs[j].render();
        }
    }

});

_.extend(Diagram.Shape.prototype, Diagram.Selectable, Events);

// Dragging functions

function start() {
    var wrapper = this,
        control = wrapper.controller;

    wrapper.o();

    if (control) {
        if (typeof control.deselect === 'function') control.deselect();
        if (control.shadow) control.shadowWrapper.remove();
        if (control._tool) control._tool.remove();

        wrapper.unmouseover(control.mouseover);
        wrapper.unmouseout(control.mouseout);
        control.startdragging();
    }
}

function move( dx, dy, mx, my, ev ) {
    var wrapper = this,
        b = wrapper.getBBox(),
        x = wrapper.ox + dx,
        y = wrapper.oy + dy,
        r = wrapper.is('circle') || wrapper.is('ellipse') ? b.width / 2 : 0,
        paper = wrapper.paper,
        control = wrapper.controller,
        position;

    x = Math.min(
            Math.max(r, x),
            paper.width - (wrapper.is('circle') || wrapper.is('ellipse') ? r : b.width));
    y = Math.min(
            Math.max(r, y),
            paper.height - (wrapper.is('circle') || wrapper.is('ellipse') ? r : b.height));

    position = { x: x, y: y, cx: x, cy: y };
    wrapper.attr(position);

    if (control) control._renderEdges();
}

function end() {
    var wrapper = this,
        control = wrapper.controller;

    reset(wrapper);

    if (control) {
        wrapper.mouseover(control.mouseover);
        wrapper.mouseout(control.mouseout);
        // store new coordinates
        control.get('attr').x = wrapper.x();
        control.get('attr').y = wrapper.y();
        // render inner elements
        control._renderContent();

        if (control.shadow) control.createShadow();
    }
}

function reset(wrapper) {
    var attrs = wrapper.oa;

    // changes coordinates and sizes
    // reset other attributes.
    attrs.width = wrapper.attrs.width;
    attrs.height = wrapper.attrs.height;
    attrs.r = wrapper.attrs.r;
    attrs.cx = wrapper.attrs.cx;
    attrs.cy = wrapper.attrs.cy;
    attrs.x = wrapper.attrs.x;
    attrs.y = wrapper.attrs.y;

    wrapper.attr(attrs);
    delete wrapper.oa;
}


// Compartment
//

var Compartment = Diagram.Compartment = Diagram.Shape.extend({

    resizable: false,
    draggable: false,
    layout: 'fixed', // horizontal, vertical
    spacing: 5,

    constructor: function(attributes) {
        Diagram.Shape.apply(this, [attributes]);

        if (attributes.layout) {
            this.layout = attributes.layout;
        }
        if (attributes.spacing) {
            this.spacing = attributes.spacing;
        }

        this.accepts = attributes.accepts || [];
        this.initialize.apply(this, arguments);
    },

    click: function(e) {
        var control = this.controller;
        if (control.parent) {
            control.parent.select();
        }
    },

    canCreate: function(func) {
        if (!func || typeof func !== 'function') return false;
        var found = _.find(this.accepts, function(c) { return c === func; });

        return found ? true : false;
    },

    createShape: function(func, position) {
        var attrs = { parent: this },
            x, y;

        if (this.layout === 'vertical') {
            attrs.x = 0;
            attrs.y = this._height();
        } else if (this.layout === 'horizontal') {
            attrs.x = this._width();
            attrs.y = 0;
        } else {
            // computes coordinates according to the
            // compartment position.
            x = position.x;
            y = position.y;
        }

        var shape = new func(attrs);
        if (shape) this.get('children').push(shape);

        return shape;
    },

    _width: function() {
        var child = this.get('children'),
            width = 0;

        _.each(child, function(c) {
            if (c.wrapper) {
                width += c.wrapper.attr('width');
            } else {
                width += c.get('attr').width;
            }
        });

        return width;
    },

    _height: function() {
        var child = this.get('children'),
            height = 0;

        _.each(child, function(c) {
            if (c.wrapper) {
                height += c.wrapper.attr('height');
            } else {
                height += c.get('attr').height;
            }
        });

        return height;
    }

});

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
    this.wrapper.attr({ fill: 'black', stroke: 'none' });
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
};


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
    var x = this.point.x + (-1.5 * (arrow.dx - 1) * Math.cos(this.radians));
    var y = this.point.y + (1.5 * (arrow.dy - 1) * Math.sin(this.radians));

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


// states
//  - dragging
//  -

var Connection = Diagram.Connection = Diagram.DiagramElement.extend({
    toolbox: true,

    constructor: function(attributes) {
        Diagram.DiagramElement.apply(this, [attributes]);

        this.set('sourceAnchor', new ConnectionAnchor({ connection: this }));
        this.set('targetAnchor', new ConnectionAnchor({ connection: this }));
        this.vertices = [];
        if (this.toolbox) this._tool = new Diagram.ToolBox({ element: this });
        this.initialize.apply(this, arguments);
    },

    initialize: function() {},

    addPoint: function(point) {
        var fp = new FlexPoint(this, point);
        this.vertices.push(fp);
        this.vertices = _.sortBy(this.vertices, function(v) { return v.x; });
        this.render();

        return this;
    },

    remove: function(fromDiagram) {
        if (this.wrapper) this.wrapper.remove();
        if (this.dummy) this.dummy.remove();
        if (this.startArrow) this.startArrow.remove();
        if (this.endArrow) this.endArrow.remove();
        if (this._tool) this._tool.remove();

        _.each(this.vertices, function(v) {
            if (!v.state) v.remove();
        });

        if (fromDiagram) {
            this.disconnect();
            this.get('sourceAnchor').remove();
            this.get('targetAnchor').remove();
            this.diagram.removeConnection(this);
        }

        return this;
    },

    render: function() {
        var boxes = this._boxes(),
            sbox = boxes[0],
            tbox = boxes[1],
            points = this._points(sbox, tbox),
            sPoint = points[0],
            tPoint = points[1],
            th, c1r, c2r;

        if (!sPoint || !tPoint) return this;

        this.remove();

        if (this.vertices.length) {
            th = theta(this.vertices[this.vertices.length - 1], tbox.center);
        } else {
            th = theta(sbox.center, tbox.center);
        }
        c1r = 360 - th.degrees + 180;
        c2r = 360 - th.degrees;

        this.get('sourceAnchor').move(sPoint).render().hide();
        this.get('targetAnchor').move(tPoint).render().hide();

        var paths = path(this.get('sourceAnchor'), this.get('targetAnchor'), this.vertices, false),
            paper = this.paper();

        this.wrapper = paper.path(paths.join(' '));
        if (this.has('attr')) this.wrapper.attr(this.get('attr'));
        this.wrapper.controller = this;

        this.startArrow = new ConnectionEnd(paper, sPoint, c1r, th.radians, this.start);
        this.startArrow.render();
        this.endArrow = new ConnectionEnd(paper, tPoint, c2r, th.radians, this.end);
        this.endArrow.render();

        // Dummy is a larger line receiving clicks from users
        this.dummy = paper.path(paths.join(' '));
        this.dummy.connection = this;
        this.dummy.attr({ cursor: 'pointer', fill: 'none', opacity: 0, 'stroke-width': 8 });

        this.dummy.dblclick(this.dblclick);
        this.dummy.click(this.click);

        return this;
    },

    click: function(e) {
        var connection = this.connection;
        connection.select();

        if (connection._tool) {
            connection._tool.render();
        }

        if (connection.diagram.selected) {
            connection.diagram.selected.deselect();
        }
    },

    dblclick: function(e) {
        var connection = this.connection;
        connection.addPoint({ x: e.clientX, y: e.clientY });
        connection.select();
    },

    onselect: function() {

    },

    select: function() {
        this.get('sourceAnchor').toFront().show();
        this.get('targetAnchor').toFront().show();
        _.each(this.vertices, function(v) { v.render(); });
    },

    deselect: function() {
        this.get('sourceAnchor').toFront().hide();
        this.get('targetAnchor').toFront().hide();
        _.each(this.vertices, function(v) { v.remove(); });
    },

    connect: function(src, tgt) {
        if (!src || !tgt) return this;

        this.set('source', src);
        this.set('target', tgt);

        this.get('sourceAnchor').attach( src );
        this.get('targetAnchor').attach( tgt );

        src.trigger('connect:source', this);
        tgt.trigger('connect:target', this);

        src.outEdges.push(this);
        tgt.inEdges.push(this);

        return this;
    },

    disconnect: function() {
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
    },

    toJSON: function() {
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
    },

    // Returns the ABox of this source and target shapes, or if
    // during a drag state returns the dragged anchor ABox.

    _boxes: function() {
        var paper = this.paper(),
        sbox, tbox;

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

        return [sbox, tbox];
    },

    // Returns the points of intersection between the source and target
    // boxes and the Line joining their center. The points of intersection
    // are the start and end of the Connection.

    _points: function(sbox, tbox) {
        var paper = this.paper(),
            line, sPoint, tPoint;

        if (this.vertices.length) {
            line = new Line(paper, sbox.center, this.vertices[0]);
            sPoint = line.findIntersection(sbox);
            line.remove();
            line = new Line(paper, this.vertices[this.vertices.length - 1], tbox.center);
            tPoint = line.findIntersection(tbox);
            line.remove();
        } else {
            line = new Line(paper, sbox.center, tbox.center);
            sPoint = line.findIntersection(sbox);
            tPoint = line.findIntersection(tbox);
            line.remove();
        }

        return [sPoint, tPoint];
    }

});

_.extend(Diagram.Connection.prototype, Events);

// FlexPoint

function FlexPoint(connection, point) {
    this.connection = connection;
    this.paper = connection.paper();
    this.x = point.x;
    this.y = point.y;
}

FlexPoint.prototype.render = function() {
    this.remove();

    this.wrapper = this.paper.rect(this.x - 3, this.y - 3, 6, 6, 0);
    this.wrapper.attr({ fill: 'black', stroke: 'none', cursor: 'pointer' });

    this.drag();
    this.wrapper.toFront();

    this.wrapper.dblclick(this.remove);

    return this;
};

FlexPoint.prototype.remove = function() {
    console.log('remove', this);
    if (this.wrapper) this.wrapper.remove();
};

FlexPoint.prototype.drag = function() {
    if (!this.wrapper) return this;

    var point = this,
        connection = this.connection,
        move = function(dx, dy) {
            this.attr({ x: this.ox + dx, y: this.oy + dy });
            var box = this.getABox();
            point.x = box.center.x;
            point.y = box.center.y;
            connection.render();
        },
        start = function() {
            this.o();
            point.state = 'dragging';
            this.attr('cursor', 'move');
        },
        end = function() {
            delete point.state;
            connection.deselect();
        };

    this.wrapper.drag(move, start, end);
};

//
// Helpers
//

// Returns the Path for the Connection

function path(start, end, vertices, smooth) {
    var paths = ["M", start.x, start.y],
        i = 0,
        l = vertices.length;

    for (; i < l; i++) {
        paths.push("L", vertices[i].x, vertices[i].y);
    }
    paths.push("L", end.x, end.y);

    return paths;
}

// Calculates angle for arrows

function theta(p1, p2) {
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
}



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
    this.paletteX = 10;
    this.paletteY = 10;
};

Palette.extend = extend;

Palette.prototype.render = function() {
    if (this.element) {
        return this;
    }

    var diagram = this.diagram;

    this.element = document.createElement('div');
    this.element.setAttribute('class', 'palette');
    this.element.style.left = this.paletteX;
    this.element.style.top = this.paletteY;

    var inner = document.createElement('div');
    inner.setAttribute('class', 'palette-inner');

    this.header = document.createElement('div');
    this.header.setAttribute('class', 'palette-header');

    var headerContent = document.createElement('div');
    var zoomPlus = document.createElement('a');
    zoomPlus.innerHTML = ' +';
    var zoomMinus = document.createElement('a');
    zoomMinus.innerHTML = ' -';

    zoomPlus.addEventListener('click', function() { diagram.zoom('in'); });
    zoomMinus.addEventListener('click', function() { diagram.zoom('out'); });

    headerContent.appendChild(zoomPlus);
    headerContent.appendChild(zoomMinus);
    this.header.appendChild(headerContent);

    this.body = document.createElement('div');
    this.body.setAttribute('class', 'palette-body');

    _.each(this.groups, function(group) {
        var view = new PaletteGroup(group, this);
        view.render();
        this.body.appendChild(view.el());
    }, this);

    this.element.appendChild( inner );
    inner.appendChild( this.header );
    inner.appendChild( this.body );

    this.diagram.el().appendChild( this.element );

    return this;
};

Palette.prototype.el = function() {
    return this.element;
};

Palette.prototype.asDraggable = function() {
    if (this.element && this.header) {
        this.header.style.cursor = 'move';
        var palette = this;

        this.header.addEventListener('mousedown', function(evt) {
            palette.innerX = evt.clientX + window.pageXOffset - palette.element.offsetLeft;
            palette.innerY = evt.clientY + window.pageYOffset - palette.element.offsetTop;

            window.addEventListener('mousemove', move, false);
            window.addEventListener('mouseup', function() {
                window.removeEventListener('mousemove', move, false);
            }, true);

            function move(e) {
                var position = palette.element.style.position;
                palette.element.style.position = 'absolute';
                palette.element.style.left = e.clientX + window.pageXOffset - palette.innerX + 'px';
                palette.element.style.top = e.clientY + window.pageYOffset - palette.innerY + 'px';
                palette.element.style.position = position;
            }
        });
    }
};

Palette.prototype.remove = function() {
    if (this.element) {
        this.element.parentNode.removeChild( this.element );
        this.element= null;
    }
};

//
// PaletteGroup
//

var PaletteGroup = function(group, palette) {
    this.title = group.title;
    this.tools = group.tools;
    this.palette = palette;
    this.views = [];
};

PaletteGroup.prototype.template = _.template('<div class="palette-header"><span> <%= title %></span></div><div class="palette-body"></div>');

PaletteGroup.prototype.render = function() {
    this.remove();
    this.element = document.createElement('div');
    this.element.setAttribute('class', 'palette-group');
    this.element.innerHTML = this.template(this);

    this.header = this.element.children[0];
    this.body = this.element.children[1];

    _.each(this.tools, function(tool) {
        var view = new PaletteItem(tool, this.palette);
        view.render();

        view.on('click', function() {
            this.palette.currentItem = view;
             if (typeof view.edge === 'function') {
                diagram.currentEdge = view.edge;
            } else {
                diagram.el().addEventListener('click', create, false);
            }
        }, this);

        view.on('created', function() {
            this.palette.currentItem = null;
        }, this);

        this.views.push(view);
        this.body.appendChild(view.el());
    }, this);

    var diagram = this.palette.diagram,
        me = this;

    function canCreate(control, tool) {
        var found;
        if (!control) return;
        if (typeof control.canCreate === 'function') {
            if (control.canCreate(tool)) {
                found = control;
            }
        }
        if (!found) {
            found = _.find(control.get('children'), function(c) {
                return canCreate(c, tool) !== undefined;
            });
        }
        return found;
    }

    function create(e) {
        var tool = me.palette.currentItem,
            position, node;

        if (tool) {
            position = Point.getMousePosition(diagram._paper, e);
            if (typeof tool.shape === 'function') {
                if (diagram._canCreate(me.palette.currentItem.shape)) {
                    node = diagram.createShape(tool.shape, position);
                } else {
                    // if click over an element
                    var el = diagram.paper().getElementsByPoint(position.x, position.y);
                    if (el && el.length) {
                        var l = el.length,
                            i = 0,
                            found, wrapper, control;

                        while(i < l && !found) {
                            wrapper = el[i];
                            control = wrapper.controller;
                            found = canCreate(control, tool.shape);
                            i++;
                        }

                        if (found) {
                            node = found.createShape(tool.shape, position);
                        }
                    }
                }
            }

            if (node) node.render();
            me.palette.currentItem.trigger('created');
        }

        diagram.el().removeEventListener('click', create, false);
    }

    this.header.addEventListener('click', function(e) {
        if (me._hidden)  {
            me.show();
            me._hidden = false;
        } else {
            me.hide();
            me._hidden = true;
        }
    });

    return this;
};

PaletteGroup.prototype.el = function() {
    return this.element;
};

PaletteGroup.prototype.hide = function() {
    _.each(this.views, function(e) { e.remove(); });
    return this;
};

PaletteGroup.prototype.show = function() {
    _.each(this.views, function(e) {
        e.render();
        this.body.appendChild(e.el());
    }, this);

    return this;
};

PaletteGroup.prototype.remove = function() {
    if (this.element) {
        this.element.parentNode.removeChild(this.element);
    }

    return this;
};

//
// PaletteItem
//

var PaletteItem = function(item, palette) {
    this.icon = item.icon || 'icon-tool-' + item.title;
    this.title = item.title;
    this.shape = item.shape;
    this.edge = item.edge;
    this.palette = palette;
};

_.extend(PaletteItem.prototype, Events);

PaletteItem.prototype.template = _.template('<span><i class="<%= icon %>"></i> <%= title %></span>');

PaletteItem.prototype.render = function() {
    this.remove();
    this.element = document.createElement('div');
    this.element.setAttribute('class', 'palette-item');

    var html = this.template(this);
    this.element.innerHTML = html;

    var me = this;
    me.element.addEventListener('click', function(e) {
        e.stopPropagation();
        me.trigger('click');
    }, false);

    this.element.addEventListener('mouseover', function(e) {
        me.element.setAttribute('class', 'palette-item highlight');
    });

    this.element.addEventListener('mouseout', function(e) {
        me.element.setAttribute('class', 'palette-item');
    });

    return this;
};

PaletteItem.prototype.remove = function() {
    if (this.element) {
        this.element.parentNode.removeChild(this.element);
        delete this.element;
    }
};

PaletteItem.prototype.el = function() {
    return this.element;
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
