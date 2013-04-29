Ds.Selectable = {

    anchors: [
        'NorthAnchor', 'NorthEastAnchor', 'NorthWestAnchor',
        'SouthAnchor', 'SouthEastAnchor', 'SouthWestAnchor',
        'EastAnchor', 'WestAnchor'
    ],

    createAnchor: function(type) {
        return new Ds[type]({ box: this }).render();
    },

    createSelectionBox: function() {
        var bbox = this.figure.bounds();
        var x = bbox.x;
        var y = bbox.y;
        var width = bbox.width;
        var height = bbox.height;

        this.selectionBox = this.renderer().rect(x, y, width, height, 0);
        this.selectionBox.attr(this.selectionStyle);
        this.selectionBox.toFront();
    },

    select: function() {
        if (!this.figure) return;

        this.diagram.setSelection(this);
        this.createSelectionBox();
        this.selectionAnchors =_.map(this.anchors, this.createAnchor, this);
    },

    deselect: function() {
        if (this._tool) {
            this._tool.remove();
        }
        if (this.selectionAnchors) {
            _.each(this.selectionAnchors, function( anchor ) { anchor.remove(); });
        }
        if (this.selectionBox) {
            this.selectionBox.remove();
        }
    }
};

