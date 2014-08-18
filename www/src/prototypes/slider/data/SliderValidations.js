define(function(require, exports, module) {

  // can't access Generic Sync's acutal registry due to privately scoped variable.
  var validSyncs = ['touch', 'mouse', 'scroll'];

  module.exports = function (opts) {

    if (opts['inputs']) validateInputs();

    function validateInputs () {
      for (var i = 0; i < opts['inputs'].length; i++) {
        var input = opts['inputs'][i];
        if (validSyncs.indexOf(input) < 0) {
          throw 'The key ' + opts['inputs'][i] + ' not a valid Sync object! Only "mouse", "touch" or "scroll allowed.';
        }
      };
    }
  }
});
