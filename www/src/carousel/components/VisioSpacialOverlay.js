define(function(require, exports, module) {
  var Surface       = require('famous/core/Surface');
  var View          = require('famous/core/View');
  var Modifier      = require('famous/core/Modifier');
  var JSCSS         = require('../css/JSCSS');
  var ObjectHelpers = require('../helpers/ObjectHelpers');

  JSCSS.add('.famous-visio-spacial-overlay', { 
    'background': '-moz-linear-gradient(left,     rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0)  65%, rgba(0,0,0,0.5) 100%)', /* FF3.6+ */
    'background': '-webkit-linear-gradient(left,  rgba(0,0,0,0.5) 0%, transparent   45%, transparent    65%, rgba(0,0,0,0.5) 100%)', /* Chrome10+,Safari5.1+ */
    'background': '-o-linear-gradient(left,       rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0)  65%, rgba(0,0,0,0.5) 100%)', /* Opera 11.10+ */
    'background': '-ms-linear-gradient(left,      rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0)  65%, rgba(0,0,0,0.5) 100%)', /* IE10+ */
    'background': 'linear-gradient(to right,      rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0)  65%, rgba(0,0,0,0.5) 100%)', /* W3C */
    'background-size': '100% 100%',
    'pointer-events': 'none'
  });

  /**
   * VisioSpacialOverlay extension.
   *
   * @class VisioSpacialOverlay
   * @param {Object} [options] An object of configurable options.
   * @param {Number} [options.visioOpacity] Opacity of surface
   * @param {Array} [options.visioClasses] Classes of the visio surface. Warning!
   * You must include the `famous-visio-spacial-overlay` class to get the effect.
   * @param {Array} [options.visioSize] size of the surface.
   *
   * @constructor
   * @protected
   * 
   */
  function VisioSpacialOverlay () {
    View.apply(this, arguments);

    this.surface = new Surface({
      classes: this.options.visioClasses,
      size: this.options.visioSize
    });

    this.mod = new Modifier({
      opacity: this.options.visioOpacity
    });
    this.add(this.mod).add(this.surface);
  }

  ObjectHelpers.inherits(VisioSpacialOverlay, View);

  VisioSpacialOverlay.DEFAULT_OPTIONS = { 
    visioOpacity: 1,
    visioClasses: ['famous-visio-spacial-overlay'],
    visioSize: undefined
  }

  VisioSpacialOverlay.NAME = 'visio';
  
  module.exports = VisioSpacialOverlay;
});
