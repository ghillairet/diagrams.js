// PropertyBox
//

var PropertyBox = Diagram.PropertyBox = function( attributes ) {
    attributes || (attributes = {});
    this.diagram = attributes.diagram;
    this.x = attributes.x;
    this.y = attributes.y;
    this.width = attributes.width ? attributes.width : 340;
    this.height = attributes.height ? attributes.height : 200;

    return this;
};

PropertyBox.prototype.render = function() {
    if (this.root) {
        return this;
    }

    this.root = document.createElement('div');
    this.root.setAttribute('class', 'property-box');
    this.header = document.createElement('div');
    this.header.setAttribute('class', 'property-box-header');
    this.body = document.createElement('div');
    this.body.setAttribute('class', 'property-box-body');

    this.root.appendChild( this.header );
    this.root.appendChild( this.body );

    // add exit button
    var exitButton = document.createElement('a');

    exitButton.setAttribute('style', 'position: relative; font-size: 12px; color: black;');
    exitButton.style.left = (this.width - 16) + 'px';
    exitButton.style.cursor = 'default';
    exitButton.innerHTML = 'X';
    this.header.appendChild( exitButton );

    var propertyBox = this;
    exitButton.addEventListener('click', function(evt) {
        propertyBox.remove();
    });

    if (typeof PropertyBox.bodyTemplate === 'function') {
        this.body.innerHTML = PropertyBox.bodyTemplate();
    }

    this.root.style.left = this.x + 'px';
    this.root.style.top = this.y + 'px';

    this.diagram.el().appendChild(this.root);

    this.asDraggable();

    return this;
};

PropertyBox.prototype.asDraggable = function() {
    if (this.root) {
        this.header.style.cursor = 'move';

        var box = this;
        box._moving = false;

        this.header.addEventListener('mousedown', function(evt) {
            box._moving = true;
            box.offsetX = evt.pageX - box.x;
            box.offsetY = evt.pageY - box.y;
        });

        this.diagram.el().addEventListener('mouseup', function(evt) {
            box._moving = false;
        });

        this.diagram.el().addEventListener('mousemove', function(evt) {
            if (box._moving) {
                box.x = evt.pageX - box.offsetX;
                box.y = evt.pageY - box.offsetY;
                box.root.style.left = box.x + 'px';
                box.root.style.top = box.y + 'px';
            }
        });
    }
};

PropertyBox.prototype.remove = function() {
    if (this.root) {
        this.diagram.el().removeChild(this.root);
        this.root = null;
    }
};

Diagram.ToolBox.propertyBox = PropertyBox;

