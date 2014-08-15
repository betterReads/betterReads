define(function(require, exports, module){
  'use strict'
  var View = require('famous/core/View');
  var Modifier = require('famous/core/Modifier');
  var RenderNode = require('famous/core/RenderNode');
  var Surface = require('famous/core/Surface');
  var Transform = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ContainerSurface = require('famous/surfaces/ContainerSurface');
  var ImageSurface = require('famous/surfaces/ImageSurface');
  var Easing = require('famous/transitions/Easing');
  var Transitionable = require('famous/transitions/Transitionable');
  var SequentialLayout = require('famous/views/SequentialLayout');

  var Coverflow = require('views/Coverflow');
  var Carousel = require('views/Carousel');

  function BookshelfCarousel(options){
    View.apply(this, arguments);

    _addCarousel.call(this);
    _setFocus.call(this);
    _bindFocusEvents.call(this);
  }

  BookshelfCarousel.prototype = Object.create(View.prototype);
  BookshelfCarousel.prototype.constructor = BookshelfCarousel;

  BookshelfCarousel.DEFAULT_OPTIONS = {
    books: [],
    coverSize: [100, 150],
    snapSpeed: 500,
    focusAngle: 0.25,
    focusZoomFactor: 3
  };

  function _addCarousel(){
    this.bookshelfContainer = new ContainerSurface();
    this.bookshelfContainer.context.setPerspective(500);

    var screenCenter = ((window.innerWidth/2) - (this.options.coverSize[0]/2));
    var coverCenter = this.options.coverSize[0]/2;

    this.bookshelf = new Carousel({
      screenCenter: screenCenter,
      coverCenter: coverCenter,
      margin: 5000,
      rotateX: 0.0,
      rotateY: 0.0,
      rotateZ: 0.0,
      translateX: 0.0,
      translateY: 0.0,
      translateZ: -250.0,
      depth: 0.0,
      scale: 0.0,
      easing: Easing.outCubic
    });

    this.focusAnimations = [];
    for(var i = 0; i < this.options.books.length; i++){
      var nodeView = new View();
      var focusTransition = new Transitionable(0);

      var cover = new ImageSurface({
        size: this.options.coverSize,
        content: this.options.books[i].url
      });
      var coverLayout = new Modifier({
        origin: [0, 0.5],
        align: [0, 0]
      });
      var coverAnimator = new Modifier({
        transform: function (trans){
          var angle = ((trans.get()) * (this.options.focusAngle) * (Math.PI));
          return Transform.rotateY(angle);
        }.bind(this, focusTransition)
      });

      var spine = new Surface({
        size: [this.options.coverSize[0]/5, this.options.coverSize[1]],
        content: 'title',
        properties: {
          background: 'crimson'
        }
      });
      var spineLayout = new Modifier({
        origin: [1, 0.5],
        align: [0, 0]
      });
      var spineAnimator = new Modifier({
        transform: function(trans){
          var angle = ((-0.5 * Math.PI) + (trans.get() * this.options.focusAngle * Math.PI));
          return Transform.rotateY(angle);
        }.bind(this, focusTransition)
      });

      var title = new Surface({
        size: [undefined, true],
        content: 'THIS IS A TITLE',
        properties: {
          textAlign: 'center'
        }
      });
      var titleLayout = new Modifier({
        origin: [0.5, 0.5],
        align: [0.5, 1]
      });
      var titleAnimator = new Modifier({
        // opacity: function(trans){
          // return trans.get();
        // }.bind(null, focusTransition)
        opacity: 1  // TODO: Get transitionable opacity working
      });

      nodeView.add(coverLayout).add(coverAnimator).add(cover);
      nodeView.add(spineLayout).add(spineAnimator).add(spine);
      // nodeView.add(titleLayout).add(titleAnimator).add(title);
      
      var nodeSize = new Modifier({
        size: this.options.coverSize
      });
      var nodeLayout = new Modifier({
        origin: [0.5, 0.5],
        align:[0.5, 0]
      });
      var nodeAnimator = new Modifier({
        transform: function(trans){
          var offsetX = trans.get() * this.options.coverSize[0] * this.options.focusAngle;
          var offsetZ = offsetX * this.options.focusZoomFactor;
          return Transform.translate(offsetX, 0, offsetZ);
        }.bind(this, focusTransition)
      })

      var renderNode = new RenderNode({
        origin: [0, 0.5]
      });
      renderNode
        .add(nodeSize)
        .add(nodeLayout)
        .add(nodeAnimator)
        .add(nodeView);
      
      this.focusAnimations.push({
        focus: focusTransition
      });
      this.bookshelf.items.push(renderNode);

      cover.on('click', function(index){
        console.log('clicked book', this.options.books[index].id);
      }.bind(this, i));
    }

    this.add(this.bookshelfContainer);
    this.bookshelfContainer.add(new Modifier({origin: [0, 0.5], align: [0, 0.5]})).add(this.bookshelf);
    this.bookshelfContainer.pipe(this.bookshelf.scrollview);
    this.bookshelf.scrollview.pipe(this);
  }

  function _setFocus(){
    this.focusBook = 0;
    this.snapSpeed = this.bookshelf.scrollview.options.snapSpeed || 100;
    this.snapCurve = this.bookshelf.scrollview.options.snapCurve || 'easeInOut';
    this.focusTransition = {duration: this.snapSpeed, curve: this.snapCurve};
    this.focusAnimation = function(book){
      book.focus.set(1, this.focusTransition);
    };
    this.unfocusAnimation = function(book){
      book.focus.set(0, this.focusTransition);
    };
  }

  function _bindFocusEvents(){
    this._eventInput.on('snap', function(payload){
      this.focusBook = payload.bookIndex;
      console.log('focus:', this.focusBook);
      this.focusAnimation(this.focusAnimations[this.focusBook]);
    }.bind(this));

    this._eventInput.on('scrollStart', function(payload){
      var index = payload.bookIndex;
      console.log('unfocus:', this.focusBook);
      this.unfocusAnimation(this.focusAnimations[this.focusBook]);
    }.bind(this));

    this.focusAnimation(this.focusAnimations[this.focusBook]);
  }

  module.exports = BookshelfCarousel;
});
