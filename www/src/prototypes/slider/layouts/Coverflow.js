define(function(require, exports, module) {
  var Transform     = require('famous/core/Transform');
  var ObjectHelpers = require('../../helpers/ObjectHelpers');
  var TwoDim        = require('../../math/TwoDim');
  var Chainer       = require('../../modifier/Chainer');

  /*
   *  Parametric circle.
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
      helixOffset: undefined,
      helixCenter: 0.5,
      stepOffset: 0,
      offset: [0,0,0]
    },

    layout: function (options) {
      var circle = parametricCircle({
        x1: this.getSize()[0] * options.x1percent,
        y1: this.getSize()[0] * options.y1percent,
        radius: this.getSize()[0] * options.radiusPercent
      });

      var length = this.sequence.length();
      var step = Math.PI * 2 / length;

      if (options.helixOffset) { 
        var helixDimension =
          DIRECTION[
            UNUSED_DIRECTION[DIRECTION[options.x1dimension] +
            DIRECTION[options.y1dimension]]
          ];
        var centerHelix = length * options.helixOffset * -options.helixCenter;
      }

      this.orderedForEach(function (currentIndex, trans, size, i) {
        var circlePoints = circle(step * i + options.stepOffset);
        var translate = options.offset.slice(0);

        if (options.helixOffset) { 
          translate[helixDimension] = i * options.helixOffset + centerHelix;
        }

        translate[DIRECTION[options.x1dimension]] += circlePoints[0];
        translate[DIRECTION[options.y1dimension]] += circlePoints[1];

        trans.set(
          Transform.translate(translate[0], translate[1], translate[2]),
          options.curve);
      });
    }
  }
});
