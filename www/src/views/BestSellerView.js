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
      var scrollView = new ScrollView(this.options);
      var listOfItems = [];

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
            paddingRight: '10px'
          }
        });

        var image = new ImageSurface({});
        image.clicked = false;
        image.setContent(books[i].URL);

        image.imageMod = new Modifier({
          size: [100, 150]
        });

        //fill screen with image
        image.on('click', function() {
          if (!image.clicked) {
            image.clicked = true;
            this.imageMod.transformFrom(Transform.translate(0, 0, 1));
            this.imageMod.setSize([320, 480], {duration: 1500})
            // .setOrigin([.5, .5], {duration: 1500})
            // .setAlign([.5, .5], {duration: 1500});
          } else {
            image.clicked = false;
            this.imageMod.setSize([100, 150], {duration: 1500})
            // .setOrigin([0, 0], {duration: 1500})
            // .setAlign([0, 0], {duration: 1500});
            var that = this;
            setTimeout(function() {
              that.imageMod.transformFrom(Transform.translate(0, 0, 0));
            }, 1500);
          }

          
        });

        var bookWrapper = bookView.add(bookMod);
        bookWrapper.add(image.imageMod).add(image);
        bookWrapper.add(tab);

        listOfItems.push(bookView);
        image.pipe(scrollView);
        image.pipe(this);
      }

      scrollView.sequenceFrom(listOfItems);
      this.add(scrollView);
    }.bind(this));
  }

  module.exports = BestSellerView;
});
