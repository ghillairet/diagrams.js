//
// Draggable
//
// Makes a Shape draggable.
//

/**
Diagram.Shape.prototype.asDraggable = function( options ) {
    if (this.wrapper) {
        this.wrapper.attr({ cursor: 'move' });
    }

    var start = function() {
        var wrapper = this;
        wrapper.o();

        if (wrapper.controller) {
            var control = wrapper.controller;
            if (typeof control.deselect === 'function') {
                control.deselect();
            }
            if (control.shadow) {
                control.shadowWrapper.remove();
            }
            if (control._tool) {
                control._tool.remove();
            }

            wrapper.unmouseover(control.handleMouseOver);
            wrapper.unmouseout(control.handleMouseOut);

            drawDragger(this);
        }
    };

    var move = function( dx, dy, mx, my, ev ) {
        var wrapper = this;
        var b = wrapper.getBBox(),
            x = wrapper.ox + dx,
            y = wrapper.oy + dy,
            r = wrapper.is('circle') || wrapper.is('ellipse') ? b.width / 2 : 0,
            paper = wrapper.paper,
            position;

        x = Math.min(
                Math.max(r, x),
                paper.width - (wrapper.is('circle') || wrapper.is('ellipse') ? r : b.width));
        y = Math.min(
                Math.max(r, y),
                paper.height - (wrapper.is('circle') || wrapper.is('ellipse') ? r : b.height));

        position = { x: x, y: y, cx: x, cy: y };
        wrapper.attr(position);

        if (wrapper.controller) {
            var control = wrapper.controller;

            if (control.isConnectable) {
                var inEdges = control.inEdges,
                    outEdges = control.outEdges;

                if (inEdges && inEdges.length) {
                    for (var i = 0; i < inEdges.length; i++) {
                        inEdges[i].render();
                    }
                }
                if (outEdges && outEdges.length) {
                    for (var j = 0; j < outEdges.length; j++) {
                        outEdges[j].render();
                    }
                }
            }
        }
    };

    var end = function() {
        var wrapper = this;
        var control = wrapper.controller;
        wrapper.mouseover(control.handleMouseOver);
        wrapper.mouseout(control.handleMouseOut);

        var attrs = wrapper.oa;
        attrs.cx = wrapper.attrs.cx;
        attrs.cy = wrapper.attrs.cy;
        attrs.x = wrapper.attrs.x;
        attrs.y = wrapper.attrs.y;
        wrapper.attr(attrs);
        delete wrapper.oa;

        if (control) {
            control._renderContent();

            if (control.shadow) {
                control.createShadow();
            }
        }
    };

    var drawDragger = function(wrapper) {
        var attrs = _.clone(wrapper.attrs),
            type = wrapper.type;

        wrapper.oa = attrs;
        if (wrapper.oa['fill-opacity'] === undefined) {
            wrapper.oa['fill-opacity'] = 1;
        }

        var removeChild = function(wrapper) {
            if (wrapper._child) {
                removeChild(wrapper._child);
                wrapper._child.remove();
            }
        };
        removeChild(wrapper);

        wrapper.attr({ fill: 'grey', 'fill-opacity': 0.2, 'stroke-width': 0 });

        return wrapper;
    };

    var wrapper = this.wrapper;
    wrapper.drag(move, start, end);

    return this;
};
**/
