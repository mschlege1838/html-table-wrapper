

/**
 * Not actually a constructor as there are no instance methods; underlying definition is an empty object.
 * Documented as a class for the purposes of the documentation generator only.
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
 * <p>Adds compatibility for the EventTarget.addEventListener function.</p>
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
 * Adds compatibility for the EventTarget.removeEventListener function. Follows the same fallback pattern as {@link IE8Compatibility.addEventListener},
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





