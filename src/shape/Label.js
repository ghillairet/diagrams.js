/**
 * @name Label
 * @class Diagram Element that can display a text with an associated icon.
 * @augments LayoutElement
 *
 */

var Label = Ds.Label = Ds.LayoutElement.extend(/** @lends Label.prototype */ {
    resizable: false,
    editable: true,
    draggable: true,

    constructor: function(attributes) {
        if (!attributes) attributes = {};
        Ds.LayoutElement.apply(this, [attributes]);
        this.initProperties(attributes);
        var image = this.figure ? this.figure.image : attributes.figure.image;
        if (image) this.setImage(image);

        this.initialize(attributes);
    },

    /**
     * @private
     */

    initProperties: function(attributes) {
        var properties = ['resizable', 'editable', 'draggable'];
        var setBoolean = function(property) {
            if (_.isBoolean(attributes[property])) {
                this[property] = attributes[property];
            }
        };
        _.each(properties, setBoolean, this);
    },

    /**
    */

    setImage: function(attributes) {
        attributes.parent = this;
        var image = new Ds.Image( attributes );
        this.image = image;
        return image;
    },

    /**
     * Renders the Label on the canvas.
     */

    render: function() {
        this.figure.render();
        this.figure.toFront();

        if (this.image) this.image.render();
        if (this.editable) this.asEditable();
        if (this.draggable) this.figure.asDraggable();

        return this;
    },

    /**
     * Sets the text. It will trigger a
     * change:text event unless the silent
     * argument is set to false.
     *
     * @param {string} text
     * @param {boolean} silent event
     */

    setText: function(text, silent) {
        this.set('text', text);
        this.doLayout();
        if (!silent) this.trigger('change:text', this);
    },

    /**
     * Returns the text value.
     *
     * @return {string}
     */

    getText: function() {
        return this.get('text');
    },

    /**
     * Removes the Label from the canvas.
     */

    remove: function() {
        if (this.image) {
            this.image.remove();
        }
        if (this.figure) {
            this.figure.remove();
        }
    },

    removeContent: function() {},
    renderEdges: function() {},
    renderContent: function() {},

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

    /**
     * @private
     */

    asEditable: function() {
        var node = this;
        var diagram = node.diagram;
        var createInputTextForm = function(node) {
            var box = node.bounds(),
                px = node.diagram.el.offsetLeft,
                py = node.diagram.el.offsetTop,
                x = box.x + (isNaN(px) ? 0 : px),
                y = box.y + (isNaN(py) ? 0 : py),
                w = box.width,
                h = box.height,
                id = 'form-input-' + node.get('id');

            var form = document.getElementById(id);
            if (form) {
                form.parentNode.removeChild(form);
            }
            form = document.createElement('form');
            var inputForm = document.createElement('input');

            form.setAttribute('id', id);
            form.setAttribute('style', 'position: absolute; left: ' + x + 'px; top: ' + y + 'px;');
            inputForm.setAttribute('type', 'text');
            inputForm.value = node.getText() || '';
            inputForm.setAttribute('style', 'width:' + w + 'px; height: ' + h + 'px;');
            form.appendChild(inputForm);

            return { form: form, input: inputForm };
        };
        var handleTextInput = function(e) {
            e.stopImmediatePropagation();
            if (!node.el) return;
            var text = node.el.input.value;
            node.setText(text);

            node.el.form.removeEventListener('blur', handleTextInput, true);
            node.el.form.parentNode.removeChild(node.el.form);
            delete node.el;
            delete node.domNode;
        };
        node.on('dblclick', function(e) {
            e.stopImmediatePropagation();
            var el = createInputTextForm( node );
            node.el = el;
            node.domNode = node.diagram.el.parentNode;
            node.domNode.appendChild(el.form);
            node.el.form.focus();
            node.el.form.addEventListener('blur', handleTextInput, true);
        });
    }

});

_.extend(Ds.Label.prototype, Ds.Selectable, Ds.Resizable, Ds.Events);

