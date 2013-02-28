
// Raphael extensions for Diagrams.js.

var isNatural = function(number) {
    if (_.isNumber(number) && _.isFinite(number)) {
        return number > 0;
    } else {
        return false;
    }
};

//  Override Raphael

Raphael.el.is = function (type) {
    return this.type === type;
};

Raphael.el.x = function () {
    switch (this.type) {
    case 'ellipse':
    case 'circle':
        return this.attr('cx');
    default:
        return this.attr('x');
    }
};

Raphael.el.y = function () {
    switch (this.type) {
    case 'ellipse':
    case 'circle':
        return this.attr('cy');
    default:
        return this.attr('y');
    }
};

/**
var resizeEllipse = function(dx, dy, direction, min, limits) {
    if (_.include(['ne', 'nw', 'n'], direction)) {
        dy = -dy;
    }
    if (_.include(['nw', 'sw', 'n'], direction)) {
        dx = -dx;
    }
    var sumx = this.orx + dx;
    var sumy = this.orx + dy;
    return {
        rx: isNatural(sumx) ? sumx : this.orx,
            ry: isNatural(sumy) ? sumy : this.ory
    };
};

var resizeCircle = function(dx, dy, direction, min, limits) {
    if (_.include(['ne', 'nw', 'n'], direction)) {
        dy = -dy;
    }
    var sumr = this.or + (dy < 0 ? -1 : 1) * Math.sqrt(2*dy*dy);
    return {
        r: isNatural(sumr) ? sumr : this.or
    };
};

var resizeRect = function(dx, dy, direction, min, limits) {
    var x = this.ox, y = this.oy, w = this.ow, h = this.oh;

    if (direction !== 'n' && direction !== 's') {
        w = this.ow + dx;
    }
    if (direction !== 'w' && direction !== 'e') {
        h = this.oh + dy;
    }
    if (_.include(['sw', 'nw', 'w'], direction)) {
        w = this.ow - dx;
        if (w < min.width) {
            dx = dx - (min.width - w);
        }
        x = this.ox + dx;
    }
    if (_.include(['ne', 'nw', 'n'], direction)) {
        h = this.oh - dy;
        if (h < min.height) {
            dy = dy - (min.height - h);
        }
        y = this.oy + dy;
    }

    if (h < min.height) h = min.height;
    if (w < min.width) w = min.width;
    if (w > limits.width) w = limits.width;
    if (h > limits.height) h = limits.height;
    if (x < limits.x) x = limits.x;
    if (y < limits.y) y = limits.y;

    return { width: w, height: h, y: y, x: x };
};

Raphael.el.rdxy = function(dx, dy, direction, min, limits) {
    switch (this.type) {
    case 'ellipse':
        return resizeEllipse.apply(this, [dx, dy, direciton, min, limits]);
    case 'circle':
        return resizeCircle.apply(this, [dx, dy, direction, min, limits]);
    case 'rect':
        return resizeRect.apply(this, [dx, dy, direction, min, limits]);
    default:
        return {};
    }
};
**/

Raphael.el.o = function () {
    var attr = this.attr();

    this.oa = _.clone(attr);
    this.oa.fill = this.attr('fill'); // for gradients.
    if (this.oa['fill-opacity'] === undefined) {
        this.oa['fill-opacity'] = 1;
    }
    this.ox = this.x();
    this.oy = this.y();
    this.ow = attr.width;
    this.oh = attr.height;
    this.or = attr.r;
    this.orx = attr.rx;
    this.ory = attr.ry;
    return this;
};

Raphael.el.reset = function() {
    var attrs = this.oa;

    if (!attrs) return this;

    // changes coordinates and sizes
    // reset other attributes.
    attrs.width = this.attrs.width;
    attrs.height = this.attrs.height;
    attrs.r = this.attrs.r;
    attrs.cx = this.attrs.cx;
    attrs.cy = this.attrs.cy;
    attrs.x = this.attrs.x;
    attrs.y = this.attrs.y;

    this.attr(attrs);

    delete this.oa;

    return this;
};

Raphael.el.getABox = function() {
    var b = this.getBBox();
    var o = {
        x: b.x,
        y: b.y,
        width: b.width,
        height: b.height,

        xLeft: b.x,
        xCenter: b.x + b.width / 2,
        xRight: b.x + b.width,

        yTop: b.y,
        yMiddle: b.y + b.height / 2,
        yBottom: b.y + b.height
    };

    // center
    o.center      = { x: o.xCenter,   y: o.yMiddle };

    // edges
    o.topLeft     = { x: o.xLeft,     y: o.yTop };
    o.topRight    = { x: o.xRight,    y: o.yTop };
    o.bottomLeft  = { x: o.xLeft,     y: o.yBottom };
    o.bottomRight = { x: o.xRight,    y: o.yBottom };

    // corners
    o.top         = { x: o.xCenter,   y: o.yTop };
    o.bottom      = { x: o.xCenter,   y: o.yBottom };
    o.left        = { x: o.xLeft,     y: o.yMiddle };
    o.right       = { x: o.xRight,    y: o.yMiddle };

    // shortcuts to get the offset of paper's canvas
    // o.offset      = $(this.paper.canvas).parent().offset();

    return o;
};

// Polyline support.
Raphael.fn.polyline = function(x, y) {
    var poly = ['M', x, y, 'L'];
    for (var i = 2; i < arguments.length; i++) {
        poly.push(arguments[i]);
    }
    return this.path(poly.join(' '));
};

// Triangles
Raphael.fn.triangle = function(x, y, size) {
  var path = ["M", x, y];
  path = path.concat(["L", (x + size / 2), (y + size)]);
  path = path.concat(["L", (x - size / 2), (y + size)]);
  return this.path(path.concat(["z"]).join(" "));
};

