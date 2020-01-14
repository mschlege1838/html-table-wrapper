

// Virtual Interfaces

// SortDescriptor
/**
 *
 * @interface SortDescriptor
 * @classdesc
 *		Describes the information necessary to sort a table based upon a column.
 */
/**
 * Index of the column this SortDescriptor describes how to sort.
 *
 * @member {number} SortDescriptor#columnIndex
 */
/**
 * Optional; if true, the value returned from this sort descriptor will be reversed (multiplied by -1)
 * in processing {@link SimpleDataTable#sort} calls.
 *
 * @member {boolean} SortDescriptor#descending
 */
/**
 * Callback comparator function that compares one cell to another.
 *
 * @function SortDescriptor#compare
 * @param {HTMLCellElement} cellA Reference cell.
 * @param {HTMLCellElement} cellB Compare cell.
 * @returns {number} 
 * @returns {number} 
 *		A value greater than 0 if cellA should be sorted below cellB, less than 0 for above, 0 for 
 *		no preference.
 */


// FilterDescriptor
/**
 * @interface FilterDescriptor
 * @classdesc
 *		Describes the information necessary to filter a table based upon a column.
 */
/**
 * Index of the column this FilterDescriptor describes how to filter.
 * 
 * @member {number} FilterDescriptor#columnIndex
 */
/**
 * Callback function to determine whether the given cell's row is to be filtered. If this function returns false,
 * the containing row will be filtered.
 *
 * @function FilterDescriptor#include
 * @param {HTMLCellElement} cell to be considered for inclusion.
 * @returns {boolean} false if this cell's row is to be filtered.
 * @returns {boolean} false if this cell's row is to be filtered.
 */

// CellInterpreter
/**
 * @interface CellInterpreter
 * @classdesc
 *		Object-based implementation of {@link SimpleDataTable~populateCellValues}.
 */
/**
 * Implementation of {@link SimpleDataTable~populateCellValues}. See documentation for the callback for further details.
 *
 * @function CellInterpreter#populateCellValues
 * @param {HTMLCellElement} cell
 * @param {Array} values
 */

// Callbacks

// populateCellValues
/**
 * Optional callback for {@link SimpleDataTable#getColumnValues} to customize how cell values are interpreted. Based upon
 * the given cell, should determine the individual cell value/values, and add them to the given Array. Note, duplicate values
 * are permitted; if distinct values are desired, this function should test for their presence in the Array prior to adding.
 *
 * @callback SimpleDataTable~populateCellValues
 * @param {HTMLTableCellElement} cell Cell element whose values are to be retrieved.
 * @param {Array} values Values to populate.
 */

 


// Constructor
/**
 * 
 * @constructor 
 * @param {HTMLTableElement} table Table element this SimpleDataTable is to process.
 * @classdesc
 *		Wrapper for HTMLTableElements that provides extended functionality, most notably {@link SimpleDataTable#sort sorting}
 *		and {@link SimpleDataTable#filter filtering}.
 */
function SimpleDataTable(table) {
	'use strict';
	
	if (!table || !table.tBodies || !table.tBodies[0]) {
		throw new ReferenceError('Table must be an defined and have a body.');
	}
	
	/**
	 * Backing HTMLTableElement.
	 *
	 * @private
	 * @type {HTMLTableElement}
	 */
	this.table = table;
	
	/**
	 * Cache of the initial state of the table. Used when sort parameters are {@link SimpleDataTable#clearSort cleared}.
	 *
	 * @private
	 * @type {Array}
	 */
	this.initialOrder = SimpleDataTable.copy(table.tBodies[0].rows);

}



// Static Fields

/**
 * Class name to add to the class list of filtered elements. Default value is 'data-table-filtered';
 * configure a new value in page initialization scripts if another class name is desired for this purpose.
 *
 * @type {string}
 */
SimpleDataTable.filteredClassName = 'data-table-filtered';

/**
 * Bit flag indicating only cells containing a specified value should remain after a filtering operation.
 *
 * @type {number}
 * @const
 */
SimpleDataTable.FILTER_OP_CONTAINS = 1;
/**
 * Bit flag indicating only cells with a value equal to a specified value should remain after a filtering operation.
 *
 * @type {number}
 * @const
 */
