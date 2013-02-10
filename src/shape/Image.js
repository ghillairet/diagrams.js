
// LabelImage
//

var LabelImage = Ds.Image = Ds.DiagramElement.extend({

    constructor: function(attributes) {
        Ds.DiagramElement.apply(this, [attributes]);
    },

    render: function() {
        var paper = this.paper(),
            bBox = this.parent.wrapper.getBBox(),
            src = this.get('src'),
            width = this.get('width'),
            height = this.get('height');

        this.wrapper = paper.image(src, bBox.x, bBox.y, width, height);
        this.wrapper.toFront();
        this.wrapper.controller = this;

        return this;
    },

    center: function() {
        var ntbb = this.parent.wrapper.getABox();
        this.wrapper.attr({ x: ntbb.x - this.get('width') });
        this.wrapper.attr({ y: ntbb.yMiddle - (this.get('height') / 2) });
    }

});

