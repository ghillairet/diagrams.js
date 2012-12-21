
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