SimpleDataTable.FILTER_OP_EQUALS = 1 << 1;
/**
 * Bit flag indicating only cells with a value less than a specified value should remain after a filtering operation.
 *
 * @type {number}
 * @const
 */
SimpleDataTable.FILTER_OP_LESS_THAN = 1 << 2;
/**
 * Bit flag indicating only cells with a value greater than a specified value should remain after a filtering operation.
 *
 * @type {number}
 * @const
 */
SimpleDataTable.FILTER_OP_GREATER_THAN = 1 << 3;
/**
 * Bit flag indicating string-type comparisons during a filtering operation should ignore case.
 *
 * @type {number}
 * @const
 */
SimpleDataTable.FILTER_OP_IGNORE_CASE = 1 << 4;
/**
 * Bit flag indicating only cells with a value not equal to a specified value should remain after a filtering operation.
 *
 * @type {number}
 * @const
 */
SimpleDataTable.FILTER_OP_NOT_EQUALS = 1 << 5;


/**
 * Indicates the values cells within a column should be considered to be text only, and can be directly processed.
 *
 * @type {number}
 * @const
 */
SimpleDataTable.COLUMN_TYPE_TEXT = 1;

/**
 * Indicates the values of cells within a column should attempt be inferred, and converted to an appropriate underlying type
 * prior to processing.
 *
 * @type {number}
 * @const
 */
SimpleDataTable.COLUMN_TYPE_INFER = 2;



// Static methods
/**
 * Utility function to determine whether the given flags (number) has the given flag set.
 * 
 * @package
 * @param {number} flags Set of flags to test.
 * @param {number} flag Flag for which the given set of flags is to be tested.
 * @returns {boolean} true if the given set of flags has the given flag set, otherwise false.
 */
SimpleDataTable.hasFlag = function (flags, flag) {
	'use strict';
	
	return (flags & flag) !== 0;
};

/**
 * Utility function to copy the elements from the given src into a new Array. The given src need not
 * necessarily be an Array, but only needs to be a collection-like object indexable by numbers and defining 
 * a length property that reflects the number of values in the collection. E.g. a NodeList is an acceptable
 * value for src.
 *
 * @private
 * @param {object} src A collection-like object to be copied.
 * @return {Array} An Array containing the same elements of the given src.
 */
SimpleDataTable.copy = function (src) {
	
	var result, i;
	
	result = [];
	for (i = 0; i < src.length; ++i) {
		result.push(src[i]);
	}
	
	return result;
};


/**
 * Utility function for obtaining a number from the given val. If the given val is, itself, a number, it
 * is simply returned. If not, it is treated as a string, and parsed as an integer if it contains only digits,
 * or as a float if it contains a decimal point and/or E-notation exponents. If val is not numeric and not parsable
 * as a number, it is returned as-is if strict is false, or NaN is returned if strict is true.
 *
 * @private
 * @param {(string|number)} val Value to be converted to a number.
 * @param {boolean} [strict=false] Whether to return NaN if val is not a number, or simply to return val itself.
 */
SimpleDataTable.getNumber = function (val, strict) {
	'use strict';
	
	if (typeof val === 'number') {
		return val;
	}
	
	if (SimpleDataTable.isInt(val)) {
		return IEGeneralCompatibility.parseInt(val);
	} else if (SimpleDataTable.isNumeric(val)) {
		return IEGeneralCompatibility.parseFloat(val);
	} else {
		return strict ? Number.NaN : val;
	}
	
};


/**
 * Utility function for obtaining a column that considers the colSpan attribute of a row's cells. Cells with a 
 * colSpan greater than 1 are considered to span multiple column indicies.
 *
 * @private
 * @param {HTMLTableRowElement} row Row from which to extract a column.
 * @param {number} columnIndex Column index defining the cell to be extracted.
 * @returns {HTMLCellElement} Cell corresponding to the given columnIndex.
 * @throws {RangeError} If columnIndex is greater than the number of columns spanned by the given row.
 */
