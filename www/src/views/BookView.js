define(function(require, exports, module){
  'use strict';

  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var Transform = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ImageSurface = require('famous/surfaces/ImageSurface');
  var ScrollView = require('famous/views/Scrollview');
  var Modifier = require('famous/core/Modifier');
  var WaitingView = require('views/WaitingView');
  var betterReads = require('../utils/BetterReads');

  var test;

  function ShelfView(){
    View.apply(this, arguments);

    // _addPlaceholder.call(this);
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

  ShelfView.prototype.getBook = function(id, add, type){
    this._eventOutput.emit('loadingContent');
    test = true;
    while (test) {
      test = this.details.goToPreviousPage();
    }

    if (type==='isbn') { 
      betterReads.getBookDetail({isbn: id})
      .then(function(data){
        var book = JSON.parse(data);
        this.book = book;
        console.log(book);

        var title = '<div style="font-size: 18px; font-weight: bold; color: #0096B3; text-decoration: underline;" onClick="javascript: window.open(\'' + book.url[0] + '\', \'_system\'); event.stopPropagation();">' + book.title[0] + '</div>';
        var author = book.authors[0].author[0].name[0];
        var description = book.description[0];
        var rating = 'Rating: ' + book.average_rating[0] + '/5';

        this.button.bookId = book.id[0];
        this.titleSurface.setContent(title);
        this.authorSurface.setContent(author);
        this.descriptionSurface.setContent(description);
        this.ratingSurface.setContent(rating);

        if (add && this.detailsList.length===5) {
          this.detailsList.unshift(this.buttonView);
        } else if (!add && this.detailsList.length===6) {
          this.detailsList.shift();
        }

        this._eventOutput.emit('contentLoaded');
        this.detailsModifier.setOpacity(1);
      }.bind(this));
    } else {
      betterReads.getBookDetail({book_id: id})
      .then(function(data){
        var book = JSON.parse(data);
        this.book = book;
        console.log(book);
        
        var title = '<div style="font-size: 18px; font-weight: bold; color: #0096B3; text-decoration: underline;" onClick="javascript: window.open(\'' + book.url[0] + '\', \'_system\'); event.stopPropagation();">' + book.title[0] + '</div>';
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
        
        if (add && this.detailsList.length===5) {
          this.detailsList.unshift(this.buttonView);
        } else if (!add && this.detailsList.length===6) {
          this.detailsList.shift();
        }

        this._eventOutput.emit('contentLoaded');
        this.detailsModifier.setOpacity(1);
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
    this.detailsList = [];

    //set up option to include 'add book' button
    var start = 2;
    this.buttonView = new View({
      size: [undefined, 40]
    });
    var buttonMod = new Modifier({
      transform: Transform.translate(0, 0, 2)
    });
    this.button = new Surface({
      content: 'Add to "To Read" shelf',
      size: [undefined, true],
      classes: ['clickButton'],
      properties: {
        backgroundColor: '#0096B3',
        color: 'white',
        textAlign: 'center',
        padding: '10px 10px',
        border: '1px solid white'
      }
    });
    this.buttonView.add(this.buttonMod).add(this.button);
    this.detailsList.push(this.buttonView);

    this.shareView = new View({
      size: [undefined, 40]
    });
    this.share = new Surface({
      content: '<b>Share this book</b>',
      size: [undefined, true],
      classes: ['clickButton'],
      properties: {
        backgroundColor: '#0096B3',
        color: 'white',
        textAlign: 'center',
        padding: '10px 10px',
        border: '1px solid white'
      }
    });
    this.shareMod = new Modifier({
      transform: Transform.translate(0, 0, 3)
    });
    this.shareView.add(this.shareMod).add(this.share);
    this.detailsList.push(this.shareView);

    this.share.parent = this;
    this.share.on('click', function() {
      console.log('clicked share');
      window.plugins.socialsharing.share('Check out this book on Better Reads!', null, this.parent.book.image_url[0], this.parent.book.url[0]);
    });  

    this.button.bookId = undefined;
    this.button.on('click', function() {
      this.setProperties({
        backgroundColor: '#F28A75'
      });
      var _this = this;
      setTimeout(function() {
        _this.setProperties({
          backgroundColor: '#0096B3'
        });
      }, 100);

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
    this.detailsList.push(this.titleSurface);

    this.authorSurface = new Surface({
      size: this.options.detailSize,
      properties: this.options.detailCenter
    });
    this.detailsList.push(this.authorSurface);

    this.ratingSurface = new Surface({
      size: this.options.detailSize,
      properties: this.options.detailCenter
    });
    this.detailsList.push(this.ratingSurface);

    this.descriptionSurface = new Surface({
      size: this.options.detailSize
    });
    this.detailsList.push(this.descriptionSurface);

    this.detailsModifier = new StateModifier({opacity: 0});
    this.details = window.scroll = new ScrollView();
    this.details.sequenceFrom(this.detailsList);
    this.add(this.detailsModifier).add(this.details);

    for(var i = start; i < this.detailsList.length; i++){
      this.detailsList[i].setProperties(this.options.detailStyle);
      this.detailsList[i].pipe(this.details);
      this.detailsList[i].pipe(this);
    }

  }

  function _bindEvents(){
    this._eventInput.on('showBook', function(eventPayload){
      this.getBook(eventPayload.id, eventPayload.add);
    }.bind(this));
  }

  module.exports = ShelfView;
});
