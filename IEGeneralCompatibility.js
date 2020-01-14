
function IEGeneralCompatibility() {
	'use strict';
	
}

IEGeneralCompatibility.parseInt = function (val) {
	'use strict';
	
	if (typeof Number.parseInt === 'function') {
		return Number.parseInt(val);
	}
	
	return parseInt(val);
};

IEGeneralCompatibility.parseFloat = function (val) {
	'use strict';
	
	if (typeof Number.parseFloat === 'function') {
		return Number.parseFloat(val);
	}
	
	return parseFloat(val);
};

IEGeneralCompatibility.isNaN = function (val) {
	'use strict';
	
	if (typeof Number.isNaN === 'function') {
		return Number.isNaN(val);
	}
	
	return val !== val;
};