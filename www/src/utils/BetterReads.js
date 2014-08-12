define(function(require, exports, module){
  'use strict';

  var reqwest = require('../bower_components/reqwest/reqwest');
  var credentials = require('../credentials.js');
  var auth;
  var BetterReads = {};

  BetterReads.getBooks = function(params){
    return reqwest({
      url: 'https://betterreadsapi.azurewebsites.net/booksOnShelf',
      method: 'get',
      data: params
    });
  };

  BetterReads.getShelves = function(params, callback) {
    return reqwest({
      url: 'https://betterreadsapi.azurewebsites.net/userShelves',
      method: 'get',
      data: params
    });
  };

  BetterReads.searchBooks = function(params){
    params.query = encodeURI(params.query);
    return reqwest({
      url: 'https://betterreadsapi.azurewebsites.net/searchBooks',
      method: 'get',
      data: params
    });
  };

  BetterReads.getBookDetail = function(params){
    return reqwest({
      url: 'https://betterreadsapi.azurewebsites.net/bookDetail',
      method: 'get',
      data: params
    });
  }

  BetterReads.authenticate = function(callback) {
    return reqwest({
      url: 'https://betterreadsapi.azurewebsites.net/preAuthenticate',
      method: 'get'
    }).then(function(results) {
      console.log(results);
      //open window to authenticate
      window.open(results.url, '_system');
      //request oauth access tokens
      setTimeout(function(){
        reqwest({
          url: 'https://betterreadsapi.azurewebsites.net/authenticate',
          method: 'get',
          data: {requestToken: results.requestToken, requestSecret: results.requestSecret}
        }).then(function(results) {
          console.log(results);
          if (results.statusCode) {
            alert('Error logging in');
          } else {
            // window.auth = results;
            // localStorage.brAuth = results;
            // window.localStorage.setItem( 'brAuth', JSON.stringify(results));
            console.log('results:', results);
            auth = results;
            //load content and switch views
            console.log('Logged in');
            callback();
          }
        });
      }, 2000);
    });
  };

  BetterReads.getUpdates = function() {
    console.log('auth:', auth);
    return reqwest({
      url: 'https://betterreadsapi.azurewebsites.net/friendUpdates',
      method: 'get',
      data: {accessToken: auth.accessToken, accessSecret: auth.accessSecret}
    });
  };

  BetterReads.getTopUT = function() {
    return reqwest({
      url: 'https://betterreadsapi.azurewebsites.net/weeklyBestSellers',
      method: 'get',
      data: {images: true,
        awsId: credentials.awsId,
        awsSecret: credentials.awsSecret,
        assocId: credentials.assocId,
        USATodayKey: credentials.USATodayKey}
    });
  }

  module.exports = BetterReads;
});
