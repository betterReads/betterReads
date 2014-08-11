define(function(require, exports, module) {
  var View      = require('famous/core/View');
  var Surface   = require('famous/core/Surface');

  /*
   * @name ResponsiveSlide
   * @constructor
   * @description
   */
  function ResponsiveSlide(options, documentFragment) {
      View.apply(this, arguments);

      this.slide; //Slide containing content to be displayed
      this.init(documentFragment);
  }

  ResponsiveSlide.prototype = Object.create( View.prototype );
  ResponsiveSlide.prototype.constructor = ResponsiveSlide;

  ResponsiveSlide.DEFAULT_OPTIONS = {
    'responsiveSlideBackgroundSize'     : 'cover',
    'responsiveSlideBackgroundPosition' : '50% 50%',
    'responsiveSlideBackgroundRepeat'   : 'no-repeat'
  }

  ResponsiveSlide.prototype.init = function(documentFragment) {
    _createSlide.call(this, documentFragment)
  }

  function _createSlide(documentFragment) {
    //For images, set the image as background image of a surface.
    if (documentFragment.tagName === 'IMG') {
      var url = documentFragment.src;
      this.slide  = new Surface({
        properties: {
          backgroundImage: 'url("'+url+'")',
          backgroundSize: this.options['responsiveSlideBackgroundSize'],
          backgroundPosition: this.options['responsiveSlideBackgroundPosition'],
          backgroundRepeat: this.options['responsiveSlideBackgroundRepeat'],
          properties: {'overflow' : 'hidden'}
        }
      });
    }
    //Otherwise, use the document fragment as the content directly
    else {
      this.slide  = new Surface({
        content: documentFragment,
        properties: {'overflow' : 'hidden'}
      });
    }

    this.add(this.slide);
    this.slide.pipe(this._eventOutput);
  }

  ResponsiveSlide.prototype.getSize = function() {
    return this.slide.getSize();
  }

  ResponsiveSlide.prototype.setSize = function(size) {
    this.slide.setSize(size);
  }

  module.exports = ResponsiveSlide;
});
