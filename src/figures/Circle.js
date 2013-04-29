
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
        var val;
        if (_.has(this.defaults, key)) {
            this.attributes[key] = value;
            if (key === 'x' || key === 'y') {
                if (this.wrapper) {
                    this.wrapper.attr(key, value);
                    this.layoutCircle();
                }
            } else {
                this.setMinValues();
                if (this.circle) {
                    this.circle.attr(key, value);
                    if (key === 'r') this.layoutCircle();
                }
            }
        }
    },

    setMinValues: function(key, value) {
        var min = 'min-' + key;
        if (key === 'r' && !this.attributes[min]) {
            this.attributes[min] = value;
        }
    },

    bounds: function() {
        if (this.wrapper) return this.wrapper.getABox();
        else return {
            width: this.get('width'),
            height: this.get('height'),
            r: this.get('r'),
            x: this.get('x'),
            y: this.get('y')
        };
    },

    layoutCircle: function() {
        var box = this.circle.getBBox();
        this.wrapper.attr({
            width: box.width,
            height: box.height,
            opacity: 0,
            fill: 'white'
        });
        var r = this.circle.attr('r');
        var x = this.wrapper.attr('x');
        var y = this.wrapper.attr('y');
        this.circle.attr({
            cx: x + r,
            cy: y + r
        });
    },

    render: function() {
        this.remove();
        var renderer = this.renderer();
        this.wrapper = renderer.rect(this.get('x'), this.get('y'));
        this.circle = renderer.circle(0, 0, this.get('r'));
        this.layoutCircle();
        this.set(this.attributes);
        this.toFront();
        this.wrapper.control = this;
        this.bindEvents();

        return this;
    },

    remove: function() {
        Ds.Figure.prototype.remove.apply(this);
        if (this.circle) this.circle.remove();
        return this;
    },

    resize: function(dx, dy, direction) {
        if (_.include(['ne', 'nw', 'n'], direction)) {
            dy = -dy;
        }

        var min = this.minimumSize();
        var sumr = this.wrapper.or + (dy < 0 ? -1 : 1) * Math.sqrt(2*dy*dy);
        var r = isNatural(sumr) ? sumr : this.wrapper.or;
        if (r < min.r) r = min.r;

        this.set({ r: r });
    },

    minimumSize: function() {
        return { r: this.get('min-r') || this.get('r') };
    },

    /**
     * Moves the figure according to the given dx, dy.
     */

    translate: function(dx, dy) {
        Ds.Figure.prototype.translate.apply(this, arguments);
        if (this.circle) this.layoutCircle();
        return this;
    },

    toFront: function() {
        if (!this.wrapper) return;
        this.circle.toFront();
        this.wrapper.toFront();
    },

    toBack: function() {
        if (!this.wrapper) return;
        this.circle.toBack();
        this.wrapper.toBack();
    }

}, {

    defaults: _.extend({}, Figure.defaults, {
        r: 0
    })

});

