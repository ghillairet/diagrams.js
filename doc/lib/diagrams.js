
//     Diagrams.js 0.1.0
//     JavaScript Diagramming Library.
//
//     © 2012 Guillaume Hillairet.

(function(root) {

    "use strict";

//    var root = this;

    var Ds = {
        version: '0.1.0'
    };

    root.Ds = Ds;
    root.Diagrams = Ds;



// Point
//

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

Point.get = function(paper, e) {
    // IE:
    if (window.event && window.event.contentOverflow !== undefined) {
        return new Point(window.event.x, window.event.y);
    }

    // Webkit:
    if (e.offsetX !== undefined && e.offsetY !== undefined) {
        return new Point(e.offsetX, e.offsetY);
    }

    // Firefox:
    // get position relative to the whole document
    // note that it also counts on scrolling (as opposed to clientX/Y).
    var pageX = e.pageX;
    var pageY = e.pageY;

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



// Raphael extensions for Diagrams.js.

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

    this.oa = _.clone(attr);
    this.oa.fill = this.attr('fill'); // for gradients.
    if (this.oa['fill-opacity'] === undefined) {
        this.oa['fill-opacity'] = 1;
    }
    this.ox = this.x();
    this.oy = this.y();
    this.ow = attr.width;
    this.oh = attr.height;
    this.or = attr.r;
    this.orx = attr.rx;
    this.ory = attr.ry;
    return this;
};

Raphael.el.reset = function() {
    var attrs = this.oa;

    if (!attrs) return this;

    // changes coordinates and sizes
    // reset other attributes.
    attrs.width = this.attrs.width;
    attrs.height = this.attrs.height;
    attrs.r = this.attrs.r;
    attrs.cx = this.attrs.cx;
    attrs.cy = this.attrs.cy;
    attrs.x = this.attrs.x;
    attrs.y = this.attrs.y;

    this.attr(attrs);

    delete this.oa;

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
var Events = Ds.Events = {

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


Ds.arrows = {

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

var Element = Ds.Element = function (attributes) {
    if (!attributes) attributes = {};

    this.attributes = {};
    this.attributes.children = [];
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

    initialize: function() {},

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    //
    // @return {Boolean}
    // @api public

    has: function( attr ) {
        return this.attributes[attr] != null;
    },

    // Returns the value of an attribute.
    //
    // @param {String}
    // @return {Object}
    // @api public

    get: function( attr ) {
        return this.attributes[attr];
    },

    // Sets the value of an attribute.
    //
    // @param {String} key
    // @param {String} value
    // or
    // @param {Object}
    //
    // @api public

    set: function( key, value ) {
        var attrs;

        if (_.isObject(key)) {
            attrs = key;
        } else {
            (attrs = {})[key] = value;
        }

        for (var attr in attrs) {
            this.attributes[attr] = attrs[attr];
        }

        return this;
    },

    // Return a JSON representation.
    //
    // @return {Object}
    // @api public

    toJSON: function() {
        var attributes = this.attributes,
            clone = _.clone(attributes);

        return this._deepClone(clone);
    },

    // Clone internal representation of the Element.
    //
    // @param {Object} clone
    // @api private

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
    }

};

_.extend(Ds.Element.prototype, Ds.Events);

var raphaelAttributes = Raphael._availableAttrs,
    escapes = ['children', 'figure', 'label', 'compartment'];

// text must be added as an available attribute.
raphaelAttributes.text = '';

// DiagramElement
//
// Element that is part of a Diagram (Shape, Connection). A DiagramElement is defined
// by a figure and is identified by a unique id.
//

var DiagramElement = Ds.DiagramElement = Ds.Element.extend({

    constructor: function(attributes) {
        Ds.Element.apply(this, [attributes]);

        this.parent = attributes.parent || undefined;
        this.diagram = this.parent ? this.parent.diagram : attributes.diagram;

        this.set('id', attributes.id || _.uniqueId());

        this._initAttributes(attributes);
    },

    // Private

    _initAttributes: function(attributes) {
        var key;
        if (!this.figure && attributes.figure) {
            for (key in attributes.figure) {
                if (!_.contains(escapes, key)) {
                    this.attributes[key] = _.clone(attributes.figure[key]);
                }
            }
            this.figure = _.clone(attributes.figure);
        }

        if (this.figure) {
            for (key in this.figure) {
                if (!_.contains(escapes, key)) {
                    this.attributes[key] = _.clone(this.figure[key]);
                }
            }
        }

        for (var k in attributes) {
            if (_.has(raphaelAttributes, k))  {
                this.attributes[k] = attributes[k];
            }
        }

        if (this.has('width')) {
            this.set('min-width', this.get('width'));
        }
        if (this.has('height')) {
            this.set('min-height', this.get('height'));
        }
    },

    // Public

    render: function() {
        return this;
    },

    remove: function() {
        if (this.wrapper) this.wrapper.remove();
        return this;
    },

    paper: function() {
        if (!this.diagram && this.parent) {
            this.diagram = this.parent.diagram;
        }
        if (!this.diagram) {
            throw new Error('Element must be associated to a diagram');
        }
        return this.diagram.paper();
    },

    set: function(key, value) {
        var attrs;

        if (_.isObject(key)) {
            attrs = key;
        } else {
            (attrs = {})[key] = value;
        }

        if (this.wrapper) {
            if (attrs.type === 'circle') {
                if (attrs.x) attrs.cx = attrs.x;
                if (attrs.y) attrs.cy = attrs.y;
            }
            this.wrapper.attr(attrs);
        }

        for (var attr in attrs) {
            this.attributes[attr] = attrs[attr];
        }

        return this;
    },

    show: function() {
        if (this.wrapper) this.wrapper.show();
        return this;
    },

    hide: function() {
        if (this.wrapper) this.wrapper.hide();
        return this;
    },

    toFront: function() {
        if (this.wrapper) this.wrapper.toFront();
        return this;
    },

    bounds: function() {
        var x = this.get('x'),
            y = this.get('y'),
            w = this.get('width'),
            h = this.get('height');

        return { x: x, y: y, width: w, height: h };
    },

    preferredSize: function() {
        var min = this.minimumSize(),
            w = this.get('width'),
            h = this.get('height');

        if (!w) w = this.parent.get('width');
        if (!h) h = this.parent.get('height');

        if (this.children) {
            var ch = _.reduce(this.children, function(m, n) {
                return m + n.preferredSize().height;
            }, 0);
            if (ch > 0 && ch > h) h = ch;
        }

        if (min.width > w) w = min.width;
        if (min.height > h) h = min.height;

        return { width: w, height: h };
    },

    minimumSize: function() {
        var w = this.has('min-width') ? this.get('min-width') : this.get('width'),
            h = this.has('min-height') ? this.get('min-height') : this.get('height'),
            pms = this.parent ? this.parent.minimumSize() : null;

        if (!w && pms) {
            w = pms.width;
            this.set('min-width', w);
        }
        if (!h && pms) {
            h = pms.height;
            this.set('min-height', h);
        }

        return { width: w, height: h };
    },

    maximumSize: function() {

    },

    doLayout: function() {
        if (!this.layout && this.parent && this.parent.layout) {
            this.layout = { type: this.parent.layout.type };
            this.layout = createLayout(this);
        }
        if (this.layout) {
            this.set(this.layout.size());
            this.layout.layout();
        }
    }
});

function createFigure(shape) {
    var paper = shape.paper(),
        type = shape.get('type'),
        x = 0,
        y = 0,
        wrapper;

    switch(type) {
        case 'rect':
        case 'circle':
        case 'ellipse':
            wrapper = paper[type](x, y);
            break;
        case 'path':
            wrapper = paper.path(shape.get('path'));
            break;
        default:
            wrapper = null;
    }

    if (wrapper) wrapper.controller = shape;

    return wrapper;
}

function isImage(shape) {
    return shape.figure && shape.figure.type === 'image';
}

function isLabel(shape) {
    return shape.figure && shape.figure.type === 'text';
}

function isCompartment(shape) {
    return shape.compartment === true;
}




// Diagram
//
//      var d = new Ds.Diagram('canvas');
//      var d = new Ds.Diagram(document.getElementById('canvas'));
//      var d = new Ds.Diagram('canvas', 1000, 800);
//
//      var D = Diagram.extend({
//          el: 'canvas',
//          width: 1000,
//          height: 800,
//          children: [
//              SomeRootShape,
//              AnotherRootShape
//          ]
//      });
//
//      var d = new D();
//
// The element can be set after the instance of Diagram is created,
// but before the call to render.
//
//      d.setElement('canvas');
//      d.setElement(document.getElementById('canvas'));
//
// This returns the HTMLElement:
//
//      d.el;
//
// Call render will display all shapes and connections of the diagram.
//
//      d.render();

Ds.Diagram = Ds.Element.extend({

    constructor: function(attributes) {
        Ds.Element.apply(this, [attributes]);

        this._selection = null;
        this._currentSource = null;
        this._currentEdge = null;

        this.set('edges', []);

        if (this.el) this.setElement(this.el);

        this.initialize(attributes);
    },

    // Returns the Raphael instance associated to the diagram.
    //

    paper: function() {
        if (!this._paper) {
            this._initPaper();
        }
        return this._paper;
    },

    // Sets the HTML Element that will contain the diagram.
    //
    // The parameter can be a string, or an HTMLElement.

    setElement: function(el) {
        if (!el) return this;

        if (_.isString(el)) {
            var id = el.indexOf('#') === 0 ? el.slice(1, el.length) : el;
            this.el = document.getElementById(id);
        } else if (element instanceof HTMLElement) {
            this.el = el;
        }

        return this;
    },

    // Returns the SVG Element containing the diagram.

    canvas: function() {
        return this._paper ? this._paper.canvas : null;
    },

    // Renders the content of the diagram.

    render: function() {
        // Insures the Raphael object is ready.
        this.paper();

        _.each(this.get('children'), function(child) {
            child.render();
        });

        _.each(this.get('edges'), function(edge) {
            edge.render();
        });

        return this;
    },

    zoom: function(direction) {

    },

    // Clears the content of the diagram.
    //
    // This methods does not remove the content of the diagram,
    // only

    remove: function() {
        if (this._paper) {
            _.each(this.get('children'), function(child) { child.remove(); });
            _.each(this.get('edges'), function(child) { child.remove(); });
            this._paper.remove();
            this._paper = null;
        }
    },

    createShape: function(func, attributes) {
        var shape = null,
            attrs = attributes || {};

        if (!func) {
            throw new Error('Cannot create Shape if Shape constructor is missing.');
        }

        attrs.diagram = this;
        shape = new func(attrs);

        return shape;
    },

    removeShape: function(shape) {
        if (!shape) return;

        var children = this.get('children');
        this.set('children', _.reject(children, function(child) {
            return child === shape;
        }));
        this.trigger('remove:children', shape);
    },

    getShape: function(id) {
        if (!id) return null;

        var shape = _.find(this.get('children'), function(child) {
            return child.get('id') === id;
        });

        return shape;
    },

    createConnection: function(func, attributes) {
        var connection = null,
            attrs = attributes || {},
            source = attrs.source,
            target = attrs.target;

        if (!source || !target || typeof func !== 'function') return connection;

        attrs.diagram = this;
        connection = new func( attrs );
        connection.connect(source, target);

        connection.on('remove:source remove:target', function(connection) {
            this.removeConnection( connection );
        }, this);

        return connection;
    },

    removeConnection: function(connection) {
        if (!connection) return;

        var edges = this.get('edges');
        this.set('edges', _.reject(edges, function( edge ) {
            return edge === connection;
        }));

        this.trigger('remove:edges', connection);
    },

    getConnection: function(id) {
        if (!id) return null;

        var connection = _.find(this.get('edges'), function(child) {
            var childID = child.get('id');
            if (childID) {
                return childID === id;
            }
        });

        return connection;
    },

    canConnect: function( node ) {
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
    },

    connect: function( node ) {
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
    },

    handleTextInput: function() {
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
    },

    handleEvent: function(e) {
        var position = Point.get(this._paper, e);
        var el = this._paper.getElementsByPoint(position.x, position.y);

        if (el.length === 0 && this._selection) {
            this._selection.deselect();
            delete this._selection;
        }

        if (this.inputText) {
            this.handleTextInput();
        }

        if (el.length === 0 && this.currentEdge) {
            this.currentEdge = null;
        }
    },

    setSelection: function(element) {
        this._selection = element;
    },

    getSelection: function() {
        return this._selection;
    },

    parse: function(data) {

    },

    toJSON: function() {

    },

    click: function(e) {

    },

    mouseover: function(e) {

    },

    // Private methods

    _initPaper: function() {
        if (!this.el) throw new Error('Cannot initialize Raphael Object, Diagram Element is missing, use setElement() before.');

        if (this._paper) return;

        this._paper = Raphael(this.el, this.width, this.height);
        this._paper.setViewBox(0, 0, this._paper.width, this._paper.height);
        this.canvas().addEventListener('click', this);
    },

    _canCreate: function( func ) {
        var child = _.find(this.children, function(c) {
            return c === func;
        });
        return child !== undefined;
    }

});



// ToolBox

var ToolBox = Ds.ToolBox = Ds.DiagramElement.extend({

    constructor: function(attributes) {
        Ds.DiagramElement.apply(this, [attributes]);

        this.element = attributes.element;
        this.diagram = this.element.diagram;
        this.width = 70;
        this.height = 60;
    },

    render: function() {
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
            fill: 'orange',
            'fill-opacity': 0,
            stroke: 'black',
            'stroke-opacity': 0,
            'stroke-width': 2
        }).toBack();

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
    },

    addItem: function(x, y, text, action) {
        var control = this;
        var paper = this.paper();
        var wrapper = paper.path(text);

        wrapper.attr({fill: "#000", stroke: "none"});
        wrapper.attr({cursor: 'pointer'});
        wrapper.translate(x, y);
        wrapper.scale(0.8, 0.8);

        this.get('children').push(wrapper);
        wrapper.mouseover(function(e) {
            control.isOverChild = true;
        });

        wrapper.mouseout(function(e) {
            e.stopPropagation();
            control.isOverChild = false;
        });

        wrapper.click(action);

        return this;
    },

    remove: function() {
        if (this.wrapper) {
            this.wrapper.remove();
            _.each(this.get('children'), function(child) { child.remove(); });
            this.get('children').length = 0;
        }
    },

    handleMouseOver: function() {
        this.controller.isOver = true;
    },

    handleMouseOut: function(e) {
        e.stopPropagation();
    }

});


var Trash = 'M20.826,5.75l0.396,1.188c1.54,0.575,2.589,1.44,2.589,2.626c0,2.405-4.308,3.498-8.312,3.498c-4.003,0-8.311-1.093-8.311-3.498c0-1.272,1.21-2.174,2.938-2.746l0.388-1.165c-2.443,0.648-4.327,1.876-4.327,3.91v2.264c0,1.224,0.685,2.155,1.759,2.845l0.396,9.265c0,1.381,3.274,2.5,7.312,2.5c4.038,0,7.313-1.119,7.313-2.5l0.405-9.493c0.885-0.664,1.438-1.521,1.438-2.617V9.562C24.812,7.625,23.101,6.42,20.826,5.75zM11.093,24.127c-0.476-0.286-1.022-0.846-1.166-1.237c-1.007-2.76-0.73-4.921-0.529-7.509c0.747,0.28,1.58,0.491,2.45,0.642c-0.216,2.658-0.43,4.923,0.003,7.828C11.916,24.278,11.567,24.411,11.093,24.127zM17.219,24.329c-0.019,0.445-0.691,0.856-1.517,0.856c-0.828,0-1.498-0.413-1.517-0.858c-0.126-2.996-0.032-5.322,0.068-8.039c0.418,0.022,0.835,0.037,1.246,0.037c0.543,0,1.097-0.02,1.651-0.059C17.251,18.994,17.346,21.325,17.219,24.329zM21.476,22.892c-0.143,0.392-0.69,0.95-1.165,1.235c-0.474,0.284-0.817,0.151-0.754-0.276c0.437-2.93,0.214-5.209-0.005-7.897c0.881-0.174,1.708-0.417,2.44-0.731C22.194,17.883,22.503,20.076,21.476,22.892zM11.338,9.512c0.525,0.173,1.092-0.109,1.268-0.633h-0.002l0.771-2.316h4.56l0.771,2.316c0.14,0.419,0.53,0.685,0.949,0.685c0.104,0,0.211-0.017,0.316-0.052c0.524-0.175,0.808-0.742,0.633-1.265l-1.002-3.001c-0.136-0.407-0.518-0.683-0.945-0.683h-6.002c-0.428,0-0.812,0.275-0.948,0.683l-1,2.999C10.532,8.77,10.815,9.337,11.338,9.512z';

var Gear = 'M26.834,14.693c1.816-2.088,2.181-4.938,1.193-7.334l-3.646,4.252l-3.594-0.699L19.596,7.45l3.637-4.242c-2.502-0.63-5.258,0.13-7.066,2.21c-1.907,2.193-2.219,5.229-1.039,7.693L5.624,24.04c-1.011,1.162-0.888,2.924,0.274,3.935c1.162,1.01,2.924,0.888,3.935-0.274l9.493-10.918C21.939,17.625,24.918,16.896,26.834,14.693z';



//
// Layout
//

var Layout = function(shape, attributes) {
    this.shape = shape;
    this.type = attributes.type;
};
Layout.extend = extend;

Layout.prototype = {
    layout: function() {}
};

function createLayout(shape) {
    var layout = shape.layout,
        type = layout ? layout.type : null;

    return (function() {
        switch (type) {
            case 'xy':
                return new XYLayout(shape, layout);
            case 'flow':
                return new FlowLayout(shape, layout);
            case 'grid':
                return new GridLayout(shape, layout);
            case 'flex':
                return new FlexGridLayout(shape, layout);
            default:
                return null;
        }
    })();
}

//
// GridLayout
//

var GridLayout = Layout.extend({

    constructor: function(shape, attributes) {
        if (!attributes) attributes = {};
        Layout.apply(this, [shape, attributes]);

        this.columns = attributes.columns;
        this.rows = attributes.rows || 0;
        this.vertical = attributes.vertical || false;
    },

    layout: function() {
        if (!this.shape.children) return;

        var elements = this.shape.children,
            bounds = this.shape.bounds(),
            rows = this.rows,
            columns = this.columns || elements.length,
            x = bounds.x,
            y = bounds.y,
            width,
            height;

        if (rows > 0) {
            columns = Math.floor((elements.length + rows - 1) / rows);
        } else {
            rows = Math.floor((elements.length + columns - 1) / columns);
        }

        width = (bounds.width - (columns - 1)) / columns;
        height = (bounds.height - (rows - 1)) / rows;

        for (var i = 0, j = 1; i < elements.length; i++, j++) {
            elements[i].set({ x: x, y: y, width: width, height: height });

            if (j >= rows) {
                x += width;
            } else {
                y += height;
            }
            elements[i].doLayout();
        }
    },

    size: function() {
        return this.shape.bounds();
    }

});


//
// FlexGrid
//

var FlexGridLayout = Layout.extend({

    constructor: function(shape, attributes) {
        if (!attributes) attributes = {};
        Layout.apply(this, [shape, attributes]);
        this.columns = attributes.columns || 1;
        this.rows = attributes.rows || 0;
        this.vertical = attributes.vertical || false;
        this.stretch = attributes.stretch;
    },

    layout: function() {
        if (!this.shape.children || !this.shape.children.length) return;

        var i = 0, c = 0, r = 0,
            elements = this.shape.children,
            rows = this.rows,
            columns = this.columns, // || elements.length,
            pd = this.shape.preferredSize(),
//            sw = 1,//this.shape.bounds().width / pd.width,
//            sh = 1,//this.shape.bounds().height / pd.height,
            bounds = this.shape.bounds(),
            x = bounds.x,
            y = bounds.y,
            d;

        if (rows > 0) {
            columns = Math.floor((elements.length + rows - 1) / rows);
        } else {
            rows = Math.floor((elements.length + columns - 1) / columns);
        }

        var w = zeros([], columns),
            h = zeros([], rows);

        for (; i < elements.length; i++) {
            r = Math.floor(i / columns);
            c = i % columns;
            d = elements[i].preferredSize();
//            d.width = sw * d.width;
//            d.height = sh * d.height;

            //if (w[c] < d.width)
            if (this.stretch)
                w[c] = pd.width; // stretch on x
            else
                w[c] = d.width;

            var ch, lh;
            // if last stretch on y
            if (this.stretch && i == elements.length - 1) {
                ch = _.reduce(h, function(m, n){ return m + n; }, 0);
                lh = bounds.height - ch;
                if (lh > 0) h[r] = lh;
            } else {
                if (h[r] < d.height) h[r] = d.height;
            }
        }

        for (; c < columns; c++) {
            for (r = 0, y = bounds.y; r < rows; r++) {
                i = r * columns + c;
                if (i < elements.length) {
                    console.log(elements[i], x, y);
                    elements[i].set({ x: x, y: y, width: w[c], height: h[r] });
                    elements[i].doLayout();
                }
                y += h[r];
            }
            x += w[c];
        }
    },

    size: function() {
        var shape = this.shape,
            elements = shape.children,
            bounds = shape.bounds(),
            i = 0, r = 0, c = 0, nw = 0, nh = 0,
            columns = this.columns,
            rows = this.rows,
            elSize, w, h;

        if (rows > 0) {
            columns = Math.floor((elements.length + rows - 1) / rows);
        } else {
            rows = Math.floor((elements.length + columns - 1) / columns);
        }

        w = zeros([], columns),
        h = zeros([], rows);

        for (i = 0; i < elements.length; i++) {
            r = Math.floor(i / columns);
            c = i % columns;
            elSize = elements[i].minimumSize();
            if (w[c] < elSize.width) {
                w[c] = elSize.width;
            }
            if (h[r] < elSize.height) {
                h[r] = elSize.height;
            }
        }
        for (i = 0; i < columns; i++) {
            nw += w[i];
        }
        for (i = 0; i < rows; i++) {
            nh += h[i];
        }
        if (bounds.width > nw) nw = bounds.width;
        if (bounds.height > nh) nh = bounds.height;
        return { width: nw, height: nh };
    }

});

var zeros = function(a, l) {
    var i = 0;
    for (; i < l; i++) {
        a[i] = 0;
    }
    return a;
};


//
// FlowLayout
//

var FlowLayout = Layout.extend({

    constructor: function(shape, attributes) {
        if (!attributes) attributes = {};
        Layout.apply(this, [shape, attributes]);
        this.vertical = attributes.vertical;
    },

    layout: function() {
        var offset = { x: this.shape.get('x'), y: this.shape.get('y') },
            bounds = this.shape.bounds(),
            elements = this.shape.children,
            elementSize,
            currentRow = [],
            rowSize = { width: 0, height: 0 };

        var align = function(row, off, eSize, pSize) {
            var position = { x: off.x, y: off.y },
                i = 0,
                length = row.length;

            position.x += (pSize.width - rowSize.width) / 2;

            for (; i<length; i++) {
                position.y = off.y;
                row[i].set(position);
                row[i].doLayout();
                position.x += row[i].bounds().width;
            }
        };

        _.each(elements, function(e) {
            elementSize = e.preferredSize();

            if ((rowSize.width + elementSize.width) > bounds.width) {
                align(currentRow, rowSize, bounds);
                currentRow = [];
                // new column
                offset.y += elementSize.height;
                rowSize.width = 0;
                rowSize.height = 0;
            }

            rowSize.height = Math.max(rowSize.height, elementSize.height);
            rowSize.width += elementSize.width;
            e.set(elementSize);
            currentRow.push(e);
        });

        align(currentRow, offset, elementSize, bounds);
        console.log(size('preferred')(this.shape));
    },

    size: function() {
        var bounds = shape.bounds(),
        i = 0,
        width = 0,
        height = 0,
        first = false,
        tSize;

        for (; i < elements.length; i++) {
            tSize = elements[i][type+'Size']();
            height = Math.max(height, tSize.height);
            width += tSize.width;
        }

        return { width: width + (elements.length - 1), height: height };
    }

});


//
// XYLayout
//

var XYLayout = Layout.extend({

    constructor: function(shape, attributes) {
        if (!attributes) attributes = {};
        Layout.apply(this, [shape, attributes]);
    },

    layout: function() {
        var shape = this.shape,
            bounds = shape.wrapper.getABox(),
            elements = shape.children,
            l = elements.length, i = 0, el;

        for (; i < l ; i++) {
            el = elements[i];
            el.wrapper.translate(bounds.x, bounds.y);
            el.doLayout();
        }
    },

    size: function() {
        return this.shape.bounds();
    }

});



Ds.Selectable = {

    select: function() {
        var current = this.diagram.getSelection();
        if (current) {
            current.deselect();
        }

        this.diagram.setSelection(this);

        if (this.wrapper) {
            var bbox = this.wrapper.getABox();

            this.selectionAnchors = [];

            var anchorRT = new NorthEastAnchor({ box: this }),
                anchorLT = new NorthWestAnchor({ box: this }),
                anchorLB = new SouthWestAnchor({ box: this }),
                anchorRB = new SouthEastAnchor({ box: this });

            var x = anchorLT.get('x') + 3,
                y = anchorLT.get('y') + 3,
                width = anchorRT.get('x') + 3 - x,
                height = anchorLB.get('y') + 3 - y;

            this.selectionBox = this.paper().rect(x, y, width, height, 0);
            this.selectionBox.attr({ stroke: 'orange', 'stroke-width': 1, 'stroke-dasharray': '--'});
            this.selectionBox.toFront();

            if (this.resizable) {
                anchorRT.render().resizable();
                anchorLT.render().resizable();
                anchorRB.render().resizable();
                anchorLB.render().resizable();
            }

            this.selectionAnchors.push(anchorLT);
            this.selectionAnchors.push(anchorRT);
            this.selectionAnchors.push(anchorLB);
            this.selectionAnchors.push(anchorRB);
        }
    },

    deselect: function() {
        if (this._tool) {
            this._tool.remove();
        }
        if (this.selectionAnchors) {
            _.each(this.selectionAnchors, function( anchor ) { anchor.remove(); });
        }
        if (this.selectionBox) {
            this.selectionBox.remove();
        }
    }
};



// Anchor
//

var Anchor = Ds.Anchor = Ds.DiagramElement.extend({
    cursor: 'none',

    constructor: function(attributes) {
        Ds.DiagramElement.apply(this, [attributes]);

        this.box = attributes.box;
        this.diagram = this.box.diagram;

        this.initialize.apply(this, arguments);
    },

    initialize: function(attributes) {},

    render: function() {
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
    },

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

    var control = this.box.controller,
        min, r;

    if (control) {
        min = control.minimumSize();
        r = control.wrapper.rdxy(dx, dy, this.anchor.direction);

        if (r.width < min.width) r.width = min.width;
        if (r.height < min.height) r.height = min.height;

        control.set(r);
        control._renderEdges();
    }
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

var LabelImage = Ds.Image = Ds.DiagramElement.extend({

    constructor: function(attributes) {
        Ds.DiagramElement.apply(this, [attributes]);
    },

    render: function() {
        var paper = this.paper(),
            bBox = this.parent.wrapper.getBBox(),
            src = this.get('src'),
            width = this.get('width'),
            height = this.get('height');

        this.wrapper = paper.image(src, bBox.x, bBox.y, width, height);
        this.wrapper.toFront();
        this.wrapper.controller = this;

        return this;
    },

    center: function() {
        var ntbb = this.parent.wrapper.getABox();
        this.wrapper.attr({ x: ntbb.x - this.get('width') });
        this.wrapper.attr({ y: ntbb.yMiddle - (this.get('height') / 2) });
    }

});



// Label
//

var Label = Ds.Label = Ds.DiagramElement.extend({

    constructor: function(attributes) {
        Ds.DiagramElement.apply(this, [attributes]);

//        var attrs = this.figure ? this : attributes;

        this._positions = [
            'top-left', 'top-right', 'top-center',
            'bottom-left', 'bottom-right', 'bottom-center',
            'center-left', 'center-right', 'center'
        ];

        this.position = this.getPosition(attributes);
        this.resizable = attributes.resizable || false;
        this.draggable = attributes.draggable || false;
        this.editable = attributes.editable || true;

        this.xOffset = 5;
        this.yOffset = 5;

        var image = this.figure ? this.figure.image : attributes.figure.image;
        if (image) {
            this.setImage(image);
        }
        this.set('position', this.getPosition());
    },

    getPosition: function(properties)  {
        var position = this.figure.position || 'center';

        if (properties && properties.position) {
            position = properties.position;

            if (position.x && position.y) {
                return position;
            } else if (_.include(this._positions, position)) {
                return position;
            }
        }

        return position; // default
    },

    // Should be only one image.
    setImage: function( attributes ) {
        attributes.parent = this;
        var image = new Ds.Image( attributes );
        this.image = image;
        return image;
    },

    render: function() {
        if (this.wrapper) this.remove();

        var paper = this.paper(),
            bBox = this.parent.wrapper.getABox();

        this.wrapper = paper.rect().attr({ fill: 'none', stroke: 'blue' });
        this.label = paper.text(0, 0, this.get('text')).attr({
            fill: 'black',
            'font-size': 12
        });

        this.wrapper.toFront();
        this.label.toFront();
        this.wrapper.controller = this;
        this.doLayout();

        if (this.image) this.image.render();
        if (this.editable) this.asEditable();

        return this;
    },

    center: function() {
        var box = this.wrapper.getABox(),
            label = this.label;

        switch (this.position) {
            case 'center':
                label.attr('x', box.xCenter);
                label.attr('y', box.yMiddle);
                break;
            case 'center-left':
                label.attr('x', box.x + this.xOffset + (box.width / 2));
                label.attr('y', box.yMiddle);
                if (this.image) {
                    var x = this.get('x');
                    this.attr({ x: x + this.image.get('width') });
                }
                break;
            case 'center-right':
                label.attr('x', box.xRight - this.xOffset - (box.width / 2));
                label.attr('y', box.yMiddle);
                break;
            case 'top-center':
                label.attr('x', box.xCenter);
                label.attr('y', box.y + (box.height / 2) + this.yOffset);
                break;
            case 'top-left':
                label.attr('x', box.x + (box.width / 2) + this.xOffset);
                label.attr('y', box.y + (box.height / 2) + this.yOffset);
                break;
            case 'top-right':
                label.attr('x', box.xRight - this.xOffset - (box.width / 2));
                label.attr('y', box.y + (box.height / 2) + this.yOffset);
                break;
            case 'bottom-center':
                label.attr('x', box.xCenter);
                label.attr('y', box.yBottom - (box.height / 2) - this.yOffset);
                break;
            case 'bottom-left':
                label.attr('x', box.x + this.xOffset + (box.width / 2));
                label.attr('y', box.yBottom - (box.height / 2) - this.yOffset);
                break;
            case 'bottom-right':
                label.attr('x', box.x - this.xOffset - (box.width / 2));
                label.attr('y', box.yBottom - (box.height / 2) - this.yOffset);
                break;
            default:
                break;
        }

        if (this.image) {
            var lbox = this.label.getABox();
            this.image.set({ x: lbox.x - this.image.get('width')});
            this.image.set({ y: lbox.y });
        }
    },

    setText: function( text ) {
        this.set('text', text);

        if (this.wrapper && this.label) {
            this.label.attr('text', text);
            this.center();
        }

        this.trigger('change:text', this);
    },

    getText: function() {
        return this.get('text');
    },

    remove: function() {
        console.log('remove label');
        if (this.image) {
            this.image.remove();
        }
        if (this.label) {
            this.label.remove();
        }
        if (this.wrapper) {
            this.wrapper.remove();
        }
    },

    doLayout: function() {
        this.center();
    },

    asEditable: function() {
        var node = this;

        if (!node.label) return;

        var createInputTextForm = function( node ) {
            var aBox = node.label.getABox(),
                pBox = node.wrapper.getABox(),
                px = node.diagram.el.offsetLeft,
                py = node.diagram.el.offsetTop,
                x = aBox.x + (isNaN(px) ? 0 : px),
                y = aBox.y + (isNaN(py) ? 0 : py),
                w = pBox.width,
                h = aBox.height + 4;

            var txt = node.textForm = document.createElement('form');
            txt.setAttribute('style', 'position: absolute; left: ' + x + 'px; top: ' + y + 'px;');

            var inputForm = document.createElement('input');
            inputForm.setAttribute('type', 'text');
            inputForm.value = node.get('text');
            inputForm.setAttribute('style', 'padding: 0; width:' + w + 'px; height: ' + h + 'px; z-index: 1;');
            txt.appendChild(inputForm);

            return { form: txt, input: inputForm };
        };

        var remove = function( node ) {
            if (node && node.parentNode) {
                node.parentNode.removeChild( node );
            }
        };

        node.label.dblclick(function(event) {
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

            node.diagram.el.parentNode.appendChild(el.form);
        });
    }

});

_.extend(Ds.Label.prototype, Ds.Draggable, Ds.Events);



// Shape
//
//
//  var BasicShape = Ds.Shape.extend({
//      figure: {
//          type: 'rect',
//          width: 100,
//          height: 100,
//          fill: 'yellow'
//      },
//      layout: {
//          type: 'flow',
//          vertical: true
//      },
//      children: [{
//          figure: {
//              type: 'text',
//              text: 'Label'
//          }
//      }]
//  });

var Shape = Ds.Shape = Ds.DiagramElement.extend({
    // default settings.
    connectable: true,
    shadow: false,
    resizable: true,
    draggable: true,
    toolbox: true,

    constructor: function(attributes) {
        Ds.DiagramElement.apply(this, [attributes]);

        this.ins = [];
        this.outs = [];

        if (attributes.draggable != null)
            this.draggable = attributes.draggable;
        if (attributes.resizable != null)
            this.resizable = attributes.resizable;
        if (attributes.toolbox != null)
            this.toolbox = attributes.toolbox;


        if (attributes.children) {
            this.children = attributes.children;
        }

        if (this.diagram && !this.parent) {
            this.diagram.get('children').push(this);
            this.diagram.trigger('add:children', this);
        }

        this._initChildren();
        this._initLayout();

        if (this.toolbox) {
            this._tool = new ToolBox({ element: this });
        }

        this.initialize.apply(this, arguments);
    },

    render: function() {
        if (this.wrapper) this.remove(false);

        this.wrapper = createFigure(this);

        if (!this.wrapper) throw new Error('Cannot render this shape: ', this);

        this.set(this.attributes);
        this._renderContent();

        if (this.draggable) this.asDraggable();

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
        this.deselect();

        if (this.wrapper) {
            this.wrapper.remove();
            delete this.wrapper;
        }

        _.each(this.children, function(c) { c.remove(); });
        _.each(this.ins, function(e) { e.remove(fromDiagram); });
        _.each(this.outs, function(e) { e.remove(fromDiagram); });

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

    disconnect: function(connection, direction) {
        if (connection && direction && (direction === 'in' || direction === 'out'))
            this[direction+'s'] = _.without(this[direction+'s'], connection);
        else if (connection) {
            this.ins = _.without(this.ins, connection);
            this.outs = _.without(this.outs, connection);
        }
        return this;
    },

    move: function(x, y) {
        this.startmove();
        this.set({ x: x, y: y, cx: x, cy: y });
        this.endmove();
        return this;
    },

    startmove: function() {
        this.deselect();
        this._removeContent();

        if (this.wrapper) {
            var wrapper = this.wrapper,
                attrs = _.clone(wrapper.attrs),
                type = wrapper.type;

            wrapper.o();
            wrapper.attr({ fill: 'grey', 'fill-opacity': 0.2, 'stroke-width': 0 });
            this.wrapper.unmouseover(this.mouseover);
            this.wrapper.unmouseout(this.mouseout);
        }
        if (this.shadow) this.shadowWrapper.remove();
    },

    endmove: function() {
        this._renderContent();
        if (this.wrapper) {
            this.wrapper.reset();
            this.wrapper.mouseover(this.mouseover);
            this.wrapper.mouseout(this.mouseout);
        }
        if (this.shadow) this.createShadow();
    },

    startresize: function() {
        if (!this.wrapper) return;
        if (this._tool) this._tool.remove();
        this.wrapper.o();
        this._removeContent();
        this.wrapper.attr({ fill: 'grey', 'fill-opacity': 0.2, 'stroke-width': 0 });
    },

    resize: function(dx, dy, direction) {
        if (!this.resizable) return this;

        this.deselect();
        this.startresize();
        this.set({ width: this.wrapper.ow + dx, height: this.wrapper.oh + dy });
        this.endresize();

        return this;
    },

    endresize: function() {
        this.wrapper.reset();
        this._renderEdges();
        this._renderContent();
    },

    asDraggable: function( options ) {
        if (this.wrapper) {
            this.wrapper.attr({ cursor: 'move' });
        }

        this.wrapper.drag(move, start, end);

        return this;
    },

    add: function(shape) {
        shape.diagram = this.diagram;
        shape.parent = this;
        this.children.push(shape);
        return this;
    },

    toJSON: function() {
        return _.clone(this.attributes);
    },

    // Private

    _initLayout: function() {
        this.layout = createLayout(this);
    },

    _initChildren: function() {
        var children = this.children,
            shape;

        this.children = [];

        _.each(children, function(child) {
            if (isLabel(child)) {
                shape = new Label(child);
            } else if (isImage(child)) {
                shape = new Ds.Image(child);
            } else if (isCompartment(child)) {
                shape = new Compartment(child);
            } else {
                shape = new Shape(child);
            }
            this.add(shape);
        }, this);
    },

    _removeContent: function() {
        _.each(this.children, function(c) { c.remove(); });
    },

    _renderContent: function() {
        _.each(this.children, function(c) {
            c.render();
        });
        if (!this.parent) this.doLayout();
    },

    _renderEdges: function() {
        _.each(this.ins, function(i) { i.render(); });
        _.each(this.outs, function(o) { o.render(); });
    }

});

_.extend(Ds.Shape.prototype, Ds.Selectable, Ds.Events);

// Dragging functions

function start() {
    this.controller.startmove();
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
    var control = this.controller;

    if (control) {
         // store new coordinates
        control.set({ x: this.x(), y: this.y() });
        control.endmove();
    }
}



// Compartment
//

var Compartment = Ds.Compartment = Ds.Shape.extend({

    resizable: false,
    draggable: false,
    layout: 'fixed', // horizontal, vertical
    spacing: 5,

    constructor: function(attributes) {
        Ds.Shape.apply(this, [attributes]);

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
            shape, x, y;

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

        shape = new func(attrs);
        if (shape) this.children.push(shape);

        var newHeight = this._height(),
            oldHeight = this.get('height');

        if (newHeight > oldHeight) {
            this.set('height', newHeight);
        }

        var h = this.wrapper.attr('height');
        console.log('height', h, attrs.y, shape.get('height'), this._height());

        this.doLayout();

        return shape;
    },

    _width: function() {
        var child = this.children,
            width = 0;

        _.each(child, function(c) {
            if (c.wrapper) {
                width += c.wrapper.attr('width');
            } else {
                width += c.get('width');
            }
        });

        return width;
    },

    _height: function() {
        var child = this.children,
            height = 0;

        _.each(child, function(c) {
            if (c.wrapper) {
                height += c.wrapper.attr('height');
            } else {
                height += c.get('height');
            }
        });

        return height;
    }

});



// Connection Anchor
//

var ConnectionAnchor = Ds.ConnectionAnchor = Ds.DiagramElement.extend({

    constructor: function(attributes) {
        Ds.DiagramElement.apply(this, [attributes]);

        this.connection = attributes.connection;
        this.diagram = this.connection.diagram;
    },

    move: function(point) {
        this.x = point.x;
        this.y = point.y;
        if (this.wrapper) {
            this.wrapper.attr({ x: this.x - 2, y: this.y - 2 });
        }
        return this;
    },

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

    toJSON: function() {
        this.set('x', this.wrapper.x());
        this.set('y', this.wrapper.y());

        return this._deepClone(this.attributes);
    }

});



// ConnectionEnd
//
//  end: {
//      type: 'basic',
//      label: {
//          text: '[]'
//      }
//
// }

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


// ConnectionLabel
//
//  label: {
//      text: '[]'
//  }

var ConnectionLabel = Ds.ConnectionLabel = Ds.DiagramElement.extend({

    constructor: function(attributes) {
        Ds.DiagramElement.apply(this, [attributes]);

        if (!attributes.connection) {
            throw new Error('ConnectionLabel must have a parent Connection');
        }

        this.connection = attributes.connection;
        this.diagram = this.connection.diagram;
        this.position = attributes.position;

        this.set('text', attributes.text);

    },

    remove: function() {
        if (this.wrapper) {
            this.wrapper.remove();
        }
    },

    render: function() {
        this.remove();
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
        }

        this.wrapper.transform(['t', position.x, ',', position.y].join('') );

        this.asEditable().asDraggable();

        return this;
    },

    setText: function(text) {
        this.set('text', text);
        if (this.wrapper) {
            this.wrapper.attr('text', text);
        }
    },

    asDraggable: function() {
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
    },

    asEditable: function() {
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
                form: txt, input: inputForm
            };
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
    }

});



// Connection

var Connection = Ds.Connection = Ds.DiagramElement.extend({
    toolbox: true,

    constructor: function(attributes) {
        Ds.DiagramElement.apply(this, [attributes]);

        this.set('sourceAnchor', new ConnectionAnchor({ connection: this }));
        this.set('targetAnchor', new ConnectionAnchor({ connection: this }));
        this.vertices = [];

        if (this.toolbox) this._tool = new ToolBox({ element: this });

        if (this.diagram) {
            this.diagram.get('edges').push(this);
            this.diagram.trigger('add:edges', this);
        }

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
        this.wrapper.attr(this.attributes);
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

        src.outs.push(this);
        tgt.ins.push(this);

        return this;
    },

    disconnect: function() {
        var source = this.get('source');
        var target = this.get('target');

        if (source) source.disconnect(this, 'out');
        if (target) target.disconnect(this, 'in');

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

_.extend(Ds.Connection.prototype, Ds.Events);

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

//    this.wrapper.dblclick(this.remove);

    return this;
};

FlexPoint.prototype.remove = function() {
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
var Palette = Ds.Palette = function( diagram ) {
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

    this.diagram.el.appendChild( this.element );

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
                diagram.el.addEventListener('click', create, false);
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
            found = _.find(control.children, function(c) {
                return canCreate(c, tool) !== undefined;
            });
        }
        return found;
    }

    function create(e) {
        var tool = me.palette.currentItem,
            position, node;

        if (tool) {
            position = Point.get(diagram._paper, e);
            if (typeof tool.shape === 'function') {
                if (diagram._canCreate(me.palette.currentItem.shape)) {
                    node = diagram.createShape(tool.shape, position);
                    if (node) {
                        node.render();
                        me.palette.currentItem.trigger('created');
                    }
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
                            console.log('control', control);
                            found = canCreate(control, tool.shape);
                            i++;
                        }

                        if (found) {
                            node = new tool.shape(position);
                            if (node) {
                                found.add(node);
                                found._renderContent();
                                found.doLayout();
                                me.palette.currentItem.trigger('created');
                            }
                        }
                    }
                }
            }

        }

        diagram.el.removeEventListener('click', create, false);
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

var PropertyBox = Ds.PropertyBox = function( attributes ) {
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

Ds.ToolBox.propertyBox = PropertyBox;



})(window);
