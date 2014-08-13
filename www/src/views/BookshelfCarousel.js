define(function(require, exports, module){
  'use strict'
  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var StateModifier = require('famous/modifiers/StateModifier');
  var Transform = require('famous/core/Transform');
  var Modifier = require('famous/core/Modifier');
  var ContainerSurface = require('famous/surfaces/ContainerSurface');
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
    this.bookshelfContainer = new ContainerSurface();
    this.bookshelfContainer.context.setPerspective(500);

    var screenCenter = ((window.innerWidth/2) - (this.options.coverSize[0]/2));
    var coverCenter = this.options.coverSize[0]/2;
    this.bookshelf = new Coverflow({
      screenCenter: screenCenter,
      coverCenter: coverCenter
    });

    var cover;
    var coverViews = [];
    for(var i = 0; i < this.options.covers.length; i++){
      var coverView = new View();

      var coverModifier = new StateModifier({
        transform: Transform.rotateY(0.15*Math.PI)
      });

      cover = new ImageSurface({
        size: this.options.coverSize,
        content: this.options.covers[i]
      });

      coverView.add(coverModifier).add(cover);

      coverViews.push(coverView);

      cover.pipe(this.bookshelf);
      cover.pipe(this);
    }
    this.bookshelf.sequenceFrom(coverViews);

    this.bookshelfModifier = new StateModifier({
      size: [window.innerWidth, 150],
      origin: [0.5, 0.5],
      align: [0.5, 0.5],
      transform: Transform.translate(0, 0, 0)
    });

    this.add(this.bookshelfContainer);
    this.bookshelfContainer.add(this.bookshelfModifier).add(this.bookshelf);
  }

  module.exports = BookshelfCarousel;
});
