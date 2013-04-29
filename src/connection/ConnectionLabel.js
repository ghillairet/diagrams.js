
/**
 * @name ConnectionLabel
 * @class Represents a label associated to a connection
 * @augments DiagramElement
 */

var ConnectionLabel = Ds.ConnectionLabel = Ds.DiagramElement.extend(/** @lends ConnectionLabel.prototype */ {

    constructor: function(attributes) {
        Ds.DiagramElement.apply(this, [attributes]);

        if (!attributes.connection) {
            throw new Error('ConnectionLabel must have a parent Connection');
        }

        this.connection = attributes.connection;
        this.diagram = this.connection.diagram;
        this.position = attributes.position;

        this.set('text', attributes.text);
    },

    /**
     * Removes the label from the canvas
     */

    remove: function() {
        if (this.wrapper) this.wrapper.remove();
    },

    /**
     * Renders the label on canvas
     */

    render: function() {
        this.remove();
        var paper = this.renderer(),
            connection = this.connection,
            wrapper = this.wrapper = paper.text(0, 0, this.get('text'));

        var positionRelativeToShape = function( wrapper, sbox, x, y ) {
            // Determine position of shape relative to the anchor.
            var isLeft = sbox.xCenter < x;
            var isTop = sbox.yMiddle > y;

            var box = wrapper.getBBox();
            var xOffset = isLeft ? (10 + (box.width / 2)) : (10 - box.width);
            var yOffset = isTop ? -10 : 10;

            return { x: x + xOffset, y: y + yOffset };
        };

        var placeLabelEnd = function() {
            var anchor = connection.get('targetAnchor'),
                sbox = anchor.shape.bounds();
                abox = anchor.bounds(),
                x = abox.xCenter,
                y = abox.yMiddle;

            var r = Math.sqrt((x * x) + (y * y));
            var theta = Math.atan(y / x);

            return positionRelativeToShape( wrapper, sbox, x, y);
        };

        var placeLabelStart = function() {
            var anchor = connection.get('sourceAnchor'),
                sbox = anchor.shape.bounds(),
                abox = anchor.bounds(),
                x = abox.xCenter,
                y = abox.yMiddle;

            return positionRelativeToShape( wrapper, sbox, x, y);
        };

        var placeLabelMiddle = function() {
            var sa = connection.get('sourceAnchor'),
                ta = connection.get('targetAnchor'),
                sabox = sa.bounds(),
                tabox = ta.bounds(),
                x1 = sabox.xCenter,
                y1 = sabox.yMiddle,
                x2 = tabox.xCenter,
                y2 = tabox.yMiddle;

            var x = (x1 + x2) / 2;
            var y = (y1 + y2) / 2;

            y = y - 10;

            return { x: x, y: y };
        };

        var position;
        switch(this.position) {
            case 'start':
                position = placeLabelStart();
                break;
            case 'end':
                position = placeLabelEnd();
                break;
            default:
                position = placeLabelMiddle();
                break;
        }

        this.wrapper.transform(['t', position.x, ',', position.y].join('') );

        this.asEditable().asDraggable();

        return this;
    },

    /**
     * Changes the label's text. This method triggers the
     * change:text event.
     *
     * @param {string} text
     */

    setText: function(text) {
        this.set('text', text);
        this.trigger('change:text', text);

        if (this.wrapper) {
            this.wrapper.attr('text', text);
        }
    },

    /**
     * Sets the label as draggable
     */

    asDraggable: function() {
        var start = function() {
            this.o();
        };
        var end = function() {

        };
        var move = function( dx, dy, mx, my, ev ) {
            var x = this.ox + dx;
            var y = this.oy + dy;

            this.attr({ x: x, y: y });
        };

        if (this.wrapper) {
            this.wrapper.attr( {cursor: 'move'} );
            this.wrapper.drag( move, start, end );
        }

        return this;
    },

    /**
     * Sets the label as editable
     */

    asEditable: function() {
        var node = this;
        var diagram = this.connection.diagram;

        if (!node.wrapper) {
            return;
        }

        var createInputTextForm = function( label ) {
            var aBox = label.bounds();

            var diagram = label.connection.diagram;
            var px = diagram.canvas().offsetLeft;
            var py = diagram.canvas().offsetTop;

            var x = aBox.x + (isNaN(px) ? 0 : px);
            var y = aBox.y + (isNaN(py) ? 0 : py);

            var w = aBox.width + 20;
            var h = 20;

            var txt = document.createElement('form');
            txt.setAttribute('style', 'position: absolute; left: ' + x + 'px; top: ' + y + 'px;');

            var inputForm = document.createElement('input');
            inputForm.setAttribute('type', 'text');
            inputForm.setAttribute('placeholder', label.wrapper.attr('text'));
            inputForm.setAttribute('style', 'padding: 0; width:' + w + 'px; height: ' + h + 'px; z-index: 1;');
            txt.appendChild(inputForm);

            return {
                form: txt,
                input: inputForm
            };
        };

        var remove = function( node ) {
            if (node && node.parentNode) {
                node.parentNode.removeChild( node );
            }
        };

        node.wrapper.dblclick(function(event) {
            var ml = diagram.modifiedLabel;
            if (ml && ml !== node) {
                remove(diagram.inputText);
                remove(diagram.modifiedLabel.textForm);
            }

            if (node.textForm) {
                remove(node.textForm);
            }

            var el = createInputTextForm( node );

            node.textForm = el.form;
            diagram.inputText = el.input;
            diagram.modifiedLabel = node;

            diagram.canvas().parentNode.appendChild(el.form);
        });

        return this;
    }

});

