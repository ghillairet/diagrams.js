// Element
//

/**
 * Element
 *
 * @class Element
 * @constructor
 *
**/

var Element = Diagram.Element = function ( properties ) {
    this.initialize.apply(this, arguments);
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

/**
 * To be extended by subclasses.
 *
 * @method initialize
 *
**/

Element.prototype.initialize = function( properties ) {};

/**
 * Determine if the Element has the given property.
 *
 * @method has
 * @return {Boolean}
 * @api public
**/

Element.prototype.has = function( attr ) {
    return this.attributes[attr] != null;
};

/**
 * Getter method for Element attributes.
 *
 * @method get
 * @param {String} attr - attribute name
 * @return {Object}
 * @api public
**/

Element.prototype.get = function( attr ) {
    return this.attributes[attr];
};

/**
 * Setter method for Element attributes.
 *
 * @method set
 * @param {String} attr - attribute name
 * @param {String} val - attribute value
 * @api public
**/

Element.prototype.set = function( attr, val ) {
    this.attributes[attr] = val;
};

/**
 * Return JSON representation of the Element.
 *
 * @method toJSON
 * @return {Object}
 * @api public
**/

Element.prototype.toJSON = function() {
    var attributes = this.attributes;
    var clone = _.clone(attributes);

    return this._deepClone(clone);
};

/**
 * Clone internal representation of the Element.
 *
 * @method _deepClone
 * @private
 * @param {Object} clone
 * @api private
**/

Element.prototype._deepClone = function( clone ) {
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
};

Element.extend = extend;
