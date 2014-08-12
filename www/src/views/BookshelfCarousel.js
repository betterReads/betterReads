define(function(require, exports, module){
  'use strict'
  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var StateModifier = require('famous/modifiers/StateModifier');
  var Transform = require('famous/core/Transform');
  var Modifier = require('famous/core/Modifier');
  var ImageSurface = require('famous/surfaces/ImageSurface');
  var SequentialLayout = require('famous/views/SequentialLayout');

  // var Slider = require('prototypes/Slider');
  var Carousel = require('carousel/Carousel');
  var CoverflowLayout = require('../carousel/layouts/Coverflow');
  var Sequential = require('../carousel/layouts/Sequential');

  function BookshelfCarousel(options){
    View.apply(this, arguments);

    _addCarousel.call(this);
  }

  BookshelfCarousel.prototype = Object.create(View.prototype);
  BookshelfCarousel.prototype.constructor = BookshelfCarousel;

  BookshelfCarousel.DEFAULT_OPTIONS = {
    covers: []
  };

  function _addCarousel(){
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

    // var bookshelf = new Slider({
    //   slides: coverSurfaces,
    //   extensions: [],
    //   inputs: ['touch', 'scroll'],
    //   layout: { 
    //     type: 'coverflow',
    //     perspective: 400,
    //     options:  {
    //       curve: { 
    //         curve: 'outExpo',
    //         duration: 1000,
    //       },
    //       x1percent: 0.35,
    //       y1percent: -2.5,
    //       radiusPercent: 3,
    //       x1dimension: 'x',
    //       y1dimension: 'z',
    //       stepOffset: (0.5*Math.PI),
    //       offset: [0, 100, 0]
    //     }
    //   },
    //   // threshold: .5,
    //   loop: false,
    //   sliderDots: { 
    //     dotsVisible: false,
    //   },
    //   pagination: 1
    // });

    var bookshelf = new Carousel({
      items: coverSurfaces,
      touchEnabled: true,
      scrolEnabled: true,
      arrowsEnabled: false,
      loop: false,
      contentLayout: CoverflowLayout,
      carouselSize: ['100%', '100%']
    });

    var bookshelfModifier = new StateModifier({
      origin: [0.5, 0],
      align: [0.5, 0]
    });

    // var backdrop = new Surface({
    //   size: [undefined, undefined],
    //   properties: {
    //     backgroundColor: 'black'
    //   }
    // });

    // this.add(backdrop);
    this.add(bookshelfModifier).add(bookshelf);
  }

  module.exports = BookshelfCarousel;
});