SimpleDataTable.getColumn = function (row, columnIndex) {
	'use strict';
	
	var i, j, cells, cell, currentIndex;
	
	cells = row.cells;
	currentIndex = 0;
	
	for (i = 0; i < cells.length; ++i) {
		cell = cells[i];
		for (j = 0; j < cell.colSpan; ++j) {
			if (currentIndex++ == columnIndex) {
				return cell;
			}
		}
	}
	
	throw new RangeError('Attempt to retrieve column index ' + columnIndex + ' from a row with only ' + currentIndex + ' identified columns.');
};

/**
 * Utility method to determine the count of child elements of the given node. Returns the count of the
 * childNodes of node with a nodeType of 1 (ELEMENT_NODE).
 *
 * @private
 * @param {Node} node Element whose child element count is to be determined.
 * @returns {number} Count of child elements of the given node.
 */
SimpleDataTable.getElementCount = function (node) {
	'use strict';
	
	var count, i, childNodes;
	
	childNodes = node.childNodes;
	count = 0;
	
	for (i = 0; i < childNodes.length; ++i) {
		if (childNodes[i].nodeType === 1) {
			++count;
		}
	}
	
	return count;
};




/**
 * Determines whether the given val is an integer. Returns true if val contains only digits, otherwise false.
 *
 * @private
 * @param {string} val Value to parse.
 * @returns {boolean} true if val represents an integer, otherwise false.
 */
SimpleDataTable.isInt = function (val) {
	'use strict';
	
	return /^\d+$/.test(val);
};

/**
 * Determines whether the given val is numeric. Returns true if val contains only digits, optionally a decimal point,
 * and optionally a scientific E-notation expontent, otherwise false.
 *
 * @private
 * @param {string} val Value to parse.
 * @returns {boolean} true if val represents a number, otherwise false.
 */
SimpleDataTable.isNumeric = function (val) {
	'use strict';
	
	return /^\d+(?:\.\d*)?(?:[eE]\d*)?$/.test(val);
};



// Instance methods
/**
 * Sorts the backing table according to the given {@link SortDescriptor}s. This function can be called with a single
 * Array of {@link SortDescriptor}s or in a variatric manner.
 *
 * @param {...SortDescriptor} args 
 *		{@link SortDescriptor}s to process. If the first argument is an Array, it will be used and subsequent arguments
 *		will be ignored.
 */
SimpleDataTable.prototype.sort = function () {
	'use strict';
	
	var sortDescriptors, sortDescriptor, i, tbody, rows, copy, _this;
	
	// Pre-checks.
	if (!arguments.length) {
		return;
	}
	
	// Pre-Validation Initialization.
	sortDescriptors = arguments[0] instanceof Array ? arguments[0] : arguments;
	
	console.info(sortDescriptors);
	
	// Validation.
	for (i = 0; i < sortDescriptors.length; ++i) {
		sortDescriptor = sortDescriptors[i];
		
		if (!sortDescriptor) {
			throw new ReferenceError('Invalid reference supplied for sort descriptor at index ' + i + ': ' + sortDescriptor);
		}
		
		if (typeof sortDescriptor.columnIndex !== 'number') {
			throw new TypeError('Sort descriptor does not define the columnIndex property (of type number) at index ' + i);
		}
		if (sortDescriptor.columnIndex < 0) {
			throw new RangeError('Sort descriptor defines a column index less than 0 at index ' + i + ': ' + sortDescriptor.columnIndex);
		}
		
		if (typeof sortDescriptor.compare !== 'function') {
			throw new TypeError('Sort descriptor does not define define the compare property (of type function) at index ' + i);
		}
		
	}
	
	// Post-Validation Initialization.
	tbody = this.table.tBodies[0];
	rows = tbody.rows;
	copy = SimpleDataTable.copy(rows);
	
	// Perform sort.
	_this = this;
	copy.sort(function (rowA, rowB) {
		var sortDescriptor, columnIndex, cellA, cellB, compareValue, i;
		
		for (i = 0; i < sortDescriptors.length; ++i) {
			sortDescriptor = sortDescriptors[i];
			
			columnIndex = sortDescriptor.columnIndex;
			
			cellA = SimpleDataTable.getColumn(rowA, columnIndex);
			cellB = SimpleDataTable.getColumn(rowB, columnIndex);
			
			compareValue = sortDescriptor.compare(cellA, cellB);
			
			// Allowing type coercion if (for whatever reason) the compare function does not return an integer.
			if (compareValue != 0) {
				return sortDescriptor.descending ? -1 * compareValue : compareValue;
			}
			
		}
		return 0;
	});
	
	
	// Update table.
	while (rows.length) {
		tbody.removeChild(rows[0]);
	}
	
	for (i = 0; i < copy.length; ++i) {
		tbody.appendChild(copy[i]);
	}
};

