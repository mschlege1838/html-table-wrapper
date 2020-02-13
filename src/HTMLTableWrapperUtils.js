

/**
 * Not actually a constructor as there are no instance methods; underlying definition is an empty object.
 * Documented as a class for the purposes of this documentation generator only.
 *
 * @class
 * @classdesc
 *
 * Extended utility functions and constants for the {@link HTMLTableWrapper} packages.
 */
var HTMLTableWrapperUtils = {};

/**
 * Indicates the values of cells within a column should be considered to be text only, and can be directly processed.
 *
 * @type {number}
 * @const
 */
HTMLTableWrapperUtils.COLUMN_TYPE_TEXT = 1;

/**
 * Indicates the values of cells within a column should be inferred, and converted to an appropriate underlying type
 * prior to processing.
 *
 * @type {number}
 * @const
 */
HTMLTableWrapperUtils.COLUMN_TYPE_INFER = 2;


/**
 * Bit flag indicating only cells containing a specified value should remain after a filtering operation.
 *
 * @type {number}
 * @const
 */
HTMLTableWrapperUtils.FILTER_OP_CONTAINS = 1;
/**
 * Bit flag indicating only cells with a value equal to a specified value should remain after a filtering operation.
 *
 * @type {number}
 * @const
 */
HTMLTableWrapperUtils.FILTER_OP_EQUALS = 1 << 1;
/**
 * Bit flag indicating only cells with a value less than a specified value should remain after a filtering operation.
 *
 * @type {number}
 * @const
 */
HTMLTableWrapperUtils.FILTER_OP_LESS_THAN = 1 << 2;
/**
 * Bit flag indicating only cells with a value greater than a specified value should remain after a filtering operation.
 *
 * @type {number}
 * @const
 */
HTMLTableWrapperUtils.FILTER_OP_GREATER_THAN = 1 << 3;
/**
 * Bit flag indicating string-type comparisons during a filtering operation should ignore case.
 *
 * @type {number}
 * @const
 */
HTMLTableWrapperUtils.FILTER_FLAG_IGNORE_CASE = 1 << 4;
/**
 * Bit flag indicating the requested filtering operation should be logically negated.
 *
 * @type {number}
 * @const
 */
HTMLTableWrapperUtils.FILTER_FLAG_NOT = 1 << 5;


/**
 * Utility function for obtaining a number from the given `val`. If the given `val` is, itself, a number, it
 * is simply returned. If not, it is treated as a string, and parsed as an integer if it contains only digits,
 * or as a float if it contains a decimal point and/or a scientific E-notation exponents. If `val` is not numeric 
 * and not parsable as a number, it is returned as-is if strict is `false`, or `NaN` is returned if strict is `true`.
 *
 * @private
 * @param {(string|number)} val Value to be converted to a number.
 * @param {boolean} [strict=false] Whether to return `NaN` if `val` is not a number, or simply to return `val` itself.
 */
HTMLTableWrapperUtils.getNumber = function (val, strict) {
    'use strict';
    
    if (typeof val === 'number') {
        return val;
    }
    
    if (/^\d+$/.test(val)) {
        return IE8Compatibility.parseInt(val);
    } else if (/^\d+(?:\.\d*)?(?:[eE]\d*)?$/.test(val)) {
        return IE8Compatibility.parseFloat(val);
    } else {
        return strict ? Number.NaN : val;
    }
    
};


