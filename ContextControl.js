
// Virtual Events
/**
 * Fired the first time a ContextControl is {@link ContextControl#open opened}. The target and currentTarget
 * properties are set to the ContextControl being opened. The control's backing element can be obtained via
 * {@link ContextControl#getControlElement} for listeners defining the control's content.
 *
 * @event ContextControl#event:create
 * @type {SimpleEventDispatcher.SimpleEvent}
 */



// Constructor
/**
 *
 * @constructor
 * @extends SimpleEventDispatcher
 * @param {number} [horizontalOffset={@link ContextControl.defaultHorizontalOffset}] Horizontal offset with respect to offset element passed to {@link ContextControl#open}.
 * @param {number} [verticalOffset={@link ContextControl.defaultVerticalOffset}] Vertical offset with respect to offset element passed to {@link ContextControl#open}.
 * @classdesc
 *		<p>Simple implementation of an HTML DOM based context control. This class (lazily) creates an HTMLDivElement
 *		to hold the control's content, and applies class names corresponding to when the control is opened, closed
 *		or should take on the 'mobile view' state.</p>
 *
 *		<p>The first time this control is {@link ContextControl#open opened}, the {@link ContextControl#event:create create} event
 * 		is fired. It is expected that client code will listen for this event and populate the control element with desired
 *		content. The control element can be obtained via <code>{@link ContextControl#getControlElement event.target.getControlElement()}</code>.</p>
 *
 *		<p>The control enters and exits 'mobile view' state based upon the percentage of the viewport the control
 *		occupies. When not in the mobile view state, the left and top CSSStyleDeclaration properties are set based
 *		upon the offset element passed to the {@link ContextControl#open} function and the 
 *		{@link ContextControl#horizontalOffset} and {@link ContextControl#verticalOffset} properties. Upon being
 *		opened, this class will begin listening for window resize events and 
 *		{@link ContextControl#position reposition} itself upon receiving them. Upon being closed, this class will
 *		stop listening for resize events.</p>
 *
 *		<p>Of note, this class <em>only</em> sets element class names, and a limited set of CSS properties. Other
 *		styling should be handled by dedicated stylesheets. A baseline stylesheet is provided at 
 *		[[TODO default style link here]].</p>
 */
function ContextControl(horizontalOffset, verticalOffset) {
	'use strict';
	
	SimpleEventDispatcher.call(this);
	
	/**
	 * The offset in pixels to be applied to the left CSSStyleDeclaration of this control's element with respect
	 * to {@link ContextControl#offsetElement} when not in mobile view state.
	 */
	this.horizontalOffset = horizontalOffset === null || horizontalOffset === void 0 ? ContextControl.defaultHorizontalOffset : horizontalOffset;
	
	/**
	 * The offset in pixels to be applied to the top CSSStyleDeclaration of this control's element with respect
	 * to the {@link ContextControl#offsetElement} when not in mobile view state.
	 */
	this.verticalOffset = verticalOffset === null || verticalOffset === void 0 ? ContextControl.defaultVerticalOffset : verticalOffset;
}


// Static Fields
/**
 * Name of the event fired the first time this ContextControl is opened. Value is 'create'.
 *
 * @const
 * @private
 */
ContextControl.EVENT_TYPE_CREATE = 'create';

/**
 * Class name to be assigned to control elements when they are first created.
 */
ContextControl.contextElementClassName = 'context-control';

/**
 * Class name to be added to control elements when {@link ContextControl#open} is called.
 */
ContextControl.dialogueOpenedClassName = 'context-control-opened';

/**
 * Class name to be added to control elements when {@link ContextControl#close} is called.
 */
ContextControl.dialogueClosedClassName = 'context-control-closed';

/**
 * Class name to be added to control elements when this ContextControl determines the mobile
 * view state should be entered.
 */
ContextControl.mobileViewClassName = 'context-control-mobile-view';

/**
 * Decimal percentage of the screen this control's element should occupy to trigger entry into
 * mobile view state.
 */
ContextControl.mobileThresholdRatio = 0.35;

/**
 * Default horizontal offset.
 */
ContextControl.defaultHorizontalOffset = 10;

/**
 * Default vertical offset.
 */
ContextControl.defaultVerticalOffset = -10;



// Static Methods
/**
 * Utiltiy function to obtain how left down the window is scrolled.
 *
 * @package
 * @returns {number} How far left the window is scrolled.
 */
