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

  function BSBookView(isbn, picUrl, autoload) {
    View.apply(this, arguments);
    _addDetail.call(this, isbn, picUrl, autoload);
  }

  BSBookView.prototype = Object.create(View.prototype);
  BSBookView.prototype.constructor = BSBookView;

  BSBookView.DEFAULT_OPTIONS = {};

  function _addDetail(isbn, picUrl, autoload){
    betterReads.getBookDetail({isbn: isbn}).then(function(data) {
      var bookData = JSON.parse(data);

      var image = new ImageSurface({
        size: [320, 480],
        origin: [0, 0],
        align: [0, 0]
      });
      image.setContent(picUrl);

      var opacityMod = new Modifier({
        opacity: 0.25
      });
      this.add(opacityMod).add(image);

      console.log(bookData);
      var view = new View({
        size: [undefined, true],
        detailSize: [undefined, true]
      });
      var scroll = new ScrollView({
        margin: 200
      });
      var scroll = new ScrollView();
      var text = new Surface({
        content: bookData.title[0] + '<br>' + bookData.authors[0].author[0].name[0] + '<br><br>' + bookData.average_rating[0] + '/5<br><br>' + bookData.description[0],
        properties: {
          size: [undefined, undefined],
          textAlign: 'center',
          padding: '20px'
        }
      });
      var textMod = new Modifier({
        opacity: 1.0,
        transform: Transform.translate(0, 0, 1)
      });
      view.add(textMod).add(text);
      scroll.sequenceFrom([view]);

      text.pipe(scroll);
      this.add(scroll);
      if (autoload) {
        this._eventOutput.emit('bookLoaded');
      }

    }.bind(this));
  }

  module.exports = BSBookView;
});