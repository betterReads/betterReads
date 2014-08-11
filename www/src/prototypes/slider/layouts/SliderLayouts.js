define(function(require, exports, module) {

  module.exports = { 
    'sequential': require('./Sequential'),
    'grid': require('./Grid'),
    'coverflow': require('./Coverflow'),
    'opacity': require('./SingularOpacity'),
    'twist': require('./SingularTwist'),
    'parallax': require('./SingularParallax'),
    'softScale': require('./SingularSoftScale'),
    'slideIn' : require('./SingularSlideIn'),
    'slideBehind' : require('./SingularSlideBehind')
  }

});
