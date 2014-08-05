define(function(require, exports, module){
    'use strict';

    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var StateModifier = require('famous/modifiers/StateModifier');
    var ScrollView = require('famous/views/ScrollView');

    var reqwest      = require('../../../bower_components/reqwest/reqwest');

    function ShelfView(){
        View.apply(this, arguments);
    }

    ShelfView.prototype = Object.create(View.prototype);
    ShelfView.prototype.constructor = ShelfView;

    ShelfView.DEFAULT_OPTIONS = {};

    module.exports = ShelfView;
})