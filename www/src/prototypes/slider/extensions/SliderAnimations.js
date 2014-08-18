define(function(require, exports, module) {
  var Transform = require('famous/core/Transform');
  var Chainer   = require('../../modifier/Chainer');

  var _animateItem = function(transitionablesArray, animation, transtionableIndex, finalPosition, animationDelayIndex) {
    var transitionable = transitionablesArray[transtionableIndex];
    transitionable.halt();
    Chainer(animation, transitionable, finalPosition, animationDelayIndex);
    // Chainer(this.options['dotOnClickMove'], this.dotTransitionables[transtionableIndex], null, animationDelayIndex++);
  }

  //Animate ordered set of items based on index within a given bounds
  var _animateInDirection = function(itemsToAnimate, animation, itemIndex, step, bounds, loopAnimation) {
    var maxItemsToAnimate = bounds.max - bounds.min;
    var animationIndex = 0; //Tracks index in animation sequence to set delay.

    while(bounds.min <= itemIndex && itemIndex <= bounds.max && animationIndex <= maxItemsToAnimate) {
      _animateItem(itemsToAnimate, animation, itemIndex, null, animationIndex++);

      nextIndex = itemIndex + step;
      if (nextIndex > itemsToAnimate.length - 1) nextIndex %= itemsToAnimate.length;
      else if (nextIndex < 0) nextIndex += itemsToAnimate.length;

      //Check it items have looped from end to beginning if moving forward or vice versa
      if (Math.abs(itemIndex - nextIndex) > 1 && !loopAnimation) return;
      itemIndex = nextIndex;
    }
  }

  var SliderAnimations = { 
    'wave': function ( _options ) {
      _animateInDirection(
        _options['itemsToAnimate'],
        _options['animation'],
        _options['index'],
        _options['step'],
        _options['bounds'],
        _options['loopAnimation']
      );

      if(_options['animateBothDirections']) {
        _animateInDirection(
          _options['itemsToAnimate'],
          _options['animation'],
          _options['index'],
          _options['step'] * -1,
          _options['bounds'],
          _options['loopAnimation']
        );
      }
    }

  }

  module.exports = SliderAnimations;
});
