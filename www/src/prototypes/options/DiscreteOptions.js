define(function(require, exports, module) {
  var Engine = require('famous/core/Engine');

  /*
   * DiscreteOptions
   * @helpers
   */

  /*
   * Sugared helper to setup the options listeners.
   * Assumes inheritance from a view.
   * Should only be called from a parent controller class.
   *
   * @example usage
   *    DiscreteOptions.listenToInternalChange.call(this);
   */
  function listenToInternalChange () {
    this._optionsManager.pipe(this);
    this._eventInput.on('change', handleInternalChange.bind(this));
  }

  /*
   *  Reemit with annoted event name.
   */
  function handleInternalChange (e) {
    var eventName = 'change:' + e.id;
    this._eventInput.emit(eventName, e);
  }

  /*
   *  change event -> set:someOption
   *  This should only be registered / called on parent classes.
   */
  function handleOptionsChange (e) {
    var eventName = 'set:' + e.id;
    this._eventOutput.emit(eventName, e);
  };

  /*
   * Should be called on the children.
   *
   * How the flow works:
   *  #1: user calls setOptions on the parent:
   *
   *  parent.setOptions({
   *    size: [size]
   *  });
   *
   *  #2: auto emitted event from handleOptionsChange:
   *  parent._eventOutput emits -> "set:size", { id: 'size', value: [100,100] }
   *
   *  #3: the set:size event listener on the child automatically updates it's own data.
   *
   *  #4: the child emits a 'change:id' event, signaling that the data has actually been
   *  updated. Internally the children can set up event listeners like the following:
   *    c._eventInput.on('change:size', callback);
   */
  function autoUpdateFromOptionsChange () {
    for ( var key in this.options ) {
      this._eventInput.on('set:' + key, (function (e) {
        var obj = {};
        obj[e.id] = e.value;
        this.setOptions(obj);
        // emit change event after the data has been updated
        Engine.nextTick(wrapEvent(this, e));
      }).bind(this));
    };
  }

  /*
   *  Wrap the event to be called nexttick. Calling next tick to
   *  allow other handlers to update their own change events.
   */
  function wrapEvent (self, e) {
    return function () {
      self._eventInput.emit('change:' + e.id, e.value);
      console.log(e.id, e.value);
    }
  }

  module.exports = {
    listenToInternalChange: listenToInternalChange,
    handleOptionsChange: handleOptionsChange,
    autoUpdateFromOptionsChange : autoUpdateFromOptionsChange
  }

});
