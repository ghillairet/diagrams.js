/**
 *
 * @param x
 * @param y
 * @returns {Point}
 */
var Point = function Point( x, y ) {
    var xy;
    if (y === undefined){
        // from string
        xy = x.split(x.indexOf("@") === -1 ? " " : "@");
        this.x = parseInt(xy[0], 10);
        this.y = parseInt(xy[1], 10);
    } else {
        this.x = x;
        this.y = y;
    }
};

Point.getMousePosition = function( paper, evt ) {
    // IE:
    if (window.event && window.event.contentOverflow !== undefined) {
        return new Point(window.event.x, window.event.y);
    }

    // Webkit:
    if (evt.offsetX !== undefined && evt.offsetY !== undefined) {
        return new Point(evt.offsetX, evt.offsetY);
    }

    // Firefox:
    // get position relative to the whole document
    // note that it also counts on scrolling (as opposed to clientX/Y).
    var pageX = evt.pageX;
    var pageY = evt.pageY;

    // SVG's element parent node is world
    var el = paper.canvas.parentNode;

    // get position of the paper element relative to its offsetParent
    var offsetLeft = el ? el.offsetLeft : 0;
    var offsetTop = el ? el.offsetTop : 0;
    var offsetParent = el ? el.offsetParent : 0;

    var offsetX = pageX - offsetLeft;
    var offsetY = pageY - offsetTop;

    // climb up positioned elements to sum up their offsets
    while (offsetParent) {
        offsetX += offsetParent.offsetLeft;
        offsetY += offsetParent.offsetTop;
        offsetParent = offsetParent.offsetParent;
    }

    return new Point(offsetX, offsetY);
};