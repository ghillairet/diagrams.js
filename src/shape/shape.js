/**
 * Shape
 *
 * example:
 *
 *      var Circle = Diagram.Shape.extend({
 *          type: 'showcase.Circle',
 *          figure: {
 *              type: 'circle',
 *              r: 30,
 *              fill: 'red',
 *              stroke: 'rgb(120, 120, 200)',
 *              'stroke-width': 2
 *          }
 *      });
 *
 *      var c = new Circle( { diagram: diagram, id: 0, x: 10, y: 10, fill: 'red' } );
 *      or
 *      var c = diagram.createShape(Circle, { id: 0, x: 10, y: 10, fill: 'red' });
 *
 *
 * @constructor
 *
**/

var Shape = Diagram.Shape = function( attributes ) {
    if (!this.figure) {
        throw new Error('Figure is not specified.');
    }

    attributes || (attributes = {});

    // Initialize attributes object that stores object values
    this.attributes = {};
    this.attributes.children = [];

    this.parent = attributes.parent || undefined;
    this.diagram = this.parent ? this.parent.diagram : attributes.diagram;

    this.isConnectable = true;

    this.shadow = this.shadow || false;

    this.resizable != null || (this.resizable = true);
    this.draggable != null || (this.draggable = true);
    this.toolbox != null || (this.toolbox = true);

    this.inEdges = [];
    this.outEdges = [];

    this.set('type', this.type);

    if (attributes.id) {
        this.set('id', attributes.id);
    } else {
        this.set('id', _.uniqueId());
    }

    // Must be clone
    this.set('attr', _.clone(this.figure));

    _.extend(this.get('attr'), this._attr(attributes));

    this._initChildren( attributes.children );

    if (this.diagram) {
        // diagram can be null for dummy shape, see Compartment._canCreate.
        this.diagram.get('children').push(this);
        this.diagram.trigger('add:children', this);
    }

    this.initialize.apply(this, arguments);
};

Shape.extend = extend;

