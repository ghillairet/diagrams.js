/**
 * Compartment
 *
 * {
 *  layout: 'stack',
 *      figure: {
 *          top: 30,
 *          height: 20
 *      }
 * }
 *
 * @constructor
 *
**/

var Compartment = Diagram.Compartment = function( attributes ) {
    attributes || (attributes = {});

    this.attributes = {};
    this.attributes.type = 'Diagram.Compartment';
    this.attributes.children = [];

    this.parent = attributes.parent || undefined;
    this.diagram = this.parent ? this.parent.diagram : attributes.diagram;

    this.resizable = attributes.resizable || true;
    this.draggable = attributes.draggable || false;

    this.layout = attributes.layout || 'none';
    this.set('layout', this.layout);
    this.top = attributes.top || 0;
    this.set('top', this.top);

    if (attributes.accepts && _.isArray(attributes.accepts)) {
        this.accepts = attributes.accepts;
    }
    this.set('accepts', this.accepts);

    this.set('attr', {});
    this._cloneParentAttributes();

    _.extend(this.get('attr'), this._attr(attributes));

    this._initChildren( attributes.children );
    this.initialize.apply(this, arguments);
};

// Compartment extends the following prototypes:
//  - SVGElement
//  - Events
//
_.extend(
    Compartment.prototype,
    Diagram.SVGElement.prototype,
    Events
);

Compartment.extend = extend;

/**
 * Initialize method to be extended by subclasses.
 *
 * @api public
**/

Compartment.prototype.initialize = function() {};

/**
 * Initialize inner children.
 *
 * @private
**/

Compartment.prototype._initChildren = function( children ) {
    if (children && children.length > 0) {
        _.each(children, function( child ) {
            var shape = null;
            if (child.type) {
                var _object = this.diagram._getConstructor( child.type );
                if (typeof _object === 'function') {
                    child.parent = this;
                    shape = this.diagram.createShape(_object, child);
                    if (shape) {
                        this.addInner( shape );
                    }
                }
            }
        }, this);
    }
};

/**
 * Initialize attributes.
 *
 * @private
**/

Compartment.prototype._cloneParentAttributes = function() {
    if (this.parent) {
        var attr = this.parent.get('attr');
        for (var key in attr) {
            if (!_.isObject(attr[key]) || !_.isArray(attr[key])) {
                this.get('attr')[key] = attr[key];
            }
        }
    }
};

/**
 * Render the Compartment.
 *
 * @api public
**/

Compartment.prototype.render = function() {
    var paper = this.paper();

    this.get('attr').width = this.parent.wrapper.attr('width');
    this.get('attr').height || (this.get('attr').height = 10);

    var x = this.get('attr').x = this.parent.attr('x'),
        y = this.get('attr').y = this.parent.attr('y') + this.top,
        width = this.get('attr').width,
        height = this.get('attr').height;

    if (this.wrapper) {
        this.wrapper.remove();
    }

    if (this.parent.wrapper.type === "rect") {
        this.wrapper = paper.rect(x, y, width, height, 0).attr( this.get('attr') );
    }

    this.wrapper.controller = this;
    this.wrapper.toFront();

    _.each(this.get('children'), function(c) { c.render(); });
    this.wrapper.click(this.handleClickEvent);

    return this;
};

/**
 * handleClickEvent.
 *
 * @private
**/

Compartment.prototype.handleClickEvent = function( evt ) {
    var controller = this.controller;

    if (controller.parent) {
        controller.parent.select();
    }

    var tool = controller.diagram.currentTool;
    if (tool) {
        if (controller.canCreate( tool )) {
            // reset tool.
            controller.diagram.currentTool = null;
            var attributes = Point.getMousePosition( controller.paper(), evt );
            var shape = controller.createShape(tool, attributes);
            if (shape) {
                shape.render();
            }
        }
    }
};

Compartment.prototype.createShape = function(func, attributes) {
    var shape = null;
    if (typeof func === 'function') {
        attributes.parent = this;
        shape = new func( attributes );
        if (shape) {
            // position and add shape as child.
            this.addInner( shape );
        }
    }
    return shape;
};

/**
 * Adds inner shape.
 * called before render().
 *
 * @param node
 * @returns
**/

