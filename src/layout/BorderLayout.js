/**
 * @name BorderLayout
 * @class Border Layout implementation that lays out the element's children in five different
 * regions (north, west, center, east, south).
 * @augments Layout
 *
 */
var BorderLayout = Layout.extend(/** @lends BorderLayout.prototype */ {

    constructor: function(shape, attributes) {
        if (!attributes) attributes = {};
        Layout.apply(this, [shape, attributes]);
        this.vgap = attributes.vgap || 0;
        this.hgap = attributes.hgap || 0;
    },

    /**
     * Executes the layout algorithm
     */

    layout: function() {
        var bounds = this.shape.bounds();
        var top = bounds.y;
        var bottom = bounds.bottomLeft.y;
        var left = bounds.xLeft;
        var right = bounds.xRight;
        var tmpSize;

        if (this.north) {
            tmpSize = this.north.preferredSize();
            this.north.set({ x: left, y: top, width: right - left, height: tmpSize.height });
            this.north.doLayout();
            top += tmpSize.height + this.vgap;
        }

        if (this.south) {
            tmpSize = this.south.preferredSize();
            this.south.set({ x: left, y: bottom - tmpSize.height, width: right - left, height: tmpSize.height });
            this.south.doLayout();
            bottom -= tmpSize.height + this.vgap;
        }

        if (this.east) {
            tmpSize = this.east.preferredSize();
            this.east.set({ x: right - tmpSize.width, y: top, width: tmpSize.width, height: bottom - top });
            this.east.doLayout();
            right -= tmpSize.width + this.hgap;
        }

        if (this.west) {
            tmpSize = this.west.preferredSize();
            this.west.set({ x: left, y: top, width: tmpSize.width, height: bottom - top });
            this.west.doLayout();
            left += tmpSize.width + this.hgap;
        }

        if (this.center) {
            this.center.set({ x: left, y: top, width: right - left, height: bottom - top });
            this.center.doLayout();
        }
    },


    /**
     * Returns the size of the element associated to the layout
     */

    size: function() {
        return this.shape.bounds();
    }

});
