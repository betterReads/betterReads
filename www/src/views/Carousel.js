define(function(require, exports, module) {
    var EventHandler = require('famous/core/EventHandler');
    var Engine = require('famous/core/Engine');
    var Entity = require('famous/core/Entity');
    var Transform = require('famous/core/Transform');
    var Utility = require('famous/utilities/Utility');
    var OptionsManager = require('famous/core/OptionsManager');
    var Scrollview = require('famous/views/Scrollview');
    var GenericSync = require('famous/inputs/GenericSync');
    var ScrollContainer = require('famous/views/ScrollContainer');
    var Easing = require('famous/transitions/Easing');
    var Transitionable = require('famous/transitions/Transitionable');

    function Carousel(options) {
        this.options = Object.create(Carousel.DEFAULT_OPTIONS);
        this.optionsManager = new OptionsManager(this.options);
        if (options) this.setOptions(options);

        this.id = Entity.register(this);

        this.scrollview = new Scrollview({
            margin: this.options.margin,
            direction: this.options.direction
        });

        this.items = this.options.items;
        this.itemRotations = [];
        this.itemStates = [];
        this.itemMasses = [];

        this.options.spinFade = 1;
        this.options.rotateWeight = 1;
        this.options.zDepth = 0.1;
        this.options.itemWeightVar = 300;
        this.scrollview.sequenceFrom(this.items);

        EventHandler.setInputHandler(this, this.scrollview);
        EventHandler.setOutputHandler(this, this.scrollview);
    }

    Carousel.DIRECTION_X = 0;
    Carousel.DIRECTION_Y = 1;

    Carousel.DEFAULT_OPTIONS = {
        direction: Carousel.DIRECTION_X,
        items: []
    };

    function _toRadians(degrees) {
      return degrees * Math.PI / 180;
    };

    Carousel.prototype.setOptions = function setOptions(options) {
        return this.optionsManager.setOptions(options);
    };

    Carousel.prototype.sequenceFrom = function sequenceFrom() {
        return this.scrollview.sequenceFrom.apply(this.scrollview, arguments);
    };

    var previuosPosition = 0;
    Carousel.prototype.render = function render() {
     
        var result = new Array(this.items.length);
        var velocity = this.scrollview.getVelocity();
        var blur = this.options.motionBlur * velocity;
        var scrollerWidth = this.scrollview.getSize(true)[0];

        if (!scrollerWidth){
            return this.scrollview.render.apply(this.scrollview, [true]);
        }

        var halfScrollerWidth =scrollerWidth /2;

        var itemWidth = this.scrollview._scroller._node.getSize()[0];
        var nodeIndex = this.scrollview._scroller._node.index;
        var position = this.scrollview._displacement;
        previuosPosition = position;

        var maxItemsInScreen = Math.ceil(scrollerWidth/itemWidth) + 10;

        var from = Math.max(nodeIndex - 50, 0);
        var to = Math.min(nodeIndex + maxItemsInScreen + 50, this.items.length );

        var offset = this.scrollview._displacement;- (itemWidth * nodeIndex);
        offset = offset + halfScrollerWidth - (itemWidth /2);
        var absOffset = Math.abs(offset);

        var max = 0;
        for(var i = 0; i <  this.items.length; i++) {
            var absOffset = Math.abs(offset);
            var percentage = Math.min(absOffset / (halfScrollerWidth + itemWidth), 1.0);
            var easingPercentage = this.options.easing(percentage);
            var easingPercentage2 = easingPercentage;
            if (offset < 0)
                easingPercentage2 *= -1;

            // Initial transform
            var transform = Transform.identity;

            // Translate
            transform = Transform.multiply(transform, 
                Transform.translate(
                this.options.translateX*easingPercentage2,
                this.options.translateY*easingPercentage, 
                this.options.translateZ*easingPercentage
            ));

            // Rotation
            transform = Transform.multiply(transform, 
                Transform.rotate(
                _toRadians(this.options.rotateX*easingPercentage),
                _toRadians(this.options.rotateY*easingPercentage2), 
                _toRadians(this.options.rotateZ*easingPercentage2)
            ));

            // Scaling
            transform = Transform.multiply(transform, 
                Transform.scale(1-(easingPercentage*this.options.scale), 1-(easingPercentage*this.options.scale)  ));

            // Opacity
            this.items[i]._child._child._object.setOpacity(1- (this.options.fade* easingPercentage));

            // Motion Blur
            // this.items[i]._child._child._child._object._currTarget.style.webkitFilter = "blur(" + blur + "px)";
            
            // Set transform
            this.items[i]._child._child._object.setTransform(transform);
            
            offset -= itemWidth;
        }

        return this.scrollview.render();
        
        
    };  

    module.exports = Carousel;
});
