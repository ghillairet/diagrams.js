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
        layout: { type: 'xy' }
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
        initialize: function(attributes) {
            var mail = new Ds.Shape(Mail);
            mail.add(new Ds.Shape(MailTriangle));
            this.add(mail);
        }
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
            x: 7,
            y: 7,
            fill: 'white',
            stroke: 'black',
            'stroke-width': 2
        },
        layout: { type: 'xy' }
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
        initialize: function(attributes) {
            var clock = new Ds.Shape(Clock);
            clock.add(new Ds.Shape(ClockHands));
            this.add(clock);
        }
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

    var mail = new EventMail({ x: 100, y: 100 });
/*
    var timer = new Timer({ x: 250, y: 100 });
    var c1 = new SequenceFlow({ source: mail, target: timer });
    var task1 = new Task({ x: 350, y: 65 });
    var c2 = new SequenceFlow({ source: timer, target: task1 });
    var gt = new Gateway({ x: 500, y: 75 });
    var c3 = new SequenceFlow({ source: task1, target: gt });
    var task2 = new Task({ x: 650, y: 65 });
    var c4 = new SequenceFlow({ source: gt, target: task2 });
*/

    diagram.add(mail); //, timer);//, c1, task1, c2, gt, c3, task2, c4);
    diagram.render();

})(window.Ds);
