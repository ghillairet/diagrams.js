/**
 * Diagram
 *
 * @namespace Diagram
 * @constructor
 *
 **/
Diagram.Diagram = function( attributes ) {
    if (!attributes) attributes = {};

    if (this.container) {
        this.setElement(this.container);
    }

    this.attributes = {
        name: '',
        type: '',
        children: [],
        edges: []
    };

    if (_.isObject(attributes)) {
        _.each(_.keys(attributes), function(key) {
            this.attributes[key] = attributes[key];
        }, this);
    }

    if (this.type) {
        this.set('type', type);
    }

    if (attributes.id) {
        this.set('id', attributes.id);
    } else {
        this.set('id', _.uniqueId());
    }

    this.currentSource = null;
    this.currentEdge = null;

    this.initialize(attributes);

    return this;
};

Diagram.Diagram.extend = extend;

// Diagram extends the following prototypes:
//  - Diagram.Element
//  - Diagram.Events
//
_.extend(
        Diagram.Diagram.prototype,
        Diagram.Element.prototype,
        Events
        );

Diagram.Diagram.prototype.initialize = function() {};

// ....extend({
//      el: '#element'
// })
Diagram.Diagram.prototype.setElement = function(element) {
    if (!element) return this;

    if (_.isString(element)) {
        var id = element.indexOf('#') === 0 ? element.slice(1, element.length) : element;
        this._el = document.getElementById(id);
    } else if (element instanceof HTMLElement) {
        this._el = el;
    }

    return this;
};

Diagram.Diagram.prototype.el = function() {
    return this._el;
};

/**
 * Returns the Raphael instance associated to this diagram.
 *
 * If parameter is a Raphael instance, sets it as current paper
 * for this diagram.
 *
 * @param {Raphael}
 * @return {Raphael}
 * @api public
 **/

Diagram.Diagram.prototype.paper = function(paper) {
    if (paper) {
        this._paper = paper;
    }

    this._init();

    return this._paper;
};

Diagram.Diagram.prototype._init = function() {
    if (!this._paper) {
        this._paper = Raphael(this._el, this.width, this.height);
        console.log(this._paper.width, this._paper.height);
        this._paper.setViewBox(0, 0, this._paper.width, this._paper.height);
    }
    this.canvas().addEventListener('click', this);
};

/**
 * Renders the diagram.
 *
 * Initialize the Raphael object and calls renders on its child.
 *
 * @return {Diagram} this
 * @api public
 **/

Diagram.Diagram.prototype.render = function() {
    this._init();

    _.each(this.get('children'), function(child) {
        child.render();
    });

    _.each(this.get('edges'), function(edge) {
        edge.render();
    });

    return this;
};

/**
 * Performs a zoom
 *
 * @param {Number}
 * @param {String}
 * @api public
 **/

Diagram.Diagram.prototype.zoom = function(direction) {
    var paper = this._paper;

    console.log('zoom');
    paper.setViewBox(0, 0, paper.width / 2, paper.height / 2);
};

/**
 * Returns the SVG Element containing this diagram.
 *
 * This is a wrapper method for Raphael.canvas.
 *
 * @return {SVGElement}
 * @api public
 **/

Diagram.Diagram.prototype.canvas = function() {
    return this._paper ? this._paper.canvas : null;
};

/**
 * Removes the diagram and it's content from the canvas.
 *
 * This is a wrapper method for Raphael.remove().
 *
 * @api public
 **/

Diagram.Diagram.prototype.remove = function() {
    if (this._paper) {
        _.each(this.get('children'), function(child) {child.remove();});
        _.each(this.get('edges'), function(child) {child.remove();});
        this._paper.remove();
        this._paper = null;
    }
};

/**
 * Creates a shape from a given function of type Diagram.Shape.
 *
 * @param {Function} func - Shape constructor
 * @param {Object} attributes - Shape init attributes
 * @return {Shape} Returns the Shape object.
 * @api public
 **/

Diagram.Diagram.prototype.createShape = function( func, attributes ) {
    var shape = null;

    if (!func) {
        throw new Error('Cannot create Shape if Shape constructor is missing');
    }

    attributes.diagram = this;
    shape = new func( attributes );

    return shape;
};

/**
 * Removes a Shape.
 *
 * @param {Shape} shape - Shape to be removed
 * @api public
 **/

Diagram.Diagram.prototype.removeShape = function( shape ) {
    if (shape) {
        var children = this.get('children');

        this.set('children', _.reject(children, function(child) {
            return child === shape;
        }));

        this.trigger('remove:children', shape);
    }
};

/**
 * Returns a Shape specified by it's id.
 *
 * @param {Integer} id - Shape id
 * @return {Shape} Returns the Shape or null.
 * @api public
 **/

Diagram.Diagram.prototype.getShape = function(id) {
    var shape = _.find(this.get('children'), function(child) {
        var childID = child.get('id');
        if (childID) {
            return childID === id;
        }
    });

    return shape;
};

/**
 * Creates a Connection from a Diagram.Connection constructor.
 *
 * @param {Function} func - Connection constructor
 * @param {Object} attributes - Connection init attributes
 * @return {Connection} Returns the Connection object.
 * @api public
 *
 **/

Diagram.Diagram.prototype.createConnection = function( func, attributes ) {
    var connection = null;

    if (typeof func === 'function') {
        connection = new func( { diagram: this } );

        if (attributes) {
            var source = attributes.source;
            var target = attributes.target;

            if (source && target) {
                connection.connect(source, target);
            }
        }

        connection.on('remove:source remove:target', function(connection) {
            this.removeConnection( connection );
        }, this);
    }

    return connection;
};

