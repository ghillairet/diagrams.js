// Support for GMF Notation Models.

diagram.notation = {}
diagram.notation.json = {}

// Parse a JSON object into the given diagram instance.
diagram.notation.json.parse = function( json, diagram, mapping ) {
    console.log(mapping);

    if (!isValidDiagram(json)) {
        throw new Error('This is not a valid notation model.');
    }

    var keys = _.filter(_.keys(json), function(k) {
        var value = json[k];
        return !_.isObject(value);
    });

    _.each( keys, function( key ) {
        diagram[key] = json[key];
    });

    diagram.children = [];
    diagram.edges = [];

    _.each( json.children, function(child) {
        var type = child.type;
        var layout = child.layoutConstraint;

        console.log(child, mapping[type]);

        if (type && typeof mapping[type] === 'function') {
            var shape = diagram.createShape(mapping[type], layout);
            diagram.children.push( shape );
        }
    });

    return diagram;
};

var NOTATION_URI = 'http://www.eclipse.org/gmf/runtime/1.0.2/notation';
var BASE = NOTATION_URI + '#//';

var isValidDiagram = function( json ) {
  return json['eClass'] ? json['eClass'] === BASE + 'Diagram' : false;
};
