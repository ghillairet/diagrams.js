/**
 * @name XYLayout
 * @class A XYLayout implementation
 * @augments Layout
 *
 */

var XYLayout = Layout.extend(/** @lends XYLayout.prototype */ {

    constructor: function(shape, attributes) {
        if (!attributes) attributes = {};
        Layout.apply(this, [shape, attributes]);
    },

    /**
     * Executes the layout algorithm
     */

    layout: function() {
        var shape = this.shape,
            bounds = shape.bounds(),
            elements = shape.children,
            l = elements.length, i = 0, el;

        console.log('layout', this.shape, bounds);
        for (; i < l ; i++) {
            el = elements[i];
            el.figure.translate(bounds.x, bounds.y);
            el.doLayout();
        }
    },

    /**
     * Returns the size of the element associated with the layout
     */

    minimumSize: function() {
//        return this.shape.figure.bounds();
    },

    preferredSize: function() {
//        return this.shape.figure.bounds();
    },

    maximumSize: function() {
//        return this.shape.figure.bounds();
    }

});


