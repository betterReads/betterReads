define(function(require, exports, module) {
  var EventHandler    = require('famous/core/EventHandler');
  var Controller      = require('../../constructors/Controller');
  var DiscreteOptions = require('../../options/DiscreteOptions');
  var EventCaller     = require('../../events/EventCaller');

  /**
   *  A sequence that is mapped to an array.
   *  @class Sequence
   *  @constructor
   */
  function Sequence ( options, array ) {
    Controller.apply(this, arguments);
    this.arrays = {};
    this._length;
    this.index = options.index || 0;
    this._lastIndex = this.index;
    EventCaller.bind.call(this);
    DiscreteOptions.autoUpdateFromOptionsChange.call(this);
  }

  Sequence.prototype = Object.create( Controller.prototype);
  Sequence.prototype.constructor = Sequence;

  Sequence.DEFAULT_OPTIONS = { 
    'loop': false,
    'pagination': 1
  }

  /*
   *  Pipe into the sequence to trigger changes.
   */
  Sequence.events = { 
    'set'           : 'set',
    'set:next'      : 'setNext',
    'set:previous'  : 'setPrevious'
  }

  /**
   *  Register an array to be managed by the sequence
   *  @method registerArray
   */
  Sequence.prototype.registerArray = function registerArray(key, array) {
    if (this.arrays[key]) throw key + ' Array already registered';
    this.arrays[key] = array;
    this._length = array.length;
  }

  /**
   *  Convenience: set next slide, adjust for looping.
   *  @method setNext
   */
  Sequence.prototype.setNext = function setNext( increment ) {
    if (!increment) increment = 1;
    var index = this.index + (increment * this.options['pagination'])
    return this.set(index);
  }

  /**
   *  Convenience: set previous slide, adjust for looping.
   *  @method setPrevious
   */
  Sequence.prototype.setPrevious = function setPrevious( increment ) {
    if (!increment) increment = 1;
    var index = this.index - (increment * this.options['pagination']);
    return this.set(index);
  }

  /**
   *  Convenience, get the final length
   *  @method length
   */
  Sequence.prototype.length = function length() {
    return this._length;
  }

  /**
   *  Get paginated length. It is rounded up, because remainders get
   *  added to the last page.
   *
   *  @method paginatedLength
   */
  Sequence.prototype.paginatedLength = function paginatedLength() {
    return Math.ceil(this._length / this.options['pagination']);
  }
  
  Sequence.prototype.getPagination = function () {
    return this.options['pagination'];
  }

  /**
   *  Get current index, adjusted for pagination.
   *  @method getPaginatedIndex
   *  @returns {Number} Paginated Index
   */
  Sequence.prototype.getPaginatedIndex = function getPaginatedIndex() {
    return Math.floor(this.index / this.options['pagination']);
  }

  /**
   *  Set current index of the array.
   *  @param index {number}
   */
  Sequence.prototype.set = function set (index) {
    if (index == this.index) return;

    index = this.clamp(index);
    this._lastIndex = this.index;
    this.index = index;
    this._eventOutput.emit('set', this.index);
    return this.index;
  }

  /**
   *  Clamp or loop a number based on options.
   *  @param index {Number} number to clamp or loop.
   *  @returns index {Number} clamped or looped number
   *  @method index
   */
  Sequence.prototype.clamp = function clamp( index, loop ) {
    if (typeof loop == 'undefined') loop = this.options['loop']
    if (index > this._length - 1) {
      if (loop) index = 0
      else {
        index = this._length - 1;
      }
    } else if (index < 0 ) {
      if (loop) index = this._length - 1;
      else {
        index = 0;
      }
    }
    return index;
  }

  /**
   *  Get current index
   *  @method getIndex
   */
  Sequence.prototype.getIndex = function getIndex() {
    return this.index;
  }

  /**
   *  Get last known index
   *  @method getIndex
   */
  Sequence.prototype.getLastIndex = function getLastIndex() {
    return this._lastIndex;
  }

  /**
   *  Splice all managed arrays.
   *  @method splice
   */
  Sequence.prototype.splice = function splice(index, num, silent) {
    for (var key in this.arrays) {
      var _array = this.arrays[key];
      _array.splice.apply(_array, arguments);
    }
    if (!silent) this._eventOutput.emit('remove');
  }

  /**
   *  Remove at value, or remove an array of values.
   *  @param values {Array|Number} Values to remove
   */
  Sequence.prototype.remove = function remove( values ) {
    if (values instanceof Array) {
      for (var i = 0; i < values.length; i++) {
        this.splice(values[i], 1);
      };
    }
    else {
      return this.splice(values, 1);
    }
  }

  module.exports = Sequence;
});
