//
// Layout
//

var Layout = function(shape, attributes) {
    this.shape = shape;
    this.type = attributes.type;
};
Layout.extend = extend;

Layout.prototype = {
    layout: function() {}
};

function createLayout(shape) {
    var layout = shape.layout,
        type = layout ? layout.type : null;

    return (function() {
        switch (type) {
            case 'xy':
                return new XYLayout(shape, layout);
            case 'flow':
                return new FlowLayout(shape, layout);
            case 'grid':
                return new GridLayout(shape, layout);
            case 'flex':
                return new FlexGridLayout(shape, layout);
            default:
                return null;
        }
    })();
}
