define(function(require, exports, module){
  'use strict';

  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var Transform = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ImageSurface = require('famous/surfaces/ImageSurface');
  var ScrollView = require('famous/views/ScrollView');

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
      backgroundColor: 'white',
      color: 'crimson',
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
        var rating = book.average_rating[0];

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
        var rating = book.average_rating[0];

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

    for(var i = 0; i < detailsList.length; i++){
      detailsList[i].setProperties(this.options.detailStyle);
      detailsList[i].pipe(this.details);
      detailsList[i].pipe(this);
    }
  }

  function _bindEvents(){
    this._eventInput.on('showBook', function(eventPayload){
      this.getBook(eventPayload.id);
    }.bind(this));
  }

  module.exports = ShelfView;
});
