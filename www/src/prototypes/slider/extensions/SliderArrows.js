define(function(require, exports, module) {
  var Surface                 = require('famous/core/Surface');
  var View                    = require('famous/core/View');
  var Modifier                = require('famous/core/Modifier');
  var Transform               = require('famous/core/Transform');
  var Transitionable          = require('famous/transitions/Transitionable');
  var TransitionableTransform = require('famous/transitions/TransitionableTransform');
  var TwoDim                  = require('../../math/TwoDim');
  var Chainer                 = require('../../modifier/Chainer');
  var DiscreteOptions         = require('../../options/DiscreteOptions');
  var EventCaller             = require('../../events/EventCaller');

  /**
   *  Adjustable arrows for your Slider.
   *
   *  @class SliderArrows
   *  @constructor
   *  @param {Object} [options] An object of configurable options.
   *  @param {Transform} [options.arrowInitialTransform] The initial Famous Transform that is applied to the arrow.
   *  @param {Number} [options.arrowInitialOpacity] The opacity applied to the arrows when first created.
   *  @param {Object} [options.arrowShow] TODO: Refactor how this is exposed.
   *  @param {Object} [options.arrowShow.movement] Testing
   *  
   */
  function SliderArrows (options) {
    View.apply(this, arguments);
    this._arrows = {
      // filled with:
      // 'set:next' : [ arrow, arrowBacking]
    };
    this._init();
  }

  SliderArrows.prototype = Object.create(View.prototype);
  SliderArrows.prototype.constructor = SliderArrows;

  SliderArrows.NAME = 'sliderArrows';

  SliderArrows.onEventInput = { 
    /**
     *  On mouseenter event, show.
     *  @event mouseenter
     *  @type eventInput
     */
    'mouseenter': 'show',
    /**
     *  On mouseleave event, hide.
     *  @event mouseleave
     *  @type eventInput
     */
    'mouseleave': 'hide'
  };

  SliderArrows.onEventOutput = {
    /**
     *  On set:next, trigger the `next` animation.
     *  @event set:next
     *  @type eventOutput
     */
    'set:next': 'animateNext',
    /**
     *  On set:previous, trigger the `previous` animation.
     *  @event set:previous
     *  @type eventOutput
     */
    'set:previous': 'animatePrevious'
  }

  /**
   * Creates arrows based on options passed in for 'nextArrow' and 'previousArrow'
   * Initializes event listeners.
   *
   * @method init
   * @private
   */
  SliderArrows.prototype._init = function _init() {
    var createArrows = (function ( array, event ) {
      for (var i = 0; i < array.length; i++) {
        this._createArrow.call(this, array[i], event);
      };
    }).bind(this);

    createArrows(this.options['nextArrow'], 'set:next');
    createArrows(this.options['previousArrow'], 'set:previous');
    this._events();
  }

  /**
   * Sets up the class's event listeners.
   *
   * @method _events
   * @private
   */
  SliderArrows.prototype._events = function _events() {
    DiscreteOptions.listenToInternalChange.call(this);
    EventCaller.bind.call(this, SliderArrows.onEventInput);
    EventCaller.bind.call(this, SliderArrows.onEventOutput, this._eventOutput);
  }

  /*
   *  Sugared placements for arrows.
   */
  SliderArrows.ARROW_PLACEMENT = {
    'leftOutside': {
      origin: [1, 0.5],
      align: [0, 0.5],
      paddingMultiplier: [-1, 0]
    },
    'rightOutside': {
      origin: [0, 0.5],
      align: [1, 0.5],
      paddingMultiplier: [1, 0]
    },
    'leftInside': {
      origin: [0, 0.5],
      align: [0, 0.5],
      paddingMultiplier: [1, 0]
    },
    'rightInside': {
      origin: [1, 0.5],
      align: [1, 0.5],
      paddingMultiplier: [-1, 0]
    },
  }

  /*
   *  Normalized Placements, mixed in with arrow placements, to ensure no null values.
   *  @static
   */
  SliderArrows.NORMALIZED_PLACEMENT = {
    sizeTranslate: [0, 0],
    origin: [0, 0],
    align: [0, 0],
    translate: [0, 0, 0],
    paddingMultiplier: [0, 0, 0]
  }

  SliderArrows.DEFAULT_OPTIONS = {
    'arrowBackingClasses': ['slider-arrow-backing'], //Note: this is what is used in app.css
    'arrowInitialTransform': Transform.scale(0.5, 0.5, 0.5),
    'arrowInitialOpacity': 0.5,
    'arrowShow': {
      'movement': [
        {
          transformFinal: Transform.scale(1, 1, 1),
          curve: {
            method: 'snap',
            period: 250,
            dampingRatio: 0.25
          }
        },
      ],
      'opacityTransition' : {
        value : 1,
        transition : {duration: 500, curve: 'linear'}
      }
    },
    'arrowHide': {
      'movement': [
        {
          transformFinal: Transform.scale(1.2, 1.2, 1.2),
          curve: {
            curve: 'outExpo',
            duration: 200,
          }
        },
        {
          transformFinal: Transform.scale(0.001, 0.001, 0.001),
          curve: {
            curve: 'outExpo',
            duration: 450
          }
        }
      ],
      'opacityTransition' : {
        value : 0.1,
        transition : {duration: 500, curve: 'linear'}
      }
    },
    'arrowIncludeBacking': true,
    'arrowPadding': 12,
    'nextArrow': [
      {
        placement: 'rightInside',
        properties: { zIndex: 2 },
        imageSrc: '/images/icons/arrow_right_dark.svg',
        classes: ['slider-arrow', 'no-user-select']
      }
    ],
    'previousArrow': [
      {
        placement: 'leftInside',
        properties: { zIndex: 2 },
        imageSrc: '/images/icons/arrow_left_dark.svg',
        classes: ['slider-arrow', 'no-user-select']
      }
    ],
    'arrowOnClickMoves': {
      'set:next' : [
        {
          transformFinal: Transform.translate(1, 0, 0),
          curve: {
            duration: 1
          }
        },
        {
          transformFinal: Transform.translate(0, 0, 0),
          curve: {
            method: 'snap',
            period: 150,
            dampingRatio: 0.25
          }
        },
      ],
      'set:previous' : [
        {
          transformFinal: Transform.translate(-1, 0, 0),
          curve: {
            duration: 1
          }
        },
        {
          transformFinal: Transform.translate(0, 0, 0),
          curve: {
            method: 'snap',
            period: 150,
            dampingRatio: 0.25
          }
        },
      ]
    }
  }

  /**
   * Creates image node to represent arrow and calls _initSurface.
   *
   * @method _createArrow
   * @param {Object} arrowOptions Relevant keys: 'placement', 'imageSrc', 'classes'
   * @param {String} eventName
   */
  SliderArrows._createArrow = function _createArrow(arrowOptions, eventName) {
    if (arrowOptions.imageSrc) {
      var img = new Image();
      img.src = arrowOptions.imageSrc;
      arrowOptions.arrowNode = img;
      this._initSurface.call(this, arrowOptions, eventName);
    } else {
      // TODO: figure out if we should read size from DOM, or rely on true sizing
      // TODO: Create 'arrowOptions.arrowNode'
      // UPDATE docs after this is filled in.
      // var size = arrowOptions.size || [this.options['padding'] * 2, this.options['sliderSize'][1]];
      // this._initSurface( arrowOptions, eventName, size );
    }
  }

  /**
   * Emits an event corresponding to passed in eventName.
   *
   * @method _emitArrowEvent
   * @param {String} eventName
   */
  SliderArrows._emitArrowEvent = function _emitArrowEvent(eventName) {
    this._eventOutput.emit(eventName);
  }

  /**
   * Ensures that the arrow placement fills in values with defaults, removing type checking.
   * Similar to TweenTransitions normalize.
   *
   * @method _normalizePlacement
   * @param {Object} placement
   * @private
   */
  function _normalizePlacement ( placement ) {
    for (var key in SliderArrows.NORMALIZED_PLACEMENT ) {
      if ( typeof placement[key] === 'undefined' ) {
        placement[key] = SliderArrows.NORMALIZED_PLACEMENT[key];
      }
    }
  }

  /**
   * Shows or hides the arrows based on arrowAction animations defined in options.
   *
   * @method _showOrHideArrows
   * @param {String} arrowAction
   * @private
   */
  function _showOrHideArrows(arrowAction) {
    var transitionable;
    var opacityTransitionable;
    for (var key in this._arrows) {
      this.eachArrowsBy(key, function(arrow) {
        //Trigger movement
        transitionable = arrow['transitionableTransform'];
        transitionable.halt();
        Chainer(this.options[arrowAction]['movement'], transitionable);

        //Trigger opacity
        opacityTransitionable = arrow['opacityTransitionable'];
        opacityTransitionable.halt();
        opacityTransitionable.set(
          this.options[arrowAction]['opacityTransition'].value,
          this.options[arrowAction]['opacityTransition'].transition
        );
      });
    }
  }

  /**
   * Initializes arrow's surface, modifiers and transitionableTransforms and adds
   * them to the view. Saves a reference to an object with all the components
   * in this._arrows[eventName].
   *
   * @method _initSurface
   * @param {Object} arrowOptions
   * @param {String} eventName
   *
   * @private
   */
  SliderArrows.prototype._initSurface = function _initSurface( arrowOptions, eventName) {
    var arrowObject = {};

    // Determine Arrow Placement
    // Arrow placement can be completely custom, or a string that points to a key in
    // ARROW_PLACEMENT object.
    if (typeof arrowOptions.placement == 'string') {
      arrowOptions.placement = SliderArrows.ARROW_PLACEMENT[arrowOptions.placement];
    }
    _normalizePlacement(arrowOptions.placement);

    //Set arrow padding
    var multipliedPadding = TwoDim.multScalarClone(
      arrowOptions.placement.paddingMultiplier,
      this.options['arrowPadding']
    );

    // Create Arrow Surface
    var arrowSurface = new Surface({
      classes: arrowOptions.classes,
      properties: arrowOptions.properties,
      size: [true, true],
      content: arrowOptions.arrowNode
    });

    arrowSurface.on('click', this._emitArrowEvent.bind(this, eventName));
    arrowSurface.on('mouseenter', this.show.bind(this));
    arrowSurface.on('mouseleave', this.hide.bind(this));
    

    // Create Arrow Modifiers
    var offsetMod = new Modifier({
      transform: Transform.translate(
        arrowOptions.placement.translate[0] + multipliedPadding[0],
        arrowOptions.placement.translate[1] + multipliedPadding[1],
        arrowOptions.placement.translate[2])
    });

    var transitionableTransform = new TransitionableTransform();
    var opacityTransitionable = new Transitionable(1);
    var arrowMod = new Modifier({
      origin: arrowOptions.placement.origin,
      align: arrowOptions.placement.align,
      transform: transitionableTransform,
      opacity: opacityTransitionable
    });
    //Set initial state
    transitionableTransform.set(this.options['arrowInitialTransform']);
    opacityTransitionable.set(this.options['arrowInitialOpacity']);

    this.add(offsetMod).add(arrowMod).add(arrowSurface);

    // Save references to surfaces / modifiers/ transitionableTransfrom
    arrowObject['surface'] = arrowSurface;
    arrowObject['offsetModifier'] = offsetMod;
    arrowObject['modifier'] = arrowMod;
    arrowObject['transitionableTransform'] = transitionableTransform;
    arrowObject['opacityTransitionable'] = opacityTransitionable;
    arrowObject['finalTransform'] = transitionableTransform.translate.get();

    if (!this._arrows[eventName]) this._arrows[eventName] = [];
    this._arrows[eventName].push(arrowObject);
  }

  /**
   * Creates image node to represent arrow and calls _initSurface.
   *
   * @method _createArrow
   * @param {Object} arrowOptions Relevant keys: 'placement', 'imageSrc', 'classes'
   * @param {String} eventName
   * @private
   */
  SliderArrows.prototype._createArrow = function _createArrow(arrowOptions, eventName) {
    if (arrowOptions.imageSrc) {
      var img = new Image();
      img.src = arrowOptions.imageSrc;
      arrowOptions.arrowNode = img;
      this._initSurface.call(this, arrowOptions, eventName);
    } else {
      // TODO: figure out if we should read size from DOM, or rely on true sizing
      // TODO: Create 'arrowOptions.arrowNode'
      // UPDATE docs after this is filled in.
      // var size = arrowOptions.size || [this.options['padding'] * 2, this.options['sliderSize'][1]];
      // this._initSurface( arrowOptions, eventName, size );
    }
  }

  /**
   * Emits an event corresponding to passed in eventName.
   *
   * @method _emitArrowEvent
   * @param {String} eventName
   * @private
   */
  SliderArrows.prototype._emitArrowEvent = function _emitArrowEvent(eventName) {
    this._eventOutput.emit(eventName);
  }

  /**
   * Animates an arrow based on the animation defined in the 'arrowOnClickMoves' options.
   * The arrow is reference by a key which corresponds to the event it emits when clicked
   * (e.g, 'set:next', 'set:previous').
   *
   * @method animateArrow
   * @param {String} key
   *
   */
  SliderArrows.prototype.animateArrow = function animateArrow(key) {
    var transitionable;
    this.eachArrowsBy(key, function (arrow, i) {
      transitionable = arrow['transitionableTransform'];
      transitionable.halt();
      Chainer(this.options['arrowOnClickMoves'][key], transitionable, arrow['finalTransform']);
    });
  }

  SliderArrows.prototype.animateNext = function () {
    this.animateArrow('set:next');
  }

  SliderArrows.prototype.animatePrevious = function () {
    this.animateArrow('set:previous');
  }
  

  /**
   * Shows all the arrow.
   *
   * @method show
   */
  SliderArrows.prototype.show = function show() {
    _showOrHideArrows.call(this, 'arrowShow');
  }

  /**
   * Hides all the arrows.
   *
   * @method hide
   */
  SliderArrows.prototype.hide = function hide() {
    _showOrHideArrows.call(this, 'arrowHide');
  }

  /**
   * Calls a method on each arrow that triggers a passed in event
   * (e.g, 'set:next', 'set:previous').
   *
   * @method eachArrowsBy
   * @param {String} key
   * @param {Function} fn
   */
  SliderArrows.prototype.eachArrowsBy = function eachArrowsBy(key, fn) {
    var arrows = this._arrows[key];
    if (arrows) {
      for (var i = 0; i < arrows.length; i++) {
        fn.call(this, arrows[i], i );
      };
    }
  }

  module.exports = SliderArrows;
});
