/**
 * @name Connection
 * @class
 *
 */
var Connection = DG.Connection = function(options) {
    this._points    = [];

    this._source.outEdges.push(this);
    this.initialize.apply(this, [options]);
};

Connection.extend = extend;

_.extend(Connection.prototype, DG.Events, {

    attr: {
        stroke: 'black',
        'stroke-width': 1
    },
    end: {
        fill: 'black',
        type: 'basic'
    },
    start: null,

    labels: [],

    initialize: function() {},

    connect: function(source, target) {
        this._diagram               = source.diagram();
        this._doc                   = this._diagram.doc;
        this._source                = source;
        this._target                = target;

        if (source.outEdges) source.outEdges.push(this);
        if (target.inEdges) target.inEdges.push(this);

        return this;
    },

    render: function() {
        this.removeWrapper();

        var boxes       = this.boxes(),
            points      = connectionPoints(this._doc, boxes, this._points),
            src, tgt, path;

        if (points.length === 2) {
            src = points[0];
            tgt = points[1];

            if (src !== null && tgt !== null) {
                path = createPath(src, tgt, this._points);

                this.wrapper = this._doc.path(path, true);
                this.wrapper.attr(this.attr);
                this.wrapper.attr({
                    cursor: 'pointer',
                    fill: 'none'
                });

                this.renderEnd(boxes[0], boxes[1], points);

                this.wrapper.dblclick(FlexPoint.create(this));
            }
        }
        return this;
    },

    renderEnd: function(sbox, tbox, points) {
        var doc     = this._doc;
        var spoint  = points[0];
        var tpoint  = points[1];
        var th      = Point.theta({ x: sbox.cx, y: sbox.cy }, { x: tbox.cx, y: tbox.cy });
        var c1r     = 360 - th.degrees + 180;
        var c2r     = 360 - th.degrees;

        var arrow;
        if (this.start) {
            arrow = Arrows.get(this.start.type);
            this._startArrow = renderConnectionEnd(doc, spoint, arrow(), th.radians, c1r).attr(this.start);
        }
        if (this.end) {
            arrow = Arrows.get(this.end.type);
            this._endArrow = renderConnectionEnd(doc, tpoint, arrow(), th.radians, c2r).attr(this.end);
        }

        return this;
    },

    addPoint: function(point) {
        this._points.push(point);
        this._points = _.sortBy(this._points, function(p) { return p.x; });
        this.render();
        return this;
    },

    removePoint: function(point) {
        this._points = _.without(this._points, point);
        this.render();
        return this;
    },

    removeWrapper: function() {
        if (this._startArrow)   this._startArrow.remove();
        if (this._endArrow)     this._endArrow.remove();
        _.each(this._points, function(p) { p.removeWrapper(); });

        if (this.wrapper) {
            this.wrapper.off();
            this.wrapper.remove();
        }
    },

    remove: function() {
        this.removeWrapper();
        this._source.outEdges = _.without(this._source.outEdges, this._source);
        this._target.inEdges  = _.without(this._target.inEdges, this._target);
        this._diagram.remove(this);
    },

    boxes: function() {
        return [
            this._source.figure.bbox(),
            this._target instanceof Shape ? this._target.figure.bbox() : this._target.wrapper.bbox()
        ];
    }

});

var createPath = function(source, target, points) {
    var start = 'M' + source.x + ' ' + source.y + 'L';
    var end   = target.x + ' ' + target.y;
    return _.reduce(points, function(memo, p) { return memo + p.x + ' ' + p.y + 'L'; }, start) + end;
};

var connectionPoints = function(doc, boxes, vertices) {
    var sbox            = boxes[0],
        tbox            = boxes[1],
        centerSource = { x: sbox.cx, y: sbox.cy },
        centerTarget = { x: tbox.cx, y: tbox.cy },
        centerPath, sourcePoint, targetPoint;

    if (vertices.length) {
        centerPath = path(doc, centerSource, vertices[0]);
        sourcePoint = findIntersection(doc, centerPath, sbox);
        centerPath.path.remove();
        centerPath = path(doc, vertices[vertices.length-1], centerTarget);
        targetPoint = findIntersection(doc, centerPath, tbox);
        centerPath.path.remove();
    } else {
        centerPath   = path(doc, centerSource, centerTarget),
        sourcePoint  = findIntersection(doc, centerPath, sbox),
        targetPoint  = findIntersection(doc, centerPath, tbox);
        centerPath.path.remove();
    }

    return [ sourcePoint, targetPoint ];
};

/**
 * @name FlexPoint
 *
 */
var FlexPoint = function(connection, point) {
    this.x              = point.x;
    this.y              = point.y;
    this._connection    = connection;
    this._doc           = connection._doc;
};

FlexPoint.create = function(connection) {
    return function(e) {
        var flex = new FlexPoint(connection, Point.get(e));
        connection.addPoint(flex);
        return flex.render();
    };
};

FlexPoint.onstart = function() {
    return function() {};
};

FlexPoint.onmove = function(point) {
    return function() {
        point.x = this.cx();
        point.y = this.cy();
        point._connection.render();
    };
};

FlexPoint.onend = function(point) {
    return function() {
        point.x = this.cx();
        point.y = this.cy();
    };
};

FlexPoint.remove = function(point) {
    return function() {
        this.remove();
        this.off();
        delete point.wrapper;
        point._connection.removePoint(point);
    };
};

FlexPoint.prototype.render = function() {
    this.removeWrapper();
    this.wrapper = this._doc.rect(6, 6).attr({
        fill: 'black',
        cursor: 'pointer'
    }).center(this.x, this.y);

    this.wrapper.dragstart  = FlexPoint.onstart(this);
    this.wrapper.dragend    = FlexPoint.onend(this);
    this.wrapper.dragmove   = FlexPoint.onmove(this);
    this.wrapper.draggable();

    this.wrapper.dblclick(FlexPoint.remove(this));
    return this;
};

FlexPoint.prototype.removeWrapper = function() {
    if (this.wrapper) this.wrapper.remove();
};

/**
 * ConnectionEnd
 */

var renderConnectionEnd = function(doc, point, arrow, radians, angle) {
    var x = point.x + (-1.5 * (arrow.dx - 1) * Math.cos(radians));
    var y = point.y + (1.5 * (arrow.dy - 1) * Math.sin(radians));
    return doc.path(arrow.path.join(' '), true)
        .attr(arrow.attr)
        .transform({
            x: x,
            y: y,
            rotation: angle
        });
};
