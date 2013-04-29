/**
 * @name BoundBox
 * @class Displays the shape's bounds when the shape is moved or resized.
 * @augments DiagramElement
 */

Ds.BoundBox = Ds.DiagramElement.extend(/** @lends BoundBox.prototype */ {

    constructor: function(attributes) {
        Ds.DiagramElement.apply(this, [attributes]);
        this.control = attributes.control;
        this.control.on('start:move', this.stateMove, this);
        this.control.on('start:resize', this.stateSize, this);
        this.control.on('end:move end:resize', this.stateNone, this);
    },

    stateMove: function() {
        this.state = 'move';
        this._left = 'x';
        this._right = 'y';
    },

    stateSize: function() {
        this.state = 'resize';
        this._left = 'width';
        this._right = 'height';
    },

    stateNone: function() {
        delete this.state;
    },

    render: function() {
        this.remove();

        var paper = this.control.renderer();
        var bounds = this.control.bounds();
        var x = bounds.xRight + 15;
        var y = bounds.yMiddle;

        this.text = paper.text(x, y, this.getText());

        var width = this.text.getABox().width;
        this.text.translate(width / 2 + 10, 10);

        this.shadow = paper.rect(x, y, width + 20, 20);
        this.shadow.attr({ fill: 'black', opacity: 0.2, stroke: 'none' });
        this.shadow.translate(2, 2);
        this.wrapper = paper.rect(x, y, width + 20, 20);
        this.wrapper.attr({ fill: '#FFFF99', opacity: 1, stroke: 'none' });

        this.text.toFront();

        return this;
    },

    remove: function() {
        if (!this.wrapper) return;

        this.wrapper.remove();
        this.shadow.remove();
        this.text.remove();
    },

    getText: function() {
        return this.getTemplate()({
            left: this.control.get(this._left),
            right: this.control.get(this._right)
        });
    },

    getTemplate: function() {
        if (this.state === 'move')
            return _.template('x: <%= left %>px y: <%= right %>px');
        else if (this.state === 'resize')
            return _.template('width: <%= left %>px  height: <%= right %>px');
        else
            return null;
    }

});

