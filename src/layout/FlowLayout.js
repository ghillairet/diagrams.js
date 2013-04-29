/**
 * @name FlowLayout
 * @class Flow Layout implementation that lays out the element's
 * children on a row. If the children do not fit in the current row,
 * additional rows are created.
 * @augments Layout
 *
 */

var FlowLayout = Layout.extend(/** @lends FlowLayout.prototype */ {

    constructor: function(shape, attributes) {
        if (!attributes) attributes = {};
        Layout.apply(this, [shape, attributes]);
        this.vertical = attributes.vertical;
    },

    /**
     * Executes the layout algorithm
     */

    layout: function() {
        var limits = this.shape.bounds();
        var elements = this.shape.get('children');
        var i = 0, l = elements.length;
        var el, elSize,
            rw = 0, rh = 0,
            rx = limits.x,
            ry = limits.y;

        for (; i < l; i++) {
            el = elements[i];
            elSize = el.preferredSize();

            if (rw + elSize.width > limits.width) {
                rx = limits.x;
                rw += elSize.width;
                ry += rh;
                el.set({ x: rx, y: ry });
            } else {
                el.set({ x: rx, y: ry });
                rh = Math.max(elSize.height, rh);
                rw += elSize.width;
                rx += elSize.width;
            }
        }
    },

    /**
     * Returns the size of the element associated to the layout
     */

    size: function(type) {
        var limits = this.shape.bounds();
        var width = 0, prefWidth = 0;
        var height = 0, prefHeight = 0;
        var elements = this.shape.get('children');
        var i = 0;
        var l = elements.length;
        var el, elSize;

        for (; i < l; i++) {
            el = elements[i];
            elSize = el[type + 'Size']();

            if (i === 0) {
                width = elSize.width || 0;
                height = elSize.height || 0;
            } else if (width + elSize.width > limits.width) {
                prefHeight += height;
                prefWidth = Math.max(prefWidth, width);
                width = elSize.width || 0;
                height = elSize.height || 0;
            } else {
                width += elSize.width || 0;
                height = Math.max(height, elSize.height || 0);
            }
        }

        prefHeight += height;
        prefHeight = Math.max(limits.height, prefHeight);
        prefWidth = Math.max(limits.width, Math.max(prefWidth, width));

        return { width: prefWidth, height: prefHeight };
    },

    preferredSize: function() {
        return this.size('preferred');
    },

    minimumSize: function() {
        return this.size('minimum');
    },

    maximumSize: function() {
        return this.size('maximum');
    }


});

