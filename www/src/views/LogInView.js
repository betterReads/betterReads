define(function(require, exports, module){
  'use strict'
  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var ImageSurface = require('famous/surfaces/ImageSurface');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ScrollView = require('famous/views/ScrollView');
  var Transform = require('famous/core/Transform');
  var Easing = require('famous/transitions/Easing');
  var Modifier = require('famous/core/Modifier');



  var betterReads = require('../utils/BetterReads');

  function LogInView(){
    View.apply(this, arguments);

    _addSurface.call(this);
    _addButton.call(this);

    this.transformBR = function() { 
      this.buttonModifier.setOpacity(0, {
        duration: 2000, curve: Easing.linear
      });
      this.buttonModifier.setSize([200, 200], {
        duration: 2000
      });
      this.buttonModifier.transformFrom(rotate);

      this.brModifier.setOpacity(1, {
        duration: 2000, curve: Easing.linear
      });
      this.brModifier.setSize([200, 200], {
        duration: 2000
      });
      this.brModifier.transformFrom(rotate);

      var angle = 0;
      function rotate() {
        if (angle < Math.PI) {
          angle += Math.PI/240;
        }
        return Transform.rotateZ(angle);
      }
    };

  }

  LogInView.prototype = Object.create(View.prototype);
  LogInView.prototype.constructor = LogInView;

  LogInView.DEFAULT_OPTIONS = {};

  function _addSurface(){
    var surface = new Surface({
      classes: ['preLoad'],
      content: "<font size='50px'>Log In With Goodreads</font>",
      size: [undefined, undefined],
      properties: {
        textAlign: 'center',
        backgroundColor: '#EFF9FF',
        color: '#0096B3'
      }
    });

    this.add(surface);
  }
  function _addButton(){
    this.brLogo = new ImageSurface({
      // size: [100, 100]
      classes: ['preLoad']
    });
    this.brLogo.setContent('./resources/betterreads-icon-color-usd.png');

    this.button = new ImageSurface({
      // size: [100, 100]
      classes: ['preLoad']
    });
    this.button.setContent('./resources/goodreads-icon.png');

    this.buttonModifier = new Modifier({
      align: [0.5, 0.6],
      origin: [0.5, 0.5],
      size: [100, 100]
    });

    this.brModifier = new Modifier({
      align: [0.5, 0.6],
      origin: [0.5, 0.5],
      size: [100, 100],
      opacity: 0
    });    

    var that = this;
    this.button.on('click', function() {
      console.log('clicked');
      betterReads.authenticate(function() {
        console.log('call back');
        that._eventOutput.emit('loggedIn');
      });
    });

    this.add(this.buttonModifier).add(this.button);
    this.add(this.brModifier).add(this.brLogo);
  }

  module.exports = LogInView;
});
