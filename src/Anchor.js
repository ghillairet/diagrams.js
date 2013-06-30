/**
 * @name Anchor
 * @class
 *
 */
var Anchor = DG.Anchor = function(shape, position) {
    this._shape     = shape;
    this._figure    = shape.figure;
    this._container = shape.diagram().doc;
    this._position  = position;
};

Anchor.positions = ['ne', 'se', 'sw', 'nw'];

Anchor.create = function(shape) {
    return function(position) {
        return new Anchor(shape, position).render();
    };
};

Anchor.figure = function(container, point, position) {
    return container.rect(6, 6).attr({
        x: point.x,
        y: point.y,
        fill: 'blue',
        'fill-opacity': 0.2,
        stroke: 'none',
        'stroke-width': 0,
        type: 'anchor',
        cursor: position + '-resize'
    }).draggable();
};

Anchor.onstart = function(shape, figure, anchor) {
    return function() {
        _.each(figure.selectAnchors, function(a) {
            if (a !== anchor) a.remove();
        });
        figure.fixed();
        figure.hideConnectAnchors();
        figure.hideDeleteAction();
        shape.hideChildren();
    };
};

Anchor.onmove = function(shape, figure, place) {
    return function(delta) {
        var bbox = figure.bbox(),
            x, y, width, height;

        if (figure.od) {
            x = delta.x - figure.od.x;
            y = delta.y - figure.od.y;
            figure.od = delta;
        } else {
            x = delta.x;
            y = delta.y;
            figure.od = delta;
        }

        if (place === 'se') {
            width = bbox.width + x;
            height = bbox.height + y;
        }
        else if (place === 'ne') {
            width = bbox.width + x;
            height = bbox.height - y;
            figure.attr({ y: bbox.y + y });
        }
        else if (place === 'nw') {
            width = bbox.width - x;
            height = bbox.height - y;
            figure.attr({ x: bbox.x + x, y: bbox.y + y });
        }
        else {
            width = bbox.width - x;
            height = bbox.height + y;
            figure.attr({ x: bbox.x + x });
        }

        width = width > 0 ? width : 1;
        height = height > 0 ? height : 1;

        figure.size(width, height);
        shape.refreshEdges();
    };
};

Anchor.onend = function(shape, figure) {
    return function() {
        figure.deselect();
        figure.draggable();
        shape.showChildren();
        delete figure.od;
    };
};

Anchor.prototype.render = function() {
    var position    = this.position(),
        place       = this._position,
        shape       = this._shape,
        figure      = this._figure,
        container   = this._container;

    this.wrapper            = Anchor.figure(container, position, place);
    this.wrapper.dragstart  = Anchor.onstart(shape, figure, this);
    this.wrapper.dragmove   = Anchor.onmove(shape, figure, place);
    this.wrapper.dragend    = Anchor.onend(shape, figure);

    return this;
};

Anchor.prototype.remove = function() {
    if (this.wrapper) {
        this.wrapper.remove();
        delete this.wrapper;
    }
};

Anchor.prototype.position = function() {
    var bbox = this._figure.bbox();
    var position = {};

    if (this._position === 'nw') {
        position.x = bbox.x - 3;
        position. y = bbox.y - 3;
    }
    else if (this._position === 'ne') {
        position.x = (bbox.x + bbox.width) - 3;
        position. y = bbox.y - 3;
    }
    else if (this._position === 'se') {
        position.x = (bbox.x + bbox.width) - 3;
        position. y = (bbox.y + bbox.height) - 3;
    }
    else {
        position.x = bbox.x - 3;
        position.y = (bbox.y + bbox.height) - 3;
    }
    return position;
};

