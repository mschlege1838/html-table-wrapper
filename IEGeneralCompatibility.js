
/**
 * Not actually a constructor as there are no instance methods; underlying definition is an empty object.
 * Documented as a class for the purposes of this documentation generator only.
 *
 * @class
 * @classdesc
 *
 * Utility functions for general MS Internet Explorer compatibility.
 */
var IEGeneralCompatibility = {};

/**
 * Adds compatibility for the `Number.parseInt` function. Added only for ECMA2015 modularization purposes;
 * simply falls back to the global `parseInt` function if `Number.parseInt` is not defined.
 *
 * @param {string} val Value to be parsed.
 * @returns {number} The integer representation of the given `val`, or `NaN` if `val` cannot be parsed.
 */
IEGeneralCompatibility.parseInt = function (val) {
	'use strict';
	
	if (typeof Number.parseInt === 'function') {
		return Number.parseInt(val);
	}
	
	return parseInt(val);
};

/**
 * Adds compatibility for the `Number.parseFloat` function. Added only for ECMA2015 modularization purposes;
 * simply falls back to the global `parseFloat` function if `Number.parseFloat` is not defined. 
 *
 * @param {string} val Value to be parsed.
 * @returns {number} The floating point representation of the given `val`, or `NaN` if `val` cannot be parsed.
 */
IEGeneralCompatibility.parseFloat = function (val) {
	'use strict';
	
	if (typeof Number.parseFloat === 'function') {
		return Number.parseFloat(val);
	}
	
	return parseFloat(val);
};

/**
 * Adds compatibility for the `Number.isNaN` function.
 *
 * @param {*} val Value to be tested.
 */
IEGeneralCompatibility.isNaN = function (val) {
	'use strict';
	
	if (typeof Number.isNaN === 'function') {
		return Number.isNaN(val);
	}
	
	return val !== val;
};
