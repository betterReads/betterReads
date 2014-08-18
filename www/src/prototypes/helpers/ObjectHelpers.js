define(function(require, exports, module) {

  /*
   *  Shallow copy b into a.
   *  @method extend
   */
  function extend (a, b) {
    for (var key in b) a[key] = b[key];
  }

  /*
   * Set up prototypal inheritance chain.
   * @method inherits
   */
  function inherits (a, b) {
    a.prototype = Object.create(b.prototype);
    a.prototype.constructor = a;
  }

  /*
   * Return new object with combination of a & b.
   * @method merge
   */
  function merge (a, b) {
    var obj = {};
    extend(obj, a);
    extend(obj, b);
    return obj;
  }

  /*
   *  Deep clone an object.
   *  @param b {Object} Object to clone
   *  @return a {Object} Cloned object.
   */
  function clone(b) {
      var a;
      if (typeof b === 'object') {
          a = {};
          for (var key in b) {
              if (typeof b[key] === 'object') {
                  if (b[key] instanceof Array) {
                      a[key] = new Array(b[key].length);
                      for (var i = 0; i < b[key].length; i++) {
                          a[key][i] = clone(b[key][i]);
                      }
                  }
                  else {
                    a[key] = clone(b[key]);
                  }
              }
              else {
                  a[key] = b[key];
              }
          }
      }
      else {
          a = b;
      }
      return a;
  };

  module.exports = { 
    extend: extend,
    inherits: inherits,
    merge: merge,
    clone: clone
  };

});
