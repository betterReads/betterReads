define(function(require, exports, module) {
  var JSCSS = require('./JSCSS');

  var addedRules = [];

  /*
   * Add famous specific styles. Index of added rules stored in the
   * addedRules array.
   */
  function addRules() {

    addedRules.push(JSCSS.add('famous-container, .famous-group', {
      'position'                    : 'absolute',
      'top'                         : '0px',
      'left'                        : '0px',
      'bottom'                      : '0px',
      'right'                       : '0px',
      'overflow'                    : 'visible',
      '-webkit-transform-style'     : 'preserve-3d',
      'transform-style'             : 'preserve-3d',
      '-webkit-backface-visibility' : 'visible',
      'backface-visibility'         : 'visible',
      'pointer-events'              : 'none'
    }));

    addedRules.push(JSCSS.add('.famous-group', {
      'width'                       : '0px',
      'height'                      : '0px',
      'margin'                      : '0px',
      'padding'                     : '0px',
      '-webkit-transform-style'     : 'preserve-3d',
      'transform-style'             : 'preserve-3d'
    }));

    addedRules.push(JSCSS.add('.famous-surface', {
      'position'                    : 'absolute',
      '-webkit-transform-origin'    : 'center center',
      'transform-origin'            : 'center center',
      '-webkit-backface-visibility' : 'hidden',
      'backface-visibility'         : 'hidden',
      '-webkit-transform-style'     : 'flat',
      'transform-style'             : 'preserve-3d', /* performance */
      '-webkit-box-sizing'          : 'border-box',
      '-moz-box-sizing'             : 'border-box',
      '-webkit-tap-highlight-color' : 'transparent',
      'pointer-events'              : 'auto'
    }));

    addedRules.push(JSCSS.add('.famous-container-group', {
      'position'                    : 'relative',
      'width'                       : '100%',
      'height'                      : '100%'
    }));
  }

  /*
   *  Remove all Famous.css rules.
   *  @method removeRules
   */
  function removeRules() {
    for (var i = 0; i < addedRules.length; i++) {
      JSCSS.removeRule(addedRules[i].destroy());
    };
  }

  // Automatically add once required.
  addRules();

  // API: remove only.
  module.exports = {
    removeRules: removeRules
  }
});
