define(function(require, exports, module) {
  var ImageSurface = require('famous/core/ImageSurface');

  /*
   * The most Basic Slide: a surface.
   */
  function ImageSlide (options, documentFragment) {
    ImageSurface.call(this, {
      content: documentFragment,
      size: [true, true]
    });
  }

  ImageSlide.prototype = Object.create(ImageSurface.prototype);
  ImageSlide.prototype.constructor = ImageSlide;

  module.exports = ImageSlide;
});
