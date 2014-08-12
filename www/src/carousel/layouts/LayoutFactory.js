define(function(require, exports, module) {
  var ObjectHelpers = require('../helpers/ObjectHelpers');

  /**
   *  This allows you to create additional layouts for the Carousel.
   *  This is a private class, that will be created automatically
   *  for you. Instead, all you must do is to register a layout, 
   *  passing in a single object that will match the definition 
   *  options below. 
   *
   *  @example
   *    Carousel.CUSTOM_LAYOUT = function (options) {
   *      return {
   *        options: options,
   *        defaultOptions: { 
   *
   *        },
   *        renderLimit: function (options) {
   *          // renders 1 before the current index, 
   *          // and two after the current index.
   *          return [1, 2];
   *        },
   *        activate: function (options) {
   *           
   *        },
   *        layout: function (options) {
   *           
   *        },
   *        deactivate: function (options) {
   *
   *        }
   *      }
   *    }
   *
   *    myCarousel.setContentLayout(Carousel.CUSTOM_LAYOUT);
   *
   *  @param carousel {Function} reference to the carousel itself
   *  @param {Object} [definition] An object matching the definition object.
   *
   *  @param {Object} [definition.options]
   *    Pass through options from the function. Allows custom options to be set
   *    on your custom layout.
   * 
   *  @param {Object} [definition.defaultOptions]
   *    The default options that the layout will be called with
   *
   *  @param {Function} [definition.layout]
   *    The layout function. Called with reference to the carousel.
   *
   *  @param {Array | 2D} [definition.renderLimit]
   *    Allow individual layouts to control the amount of items before and after
   *    the current index to be rendered into the DOM at one time.
   *
   *  @param {Function} [definition.activate]
   *    Called when the layout is created. Allows you to
   *    setup event listeners, or other methods on instantiation.
   *    Called with reference to the carousel.
   *
   *  @param {Function} [definition.activate]
   *    Called when the layout is going to be changed.
   *    Allows you to unbind up any event listeners called in
   *    activate, or any similar deconstruction methods.
   *    Called with reference to the carousel.
   *
   *  @param options {Object}
   *    Custom layout options, that are set on top of the
   *    deafultOptions of the layout.
   *
   *  @class LayoutFactory
   */

  function LayoutFactory (carousel, definition) {
    this.context = carousel;
    this.options = ObjectHelpers.merge(definition.defaultOptions, definition.options);
    this.definition = definition;
  }

  /*
   *  @method layout
   *  @param context {Slider} reference to call the layout function with.
   */
  LayoutFactory.prototype.layout = function layout(context) {
    this.definition.layout.call(context, this.options);
  }

  /*
   *  @method activate
   */
  LayoutFactory.prototype.activate = function activate() {
    if (this.definition.activate) this.definition.activate.call(this.context, this.options);
  }

  /*
   *  @method activate
   */
  LayoutFactory.prototype.renderLimit = function renderLimit() {
    if (this.definition.renderLimit) {
      return this.definition.renderLimit.call(this.context, this.options);
    }
    return undefined;
  }
  

  /*
   *  @method deactivate
   */
  LayoutFactory.prototype.deactivate = function deactivate() {
    if (this.definition.deactivate) this.definition.deactivate.call(this.context);
    this.context = null;
  }

  module.exports = LayoutFactory;
});
