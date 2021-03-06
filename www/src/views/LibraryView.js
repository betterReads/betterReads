define(function(require, exports, module){
  'use strict';

  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var ImageSurface = require('famous/surfaces/ImageSurface');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ScrollView = require('famous/views/Scrollview');

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
      var params = {id: betterReads.userId, shelf: shelf.name, page: 1, per_page: 50};
    } else {
      var params = {id: betterReads.userId, page: 1, per_page: 50, sort: 'position'};
    }

    betterReads.getBooks(params)
    .then(function(data) {
      var books = JSON.parse(data);
      console.log(books);

      var bookData = [];
      for(var i = 0; i < books.length; i++){
        var url = books[i].image_url[0];
        var id = books[i].id[0]._;
        var title = books[i].title[0];
        var author = books[i].authors[0].author[0].name[0];
        var rating = books[i].average_rating[0];
        var book = {
          url: url,
          id: id,
          title: title,
          author: author,
          rating: rating
        }
        bookData.push(book);
      }


      if (shelf) {
        var background = shelf.color;
        var shelfView = new View();
        var shelfSurface = new Surface({
          content: '<b>' + shelf.name + '</b> <font color="#403E39"> ' + shelf.count + ' books </font>',
          size: [undefined, true],
          properties: {
            textAlign: 'center',
            padding: '10px'
            // backgroundColor: background
          }
        });
        shelfView.add(shelfSurface);
        this.add(shelfView);
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
