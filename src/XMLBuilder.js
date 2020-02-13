
// Constructor
/**
 * Default constructor.
 *
 * @constructor
 * @classdesc
 *
 * Simplistic implementation of a builder for XML strings. The values for all tags, attributes, attribute values and content
 * have reserved characters replaced with their corresponding XML entity, regardless if such replacement is explicitly
 * necessary (with the exception of calls to {@link XMLBuilder#appendDirect} in which the given value is appended to the
 * underlying data as-is).
 *
 * By default, the underlying data is maintained using string concatenation, however if the execution environment
 * handles `Array`-based concatenation more efficiently, set {@link XMLBuilder.useArray} to `true`.
 *
 * This implementation is state-based, and therefore, not thread-safe.
 */
function XMLBuilder() {
    'use strict';
    
    /**
     * Tag name stack.
     *
     * @private
     * @type {Array}
     */
    this.stack = [];
    
    /**
     * Current state of this `XMLBuilder`. Corresponds to one of the `STATE_*` static members of this class.
     *
     * @private
     * @type {number}
     */
    this.state = XMLBuilder.STATE_INITIAL;
    
    /**
     * The raw text of this `XMLBuilder`. If {@link XMLBuilder.useArray} is `true`, it will be an `Array`, otherwise a `string`.
     *
     * @private
     * @type {(string|Array)}
     */
    this.text = XMLBuilder.useArray ? [] : ''
}

// Static fields
/**
 * Initial state constant.
 *
 * @const
 * @private
 * @type {number}
 */
XMLBuilder.STATE_INITIAL = 0;

/**
 * Within-tag (i.e. attribute definitions) state constant.
 *
 * @const
 * @private
 * @type {number}
 */
XMLBuilder.STATE_TAG = 1;

/**
 * Between-tag state constant.
 *
 * @const
 * @private
 * @type {number}
 */
XMLBuilder.STATE_CONTENT = 2;

/**
 * Mapping between reserved characters and thier replacement XML entities.
 *
 * @const
 * @private
 * @type {object}
 */
XMLBuilder.ESCAPE_CHARACTER_MAPPING = {
    '"' : '&quot;'
    , '&': '&amp;'
    , "'": '&apos;'
    , '<': '&lt;'
    , '>': '&gt;'
};


/**
 * Whether or not to use an `Array` to store the underlying data within `XMLBuilder` instances.
 *
 * @private
 * @type {boolean}
 */
XMLBuilder.useArray = false;

// Static methods
/**
 * Replaces all occurences of XML reserved characters in `val` with their corresponding XML entity.
 *
 * @param {string} val Value to escape.
 * @returns {string} The given `val` with XML reserved characters replaced with their corresponding entities.
 */
