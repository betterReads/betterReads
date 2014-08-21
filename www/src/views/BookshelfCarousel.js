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

    var screenHeight = window.innerHeight;
    var screenWidth = window.innerWidth;
    var aspectRatio = screenHeight/screenWidth;
    this.options.focusZoomFactor = aspectRatio * 2;

    var coverHeight = Math.floor(screenHeight * 0.34);
    var coverWidth = Math.floor((coverHeight / 3) * 2);
    this.options.coverSize = [coverWidth, coverHeight];

    _addCarousel.call(this);
    _addInfo.call(this);
    _setFocus.call(this);
    _bindFocusEvents.call(this);
  }

  BookshelfCarousel.prototype = Object.create(View.prototype);
  BookshelfCarousel.prototype.constructor = BookshelfCarousel;

  BookshelfCarousel.DEFAULT_OPTIONS = {
    books: [],
    coverSize: [130, 195],
    snapSpeed: 300,
    focusAngle: 0.25,
    focusZoomFactor: 3
  };

  BookshelfCarousel.prototype.simplifyTitle = function(index){
    return this.options.books[index].title.match(/[\w\s'-]+/)[0]
  }

  BookshelfCarousel.prototype.focus = function(payload){
    this.focusIndex = payload.bookIndex;
    var book = this.options.books[this.focusIndex];
    var infoTitle = this.simplifyTitle(this.focusIndex);
    var infoAuthor = book.author;
    var infoRating = book.rating;
    this.info.setContent('<div  style="border: 1px solid #F28A75; color: #F28A75; box-shadow: 5px 5px 5px #888888"><span style="font-size: 22px;">' + infoTitle + '</span><br>' + infoAuthor + '<br>' + infoRating + '</div>');
    this.focusAnimation(this.focusAnimations[this.focusIndex]);
  }

  BookshelfCarousel.prototype.unfocus = function(payload){
    var index = payload.bookIndex;
    this.unfocusAnimation(this.focusAnimations[this.focusIndex]);
  }

  function _addInfo(){
    var infoView = new View({
      size: [undefined, window.innerHeight * 0.24]
    });
    var infoSurface = new Surface({
      size: infoView.getSize(),
      properties: {
        color: 'black',
        textAlign: 'center',
        padding: '15px'
      }
    });
    var infoModifier = new Modifier({
      origin: [0, 1],
      align: [0, 1],
      opacity: function(){
        return this.masterFocus.get();
      }.bind(this)
    });

    window.info = this.info = infoSurface;
    infoView.add(infoModifier).add(infoSurface);
    this.add(infoView);
  }

  function _addCarousel(){
    this.bookshelfContainer = new ContainerSurface();
    this.bookshelfContainer.context.setPerspective(500);

    var screenCenter = ((window.innerWidth/2) - (this.options.coverSize[0]/2));
    var coverCenter = this.options.coverSize[0]/2;

    this.bookshelf = new Carousel({
      screenCenter: screenCenter,
      coverCenter: coverCenter,
      margin: 10000,
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
    this.bookshelfContainer.add(new Modifier({origin: [0, 0.5], align: [0, 0.425]})).add(this.bookshelf);
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
    var spineWidth = this.options.coverSize[0] / 5;
    var spineStyle = 'style="'
      + 'position: relative; top: -50%; left: -50%; '
      + 'height: ' + (this.options.coverSize[1] * 2) + 'px; '
      + 'width: ' + (spineWidth * 2) + 'px; '
      + '-webkit-filter: blur(' + spineWidth + 'px)"'
    var spineView = new View({
      size: [spineWidth, this.options.coverSize[1]],
    });
    var spineSurface = new Surface({
      size: [spineWidth, this.options.coverSize[1]],
      content: '<img src="' + this.options.books[i].url + '" ' + spineStyle + '/>',
      properties: {
        background: '#999',
        overflow: 'hidden'
      }
    });
    var spineLayout = new Modifier({
      origin: [0.95, 0.5],
      align: [0, 0]
    });

    var maxFontSize = spineWidth * 0.7;
    var displayTitle = this.simplifyTitle(i);
    var displayTitleSize = Math.min(maxFontSize, Math.floor(this.options.coverSize[1]/(displayTitle.length) * 2));
    var displayTitleLineHeight = spineWidth / displayTitleSize;

    var spineTitleView = new View();
    var spineTitleSurface = new Surface({
      size: [this.options.coverSize[1], spineWidth],
      content: displayTitle,
      properties: {
        color: 'white',
        textAlign: 'center',
        lineHeight: displayTitleLineHeight,
        textShadow: '0px 0px 1px black',
        fontSize: displayTitleSize + 'px'
      }
    });
    var spineTitleRotation = new Modifier({
      transform: Transform.rotateZ(0.5*Math.PI)
    });
    var spineTitleLayout = new Modifier({
      origin: [0.5, 0],
      align: [0, 0]
    });
    spineTitleLayout.transformFrom(Transform.translate(0, -2.5, 1.5));

    var spineAnimator = new Modifier({
      transform: function(focus){
        var angle = ((-0.5 * Math.PI) + (focus.get() * this.options.focusAngle * Math.PI));
        return Transform.rotateY(angle);
      }.bind(this, focus)
    });

    spineView.add(spineLayout).add(spineSurface);
    spineTitleView.add(spineTitleRotation).add(spineTitleLayout).add(spineTitleSurface);

    var spineNode = new View().add(spineAnimator);
    spineNode.add(spineView);
    spineNode.add(spineTitleView);

    return spineNode;
  }

  function _setFocus(){
    this.focusIndex = 0;
    this.snapSpeed = this.bookshelf.scrollview.options.snapSpeed || 100;
    this.snapCurve = this.bookshelf.scrollview.options.snapCurve || 'easeInOut';
    this.focusTransition = {duration: this.snapSpeed, curve: this.snapCurve};
    this.masterFocus = new Transitionable(0);
    this.focusAnimation = function(book){
      book.focus.set(1, this.focusTransition);
      this.masterFocus.set(1, this.focusTransition);
    };
    this.unfocusAnimation = function(book){
      book.focus.set(0, this.focusTransition);
      this.masterFocus.set(0, this.focusTransition);
    };
  }

  function _bindFocusEvents(){
    this._eventInput.on('snap', this.focus.bind(this));
    this._eventInput.on('scrollStart', this.unfocus.bind(this));

    this.focus({bookIndex: this.focusIndex});
  }

  module.exports = BookshelfCarousel;
});
