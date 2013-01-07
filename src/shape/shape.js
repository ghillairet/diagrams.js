
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

        if (fromDiagram) {
            this.diagram.removeShape(this);
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

