/*globals define*/
define(function(require, exports, module) {
    'use strict';
    var Engine            = require('famous/core/Engine');
    var Modifier          = require('famous/core/Modifier');
    var Timer             = require('famous/utilities/Timer');
    var FamousCss         = require('../css/FamousCss');
    var RegisterEasing    = require('../registries/Easing');
    var RegisterPhysics   = require('../registries/Physics');
    var ClassToImages     = require('../dom/ClassToImages');
    var Carousel          = require('../Carousel');
    
    function CarouselPlugin (querySelector, opts) {
      if (!opts) opts = {};
      opts.parentQuery = querySelector;

      if (!opts.items) {
        opts.items = ClassToImages(querySelector);
      }
      
      var container = document.querySelector(querySelector)
      var mainContext = Engine.createContext(container);

      var carousel = new Carousel(opts);
      mainContext.add(carousel);

      /**
       *  Plugin method only: 
       *  Deconstruct a carousel.
       *  @param {Object} [options] 
       *  @param {Boolean} [options.turnOffLoop] Stop the request AnimationFrame loop if true.
       *  @param {Function} [options.callback] Callback to call when carousel is fully deconstructed.
       */
      carousel.deconstruct = function (opts) {
        if (!opts) opts = {};
        mainContext._node._child = undefined;
        
        var fragments = carousel.getFragments();
        for (var i = 0; i < fragments.length; i++) {
          container.appendChild(fragments[i]);
        };

        if (opts.turnOffLoop || opts.callback) {
          Timer.after(function () {
            if (opts.turnOffLoop) Engine.setOptions({ runLoop: false });
            if (opts.callback) opts.callback();
          }, 3); // 2 full frames, + 1 because Timer executes on 'prerender'
        }
      }

      return carousel;
    }
    
    CarouselPlugin.Grid                = Carousel.Grid;
    CarouselPlugin.Coverflow           = Carousel.Coverflow;
    CarouselPlugin.Sequential          = Carousel.Sequential;
    CarouselPlugin.SingularOpacity     = Carousel.SingularOpacity;
    CarouselPlugin.SingularSlideIn     = Carousel.SingularSlideIn;
    CarouselPlugin.SingularSlideBehind = Carousel.SingularSlideBehind;
    CarouselPlugin.SingularParallax    = Carousel.SingularParallax;
    CarouselPlugin.SingularTwist       = Carousel.SingularTwist;
    CarouselPlugin.SingularSoftScale   = Carousel.SingularSoftScale;

    module.exports = CarouselPlugin;
});
