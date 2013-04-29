
var Ellipse = Ds.Ellipse = Ds.Figure.extend({

    constructor: function(attributes) {
        if (!attributes) attributes = {};
        Ds.Figure.apply(this, [attributes]);
        this.attributes = _.extend({}, Ellipse.defaults, attributes.figure);
        this.defaults = Ellipse.defaults;
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
                    this.layoutEllipse();
                }
            } else {
                this.setMinValues();
                if (this.ellipse) {
                    this.ellipse.attr(key, value);
                    if (key === 'rx' || key === 'ry') this.layoutEllipse();
                }
            }
        }
    },

    setMinValues: function(key, value) {
        var min = 'min-' + key;
        if ((key === 'rx' || key === 'ry') && !this.attributes[min]) {
            this.attributes[min] = value;
        }
    },

    layoutEllipse: function() {
        var box = this.ellipse.getBBox();
        this.wrapper.attr({
            width: box.width,
            height: box.height,
            opacity: 0,
            fill: 'white'
        });
        var rx = this.ellipse.attr('rx');
        var ry = this.ellipse.attr('ry');
        var x = this.wrapper.attr('x');
        var y = this.wrapper.attr('y');
        this.ellipse.attr({
            cx: x + rx,
            cy: y + ry
        });
    },

    render: function() {
        this.remove();
        var renderer = this.renderer();

        this.wrapper = renderer.rect(this.get('x'), this.get('y'));
        this.ellipse = renderer.ellipse();
        this.layoutEllipse();
        this.set(this.attributes);
        this.wrapper.control = this;
        this.toFront();
        this.bindEvents();

        return this;
    },

    remove: function() {
        Ds.Figure.prototype.remove.apply(this);
        if (this.ellipse) this.ellipse.remove();
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
    },

    bounds: function() {
        if (this.wrapper) return this.wrapper.getABox();
        else return {
            x: this.attributes.x,
            y: this.attributes.y,
            rx: this.attributes.rx,
            ry: this.attributes.ry
        };
    },

    /**
     * Moves the figure according to the given dx, dy.
     */

    translate: function(dx, dy) {
        Ds.Figure.prototype.translate.apply(this, arguments);
        if (this.ellipse) this.layoutEllipse();
        return this;
    },

    toFront: function() {
        if (!this.wrapper) return;
        this.ellipse.toFront();
        this.wrapper.toFront();
    },

    toBack: function() {
        if (!this.wrapper) return;
        this.ellipse.toBack();
        this.wrapper.toBack();
    }

}, {

    defaults: _.extend({}, Figure.defaults, {
        rx: 0,
        ry: 0
    })

});
