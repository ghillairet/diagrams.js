// SVGElement
//
/**
 * SVGElement
 *
 * @class SVGElement
 * @constructor
 *
**/

Diagram.SVGElement = function() {};

_.extend(
    Diagram.SVGElement.prototype,
    Diagram.Element.prototype, {

    /**
     * Return the current Raphael Paper.
     *
     * @method paper
     * @return {Object}
     * @api public
    **/

    paper: function() {
        if (!this.diagram) {
            throw new Error('SVGElement must be associated to a diagram');
        }
        return this.diagram.paper();
    },

    /**
     * Return the current X coordinate.
     *
     * @method getX
     * @return {Number}
     * @api public
    **/

    getX: function() {
        if (this.wrapper) {
            return this.wrapper.attr('x');
        } else {
           return this.get('attr').x;
        }
    },

    /**
     * Return the current Y coordinate.
     *
     * @method getY
     * @return {Number}
     * @api public
    **/

    getY: function() {
        if (this.wrapper) {
            return this.wrapper.attr('y');
        } else {
           return this.get('attr').y;
        }
    },

    /**
     * Shows the SVGElement if previously hidden.
     *
     * @method show
     * @return {Object}
     * @api public
    **/

    show: function() {
        return this.wrapper.show();
    },

    /**
     * Hides the SVGElement.
     *
     * @method hide
     * @return {Object}
     * @api public
    **/

    hide: function() {
        return this.wrapper.hide();
    },

    /**
     * Moves the SVGElement to front.
     *
     * @method toFront
     * @return {Object}
     * @api public
    **/

    toFront: function() {
        return this.wrapper.toFront();
    },

    /**
     * Wrapper for Raphael attr method.
     *
     * @method attr
     * @return {Object}
     * @api public
    **/

    attr: function() {
        return Raphael.el.attr.apply(this.wrapper, arguments);
    },

    /**
     * @method
     * @private
    **/

    _get: function ( key ) {
        var value;
        if (this.attributes.attr) {
            value = this.attributes.attr[key] ? this.attributes.attr[key] : this.figure[key];
        } else {
            value = this.figure[key];
        }

        return isNaN(value) ? 0 : value;
    },

    /**
     * @method
     * @private
    **/

    _attr: function( attributes ) {
        var attrs = Raphael._availableAttrs;
        var attr = attributes.attr || {};

        for (var k in attributes) {
            if (_.has(attrs, k))  {
                attr[k] = attributes[k];
            }
        }
        return attr;
    },

    /**
     * @method
     * @private
    **/

    _rect: function() {
        var x = this._get('x'),
            y = this._get('y'),
            width = this._get('width'),
            height = this._get('height'),
            r = this._get('r'),
            attr = this.get('attr');

        return this.paper().rect(x, y, width, height, r).attr(attr);
    },

    /**
     * @method
     * @private
    **/

    _circle: function() {
        var x = this._get('x'),
            y = this._get('y'),
            r = this._get('r'),
            attr = this.get('attr');

        if (x === 0) {
            x = this._get('cx');
        }

        if (y === 0) {
            y = this._get('cy');
        }

        // delete x, y to use cx, cy instead.
        delete attr.x;
        delete attr.y;

        return this.paper().circle(x, y, r).attr(attr);
    },

    /**
     * @method
     * @private
    **/

    _ellipse: function() {
        var x = this._get('x'),
            y = this._get('y'),
            rx = this._get('rx'),
            ry = this._get('ry'),
            attr = this.get('attr');

        return this.paper().ellipse(x, y, rx, ry).attr(attr);
    },

    //
    // @method
    // @private
    //

    _path: function() {
        var path = this._get('path'),
            attr = this.get('attr');

        return this.paper().path(path).attr(attr);
    },

    draw: function(figure, parent) {
        if (!figure || !figure.type) return;

        var type = figure.type,
            x = this._get('x'),
            y = this._get('y'),
            wrapper;

        switch(type) {
            case 'rect':
                wrapper = this.paper().rect(x, y);
                break;
            case 'circle':
                wrapper = this.paper().circle(x, y);
                break;
            case 'ellipse':
                wrapper = this.paper().ellipse(x, y);
                break;
            case 'path':
                wrapper = this.paper().path(figure.path);
                break;
            default:
                wrapper = null;
        }

        if (wrapper) {
            wrapper.attr(figure);

            if (parent) {
                var box = parent.getABox();
                wrapper.translate(box.topLeft.x,  box.topLeft.y);
            }
            if (figure.figure) {
                wrapper._child = this.draw(figure.figure, wrapper);
                wrapper._child._parent = wrapper;
            }
        }

        return wrapper;
    },

    drawContent: function() {
        var figure = this.figure;
        if (this.wrapper) {
            if (figure.figure) {
               this.wrapper._child = this.draw(figure.figure, this.wrapper);
            }
        }
    },

    _remove: function() {
        var doRemove = function(wrapper) {
            if (wrapper) {
                if (wrapper._child) {
                    doRemove(wrapper._child);
                }
                wrapper.remove();
            }
        };

        if (this.wrapper) {
            doRemove(this.wrapper);
        }
    },

    //
    // @method _createFigure
    // @private
    //

    _createFigure: function() {
        var wrapper,
            figure = this.figure;

        // Creates the Raphael Element according to the type of figure.
        // The Element is attach to the FigureShape via the property wrapper.

        wrapper = this.draw(figure);
        if (!wrapper) {
            throw new Error('Cannot create figure for ' + this);
        }

        return wrapper;
    }

});
