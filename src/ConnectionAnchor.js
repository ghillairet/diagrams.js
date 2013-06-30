/**
 * @name ConnectionAnchor
 * @class
 *
 */
var ConnectionAnchor = DG.ConnectionAnchor = function(shape, position, connectionType) {
    this._shape             = shape;
    this._figure            = shape.figure;
    this._container         = shape.diagram().doc;
    this._position          = position; // ['n', 'w', 's', 'e']
    this._connectionType    = connectionType || DG.Connection;
};

// ConnectionAnchor.positions = ['n', 'w', 's', 'e'];

ConnectionAnchor.create = function(shape) {
    return function(def) {
        return new ConnectionAnchor(shape, def.position, def.connectionType).render();
    };
};

ConnectionAnchor.figure = function(container, point) {
    return container.circle(8).attr({
        cx: point.x,
        cy: point.y,
        fill: 'white',
        'fill-opacity': 1,
        stroke: 'blue',
        'stroke-opacity': 0.4,
        type: 'anchor',
        cursor: 'pointer'
    }).draggable();
};

ConnectionAnchor.onstart = function(anchor, shape, figure) {
    return function() {
        if (!anchor.connection) {
            figure.fixed();
            var clone = anchor.clone().render();
            figure.connectAnchors = _.without(figure.connectAnchors, anchor);
            figure.connectAnchors.push(clone);
            var connection = new anchor._connectionType();
            connection.connect(shape, anchor);
            anchor.connection = connection;
        }
    };
};

ConnectionAnchor.onmove = function(shape) {
    return function() {
        shape.refreshEdges();
    };
};

ConnectionAnchor.onend = function(anchor, shape, figure) {
    return function() {
        var found   = shape.diagram().findShape(function(node) {
            return node !== shape && anchor.isInside(node);
        });
        figure.draggable();
        if (found) {
            anchor.connection._target = found;
            found.inEdges.push(anchor.connection);
            anchor.connection.render();
            anchor.remove();
        }
    };
};

ConnectionAnchor.prototype.isInside = function(shape) {
    var abox = this.wrapper.bbox();
    var box = shape.figure.bbox();

    return abox.x > box.x &&
        (abox.x + abox.width) < (box.x + box.width) &&
        abox.y > box.y &&
        (abox.y + abox.height) < (box.x + box.height);
};

ConnectionAnchor.prototype.bbox = function() {
    return this.wrapper ? this.wrapper.bbox() : null;
};

ConnectionAnchor.prototype.render = function() {
    var position    = this.position();
    var figure      = this._figure;
    var container   = this._container;
    var shape       = this._shape;
    this.wrapper    = ConnectionAnchor.figure(container, position);

    this.wrapper.dragstart  = ConnectionAnchor.onstart(this, shape, figure);
    this.wrapper.dragmove   = ConnectionAnchor.onmove(shape);
    this.wrapper.dragend    = ConnectionAnchor.onend(this, shape, figure);

    return this;
};

ConnectionAnchor.prototype.remove = function() {
    if (this.wrapper) {
        this.wrapper.remove();
        delete this.wrapper;
    }
};

ConnectionAnchor.prototype.position = function() {
    var bbox = this._figure.bbox();
    var position = {};

    if (this._position === 'e') {
        position.x = bbox.x + bbox.width;
        position.y = bbox.y + (bbox.height / 2);
    }
    else if (this._position === 'w') {
        position.x = bbox.x;
        position.y = bbox.y + (bbox.height / 2);
    }
    else if (this._position === 'n') {
        position.x = bbox.x + (bbox.width / 2);
        position.y = bbox.y;
    }
    else {
        position.x = bbox.x + (bbox.width / 2);
        position.y = bbox.y + bbox.height;
    }
    return position;
};

ConnectionAnchor.prototype.clone = function() {
    return new ConnectionAnchor(this._shape, this._position, this._connectionType);
};