Compartment.prototype.addInner = function( shape ) {
    if (this.hidder) {
        this.hidder.toFront();
    }

    var attr = this.wrapper ? this.wrapper.attr() : this.get('attr');
    var children = this.get('children');

    if (this.wrapper && this.layout === 'stack') {
        shape.get('attr').width = attr.width;
        var last = _.last(children);

        if (last) {
            var last_attr = last.wrapper ? last.wrapper.attr() : last.get('attr');
            var y = last_attr.y;
            y = y + last_attr.height;
            shape.get('attr').x = attr.x;
            shape.get('attr').y = y;
        } else {
            shape.get('attr').x  = attr.x;
            shape.get('attr').y = attr.y;
        }

        children.push(shape);
        this.parent.resizeCompartments();
    } else {
        children.push(shape);
    }

    // trigger add:children event for listeners.
    this.trigger('add:children', shape);
};

/**
 * Resize the Compartment and its children.
 *
 * @param {Number} dx
 * @param {Number} dy
 * @param {Number} direction
 *
**/

Compartment.prototype.resize = function( dx, dy, direction ) {
    this.attr( this.wrapper.rdxy( dx, dy, direction ) );

    _.each(this.get('children'), function( child ) {
        child.resize(dx, dy, direction);
    });
};

/**
 * @private
**/

Compartment.prototype._resize = function() {
    var height = this.height();
    if (height > 0) {
        this.wrapper.attr({ height: height });
    }
};

/**
 * Computes the height of inner elements.
 *
**/

Compartment.prototype.height = function() {
    if (this.get('children').length > 0) {
        var computed = _.reduce(this.get('children'), function( memo, child ) {
            return memo + child.get('attr').height;
        }, 0);

        if (this.wrapper) {
            var height = this.attr('height');
            if (height >= computed) {
                return height;
            }
        }

        return computed;
    } else {
        return this.wrapper ? this.attr('height') : this.get('attr').height;
    }
};

/**
 * @private
 *
**/

Compartment.prototype._addHidder = function() {
    var startX, startY, paper;
    startX = this.position.x + 2;
    startY = this.position.y + 2;
    paper = this.paper();
    return paper.rect(startX, startY, 8, 8, 0).attr({ fill: 'whitesmoke', stroke: 'none' });
};

/**
 * @private
 *
**/

Compartment.prototype._hide = function() {
    currentY = this.wrapper.attr('y');
    currentHeight = this.wrapper.attr('height');

    // Reset the height to its original state.
    this.wrapper.attr({ height: this.get('attr').height });

    // Hides its content.
    _.each(this.get('children'), function( child ) { child.hide(); });

    this.positionNextCompartments();

    this.hidder.hidden = true;
};

/**
 * Show the compartment content when hidder is clicked.
 *
 * @api public
 *
**/

Compartment.prototype._show = function() {
    this.position = {
        x: this.parent.wrapper.attr('x'),
        y: this.parent.wrapper.attr('y') + this.top
    };

    // compartment height is determined by its content height.
    //this.figure.height = this.parent.wrapper.attr('height') - this.figure.top;
    //this.wrapper.attr({ y: this.position.y });
    //this.wrapper.attr({ height: this.figure.height });
    this.resize();
    // this.hidder.attr({ y: this.position.y + 2 });

    this.positionNextCompartments();

    // Shows its content.
    _.each(this.get('children'), function( child ) { child.show(); });

    this.hidder.hidden = false;
};

/**
 * @private
 *
**/

Compartment.prototype.positionNextCompartments = function() {
    // For each next compartments, reset their y position according
    // to the previous compartment y position and height.
    var compartments = this.parent.compartments();
    var idx = _.indexOf(compartments, this);
    for ( var i = idx + 1; i < compartments.length; i++) {
        var next = compartments[i];
        var previous = compartments[i - 1];
        var newY = previous.attr('y') + previous.attr('height');
        next.attr({y: newY});
    }
};

/**
 * Returns true if child shape can be created an added.
 *
 * @private
 *
**/

Compartment.prototype.canCreate = function( func ) {
    if (this.accepts && typeof func === 'function') {
        var fn = arguments[0];
        // create dummy instance
        try {
            var instance = new func();
        } catch(e) {
            // cannot create
            return false;
        }

        if (instance && instance.attributes) {
            var c = _.find(this.accepts, function( f ) {
                return f === instance.attributes.type;
            });
            return c !== undefined;
        }
    }
    return false;
};

/**
 * Removes the Compartment from the canvas.
 *
 * @api public
**/

Compartment.prototype.remove = function() {
    _.each(this.get('children'), function(child) { child.remove() } );

    if (this.wrapper) {
        this.wrapper.remove();
    }
};

/**
 * Returns JSON representation of the Compartment.
 *
 * @api public
**/

Compartment.prototype.toJSON = function() {
    var clone = _.clone(this.attributes);
    if (this.wrapper) {
        clone.attr = this.wrapper.attr();
    }

    return clone;
};
