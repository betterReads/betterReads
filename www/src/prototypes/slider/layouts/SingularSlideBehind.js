define(function(require, exports, module) {
  var Transform     = require('famous/core/Transform');
  var TwoDim        = require('../../math/TwoDim');
  var Chainer       = require('../../modifier/Chainer');
  var SingularHelper = require('./SingularHelper');

  module.exports = {
    defaultOptions: { 
      duration: 750,
      firstCurve: 'easeInOut',
      secondCurve: 'easeInOut',
      rotationAngle: Math.PI / 6, //Rotate to be applied
      durationRatio: 1/3, //Ratio between durations of first & second transitions
      offsetFactor: 1/2, //Portion of image that is offset in animation
      zIndex: -500, //zIndex applied to translates
    },
    activate: function () {
      SingularHelper.center.call(this);
    },
    layout: function (options) {
      function current (item, containerSize, index, lastIndex) {
        var origin;
        var align;
        var rotationDirection;
        var offset;
        if(index > lastIndex) {
          origin = [0.5, 1];
          align = [0.5, 1];
          rotationDirection = 1;
          offset = item.size[1] * options.offsetFactor;
        } 
        else {
          origin = [0.5, 0];
          align = [0.5, 0];
          rotationDirection = -1;
          offset = item.size[1] * options.offsetFactor * -1;
        }

        var firstTransLength = options.duration * options.durationRatio;
        var secondTransLength = options.duration - firstTransLength;
        var transition1 = {
          duration: firstTransLength,
          curve: options.firstCurve
        }

         var transition2 = {
          duration: firstTransLength,
          curve: options.secondCurve
        }

        //Set up and execute hinge animation.
        item.parentSize.set(item.size);
        item.origin.set(origin);
        item.align.set(align);

        //Initialize
        item.opacity.set(1);
        item.trans.set(Transform.rotateX(options.rotationAngle * rotationDirection));
        item.parentTrans.set(Transform.translate(0, 0, options.zIndex));

        //Translate
        item.parentTrans.set(Transform.translate(0, offset, options.zIndex / 2), 
          transition1,
          function() {
            item.parentTrans.set(
                Transform.identity,
                transition2
              );
          }
        );

        // Rotate
        item.opacity.delay(firstTransLength, function(){
          item.trans.set(Transform.identity, transition2);
        });
      }

      function last (item, containerSize, index, lastIndex) {
        var origin;
        var align;
        var rotationDirection;
        var offset;
        if(index > lastIndex) {
          origin = [0.5, 0];
          align = [0.5, 0];
          rotationDirection = -1;
          offset = item.size[1] * options.offsetFactor * -1;
        } 
        else {
          origin = [0.5, 1];
          align = [0.5, 1];
          rotationDirection = 1;
          offset = item.size[1] * options.offsetFactor;
        }

        var firstTransLength = options.duration * options.durationRatio;
        var transition1 = {
          duration: firstTransLength,
          curve: options.firstCurve
        }

         var transition2 = {
          duration: options.duration - firstTransLength,
          curve: options.secondCurve
        }

        //Set up and execute hinge animation.
        item.parentSize.set(item.size);
        item.origin.set(origin);
        item.align.set(align);

        item.trans.set(
          Transform.rotateX(options.rotationAngle * rotationDirection),
          transition1
        );

        item.parentTrans.set(Transform.translate(0, offset), 
          transition1, 
          function(){
            item.parentTrans.set(Transform.translate(0, 0, options.zIndex), transition2);
          }
        );
      }

      function other (item, containerSize) {
        item.opacity.set(0);
      }

      SingularHelper.layout.call(this, current, last, other);
    },

    deactivate: function () {
      SingularHelper.cleanup.call(this);
    }
  }
});
