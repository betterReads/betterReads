define(function(require, exports, module){
  'use strict';

  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var Transform = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ImageSurface = require('famous/surfaces/ImageSurface');
  var InputSurface = require('famous/surfaces/InputSurface');
  var ScrollView = require('famous/views/ScrollView');

  var betterReads = require('../utils/BetterReads');

  function SearchView(){
    View.apply(this, arguments);

    this.resultsList = [];

    _addSearchField.call(this);
    _addSearchResults.call(this);
    _bindEvents.call(this);
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

      this.resultsList = [];
      //colors for alternating
      var colors = ['white', '#E5EBEB'];
      for (var i = 0; i < books.length; i++) {
        var title = books[i].best_book[0].title[0];
        var author = books[i].best_book[0].author[0].name[0];
        var rating = books[i].average_rating[0];
        var imageURL = books[i].best_book[0].image_url[0];

        var bookView = new View();
        var bookMod = new StateModifier({
          size: [undefined, 150]
        });

        var image = new ImageSurface({
          size: [100, 150]
        });
        image.setContent(imageURL);

        var tab = new Surface({
          content: title + '<br>' + name + '<br>Rating: ' + rating + '/5',
          size: [window.innerWidth - 150, undefined],
          properties: {
          textAlign: 'right',
          backgroundColor: 'white'
          }
        });

        var tabModifier = new StateModifier({
          align: [1, 0],
          origin: [1, 0]
        });

        var bookWrapper = bookView.add(bookMod);
        bookWrapper.add(image);
        bookWrapper.add(tabModifier).add(tab);

        this.resultsList.push(bookView);
        image.pipe(this.resultsView);
        image.pipe(this);
        tab.pipe(this.resultsView);
        tab.pipe(this);
      }

      this.resultsView.sequenceFrom(this.resultsList);
    }.bind(this));
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

    this.add(this.searchInput);
    this.add(this.searchButtonModifier).add(this.searchButton);
  }

  function _addSearchResults(){
    this.resultsView = new ScrollView();
    
    this.resultsModifier = new StateModifier({
      transform: Transform.translate(0, this.options.inputSize, -10)
    });

    this.resultsView.sequenceFrom(this.resultsList);
    this.add(this.resultsModifier).add(this.resultsView);
  }

  function _bindEvents(){
    this.searchButton.on('click', this.search.bind(this));
  }

  module.exports = SearchView;
});
