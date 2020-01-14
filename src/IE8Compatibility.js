

/**
 * Not actually a constructor as there are no instance methods; underlying definition is an empty object.
 * Documented as a class for the purposes of this documentation generator only.
 *
 * @class
 * @augments IE9Compatibility
 * @classdesc
 *
 * Utility functions for MS Internet Explorer 8 compatibility. 
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
 * Cache of {@link IE8Compatibility.IE8EventHandler}s containing `EventListener`s registered via `attachEvent`.
 *
 * @private
 * @type Array
 */
IE8Compatibility.allRegisteredHandlers = null;


/**
 * Adds compatibility for the DOM `EventTarget.addEventListener` function.
 *
 * If `addEventListener` is defined on `target`, simply calls `target.addEventListener(type, listener, useCapture)`, otherwise falls
 * back to the IE-specific `attachEvent` function. This implies `useCapture`, if defined, can either be a `boolean` or an options object, but will 
 * be ignored if falling back to `attachEvent`.
 *
 * In either case, if listener is an `EventListener`, `handleEvent` will be called upon receiving an event (either natively if `addEventListener`
 * is defined on target, or via anonymous closure if falling back to `attachEvent`).
 *
 * @param {EventTarget} target Target to which the given `listener` is to be added.
 * @param {string} type Type name of the event for which the given `listener` is to be added.
 * @param {(function|EventListener)} listener Listener to add to the given `target`.
 * @param {(boolean|object)} [useCapture=false] Use capture/options argument for `addEventListener`; ignored if necessary to fall back to `attachEvent`.
 */
IE8Compatibility.addEventListener = function (target, type, listener, useCapture) {
	'use strict';
	
	var handlerFunction, allRegisteredHandlers, nominalType;
	
	if (target.addEventListener) {
		target.addEventListener(type, listener, useCapture);
		return;
	}
	
	if (useCapture && console && console.warn) {
		console.warn('Falling back to attachEvent; useCapture/options will be ignored.');
	}
	
	
	if (listener && typeof listener.handleEvent === 'function') {
		allRegisteredHandlers = IE8Compatibility.allRegisteredHandlers;
		if (!allRegisteredHandlers) {
			allRegisteredHandlers = IE8Compatibility.allRegisteredHandlers = [];
		}
		
		nominalType = type.toLowerCase();
		if (IE8Compatibility.getHandlerIndex(target, nominalType, listener) !== -1) {
			return;
		}
		
		handlerFunction = function (event) {
			listener.handleEvent(event)
		};
		allRegisteredHandlers.push(new IE8Compatibility.IE8EventHandler(target, nominalType, listener, handlerFunction));
	} else {
		handlerFunction = listener;
	}
	
	target.attachEvent('on' + type, handlerFunction);
};

/**
 * Adds compatibility for the DOM `EventTarget.removeEventListener` function. Follows the same fallback pattern as {@link IE8Compatibility.addEventListener},
 * except with `removeEventListener` and `detachEvent`.
 *
 * @param {EventTarget} target Target from which the given `listener` is to be removed.
 * @param {string} type Type name of the event for which the given `listener` is to be removed.
 * @param {(function|EventListener)} listener Listener to be removed.
 * @param {(boolean|object)} [useCapture=false] Use capture/options argument for `removeEventListener`; ignored if necessary to fall back to `detachEvent`.
 */
IE8Compatibility.removeEventListener = function (target, type, listener, useCapture) {
	'use strict';
	
	var handlerFunction, allRegisteredHandlers, listenerIndex, nominalType, handler;
	
	if (target.removeEventListener) {
		target.removeEventListener(target, type, listener, useCapture);
		return;
	}
	
	if (useCapture && console && console.warn) {
		console.warn('Falling back to detachEvent; useCapture/options will be ignored.');
	}
	
	if (listener && typeof listener.handleEvent === 'function') {
		nominalType = type.toLowerCase();
		
		allRegisteredHandlers = IE8Compatibility.allRegisteredHandlers;
		if (!allRegisteredHandlers || (listenerIndex = IE8Compatibility.getHandlerIndex(target, nominalType, listener)) === -1) {
			return;
		}
		
		handler = allRegisteredHandlers[listenerIndex];
		handlerFunction = handler.handlerFunction;
		
		allRegisteredHandlers.splice(listenerIndex, 1);
		handler.dispose();
	} else {
		handlerFunction = listener;
	}
	
	target.detachEvent('on' + type, handlerFunction);
};

