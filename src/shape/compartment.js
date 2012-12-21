
// Compartment
//

var Compartment = Ds.Compartment = Ds.Shape.extend({

    resizable: false,
    draggable: false,
    layout: 'fixed', // horizontal, vertical
    spacing: 5,

    constructor: function(attributes) {
        Ds.Shape.apply(this, [attributes]);

        this.accepts = attributes.accepts || [];
        this.initialize.apply(this, arguments);
    },

    click: function(e) {
        var control = this.controller;
        if (control.parent) {
            control.parent.select();
        }
    },

    canCreate: function(func) {
        if (!func || typeof func !== 'function') return false;
        var found = _.find(this.accepts, function(c) { return c === func; });

        return found ? true : false;
    },

    createShape: function(func, position) {
        var attrs = { parent: this },
            shape, x, y;

        if (this.layout === 'vertical') {
            attrs.x = 0;
            attrs.y = this._height();
        } else if (this.layout === 'horizontal') {
            attrs.x = this._width();
            attrs.y = 0;
        } else {
            // computes coordinates according to the
            // compartment position.
            x = position.x;
            y = position.y;
        }

        shape = new func(attrs);
        if (shape) this.children.push(shape);

        var newHeight = this._height(),
            oldHeight = this.get('height');

        if (newHeight > oldHeight) {
            this.set('height', newHeight);
        }

        var h = this.wrapper.attr('height');
        console.log('height', h, attrs.y, shape.get('height'), this._height());

        this.doLayout();

        return shape;
    },

    _width: function() {
        var child = this.children,
            width = 0;

        _.each(child, function(c) {
            if (c.wrapper) {
                width += c.wrapper.attr('width');
            } else {
                width += c.get('width');
            }
        });

        return width;
    },

    _height: function() {
        var child = this.children,
            height = 0;

        _.each(child, function(c) {
            if (c.wrapper) {
                height += c.wrapper.attr('height');
            } else {
                height += c.get('height');
            }
        });

        return height;
    }

});

