define(function(require, exports, module){
  'use strict'
  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var ImageSurface = require('famous/surfaces/ImageSurface');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ScrollView = require('famous/views/ScrollView');

  var reqwest = require('../../../bower_components/reqwest/reqwest');

  function LogInView(){
    View.apply(this, arguments);

    _addSurface.call(this);
    _addButton.call(this);
  }

  LogInView.prototype = Object.create(View.prototype);
  LogInView.prototype.constructor = LogInView;

  LogInView.DEFAULT_OPTIONS = {};

  function _addSurface(){
    var surface = new Surface({
      content: "Log In With Goodreads",
      size: [undefined, undefined],
      properties: {
        textAlign: 'center',
        lineHeight: '200px',
        backgroundColor: '#bbb'
      }
    });

    this.add(surface);
  }
  function _addButton(){
    var button = new ImageSurface({
      size: [100, 100]
    });
    button.setContent('./resources/goodreads-icon.png');

    var modifier = new StateModifier({
      align: [0.5, 0.5],
      origin: [0.5, 0.5]
    });

    button.on('click', function() {
      console.log('clicked');
      //request oauth request token
      reqwest({
        url: 'http:localhost:8045/preAuthenticate',
        method: 'get'
      }).then(function(results) {
        console.log(results);
        //open window to authenticate
        window.open(results.url);
        //request oauth access tokens
        reqwest({
          url: 'http:localhost:8045/authenticate',
          method: 'get',
          data: {requestToken: results.requestToken, requestSecret: results.requestSecret}
        }).then(function(results) {
          console.log(results);
          //load content and switch views
        });
      });
    });

    this.add(modifier).add(button);
  }

  module.exports = LogInView;
});
