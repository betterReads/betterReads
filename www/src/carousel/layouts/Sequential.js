define(function(require, exports, module) {
  var Transform     = require('famous/core/Transform');
  var Chainer       = require('../modifier/Chainer');
  var SingularHelper = require('./SingularHelper');

  /**
   *  Layout items in x or y direction, sequentially.
   *
   *  @param {Options} [options] An object of configurable options.
   *  @param {Array|2D} [options.padding] x & y padding added to the size of each item.
   *  @param {Object} [options.curve] The curve definition for the main transition.
   *  @param {Boolean} [options.center] Center the item in the opposite x/y dimension of the direction of the slider.
   *      If it's a x-directional slider, center variable height items in the Y.
   *  @param {Number} [options.direction] X or Y direction for the sequential layout.
   *
   *  @class Sequential
   *  @example
   *    myCarousel.setContentLayout(FamousCarousel.Sequential);
   *  @example
   *    myCarousel.setContentLayout(FamousCarousel.Sequential({ 
   *      padding: [50, 50],
   *      curve: { 
   *        duration: 750,
   *        curve: 'outExpo'
   *      }
   *      center: true
   *    });
   *  
   */
  module.exports = {
    defaultOptions: {
      padding: [10, 10],
      curve: {
        duration: 1000,
        curve: 'outExpo'
      },
      center: true,
      direction: 0
    },

    renderLimit: function () {
      return [2, Math.min(10, this.nodes.length)];
    },

    activate: function () {
      SingularHelper.cleanup.call(this);
      this.layout();
    },

    layout:  function (options) {
      var totalSize = [0,0];
      var backwardsSize = [0,0];
      var oppositeDirection = options.direction ? 0 : 1;
      var nodeLength = this.nodes.length;

      var getCenter = (function (size) {
        var center = [0,0];
        if (options.center && size) { 
          center[oppositeDirection] = 
            (this.getSize()[oppositeDirection] - size[oppositeDirection]) * 0.5;
        }
        return center;
      }).bind(this);

      var getTransform = (function (size) {
        var centered = getCenter(size);
        return Transform.translate(totalSize[0] + centered[0], totalSize[1] + centered[1]);
      }).bind(this);

      // backwards
      for (var i = 1; i <= this.renderLimit[0]; i++) {
        var index = this._sanitizeIndex(this.index - i);
        var transform  = this.data.childTransforms[index];
        var size = this.data.sizeCache[index];

        var centered = getCenter(size);
        backwardsSize[oppositeDirection] = centered[oppositeDirection];
        backwardsSize[options.direction] -= (size[options.direction] + options.padding[options.direction]);
        var trans = Transform.translate(backwardsSize[0], backwardsSize[1]);

        if (i == 1) {
          transform.set(trans, options.curve);
        }
        else {
          transform.set(trans);
        }
      }

      // forwards
      for (var i = 0; i <= this.renderLimit[1]; i++) { // intentionally one ahead, to prevent one frame where newly rendered items sit at [0,0,0]
        
        var index = this._sanitizeIndex(this.index + i);
        
        var transform  = this.data.childTransforms[index];
        var size = this.data.sizeCache[index];

        if (this.options['loop'] || !this.options['loop'] && index >= this.index) { 
          if (this.lastIndex < this.index && transform.translate.get()[options.direction] <= 0) {
            transform.set(getTransform(size));
          }
          else {
            transform.set(getTransform(size), options.curve);
          }

          if (size) {
            totalSize[options.direction] += (size[options.direction] + options.padding[options.direction]);
          }
        }
      }
    }
  }

});
