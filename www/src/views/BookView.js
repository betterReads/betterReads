define(function(require, exports, module){
  'use strict';

  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ScrollView = require('famous/views/ScrollView');

  var betterReads = require('../utils/BetterReads');

  function ShelfView(){
    View.apply(this, arguments);

    _addContents.call(this);
    _bindEvents.call(this);
  }

  ShelfView.prototype = Object.create(View.prototype);
  ShelfView.prototype.constructor = ShelfView;

  ShelfView.DEFAULT_OPTIONS = {
    title: 'Some Book'
  };

  ShelfView.prototype.getBook = function(id){
    betterReads.getBookDetail({book_id: id})
    .then(function(data){
      console.log(data);
    });
  };

  function _addContents(){
    this.titleSurface = new Surface({
      size: [undefined, undefined],
      content: this.options.title,
      properties: {
        backgroundColor: 'white',
        color: 'crimson'
      }
    });

    this.add(this.titleSurface);
  }

  function _bindEvents(){
    this._eventInput.on('showBook', function(eventPayload){
      // console.log(eventPayload);
      this.getBook(eventPayload.id);
      // this.titleSurface.setContent(eventPayload.title);
    }.bind(this));
  }

  module.exports = ShelfView;
});
