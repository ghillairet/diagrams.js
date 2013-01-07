describe('Diagram', function() {

    it('must be available', function() {
        assert.ok(Ds);
    });

    var diagram = new Ds.Diagram();
    diagram.setElement('canvas');

    var SomeShape = Ds.Shape.extend({
        figure: {
            type: 'circle',
            r: 30,
            fill: 'red',
            stroke: 'rgb(120, 120, 200)',
            'stroke-width': 2
        }
    });

    var BasicConnection = Ds.Connection.extend({
        stroke: 'red',
        'stroke-width': 2,
        label: [
            { position: 'end', text: 'label' }
        ],
        end: { type: "none" },
        start: { type: "none" }
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

        describe('#createShape', function() {

            it('should create the shape', function() {
                var shape = diagram.createShape(SomeShape, {x: 0, y: 0});
                assert.ok(shape);
                assert.equal(null, shape.wrapper);
                assert.strictEqual(shape.diagram, diagram);

                shape.remove();
            });

            it('should add it to its children', function() {
                var shape = diagram.createShape(SomeShape, {x: 0, y: 0});

                var found = _.find(diagram.get('children'), function(child) {
                    return child === shape;
                });
                assert.strictEqual(shape, found);

                shape.remove();
            });

        });

        describe('#removeShape', function() {

           it('should remove the shape from the canvas and from its children', function() {
               var shape = diagram.createShape(SomeShape, {x: 0, y: 0});

               diagram.removeShape(shape);

               var found = _.find(diagram.get('children'), function(child) {
                   return child === shape;
               });
               assert.notEqual(found, shape);
               shape.remove();
           });

        });

        describe('#getShape', function() {

            it('should return a child shape by its id', function() {
                var shape = diagram.createShape(SomeShape, {x: 0, y: 0});
                var s = diagram.getShape(shape.get('id'));
                assert.strictEqual(s, shape);

                shape.remove();
            });

            it('should return null if wrong id', function() {
                var shape = diagram.createShape(SomeShape, {x: 0, y: 0});
                var s = diagram.getShape(-1);
                assert.equal(s, null);

                diagram.removeShape(shape);

                shape.remove();
            });

        });


        describe('#createConnection', function() {

            it('should create the connection', function() {
                var c = diagram.createConnection(BasicConnection);
                assert.ok(c);
                assert.equal(null, c.wrapper);
                assert.strictEqual(c.diagram, diagram);
                assert.ok(_.isNumber(c.get('id')));
                assert.equal(null, c.get('source'));
                assert.equal(null, c.get('target'));

                c.remove();
            });

            it('should add it to its edges', function() {
                var c = diagram.createConnection(BasicConnection);
                var found = _.find(diagram.get('edges'), function(child) {
                    return child === c;
                });
                assert.strictEqual(c, found);

                c.remove();
            });

        });

        describe('#removeConnection', function() {

            it('should remove the connection from the canvas and from its edges', function() {
                var c = diagram.createConnection(BasicConnection);
                diagram.removeConnection(c);

                var found = _.find(diagram.get('edges'), function(child) {
                    return child === c;
                });

                assert.notEqual(found, c);
            });

        });

        describe('#getConnection', function() {

            it('should return a connection by its id', function() {
                var c = diagram.createConnection(BasicConnection);
                var s = diagram.getConnection(c.get('id'));
                assert.strictEqual(s, c);
                c.remove();
            });

            it('should return null if wrong id', function() {
                var s = diagram.getConnection(-1);
                assert.equal(s, null);
            });
        });

    });

});
