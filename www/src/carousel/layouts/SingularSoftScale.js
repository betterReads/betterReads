define(function(require, exports, module) {
  var Transform     = require('famous/core/Transform');
  var Chainer       = require('../modifier/Chainer');
  var SingularHelper = require('./SingularHelper');

  module.exports = function SingularSoftScale (options) {
    return {
      options: options,
      defaultOptions: {
        duration: 600,
        curve: { 
          curve: 'outExpo', 
          duration: 600
        },
        scaleUpValue: 1.3,
        scaleDownValue: 0.9,
        delayRatio: 0.01, //Applied to duration to calculate delay
      },
      renderLimit: function () {
        return [1, 1]
      },
      activate: function (options) {
        SingularHelper.init.call(this, options.curve);
      },
      layout: function (options) {
        function current (item, containerSize, index, lastIndex) {
          var scaleAmount = (index > lastIndex) ? 
            options.scaleDownValue : 
            options.scaleUpValue;

          item.opacity.set(0);
          item.trans.set(Transform.scale(scaleAmount, scaleAmount));

          var delay = options.duration * options.delayRatio;
          var duration = options.duration - delay;

          var transition = {
            duration: duration,
            curve: 'easeOut'
          };

          item.opacity.delay(delay, function(){
            item.opacity.set(1, transition);
            item.trans.set(Transform.scale(1, 1), transition)
          });
        }

        function last (item, containerSize, index, lastIndex) {
          var scaleAmount = (index > lastIndex) ? 
            options.scaleUpValue : 
            options.scaleDownValue;

          var transition = {
            duration: options.duration,
            curve: 'easeOut'
          }

          item.trans.set(Transform.scale(scaleAmount, scaleAmount), transition);
          item.opacity.set(0, {
            duration: transition.duration * 0.45,
            curve: transition.curve
          });
        }

        function other (item, containerSize) {
          item.opacity.set(0);
        }

        SingularHelper.layout.call(this, current, last, other);
      }
    }
  }
});
