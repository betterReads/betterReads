define(function(require, exports, module){
    'use strict';

    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var StateModifier = require('famous/modifiers/StateModifier');
    var ScrollView = require('famous/views/ScrollView');

    var reqwest      = require('../../../bower_components/reqwest/reqwest');

    function SearchView(){
        View.apply(this, arguments);

        _addSurface.call(this);
    }

    SearchView.prototype = Object.create(View.prototype);
    SearchView.prototype.constructor = SearchView;

    SearchView.DEFAULT_OPTIONS = {};

    function _addSurface(){
        var surface = new Surface({
            content: "Search View",
            size: [undefined, undefined],
            properties: {
                textAlign: 'center',
                backgroundColor: '#999'
            }
        });

        this.add(surface);
    }

    module.exports = SearchView;
});
