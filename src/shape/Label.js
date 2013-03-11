/**
 * @name Label
 * @class Diagram Element that can display a text with an associated icon.
 * @augments LayoutElement
 *
 */

var Label = Ds.Label = Ds.LayoutElement.extend(/** @lends Label.prototype */ {

    constructor: function(attributes) {
        Ds.LayoutElement.apply(this, [attributes]);

        this.resizable = attributes.resizable || false;
        if (_.isBoolean(attributes.draggable))
            this.draggable = attributes.draggable;
        this.editable = attributes.editable || true;

        this.xOffset = 5;
        this.yOffset = 5;

        var image = this.figure ? this.figure.image : attributes.figure.image;
        if (image) this.setImage(image);

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
        this.figure.render();
        this.figure.toFront();

        if (this.image) this.image.render();
        if (this.editable) this.asEditable();

//        if (this.draggable) this.asDraggable();

        return this;
    },

    setText: function( text, silent ) {
        this.set('text', text);
        this.doLayout();

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
        if (this.figure) {
            this.figure.remove();
        }
    },

    doLayout: function() {
        if (this.figure) this.figure.layoutText();
    },

    toFront: function() {
        if (this.figure) this.figure.toFront();
        if (this.image) this.image.toFront();
    },

    preferredSize: function() {
        return {
            width: this.get('width'),
            height: this.get('height')
        };
    },

    minimumSize: function() {
        return this.figure.minimumSize();
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

        node.label.on('dblclick', function(event) {
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

