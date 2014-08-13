// require.config({paths: {'vis': 'http://adnanwahab.com/Render-Tree-Visualization/vis'}});

/* globals define */
define(function(require, exports, module) {
  // 'use strict';
  
  var Engine       = require('famous/core/Engine');
  var Utility      = require('famous/utilities/Utility');
  var TabTemplate  = require('views/TabTemplate');

  var ImageSurface = require('famous/surfaces/ImageSurface');
  var Modifier     = require('famous/core/Modifier');
  var View         = require('famous/core/View');
  var ScrollView   = require('famous/views/ScrollView');
  var Surface      = require('famous/core/Surface');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ScrollItem   = require('components/ScrollListItem');
  var Transform = require('famous/core/Transform');


  var ShelfView = require('views/ShelfView');
  var LibraryView = require('views/LibraryView');
  var CollectionsView = require('views/CollectionsView');
  var FriendsView = require('views/FriendsView');
  var SearchView = require('views/SearchView');
  var LogInView = require('views/LogInView');
  var BookView = require('views/BookView');
  var WaitingView = require('views/WaitingView');
  var BestSellerView = require('views/BestSellerView');
  var BSBookView = require('views/BSBookView');

  var betterReads = require('./utils/BetterReads');

  require('famous/inputs/FastClick');

  var app, libraryView, shelvesView, friendsView, searchView, bookView, bestSellerView, bsBookView;

  var loadApp = new TabTemplate({
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

  var initializeApp = function() {
    app = new TabTemplate({
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

    libraryView = new LibraryView();
    shelvesView = new ShelfView();
    friendsView = new FriendsView();
    searchView = new SearchView();
    bookView = new BookView();
    bestSellerView = new BestSellerView();

    searchView.pipe(app.content);
    searchView.pipe(bookView);

    //set up best seller view rendering
    var selectedBook;
    bestSellerView.on('bestSellerClick', function(book) {
      selectedBook = book;
      data = book.content;
      console.log('heard best seller click');
      console.log(data);
      var loaded = false;
      var bsBookView = new BSBookView(data, true);
      app.addPage({
        title: 'Best Seller',
        renderable: bsBookView
      });
      //wait until page is loaded and time has passed
      setTimeout(function() {
        if (loaded) {
          app.showPage('Best Seller');
        } else {
          loaded = true;
        }
      }, 1500);
      bsBookView.on('bookLoaded', function() {
        if (loaded) {
          app.showPage('Best Seller');
        } else {
          loaded = true;
        }
      });
      bsBookView.on('loadBestSellers', function() {
        console.log('load best sellers');
        app.showPage('Explore');
        // selectedBook._eventOutput.emit('resize');
        selectedBook.clicked = false;
        selectedBook.imageMod.setSize([100, 150], {duration: 1500})

        var that = selectedBook;
        setTimeout(function() {
          that.imageMod.transformFrom(Transform.translate(0, 0, 0));
        }, 1500);
      });
    });

    //set up shelf view rendering
    shelvesView.on('shelfClick', function(shelf) {
      var waitingView = new WaitingView();
      var currShelf = new LibraryView(shelf, true);
      app.addPage({
        title: 'Shelf',
        renderable: currShelf
      }).addPage({
        title: 'Loading',
        renderable: waitingView
      }).showPage('Loading');
      currShelf.on('shelfLoaded', function(shelf) {
        app.showPage('Shelf');
      });
    });
  };
  var startApp = function() {
    app
    .addPage({
      title              : 'Library',
      renderable         : libraryView,
      footerIconName     : 'fa-book',
      footerIconPosition : 0
    }).addPage({
      title              : 'Shelves',
      renderable         : shelvesView,
      footerIconName     : 'fa-align-justify',
      // footerIconPath     : 'resources/library.png',
      footerIconPosition : 1
    }).addPage({
      title              : 'Friends',
      renderable         : friendsView,
      footerIconName     : 'fa-group',
      footerIconPosition : 2
    }).addPage({
      title              : 'Search',
      renderable         : searchView,
      footerIconName     : 'fa-search',
      footerIconPosition : 3
    }).addPage({
      title              : 'Explore',
      // renderable         : bsBookView,
      renderable         : bestSellerView,
      footerIconName     : 'fa-globe',
      footerIconPosition : 4
    }).addPage({
      title              : 'Book',
      renderable         : bookView
    }).showPage('Library');

    var mainContext = Engine.createContext();
    mainContext.add(app);

    document.addEventListener("deviceready", onDeviceReady, false);

    //http://plugins.cordova.io/#/package/org.apache.cordova.device
    function onDeviceReady() {
      // TO RUN ON DEVICE, INITIALIZE CONTEXT AND APP IN HERE
    }

    //remove login elements
    var oldElements = document.getElementsByClassName('preLoad');
    while (oldElements.length) {
      oldElements[0].remove();
    }
  };


  var logInView = new LogInView();
  logInView.on('loggedIn', function() {
    console.log('heard log in');
    //set up other views, etc
    logInView.transformBR();
    initializeApp();
    setTimeout(function() {
      startApp();
    }, 4000);
  });

  loadApp.addPage({
    title: 'Log In',
    renderable: logInView,
  }).showPage('Log In');

  document.addEventListener("deviceready", onDeviceReady, false);

  //http://plugins.cordova.io/#/package/org.apache.cordova.device
  function onDeviceReady() {
    // TO RUN ON DEVICE, INITIALIZE CONTEXT AND APP IN HERE
  }

  var loadContext = Engine.createContext();
  loadContext.add(loadApp);

  // UNCOMMENT THESE AND THE REQUIRE.CONFIG AT THE TOP OF THIS DOCUMENT TO SHOW RENDER TREE VISUALIZER
  // var vis = require('vis');
  // vis(mainContext);
});

