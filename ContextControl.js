
function ContextControl() {
	'use strict';
	
	SimpleEventDispatcher.call(this);

}

// Static Fields
ContextControl.EVENT_TYPE_CREATE = 'create';

ContextControl.contextElementClassName = 'context-control';
ContextControl.DIALOGUE_OPENED_CLASS_NAME = 'context-control-opened';
ContextControl.DIALOGUE_CLOSED_CLASS_NAME = 'context-control-closed';
ContextControl.DIALOGUE_MOBILE_THRESHOLD = 0.35;
ContextControl.MOBILE_VIEW_CLASS_NAME = 'context-control-mobile-view';
ContextControl.DIALOGUE_COLUMN_HORIZANTAL_OFFSET_PX = 10;
ContextControl.DIALOGUE_COLUMN_VERTICAL_OFFSET_PX = -10;


// Static Methods
ContextControl.getWindowScrollX = function () {
	'use strict';
	
	if (typeof window.scrollX === 'number') {
		return window.scrollX;
	}
	
	return window.pageXOffset;
	
};

ContextControl.getWindowScrollY = function () {
	'use strict';
	
	if (typeof window.scrollY === 'number') {
		return window.scrollY;
	}
	
	return window.pageYOffset;
};

ContextControl.createControl = function () {
	'use strict';
	
	var controlElement;
	
	controlElement = document.createElement('div');
	controlElement.className = ContextControl.contextElementClassName;
	
	return controlElement;
};

ContextControl.getOffset = function (el) {
	'use strict';
	
	var result = new ContextControl.OffsetCoordinates();
	ContextControl._getOffset(el, result);
	return result;
};

ContextControl._getOffset = function (el, offsetCoords) {
	'use strict';
	
	if (el == null) {
		return;
	}
	
	offsetCoords.x += el.offsetLeft;
	offsetCoords.y += el.offsetTop;
	ContextControl._getOffset(el.offsetParent, offsetCoords);
};



// Extension
ContextControl.prototype = Object.create(SimpleEventDispatcher.prototype);

// Default Instance Properties
ContextControl.prototype.controlElement = null;

ContextControl.prototype.offsetElement = null;

ContextControl.prototype.mobileViewState = null;


// Instance Methods
ContextControl.prototype.dispose = function () {
	'use strict';
	
	var controlElement;

	controlElement = this.controlElement;
	
	this.close();
	if (controlElement) {
		document.body.removeChild(controlElement);
	}
	this.controlElement = null;
	
};

ContextControl.prototype.handleEvent = function (event) {
	
	if (event.type !== 'resize') {
		if (console && console.warn) {
			console.warn('Unrecognized event: ' + event.type);
			console.warn(event);
		}
		return;
	}
	
	this.position();
};


ContextControl.prototype.open = function (offsetElement) {
	'use strict';
	
	var controlElement;
	
	if (!offsetElement) {
		throw new ReferenceError('Offset element must be defined.');
	}
	
	controlElement = this.controlElement;
	
	// Create dialogue if it doesn't exist.
	if (!controlElement) {
		controlElement = this.controlElement = ContextControl.createControl();
		document.body.appendChild(controlElement);
		this.dispatchEvent(new SimpleEventDispatcher.SimpleEvent(ContextControl.EVENT_TYPE_CREATE, this));
	}
	
	// Store reference to given offset element.
	this.offsetElement = offsetElement;
	
	
	// Begin opening sequence.
	IE9Compatibility.removeClass(controlElement, ContextControl.DIALOGUE_CLOSED_CLASS_NAME);
	IE9Compatibility.removeClass(controlElement, ContextControl.DIALOGUE_OPENED_CLASS_NAME);
	
	
	// Position control.
	this.position();
	
	// Register for resize events (for re-positioning).
	window.addEventListener('resize', this, false);
	
	
	// Finish opening sequence.
	IE9Compatibility.addClass(controlElement, ContextControl.DIALOGUE_OPENED_CLASS_NAME);
	
	return controlElement;
};


