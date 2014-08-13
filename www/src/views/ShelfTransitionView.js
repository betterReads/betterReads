define(function(require, exports, module){
  'use strict';

  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var ImageSurface = require('famous/surfaces/ImageSurface');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ScrollView = require('famous/views/ScrollView');
  var LibraryView = require('views/LibraryView');
  var Transform = require('famous/core/Transform');
  var Easing = require('famous/transitions/Easing');

  var betterReads = require('../utils/BetterReads');

  function ShelfTransitionView(shelf){
    View.apply(this, arguments);

    _addShelf.call(this, shelf);
  }

  ShelfTransitionView.prototype = Object.create(View.prototype);
  ShelfTransitionView.prototype.constructor = ShelfTransitionView;

  ShelfTransitionView.DEFAULT_OPTIONS = {};

  function _addShelf(shelf){

    var background = new Surface({
      size: [undefined, undefined],
      properties: {
        backgroundColor: shelf.data.color,
        zIndex: -1
      }
    });
    var shelfModifier = new StateModifier({
      transform: Transform.translate(0, shelf._matrix[13], 0)
    });
    var shelf = new Surface({
      content: '<b>' + shelf.data.name + '</b> <font color="#403E39"> ' + shelf.data.count + ' books </font>',
      size: [undefined, true],
      properties: {
        textAlign: 'center',
        padding: '10px'
      }
    });

    this.add(background);
    this.add(shelfModifier).add(shelf);
    setTimeout(function() {
      shelfModifier.setTransform(Transform.translate(0, 0, 0), {duration: 1000, curve: Easing.inOutCubic});
    }, 500);
  }

  module.exports = ShelfTransitionView;
});
