/**
 * @name LayoutElement
 * @class Represents a DiagramElement with Layouting capabilities. A Layout object
 * must be attached to the element via the layout property.
 *
 * @augments DiagramElement
 *
 */

var LayoutElement = Ds.LayoutElement = Ds.DiagramElement.extend(/** @lends LayoutElement.prototype */ {

    constructor: function(attributes) {
        Ds.DiagramElement.apply(this, [attributes]);

        if (attributes.gridData) this.gridData = attributes.gridData;
        this.initialize(attributes);
    },

    /**
     * Returns the element's position and size as an object with
     * properties x, y, with and height.
     *
     * @example
     *  var element = new DiagramElement(...);
     *  var bounds = element.bounds();
     *  // bounds => { x: 10, y: 10, width: 50, height: 50 }
     *
     * @return {object} bounds
     */

    bounds: function() {
        if (this.figure)
            return this.figure.bounds();
        else return {
            x: this.get('x'),
            y: this.get('y'),
            width: this.get('width'),
            height: this.get('height')
        };
    },

    /**
     * Returns the element's preferred size, as an object
     * with the properties width and height. The preferred size
     * is calculated according to the element's size and the preferred
     * size of it's children.
     *
     * @return {object}
     */

    preferredSize: function() {
        if (this.layout) {
            return this.layout.preferredSize();
        } else {
            return this.figure.preferredSize();
        }
        /*
        var min = this.minimumSize(),
            w = this.get('width'),
            h = this.get('height');

        if (!w) w = this.parent.get('width');
        if (!h) h = this.parent.get('height');

        if (this.children) {
            var ch = _.reduce(this.children, function(m, n) {
                return m + n.preferredSize().height;
            }, 0);
            if (ch > 0 && ch > h) h = ch;
        }

        if (min.width > w) w = min.width;
        if (min.height > h) h = min.height;

        return { width: w, height: h };
        */
    },

    /**
     * Returns the element's minimum size, as an object
     * with the properties width and height. The minimum size
     * is calculated according to the element's size and the minimum
     * size of it's children.
     *
     * @return {object}
     */

    minimumSize: function() {
        if (this.layout)
            return this.layout.minimumSize();
        else
            return this.figure.minimumSize();
    },

    /**
     * Returns the element's maximum size, as an object
     * with the properties width and height. The maximum size
     * is calculated according to the element's size and the maximum
     * size of it's children.
     *
     * @return {object}
     */

    maximumSize: function() {
        if (this.layout)
            return this.layout.maximumSize();
        else
            return this.figure.maximumSize();
    },

    /**
     * Performs the layout of the elemet by calling the layout method of
     * the Layout object associated to the element.
     */

    doLayout: function() {
        if (!this.layout) return;
        //this.set(this.layout.preferredSize());
        this.layout.layout();
    }

});