ContextControl.prototype.position = function () {
	'use strict';
	
	var controlElement, offset, windowWidth, windowHeight, areaRatio, dialogueHeight, dialogueWidth, lastOverflow,
		mobileViewState, proposedLeft, proposedTop, referenceHeader, offsetElement;
	
	// If no offset element, not opened yet; return.
	offsetElement = this.offsetElement;
	if (!offsetElement) {
		return;
	}
	
	// Initialization.
	controlElement = this.controlElement;
	mobileViewState = this.mobileViewState;
	
	windowWidth = window.innerWidth;
	windowHeight = window.innerHeight;
	dialogueWidth = mobileViewState ? mobileViewState.initialWidth : controlElement.offsetWidth;
	dialogueHeight = mobileViewState ? mobileViewState.initialHeight : controlElement.offsetHeight;
	
	
	// Calculate dialogue:window ratio.
	areaRatio = (dialogueHeight * dialogueWidth) / (windowHeight * windowWidth);
	
	// If over the 'mobile-view' threshold (takes up the configured percentage of the screen, expand to
	// fill entire screen. Otherwise position relative to offset control.
	if (areaRatio >= ContextControl.DIALOGUE_MOBILE_THRESHOLD) {
		if (!mobileViewState) {
			mobileViewState = this.mobileViewState = new ContextControl.MobileViewState(controlElement);
			mobileViewState.setupMobileView();
		}
	} else {
		// Restore default view if transitioning from mobile state.
		if (mobileViewState) {
			mobileViewState.restoreDefaultView();
			this.mobileViewState = null;
			dialogueWidth = controlElement.offsetWidth;
			dialogueHeight = controlElement.offsetHeight;
		}
		
		// Calculate offset of offset element.
		offset = ContextControl.getOffset(offsetElement);
		
		// Calculate proposed dialogue coordinates relative to offset element.
		proposedLeft = offset.x + ContextControl.DIALOGUE_COLUMN_HORIZANTAL_OFFSET_PX;
		proposedTop = offset.y + offsetElement.offsetHeight + ContextControl.DIALOGUE_COLUMN_VERTICAL_OFFSET_PX;
		
		// Place dialogue along right edge of screen if placing it at proposed left would extend beyond the screen's width, otherwise proposed left.
		controlElement.style.left = (proposedLeft + dialogueWidth > window.innerWidth ? window.innerWidth - dialogueWidth - (window.outerWidth - window.innerWidth) : proposedLeft) + 'px';
		// Place dialogue along bottom of screen if placing it at proposed top would extend beyond the screens height, otherwise proposed height.
		controlElement.style.top = (proposedTop + dialogueHeight > window.innerHeight ? Math.max(0, window.innerHeight - dialogueHeight) : proposedTop) + 'px';
	}
	
};


ContextControl.prototype.close = function () {
	'use strict';
	
	var controlElement, mobileViewState;
	
	controlElement = this.controlElement;
	
	if (!controlElement) {
		return;
	}
	
	if (mobileViewState = this.mobileViewState) {
		mobileViewState.restoreDefaultView();
		this.mobileViewState = null;
	}
	
	window.removeEventListener('resize', this, false);
	
	IE9Compatibility.removeClass(controlElement, ContextControl.DIALOGUE_OPENED_CLASS_NAME);
	IE9Compatibility.addClass(controlElement, ContextControl.DIALOGUE_CLOSED_CLASS_NAME);
};


ContextControl.prototype.getControlElement = function () {
	'use strict';
	
	return this.controlElement;
};









ContextControl.MobileViewState = function (controlElement) {
	'use strict';
	
	
	this.controlElement = controlElement;
	this.initialWidth = controlElement.offsetWidth;
	this.initialHeight = controlElement.offsetHeight;
	this.scrollX = ContextControl.getWindowScrollX();
	this.scrollY = ContextControl.getWindowScrollY();
};

ContextControl.MobileViewState.prototype.setupMobileView = function () {
	'use strict';
	
	var controlElement, controlStyle;
	
	controlElement = this.controlElement;
	controlStyle = controlElement.style;
	
	controlStyle.removeProperty('left');
	controlStyle.removeProperty('top');
	
	IE9Compatibility.addClass(controlElement, ContextControl.MOBILE_VIEW_CLASS_NAME);
	IE9Compatibility.addClass(document.body, ContextControl.MOBILE_VIEW_CLASS_NAME);
	
	window.scrollTo(0, 0);
};

ContextControl.MobileViewState.prototype.restoreDefaultView = function () {
	'use strict';
	
	var controlElement;
	
	controlElement = this.controlElement;
		
	IE9Compatibility.removeClass(controlElement, ContextControl.MOBILE_VIEW_CLASS_NAME);
	IE9Compatibility.removeClass(document.body, ContextControl.MOBILE_VIEW_CLASS_NAME);
	
	window.scrollTo(this.scrollX, this.scrollY);
};




ContextControl.OffsetCoordinates = function () {
	'use strict';
	
	this.x = 0;
	this.y = 0;
};