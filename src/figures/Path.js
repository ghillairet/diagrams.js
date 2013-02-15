
var Path = Ds.Path = Ds.Figure.extend({

    constructor: function(attributes) {
        if (!attributes) attributes = {};
        Ds.Figure.apply(this, [attributes]);
        this.attributes = _.extend({}, attributes.figure);
        this.defaults = Figure.defaults;
        this.initialize(attributes);
    },

    render: function() {
        this.remove();
        var renderer = this.renderer();
        if (!renderer)
            throw new Error('Cannot render figure, renderer is not available.');

        this.wrapper = renderer.path(this.get('path'));

        this.wrapper.attr(this.attributes);
        this.wrapper.control = this;
        this.bindEvents();

        return this;
    },

    bounds: function() {
        if (this.wrapper) return this.wrapper.getABox();
    }

}, {

    defaults: _.extend({} , Figure.defaults, {
        path: ''
    })

});
