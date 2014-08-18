define(function(require, exports, module) {
  var Transform     = require('famous/core/Transform');
  var TwoDim        = require('../../math/TwoDim');
  var Chainer       = require('../../modifier/Chainer');

  function layout (currentFn, lastFn, otherFn) {

    var getItem = (function (i) {
      return {
        item : this.data.items[i],
        size: this.data.items[i].getSize(true),
        
        parentTrans : this.data.parentTransforms[i],
        parentOpacity : this.data.parentOpacities[i],
        parentOrigin: this.data.parentOrigins[i],
        parentAlign: this.data.parentAligns[i],
        parentSize: this.data.parentSizes[i],

        trans : this.data.childTransforms[i],
        opacity : this.data.childOpacities[i],
        origin: this.data.childOrigins[i],
        align: this.data.childAligns[i],
      }
    }).bind(this);

    for (var i = 0; i < this.sequence.length(); i++) {
      var containerSize = this.getSize().slice(0);
      var index = this.sequence.getIndex();
      var lastIndex = this.sequence.getLastIndex();
      if (i == index) {
        currentFn.call(this, getItem(i), containerSize, index, lastIndex)
      } 
      else if (i == lastIndex) {
        lastFn.call(this, getItem(i), containerSize, index, lastIndex)
      } 
      else {
        otherFn.call(this, getItem(i), containerSize, index, lastIndex)
      }
    }
  }

  function cleanup () {
    for (var i = 0; i < this.data.items.length; i++) {
      this.data.childOrigins[i].set([0, 0]);
      this.data.childAligns[i].set([0, 0]);
      this.data.childOpacities[i].set(1);
      this.data.childTransforms[i].set(Transform.identity);

      this.data.parentOrigins[i].set([0, 0]);
      this.data.parentAligns[i].set([0, 0]);
      this.data.parentTransforms[i].set(Transform.identity);
      this.data.parentOpacities[i].set(1);
      this.data.parentSizes[i].set([undefined, undefined]);
    }
  }

  function center() {
    for (var i = 0; i < this.data.items.length; i++) {
      this.data.childOrigins[i].set([0.5, 0.5]);
      this.data.childAligns[i].set([0.5, 0.5]);
      this.data.parentOrigins[i].set([0.5, 0.5]);
      this.data.parentAligns[i].set([0.5, 0.5]);
    }
  }

  module.exports = {
    layout: layout,
    cleanup: cleanup,
    center: center
  }

});
