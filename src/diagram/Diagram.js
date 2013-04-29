
/**
 *  Diagram.
 *
 *  @name Diagram
 *
 *  @class Represents a Diagram
 *
 *  @example
 *
 *  // Creates a new diagram
 *  var d = new Ds.Diagram('canvas');
 *  var d = new Ds.Diagram(document.getElementById('canvas'));
 *  var d = new Ds.Diagram('canvas', 1000, 800);
 *
 *  var D = Diagram.extend({
 *      el: 'canvas',
 *      width: 1000,
 *      height: 800,
 *      children: [
 *          SomeRootShape,
 *          AnotherRootShape
 *      ]
 *  });
 *
 *  var d = new D();
 *
 * The element can be set after the instance of Diagram is created,
 * but before the call to render.
 *
 *  d.setElement('canvas');
 *  d.setElement(document.getElementById('canvas'));
 *
 * This returns the HTMLElement:
 *
 *  d.el;
 *
 * Call render will display all shapes and connections of the diagram.
 *
 *  d.render();
 *
 */

Ds.Diagram = Ds.DiagramElement.extend(/** @lends Diagram.prototype */ {

    constructor: function(attributes) {
        if (!attributes) attributes = {};
        Ds.DiagramElement.apply(this, [attributes]);

        this.attributes.selection = [];
        this.attributes.currentSource = null;
        this.attributes.currentEdge = null;
        this.attributes.isSelecting = false;
        this.attributes.isDragging = false;
        this.attributes.children = [];
        this.attributes.edges = [];

        if (attributes.el) this.el = attributes.el;
        if (this.el) this.setElement(this.el);

        this.setFigure(this.figure);
        this.initialize(attributes);
    },

    figure: {
        type: 'rect',
        fill: 'white',
        'opacity': 0,
        'stroke': 'none'
    },

    /**
     * Returns the current Raphael object.
     *
     * @name paper
     * @function
     * @memberOf Ds.Diagram
     * @returns {Raphael}
     */

    renderer: function() {
        if (!this._paper) this._initPaper();
        return this._paper;
    },

    /**
     * Sets the HTML Element that will contain the diagram.
     * The parameter can be a string, or an HTMLElement.
     *
     * @name setElement
     * @param {HTMLElement}
     * @param {String}
     */

    setElement: function(el) {
        if (!el) return this;

        if (_.isString(el)) {
            var id = el.indexOf('#') === 0 ? el.slice(1, el.length) : el;
            this.el = document.getElementById(id);
        } else if (el instanceof HTMLElement) {
            this.el = el;
        }

        return this;
    },

    /**
     * Returns the SVG Element containing the diagram.
     *
     * @name canvas
     * @return {SVGObject} canvas
     */

    canvas: function() {
        return this._paper ? this._paper.canvas : null;
    },

    /**
     * Renders the content of the diagram.
     *
     */

    render: function() {
        var paper = this.renderer();
        var canvas = paper.canvas;
        var x = canvas.clientLeft;
        var y = canvas.clientTop;
        var width = canvas.width.baseVal.value;
        var height = canvas.height.baseVal.value;

        this.set({ x: x, y: y, width: width, height: height });
        this.figure.render();

        _.each(this.attributes.children, function(child) { child.render(); });
        _.each(this.attributes.edges, function(edge) { edge.render(); });

        this.on('touchstart mousedown', this.changeViewBox);
        this.on('touchstart mousedown', this.selectGroup);
        this.on('touchstart click', this.deselect, this);

        return this;
    },

    /**
     * SetViewBox
     *
     * @param x
     * @param y
     * @param width
     * @param height
     */

    setViewBox: function(x, y, width, height) {
        var _x = x || 0;
        var _y = y || 0;
        var _width = width || this._paper.width;
        var _height = height || this._paper.height;
        if (this._paper && this._paper.setViewBox) {
            this._paper.setViewBox(_x, _y, _width, _height);
        }
    },

    /**
     * Zoom
     *
     * @param String
     */

    zoom: function(factor) {
        var x = this.get('x');
        var y = this.get('y');
        var paper = this.renderer();
        var width = this._paper.width = paper.width + factor;
        var height = this._paper.height = paper.height + factor;

        this.setViewBox(x, y, width + factor, height + factor);
    },

    /**
     * Clears the content of the diagram.
     *
     * This methods does not remove the content of the diagram,
     * only
     */

    remove: function() {
        if (this._paper) {
            _.each(this.attributes.children, function(child) { child.remove(); });
            _.each(this.attributes.edges, function(child) { child.remove(); });
            this._paper.remove();
            this._paper = null;
        }
    },

    /**
     * @private
     */

    changeViewBox: function(e) {
        if (!this.get('isDragging')) return;

        var startPoint = Point.get(this, e),
            endPoint;

        this.toFront();
        var move = function(ee) {
            var wp = new Point(this.get('x'), this.get('y'));
            ee.stopImmediatePropagation();
            endPoint = Point.get(this, ee);
            wp.sub(startPoint.vector(endPoint));
            this.set(wp);
            this.setViewBox(wp.x, wp.y);
            startPoint = endPoint;
        };
        var up = function(ee) {
            ee.stopImmediatePropagation();
            this.toBack();
            this.off('mouseup touchend touchcancel', up);
            this.off('mousemove touchmove', move);
        };
        this.on('mouseup touchend touchcancel', up);
        this.on('mousemove touchmove', move);
    },

    /**
     * @private
     */

    selectGroup: function(e) {
        if (!this.get('isSelecting')) return;

        var startPoint = Point.get(this, e);
        var selectionBox = this.renderer().rect(startPoint.x, startPoint.y, 0, 0);
        var endPoint, box, dx, dy, ow, w, oh, h;
        selectionBox.attr({
            'fill-opacity': 0.15,
            'stroke-opacity': 0.5,
            fill: '#007fff',
            stroke: '#007fff'
        });

        this.wrapper.toFront();
        var move = function(ee) {
            ee.stopImmediatePropagation();
            endPoint = Point.get(this, ee);
            box = selectionBox.getABox();
            dx = endPoint.x - startPoint.x;
            dy = endPoint.y - startPoint.y;
            ow = selectionBox.attr('width');
            oh = selectionBox.attr('height');

            // defaults
            w = ow + dx;
            h = oh + dy;

            // special cases
            if (box.x <= endPoint.x) {
                if (box.xRight > endPoint.x && dx > 0) {
                    selectionBox.attr('x', endPoint.x);
                    w = ow - dx;
                }
            } else {
                selectionBox.attr('x', endPoint.x);
                w = ow - dx;
            }
            if (box.y > endPoint.y || (dy > 0 && box.yBottom > endPoint.y)) {
                selectionBox.attr('y', endPoint.y);
                h = oh - dy;
            }
            if (w >= 0 && h >= 0) {
                selectionBox.attr({ width: w, height: h });
            }

            startPoint = endPoint;
        };
        var up = function(ee) {
            ee.stopImmediatePropagation();
            this.wrapper.toBack();
            this.isSelecting = false;
            this.off('mouseup touchend touchcancel', up);
            this.off('mousemove touchmove', move);

            // TODO
            // var shapes = this.getShapesByBox(selectionBox.getABox());
            // _.each(shapes, function(shape) { if (shape.select) shape.select(); });
            selectionBox.remove();
        };
        this.on('mouseup touchend touchcancel', up);
        this.on('mousemove touchmove', move);
    },

    add: function() {
        if (!arguments.length) return this;

        var addShape = function(shape, dia) {
            if (shape.id && !dia.getShape(shape.id)) {
                dia.get('children').push(shape);
                shape.setDiagram(dia);
                dia.trigger('add:children', shape);
            }
        };
        var addConnection = function(conn, dia) {
            if (conn.id && !dia.getConnection(conn.id)) {
                dia.get('edges').push(conn);
                conn.setDiagram(dia);
                dia.trigger('add:connection', conn);
            }
        };
        _.each(arguments, function(arg) {
            if (arg instanceof Ds.Shape) addShape(arg, this);
            else if (arg instanceof Ds.Label) addShape(arg, this);
            else if (arg instanceof Ds.Connection) addConnection(arg, this);
        }, this);

        return this;
    },

    /**
     * Removes the given Shape. this triggers the
     * remove:children event.
     *
     * @param {Shape}
     */

    removeShape: function(shape) {
        if (!shape) return;

        var children = this.get('children');
        var reject = function(child) {
            return child === shape;
        };
        this.set('children', _.reject(children, reject));
        this.trigger('remove:children', shape);
    },

    /**
     * Gets a Shape by it's id.
     *
     * @param {integer} shape's id
     * @return {Shape}
     */

    getShape: function(id) {
        if (!id) return null;

        var find = function(child) {
            return child.id === id;
        };
        return _.find(this.get('children'), find);
    },

    /**
     * Returns all shapes containing the given point.
     *
     * @param {Point}
     * @return {array}
     *
     */
    getShapesByPoint: function(point) {
        var args = arguments;

        if (!point)
            return null;
        if (args.length === 2)
            point = { x: args[0], y: args[1] };
        if (isNaN(point.x) || isNaN(point.y))
            return [];

        var findShapes = function(shape) {
            return shape.getByPoint(point);
        };
        return _.flatten(_.map(this.get('children'), findShapes));
    },

    /**
     * Returns all shapes inside the given box.
     *
     * @param {object} box
     * @return {array} shapes inside box
     */

    getShapesByBox: function(box) {
        if (!box || !box.x) return [];
        var bounds;
        var findShapes = function(shape) {
            bounds = shape.bounds();
            return box.x <= bounds.x && box.xRight >= bounds.x &&
                box.y <= bounds.y && box.yBottom >= bounds.y;
        };
        return _.filter(this.get('children'), findShapes);
    },

    /**
     * Removes the Connection from the diagram.
     *
     * @param {Connection}
     */

    removeConnection: function(connection) {
        if (!connection) return;

        var edges = this.edges;
        var reject = function(edge) {
            return edge === connection;
        };
        this.set('edges', _.reject(edges, reject));
        this.trigger('remove:edges', connection);
    },

    /**
     * Gets a Connection by it's id.
     *
     * @param {integer} Connection's id
     * @return {Connection}
     */

    getConnection: function(id) {
        if (!id) return null;

        var find = function(child) {
            return child.id === id;
        };
        return _.find(this.get('edges'), find);
    },

    /**
     * Deselects all currently selected Shapes or Connections.
     */

    deselect: function(element) {
        var selection = this.get('selection');
        if (this.isSelectable(element)) {
            element.deselect();
            this.set('selection', _.without(selection, element));
        } else {
            _.each(selection, function(selected) {
                selected.deselect();
            });
            selection.length = 0;
        }
    },

    /**
     * Sets the current selection.
     *
     * @param {DiagramElement}
     */

    setSelection: function(element) {
        if (this.isSelectable(element)) {
            this.deselect();
            this.get('selection').push(element);
            this.trigger('select', element);
        }
        return this;
    },

    addSelection: function(element) {
        if (this.isSelectable(element)) {
            this.get('selection').push(element);
        }
        return this;
    },

    /**
     * @private
     */

    isSelectable: function(element) {
        return element && typeof element.deselect === 'function';
    },

    /**
     * Returns the current selection
     *
     * @return {DiagramElement}
     */

    getSelection: function() {
        return this.get('selection');
    },

    /**
     * @private
     */

    _initPaper: function() {
        if (this._paper) return;
        if (!this.el) {
            throw new Error('Diagram element is missing, use setElement()');
        }

        this._paper = Raphael(this.el, this.width, this.height);
        this.setViewBox(0, 0, this._paper.width, this._paper.height);
    },

    toFront: function() {
        this.figure.toFront();
    },

    toBack: function() {
        this.figure.toBack();
    }

});

