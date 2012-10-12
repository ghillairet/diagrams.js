describe('Diagram', function() {

    var D = Diagram;

    var diagram = new D.Diagram('canvas', 800, 600);

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

    it('must be available', function() {
        assert.ok(D);
    });

    beforeEach(function() {

    });

    afterEach(function() {
        diagram.remove();
    });

    describe('#Diagram, create new Diagram', function() {

        it('should create an instance of Diagram', function() {
            assert.ok(diagram);
            assert.ok(diagram.paper());
        });

        var shape = diagram.createShape(SomeShape, {x: 0, y: 0});

        describe('#createShape', function() {

            it('should create the shape', function() {
               assert.ok(shape);
               assert.equal(null, shape.wrapper);
               assert.strictEqual(shape.diagram, diagram);
            });

            it('should add it to its children', function() {
                var found = _.find(diagram.get('children'), function(child) {
                    return child === shape;
                });
                assert.strictEqual(shape, found);
            });

        });

        describe('#removeShape', function() {

           it('should remove the shape from the canvas and from its children', function() {
                diagram.removeShape(shape);

                var found = _.find(diagram.get('children'), function(child) {
                    return child === shape;
                });
                assert.notEqual(found, shape);
           });

        });

        describe('#getShape', function() {

            var shape = diagram.createShape(SomeShape, {x: 0, y: 0});

            it('should return a child shape by its id', function() {
                var s = diagram.getShape(shape.get('id'));
                assert.strictEqual(s, shape);
            });

            it('should return null if wrong id', function() {
                var s = diagram.getShape(-1);
                assert.equal(s, null);

                diagram.removeShape(shape);
            });

        });

        var c = diagram.createConnection(BasicConnection);

        describe('#createConnection', function() {

            it('should create the connection', function() {
                assert.ok(c);
                assert.equal(null, c.wrapper);
                assert.strictEqual(c.diagram, diagram);
                assert.ok(_.isNumber(c.get('id')));
                assert.equal(null, c.get('source'));
                assert.equal(null, c.get('target'));
            });

            it('should add it to its edges', function() {
                var found = _.find(diagram.get('edges'), function(child) {
                    return child === c;
                });
                assert.strictEqual(c, found);
            });

        });

        describe('#removeConnection', function() {
            it('should remove the connection from the canvas and from its edges', function() {
                diagram.removeConnection(c);

                var found = _.find(diagram.get('edges'), function(child) {
                    return child === c;
                });

                assert.notEqual(found, c);
            });

        });

        describe('#getConnection', function() {
            var c = diagram.createConnection(BasicConnection);

            it('should return a connection by its id', function() {
                var s = diagram.getConnection(c.get('id'));
                assert.strictEqual(s, c);
            });

            it('should return null if wrong id', function() {
                var s = diagram.getConnection(-1);
                assert.equal(s, null);

                diagram.removeConnection(c);
            });
        });

    });

    describe('#Shape', function() {

        var s = new SomeShape({diagram: diagram, x: 0, y: 0});

        it('should exist, have an ID and be a child of diagram', function() {
           assert.ok(s);
           assert.equal(null, s.wrapper);
           assert.ok(_.isNumber(s.get('id')));
           assert.equal(s.diagram, diagram);

           var found = _.find(diagram.get('children'), function(child) { return child === s });
           assert.strictEqual(s, found);
        });

        it('should have correct coordinates', function() {
            assert.equal(s.getX(), 0);
            assert.equal(s.getY(), 0);
        });

        it('should have same paper has diagram when rendered', function() {
            s.render();
            var paper = s.paper();
            assert.ok(paper);
            assert.strictEqual(paper, diagram.paper());
        });

        it('should have correct coordinates after moving', function() {
            s.render();
            s.move(10, 10);
            assert.equal(s.getX(), 10);
            assert.equal(s.getY(), 10);
            assert.equal(s.attr('x'), 10);
            assert.equal(s.attr('y'), 10);
        });

        it('should be removable from diagram', function() {
            diagram.removeShape(s);
        });

    });

    describe('#Connection', function() {

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
                   return edge === c;
                });
                assert.equal(found, null);
//                assert.equal(c.get('source'), null);
//                assert.equal(c.get('target'), null);
           });
        });
    });

});