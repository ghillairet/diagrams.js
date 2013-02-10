

var positions = [
    'top-left', 'top-right', 'top-center',
    'bottom-left', 'bottom-right', 'bottom-center',
    'center-left', 'center-right', 'center'
];

function getPosition(label, properties)  {
    var position = label.figure ? label.figure.position || 'center' : 'center';

    if (properties && properties.position) {
        position = properties.position;

        if (position.x && position.y) {
            return position;
        } else if (_.include(positions, position)) {
            return position;
        }
    }

    return position; // default
}

/**
 * @name Label
 * @class Diagram Element that can display a text with an associated icon.
 * @augments LayoutElement
 *
 */

var Label = Ds.Label = Ds.LayoutElement.extend(/** @lends Label.prototype */ {

    constructor: function(attributes) {
        Ds.LayoutElement.apply(this, [attributes]);

        this.position = getPosition(this, attributes);
        this.resizable = attributes.resizable || false;
        this.draggable = attributes.draggable || false;
        this.editable = attributes.editable || true;

        this.xOffset = 5;
        this.yOffset = 5;

        var image = this.figure ? this.figure.image : attributes.figure.image;
        if (image) {
            this.setImage(image);
        }
        this.initialize(attributes);
    },

    // Should be only one image.
    setImage: function(attributes) {
        attributes.parent = this;
        var image = new Ds.Image( attributes );
        this.image = image;
        return image;
    },

    render: function() {
        if (this.wrapper) this.remove();

        var paper = this.paper();
//            bBox = this.parent.wrapper.getABox();

        this.wrapper = paper.rect().attr({ fill: 'none', stroke: 'none' });
        if (this.attributes.fill) {
            this.wrapper.attr({ fill: this.attributes.fill });
        }
        this.label = paper.text(0, 0, this.get('text')).attr({
            fill: 'black',
            'font-size': 12
        });

        if (this.attributes['font-size']) {
            this.label.attr('font-size', this.attributes['font-size']);
        }

        this.wrapper.toFront();
        this.label.toFront();
        this.wrapper.controller = this;
        console.log('render', this.get('x'));
        this.doLayout();

//        var size = this.preferredSize();
//        this.wrapper.attr({ width: size.width, height: size.height });

        if (this.image) this.image.render();
        if (this.editable) this.asEditable();

        return this;
    },

    center: function() {
        var box = this.wrapper.getABox(),
            label = this.label,
            lbox = label.getABox();
console.log(this.position, box.xCenter);
        switch (this.position) {
            case 'center':
                label.attr('x', box.xCenter);
                label.attr('y', box.yMiddle);
                break;
            case 'center-left':
                label.attr('x', box.x + (lbox.width / 2) + this.xOffset);
                label.attr('y', box.yMiddle);
                if (this.image) {
                    var x = this.get('x');
                    this.set({ x: x + this.image.get('width') });
                }
                break;
            case 'center-right':
                label.attr('x', box.xRight - this.xOffset - (lbox.width / 2));
                label.attr('y', box.yMiddle);
                break;
            case 'top-center':
                label.attr('x', box.xCenter);
                label.attr('y', box.y + (lbox.height / 2) + this.yOffset);
                break;
            case 'top-left':
                label.attr('x', box.x + (lbox.width / 2) + this.xOffset);
                label.attr('y', box.y + (lbox.height / 2) + this.yOffset);
                break;
            case 'top-right':
                label.attr('x', box.xRight - this.xOffset - (box.width / 2));
                label.attr('y', box.y + (box.height / 2) + this.yOffset);
                break;
            case 'bottom-center':
                label.attr('x', box.xCenter);
                label.attr('y', box.yBottom - (box.height / 2) - this.yOffset);
                break;
            case 'bottom-left':
                label.attr('x', box.x + this.xOffset + (box.width / 2));
                label.attr('y', box.yBottom - (box.height / 2) - this.yOffset);
                break;
            case 'bottom-right':
                label.attr('x', box.x - this.xOffset - (box.width / 2));
                label.attr('y', box.yBottom - (box.height / 2) - this.yOffset);
                break;
            default:
                break;
        }

        if (this.image) {
            this.image.set({ x: lbox.x - this.image.get('width') - 2 });
            this.image.set({ y: lbox.y });
        }
    },

    setText: function( text, silent ) {
        this.set('text', text);

        if (this.wrapper && this.label) {
            this.label.attr('text', text);
            this.doLayout();
        }

        if (!silent) {
            this.trigger('change:text', this);
        }
    },

    getText: function() {
        return this.get('text');
    },

    remove: function() {
        if (this.image) {
            this.image.remove();
        }
        if (this.label) {
            this.label.remove();
        }
        if (this.wrapper) {
            this.wrapper.remove();
        }
    },

    doLayout: function() {
        this.center();
    },

    preferredSize: function() {
//        console.log('preferredSize', this.label.getABox());
        if (this.label) {
            return this.label.getABox();
        } else {
            return { width: this.get('width'), height: this.get('height') };
        }
    },

    minimumSize: function() {
        if (this.label) {
            return this.label.getABox();
        } else {
            return { width: this.get('width'), height: this.get('height') };
        }
    },

    asEditable: function() {
        var node = this;

        if (!node.label) return;

        var createInputTextForm = function( node ) {
            var aBox = node.label.getABox(),
                pBox = node.wrapper.getABox(),
                px = node.diagram.el.offsetLeft,
                py = node.diagram.el.offsetTop,
                x = aBox.x + (isNaN(px) ? 0 : px),
                y = aBox.y + (isNaN(py) ? 0 : py),
                w = pBox.width,
                h = aBox.height + 4;

            var txt = node.textForm = document.createElement('form');
            txt.setAttribute('style', 'position: absolute; left: ' + x + 'px; top: ' + y + 'px;');

            var inputForm = document.createElement('input');
            inputForm.setAttribute('type', 'text');
            inputForm.value = node.get('text');
            inputForm.setAttribute('style', 'padding: 0; width:' + w + 'px; height: ' + h + 'px; z-index: 1;');
            txt.appendChild(inputForm);

            return { form: txt, input: inputForm };
        };

        var remove = function( node ) {
            if (node && node.parentNode) {
                node.parentNode.removeChild( node );
            }
        };

        node.label.dblclick(function(event) {
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

            node.diagram.el.parentNode.appendChild(el.form);
        });
    }

});

_.extend(Ds.Label.prototype, Ds.Draggable, Ds.Events);
