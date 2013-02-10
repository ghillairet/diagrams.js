
/*
 * Styles
 */

Ds.Styles = {

    moveStyle: { fill: 'grey', 'fill-opacity': 0.2, 'stroke-width': 0 },
    resizeStyle: { fill: 'grey', 'fill-opacity': 0.2, 'stroke-width': 0 },
    selectStyle: { fill: 'none', stroke: 'black', 'stroke-width': 1 },
    anchorStyle: { fill: 'black', stroke: 'none', 'fill-opacity': 1 }

};

/** @name Shape
 *  @class Represents a Shape
 *  @augments LayoutElement
 *
 *  @example
 *
 *  var BasicShape = Ds.Shape.extend({
 *      figure: {
 *          type: 'rect',
 *          width: 100,
 *          height: 100,
 *          fill: 'yellow'
 *      },
 *      layout: {
 *          type: 'flow',
 *          vertical: true
 *      },
 *      children: [{
 *          figure: {
 *              type: 'text',
 *              text: 'Label'
 *          }
 *      }]
 *  });
 */

var Shape = Ds.Shape = Ds.LayoutElement.extend(/** @lends Shape.prototype */ {
    /**
     * @property {boolean} connectable
     */
    connectable: true,
    /**
     * @property {boolean} shadow
     */
    showShadow: false,
    /**
     * @property {boolean} resizable
     */
    resizable: true,
    /**
     * @property {boolean} draggable
     */
    draggable: true,
    /**
     * @property {boolean} toolbox
     */
    showToolBox: true,
    /**
     * @property {boolean} boundBox
     */
    showBoundBox: true,

    constructor: function(attributes) {
        Ds.DiagramElement.apply(this, [attributes]);

        this.ins = [];
        this.outs = [];

        if (_.isBoolean(attributes.draggable))
            this.draggable = attributes.draggable;
        if (_.isBoolean(attributes.resizable))
            this.resizable = attributes.resizable;
        if (_.isBoolean(attributes.showToolBox))
            this.showToolBox = attributes.showToolBox;
        if (_.isBoolean(attributes.showBoundBox))
            this.showBoundBox = attributes.showBoundBox;

        if (attributes.children) {
            this.children = attributes.children;
        }

        if (this.diagram && !this.parent) {
            this.diagram.get('children').push(this);
            this.diagram.trigger('add:children', this);
        }

        this.setUpChildren();
        this.setUpLayout();
        this.setUpStyles(attributes);
        this.setUpToolBox();
        this.setUpBoundBox();

        this.initialize.apply(this, arguments);
    },

    /**
     * @private
     */

    setUpToolBox: function(attributes) {
        if (this.showToolBox) {
            this.toolBox = new ToolBox({ element: this });
        }
    },

    setUpBoundBox: function() {
        if (this.showBoundBox) {
            this.boundBox = new Ds.BoundBox({ control: this });
        }
    },

    /**
     * @private
     */

    setUpStyles: function(attributes) {
        _.each(_.keys(Ds.Styles), function(style) {
            if (attributes[style]) {
                this[style] = _.clone(attributes[style]);
            } else {
                this[style] = _.clone(Ds.Styles[style]);
            }
        }, this);
    },

    /**
     * Renders the Shape
     */

    render: function() {
        if (this.wrapper) this.remove(false);

        this.wrapper = createFigure(this);

        if (!this.wrapper) throw new Error('Cannot render this shape: ', this);

        this.set(this.attributes);
        this.renderContent();

        this.bindEvents();
        this.on('click', this.select);
        this.on('click', this.showTool);
        this.on('mousedown', this.handleClick);
        this.on('mouseout', this.removeToolWhenOut);

        if (this.draggable) this.asDraggable();

        return this;
    },

    /**
     * @private
     */

    bindEvents: function() {
        if (!this.wrapper) return;

        var me = this;
        this.wrapper.click(function(e) { me.trigger('click', e); });
        this.wrapper.mouseover(function(e) { me.trigger('mouseover', e); });
        this.wrapper.mouseout(function(e) { me.trigger('mouseout', e); });
        this.wrapper.mouseup(function(e) { me.trigger('mouseup', e); });
        this.wrapper.mousedown(function(e) { me.trigger('mousedown', e); });
    },

    /**
     * @private
     */

    handleClick: function(e) {
        var diagram = this.diagram,
            edge = diagram.currentEdge,
            shape = this;

        if (!edge) return;

        shape.connecting = true;
        var start = Point.get(diagram.paper(), e);

        var onup = function(e) {
            if (!shape.line || !shape.connecting) return;

            var targetShape = diagram.getElementByPoint(shape.line.end);
            if (targetShape) {
                diagram.createConnection(edge, { source: shape, target: targetShape }).render();
                delete diagram.currentEdge;
            }
            if (shape.line) {
                shape.line.remove();
                delete shape.line;
            }
            shape.connecting = false;
            document.removeEventListener('mousemove', onmove);
            document.removeEventListener('mousemove', onup);
        };

        var onmove = function(e) {
            if (!shape.connecting) return;
            var end = Point.get(diagram.paper(), e);
            if (shape.line) shape.line.remove();
            shape.line = new Line(diagram.paper(), start, end);
            document.addEventListener('mouseup', onup);
        };

        document.addEventListener('mousemove', onmove);
    },

    /**
     * @private
     */

    showTool: function() {
        if (this._tool) this._tool.render();
    },

    /**
     * @private
     */

    removeToolWhenOut: function() {
        var me = this;
        // bug check something with children
        if (me.toolBox) {
            window.setTimeout(function(){
                if (me.toolBox && !me.toolBox.isOver)
                    me.toolBox.remove();
            }, 1000);
        }
    },

    /**
     * @param {Boolean} diagram - also removes from diagram.
     */

    remove: function(diagram) {
        this.deselect();

        if (this.wrapper) {
            this.wrapper.remove();
            delete this.wrapper;
        }

        _.each(this.children, function(c) { c.remove(); });
        _.each(this.ins, function(e) { e.remove(diagram); });
        _.each(this.outs, function(e) { e.remove(diagram); });

        // remove shadow if present.
        if (this.shadow) {
            this.shadowWrapper.remove();
            delete this.shadowWrapper;
        }

        if (this.selectionBox) {
            this.selectionBox.remove();
        }

        // remove toolbox if present.
        if (this.toolBox) {
            this.toolBox.remove();
            delete this.toolBox;
        }

        if (diagram) {
            this.diagram.removeShape(this);
        }
    },

    /**
     * Disconnect a connection from the shape
     *
     * @param Connection
     * @param String
     */

    disconnect: function(connection, direction) {
        if (!connection) return this;

        if (direction && (direction === 'in' || direction === 'out')) {
            this[direction+'s'] = _.without(this[direction+'s'], connection);
        } else {
            this.ins = _.without(this.ins, connection);
            this.outs = _.without(this.outs, connection);
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
        this.children.push(shape);
        this.trigger('add:children', shape);
        return this;
    },

    /**
     * Returns the JSON representation of the Shape
     *
     * @return JSONObject
     */

    toJSON: function() {
        return _.clone(this.attributes);
    },


    /**
     * @private
     */

    setUpLayout: function() {
        this.layout = createLayout(this);
    },

    /**
     * @private
     */

    setUpChildren: function() {
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

    /**
     * @private
     */

    removeContent: function() {
        _.each(this.children, function(c) { c.remove(); });
    },

    /**
     * @private
     */

    renderContent: function() {
        _.each(this.children, function(c) { c.render(); });
        this.doLayout();
    },

    /**
     * @private
     */

    renderEdges: function() {
        _.each(this.ins, function(i) { i.render(); });
        _.each(this.outs, function(o) { o.render(); });
    }

});

/**
 * @name Resizable
 * @class
 */

Ds.Resizable = {

     /**
     * @private
     */

    startResize: function() {
        if (!this.wrapper) return;
        if (this._tool) this.toolBox.remove();
        this.wrapper.o();
        this.removeContent();
        this.wrapper.attr(this.resizeStyle);
        this.trigger('start:resize');
    },

    /**
     * Resizes the Shape by the given factors and direction
     *
     * @example
     *
     * var s = new BasicShape({ ... });
     * // will resize the shape by 10 on y coordinates
     * s.resize(0, 10);
     *
     *
     * @param Integer dx
     * @param Integer dy
     * @param String direction
     */

    resize: function(dx, dy, direction) {
        var width, height;
        if (!this.resizable) return this;

        this.deselect();
        this.startResize();

        width = this.wrapper.ow + dx;
        height = this.wrapper.oh + dy;
        this.set({ width: width, height: height });

        this.endResize();

        return this;
    },

    /**
     * @private
     */

    endResize: function() {
        this.wrapper.reset();
        this.renderEdges();
        this.renderContent();
        this.trigger('end:resize');
    }

};

/**
 * @name Draggable
 * @class
 */

Ds.Draggable = {

    asDraggable: function(options) {
        if (this.wrapper) {
            this.wrapper.attr({ cursor: 'move' });
        }

        this.wrapper.drag(this.move, this.startMove, this.endMove);

        return this;
    },

    startMove: function() {
        var control = this.wrapper ? this : this.controller;
        if (!control) return;
        if (control.connecting) return;

        control.deselect();
        control.removeContent();

        var wrapper = control.wrapper;
        // store previous attributes
        var attrs = _.clone(wrapper.attrs);
        var type = wrapper.type;

        // stores current state
        wrapper.o();
        // sets move style
        wrapper.attr(control.moveStyle);
        wrapper.unmouseover(wrapper.mouseover);
        wrapper.unmouseout(wrapper.mouseout);
        control.trigger('start:move');
    },

    endMove: function() {
        var control = this.wrapper ? this : this.controller;
        if (!control) return;

        control.renderContent();
        var wrapper = control.wrapper;

        wrapper.reset();
        wrapper.mouseover(this.mouseover);
        wrapper.mouseout(this.mouseout);

        if (control.boundBox)
            control.boundBox.remove();

        control.trigger('end:move');
    },

    move: function(dx, dy, mx, my, eve) {
        var control = this.wrapper ? this : this.controller;
        if (!control) return;
        if (control.connecting) return;

        if (arguments.length === 2) {
            var x = arguments[0];
            var y = arguments[1];
            this.startMove();
            this.set({ x: x, y: y });
            this.endMove();
            return control;
        }

        control.set(control.calculatePosition(dx, dy));

        if (control.boundBox)
            control.boundBox.render();

        control.renderEdges();

        return control;
    },

    calculatePosition: function(dx, dy) {
        var wrapper = this.wrapper;
        var parent = this.parent;
        var bounds = parent ? parent.bounds() : wrapper.paper;
        var b = wrapper.getBBox();
        var x = wrapper.ox + dx;
        var y = wrapper.oy + dy;

        var isCircle = function() {
            return wrapper.is('circle') || wrapper.is('ellipse');
        };

        var r = isCircle() ? b.width / 2 : 0;

        // calculates the min between the requested positions and
        // the limits of the container

        if (parent) {
            x = Math.min(Math.max(bounds.x + r, x), (bounds.width - (isCircle() ? r : b.width)) + bounds.x);
            y = Math.min(Math.max(bounds.y + r, y), (bounds.height - (isCircle() ? r : b.height)) + bounds.y);
        } else {
            x = Math.min(Math.max(r, x), bounds.width - (isCircle() ? r : b.width));
            y = Math.min(Math.max(r, y), bounds.height - (isCircle() ? r : b.height));
        }

        return { x: x, y: y, cx: x, cy: y };
    }

};

_.extend(Ds.Shape.prototype, Ds.Selectable, Ds.Resizable, Ds.Draggable, Ds.Events);

