define(function(require, exports, module) {
  var SingularHelper = require('./SingularHelper');

  module.exports = function SingularOpacity( options ) {
    return { 
      options: options,
      defaultOptions: {
        curve: { 
          curve: 'linear',
          duration: 200
        }
      },
      renderLimit: function () {
        return [1, 1];
      },
      activate: function (options) {
        SingularHelper.init.call(this, options.curve);
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
    }
  }
  
});
