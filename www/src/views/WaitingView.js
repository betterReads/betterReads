define(function(require, exports, module){
  'use strict'
  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var StateModifier = require('famous/modifiers/StateModifier');
  var Transform = require('famous/core/Transform');
  var Modifier = require('famous/core/Modifier');

  function WaitingView(){
    View.apply(this, arguments);

    _addSurface.call(this);
  }

  WaitingView.prototype = Object.create(View.prototype);
  WaitingView.prototype.constructor = WaitingView;

  WaitingView.DEFAULT_OPTIONS = {};

  WaitingView.prototype.show = function(){
    this.spinner.setProperties({
      display: 'block'
    });
  };

  WaitingView.prototype.hide = function(){
    this.spinner.setProperties({
      display: 'none'
    });
  };

  function _addSurface(){
    this.spinner = new Surface({
      content: '<i style="margin: 0; font-size: 60px;" class="fa fa-spinner"></i>',
      size: [100, null],
      properties: {
        textAlign: 'center'
      }
    });

    this.spinnerModifier = new Modifier({
      align: [0.5, 0.3],
      origin: [0.5, 0.5]
    });

    this.add(this.spinnerModifier).add(this.spinner);

    // assigns the transform property of the modifier
    // as the argument of .transformFrom()
    this.spinnerModifier.transformFrom(rotate);

    var angle = 0;
    function rotate() {
      angle += 0.07;
      return Transform.rotateZ(angle);
    }
  }

  module.exports = WaitingView;
});