XMLBuilder.escape = function (val) {
    'use strict';
    
    var re, index, match, result;
    
    re = /["&'<>]/g;
    if (!re.test(val)) {
        return val;
    }
    re.lastIndex = 0;
    
    index = 0;
    match = null;
    result = '';
    
    while ((match = re.exec(val)) != null) {
        result += val.substring(index, re.lastIndex - 1);
        result += XMLBuilder.ESCAPE_CHARACTER_MAPPING[match[0]];
        index = re.lastIndex;
    }
    result += val.substring(index);
    
    return result;
    
};


// Instance methods
/**
 * Starts an XML tag. Subsequent calls to {@link XMLBuilder#attribute} will define attributes on this
 * tag. Calling {@link XMLBuilder#content} will close this tag opening (i.e. append the '`>`' character),
 * and begin defining the content of this tag's body. Calling {@link XMLBuilder#startTag} again will
 * also close this tag's opening, but start another tag as a child of this tag.
 *
 * @param {string} name Name of the tag to be started.
 * @returns {XMLBuilder} This `XMLBuilder`.
 */
XMLBuilder.prototype.startTag = function (name) {
    'use strict';
    
    var tag;
    
    if (this.state == XMLBuilder.STATE_TAG) {
        this.appendDirect('>');
    }
    
    tag = XMLBuilder.escape(name);
    
    this.appendDirect('<' + tag);
    this.state = XMLBuilder.STATE_TAG;
    
    this.stack.push(tag);
    
    return this;
};

/**
 * Adds an attribute with the given `name` and, optionally, the given `value` to the current tag. If {@link Nothing} is passed for `value`,
 * the given attribute is added as a 'boolean' attribute (i.e. no equals sign). If it is desired an attribute value be explicitly set to
 * a value that is otherwise {@link Nothing}, convert `value` to a string prior to passage to this function.
 *
 * If not called subsequent to a call to {@link XMLBuilder#startTag}, an `Error` will be thrown.
 *
 * @param {string} name Attribute name to add.
 * @param {string} [value=''] Attribute value.
 * @returns {XMLBuilder} This `XMLBuilder`.
 * @throws {Error} If not called subsequent to a call to {@link XMLBuilder#startTag}.
 */
XMLBuilder.prototype.attribute = function (name, value) {
    'use strict';
    
    var attributeName, attributeValue;
    
    if (this.state != XMLBuilder.STATE_TAG) {
        throw new Error('Invalid state.');
    }
    
    attributeName = XMLBuilder.escape(name);
    
    if (value) {
        attributeValue = XMLBuilder.escape(value);
        this.appendDirect(' ' + attributeName + '="' + attributeValue + '"');
    } else {
        this.appendDirect(' ' + attributeName);
    }
    
    return this;
};

/**
 * Adds content (i.e. text) to the current tag.
 *
 * @param {string} value Content to append to the current tag's content.
 * @returns {XMLBuilder} This `XMLBuilder`.
 */
XMLBuilder.prototype.content = function (value) {
    'use strict';
    
    if (this.state == XMLBuilder.STATE_TAG) {
        this.appendDirect('>');
    }
    
    this.appendDirect(XMLBuilder.escape(value));
    this.state = XMLBuilder.STATE_CONTENT;
    
    return this;
};

/**
 * Closes the current tag. If the tag has content, or `requiresBody` is `true`, the tag will be closed in the 'traditional' manner
 * (i.e. '`</tagName>`'), otherwise the tag will be closed as a no-body tag (i.e. '` />`'). If there is no current tag, an `Error`
 * will be thrown.
 *
 * @param {boolean} [requiresBody=false] Whether the tag being closed requires a body.
 * @returns {XMLBuilder} This `XMLBuilder`.
 * @throws {Error} If there is no current tag.
 */
XMLBuilder.prototype.closeTag = function (requiresBody) {
    'use strict';
    
    var stack, name, state;
    
    stack = this.stack;
    if (!stack.length) {
        throw new Error('Invalid state.');
    }
    
    name = stack.pop();
    state = this.state;
    
    
    if (requiresBody) {
        if (state === XMLBuilder.STATE_TAG) {
            this.appendDirect('>');
        }
        this.appendDirect('</' + name + '>');
    } else if (state === XMLBuilder.STATE_CONTENT) {
        this.appendDirect('</' + name + '>');
    } else if (state === XMLBuilder.STATE_TAG) {
        this.appendDirect(' />');
    } else {
        throw new Error('Invalid state.');
    }
    
    this.state = stack.length ? XMLBuilder.STATE_CONTENT : XMLBuilder.STATE_INITIAL;
    
    return this;
};

/**
 * Appends the given `value` directly to this `XMLBuilder` without the escaping of reserved characters, nor concern for
 * this builder's current state.
 *
 * @param {string} value Value to append.
 * @returns {XMLBuilder} This `XMLBuilder`.
 */
XMLBuilder.prototype.appendDirect = function (val) {
    'use strict';
    
    if (XMLBuilder.useArray) {
        this.text.push(val);
    } else {
        this.text += val;
    }
    
    return this;
};

/**
 * Clears this `XMLBuilder`.
 */
XMLBuilder.prototype.clear = function () {
    'use strict';
    
    if (XMLBuilder.useArray) {
        this.text = []
    } else {
        this.text = '';
    }
    
};

/**
 * Returns this `XMLBuilder`'s current content as a string.
 *
 * @returns {string} This `XMLBuilder`'s content.
 */
XMLBuilder.prototype.toString = function () {
    'use strict';
    
    return XMLBuilder.useArray ? this.text.join('') : this.text;
};



