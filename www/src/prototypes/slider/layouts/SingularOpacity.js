define(function(require, exports, module) {
  var Transform     = require('famous/core/Transform');
  var TwoDim        = require('../../math/TwoDim');
  var Chainer       = require('../../modifier/Chainer');
  var SingularHelper = require('./SingularHelper');

  module.exports = {
    defaultOptions: {
      opacityIn: { 
        curve: 'linear',
        duration: 200
      }
    },
    activate: function () {
      SingularHelper.center.call(this);
    },
    layout: function (options) {
      function current (item, containerSize) {
        item.opacity.set(1, options.opacityIn);
      }

      function last (item, containerSize) {
        item.opacity.set(0, options.opacityIn);
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
