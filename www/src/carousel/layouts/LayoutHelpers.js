define(function(require, exports, module) {
  var Transform     = require('famous/core/Transform');

  function orderedLoop (pre, main, post) {
    for (var i = 0; i < this.nodes.length; i++) {
      if (i < (this.index - this.renderLimit[0])) { 
        var index = this._sanitizeIndex(i);
        console.log('pre', index);
      } 
      else if (i < this.index + this.renderLimit[1]) {
        var index = this._sanitizeIndex(i);
        console.log('main bulk', index);
      }
      else { 
        var index = this._sanitizeIndex(i);
        console.log('post', index);
      }
    };
  }

  module.exports = {
    orderedLoop: orderedLoop
  }
});
