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

            var anchorNE = new NorthEastAnchor({ box: this }),
                anchorNW = new NorthWestAnchor({ box: this }),
                anchorSW = new SouthWestAnchor({ box: this }),
                anchorSE = new SouthEastAnchor({ box: this }),
                anchorN = new NorthAnchor({ box: this }),
                anchorS = new SouthAnchor({ box: this }),
                anchorW = new WestAnchor({ box: this }),
                anchorE = new EastAnchor({ box: this });

            var x = bbox.x,
                y = bbox.y,
                width = bbox.width,
                height = bbox.height;

            this.selectionBox = this.paper().rect(x, y, width, height, 0);
            this.selectionBox.attr(this.selectionStyle);
            this.selectionBox.toFront();

            if (this.resizable) {
                anchorNE.render().resizable();
                anchorNW.render().resizable();
                anchorSW.render().resizable();
                anchorSE.render().resizable();
                anchorN.render().resizable();
                anchorS.render().resizable();
                anchorW.render().resizable();
                anchorE.render().resizable();
            }

            this.selectionAnchors.push(anchorNE);
            this.selectionAnchors.push(anchorNW);
            this.selectionAnchors.push(anchorSW);
            this.selectionAnchors.push(anchorSE);
            this.selectionAnchors.push(anchorN);
            this.selectionAnchors.push(anchorS);
            this.selectionAnchors.push(anchorW);
            this.selectionAnchors.push(anchorE);
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

