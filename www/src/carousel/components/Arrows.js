
define(function(require, exports, module) {
  var View                    = require('famous/core/View');
  var Modifier                = require('famous/core/Modifier');
  var ImageSurface            = require('famous/surfaces/ImageSurface');

  var Surface                 = require('famous/core/Surface');

  var Transform               = require('famous/core/Transform');
  var Transitionable          = require('famous/transitions/Transitionable');
  var TransitionableTransform = require('famous/transitions/TransitionableTransform');
  var Timer                   = require('famous/utilities/Timer');

  /**
   *  Adjustable arrows used for Carousel navigation.
   *
   *  @class Arrows
   *  @constructor
   *  @protected
   *  
   *  @param {Object} [options] An object of configurable options.
   *  @param {String} [options.position] Valid options: ["bottom" | "middle" | "top"]. Determines the vertical placement of the arrows. The horizontal position of the arrows are flush against left/right bounding border of the carousel.
   *  @param {Array|2D} [options.padding] Determines the displacement from the arrow position set by arrowsPosition. The first value in the array corresponds to the horizontal offset where a positive value pushes the arrows towards the center of the carousel. The second value in the array corresponds to the vertical offset where a positive value pushes the arrow down towards the bottom of the carousel.
   *  @param {String} [options.previousIconURL] URL of an image to use for the previous button skin.
   *  @param {String} [options.nextIconURL] URL of an image to use for the next button skin.
   *  @param {Boolean} [options.animateOnClick] Determines whether arrows display animation on click.
   *  @param {Boolean} [option.toggleDisplayOnHover] Determines whether arrows should be animated in/out when user hovers over the carousel. A value of 'false' signifies that the arrows will always be displayed.
   *  @css {.famous-carousel-arrow} CSS class applied to the arrows.
   */
  function Arrows(options) {
    View.apply(this, arguments);

    // Store reference to surfaces/modifiers/transitionableTransforms
    this._storage = {
      prev: {
        surface: null,
        positionMod: null,
        animationMod: null,
        transTransform: null,
        opacityTrans: null
      },
      next: {
        surface: null,
        positionMod: null,
        animationMod: null,
        transTransform: null,
        opacityTrans: null
      }
    }

    // Keep track of arrow animation state
    this._arrowsDisplayed = this.options['toggleDisplayOnHover'] ? false : true;
    this._animationQueue = {
      showCount: 0,
      hideCount: 0
    }

    this._init();
  }

  Arrows.prototype = Object.create(View.prototype);
  Arrows.prototype.constructor = Arrows;

  Arrows.DEFAULT_OPTIONS = {
    'position' : 'center',
    'padding' : [10, 0],
    'previousIconURL' : undefined,
    'nextIconURL' : undefined,
    'animateOnClick' : true,
    'toggleDisplayOnHover' : true
  }

  Arrows.POSITION_TO_ALIGN = {
    'bottom' : 1,
    'middle' : 0.5,
    'top'    : 0
  }

  Arrows.ANIMATION_OPTIONS = {
    click: {
      offset: 10,
      transition: {
        curve: 'outBack',
        duration: 250
      }
    },
    display: {
      curve: 'outExpo',
      duration: 600
    }
  }

  /**
   * Show arrows.
   *
   * @protected
   * @method show
   */
  Arrows.prototype.show = function show() {
    if(!this._arrowsDisplayed) {
      this._arrowsDisplayed = true;
      this._animationQueue.showCount++;
      this._queueAnimation('show');
    }
  }

  /**
   * Hide arrows.
   *
   * @protected
   * @method hide
   */
  Arrows.prototype.hide = function hide() {
    if(this._arrowsDisplayed) {
      this._arrowsDisplayed = false;
      this._animationQueue.hideCount++;
      this._queueAnimation('hide');
    }
  }

  /**
   * Initializes Arrows class.
   *
   * @protected
   * @method _init
   */
  Arrows.prototype._init = function _init() {
    this._initContent();
    this._events(this);
  }

  /**
   * Creates and adds ImageSurfaces used for prev/next arrow icons.
   * If an arrowURL is undefined, the Famo.us hosted stock arrow is used.
   *
   * @protected
   * @method _initContent
   */
  Arrows.prototype._initContent = function _initContent() {
    var options = this._defineOptions(this.options['position']);
    var initialOpacity = this._arrowsDisplayed ? 1 : 0;

    //-----------Set up Arrows-----------//
    for(var arrowName in options) {
      var storage = this._storage[arrowName];
      //Initialize position and animation Modifiers
      storage.positionMod = new Modifier({
        origin: [0.5, 0.5],
        align: [0.5, 0.5],
        transform: Transform.translate(options[arrowName].translation[0], options[arrowName].translation[1])
      });
      storage.transTransform = new TransitionableTransform();
      storage.opacityTrans = new Transitionable(0);
      storage.animationMod = new Modifier({
        transform: storage.transTransform,
        opacity: storage.opacityTrans
      });

      //Create ImageSurface
      storage.surface = new ImageSurface({
        classes: ['famous-carousel-arrow', options[arrowName].className],
        content: options[arrowName].iconURL,
        size: [true, true],
        properties: options[arrowName].properties
      });

      //Add Surface
      this.add(storage.positionMod)
          .add(storage.animationMod)
          .add(storage.surface);

      //Initialize opacity and position
      Timer.after(function(storage, arrowName, initialOpacity){
        storage.positionMod.setOrigin(options[arrowName].placement);
        storage.positionMod.setAlign(options[arrowName].placement);
        storage.opacityTrans.set(initialOpacity);
      }.bind(null, storage, arrowName, initialOpacity), 2);
    }
  }

  /**
   * Sets up options used to create and position arrows.
   *
   * @protected
   * @method _defineOptions
   * @param {String} [position]
   * @return {Object} An object with properties used to create arrow Surfaces & Modifiers
   */
  Arrows.prototype._defineOptions = function _defineOptions(position) {
    var padding = this.options['padding'];

    var defaultBorderWidth = 2;
    var defaultPadding = 5;
    var defaultProperites = {
      border: defaultBorderWidth + 'px solid #404040',
      padding: defaultPadding + 'px',
      borderRadius: '50%',
      zIndex: 2
    }

    var options = {
      prev: {className: 'famous-carousel-arrow-previous'},
      next: {className: 'famous-carousel-arrow-next'}
    };
    extraOffset = -defaultBorderWidth - defaultBorderWidth;

    //Check to see if default image needs to be used.
    if(this.options['previousIconURL'] === undefined) {
      options.prev.iconURL = '/images/icons/arrow_left_dark.svg'; //TODO: Change to hosted URL
      options.prev.properties = defaultProperites;
    } else {
      options.prev.iconURL = this.options['previousIconURL'];
      options.prev.properties = {zIndex: 2};
    }

    if(this.options['nextIconURL'] === undefined) {
      options.next.iconURL = '/images/icons/arrow_right_dark.svg'; //TODO: Change to hosted URL
      options.next.properties = defaultProperites;
      options.next.extraXPadding = extraOffset; //Used to offset padding/border on default image.
    } else {
      options.next.iconURL = this.options['nextIconURL'];
      options.next.properties = {zIndex: 2};
      options.next.extraXPadding = 0;
    }

    //Calculate vertically padding/border offset (dependent on position)
    var extraYPadding;
    if(position === 'top') extraYPadding = 0;
    else if(position === 'middle') extraYPadding = extraOffset / 2;
    else extraYPadding = extraOffset;

    options.prev.placement = [0, Arrows.POSITION_TO_ALIGN[position]];
    options.prev.translation = [padding[0], extraYPadding - padding[1]];
    
    options.next.placement = [1, Arrows.POSITION_TO_ALIGN[position]];
    options.next.translation = [extraOffset - padding[0], extraYPadding - padding[1]];

    return options;
  }

  /**
   * Sets up arrows click events.
   *
   * @protected
   * @method _events
   */
  Arrows.prototype._events = function _events() {
    var prevSurf = this._storage.prev.surface;
    var nextSurf = this._storage.next.surface;

    //Click Events
    prevSurf.on('click', this._onPrev.bind(this));
    nextSurf.on('click', this._onNext.bind(this));

    //Hover Events
    if(this.options['toggleDisplayOnHover']) {
      prevSurf.on('mouseover', this.show.bind(this));
      nextSurf.on('mouseover', this.show.bind(this));
      prevSurf.on('mouseout', this.hide.bind(this));
      nextSurf.on('mouseout', this.hide.bind(this));
    }
  }

  /**
   * Emits 'previous' end and triggers animation
   *
   * @protected
   * @method _onPrev
   */
  Arrows.prototype._onPrev = function _onPrev(){
    this._eventOutput.emit('previous');
    this._animateArrow(this._storage.prev.transTransform, -1);
  }

  /**
   * Emits 'next' end and triggers animation
   *
   * @protected
   * @method _onNext
   */
  Arrows.prototype._onNext = function _onNext(){
    this._eventOutput.emit('next');
    this._animateArrow(this._storage.next.transTransform, 1);
  }

  /**
   * Animates an arrow.
   *
   * @protected
   * @method _animateArrow
   * @param {TransionableTransform} [transTransform] TransionableTransform attached to Modifier of clicked arrow.
   * @param {Number} [direction] Direction of animation. -1 for left, 1 for right.
   */
  Arrows.prototype._animateArrow = function _animateArrow(transTransform, direction) {
    if(!this.options['animateOnClick']) return;

    var opts = Arrows.ANIMATION_OPTIONS.click;
    transTransform.halt();
    transTransform.set(
      Transform.translate(opts.offset * direction, 0),
      {duration: 1},
      function(){
        transTransform.set(
          Transform.identity,
          opts.transition
        );
      }
    );
  }

  /**
   * Queues up show/hide animation for both arrows.
   * (Prevents triggering animation if both show+hide are called within 
   * a threshold interval. Used to prevent triggering animation when hovering
   * over an arrow inside of the Carousel.)
   *
   * @protected
   * @method _queueAnimation
   */
  Arrows.prototype._queueAnimation = function _queueAnimation() {
    var q = this._animationQueue;
    Timer.setTimeout(function(){
      while(q.showCount > 0 && q.hideCount > 0) {
        q.showCount--;
        q.hideCount--;
      }
      if(q.showCount > 0) {
        q.showCount--;
        this._showOrHide('show');
      } else if(q.hideCount > 0) {
        q.hideCount--;
        this._showOrHide('hide');
      }
    }.bind(this), 25);
  }

  /**
   * Triggers animatino to show or hide the arrows.
   *
   * @protected
   * @method _showOrHide
   * @param {String} [actionName] 'show' or 'hide'
   */
  Arrows.prototype._showOrHide = function _showOrHide(actionName) {
    //----------------Set Animation Options----------------//
    var opts = Arrows.ANIMATION_OPTIONS.display;
    var duration = opts.duration;
    var opacity;
    var scale1 = 1.2;
    var scale2;
    var delay;
    if(actionName === 'show') {
      opacity = 1;
      scale2 = 1;
      delay = 0;
    } else {
      opacity = 0;
      scale2 = 0.001;
      delay = duration / 2;
    }

    //----------------Trigger Animations----------------//
    var prevOpacity = this._storage.prev.opacityTrans;
    var nextOpacity = this._storage.next.opacityTrans;
    var prevTrans = this._storage.prev.transTransform;
    var nextTrans = this._storage.next.transTransform;

    //Halt transitions
    prevOpacity.halt();
    nextOpacity.halt();
    prevTrans.halt();
    nextTrans.halt();

    //Set Opacity.
    prevOpacity.delay(delay, function() {
      prevOpacity.set(opacity, {duration: duration/2, curve: 'outBack'});
      nextOpacity.set(opacity, {duration: duration/2, curve: 'outBack'});
    })

    //Set Transform
    prevTrans.set(
      Transform.scale(scale1, scale1),
      {duration: duration * 1/4, curve: opts.curve},
      function() {
        prevTrans.set(Transform.scale(scale2, scale2), {duration: duration * 3/4, curve: opts.curve});
      }
    );

    nextTrans.set(
      Transform.scale(scale1, scale1),
      {duration: duration * 1/4, curve: opts.curve},
      function() {
        nextTrans.set(Transform.scale(scale2, scale2), {duration: duration * 3/4, curve: opts.curve});
      }
    );
  }

  module.exports = Arrows;
});
