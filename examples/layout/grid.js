(function(Ds) {

    function move(array, from, to) {
        array.splice(to, 0, array.splice(from, 1)[0]);
    }

    var Rectangle = Ds.Shape.extend({
        draggable: false,
        resizable: false,

        figure: {
            type: 'rect'
        },

        initialize: function() {
            var fill;

/*            this.on('click', function() {
                var list = this.parent.children;
                var from = _.indexOf(list, this);
                var to = from === 0 ? list.length : from -1;
                move(list, from, to);
                this.parent.render();
            }, this);
            */

        }
    });

    var Container = Ds.Shape.extend({
        figure: {
            type: 'rect',
            width: 100,
            height: 100,
            r: 1,
            fill: 'white',
            stroke: 'black',
            'stroke-width': 2
        },

        layout: {
            type: 'grid',
            columns: 2,
            rows: 0,
            hgap: 0,
            vgap: 0,
            marginWidth: 5,
            marginHeight: 5,
            columnsEqualWidth: false
        }
    });

    dia = new Ds.Diagram({ el: 'diagram' });
    var cont = new Container({ x: 10, y: 10 });
    var r1 = new Rectangle({ width: 50, height: 30, fill: 'red' });
//    cont.add(r1);

    dia.add(cont);
    dia.render();

    cont.on('add:children', cont.render);

    document.getElementById('add-shape').addEventListener('click', function(e) {
        var r = new Rectangle({ width: 50, height: 30, fill: 'blue' });
        r.gridData = {
            horizontalAlignment: 'fill',
            grabExcessHorizontalSpace: true,
            grabExcessVerticalSpace: false
        };
        cont.add(r);
    });

    document.getElementById('clear').addEventListener('click', function(e) {
        cont.children.length = 0;
        cont.render();
    });

    document.getElementById('submit').addEventListener('click', function() {
        var columns = document.getElementById('columnsInput').value || 1;
        var columnsEqualWidth = document.getElementById('columnsEqualWidthInput').checked;
        var select = document.getElementById('marginHeightSelect');
        var marginHeight = select.options[select.selectedIndex].value;
        select = document.getElementById('marginWidthSelect');
        var marginWidth = select.options[select.selectedIndex].value;
        select = document.getElementById('hgapSelect');
        var hgap = select.options[select.selectedIndex].value;
        select = document.getElementById('vgapSelect');
        var vgap = select.options[select.selectedIndex].value;

        cont.layout.columns = Number(columns);
        cont.layout.columnsEqualWidthInput = Boolean(columnsEqualWidth);
        cont.layout.marginHeight = Number(marginHeight);
        cont.layout.marginWidth = Number(marginWidth);
        cont.layout.vgap = Number(vgap);
        cont.layout.hgap = Number(hgap);
        cont.render();
    });

})(window.Ds);
