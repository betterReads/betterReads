define(function(require, exports, module) {

  /**
   *  ExtensionManager is used to take a class and give it methods to register addons to itself.
   *
   *  @class ExtensionManager
   *  @static
   */  
  var ExtensionManager =  {};

  /**
   *  Create a global registry of extensions attached to a parent constructor as static objects.
   *
   *  @method createRegistry
   *  @param parentClass {Function} class to attach static methods to.
   *  @param object {Object} Global object that items will be regsitered to.
   *  @param registrationName {String} Name of the registration method.
   *  @param deregistrationName {String} Name of the deregistration method.
   */
  ExtensionManager.createRegistry = function register(parentClass, object, registrationName, deregistrationName ) {
    if (!registrationName) registrationName = 'register';
    if (!deregistrationName) deregistrationName = 'deregister';

    parentClass[registrationName] = ExtensionManager.register.bind(parentClass, object);
    parentClass[deregistrationName]= ExtensionManager.deregister.bind(parentClass, object);
  }

  /**
   * Register a global class with an identifying key
   *
   * @method register
   *
   * @param Object {Object} an object of {key : class} fields
   */
  ExtensionManager.register = function register (object, extension) {
    for (var key in extension) {
      if (object[key]) {
        if (object[key] === extension[key]) return; // redundant registration
          else throw new Error('this key is registered to a different extension');
      }
      else {
        object[key] = extension[key];
      }
    }
  };

  /**
   * Deregister class with an identifying key
   *
   * @method deregister
   */
  ExtensionManager.deregister = function deregister (object, extensionName) {

    if (object[extensionName]) {
      delete object[extensionName];
    }
    else throw 'No registered item found as ' + extensionName;

  };

  module.exports = ExtensionManager;

});
