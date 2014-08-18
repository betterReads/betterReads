define(function(require, exports, module) {
  var Transform     = require('famous/core/Transform');
  var TwoDim        = require('../../math/TwoDim');
  var Chainer       = require('../../modifier/Chainer');

  /**
   *  Layout items in a grid, as many as can fit, aligned top left. Allows for chained animations.
   *  @param {Options} [options] An object of configurable options.
   *
   *  @param {Number} [options.scale=0.25] TODO: Remove this dependency, should be able to read it from the transform state.
   *  @param {Array|Number} [options.padding=15,15] Padding
   *  @method grid
   */
  module.exports = {

    defaultOptions : { 
      scale: 0.15,
      padding: [15, 15],
      moves: [{
          transformFinal: Transform.scale(0.15, 0.15),
          curve: { curve: 'outExpo', duration: 350 }
      }],
    },

    layout: function (options) {
      var containerSize = this.getSize().slice(0);
      var offset = [0,0];
      var yOffset = 0;

      for (var i = 0; i < this.sequence.length(); i++) {
        var trans = this.data.childTransforms[i];
        var size = this.data.items[i].getSize(true);

        if (size) {
          var scaledSize = TwoDim.multScalarClone(size, options.scale);
          TwoDim.add( scaledSize, options.padding );
          var x,y,z;
          if (scaledSize[0] + offset[0] < containerSize[0]) {
            offset[1] = Math.max(scaledSize[1], offset[1]);
          }
          else {
            yOffset += offset[1];
            offset[0] = 0;
          }

          x = offset[0] + this.data.touchOffset[0];
          y = yOffset + this.data.touchOffset[1];
          offset[0] += scaledSize[0];
          Chainer(options.moves, trans, [x,y,z], i);
        }
      };
    }
  }
});
