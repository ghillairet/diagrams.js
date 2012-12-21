(function() {

    showcase = {};
    showcase.bpmn = {};
    showcase.uml = {};

    var LabelFigure = {
        type: 'text',
        position: 'center',
        'font-size': 14,
        'font-family': 'Gill Sans'
    };

    var Label = {
        figure: LabelFigure
    };

    var TaskLabel = _.extend({}, Label);
    TaskLabel.figure.text = 'Task';

    showcase.bpmn.Task = Ds.Shape.extend({
        resizable: true,
        figure: {
            type: 'rect',
            r: 4,
            'stroke-width': 2,
            fill: 'white',
            stroke: 'black',
            width: 90,
            height: 70,
            title: 'Task'
        },
        layout: {
            type: 'grid'
        },
        children: [ TaskLabel ]
    });

    var LaneLabel = _.extend({}, Label);
    LaneLabel.text = 'Lane';

    var SwinLaneLeftCompartment = {
        compartment: true,
        figure: {
            type: 'rect',
            fill: 'green',
            'stroke-width': 2,
            x: 0,
            y: 20,
            width: 40
        },
        layout: {
            type: 'flow',
            vertical: true, // horizontal, fixed
            spacing: 5 // space between childs
        },
        children: [ LaneLabel ]
    };

    var SwinLaneRigtCompartment = {
        compartment: true,
        layout: {
            type: 'flow',
            vertical: true, // horizontal, fixed
            spacing: 5 // space between childs
        },
        figure: {
            type: 'rect',
            fill: 'blue',
            'stroke-width': 2,
            x: 40,
            y: 20,
            width: 40
        }
    };

    showcase.bpmn.SwimLane = Ds.Shape.extend({
        figure: {
            type: 'rect',
            width: 80,
            height: 120,
            fill: 'yellow',
            stroke: 'black',
            'stroke-width': 2,
            title: 'Swim Lane'
        },

        layout: { type: 'flow', vertical: true },

        children: [
            Label,
            SwinLaneLeftCompartment,
            SwinLaneRigtCompartment
        ]
    });

    var MailTriangle = {
        resizable: false,
        draggable: false,
        figure: {
            type: 'path',
            fill: 'white',
            path: 'M2,0L15,10L28,0Z',
            'stroke-width': 2
        }
    };

     var Mail = {
        resizable: false,
        draggable: false,
        figure: {
            type: 'rect',
            width: 30,
            height: 20,
            x: 10,
            y: 15,
            fill: 'yellow',
            stroke: 'black',
            'stroke-width': 2
        },
        children: [ MailTriangle ]
    };

    showcase.bpmn.EventMail = Ds.Shape.extend({
        resizable: false,
        figure: {
            type: 'circle',
            r: 25,
            fill: 'white',
            stroke: 'black',
            'stroke-width': 2,
            title: 'Mail'
        },
        layout: { type: 'xy' },
        children: [ Mail ]
    });

    var ClockHands = {
        resizable: false,
        draggable: false,
        figure: {
            type: 'path',
            fill: 'white',
            path: 'M22,4L18,20L32,18',
            'stroke-width': 2
        }
    };

     var Clock = {
        resizable: false,
        draggable: false,
        figure: {
            type: 'circle',
            r: 18,
            cx: 25,
            cy: 25,
            fill: 'white',
            stroke: 'black',
            'stroke-width': 2
        },
        children: [ ClockHands ]
    };

    showcase.bpmn.Timer = Ds.Shape.extend({
        resizable: false,
        figure: {
            type: 'circle',
            r: 25,
            fill: 'white',
            stroke: 'black',
            'stroke-width': 2,
            title: 'Timer'
        },
        layout: { type: 'xy' },
        children: [ Clock ]
    });

    showcase.bpmn.Gateway = Ds.Shape.extend({
        resizable: false,
        figure: {
            type: 'rect',
            width: 50,
            height: 50,
            fill: 'white',
            'fill-opacity': 0,
            'stroke-width': 0,
            title: 'Gateway'
        },
        layout: { type: 'xy' },
        children: [{
            figure: {
                type: 'path',
                path: 'M25,0L50,25L25,50L0,25Z',
                fill: 'orange',
                'stroke-width': 2
            }
        }]
    });

    showcase.bpmn.SequenceFlow = Ds.Connection.extend({
        figure: {
            stroke: 'orange',
            'stroke-width': 1
        },
        end: {
            type: 'basic'
        }
    });

     var PropertyLabel = {
         figure: {
            type: 'text',
            position: 'center-left',
            'font-size': 14,
            'font-family': 'Gill Sans',
            text: 'name: String'
         }
    };

    showcase.uml.Property = Ds.Label.extend({
        resizable: false,
        draggable: false,
        figure: {
            type: 'text',
            text: 'name: String',
            height: 20,
            stroke: 'blue',
            position: 'center-left'
        }
    });

    var PropertyCompartment = {
        compartment: true,
        figure: {
            type: 'rect',
            height: 20,
            fill: 'none',
            stroke: '#E4E4A0',
            'stroke-width': 2,
            'stroke-opacity': 0.8
        },
        layout: {
            type: 'flex',
            columns: 1
        },
        accepts: [ showcase.uml.Property ]
    };

    var OperationCompartment = {
        compartment: true,
        figure: {
            type: 'rect',
            height: 20,
            fill: 'none',
            stroke: '#E4E4A0',
            'stroke-width': 2,
            'stroke-opacity': 0.8
        },
        layout: {
            type: 'flex',
            columns: 1
        },
        accepts: [ showcase.uml.Property ]
    };

    var ClassLabel = {
        figure: {
            type: 'text',
            text: 'Class'
        }
    };

    var ClassImage = {
        figure: {
            type: 'image',
            src: 'img/EClass.gif',
            width: 16,
            height: 16
        }
    };

    var ClassHeader = {
        figure: {
            type: 'text',
//            fill: 'none',
//            stroke: 'none',
            text: 'Class',
            height: 20,
            image: {
                src: 'img/EClass.gif',
                width: 16,
                height: 16
            }
        }
//,
//        children: [ClassImage, ClassLabel],
//        layout: {
//            type: 'flow'
//        }
    };

    showcase.uml.Class = Ds.Shape.extend({
        figure: {
            type: 'rect',
            width: 100,
            height: 60,
            fill: '#F9FAD8',
            opacity: 0.8,
            stroke: '#E4E4A0',
            'stroke-width': 2,
            'stroke-opacity': 0.8
        },
        layout: {
            type: 'flex',
            columns: 1,
            stretch: true
        },
        children: [
            ClassHeader,
            PropertyCompartment
//        ,   OperationCompartment
        ]
    });

    var ActivityGroup = {
        title: 'Activity',
        tools: [
            { title: 'Task', shape: showcase.bpmn.Task },
            { title: 'Sequence Flow', edge: showcase.bpmn.SequenceFlow },
            { title: 'Swin Lane', shape: showcase.bpmn.SwimLane }
        ]
    };

    var GatewayGroup = {
        title: 'Gateway',
        tools: [
            {  title: 'Gateway', shape: showcase.bpmn.Gateway }
        ]
    };

    var EventGroup = {
        title: 'Events',
        tools: [
            { title: 'Mail', shape: showcase.bpmn.EventMail },
            { title: 'Timer', shape: showcase.bpmn.Timer }
        ]
    };

    var UMLGroup = {
        title: 'UML',
        tools: [
            { title: 'Class', shape: showcase.uml.Class },
            { title: 'Property', shape: showcase.uml.Property }
        ]
    };

    showcase.Palette = Ds.Palette.extend({
        groups: [
            ActivityGroup,
            GatewayGroup,
            EventGroup,
            UMLGroup
        ]
    });

    showcase.Diagram = Ds.Diagram.extend({
        el: 'canvas',
        children: [
            showcase.bpmn.Task,
            showcase.bpmn.SwimLane,
            showcase.bpmn.EventMail,
            showcase.bpmn.Timer,
            showcase.bpmn.Gateway,
            showcase.uml.Class
        ]
    });

    var diag = new showcase.Diagram();
    diag.render();

    var palette = new showcase.Palette( diag );
    palette.render().asDraggable();

//    var t1 = showcase.t1 = new showcase.bpmn.Task({diagram: diag, x: 199, y: 200});
//    t1.render();

}).call(this);
