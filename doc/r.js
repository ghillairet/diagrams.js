(function() {

    var paper = Raphael('canvas', 4000, 4000);

    var Line = function(sBox, tBox) {
        this.segments = [];
        this.points = [];
        this.s = s;
        this.t = t;
    };

    Line.prototype.render = function() {
        var w = this.wrapper = paper.path('M100,100L200,200').attr({ 'stroke-width': 2 });
        this.s.toFront();
        this.t.toFront();

        w.dblclick(function(e) {
            console.log('dblclick',e);
            var a = paper.rect(e.clientX, e.clientY, 6, 6);
            a.attr({ fill: 'blue', stroke: 'none' });
        });

        w.mousedown(function() {
            console.log('down');
            w.drag(move, start, end);
        });
    };

    function start() {
        console.log('end');
    }

    function end() {
        console.log('end');
    }

    function move() {
        console.log('move',arguments, this);
    }

    var FlexPoint = function() {

    };

    var Segment = function(source, target) {

    };

    var c1 = paper.circle(100, 100, 20).attr({ fill: 'white' });
    var c2 = paper.circle(200, 200, 20).attr({ fill: 'white' });

    var l = new Line(c1, c2);
    l.render();

})();
