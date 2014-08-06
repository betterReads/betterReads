define(function(require, exports, module){
  'use strict';

  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var ImageSurface = require('famous/surfaces/ImageSurface');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ScrollView = require('famous/views/ScrollView');

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
      var colors = ['white', '#E5EBEB'];
      for (var i = 0; i < books.length; i++) {
        var tab = new Surface({
          content: books[i].name[0] + ': ' + books[i].book_count[0]._ + ' books',
          size: [undefined, 50],
          properties: {
            textAlign: 'center',
            backgroundColor: colors[i%2],
            lineHeight: '50px'
          }
        });

        listOfItems.push(tab);
        tab.pipe(scrollView);
        tab.pipe(this);
      }

      scrollView.sequenceFrom(listOfItems);
      this.add(scrollView);

      this._eventInput.on('scrollListItemClicked', function(eventPayload) {
        this._eventOutput.emit('navigate:modal', eventPayload);
      }.bind(this));
    }.bind(this));
  }

  module.exports = ShelfView;
});