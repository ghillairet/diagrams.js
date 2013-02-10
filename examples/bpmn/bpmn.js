(function(Ds) {

    // Task

    var TaskLabel = {
        figure: {
            type: 'text',
            text: 'Task'
        }
    };

    var Task = Ds.Shape.extend({
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

    // Event

    // EventMail

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

    var EventMail = Ds.Shape.extend({
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

    // Timer

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

    var Timer = Ds.Shape.extend({
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

    // Gateway

    var GatewayFigure = {
        figure: {
            type: 'path',
            path: 'M25,0L50,25L25,50L0,25Z',
            fill: 'orange',
            'stroke-width': 2
        }
    };

    var Gateway = Ds.Shape.extend({
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
        children: [ GatewayFigure ]
    });

    // SequenceFlow

    var SequenceFlow = Ds.Connection.extend({
        figure: {
            stroke: 'black',
            'stroke-width': 2
        },
        end: {
            type: 'basic'
        }
    });

    // BPMNDiagram

    var BPMNDiagram = Ds.Diagram.extend({
        el: 'diagram',
        children: [
            Timer,
            Gateway,
            SequenceFlow,
            EventMail,
            Task
        ]
    });

    var diagram = new BPMNDiagram();

    var mail = new EventMail({ x: 100, y: 100, diagram: diagram });
    var timer = new Timer({ x: 250, y: 100, diagram: diagram });
    var c1 = new SequenceFlow({ diagram: diagram });
    c1.connect(mail, timer);
    var task1 = new Task({ x: 350, y: 65, diagram: diagram });
    var c2 = new SequenceFlow({ diagram: diagram });
    c2.connect(timer, task1);
    var gt = new Gateway({ x: 500, y: 75, diagram: diagram });
    var c3 = new SequenceFlow({ diagram: diagram });
    c3.connect(task1, gt);
    var task2 = new Task({ x: 650, y: 65, diagram: diagram });
    var c4 = new SequenceFlow({ diagram: diagram });
    c4.connect(gt, task2);

    diagram.render();

})(window.Ds);