/**
 * Utility function to aid in the implementation of {@link FilterDescriptor#include}. Compares the given `cellValue` to the given `compareValue` using
 * the given `operator` and `columnType`.
 *
 * The `operator` is a combination of the operator and flag bitfield constants defined on this class. Namely, it is a combination of one or more of the
 * following operators:
 * - {@link HTMLTableWrapperUtils.FILTER_OP_EQUALS}
 * - {@link HTMLTableWrapperUtils.FILTER_OP_GREATER_THAN}
 * - {@link HTMLTableWrapperUtils.FILTER_OP_LESS_THAN}
 * - {@link HTMLTableWrapperUtils.FILTER_OP_CONTAINS}
 * 
 * And optionally has zero or more of the following flags set:
 * - {@link HTMLTableWrapperUtils.FILTER_FLAG_NOT}
 * - {@link HTMLTableWrapperUtils.FILTER_FLAG_IGNORE_CASE}
 *
 * Comparisons are performed in two distinct steps. The first are the 'simple' comparisons, which correspond to the combination of the relational operator
 * bitfields: {@link HTMLTableWrapperUtils.FILTER_OP_EQUALS}, {@link HTMLTableWrapperUtils.FILTER_OP_LESS_THAN}, and {@link HTMLTableWrapperUtils.FILTER_OP_GREATER_THAN}.
 * The next is the 'contains' comparison (corresponding to the {@link HTMLTableWrapperUtils.FILTER_OP_CONTAINS} bitfield). The 'contains' comparison is only performed
 * if its corresponding flag is set, and the 'simple' (relational) comparisons fail, and/or none of their flags are set. I.e. this function will
 * return `true` on the first (requested) comparison that succeeds, otherwise `false`.
 * 
 * For the 'simple' relational comparisons (outlined above), if `columnType` is {@link HTMLTableWrapperUtils.COLUMN_TYPE_INFER}, the given values will be treated as 
 * numbers if they are so convertible, otherwise they will be compared as given; if {@link HTMLTableWrapperUtils.COLUMN_TYPE_TEXT}, they will be converted
 * to strings prior to comparison. For the 'contains' comparison, the values are always converted to strings; `columnType` has no effect on the 'contains' comparison.
 *
 * If the {@link HTMLTableWrapperUtils.FILTER_FLAG_IGNORE_CASE} flag is set, it only affects the result of the 'simple' relational comparisons if the given `columnType`
 * is {@link HTMLTableWrapperUtils.COLUMN_TYPE_TEXT}, or the inferred value of a column is a string. The flag will always, however, affect the 'contains' comparison. 
 * In either case, though, the applicable values are converted to a consistent case prior to comparison.
 * 
 * If the {@link HTMLTableWrapperUtils.FILTER_FLAG_NOT} flag is set, it forms the logical negation of the 'simple' relational comparisons. E.g. (in logical terms)
 * 'equals' becomes 'not equal to', 'less than' becomes 'greater than or equal to', etc. For the 'contains' comparison, it simply causes the logical
 * inverse of the result to be returned. Of note, the {@link HTMLTableWrapperUtils.FILTER_FLAG_NOT} flag *only* affects the operators, and has no effect on 
 * the {@link HTMLTableWrapperUtils.FILTER_FLAG_IGNORE_CASE} flag; if {@link HTMLTableWrapperUtils.FILTER_FLAG_IGNORE_CASE} is set, case will always be ignored for 
 * string-type comparisons, regardless of whether {@link HTMLTableWrapperUtils.FILTER_FLAG_NOT} is set. 
 *
 * @param {(string|number)} cellValue Value of the current cell being tested.
 * @param {number} operation Bitfield representing the combination of one or more `FILTER_OP_`* fields, and zero or more `FILTER_FLAG_`* fields.
 * @param {(string|number)} compareValue Value against which to test the given `cellValue`.
 * @param {number} columnType One of the `COLUMN_TYPE_`* constants representing how the given `cellValue` and `compareValue` are to be treated.
 * @returns {boolean} `true` if any of the requested comparisons succeed, otherwise `false`.
 */
HTMLTableWrapperUtils.shouldInclude = function (cellValue, operation, compareValue, columnType) {
    'use strict';
    
    var convertedCellValue, convertedCompareValue, negated, simpleFlags, textCellValue, textCompareValue, ignoreCase;
    
    ignoreCase = operation & HTMLTableWrapperUtils.FILTER_FLAG_IGNORE_CASE;
    
    // Convert values.
    switch (columnType) {
        case HTMLTableWrapperUtils.COLUMN_TYPE_TEXT:
            convertedCellValue = String(cellValue);
            convertedCompareValue = String(compareValue);
            if (ignoreCase) {
                convertedCellValue = convertedCellValue.toUpperCase();
                convertedCompareValue = convertedCompareValue.toUpperCase();
            }
            break;
        case HTMLTableWrapperUtils.COLUMN_TYPE_INFER:
        default:
            convertedCellValue = HTMLTableWrapperUtils.getNumber(cellValue, false);
            convertedCompareValue = HTMLTableWrapperUtils.getNumber(compareValue, false);
            if (ignoreCase) {
                if (typeof convertedCellValue === 'string') {
                    convertedCellValue = convertedCellValue.toUpperCase();
                }
                if (typeof convertedCompareValue === 'string') {
                    convertedCompareValue = convertedCompareValue.toUpperCase();
                }
            }
            break;
    }
    
    // Perform comparisons.
    negated = operation & HTMLTableWrapperUtils.FILTER_FLAG_NOT;
    
    
    // 'Simple' relational comparisons. 
    simpleFlags = operation & (HTMLTableWrapperUtils.FILTER_OP_EQUALS | HTMLTableWrapperUtils.FILTER_OP_LESS_THAN | HTMLTableWrapperUtils.FILTER_OP_GREATER_THAN);
    if (simpleFlags) {
        // Handle negation
        if (negated) {
            simpleFlags = ~simpleFlags;
        }
        
        // Do Compare.
        if (simpleFlags & HTMLTableWrapperUtils.FILTER_OP_EQUALS) {
            if (convertedCellValue == convertedCompareValue) {
                return true;
            }
        }
        
        if (simpleFlags & HTMLTableWrapperUtils.FILTER_OP_LESS_THAN) {
            if (convertedCellValue < convertedCompareValue) {
                return true;
            }
        }
        
        if (simpleFlags & HTMLTableWrapperUtils.FILTER_OP_GREATER_THAN) {
            if (convertedCellValue > convertedCompareValue) {
                return true;
            }
        }
    }
    
    
    // Contains comparison.
    if (operation & HTMLTableWrapperUtils.FILTER_OP_CONTAINS) {
        textCellValue = String(cellValue);
        textCompareValue = String(compareValue);
        
        if (ignoreCase) {
            textCellValue = textCellValue.toUpperCase();
            textCompareValue = textCompareValue.toUpperCase();
        }
        
        if (textCellValue.indexOf(textCompareValue) !== -1) {
            return !negated;
        }
    }
    
    
    // Default case.
    return false;
};


