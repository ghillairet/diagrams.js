
// ToolBox

var ToolBox = Ds.ToolBox = Ds.DiagramElement.extend({

    constructor: function(attributes) {
        Ds.DiagramElement.apply(this, [attributes]);

        this.element = attributes.element;
        this.diagram = this.element.diagram;
        this.width = 70;
        this.height = 60;
    },

    render: function() {
        if (!this.element && !this.element.wrapper) {
            return;
        }

        if (this.wrapper) {
            this.wrapper.remove();
        }

        var paper = this.paper(),
            box = this.element.wrapper.getABox(),
            x = box.xRight - 40,
            y = box.y - 30;

        this.wrapper = paper.rect(x, y, this.width, this.height, 6).attr({
            fill: 'orange',
            'fill-opacity': 0,
            stroke: 'black',
            'stroke-opacity': 0,
            'stroke-width': 2
        }).toBack();

        this.wrapper.controller = this;

        this.wrapper.mouseover(this.handleMouseOver);
        this.wrapper.mouseout(this.handleMouseOut);

        box = this.wrapper.getABox();

        var control = this;
        this.addItem(box.xLeft + 20, box.y, Trash, function(evt) {
            control.element.remove(true);
        });

        var propertyBox = this.propertyBox = new ToolBox.propertyBox({ diagram: control.diagram });
        if (ToolBox.propertyBox) {
            this.addItem(box.xLeft + 40, box.y + 20, Gear, function(evt) {
                var elBox = control.element.wrapper.getABox();
                propertyBox.x = elBox.xRight + 20;
                propertyBox.y = elBox.y;
                propertyBox.render();
            });
        }

        return this;
    },

    addItem: function(x, y, text, action) {
        var control = this;
        var paper = this.paper();
        var wrapper = paper.path(text);

        wrapper.attr({fill: "#000", stroke: "none"});
        wrapper.attr({cursor: 'pointer'});
        wrapper.translate(x, y);
        wrapper.scale(0.8, 0.8);

        this.get('children').push(wrapper);
        wrapper.mouseover(function(e) {
            control.isOverChild = true;
        });

        wrapper.mouseout(function(e) {
            e.stopPropagation();
            control.isOverChild = false;
        });

        wrapper.click(action);

        return this;
    },

    remove: function() {
        if (this.wrapper) {
            this.wrapper.remove();
            _.each(this.get('children'), function(child) { child.remove(); });
            this.get('children').length = 0;
        }
    },

    handleMouseOver: function() {
        this.controller.isOver = true;
    },

    handleMouseOut: function(e) {
        e.stopPropagation();
    }

});


var Trash = 'M20.826,5.75l0.396,1.188c1.54,0.575,2.589,1.44,2.589,2.626c0,2.405-4.308,3.498-8.312,3.498c-4.003,0-8.311-1.093-8.311-3.498c0-1.272,1.21-2.174,2.938-2.746l0.388-1.165c-2.443,0.648-4.327,1.876-4.327,3.91v2.264c0,1.224,0.685,2.155,1.759,2.845l0.396,9.265c0,1.381,3.274,2.5,7.312,2.5c4.038,0,7.313-1.119,7.313-2.5l0.405-9.493c0.885-0.664,1.438-1.521,1.438-2.617V9.562C24.812,7.625,23.101,6.42,20.826,5.75zM11.093,24.127c-0.476-0.286-1.022-0.846-1.166-1.237c-1.007-2.76-0.73-4.921-0.529-7.509c0.747,0.28,1.58,0.491,2.45,0.642c-0.216,2.658-0.43,4.923,0.003,7.828C11.916,24.278,11.567,24.411,11.093,24.127zM17.219,24.329c-0.019,0.445-0.691,0.856-1.517,0.856c-0.828,0-1.498-0.413-1.517-0.858c-0.126-2.996-0.032-5.322,0.068-8.039c0.418,0.022,0.835,0.037,1.246,0.037c0.543,0,1.097-0.02,1.651-0.059C17.251,18.994,17.346,21.325,17.219,24.329zM21.476,22.892c-0.143,0.392-0.69,0.95-1.165,1.235c-0.474,0.284-0.817,0.151-0.754-0.276c0.437-2.93,0.214-5.209-0.005-7.897c0.881-0.174,1.708-0.417,2.44-0.731C22.194,17.883,22.503,20.076,21.476,22.892zM11.338,9.512c0.525,0.173,1.092-0.109,1.268-0.633h-0.002l0.771-2.316h4.56l0.771,2.316c0.14,0.419,0.53,0.685,0.949,0.685c0.104,0,0.211-0.017,0.316-0.052c0.524-0.175,0.808-0.742,0.633-1.265l-1.002-3.001c-0.136-0.407-0.518-0.683-0.945-0.683h-6.002c-0.428,0-0.812,0.275-0.948,0.683l-1,2.999C10.532,8.77,10.815,9.337,11.338,9.512z';

var Gear = 'M26.834,14.693c1.816-2.088,2.181-4.938,1.193-7.334l-3.646,4.252l-3.594-0.699L19.596,7.45l3.637-4.242c-2.502-0.63-5.258,0.13-7.066,2.21c-1.907,2.193-2.219,5.229-1.039,7.693L5.624,24.04c-1.011,1.162-0.888,2.924,0.274,3.935c1.162,1.01,2.924,0.888,3.935-0.274l9.493-10.918C21.939,17.625,24.918,16.896,26.834,14.693z';


