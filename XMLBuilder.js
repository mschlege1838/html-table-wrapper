
function XMLBuilder(useArray) {
	'use strict';
	
	this.stack = [];
	this.state = XMLBuilder.STATE_INITIAL;
	
	this.useArray = !!useArray;
	this.text = useArray ? [] : ''
}

XMLBuilder.STATE_INITIAL = 0;
XMLBuilder.STATE_TAG = 1;
XMLBuilder.STATE_CONTENT = 2;


XMLBuilder.ESCAPE_CHARACTER_MAPPING = {
	'"' : '&quot;'
	, '&': '&amp;'
	, "'": '&apos;'
	, '<': '&lt;'
	, '>': '&gt;'
};

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

XMLBuilder.prototype.content = function (value) {
	'use strict';
	
	if (this.state == XMLBuilder.STATE_TAG) {
		this.appendDirect('>');
	}
	
	this.appendDirect(XMLBuilder.escape(value));
	this.state = XMLBuilder.STATE_CONTENT;
	
	return this;
};

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

XMLBuilder.prototype.clear = function () {
	'use strict';
	
	this.appendDirect('');
};

XMLBuilder.prototype.toString = function () {
	'use strict';
	
	return this.useArray ? this.text.join('') : this.text;
};


XMLBuilder.prototype.appendDirect = function (val) {
	'use strict';
	
	if (this.useArray) {
		this.text.push(val);
	} else {
		this.text += val;
	}
	
	return this;
};
