/**
 * @name GridLayout
 * @class Grid layout implementation that lays out the element's
 * children in a grid and resizes each of them to the same size. This
 * layout can be configured to work with a certain number of columns
 * and rows.
 *
 * @example
 * // This example shows how to create a Shape
 * // with a 2x2 grid layout.
 *
 * var Shape = Ds.Shape.extend({
 *  figure: {
 *      ...
 *  },
 *  children: [ ... ],
 *  layout: {
 *      type: 'grid',
 *      columns: 2,
 *      rows: 2,
 *      marginHeight: 10,
 *      marginWidth: 10,
 *      hgap: 5,
 *      vgap: 5,
 *      columnsEqualWidth: true
 *  }
 * });
 *
 * @augments Layout
 *
 *
 */

var GridLayout = Layout.extend(/** @lends GridLayout.prototype */ {

    constructor: function(shape, attributes) {
        if (!attributes) attributes = {};
        Layout.apply(this, [shape, attributes]);

        this.columns = attributes.columns || 1;
        this.rows = attributes.rows || 0;
        this.marginHeight = attributes.marginHeight || 0;
        this.marginWidth = attributes.marginWidth || 0;
        this.vgap = attributes.vgap || 0;
        this.hgap = attributes.hgap || 0;
        this.columnsEqualWidth = attributes.columnsEqualWidth || false;
    },

    /**
     * @private
     */

    getRows: function() {
        var elements = this.shape.attributes.children;
        var columns = this.columns || elements.length;

        if (this.rows > 0)
            return this.rows;
        else
            return Math.floor((elements.length + columns - 1) / columns);
    },

    getColumns: function() {
        var elements = this.shape.attributes.children;

        if (this.rows > 0)
            return Math.floor((elements.length + this.rows - 1) / this.rows);
        else
            return this.columns;
    },

    /**
     * Executes the layout algorithm
     */

    layout: function() {
        if (!this.shape.attributes.children || !this.shape.attributes.children.length) return;

        _.each(this.computeRows('preferred'), function(row) {
            _.each(row.cells, function(cell) { cell.layout(); });
        }, this);
    },

    /**
     * @private
     */

    computeRows: function(type) {
        var bounds = this.shape.bounds();
        var columns = this.getColumns();
        var elements = this.shape.attributes.children;

        var rows = [];
        var current = { width: 0, height: 0, cells: [] };
        var previousCell;
        rows.push(current);

        // create the rows and cells
        for (var i = 0, j = 1; i < elements.length; i++, j++) {
            var shape = elements[i];
            var cell = new GridCell({ shape: shape, grid: this });
            cell.size = elements[i][type + 'Size']();
//            cell.size = elements[i].bounds();

            if (previousCell) {
                cell.previous = previousCell;
                previousCell.next = cell;
            }
            previousCell = cell;
            if (!shape.gridData || !(shape.gridData instanceof GridData)) {
                shape.gridData = new GridData(shape.gridData);
                shape.gridData.grid = cell.grid;
            }
            current.cells.push(cell);

            if (j >= columns) {
                if (i != elements.length - 1) {
                    var next = { previous: current, width: 0, height: 0, cells: [] };
                    current.next = next;
                    current = next;
                    rows.push(current);
                }
                j = 0;
            }
        }

        var marginWidth = this.marginWidth;
        var marginHeight = this.marginHeight;
        var createColumns = function() {
            var cols = [];
            for (var i = 0; i < columns; i++) {
                cols.push([]);
                for (var j = 0; j < rows.length; j++) {
                    var c = rows[j].cells[i];
                    if (c) cols[i].push(c);
                }
            }
            return cols;
        };

        var remainingHeightSpace = function(column) {
            var noGrabHeight = _.reduce(column, function(memo, cell) {
                if (cell.shape.gridData.grabExcessVerticalSpace)
                    return memo;
                else return memo + cell.size.height;
            }, 0);
            var nbGrabCells = _.reduce(column, function(memo, cell) {
                if (cell.shape.gridData.grabExcessVerticalSpace)
                    return memo + 1;
                else return memo;
            }, 0);
            return (bounds.height - (marginHeight * 2) - noGrabHeight) / nbGrabCells;
        };

        // adds witdh of all cells that are not grabExcessHorizontalSpace and
        //
        var remainingWidthSpace = function(row) {
            var noGrabCellWidth = _.reduce(row.cells, function(memo, cell) {
                if (cell.shape.gridData.grabExcessHorizontalSpace)
                    return memo;
                else return memo + cell.size.width;
            }, 0);
            var nbGrabCells = _.reduce(row.cells, function(memo, cell) {
                if (cell.shape.gridData.grabExcessHorizontalSpace)
                    return memo + 1;
                else return memo;
            }, 0);

            var remaining = (bounds.width - (marginWidth * 2) - noGrabCellWidth) / nbGrabCells;
            //console.log(remaining, noGrabCellWidth, bounds.width, (bounds.width - (marginWidth * 2) - noGrabCellWidth), nbGrabCells);

            return remaining;
        };

        // computes rows and cells position and sizes

        var baseX = bounds.x + this.marginWidth,
            y = bounds.y + this.marginHeight,
            x = baseX, size;

        _.each(createColumns(), function(column) {
            var remainingHeight = remainingHeightSpace(column);
            _.each(column, function(cell) {
                if (cell.shape.gridData.grabExcessVerticalSpace)
                    cell.height = remainingHeight;
                else cell.height = cell.size.height;
            }, this);
            // column.cell.height = _.max(row.cells, function(cell) { return cell.size.height; }).height;
        }, this);

        _.each(rows, function(row) {
            var remainingWidth = remainingWidthSpace(row);
            _.each(row.cells, function(cell) {
                cell.x = x;
                cell.y = y;

                if (this.columnsEqualWidth)
                    cell.width = bounds.width / columns;
                else
                    if (cell.shape.gridData.grabExcessHorizontalSpace) {
                        //console.log(remainingWidthSpace < cell.size.width, remaining, cell.size.width);
                        cell.width = remainingWidth;
                    } else cell.width = cell.size.width;

                row.width += cell.width;
                x += cell.width + this.hgap;
            }, this);

            var max = null;
            if (row.cells.length) {
                max = _.max(row.cells, function(cell) { return cell.height; });
            }

            row.height = max ? max.height : 0;
            y += row.height + this.vgap;
            x = baseX;

        }, this);

        return rows;
    },

    /**
     * Returns the size of the element associated to the layout
     */

    size: function(type) {
        var width = 0, height = 0,
            elements = this.shape.attributes.children,
            columns = this.getColumns(),
            nbrows = this.getRows(),
            bounds = this.shape.bounds(),
            size;

        var rows = this.computeRows(type);
        var max = _.max(rows, function(row) { return row.width; });
        width = max ? max.width : 0;
        height = _.reduce(rows, function(memo, row) { return memo + row.height; }, 0);
        width = width + ((columns - 1) * this.hgap) + (this.marginWidth * 2);
        height = height + ((nbrows - 1) * this.vgap) + (this.marginHeight * 2);

        var min = this.shape.figure.minimumSize();
        width = Math.max(min.width, width);
        height = Math.max(min.height, height);

        if (bounds.width > width) width = bounds.width;
        if (bounds.height > height) height = bounds.height;

        return { width: width, height: height };
    },

    preferredSize: function() {
        return this.size('preferred');
    },

    minimumSize: function() {
        return this.size('minimum');
    },

    maximumSize: function() {
        return this.size('maximum');
    }

});

