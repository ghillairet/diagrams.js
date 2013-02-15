
var Circle = Ds.Circle = Ds.Figure.extend({

    constructor: function(attributes) {
        if (!attributes) attributes = {};
        Ds.Figure.apply(this, [attributes]);
        this.attributes = _.extend({}, Circle.defaults, attributes.figure);
        this.defaults = Circle.defaults;
        this.initialize(attributes);
    },

    /**
     * @private
     */

    setValue: function(key, value) {
        if (_.has(this.defaults, key)) {
            this.attributes[key] = value;
            // circles have cx/cy instead of x/y
            if (key === 'x' || key === 'y') key = 'c' + key;
            if (key === 'r') {
                if (!this.attributes['min-r']) this.attributes['min-r'] = value;
            }
            if (this.wrapper) this.wrapper.attr(key, value);
        }
    },

    bounds: function() {
        if (this.wrapper)
            return this.wrapper.getABox();
        else return {
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

        this.wrapper = renderer.circle(
            this.get('x'), this.get('y'),
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
        var b = this.bounds();
        var bounds = parent ? parent.bounds() : this.wrapper.paper;
        var x = this.wrapper.ox + dx;
        var r = b.width /2;

        if (parent) {
            return Math.min(Math.max(bounds.x + r, x), (bounds.width - r) + bounds.x);
        } else {
            return Math.min(Math.max(r, x), bounds.width - r);
        }
    },

    /**
     * @private
     */

    calculateY: function(dy, parent) {
        var b = this.bounds();
        var bounds = parent ? parent.bounds() : this.wrapper.paper;
        var y = this.wrapper.oy + dy;
        var r = b.width /2;

        if (parent) {
            return Math.min(Math.max(bounds.y + r, y), (bounds.height - r) + bounds.y);
        } else {
            return Math.min(Math.max(r, y), bounds.height - r);
        }
    },

    minimumSize: function() {
        return { r: this.get('min-r') };
    }

}, {

    defaults: _.extend({}, Figure.defaults, {
        r: 0
    })

});