/**
 * Filters the backing table according to the given {@link FilterDescriptor}s. This function can be called with a single
 * Array of {@link FilterDescriptor}s or in a variatric manner.
 *
 * @param {...FilterDescriptor} args 
 *		{@link FilterDescriptor}s to process. If the first argument is an Array, it will be used and subsequent arguments
 *		will be ignored.
 */
SimpleDataTable.prototype.filter = function () {
	'use strict';
	
	var filterDescriptors, filterDescriptor, i, rows, row, filter, j;
	
	// Initialization.
	filterDescriptors = arguments[0] instanceof Array ? arguments[0] : arguments;
	
	if (!filterDescriptors.length) {
		return;
	}
	
	// Validation.
	for (i = 0; i < filterDescriptors.length; ++i) {
		filterDescriptor = filterDescriptors[i];
		
		if (!filterDescriptor) {
			throw new ReferenceError('Invalid reference supplied for filter descriptor at index ' + i);
		}
		
		if (typeof filterDescriptor.columnIndex !== 'number') {
			throw new TypeError('Filter descriptor does not define the columnIndex property (of type number) at index ' + i);
		}
		if (filterDescriptor.columnIndex < 0) {
			throw new RangeError('Filter descriptor defines a column index less than 0 at index ' + i + ': ' + filterDescriptor.columnIndex);
		}
		
		if (typeof filterDescriptor.include !== 'function') {
			throw new TypeError('Filter descriptor does not define the include property (of type function) at index ' + i);
		}

	}
	
	// Perform filtering.
	rows = this.table.tBodies[0].rows;
	for (i = 0; i < rows.length; ++i) {
		row = rows[i];
		filter = false;
		
		for (j = 0; j < filterDescriptors.length; ++j) {
			filterDescriptor = filterDescriptors[j];
			
			if (!filterDescriptor.include(SimpleDataTable.getColumn(row, filterDescriptor.columnIndex))) {
				filter = true;
				break;
			}
		}
		
		if (filter) {
			IE9Compatibility.addClass(row, SimpleDataTable.filteredClassName);
		} else {
			IE9Compatibility.removeClass(row, SimpleDataTable.filteredClassName);
		}
	}
};


/**
 * Clears all filters.
 */
SimpleDataTable.prototype.clearFilter = function () {
	'use strict';
	
	var i, rows;
	
	rows = this.table.tBodies[0].rows;
	
	for (i = 0; i < rows.length; ++i) {
		IE9Compatibility.removeClass(rows[i], SimpleDataTable.filteredClassName);
	}
	
};

/**
 * Clears the sorting for all columns. The original order (at the time this SimpleDataTable was constructed) for all
 * rows is restored.
 */
SimpleDataTable.prototype.clearSort = function () {
	'use strict';
	
	var initialOrder, tbody, rows, i;
	
	tbody = this.table.tBodies[0];
	rows = tbody.rows;
	initialOrder = this.initialOrder;
	
	while (rows.length) {
		tbody.removeChild(rows[0]);
	}
	
	for (i = 0; i < initialOrder.length; ++i) {
		tbody.appendChild(initialOrder[i]);
	}
	
};

/**
 * Populate the given items with the values within the given cell for the given columnIndex. By default simply adds the trimmed cell's textContent
 * if not already present in items. Override/reassign this function to customize how cell values are obtained.
 *
 * @protected
 * @param {number} columnIndex Index of the column whose values are being obtained.
 * @param {HTMLTableCellElement} cell Cell whose values are to be obtained.
 * @param {Array} items Array to which this cell's values are to be added.
 */
