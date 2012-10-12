Diagram.Selectable = {

    /**
     * select
     */
     select: function() {
        if (this.diagram.selected) {
            this.diagram.selected.deselect();
        }

        this.diagram.selected = this;

        if (this.wrapper) {
            bbox = this.wrapper.getABox();
            this.selectionAnchors = [];

            var anchorRT = new NorthEastAnchor({ box: this }).render();
            var anchorLT = new NorthWestAnchor({ box: this }).render();
            var anchorLB = new SouthWestAnchor({ box: this }).render();
            var anchorRB = new SouthEastAnchor({ box: this }).render();

            if (this.resizable) {
                anchorRT.resizable();
                anchorLT.resizable();
                anchorRB.resizable();
                anchorLB.resizable();
            }

            this.selectionAnchors.push(anchorLT);
            this.selectionAnchors.push(anchorRT);
            this.selectionAnchors.push(anchorLB);
            this.selectionAnchors.push(anchorRB);
        }
     },

     /**
      * deselect
      */
      deselect: function() {
        if (this.selectionAnchors) {
            _.each(this.selectionAnchors, function( anchor ) { anchor.remove(); });
        }
      }
};