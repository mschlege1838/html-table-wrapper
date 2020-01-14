

function IE8Compatibility() {
	'use strict';
}

(function (src, target) {
	'use strict';
	
	var name;
	
	for (name in src) {
		target[name] = src[name];
	}
})(IE9Compatibility, IE8Compatibility);


IE8Compatibility.allRegisteredListeners = null;

IE8Compatibility.addEventListener = function (target, type, listener, useCapture) {
	'use strict';
	
	var nominalListener, allRegisteredListeners;
	
	if (target.addEventListener) {
		target.addEventListener(type, listener, useCapture);
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

IE8Compatibility.removeEventListener = function (target, type, listener, useCapture) {
	'use strict';
	
	var nominalListener, allRegisteredListeners, listenerIndex;
	
	if (target.removeEventListener) {
		target.removeEventListener(target, type, listener, useCapture);
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
		allRegisteredListeners.splice(listenerIndex, 1);
	} else {
		nominalListener = listener;
	}
	
	target.detachEvent('on' + type, nominalListener);
};


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


