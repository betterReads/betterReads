define(function(require, exports, module) {

  /*
   *  Two dimensional array helper functions
   */
  module.exports = {
    /*
     * Subtract arrayTwo from arrayOne, mutating arrayOne.
     * @method sub
     * @param arrayOne {Array|2D}
     * @param arraytwo {Array|2D}
     */
    sub: function sub (arrayOne, arrayTwo) {
      arrayOne[0] -= arrayTwo[0];
      arrayOne[1] -= arrayTwo[1];
    },

    /*
     * Subtract arrayTwo from array One, returning new array.
     * @method subClone
     * @param arrayOne {Array|2D}
     * @param arraytwo {Array|2D}
     */
    subClone: function subClone (arrayOne, arrayTwo) {
      return [
        arrayOne[0] - arrayTwo[0],
        arrayOne[1] - arrayTwo[1]
      ];
    },

    /*
     * Add arrayTwo to arrayOne, mutating arrayOne.
     * @method add
     * @param arrayOne {Array|2D}
     * @param arraytwo {Array|2D}
     */
    add: function add (arrayOne, arrayTwo) {
      arrayOne[0] += arrayTwo[0];
      arrayOne[1] += arrayTwo[1];
    },

    /*
     * Add arrayOne to arrayTwo, returning new array.
     * @method addClone
     * @param arrayOne {Array|2D}
     * @param arraytwo {Array|2D}
     * @returns {Array} new array.
     */
    addClone: function addClone (arrayOne, arrayTwo) {
      return [
        arrayOne[0] + arrayTwo[0],
        arrayOne[1] + arrayTwo[1]
      ];
    },

    /*
     * Multiply arrayTwo by arrayOne, mutating arrayOne.
     * @method mult
     * @param arrayOne {Array|2D}
     * @param arraytwo {Array|2D}
     */
    mult: function mult (arrayOne, arrayTwo) {
      arrayOne[0] *= arrayTwo[0];
      arrayOne[1] *= arrayTwo[1];
    },
    /*
     * Add arrayOne to arrayTwo, returning new array.
     * @method multClone
     * @param arrayOne {Array|2D}
     * @param arraytwo {Array|2D}
     * @returns {Array} new array.
     */
    multClone: function multClone (arrayOne, arrayTwo) {
      return [
        arrayOne[0] * arrayTwo[0],
        arrayOne[1] * arrayTwo[1]
      ]
    },

    /*
     * Multiply arrayOne by scalar
     * @method multScalar
     * @param arrayOne {Array|2D}
     * @param scalar {scalar}
     */
    multScalar: function multScalar (arrayOne, scalar) {
      arrayOne[0] *= scalar;
      arrayOne[1] *= scalar;
    },

    /*
     * Multiply arrayOne by scalar, returning new array.
     * @method addClone
     * @param arrayOne {Array|2D}
     * @param scalar {Number}
     * @returns {Array} new array.
     */
    multScalarClone : function multScalarClone (arrayOne, scalar) {
      return [
        arrayOne[0] * scalar,
        arrayOne[1] * scalar
      ];
    },

    /*
     *  Round the array to nearest values.
     *  @method round
     *  @param arrayOne {Array|2D}
     */
    round: function round (arrayOne) {
      arrayOne[0] = Math.round(arrayOne[0]);
      arrayOne[1] = Math.round(arrayOne[1]);
    }

  };
});
