// Palette
//
//  var myPalette = Diagram.Palette.extend({
//      groups: [ {
//            title: 'Objects',
//            tools: [ {
//              title: 'Class',
//              description: 'Blah Blah.',
//              icon: {
//                  small: '/small.png',
//                  large: 'large.png'
//              }
//            ]
//        } ]
//  });
//
var Palette = Diagram.Palette = function( diagram ) {
    this.diagram = diagram;
    this.paletteX = 0;
    this.paletteY = 0;
};

Palette.extend = extend;

var groupTemplate = [
        '<% _.each(groups, function(group) { %>',
        '<div class="accordion-group">',
            '<div class="accordion-heading"><a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="#collapse<%= group.title %>"><%= group.title %></a></div>',
            '<div id="collapse<%= group.title %>" class="accordion-body in collapse" style="height: auto;">',
                '<div class="accordion-inner">',
                    '<div class="btn-group-vertical">',
                        '<% _.each(group.tools, function(tool) { %>',
                            '<button id="create<%= tool.title %>" class="btn palette-tool"><i class="icon-tool-<%= tool.title %>"></i> <%= tool.title %></button>',
                        '<% }) %>',
                    '</div>',
                '</div>',
            '</div>',
        '</div>',
        '<% }) %>'
     ];

var group = _.template( groupTemplate.join(' ') );

Palette.prototype.render = function() {
    if (this.paletteRoot) {
        return this;
    }

    this.paletteRoot = document.createElement('div');
    this.paletteRoot.setAttribute('class', 'palette');
    this.paletteHeader = document.createElement('div');
    this.paletteHeader.setAttribute('class', 'palette-header');
    this.paletteGroups = document.createElement('div');
    this.paletteGroups.setAttribute('class', 'palette-groups');

    this.paletteGroups.innerHTML = group( this );

    this.paletteRoot.appendChild( this.paletteHeader );
    this.paletteRoot.appendChild( this.paletteGroups );
    this.diagram.el().parentNode.appendChild( this.paletteRoot );

    this.addEvents();

    return this;
};

Palette.prototype.el = function() {
    return this.paletteRoot;
};

Palette.prototype.addEvents = function () {
    var palette = this;

    _.each(this.groups, function(group) {
        _.each(group.tools, function(tool) {
            var action = document.getElementById('create' + tool.title);

            if (action && typeof tool.shape === 'function') {
                action.addEventListener('click', function( event ) {
                    palette.diagram.currentTool = tool.shape;
                });
            }

            if (action && typeof tool.edge === 'function') {
                action.addEventListener('click', function( event ) {
                    palette.diagram.currentEdge = tool.edge;
                });
            }
        });
    });
};

Palette.prototype.asDraggable = function() {
    if (this.paletteRoot) {
        this.paletteHeader.style.cursor = 'move';

        var palette = this;
        palette._moving = false;

        this.paletteHeader.addEventListener('mousedown', function(evt) {
            palette._moving = true;
            palette.offsetX = evt.pageX - palette.paletteX;
            palette.offsetY = evt.pageY - palette.paletteY;
        });

        this.diagram.el().parentNode.addEventListener('mouseup', function(evt) {
            palette._moving = false;
        });

        this.diagram.el().parentNode.addEventListener('mousemove', function(evt) {
            if (palette._moving) {
                palette.paletteX = evt.pageX - palette.offsetX;
                palette.paletteY = evt.pageY - palette.offsetY;
                palette.paletteRoot.style.left = palette.paletteX + 'px';
                palette.paletteRoot.style.top = palette.paletteY + 'px';
            }
        });
    }
};

Palette.prototype.remove = function() {
    if (this.paletteRoot) {
        this.paletteRoot.parentNode.removeChild( this.paletteRoot );
        this.paletteRoot = null;
    }
};