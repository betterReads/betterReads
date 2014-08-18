define(function(require, exports, module) {
  var Surface                 = require('famous/core/Surface');
  var Modifier                = require('famous/core/Modifier');
  var Transform               = require('famous/core/Transform');
  var RenderNode              = require('famous/core/RenderNode');
  var Transitionable          = require('famous/transitions/Transitionable');
  var TransitionableTransform = require('famous/transitions/TransitionableTransform');
  var SequentialLayout        = require('famous/views/SequentialLayout');
  var Timer                   = require('famous/utilities/Timer');
  var Chainer                 = require('../../modifier/Chainer');
  var DiscreteOptions         = require('../../options/DiscreteOptions');
  var EventHelpers            = require('../../events/EventHelpers');
  var SliderAnimations        = require('./SliderAnimations');
  var SliderDots              = require('./SliderDots');

  /**
   * Navigation dots for the Slider that triggers 'wave' animation.
   *
   * @class SliderWaveDots
   * @constructor
   */
  function SliderWaveDots (options, sequence) {
    SliderDots.apply(this, arguments);
  }

  SliderWaveDots.prototype = Object.create(SliderDots.prototype);
  SliderWaveDots.prototype.constructor = SliderWaveDots;
  SliderWaveDots.NAME = 'sliderWaveDots';

  SliderWaveDots.DEFAULT_OPTIONS = {
    'animationStep' : 1,
    'loopAnimation' : false,
    'lockAnimationToRow' : true,
    'animateBothDirections' : true,
    'dotsVisible' : true
  }

  /**
   * Get the min and max index represented in the same row as the dot whose index is passed in.
   *
   * @method _minAndMaxIndexInRow
   * @param index {Number}
   * @return {Object} Object containing the 'min' and 'max' numerical dot index contained in a dot's row
   */
  function _minAndMaxIndexInRow(index) {
    var rowIndex = Math.floor(index / this.dotsPerRow);
    var min = rowIndex * this.dotsPerRow;
    var max = min + this.dotRows[rowIndex].length - 1;

    return {
      min: min,
      max: max
    }
  }

  /**
   * Triggers wave animation based on selected dot's index and animation step.
   * The step represents the dot indices that will be animated.
   * For example, a step of +1 means that each dot which a higher index will be animated.
   * A step of -2 means that every other dot with a lower index will be animated.
   *
   * The animation can be locked to a single row based on the 'lockAnimationToRow' option.
   *
   * @method animate
   * @param {Number} index
   * @param {Number} step
   */
  SliderWaveDots.prototype.animate = function animate(index, step) {
    var bounds = this._getBounds.call(this, index); //Min & Max indicies to animate

    SliderAnimations['wave'].call(this, {
      'itemsToAnimate'        : this.dotTransitionables,
      'animation'             : this.options['dotOnClickMove'],
      'index'                 : index,
      'step'                  : step,
      'bounds'                : bounds,
      'loopAnimation'         : this.options['loopAnimation'],
      'animateBothDirections' : this.options['animateBothDirections'],
    });
  }

  /**
   * Gets the min and max dot index for an anmiation based on the 'lockAnimationToRow' option.
   *
   * @method _getBounds
   * @param {Number} index
   * @return {Object} Object containing the 'min' and 'max' numerical dot index contained in a dot's row
   */
  SliderWaveDots.prototype._getBounds = function _getBounds(index) {
    var bounds;
    if (this.options['lockAnimationToRow']) {
      bounds = _minAndMaxIndexInRow.call(this, index);
    } else {
      bounds = {
        min: 0,
        max: this.dotTransitionables.length
      };
    }
    return bounds;
  }

  /**
   * Get the min and max index represented in the same row as the dot whose index is passed in.
   *
   * @method _minAndMaxIndexInRow
   * @param index {Number}
   * @return {Object} Object containing the 'min' and 'max' numerical dot index contained in a dot's row
   */
  function _minAndMaxIndexInRow(index) {
    var rowIndex = Math.floor(index / this.dotsPerRow);
    var min = rowIndex * this.dotsPerRow;
    var max = min + this.dotRows[rowIndex].length - 1;

    return {
      min: min,
      max: max
    }
  }

  module.exports = SliderWaveDots;
});
