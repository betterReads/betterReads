define(function(require, exports, module) {

  /**
   *  Children nodeList to actual array.
   *  @method nodeChildrenToArray
   */
  function nodeChildrenToArray( node ) {
    if (node.children) {
      return Array.prototype.slice.call( node.children );
    } else {
      return Array.prototype.slice.call( node.childNodes );
    }
  }

  /**
   *  From a parent element, create a document fragment filled with the
   *  children elements of the parent.
   *  *WARNING* Removes items from the DOM.
   *  *WARNING* Does not work on a Document Fragment on IE (any version)
   *  Compatability: https://developer.mozilla.org/en-US/docs/Web/API/ParentNode.firstElementChild
   *  @param parentElem {Node} Parent to remove Children from
   *  @method removeItemsFromDom
   */
  function removeItemsFromDom (parentElem) {
    var df = document.createDocumentFragment();
    while (parentElem.firstElementChild) {
      df.appendChild(parentElem.removeChild(parentElem.firstElementChild));
    }
    return df;
  }

  /**
   *  @param queryId {string} class to parse images from
   *  @returns images {Array} array of DOM nodes.
   */
  module.exports = function exports( queryId ) {
    var items = document.querySelector(queryId);
    if (!items) throw 'no items found!';
    var childDocumentFragment = removeItemsFromDom(items);
    return nodeChildrenToArray(childDocumentFragment);
  }
});
