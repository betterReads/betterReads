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

    _addSearchField.call(this);
    _bindEvents.call(this);

    // this.searchInput.setValue('hemingway');

    // this.search();
  }

  SearchView.prototype = Object.create(View.prototype);
  SearchView.prototype.constructor = SearchView;

  SearchView.DEFAULT_OPTIONS = {
    inputSize: 50
  };

  SearchView.prototype.search = function(){
    console.log('searching for "'+ this.searchInput.getValue() + '"...');
    var query = this.searchInput.getValue();
    betterReads.searchBooks({query: query})
    .then(function(data) {
      var books = JSON.parse(data);
      console.log(books);
    });
  }

  function _addSearchField(){
    this.searchInput = new InputSurface({
      size: [window.innerWidth - this.options.inputSize, this.options.inputSize],
      placeholder: '    Type Here',
      properties: {
        textAlign: 'left',
        backgroundColor: '#999',
        border: 'none',
        padding: 50,
        outline: 'none'
      }
    });

    this.searchInput.getValue = function(){
      return this._element.value;
    };

    this.searchButton = new Surface({
      size: [this.options.inputSize, this.options.inputSize],
      content: '<i class="fa fa-search"></i>',
      properties: {
        textAlign: 'center',
        lineHeight: 2.5,
        backgroundColor: '#393',
        color: 'black',
        cursor: 'pointer',
      }
    });

    this.searchButtonModifier = new StateModifier({
      align: [1, 0],
      origin: [1, 0]
    });

    this.add(this.searchButtonModifier).add(this.searchButton);
    this.add(this.searchInput);
  }

  function _bindEvents(){
    this.searchButton.on('click', this.search.bind(this));
  }

  module.exports = SearchView;
});
