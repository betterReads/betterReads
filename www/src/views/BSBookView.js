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

  function BSBookView(data, autoload) {
    View.apply(this, arguments);
    _addDetail.call(this, data.ISBN, data.URL, data.Amazon, data, autoload);
  }

  BSBookView.prototype = Object.create(View.prototype);
  BSBookView.prototype.constructor = BSBookView;

  BSBookView.DEFAULT_OPTIONS = {};

  function _addDetail(isbn, picUrl, link, details, autoload){
    betterReads.getBookDetail({isbn: isbn}).then(function(response) {
      var that = this;
      //handle bad requests
      if (response==='book not found' || response==='Bad Request') {
        console.log('book not found');

        var image = new ImageSurface({
          size: [320, 480],
          origin: [0, 0],
          align: [0, 0]
        });
        image.setContent(picUrl);

        var opacityMod = new Modifier({
          opacity: 0.2
        });
        this.add(opacityMod).add(image);

        var text = new Surface({
          content: '<a href="' + link + '" target="_system">' + details.Title + '</a><br>' + details.Author + '<br><br>' + details.BriefDescription + '<br><br>Additional Goodreads book detail not found',
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
        this.add(textMod).add(text);        

      } else {        
        var bookData = JSON.parse(response);

        var image = new ImageSurface({
          size: [320, 480],
          origin: [0, 0],
          align: [0, 0]
        });
        image.setContent(picUrl);

        var opacityMod = new Modifier({
          opacity: 0.2
        });
        this.add(opacityMod).add(image);

        console.log(bookData);
        var buttonView = new View({
          size: [undefined, true]
        });

        var view = new View({
          size: [undefined, true]
        });
        var scroll = new ScrollView({
          margin: 200
        });
        var scroll = new ScrollView();
        var button = new Surface({
          content: 'Add to "To Read" shelf',
          properties: {
            backgroundColor: '#0096B3',
            color: 'white',
            textAlign: 'center',
            padding: '5px 5px'
          }
        });
        var buttonMod = new Modifier({
          size: [undefined, true],
          transform: Transform.translate(0, 0, 2)
        });

        var text = new Surface({
          content: '<br><a href="' + link + '" target="_system">' + bookData.title[0] + '</a><br>' + bookData.authors[0].author[0].name[0] + '<br><br>' + bookData.average_rating[0] + '/5<br><br>' + bookData.description[0],
          properties: {
            size: [undefined, true],
            textAlign: 'center',
            padding: '20px'
          }
        });
        var textMod = new Modifier({
          opacity: 1.0,
          transform: Transform.translate(0, 0, 1)
        });
        var viewMod = view.add(textMod)
        viewMod.add(text);
        // viewMod.add(buttonMod).add(button);
        buttonView.add(buttonMod).add(button);

        that.grId = bookData.id[0];
        button.on('click', function() {
          console.log('clicked the button');
          var _this = this;
          betterReads.addBook({bookId: that.grId, shelf: 'to-read'}).then(function(response) {
            console.log(response);
            _this.setContent('Added to shelf');
            _this.setProperties({backgroundColor: '#2ecc71'});
          });
        });

        scroll.sequenceFrom([buttonView, view]);

        text.pipe(scroll);
        this.add(scroll);
      }
      text.on('click', function() {
        that._eventOutput.emit('loadBestSellers');
      });
      if (autoload) {
        this._eventOutput.emit('bookLoaded');
      }

    }.bind(this));

  }

  module.exports = BSBookView;
});
