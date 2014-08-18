define(function(require, exports, module) {

  /*
   *  This enables an object on the constructor of a View
   *  to be used as an { event : prototypeMethodName } key pair.
   *
   *  @example
   *    function Slider () {
   *      // bind Slider.events
   *      EventCaller.bind.call(this);
   *    }
   *
   *    Slider.events = {
   *      'start'         : '_handleStart',
   *      'update'        : '_handleUpdate',
   *    }
   *
   *    // on deconstruct method, unbind the bound events.
   *    Slider.prototype.deconstruct = function deconstruct() {
   *      EventCaller.unbindAll.call(this);
   *    }
   *
   *    @method bind
   */
  function bind (eventObj, eventHandler) {
    if (!this._boundMethods) this._boundMethods = {};
    if (!eventObj) eventObj = this.constructor.events;
    if (!eventHandler) eventHandler = this._eventInput;
    
    for (var key in eventObj) {
      var method = eventObj[key];
      if (!this._boundMethods[key]) this._boundMethods[key] = [];
      var boundMethod = this[method].bind(this);
      this._boundMethods[key].push({handler: eventHandler, method: boundMethod});
      eventHandler.on(key, boundMethod);
    };
  }

  /*
   *  Remove all _boundMethods
   */
  function unbindAll() {
    for (var key in this._boundMethods) {
      unbind.call(this, key);
    }
  }

  /*
   *  Unbind an indvidual _boundMethod
   *  @param key {String} event Key to unbind.
   */
  function unbind (key) {
    if (this._boundMethods[key]) {
      for (var i = 0; i < this._boundMethods[key].length; i++) {
        var method = this._boundMethods[key][i].method;
        var handler = this._boundMethods[key][i].handler;
        handler.removeListener(key, method);
      };
    }
  }

  module.exports = {
    bind: bind,
    unbindAll: unbindAll,
    unbind: unbind
  }

});
