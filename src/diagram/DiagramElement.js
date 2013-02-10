/**
 * @name DiagramElement
 * @class Element that is part of a Diagram (Shape, Connection).
 * A DiagramElement is defined by a figure and is identified by a unique id.
 * @augments Element
 *
 */

var DiagramElement = Ds.DiagramElement = Ds.Element.extend(/** @lends DiagramElement.prototype */ {

    constructor: function(attributes) {
        Ds.Element.apply(this, [attributes]);

        this.parent = attributes.parent || undefined;
        this.diagram = this.parent ? this.parent.diagram : attributes.diagram;

        this.set('id', attributes.id || _.uniqueId());

        this._initAttributes(attributes);
    },

    /**
     * @private
     */

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

    /**
     * Renders the element on the canvas.
     */

    render: function() {
        return this;
    },

    /**
     * Removes the element from the canvas.
     */

    remove: function() {
        if (this.wrapper) this.wrapper.remove();
        return this;
    },

    /**
     * Returns the Raphael instance for this DiagramElement
     */

    paper: function() {
        if (!this.diagram && this.parent) {
            this.diagram = this.parent.diagram;
        }
        if (!this.diagram) {
            throw new Error('Element must be associated to a diagram');
        }
        return this.diagram.paper();
    },

    /**
     * Setter method
     *
     * @param {string} key
     * @param {object} value
     */

    set: function(key, value) {
        var attrs;

        if (_.isObject(key)) {
            attrs = key;
        } else {
            (attrs = {})[key] = value;
        }

        if (this.wrapper) {
            if (this.wrapper.type === 'circle') {
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

    setParent: function(parentShape) {
        this.parent = parentShape;
        if (!this.diagram) {
            this.diagram = parentShape.diagram;
        }
        return this;
    },

    /**
     * Show the DiagramElement if previously hidden
     */

    show: function() {
        if (this.wrapper) this.wrapper.show();
        return this;
    },

    /**
     * Hide the DiagramElement
     */

    hide: function() {
        if (this.wrapper) this.wrapper.hide();
        return this;
    },

    /**
     * Bring the DiagramElement on top of other elements
     */

    toFront: function() {
        if (this.wrapper) this.wrapper.toFront();
        return this;
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

