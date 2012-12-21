showcase = {};

    showcase.CircleNode = Diagram.Shape.extend({
        type: 'showcase.CircleNode',
        resizable: false,
        figure: {
            type: 'circle',
            r: 30,
            fill: 'red',
            stroke: 'rgb(120, 120, 200)',
            'stroke-width': 2
        }
    });

    showcase.EllipseNode = Diagram.Shape.extend({
        type: 'showcase.EllipseNode',
        resizable: true,
        figure: {
            type: 'ellipse',
            rx: 30,
            ry: 20,
            fill: 'blue',
            stroke: 'rgb(120, 120, 200)',
            'stroke-width': 2
        }
    });

    showcase.RectangleNode = Diagram.Shape.extend({
        type: 'showcase.RectangleNode',
        shadow: false,
        figure: {
            type: 'rect',
            width: 100,
            height: 80,
            r: 0,
            fill: 'white',
            stroke: 'rgb(0,0,0)',
            'stroke-width': 2
        }
    });

    showcase.RoundedRectangleNode = Diagram.Shape.extend({
        type: 'showcase.RoundedRectangleNode',
        figure: {
            type: 'rect',
            width: 100,
            height: 80,
            r: 12,
            fill: 'white',
            stroke: 'rgb(0,0,0)',
            'stroke-width': 2
        }
    });

    showcase.DiamondNode = Diagram.Shape.extend({
        type: 'showcase.DiamondNode',
        resizable: true,

        figure: {
            type: 'rect',
            width: 50,
            height: 50,
//            transform: 'r45',
            r: 0,
            fill: 'white',
            stroke: 'rgb(0,0,0)',
            'stroke-width': 2
        },

        label: {
            width: 60,
            height: 10,
            text: 'Label',
            position: 'center'
        }
    });

    showcase.ChildNode = Diagram.Shape.extend({
        type: 'showcase.ChildNode',
        figure: {
            type: 'circle',
            r: 30,
            fill: 'yellow',
            stroke: 'white',
            'stroke-width': 4
        }
    });

    showcase.ContainerNode = Diagram.Shape.extend({
        type: 'showcase.ContainerNode',
        figure: {
            type: 'rect',
            width: 460,
            height: 280,
            fill: 'black',
            stroke: 'yellow',
            'stroke-width': 4
        },
        compartments: [ {
            top: 40,
            height: 240,
            fill: 'red',
            accepts: [
                'showcase.ChildNode'
            ]
        } ]
    });

    showcase.StackContainerNode = Diagram.Shape.extend({
        type: 'showcase.StackContainerNode',
        figure: {
            type: 'rect',
            width: 120,
            height: 100,
            fill: 'black',
            stroke: 'white',
            'stroke-width': 2
        },
        compartments: [ {
            layout: 'stack',
            top: 40,
            height: 60,
            accepts: [ 'showcase.ChildNode' ]
        } ]
    });

    showcase.UMLProperty = Diagram.Shape.extend({
        type: 'showcase.UMLProperty',
        resizable: false,
        draggable: false,

        figure: {
            type: 'rect',
            height: 20,
            stroke: 'none'
        },

        label: {
            text: 'name: Type',
            position: 'center-left',
            width: 60,
            height: 10,
            'font-size': 12,
            image: {
                src: 'img/EAttribute.gif',
                width: 16,
                height: 16
            }
        }
    });

    showcase.UMLOperation = Diagram.Shape.extend({
        type: 'showcase.UMLOperation',
        resizable: false,
        draggable: false,

        figure: {
            type: 'rect',
            height: 20,
            fill: 'none',
            stroke: 'none'
        },

        label: {
            text: 'Operation',
            width: 60,
            height: 10,
            position: 'center-left'
        }
    });

    showcase.UMLClass = Diagram.Shape.extend({
        type: 'showcase.UMLClass',
        shadow: true,
        figure: {
            type: 'rect',
            width: 100,
            height: 50,
            fill: '90-#fff-#F9FAD8',
            stroke: '#808080',
            'stroke-width': 2,
            'stroke-opacity': 1
        },

        label: {
            position: 'top-center',
            image: {
                src: 'img/EClass.gif',
                width: 16,
                height: 16
            },
            height: 20,
            text: 'Class Name',
            'font-size': 12
        },

        compartments: [ {
            layout: 'stack',
            top: 30,
            height: 20,
            accepts: [
                'showcase.UMLProperty'
            ]
        } ]
    });

    showcase.Line = Diagram.Connection.extend({
        type: 'showcase.Line',
        stroke: 'red',
        'stroke-width': 2,
        label: [
            { position: 'start', text: 'Hello World' },
            { position: 'end', text: 'Hello World' },
            { position: 'middle', text: 'Hello World' }
        ],
        end: {
            type: "none"
        },
        start: {
            type: "none"
        }
    });

    showcase.Arrow = Diagram.Connection.extend({
        type: 'showcase.Arrow',
        label: [
            { position: 'end', text: '[]', offset: { x: 10, y: 10} }
        ],
        end: {
            type: 'basic'
        }
    });

    showcase.DashArrow = Diagram.Connection.extend({
        type: 'showcase.DashArrow',
        end: {
            type: 'basic',
            fill: "white"
        }
    });

    showcase.Diagram = Diagram.Diagram.extend({
        container: 'canvas',
        child: [
            showcase.CircleNode,
            showcase.RectangleNode,
            showcase.RoundedRectangleNode,
            showcase.DiamondNode,
            showcase.EllipseNode,
            showcase.ContainerNode,
            showcase.StackContainerNode,
            showcase.UMLClass
        ]
    });

    showcase.Palette = Diagram.Palette.extend({
        groups: [{
            title: 'Shapes',
            tools: [{
                title: 'Circle',
                shape: showcase.CircleNode
            },{
                title: 'Ellipse',
                shape: showcase.EllipseNode
            },{
                title: 'Rectangle',
                shape: showcase.RectangleNode
            },{
                title: 'RoundedRectangle',
                shape: showcase.RoundedRectangleNode
            },{
                title: 'Diamond',
                shape: showcase.DiamondNode
            }]
        },{
            title: 'Connections',
            tools: [{
                title: 'Line',
                edge: showcase.Line
            },{
                title: 'Arrow',
                edge: showcase.Arrow
            }]
        },{
            title: 'Compartments',
            tools:[{
                title: 'Container',
                shape: showcase.ContainerNode
            },{
                title: 'ChildNode',
                shape: showcase.ChildNode
            }]
        },{
            title: 'UML',
            tools:[{
                title: 'Class',
                shape: showcase.UMLClass
            },{
                title: 'Property',
                shape: showcase.UMLProperty
            }]
        }]
    });

