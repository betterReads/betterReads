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
      var params = {id: '4067289', shelf: shelf, page: 1, per_page: 50};
    } else {
      var params = {id: '4067289', page: 1, per_page: 50, sort: 'position'};
    }

    betterReads.getBooks(params)
    .then(function(data) {
      // var book = JSON.parse(data)[18];
      var books = JSON.parse(data);
      console.log(books);
      //need to change image size so it is whatever aspect ratio of book is; there is slight variance around 100:150
      // var image = new ImageSurface({
      //     size: [100, 150]
      // });
      // image.setContent(book.image_url[0]);
      // var imageModifier = new Modifier({
      //     origin: [0.5, 0.5]
      // });
      // this.add(imageModifier).add(image);

      // var scrollView = new ScrollView(this.options);
      // var listOfItems = [];

      // for (var i = 0; i < books.length; i++) {
      //   // var listItem = new ScrollItem(i);

      //   var bookView = new View();
      //   var bookMod = new StateModifier({
      //     size: [undefined, 150]
      //   });

      //   var tab = new Surface({
      //     content: books[i].title[0] + '<br>' + books[i].authors[0].author[0].name[0] + '<br>Rating: ' + books[i].average_rating + '/5',
      //     size: [undefined, undefined],
      //     properties: {
      //     textAlign: 'right',
      //     backgroundColor: 'white'
      //     }
      //   });

      //   var image = new ImageSurface({
      //     size: [100, 150]
      //   });
      //   image.setContent(books[i].image_url[0]);

      //   var bookWrapper = bookView.add(bookMod);
      //   bookWrapper.add(image);
      //   bookWrapper.add(tab);

      //   listOfItems.push(bookView);
      //   image.pipe(scrollView);
      //   image.pipe(this);
      // }

      // scrollView.sequenceFrom(listOfItems);
      // this.add(scrollView);

      // this._eventInput.on('scrollListItemClicked', function(eventPayload) {
      //   this._eventOutput.emit('navigate:modal', eventPayload);
      // }.bind(this));

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
