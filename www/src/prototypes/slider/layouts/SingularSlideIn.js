define(function(require, exports, module) {
  var Transform     = require('famous/core/Transform');
  var TwoDim        = require('../../math/TwoDim');
  var Chainer       = require('../../modifier/Chainer');
  var SingularHelper = require('./SingularHelper');

  module.exports = {
    defaultOptions: { 
      duration: 600,
      curve: 'easeOut',
      delayFactor: 0.15,
      direction: 1 // 0 -> horizontal, 1 -> vertical
    },
    activate: function () {
      SingularHelper.center.call(this);
    },
    layout: function (options) {
      function current (item, containerSize, index, lastIndex) {
        var delay = options.duration * options.delayFactor;
        var duration = options.duration - delay;
        var transition;

        var offsetX;
        var offsetY;
        if(index > lastIndex) {
          if(options.direction === 0) {
            offsetX = containerSize[0];
            offsetY = 0;
          }
          else {
            offsetX = 0;
            offsetY = containerSize[1] * -1;
          }
          
        }
        else {
          if(options.direction === 0) {
            offsetX = containerSize[0] * -1;
            offsetY = 0;
          }
          else {
            offsetX = 0;
            offsetY = containerSize[1];
          }
        }

        //Initial values before 'in' transition
        item.parentSize.set(item.size);
        item.opacity.set(1);
        item.trans.set(Transform.translate(offsetX, offsetY));

        var transition = {
          duration: duration,
          curve: options.curve
        };

        item.opacity.delay(delay, function(){
          item.trans.set(Transform.translate(0, 0), transition)
        })
      }

      function last (item, containerSize, index, lastIndex) {
        var origin;
        var align;
        var rotationDirection;
        if(index > lastIndex) {
          if(options.direction === 0) {
            origin = [0, 0.5];
            align = [0, 0.5];
          }
          else {
            origin = [0.5, 1];
            align = [0.5, 1];
          }
          rotationDirection = 1;
        } 
        else {
          if(options.direction === 0) {
            origin = [1, 0.5];
            align = [1, 0.5];
          }
          else {
            origin = [0.5, 0];
            align = [0.5, 0];
          }
          rotationDirection = -1;
        }

        var transition = {
          duration: options.duration,
          curve: options.curve
        };

        //Set up and execute hinge animation.
        item.parentSize.set(item.size);
        item.origin.set(origin);
        item.align.set(align);

        if(options.direction === 0) {
          item.trans.set(Transform.rotateY(
            Math.PI / 4 * rotationDirection
          ), transition);
        }
        else {
          item.trans.set(Transform.rotateX(
            Math.PI / 3 * rotationDirection
          ), transition);
        }
        

        item.opacity.set(0, transition);
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