/**
 * Removes the Connection from the diagram. This method will call disconnect and
 * remove on the connection and triggers a remove:edges event.
 *
 * @param {Connection} connection - Connection to be removed
 * @api public
 **/

Diagram.Diagram.prototype.removeConnection = function( connection ) {
    if (connection) {
        var edges = this.get('edges');

        this.set('edges', _.reject(edges, function( edge ) {
            return edge === connection;
        }));

        this.trigger('remove:edges', connection);
    }
};

/**
 * Returns a Connection specified by it's id.
 *
 * @param {Integer} id - Connection id
 * @return {Connection} Returns the Connection or null.
 * @api public
 **/

Diagram.Diagram.prototype.getConnection = function(id) {
    var connection = _.find(this.get('edges'), function(child) {
        var childID = child.get('id');
        if (childID) {
            return childID === id;
        }
    });

    return connection;
};

/**
 * Returns true if a connection can be made.
 * @private
 *
 **/

// TODO: separate change of state in another method.
// Calling this method will change the state of this.currentSource.
Diagram.Diagram.prototype.canConnect = function( node ) {
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
};

/**
 * Connects the node to the previously selected node.
 * @private
 **/

Diagram.Diagram.prototype.connect = function( node ) {
    var connection = null;

    if (this.currentEdge) {
        if (this.currentSource) {
            connection = this.createConnection( this.currentEdge, {
                source: this.currentSource,
                target: node
            });
            this.currentEdge = null;
            this.currentSource = null;
        }
    }

    return connection;
};

// @private
Diagram.Diagram.prototype.handleTextInput = function() {
    var text = this.inputText.value;
    if (text) {
        this.modifiedLabel.setText(text);
        this.modifiedLabel.textForm.parentNode.removeChild(this.modifiedLabel.textForm);
        this.modifiedLabel.textForm = null;
        this.modifiedLabel = null;
        this.inputText = null;
    }
    if (this.repeatInputClick) {
        if (this.modifiedLabel) {
            this.modifiedLabel.textForm.parentNode.removeChild(this.modifiedLabel.textForm);
            this.modifiedLabel.textForm = null;
            this.modifiedLabel = null;
            this.inputText = null;
            this.repeatInputClick = false;
        }
    } else {
        this.repeatInputClick = true;
    }
};

Diagram.Diagram.prototype.handleEvent = function( evt ) {
    var position = Point.getMousePosition( this._paper, evt );
    var el = this._paper.getElementsByPoint(position.x, position.y);

    if (el.length === 0 && this.selected) {
        this.selected.deselect();
    }

    if (this.inputText) {
        this.handleTextInput();
    }

    if (el.length === 0 && this.currentEdge) {
        this.currentEdge = null;
    }
};

/**
 * Returns true if the constructor parameter corresponds to
 * a root Shape, i.e. a Shape that can be added directly to the
 * diagram, as opposed to a contained shape.
 *
 * @private
 **/

Diagram.Diagram.prototype._canCreate = function( func ) {
    var child = _.find(this.child, function(c) {
        return c === func;
    });
    return child !== undefined;
};

/**
 * Load and initialize the diagram from a JSON object.
 *
 * @param {Object} data - JSON object
 * @api public
 *
 **/

Diagram.Diagram.prototype.load = function( data ) {
    if (data.name) {
        this.set('name', data.name);
    }

    if (data.type) {
        this.set('type', data.type);
    }

    var children = this.get('children');
    _.each(data.children, function(child) {
        var loaded = this.loadShape( child );
        if (loaded) {
            children.push( loaded );
        }
    }, this);

    var edges = this.get('edges');
    _.each(data.edges, function( edge ) {
        var loaded = this.loadEdge( edge );
        if (loaded) {
            edges.push( loaded );
        }
    }, this);
};

/**
 * Returns the constructor for a JSON object.
 *
 * @param {String} type - element type
 * @private
 *
 **/

Diagram.Diagram.prototype._getConstructor = function( type ) {
    var names = type.split('.');
    var _object = window;
    for (var i = 0; i < names.length; i++) {
        _object = _object[names[i]];
    }
    return _object;
};

/**
 * Load a Shape from its JSON description.
 *
 * @param {Object} data - JSON object
 * @api private
 *
 **/

Diagram.Diagram.prototype.loadShape = function( data ) {
    if (!data.type) {
        throw new Error('Cannot create Shape, type is undefined');
    }

    var _object = this._getConstructor( data.type );

    if (typeof _object === 'function') {
        return this.createShape(_object, data);
    } else {
        return null;
    }
};

/**
 * Load a Connection from its JSON description.
 *
 * @param {Object} data - JSON object
 * @param {Array} nodes - Shapes already loaded
 * @api private
 *
 **/

Diagram.Diagram.prototype.loadEdge = function( data, nodes ) {
    if (!data.type) {
        throw new Error('Cannot create Edge, type is undefined');
    }

    var _object = this._getConstructor( data.type );
    if (typeof _object === 'function') {
        var children = nodes ? nodes : this.get('children');
        // TODO could be done in one pass.
        var source = _.find(nodes, function(s) { return s.get('id') == data.source; });
        var target = _.find(nodes, function(s) { return s.get('id') == data.target; });

        if (source && target) {
            var edge = new _object({ diagram: this });
            if (edge) {
                edge.connect(source, target);
                return edge;
            }
        }
    }
    return null;
};
