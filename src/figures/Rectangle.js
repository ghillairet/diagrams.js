
var Rectangle = Ds.Rectangle = Ds.Figure.extend({

    constructor: function(attributes) {
        if (!attributes) attributes = {};
        Ds.Figure.apply(this, [attributes]);
        this.defaults = Rectangle.defaults;
        this.attributes = _.extend({}, this.defaults, attributes.figure);
        this.initialize(attributes);
    },

    bounds: function() {
        if (this.wrapper)
            return this.wrapper.getABox();
        else
            return {
                width: this.get('width'),
                height: this.get('height'),
                x: this.get('x'),
                y: this.get('y')
            };
    },

    render: function() {
        this.remove();
        var renderer = this.renderer();
        if (!renderer)
            throw new Error('Cannot render figure, renderer is not available.');

        this.wrapper = renderer.rect(
            this.get('x'), this.get('y'),
            this.get('width'), this.get('height'),
            this.get('r'));

        this.wrapper.attr(this.attributes);
        this.wrapper.control = this;
        this.bindEvents();

        return this;
    },

    /**
     * @private
     */

    calculateX: function(dx, parent) {
        var b = this.wrapper.getBBox();
        var bounds = parent ? parent.bounds() : this.wrapper.paper;
        var x = this.wrapper.ox + dx;

        if (parent) {
            return Math.min(Math.max(bounds.x, x), (bounds.width - b.width) + bounds.x);
        } else {
            return Math.min(Math.max(0, x), bounds.width - b.width);
        }
    },

    /**
     * @private
     */

    calculateY: function(dy, parent) {
        var b = this.wrapper.getBBox();
        var bounds = parent ? parent.bounds() : this.wrapper.paper;
        var y = this.wrapper.oy + dy;

        if (parent) {
            return Math.min(Math.max(bounds.y, y), (bounds.height - b.height) + bounds.y);
        } else {
            return Math.min(Math.max(0, y), bounds.height - b.height);
        }
    },

    minimumSize: function() {
        return {
            width: this.get('min-width'),
            height: this.get('min-height')
        };
    }

}, {

    defaults: _.extend({}, Figure.defaults, {
        width: 0,
        height: 0,
        r: 0
    })

});

