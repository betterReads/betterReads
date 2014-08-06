define(function(require, exports, module){
    'use strict';

    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var StateModifier = require('famous/modifiers/StateModifier');
    var ScrollView = require('famous/views/ScrollView');

    var reqwest      = require('../../../bower_components/reqwest/reqwest');

    function FriendsView(){
        View.apply(this, arguments);

        _addSurface.call(this);
    }

    FriendsView.prototype = Object.create(View.prototype);
    FriendsView.prototype.constructor = FriendsView;

    FriendsView.DEFAULT_OPTIONS = {};

    function _addSurface(){
        var surface = new Surface({
            content: "Friends View",
            size: [undefined, undefined],
            properties: {
                textAlign: 'center',
                backgroundColor: '#bbb'
            }
        });

        this.add(surface);
    }

    module.exports = FriendsView;
});
