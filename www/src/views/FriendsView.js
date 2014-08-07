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

    _addSurface.call(this);
    _addButton.call(this);
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
  function _addButton(){
    var that = this;
    var button = new ImageSurface({
      size: [100, 100],
      classes: ['preLoad']
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

        var scrollView = new ScrollView();
        var listOfItems = [];
        //colors for alternating
        var colors = ['white', '#E5EBEB'];
        for (var i = 0; i < results.length; i++) {
          var update = results[i];
          var tab = new Surface({
            content: '<font size="2em">' + update.actor[0].name[0] + ' ' + update.action_text[0] + '<br>' + moment(update.updated_at[0]).format('MMMM Do YYYY, h:mm a') + '</font>',
            size: [undefined, 75],
            properties: {
              backgroundColor: colors[i%2],
            }
          });

          listOfItems.push(tab);
          tab.pipe(scrollView);
          tab.pipe(that);
        }

        scrollView.sequenceFrom(listOfItems);
        that.add(scrollView);

        that._eventInput.on('scrollListItemClicked', function(eventPayload) {
          this._eventOutput.emit('navigate:modal', eventPayload);
        }.bind(that));

        setTimeout(function() {
          document.getElementsByClassName('famous-group')[0].style.opacity = 1;
        }, 0);

        var oldElements = document.getElementsByClassName('preLoad');
        while (oldElements.length) {
          oldElements[0].remove();
        }

      });
    });

    this.add(modifier).add(button);
  }

  module.exports = FriendsView;
});
