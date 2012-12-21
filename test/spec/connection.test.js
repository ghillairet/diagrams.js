describe('Connection', function() {

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

    var BasicConnection = D.Connection.extend({
        stroke: 'red',
        'stroke-width': 2,
        label: [
            { position: 'end', text: 'label' }
        ],
        end: { type: "none" },
        start: { type: "none" }
    });

    var c = new BasicConnection({ diagram: diagram });
    var sourceShape = diagram.createShape(SomeShape, {x: 0, y: 0});
    var targetShape = diagram.createShape(SomeShape, {x: 0, y: 0});

    it('should be created correctly', function() {
        assert.ok(c);
        assert.ok(_.isNumber(c.get('id')));
        assert.equal(null, c.get('source'));
        assert.equal(null, c.get('target'));
    });

    it('should be added to diagram edges', function() {
        var found = _.find(diagram.get('edges'), function(edge) {
            return edge === c;
        });

        assert.ok(found);
    });

    describe('#connect', function() {

        it('should connect two shapes', function() {
            c.connect(sourceShape, targetShape);

            assert.strictEqual(c.get('source'), sourceShape);
            assert.strictEqual(c.get('target'), targetShape);
            assert.equal(sourceShape.outEdges.length, 1);
            assert.equal(targetShape.inEdges.length, 1);
            assert.strictEqual(sourceShape.outEdges[0], c);
            assert.strictEqual(targetShape.inEdges[0], c);
        });

    });

    describe('#disconnect', function() {

        it('should disconnect the shapes', function() {
            c.disconnect();

            assert.equal(sourceShape.outEdges.length, 0);
            assert.equal(targetShape.inEdges.length, 0);
            assert.equal(c.get('source'), null);
            assert.equal(c.get('target'), null);
        });

    });

    describe('#remove', function() {
        it('should remove from canvas, from diagram and disconnect', function() {
            c.connect(sourceShape, targetShape); // reconnect to test disconnection.
            c.remove();

            assert.equal(c.wrapper, null);
            var found = _.find(diagram.get('edges'), function(edge) {
                console.log(edge, c);
                return edge === c;
            });
            assert.equal(found, null);
            assert.equal(c.get('source'), null);
            assert.equal(c.get('target'), null);
        });
    });
});

