define(function(require, exports, module){
  'use strict';

  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var Transform = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ImageSurface = require('famous/surfaces/ImageSurface');
  var ScrollView = require('famous/views/ScrollView');
  var Modifier = require('famous/core/Modifier');

  var WaitingView = require('views/WaitingView');

  var betterReads = require('../utils/BetterReads');

  function ShelfView(){
    View.apply(this, arguments);

    _addPlaceholder.call(this);
    _addContents.call(this);
    _bindEvents.call(this);
  }

  ShelfView.prototype = Object.create(View.prototype);
  ShelfView.prototype.constructor = ShelfView;

  ShelfView.DEFAULT_OPTIONS = {
    title: 'Some Book',
    detailSize: [undefined, true],
    detailStyle: {
      backgroundColor: '#EFF9FF',
      color: 'black',
      padding: '10px'
    },
    detailCenter: {textAlign: 'center'}
  };

  ShelfView.prototype.getBook = function(id, type){
    this.loadingView.show();
    this.detailsModifier.setOpacity(0);

    if (type==='isbn') { 
      betterReads.getBookDetail({isbn: id})
      .then(function(data){
        var book = JSON.parse(data);
        console.log(book);

        var title = book.title[0];
        var author = book.authors[0].author[0].name[0];
        var description = book.description[0];
        var rating = 'Rating: ' + book.average_rating[0] + '/5';

        this.button.bookId = book.id[0];
        this.titleSurface.setContent(title);
        this.authorSurface.setContent(author);
        this.descriptionSurface.setContent(description);
        this.ratingSurface.setContent(rating);

        
        this.detailsModifier.setOpacity(1);
        this.loadingView.hide();
      }.bind(this));
    } else {
      betterReads.getBookDetail({book_id: id})
      .then(function(data){
        var book = JSON.parse(data);
        console.log(book);

        var title = book.title[0];
        var author = book.authors[0].author[0].name[0];
        var description = book.description[0];
        var rating = 'Rating: ' + book.average_rating[0] + '/5';

        this.button.bookId = book.id[0];
        this.button.setContent('Add to "To Read" shelf');
        this.button.setProperties({backgroundColor: '#0096B3'});        
        this.titleSurface.setContent(title);
        this.authorSurface.setContent(author);
        this.descriptionSurface.setContent(description);
        this.ratingSurface.setContent(rating);
        
        this.detailsModifier.setOpacity(1);
        this.loadingView.hide();
      }.bind(this));
    }

  };

  function _addPlaceholder(){
    this.loadingView = new WaitingView();
    this.loadingViewModifier = new StateModifier({
      transform: Transform.translate(0, 0, -10),
    });
    this.add(this.loadingView);
  }

  function _addContents(){
    var detailsList = [];

    //set up option to include 'add book' button
    var start = 1;
    this.buttonView = new View({
      size: [undefined, 100]
    });    
    var buttonMod = new Modifier({
      size: [undefined, 100],
      transform: Transform.translate(0, 0, 2)
    });
    this.button = new Surface({
      content: 'Add to "To Read" shelf',
      size: [undefined, 30],
      properties: {
        backgroundColor: '#0096B3',
        color: 'white',
        textAlign: 'center',
        padding: '5px 5px'
      }
    });
    this.buttonView.add(this.buttonMod).add(this.button);
    detailsList.push(this.buttonView);

    this.button.bookId = undefined;
    this.button.on('click', function() {
      console.log('you clicked me');
      console.log(this.bookId);
      var _this = this;
      betterReads.addBook({bookId: this.bookId, shelf: 'to-read'}).then(function(response) {
        console.log(response);
        _this.setContent('Added to shelf');
        _this.setProperties({backgroundColor: '#2ecc71'});
      });
    });

    this.titleSurface = new Surface({
      size: this.options.detailSize,
      properties: this.options.detailCenter
    });
    detailsList.push(this.titleSurface);

    this.authorSurface = new Surface({
      size: this.options.detailSize,
      properties: this.options.detailCenter
    });
    detailsList.push(this.authorSurface);

    this.ratingSurface = new Surface({
      size: this.options.detailSize,
      properties: this.options.detailCenter
    });
    detailsList.push(this.ratingSurface);

    this.descriptionSurface = new Surface({
      size: this.options.detailSize
    });
    detailsList.push(this.descriptionSurface);

    this.detailsModifier = new StateModifier({opacity: 0});
    this.details = new ScrollView();
    this.details.sequenceFrom(detailsList);
    this.add(this.detailsModifier).add(this.details);

    for(var i = start; i < detailsList.length; i++){
      detailsList[i].setProperties(this.options.detailStyle);
      detailsList[i].pipe(this.details);
      detailsList[i].pipe(this);
    }

  }

  function _bindEvents(){
    this._eventInput.on('showBook', function(eventPayload){
      this.getBook(eventPayload.id, eventPayload.add);
    }.bind(this));
  }

  module.exports = ShelfView;
});
