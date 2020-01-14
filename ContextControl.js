
// Virtual Events
/**
 * Fired the first time a `ContextControl` is {@link ContextControl#open opened}. The `target` and `currentTarget`
 * properties of the event are set to the `ContextControl` being opened. The control's backing element can be obtained via
 * {@link ContextControl#getControlElement}.
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
 *
 * Simple implementation of an HTML DOM based context control. This class (lazily) creates a blank `HTMLDivElement` to hold the control's content, and applies class
 * names corresponding to when the control is opened, closed or should take on the 'mobile view' state.
 * 
 * The first time this control is {@link ContextControl#open opened}, the {@link ContextControl#event:create create} event is fired. It is expected client code
 * will listen for this event and populate the control element with desired content. The control element can be obtained in such a listener via
 * `{@link ContextControl#getControlElement event.target.getControlElement()}`.
 * 
 * The control enters and exits 'mobile view' state based upon the percentage of the viewport its backing element occupies. When not in the mobile view state, the `left` and
 * `top` `CSSStyleDeclaration` properties of the control's backing element are set based upon the offset element last passed to the {@link ContextControl#open} function,
 * as well as the {@link ContextControl#horizontalOffset} and {@link ContextControl#verticalOffset} properties. When in the mobile view state, the `left` and `top` properties
 * are removed from the element's `CSSStyleDeclaration`, and the class name {@link ContextControl.mobileViewClassName} is added to the element as well as `document.body`. When
 * the control exists mobile view state, the class name is removed (from both the element and `document.body`), and the `left` and `top` CSS properties are re-set in the manner
 * stated previously.
 * 
 * **TODO Transition from non-mobile to mobile view state if multiple `ContextControl`s are opened**
 *
 * Upon being {@link ContextControl#open opened}, this class will begin listening for window resize events and {@link ContextControl#position position} itself upon
 * receiving them. Upon being {@link ContextControl#close closed}, this class will stop listening for resize events.
 * 
 * Of note, this class *only* sets element class names, and a limited set of CSS properties; most styling should be handled by dedicated stylesheets. A baseline 
 * stylesheet is provided at **TODO default style link here**.
 */
function ContextControl(horizontalOffset, verticalOffset) {
	'use strict';
	
	SimpleEventDispatcher.call(this);
	
	/**
	 * The offset in pixels to be applied to the `left` `CSSStyleDeclaration` of this control's element with respect
	 * to the current offset element (last passed to {@link ContextControl#open}) when not in mobile view state.
	 *
	 * @type {number}
	 */
	this.horizontalOffset = horizontalOffset !== 0 && !horizontalOffset ? ContextControl.defaultHorizontalOffset : horizontalOffset;
	
	/**
	 * The offset in pixels to be applied to the `top` `CSSStyleDeclaration` of this control's element with respect
	 * to the current offset element (last passed to {@link ContextControl#open}) when not in mobile view state.
	 *
	 * @type {number}
	 */
	this.verticalOffset = verticalOffset !== 0 && !verticalOffset ? ContextControl.defaultVerticalOffset : verticalOffset;
}


// Static Fields
/**
 * Name of the event fired the first time a `ContextControl` is opened. Value is `'create'`.
 *
 * @const
 * @private
 * @type {string}
 */
ContextControl.EVENT_TYPE_CREATE = 'create';

/**
 * Class name assigned to `ContextControl` elements when they are first created. Default value is `'context-control'`.
 *
 * @type {string}
 */
ContextControl.contextElementClassName = 'context-control';

/**
 * Class name added to `ContextControl` elements when {@link ContextControl#open} is called. Removed when {@link ContextControl#close}
 * is called. Default value is `'context-control-opened'`.
 *
 * @type {string}
 */
ContextControl.dialogueOpenedClassName = 'context-control-opened';

/**
 * Class name added to `ContextControl` elements when {@link ContextControl#close} is called. Removed when {@link ContextControl#open}
 * is called. Default value is `'context-control-closed'`.
 *
 * @type {string}
 */
ContextControl.dialogueClosedClassName = 'context-control-closed';

/**
 * Class name added to control elements when the mobile view state is entered. Default value is `'context-control-mobile-view'`.
 * 
 * @type {string}
 */
ContextControl.mobileViewClassName = 'context-control-mobile-view';

/**
 * Decimal percentage of the screen a `ContextControl`'s element should occupy to trigger entry into mobile view state. Default value
 * is 0.35.
 *
 * @type {number}
 */
ContextControl.mobileThresholdRatio = 0.35;

/**
 * Default horizontal offset in pixels. Default value is 10.
 *
 * @type {number}
 */
ContextControl.defaultHorizontalOffset = 10;

/**
 * Default vertical offset in pixels. Default value is 10.
 *
 * @type {number}
 */
ContextControl.defaultVerticalOffset = 10;



