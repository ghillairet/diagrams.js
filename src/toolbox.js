var ToolBox = Diagram.ToolBox = function( attributes ) {
     this.element = attributes.element;
     this.diagram = this.element.diagram;
     this.width = 40;
     this.height = 20;
     this.children = [];
     return this;
};

_.extend(ToolBox.prototype, Diagram.SVGElement.prototype);

ToolBox.prototype.render = function() {
    if (!this.element && !this.element.wrapper) {
        return;
    }

    if (this.wrapper) {
        this.wrapper.remove();
    }

    var paper = this.paper(),
        box = this.element.wrapper.getABox(),
        x = box.xRight - this.width + 8,
        y = box.y - this.height - 8;

    this.wrapper = paper.rect(x, y, this.width, this.height, 4).attr({
        fill: 'whitesmoke',
        stroke: 'whitesmoke',
        'stroke-width': 1
    });

    this.wrapper.controller = this;

    this.wrapper.mouseover(this.handleMouseOver);
    this.wrapper.mouseout(this.handleMouseOut);

    box = this.wrapper.getABox();

    var control = this;
    this.addItem(box.x + 12, box.yMiddle, 'X', function(evt) {
        control.element.remove();
    });

    var propertyBox = this.propertyBox = new ToolBox.propertyBox({ diagram: control.diagram });
    if (ToolBox.propertyBox) {
        this.addItem(box.xRight - 12, box.yMiddle, 'P', function(evt) {
            var elBox = control.element.wrapper.getABox();
            propertyBox.x = elBox.xRight + 20;
            propertyBox.y = elBox.y;
            propertyBox.render();
        });
    }

    return this;
};

ToolBox.prototype.addItem = function(x, y, text, action) {
    var control = this;
    var paper = this.paper();

    var wrapper = paper.text(x, y, text);
    this.children.push(wrapper);

    wrapper.mouseover(function(evt) {
        control.isOverChild = true;
    });

    wrapper.mouseout(function(evt) {
        control.isOverChild = false;
    });

    wrapper.click(action);

    return this;
};

ToolBox.prototype.remove = function() {
    if (this.wrapper) {
        this.wrapper.remove();
        _.each(this.children, function(child) { child.remove() });
        this.children.length = 0;
    };
};

ToolBox.prototype.handleMouseOver = function() {
    this.controller.isOver = true;
    this.controller.isOverChild = false;
};

ToolBox.prototype.handleMouseOut = function() {
    var control = this.controller;
    window.setTimeout(function() {
        if (control && !control.isOverChild) {
            control.isOver = false;
            control.remove();
        }
    }, 200);
};