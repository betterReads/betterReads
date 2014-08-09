define(function(require, exports, module){
  'use strict';

  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var Transform = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
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
    title: 'Some Book'
  };

  ShelfView.prototype.getBook = function(id){
    this.loadingView.show();
    this.detailsModifier.setOpacity(0);

    betterReads.getBookDetail({book_id: id})
    .then(function(data){
      var book = JSON.parse(data);
      console.log(book);

      var title = book.title[0];
      this.titleSurface.setContent(title);
      
      this.detailsModifier.setOpacity(1);
      this.loadingView.hide();
    }.bind(this));

  };

  function _addPlaceholder(){
    this.loadingView = new WaitingView();
    this.loadingViewModifier = new StateModifier({
      transform: Transform.translate(0, 0, -10),
    });
    this.add(this.loadingView);
  }

  function _addContents(){    
    this.titleSurface = new Surface({
      size: [undefined, undefined],
      content: this.options.title,
      properties: {
        backgroundColor: 'white',
        color: 'crimson'
      }
    });

    this.detailsModifier = new StateModifier({
      transform: Transform.translate(0, 0, 10),
      opacity: 0
    });

    this.details = (new View()).add(this.detailsModifier);
    this.details.add(this.titleSurface);
    this.add(this.details);
  }

  function _bindEvents(){
    this._eventInput.on('showBook', function(eventPayload){
      this.getBook(eventPayload.id);
    }.bind(this));
  }

  module.exports = ShelfView;
});
