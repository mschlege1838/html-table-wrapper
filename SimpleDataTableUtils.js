

/**
 * Not actually a constructor as there are no instance methods; underlying definition is an empty object.
 * Documented as a class for the purposes of this documentation generator only.
 *
 * @class
 * @classdesc
 *
 * Constants for the {@link SimpleDataTable} utility package.
 */
var SimpleDataTableUtils = {};

/**
 * Indicates the values cells within a column should be considered to be text only, and can be directly processed.
 *
 * @type {number}
 * @const
 */
SimpleDataTableUtils.COLUMN_TYPE_TEXT = 1;

/**
 * Indicates the values of cells within a column should be inferred, and converted to an appropriate underlying type
 * prior to processing.
 *
 * @type {number}
 * @const
 */
SimpleDataTableUtils.COLUMN_TYPE_INFER = 2;


/**
 * Bit flag indicating only cells containing a specified value should remain after a filtering operation.
 *
 * @type {number}
 * @const
 */
SimpleDataTableUtils.FILTER_OP_CONTAINS = 1;
/**
 * Bit flag indicating only cells with a value equal to a specified value should remain after a filtering operation.
 *
 * @type {number}
 * @const
 */
SimpleDataTableUtils.FILTER_OP_EQUALS = 1 << 1;
/**
 * Bit flag indicating only cells with a value less than a specified value should remain after a filtering operation.
 *
 * @type {number}
 * @const
 */
SimpleDataTableUtils.FILTER_OP_LESS_THAN = 1 << 2;
/**
 * Bit flag indicating only cells with a value greater than a specified value should remain after a filtering operation.
 *
 * @type {number}
 * @const
 */
SimpleDataTableUtils.FILTER_OP_GREATER_THAN = 1 << 3;
/**
 * Bit flag indicating string-type comparisons during a filtering operation should ignore case.
 *
 * @type {number}
 * @const
 */
SimpleDataTableUtils.FILTER_FLAG_IGNORE_CASE = 1 << 4;
/**
 * Bit flag indicating the requested filtering operation should be logically negated. E.g. Equals => Not Equals, Greater
 * Than => Less Than Or Equal To, Less Than Or Equal To => Greater Than, etc.
 */
SimpleDataTableUtils.FILTER_FLAG_NOT = 1 << 5;


/**
 * Utility function for obtaining a number from the given `val`. If the given `val` is, itself, a number, it
 * is simply returned. If not, it is treated as a string, and parsed as an integer if it contains only digits,
 * or as a float if it contains a decimal point and/or scientific E-notation exponents. If `val` is not numeric 
 * and not parsable as a number, it is returned as-is if strict is `false`, or `NaN` is returned if strict is `true`.
 *
 * @private
 * @param {(string|number)} val Value to be converted to a number.
 * @param {boolean} [strict=false] Whether to return `NaN` if `val` is not a number, or simply to return `val` itself.
 */
SimpleDataTableUtils.getNumber = function (val, strict) {
	'use strict';
	
	if (typeof val === 'number') {
		return val;
	}
	
	if (/^\d+$/.test(val)) {
		return IEGeneralCompatibility.parseInt(val);
	} else if (/^\d+(?:\.\d*)?(?:[eE]\d*)?$/.test(val)) {
		return IEGeneralCompatibility.parseFloat(val);
	} else {
		return strict ? Number.NaN : val;
	}
	
};


SimpleDataTableUtils.shouldInclude = function (columnValue, operator, compareValue, columnType) {
	'use strict';
	
	var convertedColumnValue, convertedCompareValue, negated, simpleFlags, textColumnValue, textCompareValue;
	
	// Convert values.
	switch (columnType) {
		case SimpleDataTableUtils.COLUMN_TYPE_TEXT:
			convertedColumnValue = String(columnValue);
			convertedCompareValue = String(compareValue);
			break;
		case SimpleDataTableUtils.COLUMN_TYPE_INFER:
		default:
			convertedColumnValue = SimpleDataTableUtils.getNumber(columnValue, false);
			convertedCompareValue = SimpleDataTableUtils.getNumber(compareValue, false);
			break;
	}
	
	// Perform comparisons.
	negated = operation & SimpleDataTableUtils.FILTER_FLAG_NOT;
	
	// 'Simple' comparisons. 
	simpleFlags = operation & (SimpleDataTableUtils.FILTER_OP_EQUALS | SimpleDataTableUtils.FILTER_OP_LESS_THAN | SimpleDataTableUtils.FILTER_OP_GREATER_THAN);
	if (simpleFlags) {
		// Handle negation
		if (negated) {
			simpleFlags = ~simpleFlags;
		}
		
		// Do Compare.
		if (simpleFlags & SimpleDataTableUtils.FILTER_OP_EQUALS) {
			if (convertedColumnValue == convertedCompareValue) {
				return true;
			}
		}
		
		if (simpleFlags & SimpleDataTableUtils.FILTER_OP_LESS_THAN) {
			if (convertedColumnValue < convertedCompareValue) {
				return true;
			}
		}
		
		if (simpleFlags & SimpleDataTableUtils.FILTER_OP_GREATER_THAN) {
			if (convertedColumnValue > convertedCompareValue) {
				return true;
			}
		}
	}
	
	
	// Contains comparison.
	if (operation & SimpleDataTableUtils.FILTER_OP_CONTAINS) {
		textColumnValue = String(columnValue);
		textCompareValue = String(compareValue);
		
		if (operation & SimpleDataTableUtils.FILTER_FLAG_IGNORE_CASE) {
			textColumnValue = textColumnValue.toUpperCase();
			textCompareValue = textCompareValue.toUpperCase();
		}
		
		if (textColumnValue.indexOf(textCompareValue) !== -1) {
			return !negated;
		}
	}
	
	
	// Default case.
	return false;
};


SimpleDataTableUtils.doCompare = function (aVal, bVal, columnType) {
	'use strict';
	
	var aNum, aNaN, bNum, bNaN;
	
	
	switch (columnType) {
		case SimpleDataTableUtils.COLUMN_TYPE_INFER:
			aNum = SimpleDataTableUtils.getNumber(aVal, true);
			aNaN = IEGeneralCompatibility.isNaN(aNum);
			bNum = SimpleDataTableUtils.getNumber(bVal, true);
			bNaN = IEGeneralCompatibility.isNaN(bNum);
			
			if (aNaN && bNaN) {
				return aVal < bVal ? -1 : (aVal > bVal ? 1 : 0);
			}
			
			if (aNaN) {
				return 1;
			}
			
			if (bNaN) {
				return -1;
			}
			
			return aNum - bNum;
		case SimpleDataTableUtils.COLUMN_TYPE_TEXT:
			return aVal < bVal ? -1 : (aVal > bVal ? 1 : 0);
	}
	
	return 0;
};