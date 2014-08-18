define(function(require, exports, module) { 

    var Transitionable   = require('famous/transitions/Transitionable');
    var SpringTransition = require('famous/transitions/SpringTransition');
    var SnapTransition   = require('famous/transitions/SnapTransition');
    var WallTransition   = require('famous/transitions/WallTransition');

    Transitionable.registerMethod('spring', SpringTransition);
    Transitionable.registerMethod('snap', SnapTransition);
    Transitionable.registerMethod('wall', WallTransition);

});