SimpleDataTable.prototype.populateCellValues = function (columnIndex, cell, items) {
	'use strict';
	
	var value;

	value = cell.textContent.trim();
	if (items.indexOf(value) === -1) {
		items.push(value);
	}

};

/**
 * Returns an Array containing all values for each cell of the given columnIndex. An optional callback can be provided to customize how cell values
 * are intrepreted. If defined, it will be called to obtain the values for each cell, otherwise the default is to simply add the trimmed textContent
 * of each cell, provided that value has not already been added (i.e. the distinct set of cell textContent for the column). The result will be
 * sorted prior to being returned unless noSort is a true value.
 *
 * @param {number} columnIndex Column index whose values are to be retrieved.
 * @param {(SimpleDataTable~populateCellValues|CellInterpreter)} [callback] 
 *		Optional {@link CellInterpreter} or callback function to customize how cell values are intrepreted.
 * @param {boolean} [noSort] Set to a true value to prevent the result from being sorted.
 * @returns {Array} An array containing all values fore each cell of the given columnIndex.
 * @throws {RangeError} If columnIndex is greater than the number of columns spanned by any row in the table.
 * @throws {TypeError} If callback is defined, but does not implement {@link CellInterpreter} or is not a function itself.
 */
SimpleDataTable.prototype.getColumnValues = function (columnIndex, callback, noSort) {
	'use strict';
	
	var rows, i, cell, value, listItems, j, result;
	
	if (callback && (typeof callback !== 'function' || typeof callback.populateCellValues !== 'function')) {
		throw new TypeError('Callback must either define a populateCellValues function, or be a function itself.');
	}
	
	result = [];
	rows = this.table.tBodies[0].rows;
	
	for (i = 0; i < rows.length; ++i) {
		cell = SimpleDataTable.getColumn(rows[i], columnIndex);
		if (callback) {
			if (callback.populateCellValues) {
				callback.populateCellValues(cell, result);
			} else {
				callback(cell, result);
			}
		} else {
			value = cell.textContent.trim();
			if (result.indexOf(value) === -1) {
				result.push(value);
			}
		}
	}
	
	if (!noSort) {
		result.sort();
	}
	
	return result;
};





// Nested Types

// ValueSort
/**
 * @constructor
 * @implements SortDescriptor
 * @param {number} columnIndex Column index to which this descriptor is to apply.
 * @param {boolean} [descending=false] true if the result of this descriptor is to be inverted.
 * @param {number} [columnType={@link SimpleDataTable.COLUMN_TYPE_INFER}] 
 *		How this column is to be sorted. Default is infer, set to {@link SimpleDataTable.COLUMN_TYPE_TEXT} to sort as text only.
 * @classdesc
 *		Simple/direct implementation of {@link SortDescriptor}. 
 */
SimpleDataTable.ValueSort = function (columnIndex, descending, columnType) {
	'use strict';
	
	this.columnIndex = columnIndex;
	
	if (descending) {
		this.descending = true;
	}
	if (columnType && columnType !== SimpleDataTable.COLUMN_TYPE_INFER) {
		this.columnType = columnType;
	}
};

// Default Instance Properties
SimpleDataTable.ValueSort.prototype.descending = false;

/**
 * How this column is to be sorted. If {@link SimpleDataTable.COLUMN_TYPE_INFER}, will attempt to convert values to
 * numbers prior to running the sort comparison; values that cannot be converted will be compared as strings,
 * and will be sorted under those successfully converted to numbers. If {@link SimpleDataTable.COLUMN_TYPE_TEXT}, all
 * values will be compared as strings only.
 *
 * @type {number}
 */
SimpleDataTable.ValueSort.prototype.columnType = SimpleDataTable.COLUMN_TYPE_INFER;


// Instance Methods
SimpleDataTable.ValueSort.prototype.compare = function (cellA, cellB) {
	'use strict';
	
	var aVal, bVal, aNum, aNaN, bNum, bNaN;
	
	aVal = cellA.textContent;
	bVal = cellB.textContent;
	
	switch (this.columnType) {
		case SimpleDataTable.COLUMN_TYPE_INFER:
			aNum = SimpleDataTable.getNumber(aVal, true);
			aNaN = IEGeneralCompatibility.isNaN(aNum);
			bNum = SimpleDataTable.getNumber(bVal, true);
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
		case SimpleDataTable.COLUMN_TYPE_TEXT:
			return aVal < bVal ? -1 : (aVal > bVal ? 1 : 0);
	}

};





