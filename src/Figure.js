/**
 * @name Figure
 */
var Figure = DG.Figure = {};

Figure.create = function(shape, data) {
    if (!shape) throw new Exception('Shape is missing');

    return shape.diagram().doc.figure(shape, data);
};

var createFigure = function(container, data) {
    var figure, type = data.type;
    if (type && typeof container[type] === 'function') {
        switch(type) {
            case 'rect':
                figure = container.rect(data.width, data.height);
                break;
            case 'circle':
                figure = container.circle(data.r);
                break;
            case 'ellipse':
                figure = container.ellipse(data.rx, data.ry);
                break;
            case 'polygon':
                figure = container.polygon(data.coordinates);
                break;
            case 'text':
                figure = container.text(data.text);
                break;
            case 'image':
                figure = container.image(data.path, data.width, data.height);
                break;
            default:
                figure = null;
        }
    }

    if (figure) figure.attr(data);

    return figure;
};

SVG.extend(SVG.Container, {
    figure: function(shape, attributes) {
        var attrs       = attributes || {};
        var shape_attrs = shape.attributes || {};
        var figure      = createFigure(this, attrs);

        figure.attributes       = _.clone(attrs);
        figure.shape            = shape;
        figure.connectAnchors   = [];

        // copy shape attributes
        if (shape_attrs.width)  figure.attributes.width  = shape_attrs.width;
        if (shape_attrs.height) figure.attributes.height = shape_attrs.height;
        if (shape_attrs.text)   figure.attributes.text   = shape_attrs.text;

        figure.attr(figure.attributes);

        // move to desired location
        if (shape_attrs.x && shape_attrs.y) figure.move(shape_attrs.x, shape_attrs.y);

        // store original sizes as minimuns
        var box = figure.bbox();
        figure.attributes.min = {};
        figure.attributes.min.width  = box.width;
        figure.attributes.min.height = box.height;

        return figure;
    }
});

SVG.extend(SVG.Shape, {

    remove: function() {
        this.hideDeleteAction();
        this.deselect();

        return SVG.Element.prototype.remove.apply(this, arguments);
    },

    minimumSize: function() {
        return this.attributes.min;
    },

    showConnectAnchors: function() {
        var shape = this.shape;
        if (this.hasConnectAnchors) return this;
        if (!this.connectAnchors.length) {
            this.connectAnchors = _.map(shape.anchors, ConnectionAnchor.create(shape), this);
        } else {
            _.each(this.connectAnchors, function(a) { a.render(); });
        }
        this.hasConnectAnchors = true;
        return this;
    },

    hideConnectAnchors: function() {
        if (!this.hasConnectAnchors) return this;
        _.each(this.connectAnchors, function(a) { a.remove(); });
        this.connectAnchors.length = 0;
        this.hasConnectAnchors = false;
        return this;
    },

    select: function() {
        if (this.isSelected) return this;
        var shape = this.shape;
        this.previous = {};
        this.previous.stroke = this.attr('stroke');
        this.previous['stroke-width'] = this.attr('stroke-width');
        this.attr({
            stroke: '#6599FF',
            'stroke-width': 2
        });
        this.selectAnchors = _.map(Anchor.positions, Anchor.create(shape), this);
        this.showDeleteAction(this.shape);
        this.isSelected = true;
        return this;
    },

    deselect: function() {
        if (!this.isSelected) return this;
        this.attr({
            stroke: this.previous.stroke,
            'stroke-width': this.previous['stroke-width']
        });
        _.each(this.selectAnchors, function(a) { a.remove(); });
        this.hideConnectAnchors();
        this.hideDeleteAction();
        this.isSelected = false;
        return this;
    },

    showDeleteAction: function() {
        var bbox = this.bbox();
        var shape = this.shape;
        var doc  = shape.diagram().doc;
        this.deleteAnchor = doc.circle(12).attr({
            fill: 'red',
            stroke: '#6599FF'
        });
        this.deleteAnchor.move(bbox.x + bbox.width - 22, bbox.y - 6);
        this.deleteAnchor.click(function() {
            shape.remove();
        });
        return this;
    },

    hideDeleteAction: function() {
        if (this.deleteAnchor) {
            this.deleteAnchor.remove();
            delete this.deleteAnchor;
        }
        return this;
    }

});

