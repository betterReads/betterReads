define(function(require, exports, module) {
  var Transform = require('famous/core/Transform');
  var SingularHelper = require('./SingularHelper');

  module.exports = {
    defaultOptions: {

    },
    activate: function () { 

    },
    layout: function (options) {
      function current (item, containerSize, index, lastIndex) {
      }

      function last (item, containerSize, index, lastIndex) {
      }

      function other (item, containerSize) {
        item.opacity.set(0);
      }

      SingularHelper.layout.call(this, current, last, other);
    },
    deactivate: function () {
      
    }
});