_.extend(
    Shape.prototype,
    Diagram.SVGElement.prototype,
    Diagram.Draggable.prototype,
    Diagram.Selectable,
    Events, {

    /**
     * Initialize method. To be extended by subclasses.
     *
     * @api public
    **/

    initialize: function( properties ) {

    },

    /**
     * Returns JSON representation of the shape.
     *
     * @api public
    **/

    toJSON: function() {
        var clone = _.clone(this.attributes);
        if (this.wrapper) {
            clone.attr = this.wrapper.attr();
        }

        return clone;
    },

    /**
     * Disconnect the Shape from the Connection.
     *
     * @param {Connection} connection
     *
    **/

    disconnect: function( connection ) {
        this.inEdges = _.without(this.inEdges, connection);
        this.outEdges = _.without(this.outEdges, connection);
    },

    /**
     * Initialize internal shapes.
     *
     * @private
    **/

    _initChildren: function( children ) {
        if (children && children.length > 0) {
            // This is a load situation
            _.each(children, function( child ) {
                var shape = null;
                // if child already initialized, recreate it from its attributes.
                var data = child.attributes ? child.toJSON() : child;
                if (data.type === 'Diagram.Label') {
                    shape = this.createLabel( data );
                } else if (data.type === 'Diagram.Compartment') {
                    shape = this.createCompartment( data );
                }
                if (shape) {
                    this.get('children').push( shape );
                }
            }, this);
        } else {
            // This is a new shape situation.
            // Creates Label if text element is present.
            if (this.label) {
                var shape = this.createLabel( this.label );
                this.get('children').push( shape );
            }
            // Initializes compartments.
            if (this.compartments) {
                _.each(this.compartments, function( cpt ) {
                    var shape = this.createCompartment( cpt );
                    this.get('children').push( shape );
                }, this);
            }
        }
    },

    /**
     * Creates a Label.
     *
     * @param {Object} label - Label attributes
     * @return {Label} - Returns the Label object.
     * @api public
    **/

    createLabel: function( label ) {
        label.parent = this;
        return new Label( label );
    },

    /**
     * Creates a Compartment.
     *
     * @param {Object} compartment - Compartment attributes
     * @return {Compartment} - Returns the Compartment object.
     * @api public
    **/

    createCompartment: function( compartment ) {
        compartment.parent = this;
        return new Compartment( compartment );
    },

    /**
     * Renders the Shape on the canvas.
     *
     * @public
     * @returns {Shape}
    **/

    // The render() function will create the Raphael element, initialize the inner
    // elements and call their render() method. This function also make the Raphael element
    // draggable if option set to true and handle click event on the element.
    render: function() {
        if (this.wrapper) return;
        if (!this.diagram) throw new Error('Shape does not belong to a diagram');

        var paper = this.paper();

        this.wrapper = this._createFigure();

        // FigureShape is accessible from the wrapper via the property controller.
        this.wrapper.controller = this;

        // Creates shadow if shadow element is set to true.
        if (this.shadow) this.createShadow();

        // Make the element draggable if draggable is set to true.
        // Figure is draggable by default.
        if (this.draggable) this.asDraggable();

        if (this.toolbox) {
            this._tool = new Diagram.ToolBox({element: this});
        }

        _.each(this.get('children'), function(child) { child.render(); });

        // Handle click event.
        this.wrapper.click(this.handleClickEvent);
        this.wrapper.mouseover(this.handleMouseOver);
        this.wrapper.mouseout(this.handleMouseOut);

        return this;
    },

    /**
     * Creates a shadow under the shape.
     *
     * @api public
    **/

    createShadow: function() {
        var box = this.wrapper.getABox();
        var paper = this.paper();
        this.shadowWrapper = paper.rect(box.x, box.y, box.width, box.height, 0).attr({
            fill: 'grey', opacity: 0.2
        }).translate(4, 4);
        this.shadowWrapper.toBack();

        return this;
    },

    /**
     * handleClickEvent
     *
     * @private
    **/

    handleClickEvent: function( evt ) {
        var diagram = this.controller.diagram;
        var controller = this.controller;
        // Display selection box and resize anchors.
        controller.select();
        // Handle the connection to other nodes.
        if (diagram.canConnect(controller)) {
            var connection = diagram.connect(controller);
            console.log(connection);
            if (connection) {
                connection.render();
            }
        }
    },

    /**
     * handleMouseOver
     *
     * @private
    **/

    handleMouseOver: function(evt) {
        if (this.controller._tool) {
            this.controller._tool.render();
        }
    },

    /**
     * handleMouseOut
     *
     * @private
    **/

    handleMouseOut: function(evt) {
        var control = this.controller;
        window.setTimeout(function(){
            if (control._tool) {
                if (!control._tool.isOver) {
                    control._tool.remove();
                }
            }
        }, 500);
    },

    /**
     * Resize the Shape.
     *
     * @param {Number} dx
     * @param {Number} dy
     * @param {String} direction
     * @api public
    **/

    resize: function( dx, dy, direction ) {
        if (this.parent && this.parent instanceof Diagram.Compartment) {
            if (this.parent.layout === 'stack') {
                var height = this.attr('height');
                this.attr( this.wrapper.rdxy( dx, dy < 0 ? dy : dy, direction ) );
                this.attr({height: height});
            } else {
                // do nothing.
            }
        } else if (this.resizable) {
            this.attr( this.wrapper.rdxy( dx, dy, direction ) );
        }

        if (this.has('children')) {
            var children = this.get('children');
            if (children && children.length) {
                for (var i = 0; i < children.length; i++) {
                    var child = children[i];
                    if (typeof child.resize === 'function') {
                        child.resize(dx, dy, direction);
                    }
                }
            }
        }
    },

    /**
     * Returns the array of inner compartments.
     *
     * @return {Array} Returns array of compartments.
     * @api public
    **/

    getCompartments: function() {
        return _.filter(this.get('children'), function( child ) {
            return child instanceof Diagram.Compartment;
        });
    },

    /**
     * @private
    **/

    //
    // Resize child compartments. This function is called when a new
    // element is added to a compartment via the function addInner().
    //

    resizeCompartments: function() {
        var compartments = this.getCompartments();

        // Computes current height of compartments.
        var height = _.reduce(compartments, function( memo, cpt ) {
            return memo + cpt.attr('height');
        }, 0);

        // For each compartments, call resize(), and
        // computes the new y position of the next compartment.
        _.each(compartments, function( cpt ) {
            cpt._resize();
            var idx = _.indexOf(compartments, cpt);

            // Reposition next compartment
            if ((idx + 1) < compartments.length) {
                var next = compartments[idx + 1];
                var nextY = next.attr('y');
                var currentY = cpt.attr('y') + cpt.height(); //attr('height');
                var diff = currentY - nextY;
                if (diff > 0) {
                    next.move(0, currentY);
                }
            }
        });

        // Computes new height of compartments.
        var newHeight = _.reduce(compartments, function( memo, cpt ) {
            return memo + cpt.attr('height');
        }, 0);

        // If compartments height has increased, increase Shape height
        // accordingly.
        var diff = newHeight - height;
        if (diff > 0) {
            var previousHeight = this.attr('height');
            this.attr({ height: previousHeight + diff });
        }
    },

    /**
     * Scale Shape
    **/

    scale: function(x, y) {
        this.wrapper.scale(x, y);
    },

    /**
     * Show Shape if previously hidden.
    **/

    show: function() {
        if (this.wrapper) {
            this.wrapper.show();
        }
        if (this.hidder) {
            this.hidder.show();
        }
        if (this.resizer) {
            this.resizer.show();
        }
        _.each(this.get('children'), function( child ) {
            children.show();
        });
    },

    /**
     * Hide Shape if previously rendered.
    **/

    hide: function() {
        if (this.wrapper) {
            this.wrapper.hide();
        }

        if (this.hidder) {
            this.hidder.hide();
        }

        _.each(this.get('children'), function( child ) { child.hide(); });
    },

    /**
     * Moves the Shape to the given coordinates.
     *
     * @param {Number} x
     * @param {Number} x
     * @api public
    **/

    move: function( x, y ) {
        if (!this.wrapper) return;

        var previousX = this.attr('x');
        var previousY = this.attr('y');

        if (this.wrapper) {
            if (x > 0) {
                this.attr({x: x});
            }
            if (y > 0) {
                this.attr({y: y});
            }
        }

        _.each(this.get('children'), function( child ) {
            // computes the new child positions
            // according to previous parent positions.
            var ix = child.attr('x');
            var iy = child.attr('y');
            var dx = x > 0 ? ix - previousX : 0;
            var dy = y > 0 ? iy - previousY : 0;
            child.move( x + dx, y + dy);
        });

    },

    /**
     * Removes the Shape from the canvas.
     * Triggers a remove event.
     *
     * @api public
    **/

    remove: function() {

        if (!this.wrapper) return;

        // remove each child shape.
        _.each(this.get('children'), function( child ) {
            child.remove()
        });

        // remove selection anchors.
        _.each(this.selectionAnchors, function( anchor ) {
            anchor.remove()
        });

        // triggers remove:source for each inbound connections.
        _.each(this.inEdges, function( edge ) {
            edge.trigger('remove:source', edge);
        });

        // triggers remove:source for each outbound connections.
        _.each(this.outEdges, function( edge ) {
            edge.trigger('remove:target', edge);
        });

        // removes the wrapper, i.e. deletes Raphael Element
        // from paper.
        this.wrapper.remove();
        this.wrapper = null;

        // remove shadow if present.
        if (this.shadow) {
            this.shadowWrapper.remove();
        }

        // remove toolbox if present.
        if (this._tool) {
            this._tool.remove();
        }

        // trigger remove for listener to provide
        // adequate callback.
        // TODO
//        this.trigger('remove', this);
    }

});
