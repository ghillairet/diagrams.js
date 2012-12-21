//
// FlowLayout
//

var FlowLayout = Layout.extend({

    constructor: function(shape, attributes) {
        if (!attributes) attributes = {};
        Layout.apply(this, [shape, attributes]);
        this.vertical = attributes.vertical;
    },

    layout: function() {
        var offset = { x: this.shape.get('x'), y: this.shape.get('y') },
            bounds = this.shape.bounds(),
            elements = this.shape.children,
            elementSize,
            currentRow = [],
            rowSize = { width: 0, height: 0 };

        var align = function(row, off, eSize, pSize) {
            var position = { x: off.x, y: off.y },
                i = 0,
                length = row.length;

            position.x += (pSize.width - rowSize.width) / 2;

            for (; i<length; i++) {
                position.y = off.y;
                row[i].set(position);
                row[i].doLayout();
                position.x += row[i].bounds().width;
            }
        };

        _.each(elements, function(e) {
            elementSize = e.preferredSize();

            if ((rowSize.width + elementSize.width) > bounds.width) {
                align(currentRow, rowSize, bounds);
                currentRow = [];
                // new column
                offset.y += elementSize.height;
                rowSize.width = 0;
                rowSize.height = 0;
            }

            rowSize.height = Math.max(rowSize.height, elementSize.height);
            rowSize.width += elementSize.width;
            e.set(elementSize);
            currentRow.push(e);
        });

        align(currentRow, offset, elementSize, bounds);
        console.log(size('preferred')(this.shape));
    },

    size: function() {
        var bounds = shape.bounds(),
        i = 0,
        width = 0,
        height = 0,
        first = false,
        tSize;

        for (; i < elements.length; i++) {
            tSize = elements[i][type+'Size']();
            height = Math.max(height, tSize.height);
            width += tSize.width;
        }

        return { width: width + (elements.length - 1), height: height };
    }

});

