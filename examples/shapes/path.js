(function() {

    var TrianglePath = Ds.Shape.extend({
        figure: {
            type: 'path',
            path: 'M0,0L-10,20L10,20Z'
        }
    });

    var diagram = new Ds.Diagram({ el: 'diagram' });
    diagram.add(new TrianglePath({ x: 100, y: 100 }));
    diagram.render();

})();
