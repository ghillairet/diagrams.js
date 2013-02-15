
var Figure = Ds.Figure = Ds.Element.extend({

    constructor: function(attributes) {
        if (!attributes) attributes = {};
        Ds.Element.apply(this, [attributes]);
        this.shape = attributes.shape;
        this.diagram = this.shape.diagram;
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
            if (key === 'width' || key === 'height') {
                if (!this.attributes['min-' + key])
                    this.attributes['min-' + key] = value;
            }
            if (this.wrapper) this.wrapper.attr(key, value);
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

    bindEvents: function() {
        var shape = this.shape;
        var wrapper = this.wrapper;

        this.eveHandlers = _.map(this.events, function(eve) {
            return { eve: eve, handler: function(e) {
                shape.trigger(eve, e);
            } };
        });

        _.each(this.eveHandlers, function(call) {
            wrapper[call.eve](call.handler);
        });
    },

    /**
     * @private
     */

    unBindEvents: function() {
        var wrapper = this.wrapper;
        _.each(this.eveHandlers, function(call) {
            wrapper['un' + call.eve](call.handler);
        });
        this.eveHandlers.length = 0;
    },

    /**
     * @private
     */

    renderer: function() {
        if (!this.diagram) {
            this.diagram = this.shape.diagram || this.shape.parent.diagram;
        }
        return this.diagram.paper();
    },

    startResize: function(style) {
        if (this.wrapper) {
            this.wrapper.o();
            this.wrapper.attr(style);
        }
    },

    resize: function(dx, dy, direction) {
        var width = this.wrapper.ow + dx;
        var height = this.wrapper.oh + dy;
        this.set({ width: width, height: height });
    },

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

    startMove: function() {
        var control = this.control;
        if (!control) return;

        var shape = control.shape;
        if (shape.connecting) return;
        shape.deselect();
        shape.removeContent();

        var attrs = _.clone(this.attrs);
        // stores current state
        this.o();
        // sets move style
        this.attr(control.moveStyle);
        shape.trigger('start:move');
    },

    move: function(dx, dy, mx, my, eve) {
        var control = this.control;
        if (!control) return;

        var shape = control.shape;
        if (shape.connecting) return;

        /**
        if (arguments.length === 2) {
            var x = arguments[0];
            var y = arguments[1];
            this.startMove();
            this.set({ x: x, y: y });
            this.endMove();
            return control;
        }
        **/

        control.set(control.calculatePosition(dx, dy));
        control.shape.renderEdges();

        if (shape.boundBox) shape.boundBox.render();
    },

    /**
     * @private
     */

    calculateX: function() {},
    calculateY: function() {},

    /**
     * @private
     */

    calculatePosition: function(dx, dy) {
        var shape = this.shape;
        var parent = shape.parent;
        return {
            x: this.calculateX(dx, parent),
            y: this.calculateY(dy, parent)
        };
    },

    endMove: function() {
        var control = this.control;
        if (!control) return;

        var shape = control.shape;
        shape.renderContent();

        this.reset();

        if (shape.boundBox) {
            shape.boundBox.remove();
        }

        shape.renderEdges();
        shape.trigger('end:move');
    },

    bounds: function() {
        if (this.wrapper)
            return this.wrapper.getABox();
        else return {
            x: this.get('x'),
            y: this.get('y')
        };
    },

    remove: function() {
        if (this.wrapper) {
            this.wrapper.remove();
            this.unBindEvents();
            delete this.wrapper;
        }
        return this;
    },

    translate: function(dx, dy) {
        if (this.wrapper) {
            this.wrapper.translate(dx, dy);
            this.set('x', this.wrapper.attr('x'));
            this.set('y', this.wrapper.attr('y'));
        }
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
        'stroke-width': 1
    },

    figures: {
        'rect': 'Rectangle',
        'circle': 'Circle',
        'ellipse': 'Ellipse',
        'path': 'Path'
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
        //    throw new Error('Cannot create figure for', figure);
    }

});

