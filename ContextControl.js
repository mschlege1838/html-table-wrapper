

function ContextControl() {
	'use strict';
	
	SimpleEventDispatcher.call(this);

}

// Static Fields
ContextControl.EVENT_TYPE_CREATE = 'create';
ContextControl.EVENT_TYPE_DISPOSE = 'dispose';
ContextControl.EVENT_TYPE_OPEN = 'open';

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
	
	var container;
	
	container = document.createElement('div');
	container.className = ContextControl.contextElementClassName;
	document.body.appendChild(container);
	
	return container;
};

ContextControl.getOffset = function (el) {
	'use strict';
	
	var result = { X: 0, Y: 0 };
	ContextControl._getOffset(el, result);
	return result;
};

ContextControl._getOffset = function (el, offsetCoords) {
	'use strict';
	
	if (el == null) {
		return;
	}
	
	offsetCoords.X += el.offsetLeft;
	offsetCoords.Y += el.offsetTop;
	ContextControl._getOffset(el.offsetParent, offsetCoords);
};




ContextControl.prototype = Object.create(SimpleEventDispatcher.prototype);

// Default Instance Properties
ContextControl.prototype.columnOperationsElement = null;

ContextControl.prototype.currentOffsetElement = null;

ContextControl.prototype.mobileViewState = null;


// Instance Methods
ContextControl.prototype.dispose = function () {
	'use strict';
	
	var columnOperationsElement;

	columnOperationsElement = this.columnOperationsElement;
	
	this.close();
	this.dispatchEvent(new SimpleEventDispatcher(ContextControl.EVENT_TYPE_DISPOSE, this));
	if (columnOperationsElement) {
		document.body.removeChild(columnOperationsElement);
	}
	this.columnOperationsElement = null;
	
};

ContextControl.prototype.handleEvent = function (event) {
	
	var currentOffsetElement;
	
	if (event.type !== 'resize') {
		return;
	}
	
	currentOffsetElement = this.currentOffsetElement;
	
	if (currentOffsetElement) {
		this.position(currentOffsetElement);
	}

};


ContextControl.prototype.open = function (offsetElement) {
	'use strict';
	
	var columnOperationsElement;
	
	columnOperationsElement = this.columnOperationsElement;
	
	// Create dialogue if it doesn't exist.
	if (!columnOperationsElement) {
		columnOperationsElement = this.columnOperationsElement = ContextControl.createControl();
		this.dispatchEvent(new SimpleEventDispatcher.SimpleEvent(ContextControl.EVENT_TYPE_CREATE, this));
	}
	
	// Begin opening sequence.
	IE9Compatibility.removeClass(columnOperationsElement, ContextControl.DIALOGUE_CLOSED_CLASS_NAME);
	IE9Compatibility.removeClass(columnOperationsElement, ContextControl.DIALOGUE_OPENED_CLASS_NAME);
	
	
	// Position control.
	this.position(offsetElement);
	
	// Register for resize events (for re-positioning).
	this.currentOffsetElement = offsetElement;
	window.addEventListener('resize', this, false);
	
	
	// Finish opening sequence.
	IE9Compatibility.addClass(columnOperationsElement, ContextControl.DIALOGUE_OPENED_CLASS_NAME);
	
	return columnOperationsElement;
};


