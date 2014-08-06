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

    this.searchInput.setValue('hemingway');

    this.search();
  }

  SearchView.prototype = Object.create(View.prototype);
  SearchView.prototype.constructor = SearchView;

  SearchView.DEFAULT_OPTIONS = {};

  SearchView.prototype.search = function(){
    var query = this.searchInput.getValue();
    betterReads.searchBooks({query: query})
    .then(function(data) {
      var books = JSON.parse(data);
      console.log(books);
    });
  }

  function _addSurface(){
    this.searchInput = new InputSurface({
      size: [undefined, 50],
      placeholder: 'Type Here',
      properties: {
        textAlign: 'center',
        backgroundColor: '#999',
        border: 'none'
      }
    });

    this.add(this.searchInput);
  }

  module.exports = SearchView;
});
