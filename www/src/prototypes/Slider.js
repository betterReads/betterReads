define(function(require, exports, module) {
  var OptionsManager   = require('famous/core/OptionsManager');
  var RenderNode       = require('famous/core/RenderNode');
  var Modifier         = require('famous/core/Modifier');
  var View             = require('famous/core/View');
  var Surface          = require('famous/core/Surface');
  var Engine           = require('famous/core/Engine');
  var ContainerSurface = require('famous/surfaces/ContainerSurface');
  var ContextualView   = require('famous/views/ContextualView')
  var GenericSync      = require('famous/inputs/GenericSync');
  var TouchSync        = require('famous/inputs/TouchSync');
  var MouseSync        = require('famous/inputs/MouseSync');
  var ScrollSync       = require('famous/inputs/ScrollSync');
  
  // COMPONENTS / EXTENSIONS
  var Layout           = require('./slider/extensions/Layout');
  var SliderArrows     = require('./slider/extensions/SliderArrows');
  var SliderDots       = require('./slider/extensions/SliderDots');
  var SliderWaveDots   = require('./slider/extensions/SliderWaveDots');
  var Sequence         = require('./slider/data/Sequence');
  var SliderLayouts    = require('./slider/layouts/SliderLayouts');

  // Slides
  var Slide            = require('./slider/slides/Slide');
  var ResponsiveSlide  = require('./slider/slides/ResponsiveSlide');

  // Utilities
  var ClassToImages    = require('./dom/ClassToImages');
  var EventHelpers     = require('./events/EventHelpers');
  var ObjectHelpers    = require('./helpers/ObjectHelpers');
  var DiscreteOptions  = require('./options/DiscreteOptions');
  var ExtensionManager = require('./extensions/ExtensionManager');
  var SizeAwareView    = require('./constructors/SizeAwareView');
  var EventCaller      = require('./events/EventCaller');

  // Register the curves
  var RegisterEasing    = require('./registries/Easing');
  var RegisterPhysics   = require('./registries/Physics');

  // Syncs
  GenericSync.register({
    'mouse': MouseSync,
    'touch': TouchSync,
    'scroll': ScrollSync
  });

  /**
   * Slider takes content either directly from the DOM, from Famous Renderables, or
   * direct references to DocumentFragments. Slider allows content to be viewed in a 
   * range of default or custom layouts. By default, you can morph content between 2D sequences, 
   * 3D coverflow, or helix. The Slider content can be morphed in between layouts, with 
   * smooth transitions.
   *
   * @class Slider
   * @constructor
   * @example
   *    var Slider = new Slider({ 
   *      parentQuery: '#slider-content',
   *      pagination: 5, 
   *      loop: true,
   *      sliderDots: { // dot options
   *        
   *      },
   *      sliderArrows: { // arrow options
   *        
   *      },
   *      layout: { 
   *        type: 'coverflow', // coverflow options
   *        options: {         // layout options
   *
   *        }
   *      }
   *    });
   *
   * @param {Object} [options] An object of configurable options.
   * @param {String} [options.parentQuery] 
   *    The HTML querySelector to create slider content from. 
   *    Each first level child is considered one page.
   * @param {Boolean} [options.loop]
   *  If false, the slider will not loop from the last to the first, or first to last. 
   *  If true, it will.
   * @param {Number} [options.pagination]
   *  Number of items to move when calling next. 
   *  Also affects how many dots are shown, if the dot extension is included.
   * @param {Array | String} [options.extensions]
   *  What extensions to use with the Slider. Default extensions are 'arrows' and 'dots'.
   *  To prevent your slider from having dots, you would pass in an array of ['arrows'].
   * @param {Array | DocumentFragment} [options.fragments]
   *  Each slide of the slider will be created from these references to Document Fragments. 
   *  Most commonly used to share content between two sliders, using the slider.getFragments method.
   * @param {String} [options.slideType]
   *  Choose what the slide type of each item will be. Default valid options are 'basic', or 'repsonsive'.
   * @param {Array| String or Number} [options.sliderSize] 
   *  Set the [ width, height ] of the slider. Both width or height can be a number or a string with a percentage, such as "50%".
   *  The percentage is based on the width and height of the containing div.
   * @param {Array| Number} [options.contentOrigin]
   *  The origin value that is attached to the modifier above the slider container.
   * @param {Array| Number} [options.contentAlign]
   *  The align value that is passed to the modifier above the slider container.
   * @param {Array | String} [options.inputs]
   *  The GenericSync inputs that the slider reacts to. Valid options are 'touch', 'mouse', or 'scroll'.
   * @param {Object} [options.containerProperties]
   *  The CSS properties that are passed to the SliderContainer.
   * @param {Object} [options.layout]
   *  These options are passed directly into Layout
   * @param {Object} [options.sliderDots]
   *  These options are passed directly into SliderDots
   * @param {Object} [options.sliderArrows]
   *  These options are passed directly into SliderArrows
   *
   * @css {.test} Slider-container class, applied to the main container.
   * @css {.test2} 
   *    Slider-container class, applied to the main container.
   * @css {.test3} Slider-container class, applied to the main container.
   * @css {#test5} Slider-container class, applied to the main container.
   * 
   */
  function Slider(options) {
    Slider.combineRegistryOptions();
    SizeAwareView.apply(this, arguments);

    this._extensions = [];
    this._slides = [];
    this._extensionNames = {};
    this.sync = new GenericSync();
    this._init();

    this._sequence = new Sequence({
      loop: this.options.loop,
      pagination: this.options.pagination
    });
    this._sequence.registerArray('slides', this._slides);

    this._addExtensions(options);
    this._events();
  }

  ObjectHelpers.inherits(Slider, SizeAwareView);

  Slider.onEventInput = {
    'set:options': 'setOptions'
  }

  Slider.onEventOutput = {
    /**
     *  Triggered automatically from setOptions({ keyboardEvents: true/false}). 
     *  Allows the connected components to react to turning keyboard events on or off.
     *  @event set:keyboardEvents
     *  @type eventOutput
     */
    'set:keyboardEvents': 'setKeyboardEvents'
    /**
     *  Fired when the mouse is hovering somewhere over the slider's container.
     *  @event mouseenter
     *  @type eventOutput
     */
    /**
     *  Fired when the mouse leaves the slider's container.
     *  @event mouseleave
     *  @type eventOutput
     */
  }
  

  /**
   * Sets up event listeners.
   *
   * @method _events
   * @private
   */
  Slider.prototype._events = function _events() {
    this.setKeyboardEvents({value: this.options['keyboardEvents']});
    this.sync.addSync(this.options['inputs']);
    this.sync.pipe(this._eventOutput);
    this.container.pipe(this.sync);
    this.pipe(this._sequence);
    this.container.pipe(this._eventOutput);
    EventCaller.bind.call(this, Slider.onEventInput);
    EventCaller.bind.call(this, Slider.onEventOutput, this._eventOutput);
    DiscreteOptions.listenToInternalChange.call(this);
  }

  /*
   * Set up registry of slide types and slider extensions
   * @static Slider.SLIDE_TYPES
   */
  Slider.SLIDE_TYPES = {
    'basic'     : Slide,
    'responsive': ResponsiveSlide
  }
  ExtensionManager.createRegistry(Slider, Slider.SLIDE_TYPES,
    'registerSlide', 'deregisterSlide');

  /*
   * Global Slider.EXTENSIONS.
   * @static
   */
  Slider.EXTENSIONS = {
    'layout'   : Layout,
    'arrows'   : SliderArrows,
    'dots'     : SliderDots,
    'waveDots' : SliderWaveDots
  };
  ExtensionManager.createRegistry(Slider, Slider.EXTENSIONS);

  Slider.LAYOUTS = SliderLayouts;
  ExtensionManager.createRegistry(Slider, Slider.LAYOUTS,
    'registerLayout', 'deregisterLayout');

  /**
   *  Setup the DEFAULT_OPTIONS of Slider with all of it's children's
   *  default options. Slider's default options are explicit, since very slider
   *  must have a Slider.
   *
   *  @method combineRegistryOptions
   *  @static
   *  @private
   */
  Slider.combineRegistryOptions = function combineRegistryOptions() {
    var opts = OptionsManager.patch({}, Slider.DEFAULT_OPTIONS);
    for (var key in Slider.EXTENSIONS) {
      var extensionOptions = opts[Slider.EXTENSIONS[key].NAME] = {};
      OptionsManager.patch(extensionOptions, Slider.EXTENSIONS[key].DEFAULT_OPTIONS);
    }
    Slider.DEFAULT_OPTIONS = OptionsManager.patch(opts, Slider.DEFAULT_OPTIONS);
  }

  Slider.DEFAULT_OPTIONS = {
    'parentQuery': '.famous-slider',
    'loop': true,
    'pagination': 1,
    'keyboardEvents': true,
    'pagination': 1,
    'extensions' : [
      'arrows',
      'dots'
    ],
    'fragments': [],
    'slides': [],
    'slideType': 'basic',
    'sliderSize' : ['50%', '50%'],
    'contentOrigin' : [0.5, 0.5],
    'contentAlign' : [0.5, 0.5],
    'inputs': [],
    'containerProperties': {
      zIndex: 1
    }
  }

  /**
   * Create a bounding box that contains & renders the slider
   * and the extensions.
   *
   * @method _createContainer
   * @private
   */
  function _createContainer() {
    //Create container that acts as bounding box for slider & the extensions
    //Size of the Slider container is set by its parent element.
    this.container = new Surface({
      classes: ['slider-container'],
      properties: this.options.containerProperties 
    });

    this.add(new Modifier({ 
      opacity: 0
    })).add(this.container);

    //Create render node that renders slider & extensions
    this.contentNode = new RenderNode();
    this.contentNode.render = this._innerRender.bind(this);

    //Create modifier to position the content node
    this.contentModifier = new Modifier({
      origin: this.options['contentOrigin'],
      align: this.options['contentAlign']
    });
    this.add(this.contentModifier).add(this.contentNode);
  }

  /**
   *  Add the slider to the extensions, if it does not exist.
   *  @private
   *  @deprecated
   *  @method checkForLayout
   */
  function checkForLayout() {
    if (this.options.extensions.indexOf('layout') < 0) {
      this.options.extensions.push('layout');
    }
  }

  /**
   * Custom function used to render the slider and extensions contained
   * inside of the container.
   * @private
   * @method _innerRender
   */
  Slider.prototype._innerRender = function _innerRender() {
    var extensions = [];
    for (var i = 0; i < this._extensions.length; i++) {
      extensions.push(this._extensions[i].render());
    };
    return {
      size: this.getSize(),
      target: extensions
    }
  }

  /**
   * Initializes the widget.
   *
   * Order of precedence for slide content:
   * 1.) If Renderables ('slides') are passed in options, those renderables are 
   * used to create slides.
   * 2.) If document fragments ('fragments') are passed in options, those fragments 
   * are converted to surfaces and used to create slides.
   * 3.) If parent query ('parentQuery') is passed in options, grab the HTML Nodes, 
   * turn it into Surfaces / Slides respectively.
   *
   * @method _init
   * @private
   */
  Slider.prototype._init = function _init () {
    _createContainer.call(this);

    var slides = this.options.slides;
    var frags = this.options.fragments;
    var parentQuery = this.options.parentQuery;

    if (slides.length > 0) {
      for(var i = 0; i < slides.length; i++) {
        this._slides.push(slides[i]);
        slides[i].pipe(this.sync);
      }
      return;
    }
    else if (frags.length > 0) {
      for (var i = 0; i < frags.length; i++) {
        frags[i] = frags[i].cloneNode();
      };
      this._fragments = frags;
    }
    else if (parentQuery) {
      this._fragments = ClassToImages(parentQuery);
      if(this._fragments.length === 0) {
        throw 'Slider cannot be created because parent query '+
              '('+parentQuery+') returned no document fragments.';
      }
    }

    for (var i = 0; i < this._fragments.length; i++) {
      this.addSlide(this._fragments[i]);
    };
  }

  /**
   * Adds the created extensions (e.g. arrows, dots, slider).
   *
   * @private
   * @method _addExtensions
   * @param {Object} options
   */
  Slider.prototype._addExtensions = function _addExtensions(options) {
    checkForLayout.call(this);
    for (var i = 0; i < this.options.extensions.length; i++) {
      var extensionName = this.options.extensions[i];
      if (!Slider.EXTENSIONS[extensionName]) {
        throw extensionName + ' extension not found.';
      } else {
        var extension = new Slider.EXTENSIONS[extensionName](this.options[extensionName], this._sequence, this._slides);
        this._extensions[i] = this._extensionNames[extension.constructor.NAME] = extension;
        this._eventPipes(extension);
      }
    }
  }

  /**
   * Get the instantiated extension attached to the Slider.
   *
   * @param key {String} key of extension to get
   * @method getExtension
   */
  Slider.prototype.getExtension = function getExtension(key) {
    for (var i = 0; i < this._extensions.length; i++) {
      if (this._extensions[i] instanceof Slider.EXTENSIONS[key]) {
        return this._extensions[i];
      }
    };
    return undefined;
  }

  /**
   * TODO: Update this method so that it can dynamically add slides after initialization.
   * Creates slide from document fragment and adds itto array that
   * gets passed to Slider at initialization.
   *
   * @method addSlide
   * @param {Object} documentFragment
   */
  Slider.prototype.addSlide = function _addSlide( documentFragment ) {
    var slide = new Slider.SLIDE_TYPES[this.options['slideType']](this.options, documentFragment);
    this._slides.push(slide);
    slide.pipe(this.sync);
  }

  /**
   * Removes a slide. TODO
   *
   * @method removeSlide
   */
  Slider.prototype.removeSlide = function removeSlide() {

  }

  /**
   * Emit an event.
   *
   * @method emit
   */

  Slider.prototype.emit = function emit() {
    this._eventOutput.emit.apply(this._eventOutput, arguments);
  };

  /**
   * Returns document fragments. Use this method to share the same content between two Sliders.
   *
   * @method getFragments
   * @return {Array} this.fragments
   */
  Slider.prototype.getFragments = function getFragments() {
    return this._fragments;
  };

  /**
   * Connects the data binding between two sliders, used to enable
   * a dual carousel.
   *
   * @example
   *  var firstSlider = new Slider();
   *  var sliderTwo = new Slider();
   *  firstSlider.connect(sliderTwo);
   *
   * @method connect
   * @param {Slider} otherSlider Another instance of a slider.
   */
  Slider.prototype.connect = function connect( otherSlider ) {
    this._sequence.pipe(otherSlider._sequence);
    otherSlider._sequence.pipe(this._sequence);
  };
  
  /**
   *
   * @method setOptions
   * @param {options} options to configure the Slider, and all extensions.
   */
  Slider.prototype.setOptions = function setOptions(options) {
    this._optionsManager.patch(options);
    for (var key in options) {
      for (var extension in this._extensionNames) { 
        if (extension == key) { 
          this._extensionNames[extension].setOptions(options[key]);
        }
      }
    };
  };

  /**
   * Moves to the next slide. (Affected by pagination)
   *
   * @method next
   */
  Slider.prototype.next = function next() {
    this.emit('set:next');
  }

  /**
   * Moves to the previous slide. (Affected by pagination)
   *
   * @method previous
   */
  Slider.prototype.previous = function previous() {
    this.emit('set:previous');
  }

  /**
   *  Setup the keyboard Events, listens globally from Engine.
   *  @param options {Object} options object set by options manager
   *  @method setKeyboardEvents
   */
  Slider.prototype.setKeyboardEvents = function setKeyboardEvents(options) {
    if (!this._handleKeyup) this._handleKeyup = Slider._handleKeyup.bind(this);
    if (options.value) {
      Engine.on('keyup', this._handleKeyup);
    } else {
      Engine.removeListener('keyup', this._handleKeyup);
    }
  }

  /**
   *  Default keyup behavior, left arrow is previous and right arrow is next.
   *  @param e {Event} Native DOM keyup event
   *  @method _handleKeyup
   *  @private
   */
  Slider._handleKeyup = function _handleKeyup(e) {
    if (e.keyCode == 37) { // left arrow
      this.previous();
    }
    else if (e.keyCode == 39) {  // right arrow
      this.next();
    }
  }

  /**
   * Sets up event piping between Slider and object.
   *
   * All connected Slider.EXTENSIONS items have these events set up on them:
   * 1. Two way pipe between sequence and item
   * 2. Options pipe for the options managed by Slider
   * 3. Subscribe for a set:options event on the registred extensions
   *
   * @method _eventPipes
   * @param {Object} obj Registered item
   * @private
   */
  Slider.prototype._eventPipes = function _eventPipes( obj ) {
    EventHelpers.dualPipe(obj, this._sequence);
    this.pipe(obj);
    this.subscribe(obj);
  }

  module.exports = Slider;
});
