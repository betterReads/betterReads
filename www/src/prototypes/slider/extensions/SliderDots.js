define(function(require, exports, module) {
  var Surface                 = require('famous/core/Surface');
  var Modifier                = require('famous/core/Modifier');
  var Transform               = require('famous/core/Transform');
  var RenderNode              = require('famous/core/RenderNode');
  var Transitionable          = require('famous/transitions/Transitionable');
  var TransitionableTransform = require('famous/transitions/TransitionableTransform');
  var SequentialLayout        = require('famous/views/SequentialLayout');
  var Timer                   = require('famous/utilities/Timer');

  var SizeAwareView           = require('../../constructors/SizeAwareView');

  var EventCaller             = require('../../events/EventCaller');
  var Chainer                 = require('../../modifier/Chainer');
  var DiscreteOptions         = require('../../options/DiscreteOptions');
  var EventHelpers            = require('../../events/EventHelpers');
  var SliderAnimations        = require('./SliderAnimations');

  /**
   * Navigation dots for the Slider
   *
   * @class SliderDots
   * @constructor
   */
  function SliderDots (options, sequence) {
    SizeAwareView.apply(this, arguments);

    this.sequence = sequence;
    this.dotSurfaces;
    this.dotModifiers;
    this.dotTransitionables;
    this.dots;
    this.dotRows = []; //Nested array of dots used to create layout.
    this.widthThreshold; //Max lenght of each row.
    this.selectedIndex = null;
    this.dotSelectionCount = 0; //Keep track of how many times selected dot changes.
    this.numberOfRows;
    this.dotsPerRow;
    this.dotsLayout = new SequentialLayout(); //Sequential layout used to display dots.
    this.transitionableTransform;
    this.transitionableOpacity;

    //Check that parent size is defined (happens after first commit after it's read from context).
    EventHelpers.when(function(){
      return this.getParentSize().length !== 0;
    }.bind(this), this._init.bind(this));
  }

  SliderDots.prototype = Object.create(SizeAwareView.prototype);
  SliderDots.prototype.constructor = SliderDots;
  SliderDots.NAME = 'sliderDots';

  SliderDots.DEFAULT_OPTIONS = {
    'dotSize': [10, 10],
    'dotSpacing': 10,
    'dotVerticalOffset': 10,
    'dotHorizontalOffset' : 0,
    'lastRowOrigin': [0.5, 0],
    'widthThreshold': null,
    'dotsLayoutOrigin' : [0.5, 1],
    'dotsLayoutAlign' : [0.5, 1],
    'triggerAnimations' : true,
    'triggerAnimationsOnLoad' : false,
    'dotOnClickMove' : [
      {
        delay: function(animationIndex) {
          return animationIndex * 25;
        }
      },
      {
        transformFinal: Transform.translate(0, 0.75, 0),
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
          // curve: 'outBounce',
          // duration: 250
        }
      }
    ],
    'dotsShow': {
      'movement': [
        {
          transformFinal: Transform.scale(1, 1),
          curve: {
            curve: 'outExpo',
            duration: 500
          }
        },
      ],
      'opacityTransition' : {
        value : 1,
        transition : {duration: 500, curve: 'linear'}
      }
    },
    'dotsHide': {
      'movement': [
        {
          transformFinal: Transform.scale(0.01, 0.01),
          curve: {
            curve: 'inExpo',
            duration: 500,
          }
        }
      ],
      'opacityTransition' : {
        value : 0,
        transition : {duration: 1000, curve: 'linear'}
      }
    },
    'dotsVisible' : true,
    'dotDebounceTime' : 200
  }

  SliderDots.events = {
    'set'               : 'selectDot',        // Listen to slider's page change.
    'change:length'     : '_setUpDotsLayout', // Listen to change in options that will effect # of dots
    'change:pagination' : '_setUpDotsLayout',
    'change:dotsVisible': '_showOrHideDots',  // Show/Hide dots on event
    'parentResize'      : '_reflowDots'       // Reflow dots on parent resize
  }
    
  /**
   * Initializes the SliderDots
   *
   * @method _init
   * @private
   */
  SliderDots.prototype._init = function _init() {
    this._setUpDotsLayout();
    this._events.call(this);
    this._showOrHideDots();
  }

  /**
   * Sets up the class's event listeners.
   *
   * @method _events
   * @private
   */
  SliderDots.prototype._events = function _events() {
    DiscreteOptions.listenToInternalChange.call(this);
    EventCaller.bind.call(this);
  }

 
  /**
   * Creates underlying array of dots' data and places dots into SequentialLayout
   *
   * @method _setUpDotsLayout
   * @private
   */

  SliderDots.prototype._setUpDotsLayout = function _setUpDotsLayout() {
    //TODO: Refactor to trigger hide and then create new dots layout
    //      post animation completion using callback

    //Create nested array of dots used to create dots layout.
    this._createDots.call(this);
    this._placeDotsinRows.call(this);

    //Place dots into sequential layouts
    this._createDotsLayout.call(this);

    this.selectDot.call(this, this.sequence.getPaginatedIndex());
  }

  /**
   * Reflow dots by re-calculating their placement into rows.
   *
   * @method _reflowDots
   * @private
   */
  SliderDots.prototype._reflowDots = function _reflowDots() {
    //Don't reflow if widthThreshold is explicitly set by user.
    if (this.options['widthThreshold'] !== null) return;

    this._placeDotsinRows.call(this);
    this._createDotsLayout.call(this);
  }

  /**
   * Show or hide dots using "dotShow" or "dotHide" animation defined in options
   *
   * @method _showOrHideDots
   * @private
   */
  SliderDots.prototype._showOrHideDots = function _showOrHideDots() {
    var dotAction = this.options.dotsVisible ? 'dotsShow' : 'dotsHide';

    //Trigger movement
    this.transitionableTransform.halt()
    Chainer(this.options[dotAction]['movement'], this.transitionableTransform);

    //Trigger opacity
    this.transitionableOpacity.halt();
    this.transitionableOpacity.set(
      this.options[dotAction]['opacityTransition'].value,
      this.options[dotAction]['opacityTransition'].transition
    );
  }

  /**
   * Get render node representing a dot based on numerical index.
   *
   * @method _dotFromIndex
   * @param index {Number}
   * @return {Object} Render node representing an individual dot.
   * @private
   */
  function _dotFromIndex(index) {
    var rowIndex = Math.floor(index / this.dotsPerRow);
    index = index - row * this.dotsPerRow;

    return this.dotRows[rowIndex][index];
  }

  /**
   * Creates nested SequentialLayout for when there are multiple rows of dots
   *
   * @method _createNestedDotLayout
   * @private
   */
  function _createNestedDotLayout() {
    var rowLayout;
    var rowLayouts = []; //Store of horizontal sequential layouts

    //Create a vertical sequential layout to store rows of dots
    this.dotsLayout.setOptions({
      direction: 1,
      itemSpacing: this.options['dotSpacing']
    });
    this.dotsLayout.sequenceFrom(rowLayouts);

    //Populate rows
    for (var row = 0; row < this.numberOfRows; row++) {
      rowLayout = new SequentialLayout({
        direction: 0,
        itemSpacing: this.options['dotSpacing']
      });
      rowLayout.sequenceFrom(this.dotRows[row]);

      //Apply positioning modifier to bottom row
      if (row === this.numberOfRows - 1) {
        var node = new RenderNode();
        node.add(new Modifier({origin: this.options['lastRowOrigin']})).add(rowLayout);
        rowLayouts.push(node);
      } else {
        rowLayouts.push(rowLayout);
      }
    }
  }

  /**
   * Sets the 'selectedDot' class based on the Sequence's paginated index.
   * Triggers animation based on SliderDot's options: 'triggerAnimations', 'triggerAnimationsOnLoad'
   *
   * @method selectDot
   */
  SliderDots.prototype.selectDot = function selectDot() {
    var oldIndex = this.selectedIndex;
    var newIndex = this.sequence.getPaginatedIndex();

    if (this.selectedIndex !== null) {
      this.dotSurfaces[oldIndex].removeClass('selectedDot');
    }

    this.dotSurfaces[newIndex].addClass('selectedDot');
    this.selectedIndex = newIndex;
    this.dotSelectionCount++;

    //Trigger dot animation
    if (this.options['triggerAnimations']) {
      //Animation on load
      if (this.dotSelectionCount <= 1 && !this.options['triggerAnimationsOnLoad']) return;

      //Set animation direction.
      var step = this.options['animationStep'];
      step = (newIndex >= oldIndex) ? step : step * -1;

      this.animate.call(this, newIndex, step);
    }
  }

  /**
   * Triggers dot animation based on animation defined in 'dotOnClickMove' option.
   *
   * @method animate
   * @param {Number} index
   */
  SliderDots.prototype.animate = function animate(index) {
    Chainer(this.options['dotOnClickMove'], this.dotTransitionables[index]);
  }

  /**
   * Shows the dots by changing the 'dotVisible' option.
   *
   * @method show
   */
  SliderDots.prototype.show = function show() {
    this._eventOutput.emit('set:options', {'dotsVisible': true});
  }

  /**
   * Hides the dots by changing the 'dotVisible' option.
   *
   * @method hide
   */
  SliderDots.prototype.hide = function hide() {
    this._eventOutput.emit('set:options', {'dotsVisible': false});
  }

  /**
   * Create underlying array of render nodes representing dots and push them into this.dots array for reference.
   * The number of dots in the array is based on Sequence's paginated length.
   *
   * @method _createDots
   * @private
   */
  SliderDots.prototype._createDots = function _createDots() {
    //Reset arrays;
    this.dots = [];
    this.dotSurfaces = [];
    this.dotModifiers = [];
    this.dotTransitionables = [];

    for(var i = 0; i < this.sequence.paginatedLength(); i++) {
      this.dots.push(this._createDot.call(this, i));
    }
  }

  /**
   * Creates a render node with a surface and modifier linked to a transitionable transform
   * that represents an individual dot.
   *
   * @method _createDot
   * @param {Number} index
   * @return {Object} Render node representing an individual dot.
   * @private
   */
  SliderDots.prototype._createDot = function _createDot(index) {
    var dot = new Surface({
      classes: ['dot'],
      size: this.options['dotSize'],
      properties: { zIndex: 2 }
    });
    this.dotSurfaces.push(dot);

    dot.on('click', function (index){
      this._eventOutput.emit('set', index * this.sequence.getPagination());
    }.bind(this, index));

    //Add modifier for use in animation
    var dotTransitionable = new TransitionableTransform();
    var dotMod = new Modifier({transform: dotTransitionable});
    this.dotModifiers.push(dotMod);
    this.dotTransitionables.push(dotTransitionable);

    var node = new RenderNode();
    node.add(dotMod).add(dot);
    return node;
  }

  /**
   * Create nested array (this.dotRows) based on maximum width of each row that is used to
   * create a SequentialLayout of dots.
   *
   * @method _placeDotsinRows
   * @private
   */
  SliderDots.prototype._placeDotsinRows = function _placeDotsinRows() {
    this.dotRows = []; //Reset nested array of dots used to create layout.
    this.dotRows.push([]); //Init first row of dots.

    var row = 0; //Row index.
    var rowWidth = 0; //Length of current row.

    // Calculate max width for dot row.
    this.widthThreshold = this.options['widthThreshold'] ? this.options['widthThreshold'] : this.getParentSize()[0];

    // Create array of dots.
    var dot;
    var dotWidthAndSpacing = this.options['dotSize'][0] + this.options['dotSpacing'];
    var dotIndex = 0;

    //Create dots and place them in nested array.
    for (var i = 0; i < this.dots.length; i++) {
      //Check if there is enough space to add dot to current row
      if ((rowWidth + dotWidthAndSpacing) > this.widthThreshold) {
        //Add new row to array.
        row++;
        rowWidth = 0;
        this.dotRows.push([]);
      }

      rowWidth += dotWidthAndSpacing;
      this.dotRows[row].push(this.dots[i]);
    }

    this.numberOfRows = this.dotRows.length;
    this.dotsPerRow = Math.max(this.dotRows[0].length, 1);
  }

  /**
   * Places dots into a SequentialLayout.
   * If there are multiple rows of dots, a nested SequentialLayout is created: a parent
   * layout to layout all the rows, and child layouts to represent each individual row.
   *
   * @method _createDotsLayout
   * @private
   */
  SliderDots.prototype._createDotsLayout = function _createDotsLayout() {
    //Single row --> Single sequential layout.
    if (this.numberOfRows === 1) {
      this.dotsLayout.setOptions({
        direction: 0,
        itemSpacing: this.options['dotSpacing']
      });
      this.dotsLayout.sequenceFrom(this.dotRows[0]);
    }
    //Multiple rows --> Nested sequential layout.
    else {
      _createNestedDotLayout.call(this);
    }

    //Add dot layout to view.
    var layoutHeight =    this.options['dotSize'][1] * this.dotRows.length
                        + this.options['dotSpacing'] * (this.dotRows.length - 1);
    var verticalOffset = layoutHeight + this.options['dotVerticalOffset'];

    this.offsetModifier = new Modifier({
      transform: Transform.translate(this.options['dotHorizontalOffset'], verticalOffset)
    });

    this.transitionableTransform = new TransitionableTransform();

    this.transitionableOpacity = new Transitionable();
    var opacity = this.options.dotsVisible ? true : false;
    this.transitionableOpacity.set(opacity);

    this.layoutModifier = new Modifier({
      origin: this.options['dotsLayoutOrigin'],
      align: this.options['dotsLayoutAlign'],
      opacity: this.transitionableOpacity,
      transform: this.transitionableTransform
    });
    this.add(this.offsetModifier).add(this.layoutModifier).add(this.dotsLayout);
  }

  module.exports = SliderDots;
});
