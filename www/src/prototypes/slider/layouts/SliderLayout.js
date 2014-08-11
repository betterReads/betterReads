define(function(require, exports, module) {
  var ObjectHelpers = require('../../helpers/ObjectHelpers');

  /*
   *  This allows you to create additional layouts for the Slider.
   *  This is a private class, that will be created automatically
   *  for you. Instead, all you must do is to register a layout, 
   *  passing in a single object that will match the definition 
   *  options below. 
   *
   *  @example
   *    SliderCreator.registerLayout({ 
   *      defaultOptions: { 
   *
   *      },
   *      layout: function (options) {
   *         
   *      },
   *      activate: function (options) {
   *         
   *      },
   *      deactivate: function (options) {
   *         
   *      },
   *    });
   *
   *  @param slider {Function} reference to the slider itself
   *  @param {Object} [definition] An object of configurable definitions
   *
   *  @param {Object} [definition.defaultOptions]
   *    defaultOptions that the layout will be called with
   *
   *  @param {Function} [definition.layout]
   *    The layout function. Called with reference to the slider
   *
   *  @param {Function} [definition.activate]
   *    Called when the layout is created. Allows you to
   *    setup event listeners, or other methods on instantiation.
   *    Called with reference to the slider.
   *
   *  @param {Function} [definition.activate]
   *    Called when the layout is going to be changed.
   *    Allows you to unbind up any event listeners called in
   *    activate, or any similar deconstruction methods.
   *    Called with reference to the slider.
   *
   *  @param options {Object}
   *    Custom layout options, that are set on top of the
   *    deafultOptions of the layout.
   */
  function SliderLayout (slider, definition, options) {
    this.options = ObjectHelpers.merge(definition.defaultOptions, options);
    this.definition = definition;
    if (definition.activate) definition.activate.call(slider);
    if (definition.deactivate) this.deactivate = definition.deactivate.bind(slider);
  }

  /*
   *  @method layout
   *  @param context {Slider} reference to call the layout function with.
   */
  SliderLayout.prototype.layout = function layout(context) {
    this.definition.layout.call(context, this.options);
  }

  /*
   *  @method deactivate
   *  @param context {Slider} reference to call the deactivate function with.
   */
  SliderLayout.prototype.deactivate = function deactivate(context) {
    if (this.definition.deactivate) this.definition.deactivate.call(context);
  }

  module.exports = SliderLayout; 
});
