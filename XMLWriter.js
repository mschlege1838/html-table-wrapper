
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
	
	let re = /["&'<>]/g;
	if (!re.test(val)) {
		return val;
	}
	re.lastIndex = 0;
	
	let index = 0;
	let match = null;
	let result = '';
	
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
	
	if (this.state == XMLWriter.STATE_TAG) {
		this.text += '>';
	}
	
	let tag = XMLWriter.escape(name);
	
	this.text += `<${tag}`;
	this.state = XMLWriter.STATE_TAG;
	
	this.stack.push(tag);
	
	return this;
};

XMLWriter.prototype.attribute = function (name, value) {
	'use strict';
	
	if (this.state != XMLWriter.STATE_TAG) {
		throw new Error('Invalid state.');
	}
	
	let attributeName = XMLWriter.escape(name);
	
	if (value) {
		let attributeValue = XMLWriter.escape(value);
		this.text += ` ${attributeName}="${attributeValue}"`;
	} else {
		this.text += ` ${attributeName}`;
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

XMLWriter.prototype.closeTag = function () {
	'use strict';
	
	let stack = this.stack;
	if (!stack.length) {
		throw new Error('Invalid state.');
	}
	
	let name = stack.pop();
	
	switch (this.state) {
		case XMLWriter.STATE_TAG:
			this.text += ' />';
			break;
		case XMLWriter.STATE_CONTENT:
			this.text += `</${name}>`;
			break;
	}
	
	this.state = stack.length ? XMLWriter.STATE_CONTENT : XMLWriter.STATE_INITIAL;
	
	return this;
};
