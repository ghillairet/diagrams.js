
// Connection

var Connection = Ds.Connection = Ds.DiagramElement.extend({
    toolbox: true,

    constructor: function(attributes) {
        Ds.DiagramElement.apply(this, [attributes]);

        this.set('sourceAnchor', new ConnectionAnchor({ connection: this }));
        this.set('targetAnchor', new ConnectionAnchor({ connection: this }));
        this.vertices = [];

        if (this.toolbox) this._tool = new ToolBox({ element: this });

        if (this.diagram) {
            this.diagram.get('edges').push(this);
            this.diagram.trigger('add:edges', this);
        }

        this.initialize.apply(this, arguments);
    },

    initialize: function() {},

    addPoint: function(point) {
        var fp = new FlexPoint(this, point);
        this.vertices.push(fp);
        this.vertices = _.sortBy(this.vertices, function(v) { return v.x; });
        this.render();

        return this;
    },

    remove: function(fromDiagram) {
        if (this.wrapper) this.wrapper.remove();
        if (this.dummy) this.dummy.remove();
        if (this.startArrow) this.startArrow.remove();
        if (this.endArrow) this.endArrow.remove();
        if (this._tool) this._tool.remove();

        _.each(this.vertices, function(v) {
            if (!v.state) v.remove();
        });

        if (fromDiagram) {
            this.disconnect();
            this.get('sourceAnchor').remove();
            this.get('targetAnchor').remove();
            this.diagram.removeConnection(this);
        }

        return this;
    },

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

        this.dummy.dblclick(this.dblclick);
        this.dummy.click(this.click);

        return this;
    },

    click: function(e) {
        var connection = this.connection;
        connection.select();

        if (connection._tool) {
            connection._tool.render();
        }

        if (connection.diagram.selected) {
            connection.diagram.selected.deselect();
        }
    },

    dblclick: function(e) {
        var connection = this.connection;
        connection.addPoint({ x: e.clientX, y: e.clientY });
        connection.select();
    },

    onselect: function() {

    },

    select: function() {
        this.get('sourceAnchor').toFront().show();
        this.get('targetAnchor').toFront().show();
        _.each(this.vertices, function(v) { v.render(); });
    },

    deselect: function() {
        this.get('sourceAnchor').toFront().hide();
        this.get('targetAnchor').toFront().hide();
        _.each(this.vertices, function(v) { v.remove(); });
    },

    connect: function(src, tgt) {
        if (!src || !tgt) return this;

        this.set('source', src);
        this.set('target', tgt);

        this.get('sourceAnchor').attach( src );
        this.get('targetAnchor').attach( tgt );

        src.trigger('connect:source', this);
        tgt.trigger('connect:target', this);

        src.outs.push(this);
        tgt.ins.push(this);

        return this;
    },

    disconnect: function() {
        var source = this.get('source');
        var target = this.get('target');

        if (source) source.disconnect(this, 'out');
        if (target) target.disconnect(this, 'in');

        this.set('source', null);
        this.set('target', null);

        return this;
    },

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

// FlexPoint

function FlexPoint(connection, point) {
    this.connection = connection;
    this.paper = connection.paper();
    this.x = point.x;
    this.y = point.y;
}

FlexPoint.prototype.render = function() {
    this.remove();

    this.wrapper = this.paper.rect(this.x - 3, this.y - 3, 6, 6, 0);
    this.wrapper.attr({ fill: 'black', stroke: 'none', cursor: 'pointer' });

    this.drag();
    this.wrapper.toFront();

//    this.wrapper.dblclick(this.remove);

    return this;
};

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


