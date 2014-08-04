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
    getBooks({id: '4067289', shelf: 'to-read', page: 2, per_page: 30, sort: 'bossy'}, function(data) {
        var book = JSON.parse(data)[18];
        console.log(JSON.parse(data));
        //need to change image size so it is whatever aspect ratio of book is; there is slight variance around 100:150
        var image = new ImageSurface({
            size: [100, 150]
        });
        image.setContent(book.image_url[0]);
        var imageModifier = new Modifier({
            origin: [0.5, 0.5]
        });
        libraryView.add(imageModifier).add(image);
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

