define(function(require, exports, module) {
    var View      = require('famous/core/View');
    var Entity    = require('famous/core/Entity');
    var Transform = require('famous/core/Transform');

    /*
     *  A view that keeps track of the parent's resize, passed down from the
     *  commit function. This can be anything higher in the render tree, 
     *  either the engine, or a modifier with a size, or a custom render function
     *  that changes the size. 
     *
     *  If you have a View that inherits from this, you get a .getParentSize()
     *  method that you can query at any point, and a `parentResize` event on 
     *  the `_eventInput` that you can listen to for immediate notificaitons of
     *  changes.
     *  
     *  @class SizeAwareView
     */
    function SizeAwareView() {
        View.apply(this, arguments);
        this.__id = Entity.register(this);
        this.__parentSize = []; //Store reference to parent size.
    }

    SizeAwareView.prototype = Object.create( View.prototype );
    SizeAwareView.prototype.constructor = SizeAwareView;

    /*
     * Commit the content change from this node to the document.
     * Keeps track of parent's size and fires 'parentResize' event on
     * eventInput when it changes.
     *
     * @private
     * @method commit
     * @param {Object} context
     */
    SizeAwareView.prototype.commit = function commit( context ) {
        var transform = context.transform;
        var opacity = context.opacity;
        var origin = context.origin;

        // Update the reference to view's parent size if it's out of sync with 
        // the commit's context. Notify the element of the resize.
        if (!this.__parentSize || this.__parentSize[0] !== context.size[0] || 
            this.__parentSize[1] !== context.size[1]) {
            this.__parentSize[0] = context.size[0];
            this.__parentSize[1] = context.size[1];
            this._eventInput.emit('parentResize', this.__parentSize);
        }

        if (this.__parentSize) { 
          transform = Transform.moveThen([
              -this.__parentSize[0]*origin[0], 
              -this.__parentSize[1]*origin[1], 
              0], transform);
        }

        return {
            transform: transform,
            opacity: opacity,
            size: this.__parentSize,
            target: this._node.render()
        };
    }

    /*
     * Get view's parent size.
     * @method getSize
     */
    SizeAwareView.prototype.getParentSize = function getParentSize() {
        return this.__parentSize;
    }

    /*
     * Actual rendering happens in commit.
     * @method render
     */
    SizeAwareView.prototype.render = function render() {
        return this.__id;
    };

    module.exports = SizeAwareView;
});