ContextControl.prototype.position = function (offsetElement) {
	'use strict';
	
	var columnOperationsElement, offset, windowWidth, windowHeight, areaRatio, dialogueHeight, dialogueWidth, lastOverflow,
		mobileViewState, proposedLeft, proposedTop, referenceHeader;
	
	columnOperationsElement = this.columnOperationsElement;
	mobileViewState = this.mobileViewState;
	
	windowWidth = window.innerWidth;
	windowHeight = window.innerHeight;
	dialogueWidth = mobileViewState ? mobileViewState.initialWidth : columnOperationsElement.offsetWidth;
	dialogueHeight = mobileViewState ? mobileViewState.initialHeight : columnOperationsElement.offsetHeight;
	
	
	areaRatio = (dialogueHeight * dialogueWidth) / (windowHeight * windowWidth);
	
	
	if (areaRatio >= ContextControl.DIALOGUE_MOBILE_THRESHOLD) {
		if (!mobileViewState) {
			mobileViewState = this.mobileViewState = new ContextControl.MobileViewState(columnOperationsElement);
			mobileViewState.setupMobileView();
		}
	} else {
		if (mobileViewState) {
			mobileViewState.restoreDefaultView();
			this.mobileViewState = null;
			dialogueWidth = columnOperationsElement.offsetWidth;
			dialogueHeight = columnOperationsElement.offsetHeight;
		}
		
		offset = ContextControl.getOffset(offsetElement);
		
		proposedLeft = offset.X + ContextControl.DIALOGUE_COLUMN_HORIZANTAL_OFFSET_PX;
		proposedTop = offset.Y + offsetElement.offsetHeight + ContextControl.DIALOGUE_COLUMN_VERTICAL_OFFSET_PX;
		
		columnOperationsElement.style.left = (proposedLeft + dialogueWidth > window.innerWidth ? window.innerWidth - dialogueWidth - (window.outerWidth - window.innerWidth) : proposedLeft) + 'px';
		columnOperationsElement.style.top = (proposedTop + dialogueHeight > window.innerHeight ? Math.max(0, window.innerHeight - dialogueHeight) : proposedTop) + 'px';
	}
	
};


ContextControl.prototype.close = function () {
	'use strict';
	
	var columnOperationsElement, mobileViewState;
	
	columnOperationsElement = this.columnOperationsElement;
	
	if (!columnOperationsElement) {
		return;
	}
	
	if (mobileViewState = this.mobileViewState) {
		mobileViewState.restoreDefaultView();
		this.mobileViewState = null;
	}
	
	window.removeEventListener('resize', this, false);
	this.currentColumnIndex = -1;
	
	IE9Compatibility.removeClass(columnOperationsElement, ContextControl.DIALOGUE_OPENED_CLASS_NAME);
	IE9Compatibility.addClass(columnOperationsElement, ContextControl.DIALOGUE_CLOSED_CLASS_NAME);
};


ContextControl.prototype.getControlElement = function () {
	'use strict';
	
	return this.columnOperationsElement;
};









ContextControl.MobileViewState = function (columnOperationsElement) {
	'use strict';
	
	
	this.columnOperationsElement = columnOperationsElement;
	this.initialWidth = columnOperationsElement.offsetWidth;
	this.initialHeight = columnOperationsElement.offsetHeight;
	this.scrollX = ContextControl.getWindowScrollX();
	this.scrollY = ContextControl.getWindowScrollY();
};

ContextControl.MobileViewState.prototype.setupMobileView = function () {
	'use strict';
	
	var columnOperationsElement, controlStyle;
	
	columnOperationsElement = this.columnOperationsElement;
	controlStyle = columnOperationsElement.style;
	
	controlStyle.removeProperty('left');
	controlStyle.removeProperty('top');
	
	IE9Compatibility.addClass(columnOperationsElement, ContextControl.MOBILE_VIEW_CLASS_NAME);
	IE9Compatibility.addClass(document.body, ContextControl.MOBILE_VIEW_CLASS_NAME);
	
	window.scrollTo(0, 0);
};

ContextControl.MobileViewState.prototype.restoreDefaultView = function () {
	'use strict';
	
	var columnOperationsElement;
	
	columnOperationsElement = this.columnOperationsElement;
		
	IE9Compatibility.removeClass(columnOperationsElement, ContextControl.MOBILE_VIEW_CLASS_NAME);
	IE9Compatibility.removeClass(document.body, ContextControl.MOBILE_VIEW_CLASS_NAME);
	
	window.scrollTo(this.scrollX, this.scrollY);
};


