
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
        if (!attributes) attributes = {};
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

        this.setUpChildren();
        this.setUpLayout(attributes);
        this.setUpStyles(attributes);
        this.setUpToolBox();
        this.setUpBoundBox();

        this.initialize.apply(this, arguments);

        if (this.diagram && !this.parent) {
            this.diagram.get('children').push(this);
            this.diagram.trigger('add:children', this);
        }
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
        if (this.layout) {
            this.set(this.layout.preferredSize());
        }
        this.figure.render();
        this.renderContent();

        this.on('click', this.select);
        this.on('click', this.showTool);
        this.on('mousedown', this.handleClick);
        this.on('mouseout', this.removeToolWhenOut);

        if (this.draggable) this.asDraggable();

        return this;
    },

    dragConnection: function(e, connectionType) {
        if (e) e.stopPropagation();
        if (!connectionType || typeof connectionType !== 'function') return;

        var me = this;
        me.connecting = true;
        var connection = new connectionType({ diagram: me.diagram });
        connection.connectByDragging(me, e);
        connection.render();
        var end = function() {
            me.connecting = false;
            connection.off('connect', end);
        };
        connection.on('connect', end);
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

        this.figure.remove();
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


    canAdd: function(fn) {
        if (typeof fn !== 'function') return false;
        if (!this.accepts) return false;

        var dummy = new fn({});
        return _.some(this.accepts, function(a) { return dummy instanceof a; });
    },

    canConnect: function(connection) {
        return true;
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

    setUpLayout: function(attributes) {
        this.layout = Layout.create(this, attributes);
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
            } else if (typeof child === 'function') {
                shape = new child({ parent: this });
            } else if (typeof child === 'object') {
                shape = new Shape(child);
            }
            if (shape) this.add(shape);
        }, this);
    },

    /**
     * @private
     */

    removeContent: function() {
        _(this.children).each(function(c) { c.remove(); });
    },

    /**
     * @private
     */

    renderContent: function() {
        _(this.children).each(function(c) {
            c.render();
        });
        if (!this.parent) { this.doLayout(); }
    },

    /**
     * @private
     */

    renderEdges: function() {
        _(this.ins).each(function(i) { i.render(); });
        _(this.outs).each(function(o) { o.render(); });
    },


    asDraggable: function() {
        if (this.figure) this.figure.asDraggable();
        return this;
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
        if (this.toolBox) this.toolBox.remove();
        if (this.shadow) this.shadowWrapper.remove();

        _.each(this.selectionAnchors, function( anchor ) {
            if (anchor.active) anchor.hide(); else anchor.remove();
        });
        this.removeContent();

        if (this.figure) this.figure.startResize(this.resizeStyle);

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
        if (!this.resizable) return this;
        if (this.figure) this.figure.resize(dx, dy, direction);
        if (this.boundBox) this.boundBox.render();
        this.renderEdges();

        return this;
    },

    /**
     * @private
     */

    endResize: function() {
        if (this.figure) this.figure.endResize();

        this.renderContent();

        if (this.shadow) this.createShadow();
        if (this.boundBox) this.boundBox.remove();

        this.trigger('end:resize');
    }

};

_.extend(Ds.Shape.prototype, Ds.Selectable, Ds.Resizable, Ds.Events);

