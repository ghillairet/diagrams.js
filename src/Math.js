/**
 * Representation of a 2D Point.
 *
 * @name Point
 * @class
 *
 */
var Point = DG.Point = function(x, y) {
    this.x = x;
    this.y = y;
};

Point.prototype.vector = function(point) {
    return Point.vector(this, point);
};

Point.prototype.theta = function(point) {
    return Point.theta(this, point);
};

Point.prototype.add = function(point) {
    this.x += point.y;
    this.y += point.y;
};

Point.prototype.sub = function(point) {
    this.x -= point.x;
    this.y -= point.y;
};

Point.prototype.equals = function(point) {
    if (!point)
        return false;
    else
        return this.x === point.x && this.y === point.y;
};

/**
 * Return Point inside the diagram from a mouse event.
 *
 */
Point.get = function(e) {
    var point;
    if (e && e.offsetX) {
        point = new Point(e.offsetX, e.offsetY);
    } else if (e && e.layerX) {
        point = new Point(e.layerX, e.layerY);
    }
    return point;
};

Point.theta = function(p1, p2) {
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
};

Point.vector = function(p1, p2) {
    return {
        x: p2.x - p1.x,
        y: p2.y - p1.y
    };
};

// Draw a line between two points.
//
var path = function(draw, p1, p2) {
    return {
        path: draw.path('M' + p1.x + ' ' + p1.y + 'L' + p2.x + ' ' + p2.y),
        start: p1,
        end: p2
    };
};


// Return the point of intersection of two lines.
//
var intersection = function(path1, path2) {
    var pt1Dir  = { x: path1.end.x - path1.start.x, y: path1.end.y - path1.start.y },
        pt2Dir  = { x: path2.end.x - path2.start.x, y: path2.end.y - path2.start.y },
        det     = (pt1Dir.x * pt2Dir.y) - (pt1Dir.y * pt2Dir.x),
        deltaPt = { x: path2.start.x - path1.start.x, y: path2.start.y - path1.start.y },
        alpha   = (deltaPt.x * pt2Dir.y) - (deltaPt.y * pt2Dir.x),
        beta    = (deltaPt.x * pt1Dir.y) - (deltaPt.y * pt1Dir.x);

    if (det === 0 || alpha * det < 0 || beta * det < 0) {
        return null; // no intersection
    }

    if (det > 0) {
        if (alpha > det || beta > det) {
            return null;
        }
    } else {
        if (alpha < det || beta < det) {
            return null;
        }
    }

    return {
        x: path1.start.x + (alpha * pt1Dir.x / det),
        y: path1.start.y + (alpha * pt1Dir.y / det)
    };
};


// Return the point of intersection between a line and a Bbox.
//
var findIntersection = function(draw, line, box) {
    var topLeft     = { x: box.x, y: box.y },
        topRight    = { x: box.x + box.width, y: box.y },
        bottomLeft  = { x: box.x, y: box.y + box.height },
        bottomRight = { x: box.x + box.width, y: box.y + box.height },

        points = [
            { p1: topLeft, p2: topRight },
            { p1: topLeft, p2: bottomLeft },
            { p1: bottomLeft, p2: bottomRight },
            { p1: bottomRight, p2: topRight }
        ],

        i = 0,
        l = points.length,
        boxLine,
        intersect;

    for (; i < l; i++) {
        boxLine = path(draw, points[i].p1, points[i].p2);
        intersect = intersection(line, boxLine);
        boxLine.path.remove();

        if (intersect) {
            return intersect;
        }
    }

    return null;
};

