
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

Ds.Diagram = Ds.Element.extend(/** @lends Diagram.prototype */ {

    constructor: function(attributes) {
        if (!attributes) attributes = {};
        Ds.Element.apply(this, [attributes]);

        this._selection = null;
        this._currentSource = null;
        this._currentEdge = null;
        this.isSelecting = false;
        this._handlers = [];

        this.set('edges', []);

        if (attributes.el) this.el = attributes.el;
        if (this.el) this.setElement(this.el);

        this.initialize(attributes);
    },

    /**
     * Returns the current Raphael object.
     *
     * @name paper
     * @function
     * @memberOf Ds.Diagram
     * @returns {Raphael}
     */

    paper: function() {
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
        // Insures the Raphael object is ready.
        var paper = this.paper();
        var canvas = paper.canvas;
        var x = canvas.clientLeft;
        var y = canvas.clientTop;
        var width = canvas.width.baseVal.value;
        var height = canvas.height.baseVal.value;

        if (this.wrapper) this.wrapper.remove();
        // creates wrapper that will receive events
        this.wrapper = this.paper().rect(x, y, width, height, 0).attr({
            fill: 'white', opacity: 0, stroke: 'none'
        });

        this.bindEvents();
        _.each(this.get('children'), function(child) { child.render(); });
        _.each(this.get('edges'), function(edge) { edge.render(); });

        this.on('click', this.deselect, this);
        this.on('click', this.handleTextInput, this);
        this.on('mousedown touchstart', this.changeViewBox);
        this.on('mousedown', this.selectGroup);

        return this;
    },

    _events: [
        'click', 'dblclick',
        'mouseout', 'mouseup',
        'mouseover', 'mousedown',
        'mousemove', 'touchstart',
        'touchmove', 'touchend',
        'touchcancel'
    ],

    /**
     * @private
     */

    bindEvents: function() {
        var diagram = this;
        var wrapper = this.wrapper;
        var createHandler = function(eve) {
            return {
                eve: eve,
                handler: function(e) { diagram.trigger(eve, e); }
            };
        };
        var bind = function(call) { wrapper[call.eve](call.handler); };

        this._handlers = _.map(this._events, createHandler);
        _.each(this._handlers, bind);
    },

    /**
     * @private
     */

    unBindEvents: function() {
        var wrapper = this.wrapper;
        var unbind = function(call) { wrapper['un' + call.eve](call.handler); };

        _.each(this._handlers, unbind);
        this._handlers.length = 0;
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
        var x = this.wrapper.attr('x');
        var y = this.wrapper.attr('y');
        var paper = this.paper();
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
            _.each(this.get('children'), function(child) { child.remove(); });
            _.each(this.get('edges'), function(child) { child.remove(); });
            this._paper.remove();
            this._paper = null;
        }
    },

    /**
     * @private
     */

    changeViewBox: function(e) {
        if (this.isSelecting) return;

        var startPoint = Point.get(this, e),
            endPoint;

        this.wrapper.toFront();
        var move = function(ee) {
            var wp = new Point(this.wrapper.attr('x'), this.wrapper.attr('y'));
            ee.stopImmediatePropagation();
            endPoint = Point.get(this, ee);
            wp.sub(startPoint.vector(endPoint));
            this.wrapper.attr(wp);
            this.setViewBox(wp.x, wp.y);
            startPoint = endPoint;
        };
        var up = function(ee) {
            ee.stopImmediatePropagation();
            this.wrapper.toBack();
            this.off('mouseup', up);
            this.off('mousemove', move);
        };
        this.on('mouseup', up);
        this.on('mousemove', move);
    },

    /**
     * @private
     */

    selectGroup: function(e) {
        if (!this.isSelecting) return;

        var startPoint = Point.get(this, e);
        var selectionBox = this.paper().rect(startPoint.x, startPoint.y, 0, 0);
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
            this.off('mouseup', up);
            this.off('mousemove', move);

            // TODO
            // var shapes = this.getShapesByBox(selectionBox.getABox());
            // _.each(shapes, function(shape) { if (shape.select) shape.select(); });
            selectionBox.remove();
        };
        this.on('mouseup', up);
        this.on('mousemove', move);
    },

    /**
     * Creates a Shape and add it as children of the diagram.
     *
     * @param {function} Shape constructor
     * @param {object} Shape options
     * @return {Shape}
     */

    createShape: function(func, attributes) {
        var shape = null;
        var attrs = attributes || {};

        if (!func) {
            throw new Error('Cannot create Shape if Shape constructor is missing.');
        }

        attrs.diagram = this;
        shape = new func(attrs);

        return shape;
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
        this.set('children', _.reject(children, function(child) {
            return child === shape;
        }));
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

        var shape = _.find(this.get('children'), function(child) {
            return child.get('id') === id;
        });

        return shape;
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
     * Creates a Connection and add it to the diagram. The options
     * argument can contain the source and target Shape.
     *
     * @param {function} Connection constructor
     * @param {object} Connection options
     * @return {Connection}
     */

    createConnection: function(func, attributes) {
        if (typeof func !== 'function') return;

        var connection = null,
            attrs = attributes || {},
            source = attrs.source,
            target = attrs.target;

        attrs.diagram = this;
        connection = new func( attrs );

        if (source && target) {
            connection.connect(source, target);
        }

        connection.on('remove:source remove:target', function(connection) {
            this.removeConnection( connection );
        }, this);

        return connection;
    },

    /**
     * Removes the Connection from the diagram.
     *
     * @param {Connection}
     */

    removeConnection: function(connection) {
        if (!connection) return;

        var edges = this.get('edges');
        this.set('edges', _.reject(edges, function( edge ) {
            return edge === connection;
        }));

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

        var connection = _.find(this.get('edges'), function(child) {
            var childID = child.get('id');
            if (childID) {
                return childID === id;
            }
        });

        return connection;
    },

    /**
     * @private
     */

    canConnect: function(node) {
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

    /**
     * @private
     */

    connect: function(node) {
        var connection = null;

        if (this.currentEdge) {
            if (this.currentSource) {
                connection = this.createConnection(this.currentEdge, {
                    source: this.currentSource,
                    target: node
                });
                this.currentEdge = null;
                this.currentSource = null;
            }
        }

        return connection;
    },

    /**
     * @private
     */

    handleTextInput: function() {
        if (!this.inputText) return;

        var text = this.inputText.value;
        if (text) {
            this.modifiedLabel.setText(text);
            this.modifiedLabel.textForm.parentNode.removeChild(this.modifiedLabel.textForm);
            this.modifiedLabel.textForm = null;
            this.modifiedLabel = null;
            this.inputText = null;
        }
        if (this.repeatInputClick) {
            this.repeatInputClick = false;
        } else {
            this.repeatInputClick = true;
        }
    },

    /**
     * Deselects all currently selected Shapes or Connections.
     */

    deselect: function() {
        if (this._selection && typeof this._selection.deselect === 'function') {
            this._selection.deselect();
            delete this._selection;
        }
    },

    /**
     * Sets the current selection.
     *
     * @param {DiagramElement}
     */

    setSelection: function(element) {
        if (this._selection) {
            this._selection.deselect();
        }
        this._selection = element;
        this.trigger('select', element);
    },

    /**
     * Returns the current selection
     *
     * @return {DiagramElement}
     */

    getSelection: function() {
        return this._selection;
    },

    parse: function(data) {

    },

    /**
     * Returns JSON representation of the diagram.
     */

    toJSON: function() {

    },

    /**
     * @private
     */

    _initPaper: function() {
        if (!this.el) {
            throw new Error('Cannot initialize Raphael Object, ' +
                    'Diagram Element is missing, use setElement() before.');
        }

        if (this._paper) return;

        this._paper = Raphael(this.el, this.width, this.height);
        this.setViewBox(0, 0, this._paper.width, this._paper.height);
    },

    /**
     * @private
     */

    _canCreate: function( func ) {
        var child = _.find(this.children, function(c) {
            return c === func;
        });
        return child !== undefined;
    }

});