// ValueFilter
/**
 * @constructor
 * @implements FilterDescriptor
 * @param {number} columnIndex Column index this FilterDescriptor describes.
 * @param {*} compareValue Value to which cells are to be compared.
 * @param {(number|string)} [operation={@link SimpleDataTable.FILTER_OP_EQUALS}] 
 *		Bit field or string indicating the operation this filter is to perform. Must be a combination of the {@link SimpleDataTable}.FILTER_OP_* fields
 *		if a number, or '=', '!=' '&lt', '&gt;' '&lt;=', '&gt;=', or '~' (contains, ignore case) if a string.
 * @param {number} [columnType={@link SimpleDataTable.COLUMN_TYPE_INFER}] How the values of cells in this column are to be determined.
 * @classdesc
 *		<p>Generic implementation of {@link FilterDescriptor}. Filters cells for the given columnIndex based upon the given compareValue using the given 
 *		operation. The values for individual cells are determined based upon columnType.<p>
 *
 *		<p>
 *		<span>Operation can be defined as either a bit field, or, for convenience, a string. If a bit field, it must be a combination 
 *		of the following:<span>
 *		<ul>
 *		<li>{@link SimpleDataTable.FILTER_OP_CONTAINS}</li>
 *		<li>{@link SimpleDataTable.FILTER_OP_EQUALS}</li>
 *		<li>{@link SimpleDataTable.FILTER_OP_LESS_THAN}</li>
 *		<li>{@link SimpleDataTable.FILTER_OP_GREATER_THAN}</li>
 *		<li>{@link SimpleDataTable.FILTER_OP_IGNORE_CASE}</li>
 *		<li>{@link SimpleDataTable.FILTER_OP_NOT_EQUALS}</li>
 *		</ul>
 *		<span>If a string, it must be one of the following (equivalent bit field combinations shown in parenthesis):</span>
 *		<ul>
 *		<li>'=' (<code>{@link SimpleDataTable.FILTER_OP_EQUALS}</code>)</li>
 *		<li>'&gt;' (<code>{@link SimpleDataTable.FILTER_OP_GREATER_THAN}</code>)</li>
 *		<li>'&lt;' (<code>{@link SimpleDataTable.FILTER_OP_LESS_THAN}</code>)</li>
 *		<li>'&gt=' (<code>{@link SimpleDataTable.FILTER_OP_GREATER_THAN}|{@link SimpleDataTable.FILTER_OP_EQUALS}</code>)</li>
 *		<li>'&lt=' (<code>{@link SimpleDataTable.FILTER_OP_LESS_THAN}|{@link SimpleDataTable.FILTER_OP_EQUALS}</code>)</li>
 *		<li>'!=' (<code>{@link SimpleDataTable.FILTER_OP_NOT_EQUALS}</code>)</li>
 *		<li>'~' (<code>{@link SimpleDataTable.FILTER_OP_CONTAINS}|{@link SimpleDataTable.FILTER_OP_IGNORE_CASE}</code>)</li>
 *		</ul>
 *		</p>
 */
SimpleDataTable.ValueFilter = function (columnIndex, compareValue, operation, columnType) {
	'use strict';
	
	this.columnIndex = columnIndex;
	
	/**
	 * Value against which individual cell values are to be compared.
	 *
	 * @type {*}
	 */
	this.compareValue = compareValue;
	
	if (operation && operation !== SimpleDataTable.FILTER_OP_EQUALS) {
		this.operation = operation;
	}
	if (columnType && columnType !== SimpleDataTable.COLUMN_TYPE_INFER) {
		this.columnType = columnType;
	}


};


// Default Instance Properties
/**
 * Operation this ValueFilter is to use when determining whether to filter a cell. Valid values are described
 * in this class' description.
 *
 * @type {number}
 */
SimpleDataTable.ValueFilter.prototype.operation = SimpleDataTable.FILTER_OP_EQUALS;


