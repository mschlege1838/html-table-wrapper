

function SimpleEventDispatcher() {
	'use strict';
	
	this.listeners = {};
}


SimpleEventDispatcher.prototype.addEventListener = function (name, listener, useCapture) {
	'use strict';
	
	var listeners;
	
	if (!name) {
		throw new ReferenceError('Event name must be defined (and have a length greater than 0).');
	}
	name = name.toLowerCase();
	
	if (!listener) {
		throw new ReferenceError('Listener must be defined.');
	}
	
	if (typeof listener.handleEvent !== 'function' && typeof listener !== 'function') {
		throw new TypeError('Listener must either define a handleEvent function or be a function itself.');
	}
	
	if (useCapture && console && console.warn) {
		console.warn('Capture/bubble phase not supported by this event listener; events are simply dispatched to listeners in the order they are registered.');
	}
	
	
	listeners = this.listeners[name];
	if (!listeners) {
		listeners = this.listeners[name] = []
	}
	
	listeners.push(listener);
};

SimpleEventDispatcher.prototype.removeEventListener = function (name, listener, useCapture) {
	'use strict';
	
	var listeners, targetIndex;
	
	if (useCapture && console && console.warn) {
		console.warn('Capture/bubble phase not supported by this event listener; events are simply dispatched to listeners in the order they are registered.');
	}
	
	listeners = this.listeners[name.toLowerCase()];
	if (!listeners) {
		return;
	}
	
	targetIndex = listeners.indexOf(listener);
	if (targetIndex === -1) {
		return;
	}
	
	listeners.splice(targetIndex, 1);
};


SimpleEventDispatcher.prototype.dispatchEvent = function (event) {
	'use strict';
	
	var listeners, listener, i;
	
	if (!event) {
		throw new ReferenceError('Event must be defined.');
	}
	
	if (typeof event.type !== 'string') {
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






SimpleEventDispatcher.SimpleEvent = function (type, target) {
	'use strict';
	
	this.type = type;
	this.target = this.currentTarget = target;
};