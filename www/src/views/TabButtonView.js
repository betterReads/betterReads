/* globals define */
define(function(require, exports, module) {
  'use strict';
  
  var ButtonView = require('components/ButtonView');

  /**
   * View for the footer nav Tab Buttons
   *
   * @class TabTemplate
   * @extends ButtonView
   * @param {Object} options
   *
   */
  function TabButtonView(options) {
    ButtonView.apply(this, arguments);
    this.content.setContent(_setButtonContent(this.options.title,
                          this.options.footerIconName,
                          this.options.footerIconPath));

    this.options.eventPayload = {
      title: this.options.title
    };
  }

  TabButtonView.prototype             = Object.create(ButtonView.prototype);
  TabButtonView.prototype.constructor = TabButtonView;
  TabButtonView.DEFAULT_OPTIONS       = {
    eventName: 'tabButtonClicked'
  };
  
  /**
   * Returns the HTML string for the button using either the
   * footerIconName from FontAwesome or the footerIconPath to
   * the resource in the /resources directory
   *
   * @private
   * @method _setButtonContent
   * @param {string} title 
   * @param {string} footerIconName 
   * @param {string} footerIconPath 
   *
   */
  function _setButtonContent(title, footerIconName, footerIconPath) {
    if (footerIconName) {
      return '<i class="fa ' + footerIconName + '"></i>' +
           '<p class="button-text">' + title + '</p>';
    } 
    else {
      return '<img class="button-icon" src="' + footerIconPath + '">' +
           '<p class="button-text">' + title + '</p>';
    }
  }

  /**
   * Sets CSS classes for changing the background color to the "selected" state.
   * The styles are found in /css/app.css
   *
   * @public
   * @method highlight 
   *
   */
  TabButtonView.prototype.highlight = function highlight() {
    this.content.setClasses(['button-content', 'button-highlight']);
  };

  /**
   * Resets CSS classes for the "unselected" state. 
   * The styles are found in /css/app.css
   *
   * @public
   * @method lolight 
   *
   */
  TabButtonView.prototype.lolight = function lolight() {
    this.content.setClasses(['button-content']);
  };

  /**
   * @exports TabButtonView 
   */
  module.exports = TabButtonView;
});
