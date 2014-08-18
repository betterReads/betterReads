define(function(require, exports, module) {
  var Transform      = require('famous/core/Transform');
  var ObjectHelpers  = require('../helpers/ObjectHelpers');
  var SingularHelper = require('./SingularHelper');

  /*
   *  Parametric circle.
   *  @method parametricCircle
   *  @protected
   *  @param _options {Object} configurable options to set on the circle.
   *  @param [_options.x1] {number} x offset
   *  @param [_options.y1] {number} y offset
   *  @param [_options.radius] {number} radius of the circle.
   *  @returns {Function} Call with each step of the circle.
   */
  function parametricCircle ( _options ) {
    var options = {
      x1: 0,
      y1: 0,
      radius: 20
    }
    ObjectHelpers.extend(options, _options);
    return function ( t ) {
      return [
        options.x1 + options.radius * Math.cos(t),
        options.y1 + options.radius * Math.sin(t),
      ]
    }
  }

  /*
   *  @static
   */
  var DIRECTION = {
    'x': 0,
    'y': 1,
    'z': 2
  }

  /*
   *  Lookup for third dimension.
   *  If you've chosen:
   *  X & Y: return Z
   *  X & Z: return Y
   *  Y & Z: return X
   *  @static
   */
  var UNUSED_DIRECTION = {
    1: 'z',
    2: 'y',
    3: 'x'
  }

  /*
   *  Coverflow: - A 2d circular layout that can occur in any two dimensions. (x&y, x&z, z&y)
   *  Helix: - Using the unused dimension of the coverflow, add an offset to create a helix.
   *
   *  @param _options {Object} configurable options to set on the circle.
   *  @param [_options.curve] {Object} Transition definition
   *  @param [_options.x1percent] {Number} percent of parent size that the parametric
    div.style.color = '#fff';
   *  circle's x-origin is located at.
   *  @param [_options.y1percent] {Number} percent of parent size that the parametric
   *    circle's y-origin is located at.
   *  @param [_options.helixOffset] {Number} Each item in the helix dimension is offset
   *    by this amount. If undefined, nothing will happen in the unused dimension
   *  @param [_options.helixCenter] {Number} From 0 - 1. Based on the entire helix's
   *    length, offset the helix by this percentage.
   *  @param [_options.stepOffset] {Number} From 0 - 2*PI. Absolute offset that can be
   *  added to change the initial placement of the points around a circle.
   */
  module.exports = {

    defaultOptions : {
      curve: { curve: 'outExpo', duration: 1200 },
      x1percent: 0.25,
      y1percent: -0.5,
      radiusPercent: 0.5,
      x1dimension: 'x',
      y1dimension: 'z',
      stepOffset: 0,
      offset: [0,0,0]
    },
    renderLimit: function () {
      return [10, 10]; 
    },
    activate : function (options) {
      SingularHelper.uncenter.call(this, options.curve);
      for (var i = 0; i < this.nodes.length; i++) {
        this.data.childOpacities[i].set(1, options.curve);
        this.data.parentOpacities[i].set(1);
      };
    },

    layout: function (options) {

      var containerSize = this.getSize();
      var indexSize     = this.items[this.index].getSize();
      var nodeLength    = this.nodes.length;
      var length        = this.getLength();
      var step          = Math.PI * 2 / nodeLength;
      
      var circle = parametricCircle({
        x1: containerSize[0] * 0.5,
        y1: containerSize[0] * -0.5,
        radius: this.getSize()[0] * options.radiusPercent
      });

      for (var i = 0; i < nodeLength; i++) {
        var index = this._sanitizeIndex(this.index + i);
        var trans = this.data.childTransforms[index];
        var opacity = this.data.childOpacities[index];
        
        var circlePoints = circle(step * i + Math.PI * 0.5);
        var translate = [0,0,0];
        translate[DIRECTION[options.x1dimension]] += (containerSize[0] - circlePoints[0] - indexSize[0] * 0.5);
        translate[DIRECTION[options.y1dimension]] += circlePoints[1];

        trans.set(
          Transform.translate(translate[0], translate[1], translate[2]),
          options.curve);
      };

      var opacityCurve = {
        curve: 'linear',
        duration: options.curve.duration
      };

      for (var i = 0; i < this.renderLimit[0]; i++) {
        var opacityTransitionable = this.data.childOpacities[sanitizeIndex(this.index + 1 + i, nodeLength)];
        opacityTransitionable.halt();
        opacityTransitionable.set(1 - (i / this.renderLimit[0]), opacityCurve);
      };

      for (var i = 0; i < this.renderLimit[1]; i++) {
        var opacityTransitionable = this.data.childOpacities[sanitizeIndex(this.index - 1 - i, nodeLength)];
        opacityTransitionable.halt();
        opacityTransitionable.set(1 - (i / this.renderLimit[1]), opacityCurve);
      };
      this.data.childOpacities[this.index].halt();
      this.data.childOpacities[this.index].set(1, opacityCurve);
    },

    deactivate: function () {
      //SingularHelper.cleanup.call(this);
    },
  }

  function sanitizeIndex (index, length) {
    if (index < 0) return index % length + length;
    else if (index > length - 1) return index % length;
    return index;
  }


});
