define(function(require, exports, module) {
  var Engine                  = require('famous/core/Engine');
  var Surface                 = require('famous/core/Surface');
  var Transform               = require('famous/core/Transform');
  var Modifier                = require('famous/core/Modifier');
  var Transform               = require('famous/core/Transform');
  var View                    = require('famous/core/View');
  var ViewSequence            = require('famous/core/ViewSequence');
  var RenderNode              = require('famous/core/RenderNode');
  var ContainerSurface        = require('famous/surfaces/ContainerSurface');
  var Easing                  = require('famous/transitions/Easing');
  var TransitionableTransform = require('famous/transitions/TransitionableTransform');
  var Transitionable          = require('famous/transitions/Transitionable');
  var Timer                   = require('famous/utilities/Timer');
  var SliderLayouts           = require('../layouts/SliderLayouts');
  var SliderLayout            = require('../layouts/SliderLayout');
  var EventCaller             = require('../../events/EventCaller');
  var SizeAwareView           = require('../../constructors/SizeAwareView');
  var TwoDim                  = require('../../math/TwoDim');
  var Helpers                 = require('../../helpers/ObjectHelpers');
  var DiscreteOptions         = require('../../options/DiscreteOptions');
  var EventHelpers            = require('../../events/EventHelpers');

  /**
   *  Layout class
   *
   *  @class Layout
   *  @constructor
   */
  function Layout (options, sequence, slides) {
    SizeAwareView.apply(this, arguments);

    this.sequence = sequence;
    this.slides = slides;

    this.data = {
      images: [],
      items: [],
      mods: [],

      parentTransforms: [],
      parentOpacities: [],
      parentOrigins: [],
      parentAligns: [],
      parentSizes: [],

      childTransforms: [],
      childOpacities: [],
      childOrigins: [],
      childAligns: [],

      sizeCache: [],
      touchOffset: [0,0]
    }

    //Instance properties.
    this.nodes = [];
    this.container;
    this.containerMod;
    this.xScale;
    this.yScale;
    this.dynamicResize; //Boolean indicator to trigger dynamic resize

    this._boundResize = this._resize.bind(this);
    this._debouncedResize = this.options['debounceTime'] > 0 ?
      Timer.debounce(this._boundResize, this.options['debounceTime']):
      this._boundResize;

    this._init();
  }

  Layout.prototype = Object.create(SizeAwareView.prototype);
  Layout.prototype.constructor = Layout;

  Layout.NAME = 'layout';
  Layout.DEFAULT_OPTIONS = {
    'direction': 0,
    'sliderSize': ['100%', '100%'],
    'perspective': 1000,
    'loop': true,
    'margin': 30,
    'threshold': 0.33,
    'touchMaxPixels': 100,
    'containerMod': {
      origin: [0.5, 0.5]
    },
    'type': SliderLayouts.sequential,
    'options': {},
    'debounceTime' : 0
  }

  Layout.events = {
    'set:slider'    : 'setOptions',
    'start'         : '_handleStart',
    'update'        : '_handleUpdate',
    'end'           : '_handleEnd',
    'set'           : 'layout',
    'change:type'   : 'updateLayout',
    'change:options': 'updateLayout',
    'parentResize'  : '_debouncedResize'
  }

  /**
   * Move to view event management layer.
   * @method _events
   */
  Layout.prototype._events = function _events() {
    EventCaller.bind.call(this);
    DiscreteOptions.listenToInternalChange.call(this);
  }

  /**
   * Updates the layout type, then renders layout.
   * @method updateLayout
   */
  Layout.prototype.updateLayout = function updateLayout() {
    this.checkLayout();
    this.layout();
  }

  /**
   * Converts a string to percentage.
   *
   * @method _convertStringToPercentage
   * @param {String} str String representing percentage to convert.
   * @private
   */
  function _convertStringToPercentage (str) {
    return parseFloat(str) / 100;
  }

  /**
   * Calculates size factor to be applied to parent's size in order to calculate
   * Layout's size. Useod to implement responsive sizing where the size of the
   * Layout can be set in options to be a percentage (e.g., ['50%, '50%'']) instead
   * of a static value.
   *
   * @method _calcDynamicResizeFactors
   */
  function _calcDynamicResizeFactors() {
    var size = this.options['sliderSize'];
    this.xScale = null;
    this.yScale = null;

    if (typeof(size[0]) === 'number' && typeof(size[1]) === 'number') {
      this.dynamicResize = false;
      this.container.setSize(size);
      _resizeSlides.call(this, size);
    }
    else {
      this.dynamicResize = true;
      if (typeof(size[0]) === 'string') this.xScale = _convertStringToPercentage(size[0])
      if (typeof(size[1]) === 'string') this.yScale = _convertStringToPercentage(size[1])
    }
  }

  /**
   * Resizes the container and slides based on changes in parent's size.
   *
   * @method _resizeContainer
   * @param {Array|2D} parentSize
   * @private
   */
  Layout.prototype._resize = function _resize (parentSize) {
    if (!this.dynamicResize) return;

    var containerSize = _calcContainerSize.call(this, parentSize);

    this.container.setSize(containerSize);
    _resizeSlides.call(this, containerSize);

    this.layout();
  }

  /**
   * Resizes the slider's container based on changes in parent's size.
   * Returns the updated slider size.
   *
   * @method _resizeContainer
   * @param {Array|2D} parentSize
   * @return {Array|2D} size
   * @private
   */
  function _calcContainerSize(parentSize) {
    var width  = (this.xScale) ?
      parentSize[0] * this.xScale :
      this.options['sliderSize'][0];

    var height = (this.yScale) ?
      parentSize[1] * this.yScale :
      this.options['sliderSize'][1];

    return [width, height];
  }

  /**
   * Resizes slides based on slider's container size.
   * Slides are only resized if slide type set in options is 'responsive'.
   *
   * @method _resizeSlides
   * @param size {Array} Size to set
   * @private
   */
  function _resizeSlides(containerSize) {
    if (this.options.slideType !== 'responsive') return;

    containerSize = containerSize || this.container.getSize();

    var slides = this.slides;
    var width;
    for (var i = 0; i < slides.length; i++) {
      width = Math.round(containerSize[0] / this.options['pagination']);
      slides[i].setSize([width, containerSize[1]]);
    }
  }

  /**
   * Creates the items (i.e., slides), modifiers and nodes, piping into the sync.
   *
   * @method _createItems
   * @private
   */
  function _createItems () {
    var dist = [0,0];
    for (var i = 0; i < this.slides.length; i++) {
      var renderable = this.slides[i];
      var parentTransform = new TransitionableTransform();
      var parentOpacity = new Transitionable(1);
      var parentOrigin = new Transitionable([0,0]);
      var parentAlign = new Transitionable([0,0]);
      var parentSize = new Transitionable([undefined, undefined]);

      var childTransform = new TransitionableTransform();
      var childOpacity = new Transitionable(1);
      var childOrigin = new Transitionable([0,0]);
      var childAlign = new Transitionable([0,0]);

      var mod = new Modifier({
        transform: parentTransform,
        origin: parentOrigin, 
        align: parentAlign,
        opacity: parentOpacity,
        size: parentSize
      });

      var childMod = new Modifier({
        transform: childTransform,
        origin: childOrigin, 
        align: childAlign,
        opacity: childOpacity
      });

      var node = new RenderNode();
      node.getSize = renderable.getSize.bind(renderable);
      node.add(mod).add(childMod).add(renderable);

      this.nodes.push(node);
      this.data.items.push(renderable);
      this.data.mods.push(mod);

      this.data.parentSizes.push(parentSize);
      this.data.parentTransforms.push(parentTransform);
      this.data.parentOrigins.push(parentOrigin);
      this.data.parentOpacities.push(parentOpacity);
      this.data.parentAligns.push(parentAlign);

      this.data.childTransforms.push(childTransform);
      this.data.childOrigins.push(childOrigin);
      this.data.childOpacities.push(childOpacity);
      this.data.childAligns.push(childAlign);
    };
  }

  /**
   * Create the container surface and setup the child rendernode.
   *
   * @method _createContainer
   */
  function _createContainer () {
    //Containers size is set on 'parentResize' event
    this.container = new ContainerSurface({
      classes: ['slides-container'],
      properties: { 'overflow' : 'hidden'}
    });
    this.container.context.setPerspective(this.options.perspective);

    //Center the slider inside of the overall widget container
    this.containerMod = new Modifier(this.options.containerMod);
    this.add(this.containerMod).add(this.container);

    //Create render node responsible for rendering the slides
    var mainNode = new RenderNode();
    this.container.add(mainNode);
    mainNode.render = this._innerRender.bind(this);

    // must be two frames, one to eat the dom, and one to render
    Timer.after(this.checkLayout.bind(this), 2);
  }

  /**
   *  Initialization Function.
   *
   *  @method _init
   *  @private
   */
  Layout.prototype._init = function _init() {
    _createItems.call(this);
    _createContainer.call(this);
    _calcDynamicResizeFactors.call(this);

    this._events();
    this.checkLayout();
    if(!this.dynamicResize) {
      this.layout();
    }
  }

  /**
   * Converts options string to actual layout and triggers layout.
   *
   * @method checkLayout
   */
  Layout.prototype.checkLayout = function checkLayout(e) {
    if (typeof this.options.type == 'string') {
      this.options.type = SliderLayouts[this.options.type];
    }
    if (this._layout) this._layout.deactivate(this);
    this._layout = new SliderLayout(this, this.options.type, this.options.options);
  }

  /**
   * Places the items in the correct location.
   *
   * @method layout
   */
  Layout.prototype.layout = function layout() {
    this.halt();

    //TODO: Move this functionality out of layout function to maintain
    //separation of concerns.

    //Check that item size isn't null before calling layout.
    //(Layout functions depend on size being set).
    var currentIndex = this.sequence.getIndex();
    if(this.data.items[currentIndex].getSize(true) === null) {
      EventHelpers.when(function(){
        return this.data.items[currentIndex].getSize(true) !== null;
      }.bind(this), this._layout.layout.bind(this._layout, this));
      return;
    }

    this._layout.layout(this)
  }

  /**
   * Stops the animations
   *
   * @method halt
   */
  Layout.prototype.halt = function halt() {
    for (var i = 0; i < this.data.items.length; i++) {
      this.data.parentTransforms[i].halt();
      this.data.childTransforms[i].halt();
    };
  }

  /**
   *  Given a pixel distance offset, find the closest within the threshold to animate to.
   *  The threshold is the | next to three:
   *
   * offset[0] : |---------------------------------|
   * items     : [-----0----][----1---][---2---][----|3-----][----4---]
   *
   * would animate to 3
   *
   * offset[0] : |--------------------------------------|
   * items     : [-----0----][----1---][---2---][----|3-----][----4---]
   *
   * would animate to 4.
   *
   * @method animateToClosestByOffset
   * @param {Number} offset
   * @private
   */
  Layout.prototype.animateToClosestByOffset = function animateToClosestByOffset(offset) {
    var index = this.sequence.getIndex();
    if (this.options.direction == 0) {
      var newIndex = offset[0] > 0 ?
        this._findThreshold(offset, 0, -1):
        this._findThreshold(offset, 0, 1);
    }
    else {
      var newIndex = offset[1] > 0 ?
        this._findThreshold(offset, 1, -1):
        this._findThreshold(offset, 1, 1);
    }
    this._resetTouchOffset();
    if (newIndex == this.sequence.getIndex()) {
      this.layout()
    }
    else {
      this._eventOutput.emit('set', newIndex);
    }
  }

  /**
   * Runs through each item in the slider, with the current index, looped.
   * Helper function for layouts.
   *
   * @method orderedForEach
   * @param {Function} fn Function to call
   */
  Layout.prototype.orderedForEach = function orderedForEach( fn ) {
    var current = this.sequence.getIndex();
    for (var i = 0; i < this.sequence.length(); i++) {
      current = this.sequence.clamp(current, true);
      var trans = this.data.childTransforms[current];
      var size = this.data.items[current].getSize(true);
      fn.call(this, current, trans, size, i);
      current++;
    };
  }

  /**
   * Gets size of slider
   *
   * @method getSize
   * @returns [Array] container size
   */
  Layout.prototype.getSize = function getSize() {
    return this.container.getSize();
  }

  /**
   *  on start, update the dragging from touchOffset
   *  @method _handleStart
   */
  Layout.prototype._handleStart = function _handleStart(e) {
    this._resetTouchOffset();
  }

  /**
   *  Reset the touch offset to 0.
   *  @method _resetTouchOffset
   */
  Layout.prototype._resetTouchOffset = function _resetTouchOffset() {
    this.data.touchOffset = [0,0];
  }

  /**
   *  @method _handleUpdate
   */
  Layout.prototype._handleUpdate = function _handleUpdate(e) {
    TwoDim.add( this.data.touchOffset, e.delta );
    this._eventOutput.emit('layout');
    this.layout();
  }

  /**
   *  on sync's end event, based on the dragging displacement, animate to desired index.
   *  @method handleEnd
   */
  Layout.prototype._handleEnd = function _handleEnd(e) {
    this.animateToClosestByOffset(this.data.touchOffset);
  }

  /**
   * Finds closest item to animate to based on offset.
   *
   * @method _findThreshold
   * @param offset {2D Array} : distance offset
   * @param dir {Number:0|1} direction, x or y
   * @param incr {Number:1|-1} index direction to search
   */
  Layout.prototype._findThreshold  = function _findThreshold(offset, dir, incr) {
    var beforeThreshold = true;
    var index = this.sequence.getIndex();

    function setFalse() {
      beforeThreshold = false;
      return index;
    }

    var searchedSize = [0,0];
    while (beforeThreshold) {

      var surface = this.data.items[index];
      if (!surface) return setFalse();

      var size = surface.getSize(true);
      if (!size) return setFalse();

      if ((searchedSize[dir] + size[dir] * this.options.threshold) > Math.abs(offset[dir])) {
        return setFalse();
      }

      searchedSize[dir] += size[dir];
      index += incr;
    }
  }

  /**
   * Render all the nodes within the margin. +1 to allow for size information
   *
   * @method _innerRender
   */
  Layout.prototype._innerRender = function _innerRender () {
    var result = [];
    var index = this.sequence.getIndex() - this.options.margin - 1;
    var length = this.sequence.getIndex() + this.options.margin + 1;
    index = index < 0 ? 0 : index;

    for (var i = index; i < length; i++) {
      if (this.nodes[i]) result[i] = this.nodes[i].render();
    };
    return result;
  }

  module.exports = Layout;
});
