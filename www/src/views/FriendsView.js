define(function(require, exports, module){
  'use strict';

  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var ImageSurface = require('famous/surfaces/ImageSurface');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ScrollView = require('famous/views/Scrollview');
  var Modifier = require('famous/core/Modifier');
  var Transform = require('famous/core/Transform');

  var betterReads = require('../utils/BetterReads');

  function FriendsView(){
    View.apply(this, arguments);

    _addFeed.call(this);
  }

  FriendsView.prototype = Object.create(View.prototype);
  FriendsView.prototype.constructor = FriendsView;

  FriendsView.DEFAULT_OPTIONS = {};

  function _addFeed(){
    var that = this;
    betterReads.getUpdates().then(function(results) {
      console.log(results);

      var scrollView = new ScrollView({
        margin: 5000
      });
      var listOfItems = [];
      //colors for alternating
      var colors = ['white', '#EFF9FF'];
      for (var i = 0; i < results.length; i++) {
        var update = results[i];
        update.action_text[0] = update.action_text[0].replace(/only_path="false"/g, '');
        update.action_text[0] = update.action_text[0].replace(/href=/g, 'onClick=\'javascript: window.open(');
        update.action_text[0] = update.action_text[0].replace(/">/g, '", \"_system\");\'>');
        update.action_text[0] = update.action_text[0].replace(/" >/g, '", \"_system\");\'>');

        var tab = new Surface({
          content: '<table><td><img src="' + update.image_url[0] + '"></td><td><b>' + update.actor[0].name[0] + '</b> ' + update.action_text[0] + '<br>' + moment(update.updated_at[0]).format('MMMM Do YYYY, h:mm a') + '</td></table>',
          size: [undefined, true],
          properties: {
            backgroundColor: colors[i%2],
            padding: '15px 5px 25px 5px'
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
