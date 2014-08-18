define(function(require, exports, module) {
  var RenderNode         = require('famous/core/RenderNode');
  var Modifier           = require('famous/core/Modifier');
  var Engine             = require('famous/core/Engine');
  var Surface            = require('famous/core/Surface');
  var SizeAwareView      = require('./constructors/SizeAwareView');
  var Timer              = require('famous/utilities/Timer');
  // Register the curves
  var RegisterEasing     = require('./registries/Easing');
  var RegisterPhysics    = require('./registries/Physics');
  // Syncs
  var GenericSync        = require('famous/inputs/GenericSync');
  var TouchSync          = require('famous/inputs/TouchSync');
  var MouseSync          = require('famous/inputs/MouseSync');
  var ScrollSync         = require('famous/inputs/ScrollSync');
  var Slide              = require('./slides/Slide');
  var Arrows             = require('./components/Arrows');
  var Dots               = require('./components/Dots');
  var LayoutController   = require('./layouts/LayoutController');

  GenericSync.register({
    'mouse': MouseSync,
    'touch': TouchSync,
    'scroll': ScrollSync
  });

  /**
   * Carousel takes content directly from the DOM, from Famous Renderables, or
   * direct references to DocumentFragments. Carousel allows content to be viewed in a
   * range of default or custom layouts. The Carousel content can be morphed in between layouts, with
   * smooth transitions.
   *
   * @class Carousel
   * @param {Object} [options] An object of configurable options.
   * @param {ContentLayout} [options.contentLayout] Determines the initial layout of the carousel.
   * @param {Array | Number 2D} [options.carouselSize] Change the size of the container. Supports strings, which are parsed as percentages of the container.
   *
   * @param {Boolean} [options.arrowsEnabled] Determines whether the left and right arrows are visible for this instance of the carousel.
   * @param {String} [options.arrowsPosition] Valid options: ["bottom" | "middle" | "top"]. Determines the vertical placement of the arrows. The horizontal position of the arrows are flush against left/right bounding border of the carousel.
   * @param {Array | Number 2D} [options.arrowsPadding] Determines the displacement from the arrow position set by arrowsPosition. The first value in the array corresponds to the horizontal offset where a positive value pushes the arrows towards the center of the carousel. The second value in the array corresponds to the vertical offset where a positive value pushes the arrow down towards the bottom of the carousel.
   * @param {String} [options.arrowsPreviousIconURL] URL of an image to use for the previous button skin.
   * @param {String} [options.arrowsNextIconURL] URL of an image to use for the next button skin.
   * @param {Boolean} [options.animateArrowsOnClick] Determines whether arrows display animation on click.
   * @param {Boolean} [options.toggleArrowsDisplayOnHover] Determines whether arrows should be animated in/out when user hovers over the carousel. A value of 'false' signifies that the arrows will always be displayed.
   *
   * @param {Boolean} [options.dotsEnabled] Determines whether the selection dots are to be used for this instance of the carousel.
   * @param {String} [options.dotsPosition] Valid options: ["left" | "middle" | "right"]. Determines the horizontal placement of the arrows. The vertical position of the arrows are flush against bottom bounding border of the carousel.
   * @param {Array | Number 2D} [options.dotsPadding] Determines the displacement from dot position set by dotsPosition. The first value in the array corresponds to the horizontal offset where a positive value pushes the dots to right and a negative value pushes them to the left. The second value in the array corresponds to the vertical offset where a negative value pushes the dots up towards the top of the carousel and a positive value pushes them down.
   * @param {Array | Number 2D} [options.dotsSize] The width and height (in pixels) of the selection dots.
   * @param {Number} [options.dotsHorizontalSpacing] The horizontal spacing (in pixels) between each dot.
   *
   * @param {Number} [options.selectedIndex] The default index of content the carousel. Corresponds to the index of the options.item array.
   * @param {Array} [options.items] An array of renderables (objects which support render(), commit() and getSize()) or DOM Elements to be displayed in the carousel. Typically, this would be an array of Surfaces or Views.
   * @param {Boolean} [options.loop] Whether or not to loop from the last item back to the first (when going forward), or from the first back to the last (when going backwards).
   * @param {Boolean} [options.keyboardEnabled] Automatically listen for right / left arrow keyboard presses to trigger next / previous
   * @param {Boolean} [options.mouseEnabled] Enable dragging of slides with mice on layouts that respect direct manipulation.
   * @param {Boolean} [options.touchEnabled] Enable dragging of slides with touch on layouts that respect direct manipulation.
   * @param {Boolean} [options.scrollEnabled] Enable dragging of slides with mousewheel on layouts that respect direct manipulation.
   *
   * @css {.famous-carousel-container} Container div to set background color on.
   * @css {.famous-carousel-dot} If dots are enabled, the class corresponding to each dot.
   * @css {.famous-carousel-dot-selected} Applied to dot representing the current page.
   * @css {.famous-carousel-arrow} CSS class applied to the arrows, if enabled.
   * 
   */
  function Carousel (options) {
    SizeAwareView.apply(this, arguments);

    this._data = {
      index: undefined,
      paginatedIndex: 1,
      itemsPerPage: 1,
      items: undefined,
      renderables: [],
      length: undefined
    }

    this.sync = new GenericSync();
    this.layoutDefinition;

    this.layoutController = new LayoutController({
      classes: ['famous-carousel-container'],
      itemsPerPage: this._data.itemsPerPage,
      loop: this.options.loop
    });
    this.layoutController._connectContainer(this); //Pipe ContainerSurface

    this._init();
  }

  Carousel.prototype = Object.create(SizeAwareView.prototype);
  Carousel.prototype.constructor = Carousel;

  // STATICS
  Carousel.Grid                = require('./layouts/Grid');
  Carousel.Coverflow           = require('./layouts/Coverflow');
  Carousel.Sequential          = require('./layouts/Sequential');
  Carousel.SingularOpacity     = require('./layouts/SingularOpacity');
  Carousel.SingularSlideIn     = require('./layouts/SingularSlideIn');
  Carousel.SingularSlideBehind = require('./layouts/SingularSlideBehind');
  Carousel.SingularParallax    = require('./layouts/SingularParallax');
  Carousel.SingularTwist       = require('./layouts/SingularTwist');
  Carousel.SingularSoftScale   = require('./layouts/SingularSoftScale');

 
  Carousel.DEFAULT_OPTIONS = {
    contentLayout: Carousel.Coverflow,
    carouselSize: ['100%', '100%'],

    arrowsEnabled: true,
    arrowsPosition: "middle",
    arrowsPadding: [10, 0],
    arrowsPreviousIconURL: undefined,
    arrowsNextIconURL: undefined,
    animateArrowsOnClick: true,
    toggleArrowsDisplayOnHover: true,

    dotsEnabled: true,
    dotsPosition: "middle",
    dotsPadding: [0, -10],
    dotsSize: [10, 10],
    dotsHorizontalSpacing: 10,

    selectedIndex: 0,
    items: [],
    loop: true,

    keyboardEnabled: true,
    mouseEnabled: true,
    touchEnabled: true,
    scrollEnabled: false,
  }

  Carousel.EVENTS = { 
    /**
     * @event selectionChange
     * @param {Number} index
     *  New index that the carousel will be set to. Triggered by arrow clicks, 
     *  keyboard events or dot clicks. Calling setSelectedIndex will not trigger 
     *  a selectionChange event.
     * 
     */
    selection: 'selectionChange',

    /**
     * @event slideClick
     * @param {Number} index
     *  Index of the clicked slide.
     */
    slideClick: 'slideClick'
  }

  /**
   *  Calls next for right arrow key press, previous for left arrow key press.
   *
   *  @method _handleKeyup
   *  @static
   *  @protected
   *  @param {Event} Keyboard event.
   */
  Carousel._handleKeyup = function _handleKeyup(e) {
    if (e.keyCode == 37) { // left arrow
      this.previous();
      this._eventOutput.emit(Carousel.EVENTS.selection, this._data.index);
    }
    else if (e.keyCode == 39) {  // right arrow
      this.next();
      this._eventOutput.emit(Carousel.EVENTS.selection, this._data.index);
    }
  }

  // PUBLIC API METHODS

  /**
   *
   * @method setContentLayout
   * @param layoutDefinition {LayoutDefinition} 
   * @example
   *    var carousel = FamousCarousel('#parentDiv', { 
   *      contentLayout: FamousCarousel.SingularSlideIn
   *    });
   *
   *    // set with default options
   *    carousel.setContentLayout(FamousCarousel.Grid);
   *
   *    // choose Grid layout with customized options. 
   *    carousel.setContentLayout(FamousCarousel.Grid({ 
   *      gridSize: [5, 5]
   *    });
   *
   */
  Carousel.prototype.setContentLayout = function setContentLayout(layoutDefinition) {
    if (!layoutDefinition) throw 'No layout definition given!';
    this.layoutDefinition = layoutDefinition;
    this.layoutController.setLayout(this.layoutDefinition);
    return this;
  }

  /**
   * Returns the currently active layout.
   * @method getContentLayout
   * @return {Object} Current layout definition.
   */
  Carousel.prototype.getContentLayout = function getContentLayout() {
    return this.layoutDefinition;

  }

  /**
   * Get the currently selected index of the carousel.
   *
   * @method getSelectedIndex
   * @return {Number} Current index.
   */
  Carousel.prototype.getSelectedIndex = function getSelectedIndex() {
    return this._data.index;
  }

  /**
   * Set the current selected index of the carousel. Respects looping.
   * Triggers animation unless method is explicitly invoked with a flag to prevent animation. (Use case is when there is a simultaneous layout and index change).
   * This will NOT trigger a selectionChange event.
   * 
   * @method setSelectedIndex
   * @param index {Number} Index to set to.
   * @param triggerAnimation {Boolean} Flag indicating whether to trigger animation. Defaults to 'true'.
   * @return this._data.index {Number} Updated index.
   */
  Carousel.prototype.setSelectedIndex = function setSelectedIndex(index , triggerAnimation) {
    if (index == this._data.index) return this._data.index;

    //Calculate new index
    this._data.index = this._clamp(index);
    this._data.paginatedIndex = this._clamp(Math.floor(this._data.index / this._data.itemsPerPage));

    //Update LayoutController.
    triggerAnimation = (triggerAnimation === undefined) ? true : triggerAnimation;
    this.layoutController.setIndex(this._data.index, triggerAnimation);

    //Update dots.
    if(this.dots) this.dots.setIndex(this._data.paginatedIndex);

    return this._data.index;
  }

  /**
   * Convenience function to go to the next index. Affected by the number of items per page.
   * @method next
   * @return {Number} New index after applying next.
   */
  Carousel.prototype.next = function next() {
    var index = this._data.index + this._data.itemsPerPage;
    return this.setSelectedIndex(index);
  }

  /**
   * Convenience function to go to the previous index. Affected by the number of items per page.
   * @method previous
   * @return {Number} New index after applying previous.
   */
  Carousel.prototype.previous = function previous() {
    var index = this._data.index - this._data.itemsPerPage;
    return this.setSelectedIndex(index);
  }

  /**
   * Returns the items that the carousel is currently composed of.
   * @method getItems
   * @return {Array} Current items the Carousel is made out of.
   */
  Carousel.prototype.getItems = function getItems() {
    return this._data.items;
  }

  /**
   * Recreate the slider with a new set of renderables.
   * @method setItems
   * @param itemArray {Array} New Famo.us renderables to put into the Carousel.
   */
  Carousel.prototype.setItems = function setItems( itemArray ) {
    this._data.items = itemArray.slice(0);
    this._data.length = this._data.items.length;
    this._initItems();
    this.layoutController.setItems( this._data.renderables );
    return this;
  }

  /**
   * Get the current size of the carousel. 
   * @method getSize
   * @return {Array | Number} Current size in pixels of the Carousel.
   */
  Carousel.prototype.getSize = function getSize() {
    return this.getParentSize();
  }

  // PROTECTED METHODS
 
  /**
   * Initalizes the carousel.
   * @method _init
   * @protected
   */
  Carousel.prototype._init = function _init() {
    this.setItems(this.options.items);
    this.setSelectedIndex(this.options.selectedIndex);
    this._initContent();
    this._events();

    Timer.after(function(){
      this._resize();
      this.setContentLayout(this.options.contentLayout);
    }.bind(this), 2);
  }

  /**
   * Initializes the current content.
   * @method _initContent
   * @protected
   */
  Carousel.prototype._initContent = function _initContent() {
    this._eventContainer = new Surface();
    this._eventContainer.pipe(this);

    this.add(new Modifier({ 
      opacity: 0
    })).add(this._eventContainer);

    if (this.options['arrowsEnabled']) {
      this.arrows = new Arrows({
        'position'             : this.options['arrowsPosition'],
        'padding'              : this.options['arrowsPadding'],
        'previousIconURL'      : this.options['arrowsPreviousIconURL'],
        'nextIconURL'          : this.options['arrowsNextIconURL'],
        'animateOnClick'       : this.options['animateArrowsOnClick'],
        'toggleDisplayOnHover' : this.options['toggleArrowsDisplayOnHover']
      });
      this.add(this.arrows);
    }

    if (this.options['dotsEnabled']) {
      this.dots = new Dots({
        'position'                  : this.options['dotsPosition'],
        'padding'                   : this.options['dotsPadding'],
        'size'                      : this.options['dotsSize'],
        'horizontalSpacing'         : this.options['dotsHorizontalSpacing'],
        'length'                    : Math.ceil(this._data.items.length / this._data.itemsPerPage),
        'selectedIndex'             : this.options['selectedIndex'],
        'toggleArrowsDisplayOnHover': this.options['toggleArrowsDisplayOnHover']
      });
      this.add(this.dots);
    }
 
    this._sizeModifier = new Modifier({
      size: this._getCarouselSize(),
      origin: [0.5, 0.5],
      align: [0.5, 0.5]
    });

    this.add(this._sizeModifier).add(this.layoutController);
    
  }

  /**
   *  Initializes the items.
   *  @method _initItems
   *  @protected
   */
  Carousel.prototype._initItems = function _initItems() {
    for (var i = 0; i < this._data.items.length; i++) {
      if (this._data.items[i].render) { 
        this._data.renderables.push(this._data.items[i]);
      }
      else {
        var slide = new Slide(this._data.items[i]);
        this._data.renderables.push(slide);
      }

      ///Trigger event on click.
      this._data.renderables[i].on(
        'click',
        this._eventOutput.emit.bind(this._eventOutput, Carousel.EVENTS.slideClick, i)
      );
    };
  }

  /**
   *  Internal event listener setup.
   *  @method _events
   *  @protected
   */
  Carousel.prototype._events = function _events() {
    this._eventInput.on('parentResize', this._resize.bind(this));

    if (this.options['keyboardEnabled']) { 
      this._handleKeyup = Carousel._handleKeyup.bind(this);
      Engine.on('keyup', this._handleKeyup);
    }
    var inputs = [];
    if (this.options['keyboardEnabled']) inputs.push('touch');
    if (this.options['mouseEnabled']) inputs.push('mouse');
    if (this.options['scrollEnabled']) inputs.push('scroll');

    this.sync.addSync(inputs);
    this._eventContainer.pipe(this.sync);

    if (this.arrows) { 

      this.arrows.on('previous', (function (e) { 
        this.previous();
        this._eventOutput.emit(Carousel.EVENTS.selection, this._data.index);
      }).bind(this));

      this.arrows.on('next', (function (e) { 
        this.next();
        this._eventOutput.emit(Carousel.EVENTS.selection, this._data.index);
      }).bind(this));
    }

    if(this.options['toggleArrowsDisplayOnHover'] && this.arrows) {
      this._eventInput.on('mouseover', this.arrows.show.bind(this.arrows));
      this._eventInput.on('mouseout', this.arrows.hide.bind(this.arrows));
    }

    if (this.dots) {
      this.dots.on('set', function(index){
        this.setSelectedIndex(index * this._data.itemsPerPage);
        this._eventOutput.emit(Carousel.EVENTS.selection, this._data.index);
      }.bind(this));
    }

    if (this.dots && this.arrows) { 
      this.dots.on('showArrows', this.arrows.show.bind(this.arrows));
      this.dots.on('hideArrows', this.arrows.hide.bind(this.arrows));
    }

    this.layoutController.on('paginationChange', this._setItemsPerPage.bind(this));
  }

  /**
   *  Items per page changes the number of dots, and the number of items that are
   *  animated on each arrow click.
   *
   *  @method _setItemsPerPage
   *  @protected
   *  @param itemsPerPage {Number} 
   */
  Carousel.prototype._setItemsPerPage = function _setItemsPerPage(itemsPerPage) {
    if(this._data.itemsPerPage === itemsPerPage) return;
    
    this._data.itemsPerPage = itemsPerPage;
    if(this.dots) {
      this.dots.setLength(
        Math.ceil(this._data.items.length / itemsPerPage), //length
        itemsPerPage,
        this._data.index
      );
    }
    
  }

   
  /**
   *  Internal resize callback. 
   *
   *  @method _resize
   *  @protected
   */
  Carousel.prototype._resize = function _resize() {
    var carouselSize = this._getCarouselSize();
    this.layoutController.setSize(carouselSize); 
    this._sizeModifier.setSize(carouselSize);
  }

  /**
   *  Gets the current size of the carousel.
   *
   *  @method _getCarouselSize
   *  @protected
   */
  Carousel.prototype._getCarouselSize = function () {
    var size = [];
    var parentSize = this.getSize();

    size[0] = typeof this.options['carouselSize'][0] == 'number' ? 
      this.options['carouselSize'][0] :
      parseFloat(this.options['carouselSize'][0]) / 100 * parentSize[0];

    size[1] = typeof this.options['carouselSize'][1] == 'number' ? 
      this.options['carouselSize'][1] :
      parseFloat(this.options['carouselSize'][1]) / 100 * parentSize[1];

    return size;
  }

  /**
   *  Clamp or loop a number based on options.
   *  @param index {Number} number to clamp or loop.
   *  @returns index {Number} clamped or looped number
   *  @protected
   *  @method clamp 
   */
  Carousel.prototype._clamp = function clamp( index, loop ) {
    if (typeof loop == 'undefined') loop = this.options['loop'];
    if (index > this._data.length - 1) {
      if (loop) index = 0
      else {
        index = this._data.length - 1;
      }
    } else if (index < 0 ) {
      if (loop) index = this._data.length - 1;
      else {
        index = 0;
      }
    }
    return index;
  }

  module.exports = Carousel;
});
