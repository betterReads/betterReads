define(function(require, exports, module){
    'use strict';

    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var StateModifier = require('famous/modifiers/StateModifier');
    var ScrollView = require('famous/views/ScrollView');

    var reqwest      = require('../../../bower_components/reqwest/reqwest');

    function FriendsView(){
        View.apply(this, arguments);
    }

    FriendsView.prototype = Object.create(View.prototype);
    FriendsView.prototype.constructor = FriendsView;

    FriendsView.DEFAULT_OPTIONS = {};

    module.exports = FriendsView;
})