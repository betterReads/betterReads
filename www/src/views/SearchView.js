define(function(require, exports, module){
  'use strict';

  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var Transform = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ImageSurface = require('famous/surfaces/ImageSurface');
  var InputSurface = require('famous/surfaces/InputSurface');
  var ScrollView = require('famous/views/ScrollView');
  var ScrollListItem = require('components/ScrollListItem');

  var SearchBarView = require('views/SearchBarView');

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
    console.log('searching for "'+ this.searchBar.getValue() + '"...');
    var query = this.searchBar.getValue();
    betterReads.searchBooks({query: query})
    .then(function(data) {
      var books = JSON.parse(data);
      console.log(books);

      this.resultsList = [];
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
          size: [window.innerWidth - 100, undefined],
          properties: {
            textAlign: 'right',
            backgroundColor: 'white'
          }
        });

        var tabModifier = new StateModifier({
          align: [1, 0],
          origin: [1, 0]
        });

        var clickSurface = new Surface({
          size: [undefined, undefined],
          properties: {
            backgroundColor: 'white',
            opacity: '0'
          }
        });

        var bookWrapper = bookView.add(bookMod);
        bookWrapper.add(image);
        bookWrapper.add(tabModifier).add(tab);
        bookWrapper.add(clickSurface);

        var index = i;
        var eventPayload = {
          index: index,
          title: title,
          author: author,
          rating: rating,
          imageURL: imageURL
        }

        clickSurface.on('click', function(payload){
          this.emit('readABook', {
            title: payload.title
          });
        }.bind(clickSurface, eventPayload));

        this.resultsList.push(bookWrapper);

        clickSurface.pipe(this.resultsView);
        clickSurface.pipe(this);
      }

      this.resultsView.sequenceFrom(this.resultsList);

      this._eventInput.on('readABook', function(eventPayload) {
        console.log(eventPayload.title);
        this._eventOutput.emit('showBook', eventPayload);
        this._eventOutput.emit('navigate', {
          title: 'Book',
          showBackButton: true
        });
      }.bind(this)); 
    }.bind(this));
  }

  function _addSearchField(){
    this.searchBar = new SearchBarView();

    this.subscribe(this.searchBar);

    this.add(this.searchBar);
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
    this.searchBar.on('searchClick', this.search.bind(this)); 
  }

  module.exports = SearchView;
});
