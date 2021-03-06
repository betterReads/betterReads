define(function(require, exports, module){
  'use strict';

  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var Transform = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ImageSurface = require('famous/surfaces/ImageSurface');
  var InputSurface = require('famous/surfaces/InputSurface');
  var ScrollView = require('famous/views/Scrollview');

  var betterReads = require('../utils/BetterReads');

  function SearchBarView(){
    View.apply(this, arguments);

    this.resultsList = [];

    _addSearchField.call(this);
    _addSearchButton.call(this);
    _bindEvents.call(this);
  }

  SearchBarView.prototype = Object.create(View.prototype);
  SearchBarView.prototype.constructor = SearchBarView;

  SearchBarView.DEFAULT_OPTIONS = {
    inputSize: 50
  };

  SearchBarView.prototype.getValue = function(){
      return this.searchInput._element.value;
    };

  function _addSearchField(){
    this.searchInput = new InputSurface({
      placeholder: '    Type Here',
      properties: {
        textAlign: 'left',
        backgroundColor: '#EFF9FF',
        border: 'none',
        padding: 50,
        outline: 'none',
        fontFamily: 'Roboto',
        fontSize: '16px'
      }
    });

    this.searchInputModifier = new StateModifier({
      size: [window.innerWidth - this.options.inputSize, this.options.inputSize],
      align: [0, 0],
      origin: [0, 0]
    })

    this.add(this.searchInputModifier).add(this.searchInput);
  }

  function _addSearchButton(){
    this.searchButton = new Surface({
      content: '<i class="fa fa-search"></i>',
      classes: ['clickButton'],
      properties: {
        textAlign: 'center',
        lineHeight: 2.5,
        backgroundColor: '#0096B3',
        color: 'white',
        cursor: 'pointer',
      }
    });

    this.searchButtonModifier = new StateModifier({
      size: [this.options.inputSize, this.options.inputSize],
      align: [1, 0],
      origin: [1, 0]
    });

    this.add(this.searchButtonModifier).add(this.searchButton);
  }

  function _bindEvents(){
    this.searchButton.on('click', function(){
      this._eventOutput.emit('searchClick');
    }.bind(this));
  }

  module.exports = SearchBarView;
});
