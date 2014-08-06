define(function(require, exports, module){
  'use strict';

  var reqwest = require('../../../bower_components/reqwest/reqwest');

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
    return reqwest({
      url: 'https://betterreadsapi.azurewebsites.net/searchBooks',
      method: 'get',
      data: params
    });
  };

  module.exports = BetterReads;
});
