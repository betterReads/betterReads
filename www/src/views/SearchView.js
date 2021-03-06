define(function(require, exports, module){
  'use strict';

  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var Transform = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ImageSurface = require('famous/surfaces/ImageSurface');
  var InputSurface = require('famous/surfaces/InputSurface');
  var ScrollView = require('famous/views/Scrollview');
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
      var colors = ['white', '#EFF9FF'];

      for (var i = 0; i < books.length; i++) {
        var id = books[i].best_book[0].id[0]._
        var title = books[i].best_book[0].title[0];
        var author = books[i].best_book[0].author[0].name[0];
        var rating = books[i].average_rating[0];
        var imageURL = books[i].best_book[0].image_url[0];

        if (title.length > 50) {
          title = title.slice(0, 47) + '...';
        }
        if (author.length > 25) {
          author = author.slice(0, 22) + '...';
        }        

        var bookView = new View();
        var bookMod = new StateModifier({
          size: [undefined, 150]
        });

        var image = new ImageSurface({
          size: [100, 150],
          properties: {
            padding: '2px 4px',
            backgroundColor: colors[i%2]
          }
        });
        image.setContent(imageURL);

        var tab = new Surface({
          content: '<div style="font-weight: bold">' + title + '</div>by ' + author + '<br>Rating: ' + rating + '/5',
          // size: [undefined, undefined],
          size: [window.innerWidth - 100, undefined],
          properties: {
            textAlign: 'left',
            backgroundColor: colors[i%2],
            padding: '10px'
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
          id: id
        }

        clickSurface.on('click', function(payload){
          this.emit('readABook', {
            id: payload.id,
            add: true
          });
        }.bind(clickSurface, eventPayload));

        this.resultsList.push(bookWrapper);

        clickSurface.pipe(this.resultsView);
        clickSurface.pipe(this);
      }

      this.resultsView.sequenceFrom(this.resultsList);

      this._eventInput.on('readABook', function(eventPayload) {
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
