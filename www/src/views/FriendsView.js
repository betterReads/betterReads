define(function(require, exports, module){
  'use strict';

  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var ImageSurface = require('famous/surfaces/ImageSurface');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ScrollView = require('famous/views/ScrollView');

  var reqwest      = require('../../../bower_components/reqwest/reqwest');
  var betterReads = require('../utils/BetterReads');


  function FriendsView(){
    View.apply(this, arguments);

    _addSurface.call(this);
    _addButton.call(this);
  }

  FriendsView.prototype = Object.create(View.prototype);
  FriendsView.prototype.constructor = FriendsView;

  FriendsView.DEFAULT_OPTIONS = {};

  function _addSurface(){
    var surface = new Surface({
      content: "Friend Updates",
      size: [undefined, undefined],
      properties: {
        textAlign: 'center',
        lineHeight: '200px',
        backgroundColor: '#bbb'
      }
    });

    this.add(surface);
  }
  function _addButton(){
    var button = new ImageSurface({
      size: [100, 100]
    });
    button.setContent('./resources/goodreads-icon.png');

    var modifier = new StateModifier({
      align: [0.5, 0.5],
      origin: [0.5, 0.5]
    });

    button.on('click', function() {
      console.log('clicked');
      betterReads.getUpdates().then(function(results) {
        console.log(results);
      });
    });

    this.add(modifier).add(button);
  }

  module.exports = FriendsView;
});
