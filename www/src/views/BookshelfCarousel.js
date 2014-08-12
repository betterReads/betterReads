define(function(require, exports, module){
  'use strict'
  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var StateModifier = require('famous/modifiers/StateModifier');
  var Transform = require('famous/core/Transform');
  var Modifier = require('famous/core/Modifier');
  var ImageSurface = require('famous/surfaces/ImageSurface');
  var SequentialLayout = require('famous/views/SequentialLayout');

  var Coverflow = require('views/Coverflow');

  function BookshelfCarousel(options){
    View.apply(this, arguments);

    _addCarousel.call(this);
  }

  BookshelfCarousel.prototype = Object.create(View.prototype);
  BookshelfCarousel.prototype.constructor = BookshelfCarousel;

  BookshelfCarousel.DEFAULT_OPTIONS = {
    covers: [],
    coverSize: [100, 150]
  };

  function _addCarousel(){
    var screenCenter = ((window.innerWidth/2) - (this.options.coverSize[0]/2));
    var coverCenter = this.options.coverSize[0]/2;
    this.bookshelf = new Coverflow({
      screenCenter: screenCenter,
      coverCenter: coverCenter
    });

    var cover;
    var coverSurfaces = [];
    for(var i = 0; i < this.options.covers.length; i++){
      cover = new ImageSurface({
        size: this.options.coverSize,
        content: this.options.covers[i]
      });
      coverSurfaces.push(cover);

      cover.pipe(this.bookshelf);
      cover.pipe(this);
    }
    this.bookshelf.sequenceFrom(coverSurfaces);

    this.bookshelfModifier = new StateModifier({
      size: [window.innerWidth, 150],
      origin: [0.5, 0.5],
      align: [0.5, 0.5],
      transform: Transform.translate(0, 0, 0)
    });

    this.add(this.bookshelfModifier).add(this.bookshelf);
  }

  module.exports = BookshelfCarousel;
});
