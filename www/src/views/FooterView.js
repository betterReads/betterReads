/* globals define */
define(function(require, exports, module) {
  'use strict';

  var Surface        = require('famous/core/Surface');
  var Modifier       = require('famous/core/Modifier');
  var View           = require('famous/core/View');
  var Transform      = require('famous/core/Transform');
  var FlexibleLayout = require('famous/views/FlexibleLayout');
  var TabButtonView  = require('views/TabButtonView');

  /**
   * Footer View which contains the navigation tab buttons
   *
   * @class FooterView
   * @extends View
   * @param {Object} options
   *
   */
  function FooterView(options) {
    View.apply(this, arguments);

    /*
      ----------------------------------------------------------------
              Add buttons in flexible layout
      ----------------------------------------------------------------

      create a new flexible layout instance with the options from the 
      TabTemplate's DEFAULT_OPTIONS.  FlexibleLayout dynamically scales 
      the buttons to fit in the space provided
    */
    this.layout  = new FlexibleLayout(this.options.flexibleLayout);
    this.buttons = {};
    this.buttonPositions = [];
    this.layoutZModifier = new Modifier({
      transform: Transform.translate(0, 0, 1)
    });

    this.add(this.layoutZModifier).add(this.layout);

    /*
      ----------------------------------------------------------------
                Add Background Surface 
      ----------------------------------------------------------------

      creates the background surface and attaches it to the render node
    */
    this.background = new Surface({
      classes: ['footer-background'],
      properties: {
        backgroundColor: this.options.backgroundColor
      }
    });

    this.add(this.background);

    /*
      ----------------------------------------------------------------
                Set event listeners 
      ----------------------------------------------------------------

      Emits pageChange events on click of the TabButton instances
    */
    this._eventInput.on('tabButtonClicked', function(eventPayload) {
      this._eventOutput.emit('navigate', eventPayload); 
    }.bind(this));
  }

  FooterView.prototype             = Object.create(View.prototype);
  FooterView.prototype.constructor = FooterView;
  FooterView.DEFAULT_OPTIONS       = {};

  /**
   * Adds a the button to the footer's flexible layout and reflows the buttons accordingly
   *
   * @public
   * @method addButton
   * @param {Object} data 
   *
   */
  FooterView.prototype.addButton = function addButton(data) {
    var tabButtonView = new TabButtonView(data);
    tabButtonView.pipe(this);
    this.buttons[data.title] = tabButtonView;
    this.buttonPositions[data.footerIconPosition] = tabButtonView; 

    _reflowButtons.call(this);
  };

  /**
   * Changes the color of the selected button as a callback to lolightIcons
   *
   * @public
   * @method highlightIcon
   * @param {string} title 
   *
   */
  FooterView.prototype.highlightIcon = function highlightIcon(title) {
    this.lolightIcons(function() {
      this.buttons[title].highlight();
    }.bind(this));
  };

  /**
   * Resets the color of all of the TabButtons
   *
   * @public
   * @method lolightIcons 
   * @param {Function} cb 
   *
   */
  FooterView.prototype.lolightIcons = function lolightIcons(cb) {
    for (var title in this.buttons) {
      this.buttons[title].lolight();
    }
    if (cb) cb();
  };

  /**
   * Causes buttons in the footer to reflow
   *
   * @private
   * @method reflowButtons 
   *
   */
  function _reflowButtons() {
    this.layout.sequenceFrom(this.buttonPositions);
    var i;
    var temp = [];
    for (i = this.buttonPositions.length; i--;) {
      temp.push(1);
    }
    this.layout.setRatios(temp);
  }

  /**
   * @exports FooterView
   */
  module.exports = FooterView;
});
