/**
 * @name Connection
 * @class Represents a connection between two shapes
 * @augments DiagramElement
 */

var Connection = Ds.Connection = Ds.DiagramElement.extend(/** @lends Connection.prototype */{
    toolbox: true,

    constructor: function(attributes) {
        if (!attributes) attributes = {};
        Ds.DiagramElement.apply(this, [attributes]);

        this.set('sourceAnchor', new ConnectionAnchor({ connection: this }));
        this.set('targetAnchor', new ConnectionAnchor({ connection: this }));
        this.vertices = [];

        /*
        this.labels = _.map(this.labels || [], function(label) {
            return new ConnectionLabel({ connection: this,
                position: label.position,
                text: label.text
        });}, this);
        */
//        this.labels = [];

        if (this.toolbox) this._tool = new ToolBox({ element: this });

        if (attributes.source && attributes.target) {
            this.connect(attributes.source, attributes.target);
        }

        this.initialize.apply(this, arguments);
    },

    initialize: function() {},

    /**
     * Adds a FlexPoint at the given Point
     *
     * @param {Point}
     */

    addPoint: function(point) {
        var fp = new FlexPoint(this, point);
        this.vertices.push(fp);
        this.vertices = _.sortBy(this.vertices, function(v) { return v.x; });
        this.render();

        return this;
    },

    /**
     * Removes the connection from the canvas. if true is passed as
     * argument, also removes the connection from the diagram.
     *
     * @param {boolean} diagram - if true also removes from diagram
     *
     */

    remove: function(diagram) {
        if (this.wrapper) {
            this.unBindEvents();
            this.wrapper.remove();
            this.dummy.remove();
        }

        if (this.startArrow) this.startArrow.remove();
        if (this.endArrow) this.endArrow.remove();
        if (this._tool) this._tool.remove();
        if (this.labels) _.each(this.labels, function(l) { l.remove(); });

        _.each(this.vertices, function(v) {
            if (!v.state) v.remove();
        });

        if (diagram) {
            this.disconnect();
            this.get('sourceAnchor').remove();
            this.get('targetAnchor').remove();
            this.diagram.removeConnection(this);
        }

        this.off('click', this._handleClick);
        this.off('dblclick', this._createFlexPoint);

        return this;
    },

    renderConnectionEnd: function(boxes, points) {
        var paper = this.renderer();
        var sbox = boxes[0];
        var tbox = boxes[1];
        var sPoint = points[0];
        var tPoint = points[1];
        var th;

        if (this.vertices.length) {
            th = Point.theta(this.vertices[this.vertices.length - 1], tbox.center);
        } else {
            th = Point.theta(sbox.center, tbox.center);
        }

        // angles for arrows
        var c1r = 360 - th.degrees + 180;
        var c2r = 360 - th.degrees;

        this.startArrow = new ConnectionEnd(paper, sPoint, c1r, th.radians, this.start);
        this.endArrow = new ConnectionEnd(paper, tPoint, c2r, th.radians, this.end);
        this.startArrow.render();
        this.endArrow.render();
    },

    renderAnchors: function(points) {
        var sPoint = points[0];
        var tPoint = points[1];

        this.get('sourceAnchor').move(sPoint).render().hide();
        this.get('targetAnchor').move(tPoint).render().hide();
    },

    /**
     * Creates the connection's path between the source and target anchors and the in
     * between flex points.
     *
     * @private
     */

    createPath: function() {
        var paths = path(this.get('sourceAnchor'), this.get('targetAnchor'), this.vertices, false),
            paper = this.renderer();

        this.wrapper = paper.path(paths.join(' '));
        this.wrapper.attr(this.attributes);
        this.wrapper.controller = this;

        return paths;
    },

    /*
     * Creates a larger path on top of the connection's path to receive
     * user events.
     *
     * @private
     */

    createEventPath: function(paths) {
        var paper = this.renderer();
        // Dummy is a larger line receiving clicks from users
        this.dummy = paper.path(paths.join(' '));
        this.dummy.connection = this;
        this.dummy.attr({ cursor: 'pointer', fill: 'none', opacity: 0, 'stroke-width': 8 });
    },

    _events: [
        'click', 'dblclick',
        'mouseover', 'mouseout'
    ],

    /**
     * @private
     */

    bindEvents: function() {
        var connection = this;
        var wrapper = this.dummy;
        var createHandler = function(eve) {
            return {
                eve: eve,
                handler: function(e) { connection.trigger(eve, e); }
            };
        };
        var bind = function(call) { wrapper[call.eve](call.handler); };

        this.eveHandlers = _.map(this._events, createHandler);
        _.each(this.eveHandlers, bind);
    },

    /**
     * @private
     */

    unBindEvents: function() {
        var wrapper = this.dummy;
        var unbind = function(call) { wrapper['un' + call.eve](call.handler); };

        _.each(this.eveHandlers, unbind);
        this.eveHandlers.length = 0;
    },

    /**
     * Renders the connection on canvas, will only render if the
     * source and target are set.
     */

    render: function() {
        var boxes = this.getBoxes();
        var points = this.getPoints(boxes);

        if (points.length !== 2) return this;

        this.remove();

        this.renderAnchors(points);
        this.createEventPath(this.createPath());
        this.renderConnectionEnd(boxes, points);
        this.bindEvents();

        this.on('click', this.showToolBox);
        this.on('click', this.select);
        this.on('dblclick', this.createFlexPoint);

        if (this.labels) _.each(this.labels, function(l) { l.render(); });

        return this;
    },

    showToolBox: function(e) {
        var tool = this._tool;
        var diagram = this.diagram;

        if (tool) tool.render();
    },

    createFlexPoint: function(e) {
        var point = Point.get(this.diagram, e);
        this.addPoint(point);
        this.select();
    },

    /**
     * Selects the connection. This method triggers a
     * select event
     */

    select: function() {
        this.diagram.setSelection(this);
        this.get('sourceAnchor').toFront().show();
        this.get('targetAnchor').toFront().show();
        _.each(this.vertices, function(v) { v.render(); });
        this.trigger('select');
    },

    /**
     * Deselects the connection. This method triggers a
     * deselect event
     */

    deselect: function() {
        this.get('sourceAnchor').toFront().hide();
        this.get('targetAnchor').toFront().hide();
        _.each(this.vertices, function(v) { v.remove(); });
        this.trigger('deselect');
    },

    /**
     * Connects the connection to a source and a target Shape. This
     * method triggers connect, connect:source and connect:target
     * events
     *
     * @param {Shape} source
     * @param {Shape} target
     */

    connect: function(src, tgt) {
        if (!src || !tgt) return this;

        this.set('source', src);
        this.set('target', tgt);

        this.get('sourceAnchor').attach( src );
        this.get('targetAnchor').attach( tgt );

        src.trigger('connect:source', this);
        tgt.trigger('connect:target', this);
        this.trigger('connect');

        src.get('outs').push(this);
        tgt.get('ins').push(this);

        return this;
    },

    /**
     * Disconnects the connection from it's source
     * and target shapes. This method triggers a disconnect
     * event
     */

    disconnect: function() {
        var source = this.get('source');
        var target = this.get('target');

        if (source) source.disconnect(this, 'out');
        if (target) target.disconnect(this, 'in');

        this.set('source', null);
        this.set('target', null);
        this.trigger('disconnect');

        return this;
    },

    connectByDragging: function(source, e) {
        var diagram = this.diagram;
        var paper = diagram.renderer();
        var connection = this;
        var dragger = this.dragger = this.get('targetAnchor');
        var draggerPoint = Point.get(paper, e);

        this.set('source', source);
        this.get('sourceAnchor').attach(source);
        source.get('outs').push(this);

        this.state = 'dragging';
        this.dragger.move(draggerPoint);
        this.dragger.render();

        var onmove = function(e) {
            var point = Point.get(paper, e);
            dragger.move(point);
            connection.render();
        };
        var onup = function(e) {
            var underShape = dragger.getConnectableElement();
            if (underShape) {
                dragger.establishConnection(underShape);
                diagram.off('mouseup', onup);
                diagram.off('mousemove', onmove);
                diagram.toBack();
            }
        };
        diagram.toFront();
        diagram.on('mousemove', onmove);
        diagram.on('mouseup', onup);
    },

    canConnect: function(shape, position) {
        return true;
    },

    /**
     * Returns a JSON representation of the connection
     */

    toJSON: function() {
        var clone = {};
        clone.source = this.get('source').get('id');
        clone.target = this.get('target').get('id');
        clone.type = this.get('type');
        clone.id = this.id;
        clone.sourceAnchor = this.get('sourceAnchor');
        clone.targetAnchor = this.get('targetAnchor');
        return clone;
    },

    // Returns the ABox of this source and target shapes, or if
    // during a drag state returns the dragged anchor ABox.

    getBoxes: function() {
        var paper = this.renderer(),
        sbox, tbox;

        if (this.state === 'dragging') {
            if (this.dragger === this.get('sourceAnchor')) {
                sbox = this.get('sourceAnchor').bounds();
                tbox = this.get('target').bounds();
            } else {
                sbox = this.get('source').bounds();
                tbox = this.get('targetAnchor').bounds();
            }
        } else {
            sbox = this.get('source').bounds();
            tbox = this.get('target').bounds();
        }

        return [sbox, tbox];
    },

    // Returns the points of intersection between the source and target
    // boxes and the Line joining their center. The points of intersection
    // are the start and end of the Connection.

    getPoints: function(boxes) {
        var paper = this.renderer(),
            sbox = boxes[0],
            tbox = boxes[1],
            line, sPoint, tPoint;

        if (this.vertices.length) {
            line = new Line(paper, sbox.center, this.vertices[0]);
            sPoint = line.findIntersection(sbox);
            line.remove();
            line = new Line(paper, this.vertices[this.vertices.length - 1], tbox.center);
            tPoint = line.findIntersection(tbox);
            line.remove();
        } else {
            line = new Line(paper, sbox.center, tbox.center);
            sPoint = line.findIntersection(sbox);
            tPoint = line.findIntersection(tbox);
            line.remove();
        }

        if (!sPoint) sPoint = { x: sbox.xCenter, y: sbox.yMiddle };
        if (!tPoint) tPoint = { x: tbox.xCenter, y: tbox.yMiddle };

        return [new Point(sPoint), new Point(tPoint)];
    }

});

_.extend(Ds.Connection.prototype, Ds.Events);

//
// Helpers
//

// Returns the Path for the Connection

function path(start, end, vertices, smooth) {
    var paths = ["M", start.x, start.y],
        i = 0,
        l = vertices.length;

    for (; i < l; i++) {
        paths.push("L", vertices[i].x, vertices[i].y);
    }
    paths.push("L", end.x, end.y);

    return paths;
}

