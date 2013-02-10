/**
 * @name GridLayout
 * @class Grid layout implementation that lays out the element's
 * children in a grid and resizes each of them to the same size. This
 * layout can be configured to work with a certain number of columns
 * and rows.
 * @example
 * // This example shows how to create a Shape
 * // with a 2x2 grid layout.
 *
 * var Shape = Ds.Shape.extend({
 *  figure: {
 *      ...
 *  },
 *  children: [ ... ],
 *  layout: {
 *      type: 'grid',
 *      columns: 2,
 *      rows: 2
 *  }
 * });
 *
 * @augments Layout
 *
 */

var GridLayout = Layout.extend(/** @lends GridLayout.prototype */ {

    constructor: function(shape, attributes) {
        if (!attributes) attributes = {};
        Layout.apply(this, [shape, attributes]);

        this.columns = attributes.columns;
        this.rows = attributes.rows || 0;
        this.vertical = attributes.vertical || false;
        this.vgap = attributes.vgap || 0;
        this.hgap = attributes.hgap || 0;
    },

    /**
     * Executes the layout algorithm
     */

    layout: function() {
        if (!this.shape.children || !this.shape.children.length) return;

        var elements = this.shape.children,
            bounds = this.shape.bounds(),
            rows = this.rows,
            columns = this.columns || elements.length,
            x = bounds.x,
            y = bounds.y,
            width,
            height;

        // determines the number of rows and columns
        if (rows > 0) {
            columns = Math.floor((elements.length + rows - 1) / rows);
        } else {
            rows = Math.floor((elements.length + columns - 1) / columns);
        }

        // calculates elements sizes based on number of rows and columns
        width = (bounds.width - (columns - 1) * this.hgap) / columns;
        height = (bounds.height - (rows - 1) * this.vgap) / rows;

        for (var i = 0, j = 1; i < elements.length; i++, j++) {
            elements[i].set({ x: x, y: y, width: width, height: height });

            if (this.vertical) {
                if (j >= rows) {
                    x += width + this.hgap;
                    y = bounds.y;
                    j = 0;
                } else {
                    y += height + this.vgap;
                }
            } else {
                if (j >= columns) {
                    y += height + this.vgap;
                    x = bounds.x;
                    j = 0;
                } else {
                    x += width + this.hgap;
                }
            }
            elements[i].doLayout();
        }
    },

    /**
     * Returns the size of the element associated to the layout
     */

    size: function() {
        return this.shape.bounds();
    }

});

