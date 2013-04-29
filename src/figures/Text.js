
var Text = Ds.Text = Ds.Figure.extend({

    constructor: function(attributes) {
        if (!attributes) attributes = {};
        var attrs = attributes.figure || attributes;

        Ds.Figure.apply(this, [attributes]);

        this.defaults = _.extend({}, Text.defaults, Text.textDefaults);
        this.attributes = _.extend({}, Text.defaults,
            _.object(_.filter(_.pairs(attrs), this.filterAttributes)));
        this.textAttributes = _.extend({}, Text.textDefaults,
            _.object(_.filter(_.pairs(attrs), this.filterTextAttributes)));
        this.position = Text.getPosition(this, attrs);

        this.initialize(attributes);
    },

    /**
     * @private
     */

    filterAttributes: function(pair) {
        return _.has(Text.defaults, pair[0]);
    },

    /**
     * @private
     */

    filterTextAttributes: function(pair) {
        return _.has(Text.textDefaults, pair[0]);
    },

    get: function(attr) {
        if (this.textAttributes[attr])
            return this.textAttributes[attr];
        else
            return this.attributes[attr];
    },

    /**
     * @private
     */

    setValue: function(key, value) {
        if (_.has(this.textAttributes, key)) {
            this.textAttributes[key] = value;
            if (this.text) this.text.attr(key, value);
        } else {
            this.attributes[key] = value;
            if (this.wrapper) {
                this.wrapper.attr(key, value);
                if (_.contains(['width', 'height', 'x', 'y'], key)) {
                    this.layoutText();
                }
            }
        }
    },

    /**
     * @private
     */

    layoutText: function() {
        if (!this.text) return;

        this.resizeBox();
        var box = this.bounds();
        var text = this.text;
        var lbox = text.getABox();

        text.attr('y', box.yMiddle);

        if (this.position === 'center') {
            text.attr('x', box.xCenter);
        }
        if (this.position === 'left') {
            text.attr('x', box.x + (lbox.width / 2));
        }
        if (this.position === 'right') {
            text.attr('x', box.xRight - (lbox.width / 2));
        }
    },

    render: function() {
        this.remove();
        var renderer = this.renderer();

        this.wrapper = renderer.rect();
        this.text = renderer.text(0, 0, this.textAttributes.text);
        this.text.attr(this.textAttributes);

        this.set({ x : this.get('x'), y: this.get('y') });
        this.wrapper.attr(this.attributes).attr({
            stroke: 'none',
            'fill': 'white',
            'fill-opacity': 0
        });

        this.layoutText();
        this.toFront();
        this.wrapper.control = this;
        this.bindEvents();

        return this;
    },

    /**
     * @private
     */

    resizeBox: function() {
        var box = this.text.getBBox();
        var w = this.get('width');
        var h = this.get('height');
        if (w < box.width) this.set('width', box.width);
        if (h < box.height) this.set('height', box.height);
    },

    remove: function() {
        if (this.wrapper) {
            this.wrapper.remove();
            this.text.remove();
            this.unBindEvents(this.text);
            delete this.wrapper;
            delete this.text;
        }
        return this;
    },

    minimumSize: function() {
        var bbox = this.text.getBBox();
        return {
            width: bbox.width,
            height: bbox.height
        };
    },

    toFront: function() {
        if (!this.wrapper) return;
        this.text.toFront();
        this.wrapper.toFront();
    },

    toBack: function() {
        if (!this.wrapper) return;
        this.text.toBack();
        this.wrapper.toBack();
    }

}, {

    textDefaults: {
        'font-size': 12,
        text: 'Label',
        'font-weight': 'normal', // normal | bold | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
        'font-style': 'normal', // normal | italic | oblique
        'font-family': 'Arial',
        fill: 'black',
        'fill-opacity': 1,
        stroke: 'none',
        'stroke-opacity': 1,
        'stroke-width': 1
    },

    defaults: {
        width: 0,
        height: 0,
        x: 0,
        y: 0
    },

    positions: [ 'center', 'left', 'right' ],

    getPosition: function(text, properties)  {
        var position = text.position || 'center';
        if (properties && properties.position) {
            if (_.include(Text.positions, properties.position)) {
                position = properties.position;
            }
        }
        return position;
    }

});

