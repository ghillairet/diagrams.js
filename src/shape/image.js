// LabelImage
//
//
var LabelImage = Diagram.Image = function( attributes ) {
    this.parent = attributes.parent;
    this.diagram = this.parent.diagram;

    this.attributes = {};
    this.set('type', 'Diagram.Image');
    this.set('width', attributes.width);
    this.set('height', attributes.height);
    this.set('src', attributes.src);
    return this;
};

_.extend(LabelImage.prototype, Diagram.SVGElement.prototype);

LabelImage.prototype.render = function() {
    var paper = this.paper();

    var bBox = this.parent.wrapper.getBBox(),
        src = this.get('src'),
        width = this.get('width'),
        height = this.get('height');

    this.wrapper = paper.image(src, bBox.x, bBox.y, width, height);
    this.wrapper.toFront();
    this.wrapper.controller = this;

    return this;
};

LabelImage.prototype.center = function() {
    var ntbb = this.parent.wrapper.getABox();
    this.wrapper.attr({ x: ntbb.x - this.get('width') });
    this.wrapper.attr({ y: ntbb.yMiddle - (this.get('height') / 2) });
};