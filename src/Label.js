/**
 * @name Label
 * @class
 *
 */
var Label = DG.Label = function(attributes) {
    var attrs = attributes || {};
    this.attributes = attrs;
    this.initialize.apply(this, arguments);
};

Label.extend = extend;

_.extend(Label.prototype, Events, {

    config: {
        draggable: false,
        selectable: false,
        resizable: false,
        editable: true
    },

    render: function() {
        if (this.figure || (this.figure = this.createFigure())) {
            if (this.config.draggable) {
                this.figure.draggable();
            }
            if (this.config.editable) {
                this.figure.on('dblclick', this.callEdit());
            }
        }
        return this;
    },

    remove: function() {
        if (this.figure) {
            this.figure.off();
            this.figure.remove();
        }
    },

    doLayout: function() {},

    diagram: function() {
        var parent = this;
        while(parent.parent) parent = parent.parent;
        return parent;
    },

    callEdit: function() {
        var label = this;
        return function() {
            createEditForm(label.figure);
        };
    },

    text: function(text) {
        if (text) {
            this.attributes.text = text;
            if (this.figure) {
                this.figure.attr('text', text);
            }
            this.trigger('change:text', text);
        }
        return this.attributes.text;
    },

    move: function(x, y) {
       if (this.figure) this.figure.move(x, y);
       return this;
    },

    initialize: function() {},

    createFigure: function() {
        return DG.Figure.create(this, this.figure);
    },

    select: function() {},

    deselect: function() {},

    isInside: function(box) {
        var bbox = this.figure.bbox();
        return bbox.x >= box.x &&
            (bbox.x + bbox.width) <= (box.x + box.width) &&
            bbox.y >= box.y &&
            (bbox.y + bbox.height) <= (box.y + box.height);
    }

});

var createEditForm = function(figure) {
    var node = figure.node;
    var bounds = figure.bbox();

    var container = node.parentNode.parentNode;
    var x = bounds.x; //container.offsetLeft;
    var y = bounds.y; //container.offsetTop;

    var textInput = document.createElement('input');
    textInput.setAttribute('type', 'text');
    textInput.setAttribute('style',
            'position: absolute; top: '+y+'px; left: '+x+'px; width: '+
            bounds.width+'px; height: '+bounds.height+'px;');
    textInput.value = figure.attr('text');
    container.appendChild(textInput);

    var handleTextInput = function(e) {
        e.stopImmediatePropagation();
        figure.attr('text', textInput.value);
        textInput.removeEventListener('blur', handleTextInput, true);
        container.removeChild(textInput);
    };

    textInput.focus();
    textInput.addEventListener('blur', handleTextInput, true);
};