/**
 * How individual cell values are to be converted. If {@link SimpleDataTable.COLUMN_TYPE_TEXT}, cell values will
 * be treated only as text; if {@link SimpleDataTable.COLUMN_TYPE_INFER} (default), an attempt will be made to 
 * convert cell values to numbers prior to evaluating filter conditions.
 *
 * @type {number}
 */
SimpleDataTable.ValueFilter.prototype.columnType = SimpleDataTable.COLUMN_TYPE_INFER;


// Instance Methods
SimpleDataTable.ValueFilter.prototype.include = function (cell, table) {
	'use strict';
	
	return this.includeValue(cell.textContent.trim());
	
	return false;
};

/**
 * Internal function that tests an individual value of a cell for whether or not it should be filtered.
 * 
 * @protected
 * @param {string} rawValue Individual value to test.
 * @returns {boolean} false if the containing cell should be filtered, otherwise true.
 */
SimpleDataTable.ValueFilter.prototype.includeValue = function (rawValue) {
	'use strict';
	
	var operation, rawCompareValue, compareValue, cellValue, filterType;
	
	// Initialization.
	operation = this.operation;
	
	// Attempt to discern operation from supported convenience tokens if operation is a string.
	if (typeof operation === 'string') {
		switch (operation) {
			case '=':
				operation = SimpleDataTable.FILTER_OP_EQUALS;
				break;
			case '<':
				operation = SimpleDataTable.FILTER_OP_LESS_THAN;
				break;
			case '>':
				operation = SimpleDataTable.FILTER_OP_GREATER_THAN;
				break;
			case '<=':
				operation = SimpleDataTable.FILTER_OP_LESS_THAN | SimpleDataTable.FILTER_OP_EQUALS;
				break;
			case '>=':
				operation = SimpleDataTable.FILTER_OP_GREATER_THAN | SimpleDataTable.FILTER_OP_EQUALS;
				break;
			case '~':
				operation = SimpleDataTable.FILTER_OP_CONTAINS | SimpleDataTable.FILTER_OP_IGNORE_CASE;
				break;
			case '!=':
				operation = SimpleDataTable.FILTER_OP_NOT_EQUALS;
				break;
		}
	}
	
	rawCompareValue = this.compareValue;
	switch (this.columnType) {
		case SimpleDataTable.COLUMN_TYPE_INFER:
			compareValue = SimpleDataTable.getNumber(rawCompareValue);
			cellValue = SimpleDataTable.getNumber(rawValue);
			break;
		case SimpleDataTable.COLUMN_TYPE_TEXT:
			compareValue = String(rawCompareValue);
			cellValue = String(rawValue);
			break;
	}
	

	// Common comparisons.
	if (SimpleDataTable.hasFlag(operation, SimpleDataTable.FILTER_OP_EQUALS)) {
		if (cellValue == compareValue) {
			return true;
		}
	}
	
	if (SimpleDataTable.hasFlag(operation, SimpleDataTable.FILTER_OP_LESS_THAN)) {
		if (cellValue < compareValue) {
			return true;
		}
	}
	
	if (SimpleDataTable.hasFlag(operation, SimpleDataTable.FILTER_OP_GREATER_THAN)) {
		if (cellValue > compareValue) {
			return true;
		}
	}
	
	if (SimpleDataTable.hasFlag(operation, SimpleDataTable.FILTER_OP_NOT_EQUALS)) {
		if (cellValue != compareValue) {
			return true;
		}
	}
	
	
	
	// String comparisons.
	
	// Reset compare values to strings.
	cellValue = String(rawValue);
	compareValue = String(rawCompareValue);
	if (SimpleDataTable.hasFlag(operation, SimpleDataTable.FILTER_OP_IGNORE_CASE)) {
		cellValue = cellValue.toUpperCase();
		compareValue = compareValue.toUpperCase();
	}
	
	
	// Comparisons.
	if (SimpleDataTable.hasFlag(operation, SimpleDataTable.FILTER_OP_CONTAINS)) {
		if (cellValue.indexOf(compareValue) != -1) {
			return true;
		}
	}
	
	
	// Default case (fall back to equals).
	return cellValue == compareValue;
};
