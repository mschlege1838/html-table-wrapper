
// Constructor
/**
 * @constructor
 * @param {boolean} [useArray=false] Whether to maintain the underlying string as an Array. If false, will use string concatenation.
 * @classdesc
 * 		<p>Simplistic implementation of a builder for XML strings. All tags, attributes, attribute values and content
 *		have reserved characters replaced with their corresponding XML entity, regardless if such replacement is explicitly
 *		necessary (with the exception of calls to {@link XMLBuilder#appendDirect} in which the given value is appended as-is).</p>
 *
 *		<p>By default, the underlying data is maintained using string concatenation, however if the execution environment
 *		handles array-based concatenation more efficiently, passing the value true to this constructor enables this.</p>
 *
 *		<p>This implementation is state-based, and therefore, not thread-safe.</p>
 */
function XMLBuilder(useArray) {
	'use strict';
	
	this.stack = [];
	this.state = XMLBuilder.STATE_INITIAL;
	
	this.useArray = !!useArray;
	this.text = useArray ? [] : ''
}

// Static fields
/**
 * Initial state constant.
 *
 * @const
 * @private
 */
XMLBuilder.STATE_INITIAL = 0;

/**
 * Within tag (i.e. attribute definitions) state constant.
 *
 * @const
 * @private
 */
XMLBuilder.STATE_TAG = 1;

/**
 * Between tag state constant.
 *
 * @const
 * @private
 */
XMLBuilder.STATE_CONTENT = 2;

/**
 * Mapping between reserved characters and thier replacement XML entities.
 *
 * @const
 * @private
 */
XMLBuilder.ESCAPE_CHARACTER_MAPPING = {
	'"' : '&quot;'
	, '&': '&amp;'
	, "'": '&apos;'
	, '<': '&lt;'
	, '>': '&gt;'
};


// Static methods
/**
 * Replaces all occurences of XML reserved characters in val with their corresponding XML entity.
 *
 * @param {string} val Value to escape.
 * @returns {string} The given value with XML reserved characters replaced with their corresponding entities.
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
 * tag. Calling {@link XMLBuilder#content} will close this tag opening (i.e. append the '>' character),
 * and begin defining the content of this tag's body. Calling {@link XMLBuilder#startTag} again will
 * also close this tag's opening, but start another tag as a child of this tag.
 *
 * @param {string} name Name of this tag.
 * @returns {XMLBuilder} This XMLBuilder.
 */
XMLBuilder.prototype.startTag = function (name) {
	'use strict';
	
	var tag, useArray;
	
	useArray = this.useArray;
	
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
 * Adds an attribute with the given name and, optionally, the given value to the current tag. If no value is specified,
 * the given attribute is added as a 'boolean' attribute (i.e. no equals sign). If not called subsequent to a call to
 * {@link XMLBuilder#startTag}, an Error will be thrown.
 *
 * @param {string} name Attribute name to add.
 * @param {string} [value=''] Attribute value.
 * @returns {XMLBuilder} This XMLBuilder.
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
 * Defines content (i.e. text) for the current tag.
 *
 * @param {string} value Content to append to the current tag's content.
 * @returns {XMLBuilder} This XMLBuilder.
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
 * Closes the current tag. If the tag has content, or requiresBody is true, will close in the 'traditional' manner
 * (i.e. '</tagName>'), otherwise will close as a no-body tag (i.e. ' />'). If there is no current tag, will throw
 * an Error.
 *
 * @param {boolean} [requiresBody=false] Whether the tag being closed requires a body.
 * @returns {XMLBuilder} This XMLBuilder.
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
 * Appends the given value directly to this XMLBuilder without reserved character escaping or concern for
 * this builders current state.
 *
 * @param {string} value Value to append.
 * @returns {XMLBuilder} This XMLBuilder.
 */
XMLBuilder.prototype.appendDirect = function (val) {
	'use strict';
	
	if (this.useArray) {
		this.text.push(val);
	} else {
		this.text += val;
	}
	
	return this;
};

/**
 * Clears this XMLBuilder.
 */
XMLBuilder.prototype.clear = function () {
	'use strict';
	
	if (this.useArray) {
		this.text = []
	} else {
		this.text = '';
	}
	
};

/**
 * Returns this XMLBuilder's current content as a string.
 *
 * @returns {string} This XMLBuilder's content.
 */
XMLBuilder.prototype.toString = function () {
	'use strict';
	
	return this.useArray ? this.text.join('') : this.text;
};



