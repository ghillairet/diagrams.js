
/**
 * @name Element
 * @class Represents the base concept in diagrams.js. Element is
 * abstract and not intended to be instanciated but beings extended via
 * the extend method
 *
 * @example
 *
 * var MyClass = Ds.Element.extend({
 *      constructor: function(attributes) {
 *      }
 * });
 *
 */

var Element = Ds.Element = function (attributes) {
    this.attributes = {};
};

// extend
var extend = function(protoProps, classProps) {
    return inherits(this, protoProps, classProps);
};

var ctor = function() {};
var inherits = function(parent, protoProps, staticProps) {
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
        child = protoProps.constructor;
    } else {
        child = function(){ parent.apply(this, arguments); };
    }

    // Inherit class (static) properties from parent.
    _.extend(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) {
        _.extend(child.prototype, protoProps);
    }

    // Add static properties to the constructor function, if supplied.
    if (staticProps) {
        _.extend(child, staticProps);
    }

    // Correctly set child's `prototype.constructor`.
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed later.
    child.__super__ = parent.prototype;

    return child;
};

Element.extend = extend;

Element.prototype = {

    /**
     * Method called after instanciation of an object
     */

    initialize: function() {},

    /**
     * Returns `true` if the attribute contains a value that is not null
     * or undefined.
     *
     * @return {boolean}
     */

    has: function( attr ) {
        return this.attributes[attr] != null;
    },

    /**
     * Returns the value of an attribute.
     *
     * @param {string}
     * @return {object}
     */

    get: function( attr ) {
        return this.attributes[attr];
    },

    /**
     * Sets the value of an attribute.
     *
     * @param {string} key
     * @param {string} value
     * or
     * @param {object}
     */

    set: function( key, value ) {
        var attrs;

        if (_.isObject(key))
            attrs = key;
        else (attrs = {})[key] = value;

        for (var attr in attrs) {
            this.attributes[attr] = attrs[attr];
        }

        return this;
    },

    /**
     * Return the JSON representation of an Element.
     *
     * @return {object}
     */

    toJSON: function() {
        var attributes = this.attributes,
            clone = _.clone(attributes);

        return this._deepClone(clone);
    },

    /**
     * Clone internal representation of the Element.
     *
     * @param {object} clone
     * @private
     */

    _deepClone: function( clone ) {
        for (var key in clone) {
            var value = clone[key];

            if (_.isArray(value)) {
                var copy = [];
                for (var i = 0; i < value.length; i++) {
                    var v = value[i];
                    if (v.attributes) {
                        copy[i] = v.toJSON();
                    }
                }
                clone[key] = copy;
            } else if (_.isObject(value)) {
                if (value.attributes) {
                    clone[key] = value.toJSON();
                }
            }

        }

        return clone;
    }

};

_.extend(Ds.Element.prototype, Ds.Events);

var raphaelAttributes = Raphael._availableAttrs,
    escapes = ['children', 'figure', 'label', 'compartment'];

// text must be added as an available attribute.
raphaelAttributes.text = '';

