/**
 * @name FlexGrid
 * @class FlexGrid layout implementation that lays out the element's
 * children in a grid with flexible rows and columns sizes. The layout
 * can be configured to accept any number of rows and columns.
 * @example
 *
 * var Compartment = {
 *      compartment: true,
 *      figure: { ... },
 *      layout: {
 *          type: 'flex',
 *          columns: 1,
 *          stretch: false
 *      }
 * };
 * @augments Layout
 *
 */

var FlexGridLayout = GridLayout.extend(/** @lends FlexGrid.prototype */ {

    constructor: function(shape, attributes) {
        if (!attributes) attributes = {};
        GridLayout.apply(this, [shape, attributes]);
        this.stretch = attributes.stretch || false;
    },

    /**
     *  Executes the layout algorithm
     */

    layout: function() {
        if (!this.shape.children || !this.shape.children.length) return;

        var i = 0, c = 0, r = 0,
            elements = this.shape.children,
            rows = this.rows,
            columns = this.columns || elements.length,
            pd = this.shape.preferredSize(),
//            sw = 1,//this.shape.bounds().width / pd.width,
//            sh = 1,//this.shape.bounds().height / pd.height,
            bounds = this.shape.bounds(),
            x = bounds.x + this.hgap,
            y = bounds.y + this.vgap,
            d;

        if (rows > 0) {
            columns = Math.floor((elements.length + rows - 1) / rows);
        } else {
            rows = Math.floor((elements.length + columns - 1) / columns);
        }

        var w = zeros([], columns),
            h = zeros([], rows);

        var add = function(m, n) { return m + n; };

        for (; i < elements.length; i++) {
            r = Math.floor(i / columns);
            c = i % columns;
            d = elements[i].preferredSize();
//            d.width = sw * d.width;
//            d.height = sh * d.height;

            //if (w[c] < d.width)
//            if (this.stretch)
//                w[c] = pd.width; // stretch on x
//            else
                w[c] = d.width;
            console.log(elements[i], c, d.width);

            var ch, lh;
            // if last stretch on y
            if (this.stretch && i == elements.length - 1) {
                ch = _.reduce(h, add, 0);
                lh = bounds.height - ch;
                if (lh > 0) h[r] = lh;
            } else {
                if (h[r] < d.height) h[r] = d.height;
            }
        }

        for (; c < columns; c++) {
            for (r = 0, y = bounds.y; r < rows; r++) {
                i = r * columns + c;
                if (i < elements.length) {
                    console.log(elements[i], w[c], h[r]);
                    elements[i].set({ x: x, y: y, width: w[c], height: h[r] });
                    elements[i].doLayout();
                }
                y += h[r] + this.vgap;
            }
            x += w[c] + this.hgap;
        }
    },

    preferredSize: function() {
    },

    minimumSize: function() {

    },

    maximumSize: function() {

    },

    /**
     * Returns the size of the element associated to the layout
     */

    size: function() {
        var shape = this.shape,
            elements = shape.children,
            bounds = shape.bounds(),
            i = 0, r = 0, c = 0, nw = 0, nh = 0,
            columns = this.columns,
            rows = this.rows,
            elSize, w, h;

        if (rows > 0) {
            columns = Math.floor((elements.length + rows - 1) / rows);
        } else {
            rows = Math.floor((elements.length + columns - 1) / columns);
        }

        w = zeros([], columns),
        h = zeros([], rows);

        for (i = 0; i < elements.length; i++) {
            r = Math.floor(i / columns);
            c = i % columns;
            elSize = elements[i].minimumSize();
            if (w[c] < elSize.width) {
                w[c] = elSize.width;
                console.log('size', w[c]);
            }
            if (h[r] < elSize.height) {
                h[r] = elSize.height;
            }
        }
        for (i = 0; i < columns; i++) {
            nw += w[i];
        }
        for (i = 0; i < rows; i++) {
            nh += h[i];
        }
        if (bounds.width > nw) nw = bounds.width;
        if (bounds.height > nh) nh = bounds.height;
        return { width: nw, height: nh };
    }

});

var zeros = function(a, l) {
    var i = 0;
    for (; i < l; i++) {
        a[i] = 0;
    }
    return a;
};

