define(function(require, exports, module) {
  var Transform = require('famous/core/Transform');
  var Engine = require('famous/core/Engine');
  var SingularHelper = require('./SingularHelper');

  /**
   *  Layout items in a grid, as many as can fit, aligned top left. Allows for chained animations.
   *
   *  @param {Options} [options] An object of configurable options.
   *  @param {Array|Number} [options.padding=15,15] Additional padding in x and y dimensions of each element.
   *  @param {Array|Number} [options.gridSize] Number of items in the x and y dimensions. Passing in [4, 3] would 
   *    display a grid of four across and three tall. 
   *  @param {Number} [options.delay] Amount to delay each item as it's animating into the grid. 
   *  @param {Object} [options.curve] The main curve that is used for the intro animation on the grid.
   *  @param {Object} [options.layoutCurve] The curve that is used for the animation of the grid between individual pages.
   *
   *  @class Grid
   */
  module.exports = function Grid (options) {
    return {
      options: options,
      defaultOptions : {
        gridSize: [3, 3],
        padding: [15, 15],
        curve: { 
          curve: 'inOutQuad', 
          duration: 500
        },
        layoutCurve: { 
          curve: 'outExpo',
          duration: 800
        },
        delay: 100
      },
      renderLimit: function (options) {
        return [0, this.nodes.length];
      },
      activate: function (options) {
        SingularHelper.uncenter.call(this, {
          curve: 'outExpo',
          duration: options.curve.duration * 0.25
        });
        this._eventOutput.emit('paginationChange', options.gridSize[0] * options.gridSize[1]);
        
        var itemCount = options.gridSize[0] * options.gridSize[1]
        var totalPages = Math.ceil(this.nodes.length / itemCount);
        var currentPage = Math.floor( this.index / itemCount );

        //Calculate indicies of items to display
        var startIndex = currentPage * itemCount;

        //Check for less items on last page.
        var endIndex = (currentPage === totalPages - 1) ? 
          startIndex + (this.nodes.length - currentPage * itemCount) - 1: 
          startIndex + itemCount - 1;

        //Add delay to stagger animations of items on current page.
        var forward = this.index;
        var back = (this.index - 1) < startIndex ? undefined : this.index - 1;
        var delayCount = 0;
        var delayTime;
        var trans;
        
        //Helper function
        var delayFunc = function(index) {
          trans = this.data.childTransforms[index];
          var currentPos = trans.translate.get()
          //trans.translate.set([currentPos[0], currentPos[1], -(delayCount+1) * 10]);
          trans.translate.delay(delayTime * 0.5);
          trans.rotate.delay(delayTime);
          trans.scale.delay(delayTime * 0.5);
          this.data.childOpacities[index].delay(delayTime);
        }

        //Loop in both directions to set delays.
        var itemsToDelay = endIndex - startIndex + 1;
        while (delayCount < itemsToDelay) {
          delayTime = delayCount * options.delay;

          //Set delays
          if (forward !== undefined) {
            delayFunc.call(this, forward);
            forward = (forward + 1) > endIndex ? undefined : forward + 1;
            delayCount++;
          }

          if (back !== undefined) {
            delayFunc.call(this, back);
            back = (back - 1) < startIndex ? undefined : back - 1;
            delayCount++;
          }
        }

        function onCurrentPage (index) {
          return index >= startIndex && index <= endIndex;
        }

        //Animate items
        var transforms = getTransforms.call(this, options);
        for(var i = 0; i < this.nodes.length; i++) {
          // Reset parentTransforms (modified in 3D Singular transitions)
          this.data.parentTransforms[i].set(Transform.identity);
          if (onCurrentPage( i )) { 
            this.data.childTransforms[i].set(
               transforms[i].transform,
              options.curve);
          }
          else { 
            this.data.childTransforms[i].set(
               transforms[i].transform);
          }

          this.data.childOpacities[i].set(1, options.curve);
        }
      },

      layout: function (options) { 
        var transforms = getTransforms.call(this, options);
        var trans;
        for(var i = 0; i < this.nodes.length; i++) {
          trans = this.data.childTransforms[i];
          trans.set(transforms[i].transform, options.layoutCurve);
        }
      },
      deactivate: function () {
        this._eventOutput.emit('paginationChange', this.itemsPerPage);
      }
    }
  }

  function getTransforms (options) {
    var getGrid = getGridPositions(this.getSize().slice(0), options.padding, options.gridSize);
    var cellSize = getGrid.cellSize;
    var containerSize = this.getSize().slice(0); 

    var pageLength = options.gridSize[0] * options.gridSize[1]
    var currentPage = Math.floor( this.index / pageLength );

    var transforms = [];
    for (var i = 0; i < this.nodes.length; i++) {
      var gridPos = getGrid.at(i);
      gridPos[0] -= (currentPage * containerSize[0] + currentPage * options.padding[0]);
      gridPos[2] = 1; //Reset zIndex

      var size = this.data.sizeCache[i] || this.data.sizeCache[0];
      var maxScale = Math.min(cellSize[0] / size[0], cellSize[1] / size[1]);

      transforms.push({
        transform: Transform.thenMove(Transform.scale(maxScale, maxScale), gridPos), 
        gridPos: gridPos,
        maxScale: maxScale
      });
    }
    return transforms;
  }

  function getGridPositions (containerSize, padding, gridSize) {
    var cellSize = [
      (containerSize[0] - padding[0] * Math.max(gridSize[0] - 1, 0)) / gridSize[0],
      (containerSize[1] - padding[1] * Math.max(gridSize[1] - 1, 0)) / gridSize[1]
    ];
    var totalSize = gridSize[0] * gridSize[1];
    return {
      at: function (i) {
        var page = Math.floor(i / totalSize);
        var column = i % gridSize[0];
        var row = Math.floor( (i - page * totalSize) / gridSize[0] );
        return [
          column * cellSize[0] + column * padding[0] + page * containerSize[0] + page * padding[0],
          row * cellSize[1] + row * padding[1]
        ];
      },
      cellSize: cellSize
    };
  }

});
