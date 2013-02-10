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

Layout.prototype = {

    /**
     * Executes the layout algorithm
     */

    layout: function() {}
};

function createLayout(shape) {
    var options = shape.layout,
        type = options ? options.type : null;

    return (function() {
        switch (type) {
            case 'xy':
                return new XYLayout(shape, options);
            case 'flow':
                return new FlowLayout(shape, options);
            case 'grid':
                return new GridLayout(shape, options);
            case 'flex':
                return new FlexGridLayout(shape, options);
            case 'border':
                return new BorderLayout(shape, options);
            default:
                return null;
        }
    })();
}

