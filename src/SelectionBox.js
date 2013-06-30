/**
 * @name SelectionBox
 * @class
 */
var SelectionBox = function() {
    this.constructor.call(this, SVG.create('rect'));
    this.attr(SelectionBox.style);
};

SelectionBox.style = {
    "stroke": "#00f",
    "stroke-width": 2,
    fill: "#aaf",
    opacity: 0.4
};

SelectionBox.prototype = new SVG.Shape();

SelectionBox.mousedown = function(container) {
    return function(e) {
        var p = Point.get(e);
        var box = container.selectionBox = container.doc.selectionBox();
        box.startPosition = { x: p.x, y: p.y };
        box.move(p.x, p.y);
    };
};

SelectionBox.mouseup = function(container) {
    return function() {
        var box = container.selectionBox;
        if (box) {
            container.selectNodes({
                x: box.attr('x'),
                y: box.attr('y'),
                width: box.attr('width'),
                height: box.attr('height')
            });
            box.remove();
            delete container.selectionBox;
        }
    };
};

SelectionBox.mousemove = function(container) {
    return function(e) {
        var p, dx, dy, start,
            xoffset = 0,
            yoffset = 0,
            box = container.selectionBox;

        if (box) {
            start = box.startPosition;
            p = Point.get(e);
            dx = p.x - start.x;
            dy = p.y - start.y;

            if (dx < 0) {
                xoffset = dx;
                dx = -1 * dx;
            }
            if (dy < 0) {
                yoffset = dy;
                dy = -1 * dy;
            }

            box.transform({ x: xoffset, y: yoffset });
            box.size(dx, dy);
        }
    };
};

SVG.extend(SVG.Container, {
    selectionBox: function(attributes) {
        return this.put(new SelectionBox(attributes));
    }
});

