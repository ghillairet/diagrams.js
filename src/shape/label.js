// Label
//
//
var Label = Diagram.Label = function( attributes ) {
    attributes || (attributes = {});

    this.attributes = {};
    this.attributes.children = [];
    this.attributes.type = 'Diagram.Label';

    this._positions = [
        'top-left', 'top-right', 'top-center',
        'bottom-left', 'bottom-right', 'bottom-center',
        'center-left', 'center-right', 'center'
    ];

    this.parent = attributes.parent || undefined;
    this.diagram = this.parent ? this.parent.diagram : attributes.diagram;

    this.position = this._getPosition( attributes );
    this.resizable = attributes.resizable || false;
    this.draggable = attributes.draggable || false;
    this.editable = attributes.editable || true;

    if (attributes.id != null) {
        this.set('id', attributes.id);
    } else {
        this.set('id', _.uniqueId());
    }

    this.xOffset = 5;
    this.yOffset = 5;

    this.set('attr', this._attr(attributes));
    this.set('position', this.position);

    this._initChildren( attributes );

    if (attributes.width) {
        this.width = attributes.width;
    }

    if (attributes.height) {
        this.height = attributes.height;
    }

    if (attributes.text) {
        this.set('text', attributes.text);
    } else {
        this.set('text', 'Label');
    }
};

_.extend(
    Label.prototype,
    Diagram.SVGElement.prototype,
    Diagram.Draggable,
    Events
);

/**
 * @private
**/

Label.prototype._getPosition = function( properties ) {
    if (properties.position) {
        var position = properties.position;
        if (position.x && position.y) {
            return position;
        } else if (_.include(this._positions, position)) {
            return position;
        }
    }
    return 'center'; // default
};

/**
 * @private
**/

Label.prototype._initChildren = function( attributes ) {
    var children = attributes.children;

    if (children && children.length > 0) {
        _.each(children, function( child ) {
            if (child.type === 'Diagram.Image') {
                var image = this.createImage( child );
                this.get('children').push( image );
            }
        }, this);
    } else {
        if (attributes.image) {
            var image = this.createImage( attributes.image );
            this.get('children').push( image );
        }
    }
};

/**
 * @api public
**/
// Should be only one image.
Label.prototype.createImage = function( attributes ) {
    attributes.parent = this;
    var image = new Diagram.Image( attributes );
    this.image = image;
    return image;
};

/**
 * @api public
**/

Label.prototype.render = function() {
    var paper = this.paper();

    var x, y, bBox = this.parent.wrapper.getABox();

    if (this.position.x && this.position.y) {
        x = bBox.x + this.position.x;
        y = bBox.y + this.position.y;
    } else {
        x = bBox.xCenter;
        y = bBox.yMiddle;
    }

    this.wrapper = paper.text(x, y, this.get('text')).attr({
        fill: 'black',
        'font-size': 12
    }).attr(this.get('attr'));

    this.wrapper.toFront();
    this.wrapper.controller = this;

    _.each(this.get('children'), function(c) { c.render(); });

    this.center();

    if (this.editable) {
        this.asEditable();
    }

    return this;
};

Label.prototype.resize = function( dx, dy, direction ) {
    var bBox = this.parent.wrapper.getABox();
    var tbb = this.wrapper.getABox();
    this.center();

    if (direction === 'nw' || direction === 'ne') {
        this.attr('y', this.wrapper.oy + dy);
    }
};

Label.prototype.center = function() {
    var box = this.parent.wrapper.getABox();
    var tbb = this.wrapper.getABox();

    switch (this.position) {
        case 'center':
            this.attr('x', box.xCenter);
            this.attr('y', box.yMiddle);
            break;
        case 'center-left':
            this.attr('x', box.x + this.xOffset + (tbb.width / 2))
            this.attr('y', box.yMiddle)
            if (this.image) {
                var x = this.attr('x');
                this.attr({x: x + this.image.attr('width')});
            }
            break;
        case 'center-right':
            this.attr('x', box.xRight - this.xOffset - (tbb.width / 2))
            this.attr('y', box.yMiddle)
            break;
        case 'top-center':
            this.attr('x', box.xCenter);
            this.attr('y', box.y + (tbb.height / 2) + this.yOffset);
            break;
        case 'top-left':
            this.attr('x', box.x + (tbb.width / 2) + this.xOffset);
            this.attr('y', box.y + (tbb.height / 2) + this.yOffset);
            break;
        case 'top-right':
            this.attr('x', box.xRight - this.xOffset - (tbb.width / 2));
            this.attr('y', box.y + (tbb.height / 2) + this.yOffset)
            break;
        case 'bottom-center':
            this.attr('x', box.xCenter);
            this.attr('y', box.yBottom - (tbb.height / 2) - this.yOffset);
            break;
        case 'bottom-left':
            this.attr('x', box.x + this.xOffset + (tbb.width / 2));
            this.attr('y', box.yBottom - (tbb.height / 2) - this.yOffset);
            break;
        case 'bottom-right':
            this.attr('x', box.x - this.xOffset - (tbb.width / 2));
            this.attr('y', box.yBottom - (tbb.height / 2) - this.yOffset);
            break;
        default:
            break;
        }

        if (this.image) {
            tbb = this.wrapper.getABox();
            this.image.attr({ x: tbb.x - this.image.attr('width')});
            this.image.attr({ y: tbb.y });
        }
};

Label.prototype.setText = function( text ) {
    this.set('text', text);

    if (this.wrapper) {
        this.wrapper.attr('text', text);
        this.center();
    }

    this.trigger('change:text', this);
};

Label.prototype.getText = function() {
    return this.get('text');
};

Label.prototype.remove = function() {
    if (this.image) {
        this.image.remove();
    }
    if (this.wrapper) {
        this.wrapper.remove();
    }
};

Label.prototype.asEditable = function() {
    var node = this;

    if (!node.wrapper) {
        return;
    }

    var createInputTextForm = function( node ) {
        var aBox = node.wrapper.getABox();
        var pBox = node.parent.wrapper.getABox();

        var px = node.diagram.el().offsetLeft;
        var py = node.diagram.el().offsetTop;

        var x = pBox.x + (isNaN(px) ? 0 : px);
        var y = pBox.y + (isNaN(py) ? 0 : py);

        var w = node.parent.attr('width');
        var h = 20;

        var txt = this.textForm = document.createElement('form');
        txt.setAttribute('style', 'position: absolute; left: ' + x + 'px; top: ' + y + 'px;');

        var inputForm = document.createElement('input');
        inputForm.setAttribute('type', 'text');
        inputForm.setAttribute('placeholder', node.get('text'));
        inputForm.setAttribute('style', 'padding: 0; width:' + w + 'px; height: ' + h + 'px; z-index: 1;');
        txt.appendChild(inputForm);

        return {
            form: txt,
            input: inputForm
        }
    };

    var remove = function( node ) {
        if (node && node.parentNode) {
            node.parentNode.removeChild( node );
        }
    };

    node.wrapper.dblclick(function(event) {
        var ml = node.diagram.modifiedLabel;
        if (ml && ml !== node) {
            remove(node.diagram.inputText);
            remove(node.diagram.modifiedLabel.textForm);
        }

        if (node.textForm) {
            remove(node.textForm);
        }

        var el = createInputTextForm( node );

        node.textForm = el.form;
        node.diagram.inputText = el.input;
        node.diagram.modifiedLabel = node;

        node.diagram.el().parentNode.appendChild(el.form);
    });
};