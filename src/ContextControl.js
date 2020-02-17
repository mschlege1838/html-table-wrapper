/*
 * Copyright 2020 Martin F. Schlegel Jr. | MIT AND BSD-3-Clause
 */
 
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
 * names corresponding to when the control is opened or closed. The control also repositions itself when the window is resized.
 * 
 * The first time a control is {@link ContextControl#open opened}, the {@link ContextControl#event:create create} event is fired. It is expected client code
 * will listen for this event and populate the control's element with desired content. The control's element can be obtained in such a listener via
 * `{@link ContextControl#getControlElement event.target.getControlElement()}`.
 * 
 * Upon being {@link ContextControl#open opened}, this class will begin listening for window resize events and {@link ContextControl#position position} itself upon
 * receiving them. Upon being {@link ContextControl#close closed}, this class will stop listening for resize events.
 * 
 * Of note, this class *only* sets element class names, and a limited set of CSS properties; most styling should be handled by dedicated stylesheets. The following is a baseline
 * stylesheet that uses the default class names:
 *
 * ``` css
 * .context-control {
 *     position: absolute;
 *     opacity: 0;
 *     color: black;
 *     background-color: white;
 *     border: 1px solid black;
 *     padding: .5em;
 * }
 * 
 * .context-control.context-control-opened {
 *     opacity: 1;
 *     transition: opacity .5s;
 * }
 * 
 * .context-control.context-control-closed {
 *     display: none;
 * }
 * ```
 */
function ContextControl(horizontalOffset, verticalOffset) {
    'use strict';
    
    SimpleEventDispatcher.call(this);
    
    /**
     * The offset in pixels to be applied to the `left` `CSSStyleDeclaration` of this control's element with respect
     * to the current offset element (last passed to {@link ContextControl#open}).
     *
     * @type {number}
     */
    this.horizontalOffset = horizontalOffset !== 0 && !horizontalOffset ? ContextControl.defaultHorizontalOffset : horizontalOffset;
    
    /**
     * The offset in pixels to be applied to the `top` `CSSStyleDeclaration` of this control's element with respect
     * to the current offset element (last passed to {@link ContextControl#open}).
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
 * Default horizontal offset in pixels. Default value is `10`.
 *
 * @type {number}
 */
ContextControl.defaultHorizontalOffset = 10;

/**
 * Default vertical offset in pixels. Default value is `10`.
 *
 * @type {number}
 */
ContextControl.defaultVerticalOffset = 10;



// Static Methods
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
    ContextControl._getOffset(el, result);
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
ContextControl.prototype = IE8Compatibility.extend(SimpleEventDispatcher.prototype);




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
 * the control element, it will be {@link ContextControl#position positioned} relative to the given `offsetElement`, this
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
    IE8Compatibility.removeClass(controlElement, ContextControl.dialogueClosedClassName);
    
    
    // Position control.
    this.position();
    
    // Register for resize events (for re-positioning).
    IE8Compatibility.addEventListener(window, 'resize', this, false);
    
    // Finish opening sequence.
    IE8Compatibility.addClass(controlElement, ContextControl.dialogueOpenedClassName);
    
};


/**
 * Positions this control. The `left` and `top` 
 * `CSSStyleDeclaration` properties will be set based upon the position of the current offset element (last passed to {@link ContextControl#open})
 * and the {@link ContextControl#horizontalOffset} and {@link ContextControl#verticalOffset} properties of this control.
 */
ContextControl.prototype.position = function () {
    'use strict';
    
    var controlElement, offset,  proposedLeft, proposedTop,  offsetElement;
    
    offsetElement = this.offsetElement;
    controlElement = this.controlElement;
    if (!offsetElement || !controlElement) {
        return;
    }
    
    // Calculate offset of offset element.
    offset = ContextControl.getOffset(offsetElement);
    
    // Calculate proposed dialogue coordinates relative to offset element.
    controlElement.style.left = (offset.x + this.horizontalOffset) + 'px';
    controlElement.style.top = (offset.y + offsetElement.offsetHeight + this.verticalOffset) + 'px';
};

/**
 * Closes this `ContextControl`. The {@link ContextControl.dialogueOpenedClassName} will be removed from this
 * control's backing element, this `ContextControl` will remove
 * itself as a listener for window resize events, and finally, the {@link ContextControl.dialogueClosedClassName}
 * will be added to the backing element.
 */
ContextControl.prototype.close = function () {
    'use strict';
    
    var controlElement;
    
    controlElement = this.controlElement;
    
    if (!controlElement) {
        return;
    }
    
    IE8Compatibility.removeClass(controlElement, ContextControl.dialogueOpenedClassName);
    
    IE8Compatibility.removeEventListener(window, 'resize', this, false);
    
    IE8Compatibility.addClass(controlElement, ContextControl.dialogueClosedClassName);
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

// OffsetCoordinates
/**
 * Default constructor. Coordinates are initialized to 0; returned by {@link ContextControl.getOffset}.
 *
 * @private
 * @constructor
 * @classdesc
 *
 * Generic class representing the x, y window offset coordinates of an `HTMLElement`.
 *
 */
ContextControl.OffsetCoordinates = function () {
    'use strict';
    
    /**
     * Offset x (`left`) coordinate.
     */
    this.x = 0;
    
    /**
     * Offset y (`top`) coordinate.
     */
    this.y = 0;
};