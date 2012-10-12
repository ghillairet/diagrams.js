/**
 * Draggable
 *
 * Makes a Shape draggable.
 *
**/

Diagram.Draggable = function () {
};

/**
 * Adds necessary methods to make non draggable shape into
 * a draggable one.
 *
**/

Diagram.Draggable.prototype.asDraggable = function( options ) {
    if (this.wrapper) {
        this.wrapper.attr( {cursor: 'move'} );
    }

    var start = function() {
        this.o();
        if (this.controller) {
            var control = this.controller;
            if (typeof control.deselect === 'function') {
                control.deselect();
            }
            if (control.shadow) {
                control.shadowWrapper.remove();
            }
            if (control._tool) {
                control._tool.remove();
            }

            this.unmouseover(control.handleMouseOver);
            this.unmouseout(control.handleMouseOut);

            var children = control.get('children');
            if (children && children.length) {
                for (var i = 0; i < children.length; i++) {
                    start.apply( children[i].wrapper );
                }
            }
        }
    };

    var move = function( dx, dy, mx, my, ev ) {
        var b = this.getBBox();
        var x = this.ox + dx;
        var y = this.oy + dy;
        var r = this.is('circle') || this.is('ellipse') ? b.width / 2 : 0;
        var paper = this.paper;

        x = Math.min(
            Math.max(r, x),
            paper.width - (this.is('circle') || this.is('ellipse') ? r : b.width));
          y = Math.min(
              Math.max(r, y),
              paper.height - (this.is('circle') || this.is('ellipse') ? r : b.height));

        var position = { x: x, y: y, cx: x, cy: y };
        this.attr(position);

        if (this.controller) {
            var control = this.controller;

            if (control.isConnectable) {
                var inEdges = control.inEdges;
                var outEdges = control.outEdges;

                if (inEdges && inEdges.length) {
                    for (var i = 0; i < inEdges.length; i++) {
                        inEdges[i].render();
                    }
                }
                if (outEdges && outEdges.length) {
                    for (var i = 0; i < outEdges.length; i++) {
                        outEdges[i].render();
                    }
                }
            }
            var children = control.get('children');
            if (children && children.length) {
                for (var i = 0; i < children.length; i++) {
                    move.apply(children[i].wrapper, [dx, dy, mx, my, ev]);
                }
            }
        }
    };

    var end = function() {
        var control = this.controller;
        this.mouseover(control.handleMouseOver);
        this.mouseout(control.handleMouseOut);
        if (control && control.shadow) {
            control.createShadow();
        }
    };

    this.wrapper.drag(move, start, end);

    return this;
};