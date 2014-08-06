define(function(require, exports, module){
  'use strict';

  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var ImageSurface = require('famous/surfaces/ImageSurface');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ScrollView = require('famous/views/ScrollView');

  var reqwest = require('../../../bower_components/reqwest/reqwest');

  function LogInView(){
    View.apply(this, arguments);

    _addSurface.call(this);
    _addButton.call(this);
  }

  LogInView.prototype = Object.create(View.prototype);
  LogInView.prototype.constructor = LogInView;

  LogInView.DEFAULT_OPTIONS = {};

  function _addSurface(){
    var surface = new Surface({
      content: "Log In With Goodreads",
      size: [undefined, undefined],
      properties: {
        textAlign: 'center',
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

    this.add(modifier).add(button);
  }

  module.exports = LogInView;
});