ContextControl.getWindowScrollX = function () {
	'use strict';
	
	if (typeof window.scrollX === 'number') {
		return window.scrollX;
	}
	
	if (typeof window.pageXOffset === 'number') {
		return window.pageXOffset;
	}
	
	return document.documentElement.scrollLeft;
};

/**
 * Utility function to obtain how far down the window is scrolled.
 *
 * @package
 * @returns {number} How far down the window is scrolled.
 */
ContextControl.getWindowScrollY = function () {
	'use strict';
	
	if (typeof window.scrollY === 'number') {
		return window.scrollY;
	}
	
	if (typeof window.pageYOffset === 'number') {
		return window.pageYOffset;
	}
	
	return document.documentElement.scrollTop;
};

/**
 * Creates an empty control element.
 *
 * @package
 * @returns {HTMLDivElement} An empty (detached) control element.
 */
ContextControl.createControl = function () {
	'use strict';
	
	var controlElement;
	
	controlElement = document.createElement('div');
	controlElement.className = ContextControl.contextElementClassName;
	
	return controlElement;
};

/**
 * Utility function for determining an element's absolute viewport offset.
 *
 * @package
 * @param {HTMLElement} el Element whose viewport offset is to be calculated.
 * @returns {ContextControl.OffsetCoordinates} Coordinates of the given element's viewport offset.
 */
ContextControl.getOffset = function (el) {
	'use strict';
	
	var result = new ContextControl.OffsetCoordinates();
	ContextControl._getOffset(el, result);
	return result;
};

/**
 * Recursive helper method for {@link ContextControl.getOffset}.
 *
 * @private
 * @param {HTMLElement} el Current element.
 * @param {ContextControl.OffsetCoordinates} Coordinates being processed.
 */
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
/**
 * The unerlying HTMLElement defining this control's contents. Initially null; created/assigned the first time
 * {@link ContextControl#open} is called.
 *
 * @private
 */
ContextControl.prototype.controlElement = null;

/**
 * Element relative to which this {@link ContextControl#controlElement} is to be positioned. Passed and stored
 * on calls to {@link ContextControl#open}.
 *
 * @private
 */
ContextControl.prototype.offsetElement = null;

/**
 * Current mobile view state information if this ContextControl is in mobile view state.
 *
 * @private
 */
ContextControl.prototype.mobileViewState = null;


// Instance Methods
/**
 * Disposes this ContextControl by {@link ContextControl#close closing} it and detaching the backing
 * {@link ContextControl#getControlElement control element}.
 */
ContextControl.prototype.dispose = function () {
	'use strict';
	
	var controlElement;

	controlElement = this.controlElement;
	
	this.close();
	if (controlElement) {
		document.body.removeChild(controlElement);
	}
	this.controlElement = null;
	
	this.offsetElement = null;
	
};


/**
 * Implementation of DOM EventListener.
 *
 * @param {Event} event Event being dispatched.
 */
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


/**
 * Opens this ContextControl and positions its backing {@link ContextControl#getControlElement element} relative to
 * the given offset element. If this is the first time the control is opened, the {@link ContextControl#event:create create}
 * event will be fired (where it is expected client code will populate the control with desired content). In any case, the
 * {@link ContextControl.dialogueClosedClassName} class will be removed from the control element, it will be positioned relative
 * to the given offsetElement, this class will add itself as a listener for window resize events, and finally, the
 * {@link ContextControl.dialogueOpenedClassName} class will be added to the control element.
 *
 * @param {HTMLElement} offsetElement Element relative to which this control's element is to be positioned.
 * @fires {ContextControl#event:create} If this is the first time this ContextControl is opened.
 * @throws {ReferenceError} If offsetElement is not defined.
 */
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
	IE9Compatibility.removeClass(controlElement, ContextControl.dialogueClosedClassName);
	
	
	// Position control.
	this.position();
	
	// Register for resize events (for re-positioning).
	window.addEventListener('resize', this, false);
	
	
	// Finish opening sequence.
	IE9Compatibility.addClass(controlElement, ContextControl.dialogueOpenedClassName);
	
	return controlElement;
};


