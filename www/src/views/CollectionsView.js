define(function(require, exports, module){
  'use strict';

  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ScrollView = require('famous/views/ScrollView');

  var reqwest      = require('../../../bower_components/reqwest/reqwest');

  function CollectionsView(){
    View.apply(this, arguments);

    _addSurface.call(this);
  }

  CollectionsView.prototype = Object.create(View.prototype);
  CollectionsView.prototype.constructor = CollectionsView;

  CollectionsView.DEFAULT_OPTIONS = {};

  function _addSurface(){
    var surface = new Surface({
      content: "Shelf View",
      size: [undefined, undefined],
      properties: {
        textAlign: 'center',
        backgroundColor: '#ddd'
      }
    });

    this.add(surface);
  }

  module.exports = CollectionsView;
});
