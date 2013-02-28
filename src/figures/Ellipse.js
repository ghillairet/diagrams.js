
var Ellipse = Ds.Ellipse = Ds.Figure.extend({

    constructor: function(attributes) {
        if (!attributes) attributes = {};
        Ds.Figure.apply(this, [attributes]);
        this.attributes = _.extend({}, Ellipse.defaults, attributes.figure);
        this.defaults = Ellipse.defaults;
        this.initialize(attributes);
    },

    render: function() {
        var renderer = this.renderer();

        this.wrapper = renderer.ellipse();
        this.wrapper.control = this;
        this.wrapper.attr(this.attributes);

        return this;
    },

    resize: function(dx, dy, direction) {
        if (_.include(['ne', 'nw', 'n'], direction)) {
            dy = -dy;
        }
        if (_.include(['nw', 'sw', 'n'], direction)) {
            dx = -dx;
        }
        var sumx = this.wrapper.orx + dx;
        var sumy = this.wrapper.orx + dy;
        this.set({
            rx: isNatural(sumx) ? sumx : this.wrapper.orx,
            ry: isNatural(sumy) ? sumy : this.wrapper.ory
        });
    }

}, {

    defaults: _.extend({}, Figure.defaults, {

    })

});