/**
 * Evaluates the percentage of the viewport this control's backing element occupies, and enters/exits mobile view state
 * as necessary. If not in mobile view state, the element's left and top CSSStyleDeclaration properties will be set based
 * upon the position of the current offsetElement (last passed to {@link ContextControl#open}) and the offset properties
 * of this control ({@link ContextControl#horizontalOffset}, {@link ContextControl#verticalOffset}).
 */
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
	if (areaRatio >= ContextControl.mobileThresholdRatio) {
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
		proposedLeft = offset.x + this.horizontalOffset;
		proposedTop = offset.y + offsetElement.offsetHeight + this.verticalOffset;
		
		// Place dialogue along right edge of screen if placing it at proposed left would extend beyond the screen's width, otherwise proposed left.
		controlElement.style.left = (proposedLeft + dialogueWidth > window.innerWidth ? window.innerWidth - dialogueWidth - (window.outerWidth - window.innerWidth) : proposedLeft) + 'px';
		// Place dialogue along bottom of screen if placing it at proposed top would extend beyond the screens height, otherwise proposed height.
		controlElement.style.top = (proposedTop + dialogueHeight > window.innerHeight ? Math.max(0, window.innerHeight - dialogueHeight) : proposedTop) + 'px';
	}
	
};

/**
 * Closes this ContextControl. The {@link ContextControl.dialogueOpenedClassName} will be removed from this
 * controls backing element, mobile view state will be exited (if currently active), this class will remove
 * itself as a listener for window resize events, and finally, the {@link ContextControl.dialogueClosedClassName}
 * will be added to the backing element.
 */
ContextControl.prototype.close = function () {
	'use strict';
	
	var controlElement, mobileViewState;
	
	controlElement = this.controlElement;
	
	if (!controlElement) {
		return;
	}
	
	IE9Compatibility.removeClass(controlElement, ContextControl.dialogueOpenedClassName);
	
	
	if (mobileViewState = this.mobileViewState) {
		mobileViewState.restoreDefaultView();
		this.mobileViewState = null;
	}
	
	window.removeEventListener('resize', this, false);
	
	
	IE9Compatibility.addClass(controlElement, ContextControl.dialogueClosedClassName);
};


/**
 * Returns this controls backing HTMLDivElement for this control provided it has been {@link ContextControl#open opened} and is
 * not {@link ContextControl#dispose disposed}, otherwise null.
 *
 * @returns Backing HTMLDivElement provided this control has been opened and is not disposed.
 */
ContextControl.prototype.getControlElement = function () {
	'use strict';
	
	return this.controlElement;
};







// Nested Types
/**
 * 
 * @constructor
 * @private
 * @param {HTMLElement} controlElement ContextControl backing element.
 * @classdesc
 *		Maintains the information necessary for entering and exiting 'mobile view' state. Used internally
 *		by ContextControl.
 */
ContextControl.MobileViewState = function (controlElement) {
	'use strict';
	
	
	this.controlElement = controlElement;
	this.initialWidth = controlElement.offsetWidth;
	this.initialHeight = controlElement.offsetHeight;
	this.scrollX = ContextControl.getWindowScrollX();
	this.scrollY = ContextControl.getWindowScrollY();
};

/**
 * Performs viewport/classname assignment operations necessary to enter mobile view state.
 *
 * @package
 */
ContextControl.MobileViewState.prototype.setupMobileView = function () {
	'use strict';
	
	var controlElement, controlStyle;
	
	controlElement = this.controlElement;
	controlStyle = controlElement.style;
	
	controlStyle.removeProperty('left');
	controlStyle.removeProperty('top');
	
	IE9Compatibility.addClass(controlElement, ContextControl.mobileViewClassName);
	IE9Compatibility.addClass(document.body, ContextControl.mobileViewClassName);
	
	window.scrollTo(0, 0);
};

/**
 * Performs viewport/classname assignment operations necessary to exit mobile view state.
 *
 * @package
 */
ContextControl.MobileViewState.prototype.restoreDefaultView = function () {
	'use strict';
	
	var controlElement;
	
	controlElement = this.controlElement;
		
	IE9Compatibility.removeClass(controlElement, ContextControl.mobileViewClassName);
	IE9Compatibility.removeClass(document.body, ContextControl.mobileViewClassName);
	
	window.scrollTo(this.scrollX, this.scrollY);
};



/**
 * Generic class representing the x, y viewport offset coordinates of an HTMLElement.
 *
 * @constructor
 * @see ContextControl.getOffset
 */
ContextControl.OffsetCoordinates = function () {
	'use strict';
	
	/**
	 * Offset x (left) coordinate.
	 */
	this.x = 0;
	
	/**
	 * Offset y (top) coordinate.
	 */
	this.y = 0;
};
