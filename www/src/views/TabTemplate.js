/* globals define */
define(function(require, exports, module) {
  'use strict';
  
  var View               = require('famous/core/View');
  var RenderNode         = require('famous/core/RenderNode');
  var Modifier           = require('famous/core/Modifier');
  var Transform          = require('famous/core/Transform');
  var HeaderFooterLayout = require('famous/views/HeaderFooterLayout');
  var HeaderView         = require('components/HeaderView');
  var ContentView        = require('components/ContentView');
  var FooterView         = require('views/FooterView');

  /**
   * Top level View that lays out app and delegates events and methods between the components.
   * The View hierarchy is shown in the README.md
   *
   * @class TabTemplate
   * @extends View
   * @param {Object} options
   *
   */
  function TabTemplate(options) {
    View.apply(this, arguments);

    /*  
    =================================================================
             Scaffold app Header-Footer Layout
    =================================================================
    */
    this.layout = new HeaderFooterLayout(this.options.layoutOptions); 

    /*
    =================================================================
          Add view instances to the layout render nodes
    -----------------------------------------------------------------

      HeaderView is the header bar in the application.
      FooterView is the tabbed footer in the application.
      ContentView contains the RenderController that shows content 
      in the middle pane based on the application's state.  

      Each of these views's constructor options are provided from 
      the TabTemplate's default options above.

    =================================================================
    */
    var header = new RenderNode();
    var headerZModifier = new Modifier({
      transform: Transform.translate(0, 0, 10)
    });
    this.header = new HeaderView();
    header.add(headerZModifier).add(this.header);

    var footer = new RenderNode();
    var footerZModifier = new Modifier({
      transform: Transform.translate(0, 0, 10)
    });
    this.footer  = new FooterView(this.options.footer);
    footer.add(footerZModifier).add(this.footer);

    this.content = new ContentView(this.options.content);

    this.footer.pipe(this);
    this.header.pipe(this);
    this.content.pipe(this);

    this.layout.header  = header;
    this.layout.content = this.content;
    this.layout.footer  = footer;
    
    /*
    =================================================================
      Add the Header-Footer Layout to the TabTemplate Render Node 
    =================================================================
    */
    this.add(this.layout);

    /*  
    =================================================================
            Wire up events throughout the app 
    -----------------------------------------------------------------

      The FooterView's nav bar and the ContentView can each emit
      pageChange events, which are handled by the _handlePageChange
      callback below.  The event object emitted with the event is
      passed as the first argument to these callbacks

    =================================================================
    */
    this._eventInput.on('navigate', _handlePageChange.bind(this, 'navigate'));
    this._eventInput.on('navigate:back', _handlePageBack.bind(this, 'navigate:back'));
    this._eventInput.on('navigate:modal', _handleDetail.bind(this, 'navigate:modal'));
  }

  TabTemplate.prototype             = Object.create(View.prototype);
  TabTemplate.prototype.constructor = TabTemplate;
  TabTemplate.DEFAULT_OPTIONS       = {

    /*  
    -----------------------------------------------------------------
      The layout options for the App's HeaderFooterLayout which 
      specify the app laid out vertically with pixel values for 
      the height of the header and footer.  iOS retina displays
      will double these pixel values on screen
    -----------------------------------------------------------------
    */
    layoutOptions: {
      direction: HeaderFooterLayout.DIRECTION_Y,
      headerSize: 56,
      footerSize: 60
    },

    /*
    -----------------------------------------------------------------
      The ContentView constructors options.
      Specify the default content background color
    -----------------------------------------------------------------
    */
    content: {
      backgroundColor: '#FFF',
      scrollDemo: {
        edgeGrip: 0.8,
        edgeDamp: 0.8
      }
    },

    /*
    -----------------------------------------------------------------
      The FooterView contructor's options.
      Specify the default Footer background color as well as other
      options here.
    -----------------------------------------------------------------
    */
    footer: {
      backgroundColor: '#FFF'
    }
  };

  /**
   * Calls subviews' methods to correctly push on a new state of the app
   *
   * @private
   * @method _handlePageChange
   * @param {string} eventName
   * @param {Object} eventPayload
   *
   */
  function _handlePageChange(eventName, eventPayload) {
    this.header.setTitle(eventPayload.title);
    this.content.showPage(eventName, eventPayload);
    this.footer.highlightIcon(eventPayload.title);

    if (eventPayload.showBackButton) {
      this.header.showLeftButton();
    } else {
      this.header.hideLeftButton();
    }
  }

  /**
   * Calls navigateBack on the contentView to pop the last state from the History stack
   *
   * @private
   * @method _handlePageBack
   *
   */
  function _handlePageBack() {
    this.content.navigateBack();
  }

  /**
   * Shows a detail modal view upon reciept of a 'navigate:modal' event 
   *
   * @private
   * @method _handleDetail
   * @param {string} eventName
   * @param {Object} eventPayload
   *
   */
  function _handleDetail(eventName, eventPayload) {
    this.header.setTitle(eventPayload.title);
    this.content.showDetail(eventPayload);

    if (eventPayload.showBackButton) {
      this.header.showLeftButton();
    } else {
      this.header.hideLeftButton();
    }
  }

  /**
   * Adds a page to the contentView and an icon into the tabbed Footer
   *
   * @public
   * @method addPage
   * @param {Object} page 
   * @return this
   *
   */
  TabTemplate.prototype.addPage = function addPage(page) {
    this.footer.addButton(page);
    this.content.addPage(page);
    return this;
  };

  /**
   * Programmatically show a new page, without user input
   *
   * @public
   * @method showPage
   * @param {Object} page 
   * @return this
   *
   */
  TabTemplate.prototype.showPage = function showPage(title) {
    this._eventInput.trigger('navigate', {
      title: title 
    });
    return this;
  };

  /**
   * @exports TabTemplate 
   */
  module.exports = TabTemplate;
});
