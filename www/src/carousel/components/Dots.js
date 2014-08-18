define(function(require, exports, module) {
  var SizeAwareView           = require('../constructors/SizeAwareView');
  var Surface                 = require('famous/core/Surface');
  var Modifier                = require('famous/core/Modifier');
  var RenderNode              = require('famous/core/RenderNode');
  var Transform               = require('famous/core/Transform');
  var Transitionable          = require('famous/transitions/Transitionable');
  var TransitionableTransform = require('famous/transitions/TransitionableTransform');
  var SequentialLayout        = require('famous/views/SequentialLayout');
  var Timer                   = require('famous/utilities/Timer');

  var EventHelpers            = require('../events/EventHelpers');

  /**
   * Adjustable dots used for Carousel navigation.
   *
   * @class Dots
   * @constructor
   * @protected
   *
   * @param {Object} [options] An object of configurable options.
   * @param {String} [options.position] Valid options: ["left" | "middle" | "right"]. Determines the horizontal placement of the arrows. The vertical position of the arrows are flush against bottom bounding border of the carousel.
   * @param {Array|2D} [options.padding] Determines the displacement from dot position set by dotsPosition. The first value in the array corresponds to the horizontal offset where a positive value pushes the dots to right and a negative value pushes them to the left. The second value in the array corresponds to the vertical offset where a negative value pushes the dots up towards the top of the carousel and a positive value pushes them down.
   * @param {Array|2D} [options.size] The width and height (in pixels) of the selection dots.
   * @param {Number} [options.horizontalSpacing] The horizontal spacing (in pixels) between each dot.
   * @param {Number} [options.length] The number of dots to display.
   * @param {Number} [options.selectedIndex] The index of the image currently being displayed.
   *
   * @css {.famous-carousel-dot} Applied to each dot.
   * @css {.famous-carousel-dot-selected} Applied to currently selected dot.
   */
  function Dots(options) {
    SizeAwareView.apply(this, arguments);

    this._data = {
      dots: [], // {surface, modifier, transTransform, renderNode}
      parentSize: [],
      dotCount: this.options['length'],
      layoutModel: [], // array used as blueprint to create layout,
      selectedIndex: this.options['selectedIndex']
    }

    this.layout = new SequentialLayout({
      defaultItemSize: this.options['size']
    }); //Layout used to display dots.
    this.positionMod = new Modifier();
    this.animationMod = new Modifier();
    this.opacityTrans = new Transitionable(1);
    this.transTransform = new TransitionableTransform();

    this.displayed = true; //Track whether arrows are displayed.

    // Delay initialization until parentSize is defined since
    // the dots need to be size aware in order to properly lay
    // themselves out.
    EventHelpers.when(function() {
      return this.getParentSize().length !== 0;
    }.bind(this), this._init.bind(this));
  }

  Dots.prototype = Object.create(SizeAwareView.prototype);
  Dots.prototype.constructor = Dots;

  Dots.DEFAULT_OPTIONS = {
    'position'         : 'center',
    'padding'          : [0, -10],
    'size'             : [10, 10],
    'horizontalSpacing': 10,
    'length'           : 1,
    'selectedIndex'    : 0
  }

  Dots.POSITION_TO_ALIGN = {
    'left' : 0,
    'middle' : 0.5,
    'right'    : 1
  }

  Dots.ANIMATION_OPTIONS = {
    click: {
      offset: -7,
      transition: {
        curve: 'outExpo',
        duration: 250
      }
    },
    display: {
      scaleUp: 1.15,
      duration: 600,
      curve: 'outExpo'
    }
  }

  /**
   * Sets an index.
   *
   * @method setIndex
   */
  Dots.prototype.setIndex = function setIndex(index) {
    if (index === this._data.selectedIndex) return;
    if (index >= this._data.dots.length || index < 0) return;

    var oldIndex = this._data.selectedIndex;
    this._data.dots[oldIndex].surface.removeClass('famous-carousel-dot-selected');
    this._data.dots[index].surface.addClass('famous-carousel-dot-selected');
    this._data.selectedIndex = index;
  }

  /**
   * Display dots using animation.
   * Options set in Dots.ANIMATION_OPTIONS.display
   *
   * @method show
   * @param {Function} [cb] Callback function to call after animation.
   */
  Dots.prototype.show = function show(cb) {
    if (this.displayed) return;

    this.opacityTrans.halt();
    this.transTransform.halt();

    this.displayed = true;
    var opts = Dots.ANIMATION_OPTIONS.display;
    this.opacityTrans.set(1, {duration: 100, curve: 'inExpo'});
    this.transTransform.set(Transform.identity);
    this.transTransform.set(
      Transform.scale(opts.scaleUp, opts.scaleUp),
      {duration: opts.duration * 1/3, curve: 'outExpo'},
      function(){
        this.transTransform.set(
          Transform.identity,
          {duration: opts.duration * 2/3, curve: opts.curve},
          cb
        );
      }.bind(this)
    );
  }

  /**
   * Hide dots using animation.
   * Options set in Dots.ANIMATION_OPTIONS.display
   *
   * @method hide
   * @param {Function} [cb] Callback function to call after animation.
   */
  Dots.prototype.hide = function hide(cb) {
    if (!this.displayed) return;

    this.opacityTrans.halt();
    this.transTransform.halt();

    this.displayed = false;
    var opts = Dots.ANIMATION_OPTIONS.display;
    this.opacityTrans.set(1, {duration: opts.duration, curve: opts.curve});
    this.transTransform.set(
      Transform.scale(opts.scaleUp, opts.scaleUp),
      {duration: opts.duration * 0.25, curve: 'outExpo'},
      function() {
        this.transTransform.set(
          Transform.scale(0.0001, 0.0001),
          {duration: opts.duration * 0.75, curve: opts.curve},
          cb
        );
      }.bind(this)
    );
  }

  /**
   * Changes number of dots displayed with an animation.
   *
   * @method setLength
   * @param {Number} [length] Length of new dot count.
   * @param {Number} [itemsPerPage] Number of items displayed per page (used to calculate updated index).
   */
  Dots.prototype.setLength = function setLength(length, itemsPerPage, selectedIndex){
    this._data.dotCount = length;
    this._data.selectedIndex = Math.floor(this._data.selectedIndex / itemsPerPage);

    this.hide(function(){
      this._init();
      this.setIndex(selectedIndex);
      Timer.after(this.show.bind(this), 1); //Make sure content is initialized before triggering animation.
    }.bind(this));
  }

  /**
   * @method _init
   * @protected
   */
  Dots.prototype._init = function _init() {
    this._data.parentSize = this.getParentSize();

    this._initContent();
    this._createLayout();
  }

  /**
   * @method _initContent
   * @protected
   */
  Dots.prototype._initContent = function _initSurfaces() {
    //Create Dots
    this._data.dots = [];
    for(var i = 0; i < this._data.dotCount; i++) {
      this._data.dots.push(this._createNode(i));
    }
  }

  /**
   * Creates and returns an object with Surface, Modifier,
   * TransitionableTransform, and RenderNode representing an individual dot.
   *
   * @method _createNode
   * @protected
   * @param {Number} [index] Index corresponding to dot.
   * @return {Object} [storage] Contains reference to index, surface, transTransform, modifier and renderNode
   */
  Dots.prototype._createNode = function _createNode(index) {
    var storage = {};
    storage.index = index;
    storage.surface = new Surface({
      classes: ['famous-carousel-dot'],
      size: this.options['size'],
      properties: {zIndex: 2}
    });

    if(index === this._data.selectedIndex) storage.surface.addClass('famous-carousel-dot-selected');

    storage.surface.on('click', this._changeIndex.bind(this, storage));
    if(this.options['toggleArrowsDisplayOnHover']) {
      storage.surface.on('mouseover', this._eventOutput.emit.bind(this._eventOutput, 'showArrows'));
      storage.surface.on('mouseout', this._eventOutput.emit.bind(this._eventOutput, 'hideArrows'));
    }

    storage.transTransform =  new TransitionableTransform();
    storage.modifier = new Modifier({
      transform: storage.transTransform
    });

    storage.renderNode = new RenderNode();
    storage.renderNode.add(storage.modifier).add(storage.surface)

    return storage;
  }

  /**
   * Create SequentialLayout used to position the dots.
   *
   * @method _createLayout
   * @protected
   */
  Dots.prototype._createLayout = function _createLayout() {
    //Create an array representing blueprint for SequentialLayout.
    var layoutModel = this._createLayoutModel();

    //Single row --> single SequentialLayout to display dots
    if(layoutModel.length === 1) {
      this.layout.setOptions({
        direction: 0,
        itemSpacing: this.options['horizontalSpacing']
      });
      this.layout.sequenceFrom(layoutModel[0]);
    } else {
      this._createNestedLayout();
    }

    this._addLayout();
  }

  /**
   * Create nested SequentialLayout used to position the dots.
   * (Handles edge case when there are multiple rows of dots.)
   *
   * @method _createNestedLayout
   * @protected
   */
  Dots.prototype._createNestedLayout = function _createNestedLayout() {
    var rowLayouts = []; //Store of horizontal SequentialLayouts
    var spacing = this.options['horizontalSpacing'];

    this.layout.setOptions({
      direction: 1,
      itemSpacing: spacing
    });
    this.layout.sequenceFrom(rowLayouts);

    //Populate rows.
    var layoutModel = this._data.layoutModel;
    var rowLayout;
    for(var row = 0; row < layoutModel.length; row++) {
      rowLayout = new SequentialLayout({
        direction: 0,
        itemSpacing: spacing,
        defaultItemSize: this.options['size']
      });
      rowLayout.sequenceFrom(layoutModel[row]);

      //Apply positioning modifier to position bottom row.
      if(row === (layoutModel.length - 1) && layoutModel.length > 1) {
        var node = new RenderNode();
        node.add(new Modifier({
          origin: [Dots.POSITION_TO_ALIGN[this.options['position']], 0]
        })).add(rowLayout);
        rowLayouts.push(node);
      } else {
        rowLayouts.push(rowLayout);
      }
    }
  }

  /**
   * Add dots layout to view.
   *
   * @method _addLayout
   * @protected
   */
  Dots.prototype._addLayout = function _addLayout() {
    var horizontalPos = Dots.POSITION_TO_ALIGN[this.options['position']];
    
    this.positionMod.setOrigin([horizontalPos, 1]);
    this.positionMod.setAlign([horizontalPos, 1]);
    this.positionMod.setTransform(Transform.translate(this.options['padding'][0], 
                                                      this.options['padding'][1]));

    this.animationMod.setOpacity(this.opacityTrans);
    this.animationMod.setTransform(this.transTransform);

    this.add(this.positionMod).add(this.animationMod).add(this.layout);
  }

  /**
   * Create an array used to represent how many dots should be placed per row. 
   * (Deals with corner case in which there are multiple rows of dots.)
   *
   * @method _createLayoutModel
   * @protected
   * @param {Array|Nested} [layoutModel]
   */
  Dots.prototype._createLayoutModel = function _createLayoutModel() {
    var widthThreshold = this._data.parentSize[0]; //Entry point to limit dots to slide size.

    //Reset model.
    var layoutModel = [];
    layoutModel.push([]);

    var rowIndex = 0;
    var rowWidth = 0; //Tracks length of current row in pixels.

    var dotWidth = this.options['size'][0] + this.options['horizontalSpacing'];

    //Create model.
    var dots = this._data.dots;
    for(var i = 0; i < dots.length; i++) {
      //Check if there is enough space to add dot to current row
      if((rowWidth + dotWidth) > widthThreshold) {
        //Add new row.
        rowIndex++;
        rowWidth = 0;
        layoutModel.push([]);
      }

      rowWidth += dotWidth;
      layoutModel[rowIndex].push(dots[i].renderNode);
    }
    
    this._data.layoutModel = layoutModel;
    return layoutModel;
  }

  /**
   * Emits 'set' event and triggers animation.
   *
   * @method _changeIndex
   * @protected
   * @param {Object} [dot] Dot object with reference its index and transTransform
   */
  Dots.prototype._changeIndex = function _changeIndex(dot) {
    this._eventOutput.emit('set', dot.index);
    this._animateDot(dot.transTransform);
  }

  /**
   * Animates a selected dot.
   * Options set in Dots.ANIMATION_OPTIONS.click
   *
   * @method _animateDot
   * @protected
   * @param {TransitionableTransform} [transTransform]
   */
  Dots.prototype._animateDot = function _animateDot(transTransform) {
    var opts = Dots.ANIMATION_OPTIONS.click;
    transTransform.set(Transform.translate(0, opts.offset), {duration: 1}, function(){
      transTransform.set(Transform.identity, opts.transition);
    })
  }

  module.exports = Dots;
});
