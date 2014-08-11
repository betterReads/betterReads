define(function(require, exports, module) {
  var TwoDim = require('../math/TwoDim');
  var Transform = require('famous/core/Transform');

  /*
   *  @param chainDefinition {Array}
   *    [{
   *      transformCurrent: Transform,
   *      curve: transitionable curve defintion
   *    }]
   *  chainDefinition can take:
   *    - delay : delay the transition
   *    - transformFinal: a Transform.thenMove applied with the final positions, supplied
   *      by the layout
   *    - transformCurrent: transform.thenMove with the transform's current position.
   *    - currentIndex : current index
   *
   */
  module.exports = function exports(chainDefinition, transitionable, finalPosition, currentIndex) {

    if (!finalPosition) finalPosition = [0,0,0];

    for (var i = 0; i < chainDefinition.length; i++) {

      var moveDefinition = chainDefinition[i];

      var nextTransform = moveDefinition instanceof Array ? moveDefinition : 
        moveDefinition.transformFinal || moveDefinition.transformCurrent;

      var nextTransition = moveDefinition.curve;

      if (moveDefinition.delay) {
        if (typeof moveDefinition.delay === 'number') {
          transitionable.translate.delay(moveDefinition.delay);
        }
        else {
          transitionable.translate.delay(moveDefinition.delay(currentIndex || i));
        }
      }
      else if (moveDefinition.transformFinal) {
        transitionable.set(Transform.thenMove(nextTransform, finalPosition), nextTransition);
      }
      else {
        transitionable.set(Transform.thenMove(nextTransform, transitionable.translate.get()), nextTransition);
      }
    };
  }
});
