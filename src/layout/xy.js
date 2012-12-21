//
// XYLayout
//

var XYLayout = Layout.extend({

    constructor: function(shape, attributes) {
        if (!attributes) attributes = {};
        Layout.apply(this, [shape, attributes]);
    },

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

    size: function() {
        return this.shape.bounds();
    }

});


