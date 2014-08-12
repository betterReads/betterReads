define(function(require, exports, module) {

  /**
   *  Helper Global Object which exposes an API to create css classes
   *  dynamically with javascript.
   *
   *  @static
   *  @protected
   *  @class JSCSS
   */
  var JSCSS = {};
  var stylesheet = document.createElement('style');
  stylesheet.appendChild(document.createTextNode('')); // iOS Safari compatability
  document.head.appendChild(stylesheet);

  // IE < 9 is styleSheet
  var sheet = stylesheet.sheet || stylesheet.styleSheet;

  // IE < 9 is rules.
  var rulesProps = rulesProperty = sheet.cssRules ? "cssRules" : "rules";

  // global array of objects containing absoluteIndex/ruleIndex store.
  var ruleIndices = [];

  // CSS_ID index.
  // @static
  var CSS_ID = 0;

  /**
   *  Add a rule to the added stylesheet.
   *
   *  @method addRule
   *  @param selector {String} DOM Selector to target.
   *  @param rules {Object} key: values of cssStyles : 'properties'
   *  @returns {object}
   *    object.index: global rule index of the added rule
   *    object.destroy: remove entire rule set
   *    object.remove: remove a specific css property to the selector
   *    object.add: add a specific css property to the selector
   */
  function addRule (selector, rules) {
    var css = buildRule(rules);
    var sheetIndex = sheet.cssRules.length;
    var ruleIndex = CSS_ID++;

    var obj = { 
      index: ruleIndex,
      sheetIndex: sheetIndex
    };
    ruleIndices.push(obj);

    sheet.addRule ?
      sheet.addRule(selector, css) :
      sheet.insertRule(selector + '{' + css + '}', sheetIndex);

    return {
      index: ruleIndex,

      destroy: function (ruleIndex) {
        return removeRule(ruleIndex);
      }.bind(null, ruleIndex),

      remove: function (ruleIndex, prop) {
        var cssRule = getRule(ruleIndex);
        return cssRule.style[prop] = "";
      }.bind(null, ruleIndex),

      add: function (ruleIndex, prop, value) {
        var cssRule = getRule(ruleIndex);
        return cssRule.style[prop] = value;
      }.bind(null, ruleIndex)

    }
  }

  /**
   *  Given an object css Rules, build rules.
   *  ex:
   *    {'position' : 'absolute'} -> 'position: absolute'
   *
   *  @method buildRule
   *  @param rules {Object} rules in property: value format.
   *  @returns {string} stringified rules.
   */
  function buildRule ( rules ) {
    var css = '';
    for (var key in rules) {
      var value = rules[key];
      css += key + ':' + value + ';\n';
    };
    return css;
  }

  /**
   *  Find the object that matches the real index.
   *  @param realIndex {Number}
   *  @returns {Error | Object} Data or thrown error.
   *  @method findIndex
   */
  function findIndex (realIndex) {
    for (var i = 0; i < ruleIndices.length; i++) {
      if (ruleIndices[i].index == realIndex) return ruleIndices[i];
    };
    throw 'no rule found with that index';
  }

  /**
   *  Get specific rule by given index.
   *  @param index {Number} index (not sheetIndex) of rule to find.
   *  @method getRule
   */
  function getRule (index) {
    var indexObj = findIndex(index);
    return sheet[rulesProps][indexObj.sheetIndex];
  }

  /**
   *  Helper function, get all rules attached to this sheet
   *  @method getRules
   */
  function getRules () {
    return sheet[rulesProps];
  }

  /**
   *  For each item after the absolute index, decrement the absolute counter.
   *  @param fromIndex {Number} index to start at
   *  @method updateRemainingObjects
   */
  function updateRemainingObjects (fromIndex) {
    for (var i = fromIndex + 1; i < ruleIndices.length; i++) {
      ruleIndices[i].sheetIndex--;
    };
  }

  /**
   *  Remove a rule from the stylesheet. Splice out the absoluteIndex/ruleIndex store.
   *  @param absouteIndex {number} returned absolute index of the added rule.
   *  @method removeRule
   */
  function removeRule ( absoluteIndex ) {
    var indexObj = findIndex(absoluteIndex);
    updateRemainingObjects(indexObj.index);

    // IE < 9 is remove Rule
    var removeMethod = sheet.deleteRule ? "deleteRule" : "removeRule";
    sheet[removeMethod](indexObj.sheetIndex);

    ruleIndices.splice(ruleIndices.indexOf(indexObj), 1);
  }

  module.exports = { 
    sheet: sheet,
    add: addRule,
    remove: removeRule,
    getRules: getRules
  }
});
