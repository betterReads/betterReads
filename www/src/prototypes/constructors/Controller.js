define(function(require, exports, module) {
  var EventHandler   = require('famous/core/EventHandler');
  var OptionsManager = require('famous/core/OptionsManager');

  /**
   * A View without the renderNodes.
   *
   * @class Controller
   */
  function Controller(options) {
    this._eventInput = new EventHandler();
    this._eventOutput = new EventHandler();

    EventHandler.setInputHandler(this, this._eventInput);
    EventHandler.setOutputHandler(this, this._eventOutput);

    this.options = Object.create(this.constructor.DEFAULT_OPTIONS || Controller.DEFAULT_OPTIONS);
    this._optionsManager = new OptionsManager(this.options);

    if (options) this.setOptions(options);
  }

  Controller.DEFAULT_OPTIONS = {}; // no defaults

  Controller.prototype.getOptions = function getOptions () {
    return this._optionsManager.value();
  };

  Controller.prototype.setOptions = function setOptions (options) {
    this._optionsManager.patch(options);
  };

  module.exports = Controller;
});
