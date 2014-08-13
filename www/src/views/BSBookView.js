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

  function BSBookView(isbn, picUrl, autoload){
    View.apply(this, arguments);
    _addPicture.call(this, picUrl);
    _addDetail.call(this, isbn, autoload);
  }

  BSBookView.prototype = Object.create(View.prototype);
  BSBookView.prototype.constructor = BSBookView;

  BSBookView.DEFAULT_OPTIONS = {};

  function _addPicture(picUrl) {
    var image = new ImageSurface({
      size: [320, 480],
      origin: [0, 0],
      align: [0, 0]
    });
    image.setContent(picUrl);

    this.add(image);

    var opacityMod = new Modifier({
      opacity: 0.7
    });
    var white = new Surface({
      size: [320, 480],
      origin: [0, 0],
      align: [0, 0],
      properties: {
        backgroundColor: 'white',
      }
    });
    this.add(opacityMod).add(white);

  }

  function _addDetail(isbn, autoload){
    betterReads.getBookDetail({isbn: isbn}).then(function(data) {
      var bookData = JSON.parse(data);

      console.log(bookData);
      var view = new View({
        size: [undefined, true]
      });
      console.log(view);
      var scroll = new ScrollView({
        clipSize: 350
      });
      var text = new Surface({
        content: bookData.title[0] + '<br>' + bookData.authors[0].author[0].name[0] + '<br><br>' + bookData.average_rating[0] + '/5<br><br>' + bookData.description[0],
        properties: {
          textAlign: 'center',
          // backgroundColor: 'white',
          padding: '20px'
        }
      });
      var textMod = new Modifier({
        opacity: 1.0
      });
      view.add(textMod).add(text);
      console.log('size', view.getSize());
      scroll.sequenceFrom([view]);

      text.pipe(scroll);
      this.add(scroll);

    }.bind(this));
  }

  module.exports = BSBookView;
});
