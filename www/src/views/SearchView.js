define(function(require, exports, module){
  'use strict';

  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var StateModifier = require('famous/modifiers/StateModifier');
  var InputSurface = require('famous/surfaces/InputSurface');
  var ScrollView = require('famous/views/ScrollView');

  var betterReads = require('../utils/BetterReads');

  function SearchView(){
    View.apply(this, arguments);

    _addSurface.call(this);

    this.search();
  }

  SearchView.prototype = Object.create(View.prototype);
  SearchView.prototype.constructor = SearchView;

  SearchView.DEFAULT_OPTIONS = {};

  SearchView.prototype.search = function(){
    betterReads.searchBooks({query: 'vonnegut'})
    .then(function(data) {
      var books = JSON.parse(data);
      console.log(books);
    });
  }

  function _addSurface(){
    var surface = new InputSurface({
      size: [undefined, 50],
      placeholder: 'Type Here',
      properties: {
        textAlign: 'center',
        backgroundColor: '#999',
        border: 'none'
      }
    });

    this.add(surface);
  }

  module.exports = SearchView;
});
