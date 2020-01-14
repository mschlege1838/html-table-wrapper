

/**
 * Not actually a constructor as there are no instance methods; underlying definition is an empty object.
 * Documented as a class for the purposes of this documentation generator only.
 *
 * @class
 * @augments IE9Compatibility
 * @classdesc
 *		Utility functions for MS Internet Explorer 8 compatibility. 
 */
var IE8Compatibility = {};


(function (src, target) {
	'use strict';
	
	var name;
	
	for (name in src) {
		target[name] = src[name];
	}
	
})(IE9Compatibility, IE8Compatibility);


/**
 * Cache of EventListeners registered via attachEvent.
 *
 * @private
 */
IE8Compatibility.allRegisteredListeners = null;


/**
 * <p>Adds compatibility for the DOM EventTarget.addEventListener function.</p>
 *
 * <p>If addEventListener is defined on target, simply calls <code>target.addEventListener(type, listener, useCapture)</code>, otherwise falls
 * back to the IE-specific attachEvent function. This implies useCapture, if defined, can either be a boolean or an options object, but will 
 * be ignored if falling back to attachEvent.</p>
 *
 * <p>In either case, if listener is an EventListener, handleEvent will be called upon receiving an event (either natively if addEventListener
 * is defined on target, or via anonymous closure if falling back to attachEvent).</p>
 *
 * @param {EventTarget} target Target to which the given listener is to be added.
 * @param {string} type Type name of the event for which the given listener is to be added.
 * @param {(function|EventListener)} listener Listener to add to the given target.
 * @param {(boolean|object)} [useCapture=false] Use capture/options argument for addEventListener; ignored if necessary to fall back to attachEvent.
 */
IE8Compatibility.addEventListener = function (target, type, listener, useCapture) {
	'use strict';
	
	var nominalListener, allRegisteredListeners;
	
	if (target.addEventListener) {
		target.addEventListener(type, listener, useCapture);
		return;
	}
	
	if (useCapture && console && console.warn) {
		console.warn('Falling back to attachEvent; useCapture/options will be ignored.');
	}
	
	
	if (listener && typeof listener.handleEvent === 'function') {
		allRegisteredListeners = IE8Compatibility.allRegisteredListeners;
		if (!allRegisteredListeners) {
			allRegisteredListeners = IE8Compatibility.allRegisteredListeners = [];
		}
		
		if (IE8Compatibility.getListenerIndex(listener) !== -1) {
			return;
		}
		
		nominalListener = function (event) {
			listener.handleEvent(event)
		};
		nominalListener.srcListener = listener;
		allRegisteredListeners.push(nominalListener);
	} else {
		nominalListener = listener;
	}
	
	target.attachEvent('on' + type, nominalListener);
};

/**
 * Adds compatibility for the DOM EventTarget.removeEventListener function. Follows the same fallback pattern as {@link IE8Compatibility.addEventListener},
 * except with removeEventListener and detachEvent.
 *
 * @param {EventTarget} target Target from which the given listener is to be removed.
 * @param {string} type Type name of the event for which the given listener is to be removed.
 * @param {(function|EventListener)} listener Listener to be removed.
 * @param {(boolean|object)} [useCapture=false] Use capture/options argument for removeEventListener; ignored if necessary to fall back to detachEvent.
 */
IE8Compatibility.removeEventListener = function (target, type, listener, useCapture) {
	'use strict';
	
	var nominalListener, allRegisteredListeners, listenerIndex;
	
	if (target.removeEventListener) {
		target.removeEventListener(target, type, listener, useCapture);
		return;
	}
	
	if (useCapture && console && console.warn) {
		console.warn('Falling back to detachEvent; useCapture/options will be ignored.');
	}
	
	if (listener && typeof listener.handleEvent === 'function') {
		allRegisteredListeners = IE8Compatibility.allRegisteredListeners;
		if (!allRegisteredListeners || (listenerIndex = IE8Compatibility.getListenerIndex(listener)) === -1) {
			return;
		}
		
		nominalListener = allRegisteredListeners[listenerIndex];
		delete nominalListener.srcListener;
		allRegisteredListeners.splice(listenerIndex, 1);
	} else {
		nominalListener = listener;
	}
	
	target.detachEvent('on' + type, nominalListener);
};

/**
 * Adds compatibility for Object.create for the specific use-case of prototype-based inheritance.
 *
 * @param {object} proto Prototype property of the desired parent (superclass) constructor.
 */
IE8Compatibility.extend = function (proto) {
	'use strict';
	
	var anon;
	
	if (Object.create) {
		return Object.create(proto);
	}
	
	anon = function () {};
	anon.prototype = proto;
	return new anon();
};

/**
 * Adds compatibility for the Node.textContent property.
 *
 * @param {Node} node Node whose textContent is to be
 */
IE8Compatibility.getTextContent = function (node) {
	'use strict';
	
	var children;
	
	if ('textContent' in node) {
		return node.textContent;
	}
	
	switch (node.nodeType) {
		case 1: // ELEMENT_NODE
			return node.innerText;
		case 3: // TEXT_NODE
		case 4: // CDATA_SECTION_NODE
		case 7: // PROCESSING_INSTRUCTION_NODE
		case 8: // COMMENT_NODE
			return node.nodeValue;
		
		case 11: // DOCUMENT_FRAGMENT_NODE
			children = node.childNodes;
			return children.length ? node.IE8Compatibility._getTextContent(children) : '';
		
		// Default includes:
		//   5/ENTITY_REFERENCE_NODE (Deprecated)
		//   6/ENTITY_NODE (Deprecated)
		//   9/DOCUMENT_NODE
		//   10/DOCUMENT_TYPE_NODE
		//   12/NOTATION_NODE (Deprecated)
		default:
			return null;
			
		case 2: // ATTRIBUTE_NODE (Deprecated)
			return node.value;
	}	
	
};

/**
 * Recursive helper for {@link IE8Compatibility.getTextContent}. Returns the concatenation of all immediate and descendant
 * child nodes that are of type TEXT_NODE (3). A depth-first traversal is performed, as is specified in the DOM living standard
 * for node textContent.
 *
 * @private
 * @param {NodeList} nodeList Children of the current node being processed.
 */
IE8Compatibility._getTextContent = function (nodeList) {
	'use strict';
	
	var i, node, children, text;
	
	text = '';
	for (i = 0; i < nodeList.length; ++i) {
		node = nodeList[i];
		
		// Depth-first traversal.
		children = node.childNodes;
		if (children.length) {
			text += IE8Compatibility._getTextContent(children);
		}
		
		// if node is of type TEXT_NODE...
		if (node.nodeType == 3) {
			text += node.nodeValue;
		}
	}
	
	return text;
};

/**
 * Finds the index of the given listener in {@link IE8Compatibility.allRegisteredListeners}. Returns -1 if not
 * found.
 *
 * @private
 * @param {EventListener} listener EventListener whose index is to be retrieved.
 * @returns {number} Index of the given listener in {@link IE8Compatibility.allRegisteredListeners} or -1 if not found.
 */
IE8Compatibility.getListenerIndex = function (listener) {
	'use strict';
	
	var listeners, i;
	
	listeners = IE8Compatibility.allRegisteredListeners;
	for (i = 0; i < listeners.length; ++i) {
		if (listeners[i].srcListener === listener) {
			return i;
		}
	}
	
	return -1;
};





