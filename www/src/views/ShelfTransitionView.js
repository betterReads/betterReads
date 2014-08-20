define(function(require, exports, module){
  'use strict';

  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var ImageSurface = require('famous/surfaces/ImageSurface');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ScrollView = require('famous/views/Scrollview');
  var LibraryView = require('views/LibraryView');
  var Transform = require('famous/core/Transform');
  var Easing = require('famous/transitions/Easing');

  var betterReads = require('../utils/BetterReads');

  function ShelfTransitionView(data){
    View.apply(this, arguments);

    _addShelf.call(this, data.cell, data.scroll);
  }

  ShelfTransitionView.prototype = Object.create(View.prototype);
  ShelfTransitionView.prototype.constructor = ShelfTransitionView;

  ShelfTransitionView.DEFAULT_OPTIONS = {};

  function _addShelf(shelf, scroll){
    var background = new Surface({
      size: [undefined, undefined],
      properties: {
        backgroundColor: shelf.data.color,
        zIndex: -1
      }
    });
    var shelfModifier = new StateModifier({
      transform: Transform.translate(0, shelf._matrix[13] - scroll._edgeSpringPosition, 0)
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
