
var Rectangle = Ds.Rectangle = Ds.Figure.extend({

    constructor: function(attributes) {
        if (!attributes) attributes = {};
        Ds.Figure.apply(this, [attributes]);
        this.defaults = _.extend({}, Rectangle.defaults);
        this.attributes = _.extend({}, this.defaults, attributes.figure || attributes);
        this.initialize(attributes);
    },

    bounds: function() {
        if (this.wrapper)
            return this.wrapper.getABox();
        else {
            return {
                width: this.get('width'),
                height: this.get('height'),
                x: this.get('x'),
                y: this.get('y')
            };
        }
    },

    render: function() {
        this.remove();
        var renderer = this.renderer();

        this.wrapper = renderer.rect(
            this.get('x'), this.get('y'),
            this.get('width'), this.get('height'),
            this.get('r'));

        this.wrapper.attr(this.attributes);
        this.wrapper.control = this;
        this.bindEvents();

        return this;
    },

    resize: function(dx, dy, direction) {
        var min = this.minimumSize(),
            limits = this.limits(),
            x = this.wrapper.ox,
            y = this.wrapper.oy,
            w = this.wrapper.ow,
            h = this.wrapper.oh;

        if (direction !== 'n' && direction !== 's') {
            w = this.wrapper.ow + dx;
        }
        if (direction !== 'w' && direction !== 'e') {
            h = this.wrapper.oh + dy;
        }
        if (_.include(['sw', 'nw', 'w'], direction)) {
            w = this.wrapper.ow - dx;
            if (w < min.width) {
                dx = dx - (min.width - w);
            }
            x = this.wrapper.ox + dx;
        }
        if (_.include(['ne', 'nw', 'n'], direction)) {
            h = this.wrapper.oh - dy;
            if (h < min.height) {
                dy = dy - (min.height - h);
            }
            y = this.wrapper.oy + dy;
        }

        if (h < min.height) h = min.height;
        if (w < min.width) w = min.width;
        if (w > limits.width) w = limits.width;
        if (h > limits.height) h = limits.height;
        if (x < limits.x) x = limits.x;
        if (y < limits.y) y = limits.y;

        this.set({ width: w, height: h, y: y, x: x });
    },

    minimumSize: function() {
        return {
            width: this.get('min-width') || this.get('width'),
            height: this.get('min-height') || this.get('height')
        };
    }

}, {

    defaults: _.extend({}, Figure.defaults, {
        width: 0,
        height: 0,
        r: 0
    })

});

