/* globals define */
define(function(require, exports, module) {
  'use strict';
  
  var Engine       = require('famous/core/Engine');
  var Utility      = require('famous/utilities/Utility');
  var TabTemplate  = require('views/TabTemplate');
  var FamousView   = require('components/FamousView');
  var ScrollDemo   = require('components/ScrollDemo');
  var DetailView   = require('components/DetailView');
  var aboutContent = require('components/templates/about');

  var ImageSurface = require('famous/surfaces/ImageSurface');
  var Modifier     = require('famous/core/Modifier');
  var View         = require('famous/core/View');
  var ScrollView   = require('famous/views/ScrollView');
  var Surface      = require('famous/core/Surface');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ScrollItem   = require('components/ScrollListItem');

  var ShelfView = require('views/ShelfView');
  var LibraryView = require('views/LibraryView');
  var CollectionsView = require('views/CollectionsView');
  var FriendsView = require('views/FriendsView');
  var SearchView = require('views/SearchView');
  var LogInView = require('views/LogInView');


  require('famous/inputs/FastClick');

  var app = new TabTemplate({
    /*  
    -----------------------------------------------------------------
      The layout options for the App's HeaderFooterLayout which 
      specify the app laid out vertically with pixel values for 
      the height of the header and footer.  iOS retina displays
      will double these pixel values on screen
    -----------------------------------------------------------------
    */
    layoutOptions: {
      direction: Utility.Direction.Y,
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
      famousView: {
        rotationCoefficient: 0.003 
      },
      scrollDemo: {
        edgeGrip: 0.8,
        edgeDamp: 0.8,
        clipSize: 800,
        margin: 800
      },

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
    },
    
    /*
    -----------------------------------------------------------------
      The HeaderView contructor's options.
    -----------------------------------------------------------------
    */
    header: {
      background  : {
        classes : ['header-background']
      },
      layout         : {
        direction  : Utility.Direction.X,
        headerSize : 96,
        footerSize : 96
      },
      title       : {
        classes : ['header-title'],
        content : 'Header'
      },
      leftButton    : {
        classes   : ['header-left-button'],
        content   : '<i class="fa fa-angle-left header-left-button-icon"></i><p class="header-left-button-label">Back</p>',
        eventName : 'leftButtonClicked'
      },
      rightButton   : {
        classes   : ['header-right-button'],
        content   : '<i class="fa fa-angle-right header-right-button-icon"></i><p class="header-right-button-label">Forward</p>',
        eventName : 'rightButtonClicked',
      },
      leftButtonRenderOptions : {
        overlap             : false
      },
      rightButtonRenderOptions : {
        overlap              : false
      },
      leftButtonShown  : false,
      rightButtonShown : false
    }
  });

  var famousView = new FamousView();
  var scrollDemo = new ScrollDemo();
  var aboutPage  = new DetailView(aboutContent);

  var libraryView = new LibraryView('to-read');
  var shelvesView = new ShelfView();
  var friendsView = new FriendsView();
  var searchView = new SearchView();
  var logInView = new LogInView();

  // searchView.subscribe(shelvesView);
  // searchView.on('click', function() {
  //   console.log('shelf click');
  // });
  shelvesView.on('click', function() {
    console.log('shelf click');
  });


  app
  .addPage({
    title              : 'Library',
    renderable         : libraryView,
    footerIconName     : 'fa-book',
    footerIconPosition : 0
  }).addPage({
    title              : 'Shelves',
    renderable         : shelvesView,
    // renderable         : scrollDemo,
    footerIconPath     : 'resources/library.png',
    footerIconPosition : 1
  }).addPage({
    title              : 'Friends',
    renderable         : friendsView,
    footerIconName     : 'fa-group  ',
    footerIconPosition : 2
  }).addPage({
    title              : 'Search',
    renderable         : searchView,
    footerIconName     : 'fa-search',
    footerIconPosition : 3
  }).addPage({
    title              : 'Log In',
    renderable         : logInView,
    footerIconName     : 'fa-exchange',
    footerIconPosition : 4
  }).showPage('Library');

  document.addEventListener("deviceready", onDeviceReady, false);

  //http://plugins.cordova.io/#/package/org.apache.cordova.device
  function onDeviceReady() {
    // TO RUN ON DEVICE, INITIALIZE CONTEXT AND APP IN HERE
  }

  var mainContext = Engine.createContext();
  mainContext.add(app);
});

