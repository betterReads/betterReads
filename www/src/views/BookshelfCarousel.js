define(function(require, exports, module){
  'use strict'
  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var StateModifier = require('famous/modifiers/StateModifier');
  var Transform = require('famous/core/Transform');
  var Modifier = require('famous/core/Modifier');
  var ImageSurface = require('famous/surfaces/ImageSurface');
  var SequentialLayout = require('famous/views/SequentialLayout');

  var Slider = require('prototypes/Slider');

  function BookshelfCarousel(){
    View.apply(this, arguments);

    _addSlider.call(this);
  }

  BookshelfCarousel.prototype = Object.create(View.prototype);
  BookshelfCarousel.prototype.constructor = BookshelfCarousel;

  BookshelfCarousel.DEFAULT_OPTIONS = {
    covers: []
  };

  function _addSlider(){
    var cover;
    var coverSurfaces = [];
    for(var i = 0; i < this.options.covers.length; i++){
      cover = new ImageSurface({
        size: [100, 150],
        content: this.options.covers[i]
      });
      coverSurfaces.push(cover);
    }

    // var layout = new SequentialLayout();
    // layout.sequenceFrom(coverSurfaces);
    // this.add(layout);

    var bookshelf = new Slider({
      slides: coverSurfaces,
      loop: false,
      extensions: [],
      sliderSize: ['50%', '50%'],
      contentOrigin: [0, 0],
      contentAlign: [0, 0],
      inputs: ['touch'],
      layout: {
        type: 'coverflow',
        options:  {
          curve: { 
            curve: 'outExpo',
            duration: 1000,
          },
          x1percent: 0.25,
          y1percent: -1,
          radiusPercent: .75,
          x1dimension: 'x',
          y1dimension: 'z',
        }
      }
    });

    this.add(bookshelf);
  }

  module.exports = BookshelfCarousel;
});
