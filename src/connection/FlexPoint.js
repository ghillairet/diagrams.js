/**
 * @name FlexPoint
 * @class Represents a flex point being part of a connection
 *
 */

function FlexPoint(connection, point) {
    this.connection = connection;
    this.paper = connection.paper();
    this.x = point.x;
    this.y = point.y;
}

/**
 * Renders the FlexPoint on the canvas
 */

FlexPoint.prototype.render = function() {
    this.remove();

    this.wrapper = this.paper.rect(this.x - 3, this.y - 3, 6, 6, 0);
    this.wrapper.attr({ fill: 'black', stroke: 'none', cursor: 'pointer' });

    this.drag();
    this.wrapper.toFront();

    return this;
};

/**
 * Removes the FlexPoint from the canvas
 */

FlexPoint.prototype.remove = function() {
    if (this.wrapper) this.wrapper.remove();
};

FlexPoint.prototype.drag = function() {
    if (!this.wrapper) return this;

    var point = this,
        connection = this.connection,
        move = function(dx, dy) {
            this.attr({ x: this.ox + dx, y: this.oy + dy });
            var box = this.getABox();
            point.x = box.center.x;
            point.y = box.center.y;
            connection.render();
        },
        start = function() {
            this.o();
            point.state = 'dragging';
            this.attr('cursor', 'move');
        },
        end = function() {
            delete point.state;
            connection.deselect();
        };

    this.wrapper.drag(move, start, end);
};

