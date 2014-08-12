define(function(require, exports, module) {
    var Timer = require('famous/utilities/Timer');
    var Engine = require('famous/core/Engine');

    /*
     *  When a predicate evaluates to true, execute the executeFn. (Polling promise.all).
     *  @param predicates {Array|Function} functions that returns true / false
     *  @param executeFn {Function} function to execute after predicate returns true
     *  @param numTicks {Number} How often we should check. By default, it's every frame.
     */
    function when( predicates, executeFn, numTicks ) {
        if (!numTicks) numTicks = 1;
        if (!(predicates instanceof Array)) predicates = [predicates];

        var waitFn = Timer.every(function () {
            for (var i = 0; i < predicates.length; i++) {
                if (!predicates[i]()) return;
            };
            executeFn();
            Timer.clear(waitFn);
        }, numTicks);
    }

    /*
     *  A pipes to B, and B to A.
     *  @param {Class} eventerA 
     *  @param {Class} eventerB 
     */
    function dualPipe (eventerA, eventerB ) {
        eventerA.pipe(eventerB);
        eventerB.pipe(eventerA);
    }

    function clear (fn) {
      Engine.removeListener('prerender', fn);
    }

    function frameQueue (executeFn, numTicks) {
      var originalNumberOfTicks = numTicks;

      var waitFn = function () {
          numTicks--;
          if (numTicks <= 0) { 
            executeFn();
            clear(waitFn);
          }
      };

      Engine.on('prerender', waitFn);

      return function () {
        numTicks = originalNumberOfTicks;
      }
    }
    
    module.exports = {
        when: when,
        dualPipe: dualPipe,
        frameQueue: frameQueue
    }
});
