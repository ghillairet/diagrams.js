/**
 * @name Point
 *
 * @class Represents a 2D Point.
 *
 * @param {Integer} x
 * @param {Integer} y
 * @api public
 *
 */

var Point = Ds.Point = function Point(x, y) {
    if (!y && _.isObject(x)) {
        this.x = x.x;
        this.y = x.y;
    } else {
        this.x = x;
        this.y = y;
    }
};

// Calculates angle for arrows

Point.prototype.theta = function(point) {
    return Point.theta(this, point);
};

Point.prototype.equals = function(point) {
    return this.x === point.x && this.y === point.y;
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

/**
 * Returns the Point corresponding to a MouseEvent.
 *
 * @param {Raphael} current Raphael object
 * @param {MouseEvent} mouse event from which obtain the point
 * @api public
 */

Point.get = function(diagram, e) {
    // IE:
    if (window.event && window.event.contentOverflow !== undefined) {
        return new Point(window.event.x, window.event.y);
    }

    // Webkit:
    if (e.offsetX !== undefined && e.offsetY !== undefined) {
        return new Point(e.offsetX, e.offsetY);
    }

    // Firefox, Opera:
    var paper = diagram.paper ? diagram.paper() : diagram;
    var pageX = e.pageX;
    var pageY = e.pageY;
    var el = paper.canvas.parentNode;
    var x = 0, y = 0;
    while(el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        x += el.offsetLeft - el.scrollLeft;
        y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    x = e.pageX - x;
    y = e.pageY - y;

    return new Point(x, y);
};

