
var Layout = DG.Layout = {};

Layout.create = function(figure, data) {
    var layout = data.layout;
    if (!figure || !layout || !layout.type) return null;

    switch(layout.type) {
        case 'grid':
            return new GridLayout(figure, layout);
        default:
            return null;
    }
};

