//
// GridLayout
//

var GridLayout = Layout.extend({

    constructor: function(shape, attributes) {
        if (!attributes) attributes = {};
        Layout.apply(this, [shape, attributes]);

        this.columns = attributes.columns;
        this.rows = attributes.rows || 0;
        this.vertical = attributes.vertical || false;
    },

    layout: function() {
        if (!this.shape.children) return;

        var elements = this.shape.children,
            bounds = this.shape.bounds(),
            rows = this.rows,
            columns = this.columns || elements.length,
            x = bounds.x,
            y = bounds.y,
            width,
            height;

        if (rows > 0) {
            columns = Math.floor((elements.length + rows - 1) / rows);
        } else {
            rows = Math.floor((elements.length + columns - 1) / columns);
        }

        width = (bounds.width - (columns - 1)) / columns;
        height = (bounds.height - (rows - 1)) / rows;

        for (var i = 0, j = 1; i < elements.length; i++, j++) {
            elements[i].set({ x: x, y: y, width: width, height: height });

            if (j >= rows) {
                x += width;
            } else {
                y += height;
            }
            elements[i].doLayout();
        }
    },

    size: function() {
        return this.shape.bounds();
    }

});

