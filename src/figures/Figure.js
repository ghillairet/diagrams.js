
var Figure = Ds.Figure = Ds.Element.extend({

    constructor: function(attributes) {
        if (!attributes) attributes = {};
        Ds.Element.apply(this, [attributes]);

        if (attributes.shape) {
            this.shape = attributes.shape;
        } else if (attributes.paper) {
            this.paper = attributes.paper;
        }

        this.eveHandlers = [];
    },

    initialize: function(attributes) {},

    set: function(key, value) {
        var attrs;

        if (_.isObject(key))
            attrs = key;
        else (attrs = {})[key] = value;

        for (var attr in attrs) {
            this.setValue(attr, attrs[attr]);
        }

        return this;
    },

    /**
     * @private
     */

    setValue: function(key, value) {
        if (_.has(this.defaults, key)) {
            this.attributes[key] = value;
            this.setMinValues(key ,value);
            if (this.wrapper) this.wrapper.attr(key, value);
        }
    },

    /**
     * @private
     */

    setMinValues: function(key, value) {
        var min = 'min-' + key;
        if (key === 'width' || key === 'height') {
            if (!this.attributes[min]) {
                this.attributes[min] = value;
            }
        }
    },

    render: function() {},

    events: [
        'click', 'dblclick',
        'mouseover', 'mouseout',
        'mouseup', 'mousedown',
        'mousemove', 'touchmove',
        'touchstart', 'touchend'
    ],

    /**
     * @private
     */

    bindEvents: function(wrapper) {
        var shape = this.shape;
        var _wrapper = wrapper || this.wrapper;

        this.eveHandlers = _.map(this.events, function(eve) {
            return { eve: eve, handler: function(e) {
                shape.trigger(eve, e);
            } };
        });

        _.each(this.eveHandlers, function(call) {
            _wrapper[call.eve](call.handler);
        });
    },

    /**
     * @private
     */

    unBindEvents: function(wrapper) {
        var _wrapper = wrapper || this.wrapper;
        _.each(this.eveHandlers, function(call) {
            _wrapper['un' + call.eve](call.handler);
        });
        this.eveHandlers.length = 0;
    },

    /**
     * @private
     */

    renderer: function() {
        return this.shape.renderer();
    },

    // resize functions

    startResize: function(style) {
        if (this.wrapper) {
            this.wrapper.o();
            this.wrapper.attr(style);
        }
    },

    resize: function(dx, dy, direction) {},

    endResize: function() {
        if (this.wrapper) {
            this.wrapper.reset();
        }
    },

    asDraggable: function(style) {
        this.moveStyle = style;
        if (this.wrapper) {
            this.wrapper.attr({ cursor: 'move' });
            this.wrapper.drag(this.move, this.startMove, this.endMove);
        }
    },

    // move functions

    startMove: function(style) {
        var figure = this.control;
        if (!figure) return;

        var shape = figure.shape;
        if (shape.connecting) return;
        shape.deselect();
        shape.removeContent();

        var attrs = _.clone(this.attrs);
        // stores current state
        this.o();
        // sets move style
        this.attr(shape.moveStyle);
        shape.trigger('start:move');
    },

    move: function(dx, dy, mx, my, eve) {
        var figure = this.control || this;
        if (!figure) return;

        var shape = figure.shape;
        if (shape.connecting) return;

        var position = figure.calculatePosition(dx, dy);
        figure.set({ x: position.x, y: position.y });
        figure.shape.renderEdges();

        if (shape.boundBox) shape.boundBox.render();
    },

    endMove: function() {
        var figure = this.control;
        if (!figure) return;

        var shape = figure.shape;
        shape.renderContent();

        this.reset();

        if (shape.boundBox) {
            shape.boundBox.remove();
        }

        shape.renderEdges();
        shape.trigger('end:move');
    },

    /**
     * @private
     */

    calculateX: function(dx) {
        var bounds = this.bounds();
        var limits = this.limits();
        var x = this.wrapper.ox + dx;

        return Math.min(Math.max(0, x), (limits.width - bounds.width));
    },

    /**
     * @private
     */

    calculateY: function(dy) {
        var bounds = this.bounds();
        var limits = this.limits();
        var y = this.wrapper.oy + dy;

        return Math.min(Math.max(0, y), (limits.height - bounds.height));
    },

    /**
     * @private
     */

    calculatePosition: function(dx, dy) {
        return {
            x: this.calculateX(dx),
            y: this.calculateY(dy)
        };
    },

    /**
     * Returns the Shape's bounds in the form of
     * an object { x: x, y: y, width: width, height: height }.
     *
     * @return object
     */

    bounds: function() {
        if (this.wrapper)
            return this.wrapper.getABox();
        else return {
            x: this.get('x'),
            y: this.get('y')
        };
    },

    /**
     * Returns the limits in which the figure can evolve. The limits
     * are given  in the form of an object
     * { x: x, y: y, width: width, height: height }.
     *
     * @return object
     */

    limits: function() {
        var shape = this.shape;
        if (this.shape.parent) {
            return this.shape.parent.bounds();
        } else {
            var canvas = this.renderer();
            return {
                x: 0, y: 0,
                width: canvas.width,
                height: canvas.height
            };
        }
    },

    /**
     * Removes the figure from the canvas.
     */

    remove: function() {
        if (this.wrapper) {
            this.wrapper.remove();
            this.unBindEvents();
            delete this.wrapper;
        }
        return this;
    },

    /**
     * Moves the figure according to the given dx, dy.
     */

    translate: function(dx, dy) {
        if (this.wrapper) {
            this.wrapper.transform('t' + dx + ',' + dy);
            this.attributes.x = this.wrapper.attr('x');
            this.attributes.y = this.wrapper.attr('y');
        }
        return this;
    },

    isPointInside: function(point) {
        var x = point.x, y = point.y;
        var box = this.wrapper.getABox();

        return x >= box.x && x <= box.xRight && y >= box.y && y <= box.yBottom;
    },

    show: function() {
        if (this.wrapper) this.wrapper.show();
    },

    hide: function() {
        if (this.wrapper) this.wrapper.hide();
    },

    toFront: function() {
        if (this.wrapper) this.wrapper.toFront();
    },

    toBack: function() {
        if (this.wrapper) this.wrapper.toBack();
    },

    preferredSize: function() {
        return this.bounds();
    },

    minimumSize: function() {
        return this.bounds();
    },

    maximumSize: function() {
        return this.bounds();
    }

}, {

    defaults: {
        x: 0,
        y: 0,
        fill: 'none',
        opacity: 1,
        stroke: 'none',
        'fill-opacity': 1,
        'stroke-opacity': 1,
        'stroke-width': 1,
        'cursor': 'default'
    },

    figures: {
        'rect': 'Rectangle',
        'circle': 'Circle',
        'ellipse': 'Ellipse',
        'path': 'Path',
        'text': 'Text'
    },

    create: function(shape, figure) {
        if (!shape || !figure) return;

        var type = figure.type,
            fn = Figure.figures[type],
            attrs = { shape: shape, figure: figure };

        if (type && fn) {
            if (typeof fn === 'function')
                return new fn(attrs);
            else return new Ds[fn](attrs);
        }
    }

});

