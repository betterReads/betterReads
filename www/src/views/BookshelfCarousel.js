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
    covers: []
  };

  function _addCarousel(){
    this.bookshelf = new Coverflow();

    var cover;
    var coverSurfaces = [];
    for(var i = 0; i < this.options.covers.length; i++){
      cover = new ImageSurface({
        size: [100, 150],
        content: this.options.covers[i]
      });
      coverSurfaces.push(cover);

      cover.pipe(this.bookshelf);
      cover.pipe(this);
    }

    this.bookshelf.sequenceFrom(coverSurfaces);

    this.add(this.bookshelf);
  }

  module.exports = BookshelfCarousel;
});
