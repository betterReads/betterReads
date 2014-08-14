define(function(require, exports, module){
  'use strict';

  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var ImageSurface = require('famous/surfaces/ImageSurface');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ScrollView = require('famous/views/ScrollView');
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

      var scrollView = new ScrollView();
      var listOfItems = [];
      //colors for alternating
      var colors = ['white', '#EFF9FF'];
      for (var i = 0; i < results.length; i++) {
        var update = results[i];

        var bookView = new View();
        var bookMod = new StateModifier({
          size: [undefined, 100]
        });

        var image = new ImageSurface({
          // properties: {
          //   padding: '25px 0px px 0px'
          // }
        });
        image.setContent(update.image_url[0]);

        image.imageMod = new Modifier({
          size: [50, undefined],
          transform: Transform.translate(0, 0, 1)
        });

        var tab = new Surface({
          content: '<b>' + update.actor[0].name[0] + '</b> ' + update.action_text[0] + '<br>' + moment(update.updated_at[0]).format('MMMM Do YYYY, h:mm a'),
          size: [undefined, 100],
          properties: {
            backgroundColor: colors[i%2],
            padding: '10px 10px 10px 77px'
          }
        });


        var bookWrapper = bookView.add(bookMod);
        bookWrapper.add(image.imageMod).add(image);
        bookWrapper.add(tab);

        listOfItems.push(bookView);
        image.pipe(scrollView);
        image.pipe(that);

        // listOfItems.push(tab);
        tab.pipe(scrollView);
        tab.pipe(that);
      }

      scrollView.sequenceFrom(listOfItems);
      that.add(scrollView);
    });
  }

  module.exports = FriendsView;
});
