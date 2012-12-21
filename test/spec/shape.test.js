describe('Shape', function() {
    var D = Diagram;

    var diagram = new D.Diagram();
    diagram.setElement('canvas');

    var SomeShape = D.Shape.extend({
        figure: {
            type: 'circle',
            r: 30,
            fill: 'red',
            stroke: 'rgb(120, 120, 200)',
            'stroke-width': 2
        }
    });

    it('should exist, have an ID and be a child of diagram', function() {
        var s = new SomeShape({ diagram: diagram, x: 0, y: 0 });
        assert.ok(s);
        assert.equal(null, s.wrapper);
        assert.ok(_.isNumber(s.get('id')));
        assert.equal(s.diagram, diagram);

        var found = _.find(diagram.get('children'), function(child) { return child === s; });
        assert.strictEqual(s, found);
        s.remove();
        // make sure it is removed
        found = _.find(diagram.get('children'), function(child) { return child === s; });
        assert.equal(found, null);
    });

    it('should have correct coordinates', function() {
        var s = new SomeShape({ diagram: diagram, x: 0, y: 0 });
        assert.equal(s.getX(), 0);
        assert.equal(s.getY(), 0);
        s.remove();
    });

    it('should have same paper has diagram when rendered', function() {
        var s = new SomeShape({ diagram: diagram, x: 0, y: 0 });
        s.render();
        var paper = s.paper();
        assert.ok(paper);
        assert.strictEqual(paper, diagram.paper());
        s.remove();
    });

    it('should have correct coordinates after moving', function() {
        var s = new SomeShape({ diagram: diagram, x: 0, y: 0 });
        s.render();
        s.move(10, 10);
        assert.equal(s.getX(), 10);
        assert.equal(s.getY(), 10);
        assert.equal(s.attr('x'), 10);
        assert.equal(s.attr('y'), 10);
        s.remove();
    });

    it('should be removable from diagram', function() {
        var s = new SomeShape({ diagram: diagram, x: 0, y: 0 });
        diagram.removeShape(s);
    });

    describe('#remove', function() {

        it('should remove the shape from paper && diagram', function() {
            var s = new SomeShape({ diagram: diagram, x: 0, y: 0 });
            s.render();

            assert.ok(_.find(diagram.get('children'), function(c) { return c === s; }));
            s.remove();
            assert.equal(s.wrapper, null);
            assert.equal(_.find(diagram.get('children'), function(c) { return c === s; }), null);
        });

    });

});
