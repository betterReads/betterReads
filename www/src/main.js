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
    var reqwest      = require('../../bower_components/reqwest/reqwest');
    var ScrollView   = require('famous/views/ScrollView');
    var Surface      = require('famous/core/Surface');
    var StateModifier = require('famous/modifiers/StateModifier');

    var ScrollItem   = require('components/ScrollListItem');


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

    var getBooks = function(params, callback) {
        reqwest({
            url: 'https://betterreadsapi.azurewebsites.net/booksOnShelf',
            method: 'get',
            data: params,
            success: callback
        });
    };


    //custom view
    var libraryView = new View();
    getBooks({id: '4067289', shelf: 'to-read', page: 1, per_page: 50}, function(data) {
        // var book = JSON.parse(data)[18];
        var books = JSON.parse(data);
        console.log(books);
        //need to change image size so it is whatever aspect ratio of book is; there is slight variance around 100:150
        // var image = new ImageSurface({
        //     size: [100, 150]
        // });
        // image.setContent(book.image_url[0]);
        // var imageModifier = new Modifier({
        //     origin: [0.5, 0.5]
        // });
        // libraryView.add(imageModifier).add(image);
        var scrollView = new ScrollView(this.options);
        var listOfItems = [];

        for (var i = 0; i < books.length; i++) {
            // var listItem = new ScrollItem(i);

            var bookView = new View();
            var bookMod = new StateModifier({
                size: [undefined, 150]
            });

            var tab = new Surface({
              content: books[i].title[0] + '<br>' + books[i].authors[0].author[0].name[0] + '<br>Rating: ' + books[i].average_rating + '/5',
              size: [undefined, undefined],
              properties: {
                textAlign: 'right',
                backgroundColor: 'white'
              }
            });

            var image = new ImageSurface({
                size: [100, 150]
            });
            image.setContent(books[i].image_url[0]);

            var bookWrapper = bookView.add(bookMod);
            bookWrapper.add(image);
            bookWrapper.add(tab);

            listOfItems.push(bookView);
            image.pipe(scrollView);
            image.pipe(libraryView);
        }

        scrollView.sequenceFrom(listOfItems);
        libraryView.add(scrollView);

        libraryView._eventInput.on('scrollListItemClicked', function(eventPayload) {
            this._eventOutput.emit('navigate:modal', eventPayload);
        }.bind(libraryView));
    });


    app
    .addPage({
        title              : 'Search',
        renderable         : scrollDemo,
        footerIconName     : 'fa-search',
        footerIconPosition : 0
    }).addPage({

        title              : 'Library',
        renderable         : libraryView,
        footerIconPath     : 'resources/library.png',
        footerIconPosition : 1

    }).addPage({

        title              : 'Explore',
        renderable         : aboutPage,
        footerIconName     : 'fa-globe',
        footerIconPosition : 2

    }).showPage('Library');

    document.addEventListener("deviceready", onDeviceReady, false);

    //http://plugins.cordova.io/#/package/org.apache.cordova.device
    function onDeviceReady() {
        // TO RUN ON DEVICE, INITIALIZE CONTEXT AND APP IN HERE
    }

    var mainContext = Engine.createContext();
    mainContext.add(app);
});