/**
 * Adds compatibility for the DOM `Event.target` property. If `target` not a defined property of the given `event`, returns `event.srcElement`.
 *
 * @param {Event} event
 * @returns The `event.target` property of `event` if `target` is a defined property, otherwise `event.srcElement`.
 */
IE8Compatibility.getEventTarget = function (event) {
	'use strict';
	
	if ('target' in event) {
		return event.target;
	}
	
	return event.srcElement;
};


/**
 * Adds compatibility for `Object.create` for the specific use-case of prototype-based inheritance.
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
 * Adds compatibility for the `Node.textContent` property. Returns `node.textContent` if the `textContent` property is `in node`, otherwise the return value
 * is as follows:
 *
 * The depth-first concatenation of the `nodeValue` of all the child nodes of `node` that are of type `TEXT_NODE` (3) if `node` is of type:
 * - `ELEMENT_NODE` (1)
 * - `DOCUMENT_FRAGMENT_NODE` (11)
 *
 * The `nodeValue` of `node` if `node` is of type:
 * - `TEXT_NODE` (3)
 * - `CDATA_SECTION_NODE` (4)
 * - `PROCESSING_INSTRUCTION_NODE` (7)
 * - `COMMENT_NODE` (8)
 *
 * Or the `value` of `node` if `node` is of type `ATTRIBUTE_NODE` (2), and `null` if `node` is of any other type. This is designed to be consistent with the
 * definition of `textContent` in the DOM Living Standard.
 * 
 * @param {Node} node Node whose text content is to be obtained.
 * @returns {string} The `textContent` of `node`, or a value consistent with its definition in the DOM living standard.
 * @see https://dom.spec.whatwg.org/#dom-node-textcontent
 */
IE8Compatibility.getTextContent = function (node) {
	'use strict';
	
	var children;
	
	if ('textContent' in node) {
		return node.textContent;
	}
	
	switch (node.nodeType) {
		case 1: // ELEMENT_NODE
		case 11: // DOCUMENT_FRAGMENT_NODE
			children = node.childNodes;
			return children.length ? IE8Compatibility._getTextContent(children) : '';
			
		case 3: // TEXT_NODE
		case 4: // CDATA_SECTION_NODE
		case 7: // PROCESSING_INSTRUCTION_NODE
		case 8: // COMMENT_NODE
			return node.nodeValue;
			
		case 2: // ATTRIBUTE_NODE (Deprecated)
			return node.value;
		
		// Default includes:
		//   5/ENTITY_REFERENCE_NODE (Deprecated)
		//   6/ENTITY_NODE (Deprecated)
		//   9/DOCUMENT_NODE
		//   10/DOCUMENT_TYPE_NODE
		//   12/NOTATION_NODE (Deprecated)
		default:
			return null;
	}
	
};

/**
 * The corresponding setter function for {@link IE8Compatibility.getTextContent}.
 *
 * @param {Node} node Node whose text content is to be set.
 * @param {string} text Text content to set on `node`.
 * @see https://dom.spec.whatwg.org/#dom-node-textcontent
 */
