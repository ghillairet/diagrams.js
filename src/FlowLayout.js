/**
 * @name FlowLayout
 */
var FlowLayout = DG.FlowLayout = function(shape, data) {
    if (!shape) throw Error('Shape is not defined');
    data = data || {};

    this._shape = shape;
    this._vertical = data.vertical || false;
};

FlowLayout.prototype.size = function() {

};

FlowLayout.prototype.layout = function() {

};