var GridCell = function(attributes) {
    if (!attributes) attributes = {};
    this.shape = attributes.shape;
    this.grid = attributes.grid;
    this.x = attributes.x;
    this.y = attributes.y;

    // width is the element width + hgap
    // or the computed width if columnsEqualWidth.
    if (this.grid.columnsEqualWidth) {
        this.width = this.grid.columnWidth;
    } else {
        this.width = this.shape.get('width');
    }
    // height should be max height in a row
    this.height = this.shape.get('height');
};

GridCell.prototype.layout = function() {
    this.shape.set(this.align());
    this.shape.doLayout();
};

GridCell.prototype.align = function() {
    var gridData = this.shape.gridData,
        halign = gridData.horizontalAlignment,
        valign = gridData.verticalAlignment,
        x = this.x,
        y = this.y,
        width = this.shape.get('width'),
        height = this.shape.get('height');

    if (halign === 'fill') width = this.width;
    if (valign === 'fill') height = this.height;

    if (halign === 'center') {
        x = x + (this.width / 2) - (width / 2);
    }
    if (valign === 'center') {
        y = y + (this.height / 2) - (height / 2);
    }
    if (halign === 'end') {
        x = (x + (this.width)) - width;
    }
    if (valign === 'end') {
        y = (y + (this.height)) - height;
    }

    return { x: x, y: y, width: width, height: height };
};

/**
 *  @class
 *  @name GridData
 *
 *  - verticalAlignment = 'center' | 'fill' | 'beginning' | 'end'
 *  - horizontalAlignment = 'beginning' |  'fill' | 'center' | 'end'
 *  - grabExcessVerticalSpace = false | true
 *  - grabExcessHorizontalSpace = false | true
 *  - verticalSpan = 1
 *  - horizontalSpan = 1
 */
var GridData = Ds.GridData = function(attributes) {
    if (!attributes) attributes = {};
    this.grid = attributes.grid;
    this.verticalAlignment = GridData.getVerticalAlignment(attributes);
    this.horizontalAlignment = GridData.getHorizontalAlignment(attributes);
    this.grabExcessVerticalSpace = attributes.grabExcessVerticalSpace || false;
    this.grabExcessHorizontalSpace = attributes.grabExcessHorizontalSpace || false;
    this.verticalSpan = attributes.verticalSpan || 1;
    this.horizontalSpan = attributes.horizontalSpan || 1;
};

GridData.alignments = [ 'center', 'fill', 'beginning', 'end' ];

GridData.getAlignment = function(attributes, type) {
    var alignment = attributes[type + 'Alignment'];
    if (_.contains(GridData.alignments, alignment))
        return alignment;
    return null;
};

GridData.getVerticalAlignment = function(attributes) {
    return GridData.getAlignment(attributes, 'vertical') || 'center';
};

GridData.getHorizontalAlignment = function(attributes) {
    return GridData.getAlignment(attributes, 'horizontal') || 'beginning';
};