IE8Compatibility.setTextContent = function (node, text) {
	'use strict';
	
	var children;
	
	if ('textContent' in node) {
		node.textContent = text;
		return;
	}
	
	switch (node.nodeType) {
		case 1: // ELEMENT_NODE
		case 11: // DOCUMENT_FRAGMENT_NODE
			children = node.childNodes;
			while (children.length) {
				node.removeChild(children[0]);
			}
			
			node.appendChild(document.createTextNode(text));
			break;
			
		case 3: // TEXT_NODE
		case 4: // CDATA_SECTION_NODE
		case 7: // PROCESSING_INSTRUCTION_NODE
		case 8: // COMMENT_NODE
			node.nodeValue = text;
			break;
			
		case 2: // ATTRIBUTE_NODE (Deprecated)
			node.value = text;
			break;
		
		// Default includes:
		//   5/ENTITY_REFERENCE_NODE (Deprecated)
		//   6/ENTITY_NODE (Deprecated)
		//   9/DOCUMENT_NODE
		//   10/DOCUMENT_TYPE_NODE
		//   12/NOTATION_NODE (Deprecated)
		default:
	}
};

/**
 * Recursive helper for {@link IE8Compatibility.getTextContent}. Returns the concatenation of all descendant child nodes that are
 * of type `TEXT_NODE` (3). A depth-first traversal is performed, as is specified in the DOM living standard for `Node.textContent`.
 *
 * @private
 * @param {NodeList} nodeList Children of the current node being processed.
 * @returns {string} The depth-first concatenation of the values of all descendant child nodes that are of type `TEXT_NODE` (3).
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
 * Finds the index of the corresponding {@link IE8Compatibility.IE8EventHandler} for the given `target`, `type` and `listener` in 
 * {@link IE8Compatibility.allRegisteredHandlers}. Returns -1 if not found.
 *
 * @private
 * @param {EventTarget} target Target whose corresponding {@link IE8Compatibility.IE8EventHandler} is to be obtained.
 * @param {string} type Event type whose corresponding {@link IE8Compatibility.IE8EventHandler} is to be obtained.
 * @param {EventListener} listener `EventListener` registered on the given `target` for the given event `type`.
 * @returns {number} 
 *   Index of the corresponding {@link IE8Compatibility.IE8EventHandler} for the given `target`, `type` and `listener`, or -1
 *   if no matching {@link IE8Compatibility.IE8EventHandler} could be found.
 */
IE8Compatibility.getHandlerIndex = function (target, type, listener) {
	'use strict';
	
	var handlers, handler, i;
	
	handlers = IE8Compatibility.allRegisteredHandlers;
	for (i = 0; i < handlers.length; ++i) {
		handler = handlers[i];
		if (handler.target === target && handler.type === type && handler.listener === listener) {
			return i;
		}
	}
	
	return -1;
};




/**
 *
 * @constructor
 * @param {EventTarget} target `EventTarget` to which the given `listener` is registered.
 * @param {string} type Event type for which the given `listener` is registered.
 * @param {EventListener} listener `EventListener` registered on `target` for the given event `type`.
 * @param {function} handlerFunction
 * @private
 * @extends Disposable
 * @classdesc
 *   Container object representing a registered `EventListener`. Holds the `EventTarget` upon which the `EventListener` is
 *   registered, as well as the type of event for which it listens.
 */
IE8Compatibility.IE8EventHandler = function (target, type, listener, handlerFunction) {
	'use strict';
	
	/**
	 * `EventTarget` to which {@link IE8Compatibility.IE8EventHandler#listener} is registered.
	 *
	 * @type {EventTarget}
	 */
	this.target = target;
	
	/**
	 * Event type for which {@link IE8Compatibility.IE8EventHandler#listener} is registered.
	 *
	 * @type {string}
	 */
	this.type = type;
	
	/**
	 * `EventListener` registered on {@link IE8Compatibility.IE8EventHandler#target} for events of type
	 * {@link IE8Compatibility.IE8EventHandler#type}.
	 *
	 * @type {EventListener}
	 */
	this.listener = listener;
	
	/**
	 * @type {function}
	 */
	this.handlerFunction = handlerFunction;
};

IE8Compatibility.IE8EventHandler.prototype.dispose = function () {
	'use strict';
	
	this.target = this.listener = this.handlerFunction = null;
};



