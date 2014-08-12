define(function(require, exports, module) {

  /*
   *  Using custom transitionables on a modifier,
   *  @param modifierObject {Object} an object of Transitionables that will be coordinated.
   *  @param animationData {Object}
   *    {
   *      {{ transitionableKey1 }} : [
   *        {
   *          value: {Function|Array|Number},
   *          transition: {Object?},        //optional
   *          callback: {Function?}         // optional
   *        },
   *        {
   *          delay:
   *        // as many as you want chained.
   *      ],
   *      {{ transitionableKey2..}}: [ {{ same as above}} ];
   *
   *  @method JSONToModifier
   */
  function JSONToModifier( modifierObject, animationData) {
    for (var key in animationData) {
      var transitionable = modifierObject[key];
      var sequence = animationData[key];
      for (var i = 0; i < sequence.length; i++) {
        var sequenceData = sequence[i];
        if (sequenceData['delay']) {
          var delay = functionOrValue(sequenceData['delay']);
          transitionable.delay(delay, sequenceData.callback);
        }
        else {
          var value = functionOrValue(sequenceData['value']);
          transitionable.set(value, sequenceData.transition, sequenceData.callback);
        }
      };
    };
  }

  /*
   *  Helper. Return called function (to get value) or the value.
   *  @param maybeValue {Function|Array|Number}
   *  @return {Array|Number}
   *  @method functionOrValue
   */
  function functionOrValue ( maybeValue ) {
    return typeof maybeValue === 'function' ?
      maybeValue() :
      maybeValue;
  }

  module.exports = JSONToModifier;

});
