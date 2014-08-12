define(function(require, exports, module){
  'use strict';

  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var ImageSurface = require('famous/surfaces/ImageSurface');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ScrollView = require('famous/views/ScrollView');
  var LibraryView = require('views/LibraryView');

  var betterReads = require('../utils/BetterReads');

  function ShelfView(){
    View.apply(this, arguments);

    _addShelves.call(this);
  }

  ShelfView.prototype = Object.create(View.prototype);
  ShelfView.prototype.constructor = ShelfView;

  ShelfView.DEFAULT_OPTIONS = {};

  function _addShelves(){

    betterReads.getShelves({id: '4067289'})
    .then(function(data) {
      console.log('shelves');
      var books = JSON.parse(data);
      for (var i=0; i<books.length; i++) {
        console.log(books[i].name[0], books[i].book_count[0]._);
      }
      
      var scrollView = new ScrollView(this.options);
      var listOfItems = [];
      //colors for alternating
      var colors = ['white', '#EFF9FF'];
      for (var i = 0; i < books.length; i++) {
        var tab = new Surface({
          content: '<b>' + books[i].name[0] + '</b> <font color="#403E39"> ' + books[i].book_count[0]._ + ' books </font>',
          size: [undefined, true],
          properties: {
            textAlign: 'center',
            backgroundColor: colors[i%2],
            padding: '10px'
          }
        });


        // set up event listener to populate library view based on shelf clicked
        tab.data = books[i].name[0];
        listOfItems.push(tab);
        tab.on('click', function() {
          tab.emit('shelfClick', this.data);
          //create new view to display books from this shelf
          // var shelfView = new LibraryView(this.data);
        });

        tab.pipe(scrollView);
        tab.pipe(this);
      }

      scrollView.sequenceFrom(listOfItems);
      this.add(scrollView);   

      this._eventInput.on('shelfClick', function(shelf) {
        this._eventOutput.emit('shelfClick', shelf);
      }.bind(this));
    }.bind(this));
  }

  module.exports = ShelfView;
});
