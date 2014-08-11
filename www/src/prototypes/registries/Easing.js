define(function(require, exports, module) {
    var Easing = require('famous/transitions/Easing');
    var TweenTransition = require('famous/transitions/TweenTransition');

    /**
     * Helper function to register easing curves globally in an application.
     * To use this, all you must do is require this in.
     *
     * @example
     *  // Anywhere in your application, typically in app.js
     *  var RegisterEasing = require('registries/Easing');
     *  // Allows transitions as follows: 
     *  myModifier.setTransform(Transform.identity, {
     *    curve: 'outExpo', // as a string.
     *    duration: 500 
     *  });
     *
     * @class RegisterEasing
     */
    function getAvailableTransitionCurves() { 
        var keys = getKeys(Easing).sort();
        var curves = {};
        for (var i = 0; i < keys.length; i++) {
            curves[keys[i]] = (Easing[keys[i]]);
        };
        return curves;
    }

    function getKeys(obj){
        var keys = [];
        for (key in obj) {
            if (obj.hasOwnProperty(key)){
                keys.push(key);
            }
        }
        return keys;
    };

    function registerKeys () {
        var curves = getAvailableTransitionCurves();
        for ( var key in curves ) {
            TweenTransition.registerCurve( key, curves[key] )
        };  
    }

    registerKeys();

});
