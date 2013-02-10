/**
 * @name Connection
 * @class Represents a connection between two shapes
 * @augments DiagramElement
 */

var Connection = Ds.Connection = Ds.DiagramElement.extend(/** @lends Connection.prototype */{
    toolbox: true,

    constructor: function(attributes) {
        Ds.DiagramElement.apply(this, [attributes]);

        this.set('sourceAnchor', new ConnectionAnchor({ connection: this }));
        this.set('targetAnchor', new ConnectionAnchor({ connection: this }));
        this.vertices = [];

        this.labels = _.map(this.labels || [], function(label) {
            return new ConnectionLabel({ connection: this,
                position: label.position,
                text: label.text
        });}, this);

        if (this.toolbox) this._tool = new ToolBox({ element: this });

        if (this.diagram) {
            this.diagram.get('edges').push(this);
            this.diagram.trigger('add:edges', this);
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
        if (this.wrapper) this.wrapper.remove();
        if (this.dummy) this.dummy.remove();
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

    /**
     * Renders the connection on canvas, will only render if the
     * source and target are set.
     */

    render: function() {
        var boxes = this._boxes(),
            sbox = boxes[0],
            tbox = boxes[1],
            points = this._points(sbox, tbox),
            sPoint = points[0],
            tPoint = points[1],
            th, c1r, c2r;

        if (!sPoint || !tPoint) return this;

        this.remove();

        if (this.vertices.length) {
            th = theta(this.vertices[this.vertices.length - 1], tbox.center);
        } else {
            th = theta(sbox.center, tbox.center);
        }
        c1r = 360 - th.degrees + 180;
        c2r = 360 - th.degrees;

        this.get('sourceAnchor').move(sPoint).render().hide();
        this.get('targetAnchor').move(tPoint).render().hide();

        var paths = path(this.get('sourceAnchor'), this.get('targetAnchor'), this.vertices, false),
            paper = this.paper();

        this.wrapper = paper.path(paths.join(' '));
        this.wrapper.attr(this.attributes);
        this.wrapper.controller = this;

        this.startArrow = new ConnectionEnd(paper, sPoint, c1r, th.radians, this.start);
        this.startArrow.render();
        this.endArrow = new ConnectionEnd(paper, tPoint, c2r, th.radians, this.end);
        this.endArrow.render();

        // Dummy is a larger line receiving clicks from users
        this.dummy = paper.path(paths.join(' '));
        this.dummy.connection = this;
        this.dummy.attr({ cursor: 'pointer', fill: 'none', opacity: 0, 'stroke-width': 8 });

        var me = this;
        this.dummy.dblclick(function(e) { me.trigger('dblclick', e); });
        this.dummy.click(function(e) { me.trigger('click', e); });

        this.on('click', this._handleClick);
        this.on('dblclick', this._createFlexPoint);

        if (this.labels) _.each(this.labels, function(l) { l.render(); });

        return this;
    },

    _handleClick: function(e) {
        var tool = this._tool,
            diagram = this.diagram;

        this.select();

        if (tool) tool.render();
        if (diagram.selected)
            diagram.selected.deselect();
    },

    _createFlexPoint: function(e) {
        this.addPoint({ x: e.clientX, y: e.clientY });
        this.select();
    },

    /**
     * Selects the connection. This method triggers a
     * select event
     */

    select: function() {
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

        src.outs.push(this);
        tgt.ins.push(this);

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

    /**
     * Returns a JSON representation of the connection
     */

    toJSON: function() {
        var clone = {};
        clone.source = this.get('source').get('id');
        clone.target = this.get('target').get('id');
        clone.type = this.get('type');
        clone.id = this.get('id');
        clone.sourceAnchor = this.get('sourceAnchor');
        clone.targetAnchor = this.get('targetAnchor');
        clone.x = this.get('x');
        clone.y = this.get('y');

        if (this.wrapper) {
            clone.attr = this.wrapper.attr();
        }

        return clone;
    },

    // Returns the ABox of this source and target shapes, or if
    // during a drag state returns the dragged anchor ABox.

    _boxes: function() {
        var paper = this.paper(),
        sbox, tbox;

        if (this.state && this.state === 'dragging') {
            if (this.dragger === this.get('sourceAnchor')) {
                sbox = this.get('sourceAnchor').wrapper.getABox();
                tbox = this.get('target').wrapper.getABox();
            } else {
                sbox = this.get('source').wrapper.getABox();
                tbox = this.get('targetAnchor').wrapper.getABox();
            }
        } else {
            sbox = this.get('source').wrapper.getABox();
            tbox = this.get('target').wrapper.getABox();
        }

        return [sbox, tbox];
    },

    // Returns the points of intersection between the source and target
    // boxes and the Line joining their center. The points of intersection
    // are the start and end of the Connection.

    _points: function(sbox, tbox) {
        var paper = this.paper(),
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

        return [sPoint, tPoint];
    }

});

_.extend(Ds.Connection.prototype, Ds.Events);

/**
 * @name FlexPoint
 * @class Represents a flex point being part of a connection
 *
 */

function FlexPoint(connection, point) {
    this.connection = connection;
    this.paper = connection.paper();
    this.x = point.x;
    this.y = point.y;
}

/**
 * Renders the FlexPoint on the canvas
 */

FlexPoint.prototype.render = function() {
    this.remove();

    this.wrapper = this.paper.rect(this.x - 3, this.y - 3, 6, 6, 0);
    this.wrapper.attr({ fill: 'black', stroke: 'none', cursor: 'pointer' });

    this.drag();
    this.wrapper.toFront();

//    this.wrapper.dblclick(this.remove);

    return this;
};

/**
 * Removes the FlexPoint from the canvas
 */

FlexPoint.prototype.remove = function() {
    if (this.wrapper) this.wrapper.remove();
};

FlexPoint.prototype.drag = function() {
    if (!this.wrapper) return this;

    var point = this,
        connection = this.connection,
        move = function(dx, dy) {
            this.attr({ x: this.ox + dx, y: this.oy + dy });
            var box = this.getABox();
            point.x = box.center.x;
            point.y = box.center.y;
            connection.render();
        },
        start = function() {
            this.o();
            point.state = 'dragging';
            this.attr('cursor', 'move');
        },
        end = function() {
            delete point.state;
            connection.deselect();
        };

    this.wrapper.drag(move, start, end);
};

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

// Calculates angle for arrows

function theta(p1, p2) {
    var y = -(p2.y - p1.y), // invert the y-axis
        x = p2.x - p1.x,
        rad = Math.atan2(y, x);

    if (rad < 0) { // correction for III. and IV. quadrant
        rad = 2 * Math.PI + rad;
    }

    return {
        degrees: 180 * rad / Math.PI,
            radians: rad
    };
}


