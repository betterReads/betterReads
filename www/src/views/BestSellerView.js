define(function(require, exports, module){
  'use strict';

  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var ImageSurface = require('famous/surfaces/ImageSurface');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ScrollView = require('famous/views/ScrollView');
  var Transform = require('famous/core/Transform');
  var Easing = require('famous/transitions/Easing');
  var Modifier = require('famous/core/Modifier');

  var BookView = require('views/BookView');
  var betterReads = require('../utils/BetterReads');

  function BestSellerView(shelf, autoload){
    View.apply(this, arguments);

    _addBooks.call(this, shelf, autoload);
  }

  BestSellerView.prototype = Object.create(View.prototype);
  BestSellerView.prototype.constructor = BestSellerView;

  BestSellerView.DEFAULT_OPTIONS = {};

  function _addBooks(){
    betterReads.getTopUT()
    .then(function(books) {
      console.log(books);
      var scrollView = new ScrollView({
        detailSize: [undefined, true]
      });
      var listOfItems = [];

      var titleView = new View();
      var titleSurface = new Surface({
        content: '<b>USA Today Best Sellers</b>',
        size: [undefined, true],
        properties: {
          textAlign: 'center',
          padding: '3px',
          color: 'white',
          backgroundColor: '#0096B3'
        }
      });
      titleView.add(titleSurface);
      listOfItems.push(titleView);
      titleSurface.pipe(this);
      titleSurface.pipe(scrollView);

      var parent = this;
      for (var i = 0; i < books.length; i++) {
        var bookView = new View();
        var bookMod = new StateModifier({
          size: [undefined, 150]
        });

        var tab = new Surface({
          content: '<b>#' + books[i].Rank + '</b><br>' + books[i].Title + '<br>' + books[i].Author,
          size: [undefined, undefined],
          properties: {
            textAlign: 'right',
            backgroundColor: 'white',
            padding: '10px 10px 10px 110px'
          }
        });

        var image = new ImageSurface({});
        image.clicked = false;
        image.content = books[i];
        image.setContent(books[i].URL);

        image.imageMod = new Modifier({
          size: [100, 150]
        });

        //fill screen with image
        image.on('click', function() {
          if (!this.clicked) {
            this.emit('bestSellerClick', this);
            this.clicked = true;
            this.imageMod.transformFrom(Transform.translate(0, 0, 1));
            this.imageMod.setSize([320, 480], {duration: 1500, curve: Easing.inOutCubic});
          } else {
            this.clicked = false;
            this.imageMod.setSize([100, 150], {duration: 1500})

            var that = this;
            setTimeout(function() {
              that.imageMod.transformFrom(Transform.translate(0, 0, 0));
            }, 1500);
          }
        });

        var bookWrapper = bookView.add(bookMod);
        image.textWrapper = bookWrapper.add(image.imageMod);
        image.textWrapper.add(image);
        bookWrapper.add(tab);

        listOfItems.push(bookView);
        image.pipe(scrollView);
        image.pipe(this);

      }
      this._eventInput.on('bestSellerClick', function(book) {
        console.log('book', book);
        this._eventOutput.emit('bestSellerClick', book);
      }.bind(this));

      //listen to resize
      // this._eventOutput.on('resize', function() {
      //   console.log('resize image output');
      // });

      scrollView.sequenceFrom(listOfItems);
      this.add(scrollView);
    }.bind(this));
  }

  module.exports = BestSellerView;
});
