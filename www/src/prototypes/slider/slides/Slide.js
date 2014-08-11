define(function(require, exports, module) {
  var Surface        = require('famous/core/Surface');

  /*
   * The most Basic Slide: a surface.
   */
  function Slide (options, documentFragment) {
    Surface.call(this, {
      content: documentFragment,
      size: [true, true]
    });
  }

  Slide.prototype = Object.create(Surface.prototype);
  Slide.prototype.constructor = Slide;

  module.exports = Slide;
});
