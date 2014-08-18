define(function(require, exports, module) {
  var Transform     = require('famous/core/Transform');
  var TwoDim        = require('../../math/TwoDim');
  var Chainer       = require('../../modifier/Chainer');

  /**
   *  Layout items in x or y direction, sequentially.
   *
   *  @param _options {object}
   *  @param padding {Array|2D} x & y padding added to the size of each item.
   *  @param transition {Object} transition: transition definition for transitions.
   *  @param center {Boolean} : center the item in the opposite x/y dimension of the direction of the slider.
   *      If it's a x-directional slider, center variable height items in the Y.
   *
   *  @method sequential
   */
  module.exports = {
    defaultOptions: {
      padding: [10, 10],
      transition: {
        duration: 500,
        curve: 'outExpo'
      },
      center: true
    },

    layout:  function (options) {
      var totalSize = [0,0];
      var oppositeDirection = this.options.direction ? 0 : 1;

      var getTransform = function (size) {

        var centered = options.center && size ? 
          (this.getSize()[oppositeDirection] - size[oppositeDirection]) * 0.5 :
          0;

        return this.options.direction ? 
          Transform.translate(centered, totalSize[1] + this.data.touchOffset[1]): // y
          Transform.translate(totalSize[0] + this.data.touchOffset[0], centered); // x
      }.bind(this);

      /*
       *  Reverse loop from currentIndex -1, to lay out items within the margin
       */
      for (var i = this.sequence.getIndex() - 1; i >= this.sequence.getIndex() - this.options.margin; i--) {
        if ( i < 0 ) break;
        var size = this.data.items[i].getSize(true);
        var paddingSize = TwoDim.addClone(size, options.padding);
        TwoDim.sub( totalSize, paddingSize );
        this.data.childTransforms[i].set(getTransform(size), options.transition);
      };

      /*
       *  From currentIndex -> currentIndex + margin, lay out from [0,0] for each item's size + padding.
       */
      totalSize = [0,0];
      for (var i = this.sequence.getIndex(); i < this.sequence.getIndex() + this.options.margin; i++) {
        if (!this.data.items[i]) break;
        var size = this.data.items[i].getSize(true);
        this.data.childTransforms[i].set(getTransform(size), options.transition);
        if (size) {
          TwoDim.add( totalSize, size );
          TwoDim.add( totalSize, options.padding );
        }
      };
    }
  }

});
