define(function(require, exports, module){
  'use strict';

  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var ImageSurface = require('famous/surfaces/ImageSurface');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ScrollView = require('famous/views/ScrollView');

  var BookshelfCarousel = require('views/BookshelfCarousel');

  var betterReads = require('../utils/BetterReads');

  function LibraryView(shelf, autoload){
    View.apply(this, arguments);

    _addBooks.call(this, shelf, autoload);
  }

  LibraryView.prototype = Object.create(View.prototype);
  LibraryView.prototype.constructor = LibraryView;

  LibraryView.DEFAULT_OPTIONS = {};

  function _addBooks(shelf, autoload){
    if (shelf) {
      var params = {id: '4067289', shelf: shelf.name, page: 1, per_page: 50};
    } else {
      var params = {id: '4067289', page: 1, per_page: 50, sort: 'position'};
    }

    betterReads.getBooks(params)
    .then(function(data) {
      var books = JSON.parse(data);
      console.log(books);

      var bookData = [];
      for(var i = 0; i < books.length; i++){
        var url = books[i].image_url[0];
        var id = books[i].id[0]._;
        var book = {
          url: url,
          id: id
        }
        bookData.push(book);
      }

      this.bookshelf = new BookshelfCarousel({books: bookData});
      this.add(this.bookshelf);
      this.bookshelf.pipe(this);
      this._eventInput.on('showBook', function(payload){
        this._eventOutput.emit('showBook', payload);
      }.bind(this));
      this._eventInput.on('navigate', function(payload){
        this._eventOutput.emit('navigate', payload);
      }.bind(this));

      if (autoload) {
        this._eventOutput.emit('shelfLoaded', shelf);
      }
    }.bind(this));
  }


  module.exports = LibraryView;
});
