/**
 * @name Layout
 * @class Abstract representation of a Layout
 *
 */

var Layout = function(shape, attributes) {
    this.shape = shape;
    this.type = attributes.type;
};

Layout.extend = extend;

Layout.layouts = function() {
    return {
        'xy': XYLayout,
        'flow': FlowLayout,
        'grid': GridLayout,
        'border': BorderLayout
    };
};

Layout.create = function(shape, attributes) {
    var options = shape.layout || attributes.layout,
        type = options ? options.type : null,
        layout, fn;

    if (_.has(Layout.layouts(), type)) {
        fn = Layout.layouts()[type];
        layout = new fn(shape, options);
    }

    return layout;
};

Layout.prototype = {

    /**
     * Executes the layout algorithm
     */

    layout: function() {},
    minimumSize: function() {},
    maximumSize: function() {},
    preferredSize: function() {}

};

