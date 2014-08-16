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
    snapSpeed: 300,
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
      snapSpeed: this.options.snapSpeed,
      easing: Easing.outCubic
    });

    _addBooks.call(this);

    this.add(this.bookshelfContainer);
    this.bookshelfContainer.add(new Modifier({origin: [0, 0.5], align: [0, 0.5]})).add(this.bookshelf);
    this.bookshelfContainer.pipe(this.bookshelf.scrollview);
    this.bookshelf.scrollview.pipe(this);
  }

  function _addBooks(){
    this.focusAnimations = [];
    for(var i = 0; i < this.options.books.length; i++){
      var nodeView = new View();
      var focusTransitionable = new Transitionable(0);

      var cover = _createCover.call(this, i, focusTransitionable);
      var spine = _createSpine.call(this, i, focusTransitionable);

      nodeView.add(cover);
      nodeView.add(spine);
      
      var nodeSize = new Modifier({
        size: this.options.coverSize
      });
      var nodeLayout = new Modifier({
        origin: [0.5, 0.5],
        align:[0.5, 0]
      });
      var nodeAnimator = new Modifier({
        transform: function(focus){
          var offsetX = focus.get() * this.options.coverSize[0] * this.options.focusAngle;
          var offsetZ = offsetX * this.options.focusZoomFactor;
          return Transform.translate(offsetX, 0, offsetZ);
        }.bind(this, focusTransitionable)
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
        focus: focusTransitionable
      });
      this.bookshelf.items.push(renderNode);
    }
  }

  function _createCover(i, focus){
      var coverView = new View();
      var coverSurface = new ImageSurface({
        size: this.options.coverSize,
        content: this.options.books[i].url
      });
      var coverLayout = new Modifier({
        origin: [0, 0.5],
        align: [0, 0]
      });
      var coverAnimator = new Modifier({
        transform: function (focus){
          var angle = ((focus.get()) * (this.options.focusAngle) * (Math.PI));
          return Transform.rotateY(angle);
        }.bind(this, focus)
      });
      coverView.add(coverAnimator).add(coverLayout).add(coverSurface);

      coverSurface.on('click', function(index){
        var bookId = this.options.books[index].id;
        this._eventOutput.emit('showBook', {id: bookId});
        this._eventOutput.emit('navigate', {
          title: 'Book',
          showBackButton: true
        });
      }.bind(this, i));

      return coverView;
  }

  function _createSpine(i, focus){
      var spineView = new View({
        size: [this.options.coverSize[0]/5, this.options.coverSize[1]],
      });
      var spineSurface = new Surface({
        size: [this.options.coverSize[0]/5, this.options.coverSize[1]],
        content: '<img src="' + this.options.books[i].url + '" style="height: 300px; width: 40px; position: relative; top: -50%; left: -50%; -webkit-filter: blur(20px)"/>',
        properties: {
          background: '#999',
          overflow: 'hidden'
        }
      });
      var spineLayout = new Modifier({
        origin: [1, 0.5],
        align: [0, 0]
      });

      // console.log(this.options.books[i].title);
      var displayTitle = this.options.books[i].title.match(/[\w\s'-]+/)
      var spineTitleView = new View();
      var spineTitle = new Surface({
        size: [this.options.coverSize[1], this.options.coverSize[0]/5],
        content: displayTitle,
        properties: {
          color: 'white',
          textAlign: 'center',
          textShadow: '0px 0px 1px black'
        }
      });
      var spineTitleRotation = new Modifier({
        transform: Transform.rotateZ(0.5*Math.PI)
      });
      var spineTitleLayout = new Modifier({
        origin: [0.5, 0],
        align: [0, 0]
      });

      var spineAnimator = new Modifier({
        transform: function(focus){
          var angle = ((-0.5 * Math.PI) + (focus.get() * this.options.focusAngle * Math.PI));
          return Transform.rotateY(angle);
        }.bind(this, focus)
      });

      spineView.add(spineLayout).add(spineSurface);
      spineTitleView.add(spineTitleRotation).add(spineTitleLayout).add(spineTitle);

      var spineNode = new View().add(spineAnimator);
      spineNode.add(spineView);
      spineNode.add(spineTitleView);

      return spineNode;
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
