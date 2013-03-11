
var Text = Ds.Text = Ds.Figure.extend({

    constructor: function(attributes) {
        if (!attributes) attributes = {};
        Ds.Figure.apply(this, [attributes]);
        this.defaults = _.extend({}, Text.defaults, Text.textDefaults);
        this.attributes = _.extend({}, this.defaults, this.textDefaults, attributes.figure || attributes);
        this.position = Text.getPosition(this, attributes);
        this.initialize(attributes);
    },

    /**
     * @private
     */

    setValue: function(key, value) {
        if (_.has(this.defaults, key)) {
            this.attributes[key] = value;
            if (this.text && _.contains(Text.textDefaults, key)) {
                this.text.attr(key, value);
            } else if (this.wrapper) {
                if (_.contains(['width', 'height', 'x', 'y'], key)) {
                    this.layoutText();
                }
                this.wrapper.attr(key, value);
            }
        }
    },

    layoutText: function() {
        if (!this.text) return;

        var box = this.bounds();
        var text = this.text;
        var lbox = text.getABox();

        text.attr('y', box.yMiddle);

        if (this.position === 'center') {
            text.attr('x', box.xCenter);
        }
        if (this.position === 'left') {
            text.attr('x', box.x + (lbox.width / 2) + this.xOffset);
        }
        if (this.position === 'right') {
            text.attr('x', box.xRight - this.xOffset - (lbox.width / 2));
        }
    },

    setPosition: function() {
        if (this.text) {
            this.wrapper.attr({ x: this.get('x'), y: this.get('y') });
            var bbox = this.text.getBBox();
            var x = this.get('x') + (bbox.width / 2);
            var y = this.get('y') + (bbox.height / 2);
            this.text.attr({ x: x, y: y });
        }
    },

    render: function() {
        this.remove();
        var renderer = this.renderer();

        this.wrapper = renderer.rect();
        this.text = renderer.text(0, 0, this.get('text'));
        this.wrapper.attr({ 'stroke': 'none', 'fill-opacity': 0, 'fill': 'none' });
        this.set({x : this.get('x'), y: this.get('y') });
        this.set({ width: this.get('width'), height: this.get('height') });
        this.layoutText();
        this.toFront();
        this.wrapper.control = this;
        this.bindEvents(this.text);

        return this;
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
        this.wrapper.toFront();
        this.text.toFront();
    }

}, {

    textDefaults: {
        'font-size': 10,
        'text': 'Label',
        'font-weight': 400,
        'font-style': 'normal',
        'font-family': 'Arial',
        'fill': 'black'
    },

    defaults: _.extend({}, Figure.defaults, {
        width: 0,
        height: 0,
        stroke: 'none'
    }),

    positions: [ 'center', 'left', 'right' ],

    getPosition: function(label, properties)  {
        var position = label.figure ? label.figure.position || 'center' : 'center';

        if (properties && properties.position) {
            position = properties.position;

            if (position.x && position.y) {
                return position;
            } else if (_.include(Label.positions, position)) {
                return position;
            }
        }
        return position; // default
    }

});

