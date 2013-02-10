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
            bounds = shape.wrapper.getABox(),
            elements = shape.children,
            l = elements.length, i = 0, el;

        for (; i < l ; i++) {
            el = elements[i];
            el.wrapper.translate(bounds.x, bounds.y);
            el.doLayout();
        }
    },

    /**
     * Returns the size of the element associated with the layout
     */

    size: function() {
        return this.shape.bounds();
    }

});


