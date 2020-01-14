
function XMLWriter() {
	'use strict';
	
	this.stack = [];
	this.text = '';
	this.state = XMLWriter.STATE_INITIAL;
}

XMLWriter.STATE_INITIAL = 0;
XMLWriter.STATE_TAG = 1;
XMLWriter.STATE_CONTENT = 2;


XMLWriter.ESCAPE_CHARACTER_MAPPING = {
	'"' : '&quot;'
	, '&': '&amp;'
	, "'": '&apos;'
	, '<': '&lt;'
	, '>': '&gt;'
};

XMLWriter.escape = function (val) {
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
		result += XMLWriter.ESCAPE_CHARACTER_MAPPING[match[0]];
		index = re.lastIndex;
	}
	result += val.substring(index);
	
	return result;
	
};


XMLWriter.prototype.startTag = function (name) {
	'use strict';
	
	var tag;
	
	if (this.state == XMLWriter.STATE_TAG) {
		this.text += '>';
	}
	
	tag = XMLWriter.escape(name);
	
	this.text += '<' + tag;
	this.state = XMLWriter.STATE_TAG;
	
	this.stack.push(tag);
	
	return this;
};

XMLWriter.prototype.attribute = function (name, value) {
	'use strict';
	
	var attributeName, attributeValue;
	
	if (this.state != XMLWriter.STATE_TAG) {
		throw new Error('Invalid state.');
	}
	
	attributeName = XMLWriter.escape(name);
	
	if (value) {
		attributeValue = XMLWriter.escape(value);
		this.text += ' ' + attributeName + '="' + attributeValue + '"';
	} else {
		this.text += ' ' + attributeName;
	}
	
	return this;
};

XMLWriter.prototype.content = function (value) {
	'use strict';
	
	if (this.state == XMLWriter.STATE_TAG) {
		this.text += '>';
	}
	
	this.text += XMLWriter.escape(value);
	this.state = XMLWriter.STATE_CONTENT;
	
	return this;
};

XMLWriter.prototype.closeTag = function (requiresBody) {
	'use strict';
	
	var stack, name, state;
	
	stack = this.stack;
	if (!stack.length) {
		throw new Error('Invalid state.');
	}
	
	name = stack.pop();
	state = this.state;
	
	
	if (requiresBody) {
		if (state === XMLWriter.STATE_TAG) {
			this.text += '>';
		}
		this.text += '</' + name + '>';
	} else if (state === XMLWriter.STATE_CONTENT) {
		this.text += '</' + name + '>';
	} else if (state === XMLWriter.STATE_TAG) {
		this.text += ' />';
	} else {
		throw new Error('Invalid state.');
	}
	
	this.state = stack.length ? XMLWriter.STATE_CONTENT : XMLWriter.STATE_INITIAL;
	
	return this;
};

XMLWriter.prototype.clear = function () {
	'use strict';
	
	this.text = '';
};

XMLWriter.prototype.toString = function () {
	'use strict';
	
	return this.text;
};
