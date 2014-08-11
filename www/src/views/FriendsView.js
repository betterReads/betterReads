define(function(require, exports, module){
  'use strict';

  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var ImageSurface = require('famous/surfaces/ImageSurface');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ScrollView = require('famous/views/ScrollView');

  var betterReads = require('../utils/BetterReads');

  function FriendsView(){
    View.apply(this, arguments);

    // _addSurface.call(this);
    _addFeed.call(this);
  }

  FriendsView.prototype = Object.create(View.prototype);
  FriendsView.prototype.constructor = FriendsView;

  FriendsView.DEFAULT_OPTIONS = {};

  function _addSurface(){
    var surface = new Surface({
      content: "Friend Updates",
      classes: ['preLoad'],
      size: [undefined, undefined],
      properties: {
        textAlign: 'center',
        lineHeight: '200px',
        backgroundColor: '#bbb'
      }
    });

    this.add(surface);
  }
  function _addFeed(){
    var that = this;
    betterReads.getUpdates().then(function(results) {
      console.log(results);

      var scrollView = new ScrollView();
      var listOfItems = [];
      //colors for alternating
      var colors = ['white', '#E5EBEB'];
      for (var i = 0; i < results.length; i++) {
        var update = results[i];
        var tab = new Surface({
          content: update.actor[0].name[0] + ' ' + update.action_text[0] + '<br>' + moment(update.updated_at[0]).format('MMMM Do YYYY, h:mm a'),
          size: [undefined, true],
          properties: {
            backgroundColor: colors[i%2],
            padding: '10px'
          }
        });

        listOfItems.push(tab);
        tab.pipe(scrollView);
        tab.pipe(that);
      }

      scrollView.sequenceFrom(listOfItems);
      that.add(scrollView);
    });
  }

  module.exports = FriendsView;
});
