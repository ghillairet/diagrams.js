
/**
 * @name Line
 * @class Basic representation of a Line
 *
 */

var Line = function(paper, p1, p2) {
    this.paper = paper;
    this.start = p1;
    this.end = p2;
    this.wrapper = paper.path('M'+this.start.x+','+this.start.y+'L'+this.end.x+','+this.end.y);
    return this;
};

/**
 * Wrapper method for Raphael#attr
 */

Line.prototype.attr = function() {
    return Raphael.el.attr.apply(this.wrapper, arguments);
};

/**
 * Removes the Line from the canvas
 */

Line.prototype.remove = function() {
    this.wrapper.remove();
};

/**
 * Find point of intersection between two lines
 */

Line.prototype.intersection = function(line) {
    var pt1Dir = { x: this.end.x - this.start.x, y: this.end.y - this.start.y },
        pt2Dir = { x: line.end.x - line.start.x, y: line.end.y - line.start.y },
        det = (pt1Dir.x * pt2Dir.y) - (pt1Dir.y * pt2Dir.x),
        deltaPt = { x: line.start.x - this.start.x, y: line.start.y - this.start.y },
        alpha = (deltaPt.x * pt2Dir.y) - (deltaPt.y * pt2Dir.x),
        beta = (deltaPt.x * pt1Dir.y) - (deltaPt.y * pt1Dir.x);

    if (det === 0 || alpha * det < 0 || beta * det < 0) {
        return null;    // no intersection
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
        x: this.start.x + (alpha * pt1Dir.x / det),
        y: this.start.y + (alpha * pt1Dir.y / det)
    };
};

/**
 * Find intersection point with a box.
 */

Line.prototype.findIntersection = function( box ) {
    var points = [
        { p1: box.topLeft, p2: box.topRight },
        { p1: box.topLeft, p2: box.bottomLeft },
        { p1: box.bottomLeft, p2: box.bottomRight },
        { p1: box.bottomRight, p2: box.topRight }
    ];

    for (var i = 0; i < points.length; i++) {
        var boxLine = new Line(this.paper, points[i].p1, points[i].p2);
        var intersection = this.intersection( boxLine );
        boxLine.remove();

        if (intersection) {
            return intersection;
        }
    }

    return null;
};