// Static Methods
/**
 * Utiltiy function to obtain how far right the window is scrolled.
 *
 * @private
 * @returns {number} How far right the window is scrolled.
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
 * @private
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
 * @private
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
 * @private
 * @param {HTMLElement} el Element whose viewport offset is to be calculated.
 * @returns {ContextControl.OffsetCoordinates} Coordinates of the given element's viewport offset.
 */
ContextControl.getOffset = function (el) {
	'use strict';
	
	var result = new ContextControl.OffsetCoordinates();
	ContextControl._getOffset(el, coordinates);
	return result;
};

/**
 * Recursive helper for {@link ContextControl.getOffset}.
 *
 * @private
 * @param {HTMLElement} el Current element.
 * @param {ContextControl.OffsetCoordinates} coordinates Coordinates being processed.
 */
ContextControl._getOffset = function (el, coordinates) {
	'use strict';
	
	if (el == null) {
		return;
	}
	
	coordinates.x += el.offsetLeft;
	coordinates.y += el.offsetTop;
	ContextControl._getOffset(el.offsetParent, coordinates);
};




// Extension
ContextControl.prototype = Object.create(SimpleEventDispatcher.prototype);




// Default Instance Properties
/**
 * The underlying `HTMLDivElement` defining this control's content. Initially `null`; created/assigned the first time
 * {@link ContextControl#open} is called.
 *
 * @private
 * @type {HTMLDivElement}
 */
ContextControl.prototype.controlElement = null;

/**
 * Element relative to which this {@link ContextControl#controlElement} is to be positioned. Passed and stored
 * on calls to {@link ContextControl#open}.
 *
 * @private
 * @type {HTMLElement}
 */
ContextControl.prototype.offsetElement = null;

/**
 * Current mobile view state information. `null` if this `ContextControl` is not in mobile view state.
 *
 * @private
 * @type {ContextControl.MobileViewState}
 */
ContextControl.prototype.mobileViewState = null;


// Instance Methods
/**
 * Disposes this `ContextControl` by {@link ContextControl#close closing} it and detaching the backing
 * control element, if present.
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
 * Implementation of DOM `EventListener`.
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
 * Opens this `ContextControl`. If this is the first time the control is opened, the {@link ContextControl#event:create create} event will be fired, where it is
 * expected client code will populate the control with desired content. In any case, the {@link ContextControl.dialogueClosedClassName} class will be removed from
 * the control element, it will be {@link ContextControl#position positioned} relative to the given `offsetElement` (or mobile view state will be entered), this
 * `ContextControl` will add itself as a listener for window resize events, and finally, the {@link ContextControl.dialogueOpenedClassName} class will be added to
 * the control element.
 *
 * @param {HTMLElement} offsetElement Element relative to which this control's element is to be positioned.
 * @fires ContextControl#event:create
 * @throws {ReferenceError} If `offsetElement` is not defined.
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
 * Evaluates the percentage of the viewport this control's backing element occupies, and enters/exits mobile view state as necessary, based upon
 * {@link ContextControl.mobileThresholdRatio}. If it is determined mobile view state should not be entered, the element's `left` and `top` 
 * `CSSStyleDeclaration` properties will be set based upon the position of the current offset element (last passed to {@link ContextControl#open})
 * and the {@link ContextControl#horizontalOffset} and {@link ContextControl#verticalOffset} properties of this control. If it is determined mobile
 * view state should be entered, the {@link ContextControl.mobileViewClassName} class is added to both the element and  `document.body`, and the 
 * `left` and `top` CSS properties are removed from the element.
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
 * Closes this `ContextControl`. The {@link ContextControl.dialogueOpenedClassName} will be removed from this
 * control's backing element, mobile view state will be exited (if currently active), this `ContextControl` will remove
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
 * Returns this control's backing `HTMLDivElement` provided it has been {@link ContextControl#open opened} and is
 * not {@link ContextControl#dispose disposed}, otherwise `null`.
 *
 * @returns Backing `HTMLDivElement` provided this control has been opened and is not disposed.
 */
ContextControl.prototype.getControlElement = function () {
	'use strict';
	
	return this.controlElement;
};








// Nested Types
// MobileViewState
/**
 * 
 * @constructor
 * @private
 * @param {HTMLElement} controlElement The backing element for the `ContextControl` being processed.
 * @classdesc
 *
 * Maintains the information necessary for entering and exiting 'mobile view' state. Used internally
 * by {@link ContextControl}.
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
 * Performs `CSSStyleDeclaration`/classname assignments necessary to enter mobile view state.
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
 * Performs `CSSStyleDeclaration`/classname assignments necessary to exit mobile view state.
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


// OffsetCoordinates
/**
 * Default constructor. Coordinates are initialized to 0; returned by {@link ContextControl.getOffset}.
 *
 * @private
 * @constructor
 * @classdesc
 *
 * Generic class representing the x, y viewport offset coordinates of an `HTMLElement`.
 *
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
