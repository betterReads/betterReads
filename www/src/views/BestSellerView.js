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
        image.content = books[i];
        image.setContent(books[i].URL);

        image.imageMod = new Modifier({
          size: [100, 150]
        });

        //fill screen with image
        image.on('click', function() {
          if (!this.clicked) {
            this.text = new Surface({
              content: this.content.Title + '<br>' + this.content.Author + '<br><br>Summary: ' + this.content.BriefDescription + '<br><br>Rank: #' + this.content.Rank,
              properties: {
                textAlign: 'center',
                backgroundColor: 'white'
              }
            });
            this.textMod = new Modifier({
              opacity: 0,
              zIndex: 2
            });
            this.clicked = true;
            this.imageMod.transformFrom(Transform.translate(0, 0, 1));
            this.imageMod.setSize([320, 480], {duration: 1500})

            this.textWrapper.add(this.textMod).add(this.text);
            this.textMod.setOpacity(0.8, {duration: 1500});

            this.text.parent = this;
            this.text.on('click', function() {
              this.parent.textMod.setTransform(Transform.translate(0, 0, -1));
              this.parent.clicked = false;
              this.parent.imageMod.setSize([100, 150], {duration: 1500})

              var that = this;
              setTimeout(function() {
                that.parent.imageMod.transformFrom(Transform.translate(0, 0, 0));
              }, 1500);
            });
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

      scrollView.sequenceFrom(listOfItems);
      this.add(scrollView);
    }.bind(this));
  }

  module.exports = BestSellerView;
});
