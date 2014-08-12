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
          var that = this;
          if (!this.clicked) {
            that.clicked = true;
            //get book detail
            betterReads.getBookDetail({isbn: that.content.ISBN}).then(function(data) {
              that.bookData = JSON.parse(data);

              console.log(that.bookData);

              that.text = new Surface({
                content: that.content.Title + '<br>' + that.content.Author + '<br><br>' + that.bookData.average_rating[0] + '/5<br><br>' + that.bookData.description[0] + '<br><br>Rank: #' + that.content.Rank,
                properties: {
                  size: [undefined, true],
                  textAlign: 'center',
                  backgroundColor: 'white'
                }
              });
              that.textMod = new Modifier({
                opacity: 0
              });
              that.imageMod.transformFrom(Transform.translate(0, 0, 1));
              that.imageMod.setSize([320, 480], {duration: 1500})

              that.textWrapper.add(that.textMod).add(that.text);
              setTimeout(function() {
                that.textMod.setOpacity(0.8, {duration: 300});
              }, 1200);

              that.text.parent = that;
              that.text.on('click', function() {
                //remove surface
                this.render = function() {
                  return null;
                };

                this.parent.clicked = false;
                this.parent.imageMod.setSize([100, 150], {duration: 1500})

                var _this = this;
                setTimeout(function() {
                  _this.parent.imageMod.transformFrom(Transform.translate(0, 0, 0));
                }, 1500);
              });

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
