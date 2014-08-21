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
  var ScrollView   = require('famous/views/Scrollview');
  var Surface      = require('famous/core/Surface');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ScrollItem   = require('components/ScrollListItem');
  var Transform = require('famous/core/Transform');
  var Easing = require('famous/transitions/Easing');

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
  var ShelfTransitionView = require('views/ShelfTransitionView');

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
      headerSize: 70,
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
        headerSize: 70,
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

    // shelfTransitionView = new ShelfTransitionView();

    searchView.pipe(app.content);
    searchView.pipe(bookView);
    libraryView.pipe(app.content);
    libraryView.pipe(bookView);

    //set up best seller view rendering
    var selectedBook;
    bestSellerView.on('bestSellerClick', function(book) {
      selectedBook = book;
      data = book.content;
      console.log('heard best seller click');
      // console.log(data);
      var loaded = false;
      var bsBookView = new BSBookView(data, true);
      app.addPage({
        title: 'Best Seller',
        renderable: bsBookView
      });
      //wait until page is loaded and time has passed
      var loadIfReady = function() {
        if (loaded) {
          // app.content.content.outOpacityFrom(function () { return 0; });
          app.showPage('Best Seller');
          // app.content.content.outOpacityFrom(function () { return 1; });
        } else {
          loaded = true;
        }
      };

      setTimeout(function() {
        loadIfReady();
      }, 1500);
      bsBookView.on('bookLoaded', function(id) {
        loadIfReady();
      });
      bsBookView.on('loadBestSellers', function() {
        app.showPage('Explore');
        setTimeout(function() {
          selectedBook.clicked = false;
        }, 500);

        selectedBook.imageMod.setTransform(Transform.translate(0, 0, 1), {duration: 1500, curve: Easing.inOutCubic});
        selectedBook.imageMod.setSize([100, 150], {duration: 1500, curve: Easing.inOutCubic})

        var that = selectedBook;
        setTimeout(function() {
          that.imageMod.transformFrom(Transform.translate(0, 0, 0));
        }, 1500);
      });
    });

    //set up shelf view rendering
    shelvesView.on('shelfClick', function(shelf) {
      // var waitingView = new WaitingView();
      var loaded = false;
      var waitingView = new ShelfTransitionView(shelf);

      var currShelf = new LibraryView(shelf.cell.data, true);
      app.addPage({
        title: 'Shelf',
        renderable: currShelf
      }).addPage({
        title: 'Loading',
        renderable: waitingView
      }).showPage('Loading');

      //wait to load shelf until after page has loaded and animation has completed
      setTimeout(function(){
        if (loaded) {
          app.showPage('Shelf');
        } else {
          loaded = true;
        }
      }, 1500);
      currShelf.on('shelfLoaded', function() {
        if (loaded) {
          app.showPage('Shelf');
        } else {
          loaded = true;
        }
      });
      currShelf.pipe(app.content);
      currShelf.pipe(bookView);
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
      renderable         : bestSellerView,
      footerIconName     : 'fa-globe',
      footerIconPosition : 4
    }).addPage({
      title              : 'Book',
      renderable         : bookView
    }).showPage('Library');

    //remove old context
    document.getElementsByTagName('div')[0].remove()

    //add new context
    var mainContext = Engine.createContext();
    mainContext.add(app);

    document.addEventListener("deviceready", onDeviceReady, false);

    //http://plugins.cordova.io/#/package/org.apache.cordova.device
    function onDeviceReady() {
      // TO RUN ON DEVICE, INITIALIZE CONTEXT AND APP IN HERE
    }

    // turn these on to adjust opacity transitions
    // app.content.content.inOpacityFrom(function () { return 1; });
    // app.content.content.outOpacityFrom(function () { return 0; });

    //remove login elements
    // var oldElements = document.getElementsByClassName('preLoad');
    // while (oldElements.length) {
    //   oldElements[0].remove();
    // }
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

