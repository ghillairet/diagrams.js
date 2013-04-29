
var Path = Ds.Path = Ds.Figure.extend({

    constructor: function(attributes) {
        if (!attributes) attributes = {};
        Ds.Figure.apply(this, [attributes]);
        this.attributes = _.extend({}, attributes.figure);
        this.defaults = Figure.defaults;
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
                    this.layoutPath();
                }
            } else {
                if (this.path) {
                    this.path.attr(key, value);
                }
            }
        }
    },

    layoutPath: function() {
        var box = this.path.getBBox();
        if (typeof this.path.ox === 'undefined') this.path.ox = box.x;
        if (typeof this.path.oy === 'undefined') this.path.oy = box.y;
        this.wrapper.attr({
            width: box.width,
            height: box.height
        });
        var abox = this.wrapper.getABox();
        var dx = this.attributes.x - this.path.ox;
        var dy = this.attributes.y + this.path.oy;
        this.path.transform('t' + dx + ',' + dy);
    },

    render: function() {
        this.remove();
        var renderer = this.renderer();
        this.wrapper = renderer.rect(this.get('x'), this.get('y'));
        this.wrapper.attr({
            opacity: 0,
            fill: 'white'
        });
        this.path = renderer.path(this.get('path'));
        this.layoutPath();
        this.toFront();
        this.set(this.attributes);
        this.wrapper.control = this;
        this.bindEvents();

        return this;
    },

    remove: function() {
        if (this.wrapper) this.wrapper.remove();
        if (this.path) this.path.remove();
    },

    toFront: function() {
        if (this.path) this.path.toFront();
        if (this.wrapper) this.wrapper.toFront();
    },

    toBack: function() {
        if (this.wrapper) this.wrapper.toBack();
        if (this.path) this.path.toBack();
    },

    bounds: function() {
        if (this.wrapper) return this.wrapper.getABox();
    },

    translate: function(dx, dy) {
        this.path.transform('t' + dx + ',' + dy);
        return Ds.Figure.prototype.translate.apply(this, arguments);
    }

}, {

    defaults: _.extend({} , Figure.defaults, {
        path: ''
    })

});
