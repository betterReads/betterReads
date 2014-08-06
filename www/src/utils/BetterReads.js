define(function(require, exports, module){
  'use strict';

  var reqwest = require('../../../bower_components/reqwest/reqwest');

  var BetterReads = {};

  BetterReads.getBooks = function(params, callback) {
    reqwest({
      url: 'https://betterreadsapi.azurewebsites.net/booksOnShelf',
      method: 'get',
      data: params,
      success: callback
    });
  };

  module.exports = BetterReads;
});
