define(function(require, exports, module){
  'use strict';

  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ScrollView = require('famous/views/ScrollView');

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
      console.log('time to update the book info');
      console.log(eventPayload);
      this.titleSurface.setContent(eventPayload.title);
    }.bind(this));
  }

  module.exports = ShelfView;
});
