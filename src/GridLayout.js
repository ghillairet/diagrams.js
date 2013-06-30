/**
 * @class
 * @name GridLayout
 *
 */
var GridLayout = DG.GridLayout = function(shape, data) {
    if (!shape) throw Error('Shape is not defined');
    data = data || {};

    this._shape         = shape;
    this._columns       = data.columns || 1;
    this._rows          = data.rows || 0;
    this.marginHeight   = data.marginHeight || 0;
    this.marginWidth    = data.marginWidth || 0;
    this.vgap           = data.vgap || 0;
    this.hgap           = data.hgap || 0;
};

GridLayout.prototype.columns = function() {
    var elements = this._shape.children;
    if (this._rows > 0)
        return Math.floor((elements.length + this._rows - 1) / this._rows);
    else
        return this._columns;
};

GridLayout.prototype.size = function() {
    if (!this._shape.children.length) return;

    this.rows   = this.createRows();
    this.bounds = this.computeSize();

    return this.bounds;
};

GridLayout.prototype.computeSize = function() {
    var max = _.max(this.rows || [], function(row) { return row.width; });
    var height = _.reduce(this.rows || [], function(memo, row) { return memo + row.height; }, 0);
    var width = (this.marginWidth * 2) + max.width + this.hgap * (max.cells.length - 1);
    height = height + ((this.rows.length - 1) * this.vgap) + (this.marginHeight * 2);

    var bounds = this._shape.figure.bbox();
    width = Math.max(bounds.width, width);
    height = Math.max(bounds.height, height);

    return { height: height, width: width };
};

var size = function(shape) {
    if (shape.layout) {
        return shape.layout.bounds || shape.figure.bbox();
    } else {
        return shape.figure.bbox();
    }
};

var createBasicRows = function(elements, columns) {
    var i       = 0,
        j       = 1,
        l       = elements.length,
        rows    = [],
        current = { width: 0, height: 0, cells: [] },
        previous,
        next,
        cell,
        currentShape;

    if (l) rows.push(current);

    for (; i < l; i++, j++) {
        currentShape = elements[i];
        cell = new GridCell({ shape: currentShape });
        cell.size = size(currentShape);
        if (previous) {
            cell.previous = previous;
            previous.next = cell;
        }
        previous = cell;
        current.cells.push(cell);
        if (j >= columns) {
            if (i != l - 1) {
                next = {
                    previous: current,
                    width: 0,
                    height: 0,
                    cells: []
                };
                current.next = next;
                current = next;
                rows.push(current);
            }
            j = 0;
        }
    }

    return rows;
};

var createColumns = function(rows, num) {
    var cols    = [],
        i       = 0,
        l       = rows.length,
        j, c;

    for (; i < num; i++) {
        cols.push([]);
        for (j = 0; j < l; j++) {
            c = rows[j].cells[i];
            if (c) {
                cols[i].push(c);
            }
        }
    }
    return cols;
};

GridLayout.prototype.createRows = function() {
    var elements        = this._shape.children,
        rows            = createBasicRows(elements, this.columns());

    _.each(createColumns(rows, this.columns()), function(column) {
        _.each(column, function(cell) {
            cell.height = cell.size.height;
        });
    });

    var updateRow = function(row) {
        var updateCell = function(cell) {
            cell.width = cell.size.width;
            row.width += cell.width;
        };

        _.each(row.cells, updateCell, this);

        var max = null;
        if (row.cells.length) {
            max = _.max(row.cells, function(cell) { return cell.height; });
        }

        row.height = max ? max.height : 0;
    };

    _.each(rows, updateRow, this);

    return rows;
};

