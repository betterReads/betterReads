define(function(require, exports, module) {
  var Transform     = require('famous/core/Transform');
  var Chainer       = require('../modifier/Chainer');

  function layout (currentFn, lastFn, otherFn) {

    var getItem = (function (i) {
      return {
        item : this.items[i],
        size: this.data.sizeCache[i],
        index: i,
        
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

    for (var i = 0; i < this.nodes.length; i++) {
      var containerSize = this.getSize().slice(0);
      if (i == this.index) {
        currentFn.call(this, getItem(i), containerSize, this.index, this.lastIndex)
      } 
      else if (i == this.lastIndex) {
        lastFn.call(this, getItem(i), containerSize, this.index, this.lastIndex)
      } 
      else {
        otherFn.call(this, getItem(i), containerSize, this.index, this.lastIndex)
      }
    }
  }

  function init (curve) {
    for (var i = 0; i < this.nodes.length; i++) {
      this.data.childOrigins[i].set([0.5, 0.5], curve);
      this.data.childAligns[i].set([0.5, 0.5], curve);

      if(i == this.index) {
        this.data.childOpacities[i].set(1, curve);
        this.data.childTransforms[i].set(Transform.identity, curve);
      } else {
        this.data.childOpacities[i].set(0, curve);
        this.data.childTransforms[i].set(Transform.translate(0,0,-1), curve);
      }

      this.data.parentOrigins[i].set([0.5, 0.5], curve);
      this.data.parentAligns[i].set([0.5, 0.5], curve);

      this.data.parentTransforms[i].set(Transform.identity, curve);
      this.data.parentOpacities[i].set(1, curve);
      this.data.parentSizes[i].set([undefined, undefined]);
    }
  }

  function cleanup () {
    for (var i = 0; i < this.nodes.length; i++) {
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
    for (var i = 0; i < this.nodes.length; i++) {
      this.data.childOrigins[i].set([0.5, 0.5]);
      this.data.childAligns[i].set([0.5, 0.5]);
      this.data.parentOrigins[i].set([0.5, 0.5]);
      this.data.parentAligns[i].set([0.5, 0.5]);
    }
  }

  function uncenter (curve) {
    for (var i = 0; i < this.nodes.length; i++) {
      this.data.childOrigins[i].set([0, 0], curve);
      this.data.childAligns[i].set([0, 0], curve);
      this.data.parentOrigins[i].set([0, 0], curve);
      this.data.parentAligns[i].set([0, 0], curve);
    };
  }

  module.exports = {
    layout: layout,
    cleanup: cleanup,
    center: center,
    uncenter: uncenter,
    init: init
  }

});
