define(function(require, exports, module) {
  var Timer                   = require('famous/utilities/Timer');
  var Engine                  = require('famous/core/Engine');
  var Transform               = require('famous/core/Transform');
  var RenderNode              = require('famous/core/RenderNode');
  var Modifier                = require('famous/core/Modifier');
  var ContainerSurface        = require('famous/surfaces/ContainerSurface');
  var TransitionableTransform = require('famous/transitions/TransitionableTransform');
  var Transitionable          = require('famous/transitions/Transitionable');
  var LayoutFactory           = require('./LayoutFactory');
  var SizeAwareView           = require('../constructors/SizeAwareView');
  var EventHelpers            = require('../events/EventHelpers');

  /**
   *  @class LayoutController
   *  @protected
   */
  function LayoutController (options) {
    SizeAwareView.apply(this, arguments);

    this.items;
    this.container;
    this.index;
    this.lastIndex;
    this._activeLayout;
    this.itemsPerPage = options['itemsPerPage'];
    this.renderLimit = [1, 4];
    
    this.nodes = [];
    this.data = {
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
      sizeCacheFull: false
    }

    this._boundLayout = this.layout.bind(this);
    this._boundActivate = this._activate.bind(this);
    this._init();
  }

  LayoutController.prototype = Object.create(SizeAwareView.prototype);
  LayoutController.prototype.constructor = LayoutController;

  LayoutController.DEFAULT_OPTIONS = {
    'classes' : [],
    'loop': undefined,
    'properties': { 
      'overflow' : 'hidden',
      'zIndex' : 1
    },
    'perspective': 1000
  }

  // PUBLIC API METHODS

  /**
   *  @method setSize
   */
  LayoutController.prototype.setSize = function (size) {
    this.container.setSize(size);
  }

  /**
   *  @method getSize
   */
  LayoutController.prototype.getSize = function() {
    return this.container.getSize();
  };


  /**
   *  @method setItems
   */
  LayoutController.prototype.setItems = function (items) {
    this.items = items;
    this._reset();
    this._createItems();
    this.data.sizeCache = new Array(items.length);
    this.data.sizeCacheFull = false;
  }

  /**
   *  @method setIndex
   */
  LayoutController.prototype.setIndex = function (index, triggerAnimation) {
    this.lastIndex = this.index;
    this.index = index;
    this._updateRenderedIndices();
    if(triggerAnimation) this._safeLayout();
  }

  /**
   *  Get the active layout
   *  @method getLayout
   */
  LayoutController.prototype.getLength = function() {
    return Math.min(this.index + this.renderLimit[0] + this.renderLimit[1], this.nodes.length);
  }

  /**
   *  @method setRenderLimit
   *  @param distanceFromIndices {Array} Two dimensional array, first parameter 
   *  is the number of items before the index that will be rendered, 
   *  and the second marks the items after the current index that will be rendered.
   */
  LayoutController.prototype.setRenderLimit = function (distanceFromIndices) {
    if (!distanceFromIndices instanceof Array) { 
      this.renderLimit = [0, distanceFromIndices];
    }
    else { 
      this.renderLimit = distanceFromIndices;
    }
    this._updateRenderedIndices();
  }

  /**
   *  Get the active layout
   *  @method getLayout
   */
  LayoutController.prototype.getLayout = function() {
    return this._activeLayout;
  };

  /**
   *  Get the active layout
   *  @method getLayout
   */
  LayoutController.prototype.layout = function() {
    this._layoutQueue = undefined;
    this._updateSizeCache();
    this.halt();
    if (this._activeLayout) this._activeLayout.layout(this);
  };

  /**
   *  @method setLayout
   */
  LayoutController.prototype.setLayout = function( layoutDefinition ) {
    if (layoutDefinition instanceof Function) layoutDefinition = layoutDefinition({});
    if (this._activeLayout) this._activeLayout.deactivate();
    this._activeLayout = new LayoutFactory(this, layoutDefinition);

    var newLimit = this._activeLayout.renderLimit();
    if (newLimit) this.setRenderLimit(newLimit);
    this._updateRenderedIndices();
    this._safeActivate();
  }
  
  /**
   * Stops the animations
   *
   * @method halt
   */
  LayoutController.prototype.halt = function halt() {
    for (var i = 0; i < this.nodes.length; i++) {
      this.data.childOrigins[i].halt();
      this.data.childAligns[i].halt();
      this.data.childOpacities[i].halt();
      this.data.childTransforms[i].halt();

      this.data.parentOrigins[i].halt();
      this.data.parentAligns[i].halt();
      this.data.parentTransforms[i].halt();
      this.data.parentOpacities[i].halt();
    };
  }

  // PROTECTED METHODS
  LayoutController.prototype._init = function () {
    this._createContainer();
  }

  LayoutController.prototype._safeLayout = function () {
    if (this._layoutQueue) this._layoutQueue();
    else { 
      this._layoutQueue = EventHelpers.frameQueue(this._boundLayout, 4);
    }
  }

  LayoutController.prototype._safeActivate = function () {
    if (this._activateQueue) this._activateQueue();
    else { 
      this._activateQueue = EventHelpers.frameQueue(this._boundActivate, 4);
    }
  }
  
  LayoutController.prototype._activate = function () {
    this._activateQueue = undefined;
    this._updateSizeCache();
    this.halt();
    this._activeLayout.activate(); 
  }

  LayoutController.prototype._updateRenderedIndices = function () {
    var previouslyRendered = this._previousRender ? this._previousRender : [];
    this.futureIndices = this._calculateFutureIndices();

    this._toRender = [];
    for (var i = 0; i < previouslyRendered.length; i++) {
      this._toRender.push(previouslyRendered[i]);
    };

    for (var i = 0; i < this.futureIndices.length; i++) {
      if (this._toRender.indexOf(this.futureIndices[i]) < 0) {
        this._toRender.push(this.futureIndices[i]);
      }
    };
    this._previousRender = this.futureIndices;
    this._toRender.sort(function (a,b) {
      return a - b;
    });
  }

  LayoutController.prototype._calculateFutureIndices = function () {
    var toRender = [];
    var nodeLength = this.nodes.length;
    var maxNegative = 0;
    var totalLimit = this.renderLimit[0] + this.renderLimit[1];
    for (var i = 0; i < totalLimit; i++) {
      if (i == nodeLength) break;
      var index = this.index - this.renderLimit[0] + i; // nodes behind renderlimit
      if (index < 0) {  // loop around
        var currIndex = index % nodeLength; 
        currIndex = currIndex == 0 ? currIndex : currIndex + nodeLength;
        if (currIndex == nodeLength) continue;
        toRender.push(currIndex);
        maxNegative = currIndex > maxNegative ? currIndex : maxNegative;
      }
      else if (maxNegative == 0 || index < maxNegative) {
        toRender.push(index % nodeLength);
      }
    }; 
    return toRender;
  }


  LayoutController.prototype._createContainer = function () {
    this.container = new ContainerSurface({
      classes: this.options.classes,
      properties: this.options.properties
    });
    this.container.context.setPerspective(this.options.perspective);

    var mainNode = new RenderNode();
    mainNode.render = this._innerRender.bind(this);

    this.add(this.container);
    this.container.add(mainNode);
  }
  
  LayoutController.prototype._connectContainer = function _connectContainer(obj) {
    this.container.pipe(obj);
  }

  LayoutController.prototype._createItems = function () {
    for (var i = 0; i < this.items.length; i++) {
      var renderable = this.items[i];

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

      this.data.parentTransforms.push(parentTransform);
      this.data.parentOpacities.push(parentOpacity);
      this.data.parentOrigins.push(parentOrigin);
      this.data.parentAligns.push(parentAlign);
      this.data.parentSizes.push(parentSize);

      this.data.childTransforms.push(childTransform);
      this.data.childOpacities.push(childOpacity);
      this.data.childOrigins.push(childOrigin);
      this.data.childAligns.push(childAlign);
    };
  }

  LayoutController.prototype._reset = function () {
    this.nodes = []
    this.data.parentTransforms = [];
    this.data.parentOpacities = [];
    this.data.parentOrigins = [];
    this.data.parentAligns = [];
    this.data.parentSizes = [];
    this.data.childTransforms = [];
    this.data.childOpacities = [];
    this.data.childOrigins = [];
    this.data.childAligns = [];
    this.data.sizeCache = [];
    this.data.sizeCacheFull = false;
  }

  LayoutController.prototype._sanitizeIndex = function (index) {
    var length = this.nodes.length;
    if (index < 0) return index % length + length;
    else if (index > length - 1) return index % length;
    return index;
  }

  LayoutController.prototype._updateSizeCache = function () {
    if (this.data.sizeCacheFull) return;

    var cache = this.data.sizeCache;
    var size;
    var validSizeCount = 0;
    for (var i = 0; i < cache.length; i++) {
      if (cache[i] === undefined) {
        size = this.items[i].getSize();
        if (size !== null && !(size[0] == 0 && size[1] == 0)) {
          cache[i] = size;
          validSizeCount++;
        }
      } else {
        validSizeCount++;
      }
    }
    if (validSizeCount === cache.length) this.data.sizeCacheFull = true;
  }

  LayoutController.prototype._innerRender = function () {
    var result = [];

    for (var i = 0; i < this._toRender.length; i++) {
      result[i] = this.nodes[this._toRender[i]].render();
    };

    return result;
  }

  module.exports = LayoutController;
});
