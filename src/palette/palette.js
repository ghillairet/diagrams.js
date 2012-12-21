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
var Palette = Ds.Palette = function( diagram ) {
    this.diagram = diagram;
    this.paletteX = 10;
    this.paletteY = 10;
};

Palette.extend = extend;

Palette.prototype.render = function() {
    if (this.element) {
        return this;
    }

    var diagram = this.diagram;

    this.element = document.createElement('div');
    this.element.setAttribute('class', 'palette');
    this.element.style.left = this.paletteX;
    this.element.style.top = this.paletteY;

    var inner = document.createElement('div');
    inner.setAttribute('class', 'palette-inner');

    this.header = document.createElement('div');
    this.header.setAttribute('class', 'palette-header');

    var headerContent = document.createElement('div');
    var zoomPlus = document.createElement('a');
    zoomPlus.innerHTML = ' +';
    var zoomMinus = document.createElement('a');
    zoomMinus.innerHTML = ' -';

    zoomPlus.addEventListener('click', function() { diagram.zoom('in'); });
    zoomMinus.addEventListener('click', function() { diagram.zoom('out'); });

    headerContent.appendChild(zoomPlus);
    headerContent.appendChild(zoomMinus);
    this.header.appendChild(headerContent);

    this.body = document.createElement('div');
    this.body.setAttribute('class', 'palette-body');

    _.each(this.groups, function(group) {
        var view = new PaletteGroup(group, this);
        view.render();
        this.body.appendChild(view.el());
    }, this);

    this.element.appendChild( inner );
    inner.appendChild( this.header );
    inner.appendChild( this.body );

    this.diagram.el.appendChild( this.element );

    return this;
};

Palette.prototype.el = function() {
    return this.element;
};

Palette.prototype.asDraggable = function() {
    if (this.element && this.header) {
        this.header.style.cursor = 'move';
        var palette = this;

        this.header.addEventListener('mousedown', function(evt) {
            palette.innerX = evt.clientX + window.pageXOffset - palette.element.offsetLeft;
            palette.innerY = evt.clientY + window.pageYOffset - palette.element.offsetTop;

            window.addEventListener('mousemove', move, false);
            window.addEventListener('mouseup', function() {
                window.removeEventListener('mousemove', move, false);
            }, true);

            function move(e) {
                var position = palette.element.style.position;
                palette.element.style.position = 'absolute';
                palette.element.style.left = e.clientX + window.pageXOffset - palette.innerX + 'px';
                palette.element.style.top = e.clientY + window.pageYOffset - palette.innerY + 'px';
                palette.element.style.position = position;
            }
        });
    }
};

Palette.prototype.remove = function() {
    if (this.element) {
        this.element.parentNode.removeChild( this.element );
        this.element= null;
    }
};

//
// PaletteGroup
//

var PaletteGroup = function(group, palette) {
    this.title = group.title;
    this.tools = group.tools;
    this.palette = palette;
    this.views = [];
};

PaletteGroup.prototype.template = _.template('<div class="palette-header"><span> <%= title %></span></div><div class="palette-body"></div>');

PaletteGroup.prototype.render = function() {
    this.remove();
    this.element = document.createElement('div');
    this.element.setAttribute('class', 'palette-group');
    this.element.innerHTML = this.template(this);

    this.header = this.element.children[0];
    this.body = this.element.children[1];

    _.each(this.tools, function(tool) {
        var view = new PaletteItem(tool, this.palette);
        view.render();

        view.on('click', function() {
            this.palette.currentItem = view;
             if (typeof view.edge === 'function') {
                diagram.currentEdge = view.edge;
            } else {
                diagram.el.addEventListener('click', create, false);
            }
        }, this);

        view.on('created', function() {
            this.palette.currentItem = null;
        }, this);

        this.views.push(view);
        this.body.appendChild(view.el());
    }, this);

    var diagram = this.palette.diagram,
        me = this;

    function canCreate(control, tool) {
        var found;
        if (!control) return;
        if (typeof control.canCreate === 'function') {
            if (control.canCreate(tool)) {
                found = control;
            }
        }
        if (!found) {
            found = _.find(control.children, function(c) {
                return canCreate(c, tool) !== undefined;
            });
        }
        return found;
    }

    function create(e) {
        var tool = me.palette.currentItem,
            position, node;

        if (tool) {
            position = Point.get(diagram._paper, e);
            if (typeof tool.shape === 'function') {
                if (diagram._canCreate(me.palette.currentItem.shape)) {
                    node = diagram.createShape(tool.shape, position);
                    if (node) {
                        node.render();
                        me.palette.currentItem.trigger('created');
                    }
                } else {
                    // if click over an element
                    var el = diagram.paper().getElementsByPoint(position.x, position.y);
                    if (el && el.length) {
                        var l = el.length,
                            i = 0,
                            found, wrapper, control;

                        while(i < l && !found) {
                            wrapper = el[i];
                            control = wrapper.controller;
                            console.log('control', control);
                            found = canCreate(control, tool.shape);
                            i++;
                        }

                        if (found) {
                            node = new tool.shape(position);
                            if (node) {
                                found.add(node);
                                found._renderContent();
                                found.doLayout();
                                me.palette.currentItem.trigger('created');
                            }
                        }
                    }
                }
            }

        }

        diagram.el.removeEventListener('click', create, false);
    }

    this.header.addEventListener('click', function(e) {
        if (me._hidden)  {
            me.show();
            me._hidden = false;
        } else {
            me.hide();
            me._hidden = true;
        }
    });

    return this;
};

PaletteGroup.prototype.el = function() {
    return this.element;
};

PaletteGroup.prototype.hide = function() {
    _.each(this.views, function(e) { e.remove(); });
    return this;
};

PaletteGroup.prototype.show = function() {
    _.each(this.views, function(e) {
        e.render();
        this.body.appendChild(e.el());
    }, this);

    return this;
};

PaletteGroup.prototype.remove = function() {
    if (this.element) {
        this.element.parentNode.removeChild(this.element);
    }

    return this;
};

//
// PaletteItem
//

var PaletteItem = function(item, palette) {
    this.icon = item.icon || 'icon-tool-' + item.title;
    this.title = item.title;
    this.shape = item.shape;
    this.edge = item.edge;
    this.palette = palette;
};

_.extend(PaletteItem.prototype, Events);

PaletteItem.prototype.template = _.template('<span><i class="<%= icon %>"></i> <%= title %></span>');

PaletteItem.prototype.render = function() {
    this.remove();
    this.element = document.createElement('div');
    this.element.setAttribute('class', 'palette-item');

    var html = this.template(this);
    this.element.innerHTML = html;

    var me = this;
    me.element.addEventListener('click', function(e) {
        e.stopPropagation();
        me.trigger('click');
    }, false);

    this.element.addEventListener('mouseover', function(e) {
        me.element.setAttribute('class', 'palette-item highlight');
    });

    this.element.addEventListener('mouseout', function(e) {
        me.element.setAttribute('class', 'palette-item');
    });

    return this;
};

PaletteItem.prototype.remove = function() {
    if (this.element) {
        this.element.parentNode.removeChild(this.element);
        delete this.element;
    }
};

PaletteItem.prototype.el = function() {
    return this.element;
};

