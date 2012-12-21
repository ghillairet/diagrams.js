Ds.Selectable = {

    select: function() {
        var current = this.diagram.getSelection();
        if (current) {
            current.deselect();
        }

        this.diagram.setSelection(this);

        if (this.wrapper) {
            var bbox = this.wrapper.getABox();

            this.selectionAnchors = [];

            var anchorRT = new NorthEastAnchor({ box: this }),
                anchorLT = new NorthWestAnchor({ box: this }),
                anchorLB = new SouthWestAnchor({ box: this }),
                anchorRB = new SouthEastAnchor({ box: this });

            var x = anchorLT.get('x') + 3,
                y = anchorLT.get('y') + 3,
                width = anchorRT.get('x') + 3 - x,
                height = anchorLB.get('y') + 3 - y;

            this.selectionBox = this.paper().rect(x, y, width, height, 0);
            this.selectionBox.attr({ stroke: 'orange', 'stroke-width': 1, 'stroke-dasharray': '--'});
            this.selectionBox.toFront();

            if (this.resizable) {
                anchorRT.render().resizable();
                anchorLT.render().resizable();
                anchorRB.render().resizable();
                anchorLB.render().resizable();
            }

            this.selectionAnchors.push(anchorLT);
            this.selectionAnchors.push(anchorRT);
            this.selectionAnchors.push(anchorLB);
            this.selectionAnchors.push(anchorRB);
        }
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

