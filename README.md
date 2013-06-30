
### Diagrams.js

Javascript Diagramming Library

(Not ready for use - still in development)

### Dependencies

underscore
svg.js
svg.draggable.js

### Usage

```javascript
var diagram = new DG.Diagram('canvas');

var RectShape = DG.Shape.extend({
    figure:  {
        type: 'rect',
        width: 100,
        height: 100,
        fill: '#fff',
        cursor: 'move',
        stroke: '#666',
        'stroke-width': 1
    }
});

var r1 = new RectShape({ x: 100, y: 100 });
var r2 = new RectShape({ x: 200, y: 100 });
var c = new DG.Connection();
c.connect(r1, r2)
diagram.add(r1, r2, c);

diagram.render();

```

## License
This software is distributed under the terms of the Eclipse Public License 1.0 - http://www.eclipse.org/legal/epl-v10.html.