GridLayout.prototype.layout = function() {
    var figure          = this._shape.figure,
        bounds          = size(this._shape),
        baseX           = figure.x() + this.marginWidth,
        x               = baseX,
        y               = figure.y() + this.marginHeight,
        hgap            = this.hgap,
        vgap            = this.vgap,
        marginWidth     = this.marginWidth,
        marginHeight    = this.marginHeight;

    var remainingHeightSpace = function(column) {
        var noGrabHeight = _.reduce(column, function(memo, cell) {
            if (cell.shape.gridData && cell.shape.gridData.grabExcessVerticalSpace)
                return memo;
            else return memo + cell.size.height;
        }, 0);
        var nbGrabCells = _.reduce(column, function(memo, cell) {
            if (cell.shape.gridData && cell.shape.gridData.grabExcessVerticalSpace)
                return memo + 1;
            else return memo;
        }, 0);
        var gaps = vgap * (column.length - 1);
        var bound = bounds.height - (marginHeight * 2) - gaps;
        var remaining = (bound - noGrabHeight) / nbGrabCells;
        return remaining;
    };
    var remainingWidthSpace = function(row) {
        var noGrabCellWidth = _.reduce(row.cells, function(memo, cell) {
            if (cell.shape.gridData && cell.shape.gridData.grabExcessHorizontalSpace)
                return memo;
            else return memo + cell.size.width;
        }, 0);
        var nbGrabCells = _.reduce(row.cells, function(memo, cell) {
            if (cell.shape.gridData && cell.shape.gridData.grabExcessHorizontalSpace)
                return memo + 1;
            else return memo;
        }, 0);

        var gaps = hgap * (row.cells.length - 1);
        var bound = bounds.width - (marginWidth * 2) - gaps;
        var remaining = (bound - noGrabCellWidth) / nbGrabCells;
        return remaining;
    };
    var updateRowPosition = function(row) {
        var remainingWidth = remainingWidthSpace(row);
        var updateCellPosition = function(cell) {
            cell.x = x;
            cell.y = y;

            if (cell.shape.gridData && cell.shape.gridData.grabExcessHorizontalSpace) {
                cell.width = remainingWidth;
            } else {
                cell.width  = cell.size.width;
            }
            x += cell.width + hgap;
        };

        _.each(row.cells, updateCellPosition);
        y += row.height + vgap;
        x = baseX;
    };
    var layoutCell  = function(cell) { cell.layout(); };
    var layoutRow   = function(row) {
        _.each(row.cells, layoutCell);
    };

    _.each(createColumns(this.rows || [], this.columns()), function(column) {
        var remainingHeight = remainingHeightSpace(column);
        _.each(column, function(cell) {
            if (cell.shape.gridData && cell.shape.gridData.grabExcessVerticalSpace) {
                cell.height = remainingHeight;
            } else {
                cell.height = cell.size.height;
            }
        });
    });

    _.each(this.rows || [], updateRowPosition);
    _.each(this.rows || [], layoutRow);

    _.each(this._shape.children || [], function(c) {
        if (c.layout) c.layout.layout();
    });
};

/**
 * @class
 * @name GridCell
 *
 */
var GridCell = DG.GridCell = function(data) {
    this.shape  = data.shape;
    this.width  = 0;
    this.height = 0;
};

GridCell.prototype.layout = function() {
    var data    = this.shape.gridData,
        bbox    = this.shape.figure.bbox();
        x       = this.x,
        y       = this.y,
        width   = bbox.width,
        height  = bbox.height;

    if (data) {
        /*
        if (data.verticalAlignment === 'center') {
            y += (this.height - height) / 2;
        }
        if (data.horizontalAlignment === 'center') {
            x += (this.width / 2) - (width / 2);
        }
        */
        this.shape.figure.move(x, y);
        if (data.horizontalAlignment === 'fill') {
            this.shape.figure.attr({ width: this.width, height: this.height });
        }
    } else {
        this.shape.figure.move(x, y);
    }
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
var GridData = DG.GridData = function(attributes) {
    var attrs = attributes || {};

    this.verticalAlignment          = GridData.getVerticalAlignment(attrs);
    this.horizontalAlignment        = GridData.getHorizontalAlignment(attrs);
    this.grabExcessVerticalSpace    = attrs.grabExcessVerticalSpace || false;
    this.grabExcessHorizontalSpace  = attrs.grabExcessHorizontalSpace || false;
    this.verticalSpan               = attrs.verticalSpan || 1;
    this.horizontalSpan             = attrs.horizontalSpan || 1;
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

