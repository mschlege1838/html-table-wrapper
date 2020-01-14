
// Virtual Interfaces
/**
 *
 * @interface SimpleEventIntf
 * @classdesc
 *		Simplified definition of an event for the purposes of {@link SimpleEventDispatcher}. Although
 *		it is unlikely standard DOM events will be used with {@link SimpleEventDispatcher}, they
 *		do implement this interface.
 */
/**
 * The type of this event.
 *
 * @member {string} SimpleEventIntf#type
 */

/**
 * 
 * @interface SimpleEventListener
 * @classdesc
 *		Definition of an event listener for the purposes of {@link SimpleEventDispatcher}. Effectively
 *		identical to the standard DOM EventListener.
 *
 * @see https://dom.spec.whatwg.org/#callbackdef-eventlistener
 */
/**
 * Callback function to handle events for which this listener is registered.
 *
 * @function EventListener#handleEvent
 * @param {SimpleEvent} event
 */





// Constructor
/**
 * Default constructor.
 *
 * @constructor
 * @classdesc
 *		<p>Simple implementation of an event dispatcher that supports the registration of multiple
 *		listeners for events by type. Although this type can be used on its own, it is often more 
 *		conveninet to extend it.</p>
 *
 *		<p>This type is designed to have consistency with the DOM EventTarget, however events are 
 *		simply dispatched to listeners in the order they are registered. I.e. there is no support for
 *		bubbling, cancelling, etc.</p>
 *
 * @see https://dom.spec.whatwg.org/#interface-eventtarget
 */
function SimpleEventDispatcher() {
	'use strict';
	
	this.listeners = {};
}

// Static methods
/**
 * Utility function to validate an event type string, and convert it to a consistent case.
 *
 * @package
 * @param {string} type An event type string.
 * @returns The given type converted to a consistent case.
 * @throws {ReferenceError} If type is not defined or is a zero-length string.
 * @throws {TypeError} If type is not a string.
 */
SimpleEventDispatcher.processType = function (type) {
	'use strict';
	
	if (!type) {
		throw new ReferenceError('Event type must be defined (and have a length greater than 0).');
	}
	if (typeof type !== 'string' || !(type instanceof String)) {
		throw new TypeError('Event type must be a string.');
	}
	
	return type.toLowerCase();
};


// Instance methods
/**
 * Adds a the given listener for the given event type.
 *
 * @param {string} type Event type for which the given listener is to be registered.
 * @param {(SimpleEventListener|function)} listener Listener to register.
 * @param {boolean} [useCapture=false] 
 *		Optional parameter added for consistency with the standard DOM EventTarget addEventListener definition.
 *		If not false ('falsy'), will print a warning on the console.
 * @throws {ReferenceError} If type is not defined or is a zero-length string; if listener is not defined.
 * @throws {TypeError} If type is not a string; if listener does not implement {@link SimpleEventListener} or is not a function.
 */
SimpleEventDispatcher.prototype.addEventListener = function (type, listener, useCapture) {
	'use strict';
	
	var listeners;
	
	if (useCapture && console && console.warn) {
		console.warn('Capture/bubble phase not supported by this event listener; events are simply dispatched to listeners in the order they are registered.');
	}
	
	type = SimpleEventDispatcher.processType(type);
	
	if (!listener) {
		throw new ReferenceError('Listener must be defined.');
	}
	if (typeof listener.handleEvent !== 'function' && typeof listener !== 'function') {
		throw new TypeError('Listener must either define a handleEvent function or be a function itself.');
	}


	listeners = this.listeners[type];
	if (!listeners) {
		listeners = this.listeners[type] = [];
	}
	
	if (listeners.indexOf(listener) === -1) {
		listeners.push(listener);
	}
};

/**
 * Removes the given listener for the given event type, provided it is currently registered for that type.
 *
 * @param {string} type Event type for which the given listener is to be removed.
 * @param {(SimpleEventListener|function)} listener Listener to be removed.
 * @param {boolean} [useCapture=false] 
 *		Optional parameter added for consistency with the standard DOM EventTarget addEventListener definition.
 *		If not false ('falsy'), will print a warning on the console.
 * @throws {ReferenceError} If type is not defined or is a zero-length string.
 * @throws {TypeError} If type is not a string.
 */
SimpleEventDispatcher.prototype.removeEventListener = function (type, listener, useCapture) {
	'use strict';
	
	var listeners, targetIndex;
	
	if (useCapture && console && console.warn) {
		console.warn('Capture/bubble phase not supported by this event listener; events are simply dispatched to listeners in the order they are registered.');
	}
	
	type = SimpleEventDispatcher.processType(type);
	
	
	listeners = this.listeners[type];
	if (!listeners) {
		return;
	}
	
	targetIndex = listeners.indexOf(listener);
	if (targetIndex === -1) {
		return;
	}
	
	listeners.splice(targetIndex, 1);
};


/**
 * Dispatches the given event to registered listeners. Listeners are called in the order they are added.
 *
 * @param {SimpleEventIntf} event Event to dispatch.
 * @throws {ReferenceError} If event is not defined.
 * @throws {TypeError} If event does not implement {@link SimpleEventIntf}.
 */
SimpleEventDispatcher.prototype.dispatchEvent = function (event) {
	'use strict';
	
	var listeners, listener, i;
	
	if (!event) {
		throw new ReferenceError('Event must be defined.');
	}
	
	if (typeof event.type !== 'string' || !(event.type instanceof String)) {
		throw new TypeError('Event must, at minimum, define a type property.');
	}
	
	
	listeners = this.listeners[event.type.toLowerCase()];
	if (!listeners) {
		return;
	}
	
	for (i = 0; i < listeners.length; ++i) {
		listener = listeners[i];
		
		if (typeof listener.handleEvent === 'function') {
			listener.handleEvent(event);
		} else {
			listener(event);
		}
	}
	
};





// Nested types
/**
 *
 * @constructor
 * @param {string} type Type of this event. N.B. no case conversion is performed in this constructor.
 * @param {object} target Target of this event.
 * @classdesc
 *		Simple implementation of {@link SimpleEventIntf} that also includes the DOM standard
 * 		target and currentTarget properties. Note target remains constant as this event dispatcher 
 * 		implementation does not support bubbling. The currentTarget property is also set to the
 * 		given target.
 * 
 * @see https://dom.spec.whatwg.org/#dom-event-target
 * @see https://dom.spec.whatwg.org/#dom-event-currenttarget
 */
SimpleEventDispatcher.SimpleEvent = function (type, target) {
	'use strict';
	
	/**
	 * Type of this event.
	 */
	this.type = type;
	
	/**
	 * Target of this event.
	 */
	this.target = target;
	
	/**
	 * Added for consistency with DOM event definition; same as {@link SimpleEventDispatcher.SimpleEvent#target}.
	 */
	this.currentTarget = target;
};