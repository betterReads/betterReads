define(function(require, exports, module) {
  var Transform = require('famous/core/Transform');
  var SingularHelper = require('./SingularHelper');

  module.exports = {
    /**
     * Parallax the current and last item against one another.
     * 
     * @class SingularParallax
     * @param {Options} [options] An object of configurable options.
     * @param {Object} [options.curve] Valid Famo.us curve definition
     * @param {Number} [options.parallax] 
     *    Parallax percentage, from 0 - 1. At zero, it doesn't move at all. 
     *    At 1, it moves the entire size of the current item.
     * @param {Number} [options.depth]
     *    Add additional z-depth to the parallax
     */
    defaultOptions: {
      direction: 'y',
      curve: { 
        method: 'spring',
        dampingRatio: 0.95,
        period : 550
      },
      parallax: 0.2,
      depth: 1
    },

    activate: function () { 
      SingularHelper.center.call(this);
    },
    layout: function (options) {
      var depth = Math.max(options.depth, 1);
      var axis = options.direction == 'x' ? 0 : 1;
      
      function current (item, containerSize, index, lastIndex) {
        item.opacity.set(1);
        item.trans.halt();
        
        if (index > lastIndex) { 
          var position = [0,0,-2 * depth];
          position[axis] =  -item.size[axis] * options.parallax;
          item.trans.setTranslate(position);
          item.trans.setTranslate([0,0,-1 * depth], options.curve);
        }
        else { 
          var position = [0,0,0];
          position[axis] = containerSize[axis];
          item.trans.setTranslate(position);
          item.trans.setTranslate([0,0,0], options.curve);
        }
      }

      function last (item, containerSize, index, lastIndex) {
        item.opacity.set(1);
        item.trans.halt();

        if (index > lastIndex) { 
          var position = [0,0,0];
          position[axis] = containerSize[axis];
          var pos = position.slice(0);
          pos[2] = -1;

          item.trans.setTranslate(position, options.curve);
          item.trans.setTranslate(pos, {
            curve: 'linear',
            duration: 1
          });
        } 
        else { 
          var instantPosition = [0,0,0];
          var finalPos = [0,0,-2 * depth];
          finalPos[axis] = -item.size[axis] *options.parallax; 
          
          item.trans.setTranslate(instantPosition);
          item.trans.setTranslate(finalPos, options.curve);
        }
      }

      function other (item, containerSize) {
        item.opacity.set(0);
        item.trans.set(Transform.identity);
      }

      SingularHelper.layout.call(this, current, last, other);
    },
    deactivate: function () {
      SingularHelper.cleanup.call(this);
    }
  }
});
