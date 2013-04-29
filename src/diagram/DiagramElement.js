/**
 * @name DiagramElement
 * @class Element that is part of a Diagram (Shape, Connection).
 * A DiagramElement is defined by a figure and is identified by a unique id.
 * @augments Element
 *
 */

var DiagramElement = Ds.DiagramElement = Ds.Element.extend(/** @lends DiagramElement.prototype */ {

    constructor: function(attributes) {
        if (!attributes) attributes = {};
        Ds.Element.apply(this, [attributes]);

        this.id = attributes.id || _.uniqueId();
        this.attributes.children = [];
        this.setFigure(attributes.figure || this.figure);
        this.set(attributes);
    },

    setFigure: function(figure) {
        if (figure instanceof Figure)
            this.figure = figure;
        else
            this.figure = Figure.create(this, figure);
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
        if (this.figure) this.figure.remove();
        return this;
    },

    /**
     * Returns the Raphael instance for this DiagramElement
     */

    renderer: function() {
        var diagram = this.diagram;
        if (diagram)
            return diagram.renderer();
        else if (this.parent)
            return this.parent.renderer();
        else return null;
    },

    get: function(key) {
        if (this.figure && _.has(this.figure.defaults, key)) {
            return this.figure.get(key);
        }
        return Element.prototype.get.apply(this, arguments);
    },

    /**
     * Setter method
     *
     * @param {string} key
     * @param {object} value
     */

    set: function(key, value) {
        var attrs;

        if (_.isObject(key))
            attrs = key;
        else (attrs = {})[key] = value;

        for (var attr in attrs) {
            if (this.figure && _.has(this.figure.defaults || {}, attr)) {
                this.figure.set(attr, attrs[attr]);
            } else {
                this.attributes[attr] = attrs[attr];
            }
        }

        return this;
    },

    /**
     * Add a child Shape
     *
     * @param Shape
     */

    add: function(shape) {
        shape.setParent(this);
        this.get('children').push(shape);
        this.trigger('add:children', shape);
        return this;
    },

    /**
     * @private
     */

    setUpChildren: function(children) {
        var createShape = function(child) {
            if (isLabel(child)) {
                this.add(new Label(child));
            } else if (typeof child === 'function') {
                this.add(new child());
            } else if (typeof child === 'object') {
                this.add(new Shape(child));
            }
        };

        _.each(children, createShape, this);
    },

    /**
     * @private
     */

    setParent: function(parentShape) {
        this.parent = parentShape;
        this.setDiagram(parentShape.diagram);
        return this;
    },

    /**
     * @param {Diagram}
     */

    setDiagram: function(diagram) {
        this.diagram = diagram;
        _.each(this.get('children'), function(c) { c.setDiagram(diagram); });
    },

    /**
     * Show the DiagramElement if previously hidden
     */

    show: function() {
        if (this.figure) this.figure.show();
        return this;
    },

    /**
     * Hide the DiagramElement
     */

    hide: function() {
        if (this.figure) this.figure.hide();
        return this;
    },

    /**
     * Bring the DiagramElement on top of other elements
     */

    toFront: function() {
        if (this.figure) this.figure.toFront();
        _.each(this.get('children'), function(child) { child.toFront(); });
        return this;
    },

    /**
     * Bring the DiagramElement behind other elements
     */

    toBack: function() {
        _.each(this.get('children'), function(child) { child.toBack(); });
        if (this.figure)
            this.figure.toBack();
        return this;
    },

    /**
     * Returns true if the point is inside
     * the DiagramElement's bounds.
     *
     * @param {Point}
     */

    isPointInside: function(point) {
        if (!this.figure)
            return false;
        else return this.figure.isPointInside(point);
    },

    getByPoint: function(point) {
        var result = [];
        if (this.isPointInside(point)) {
            result.push(this);
            result.push(_.map(this.get('children'), function(c) {
                return c.getByPoint(point);
            }));
        }
        return result;
    }

});

function isImage(shape) {
    return shape.figure && shape.figure.type === 'image';
}

function isLabel(shape) {
    return shape.figure && shape.figure.type === 'text';
}

function isCompartment(shape) {
    return shape.compartment === true;
}

